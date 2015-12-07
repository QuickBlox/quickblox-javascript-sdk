/*
 * QuickBlox JavaScript SDK
 *
 * WebRTC Module
 *
 */

/*
 * User's callbacks (listener-functions):
 * - onCallListener
 * - onAcceptCallListener
 * - onRejectCallListener
 * - onStopCallListener
 * - onUpdateCallListener
 * - onRemoteStreamListener
 * - onSessionStateChangedListener
 * - onUserNotAnswerListener
 */

require('../../lib/strophe/strophe.min');
var download = require('../../lib/download/download.min');

var config = require('../qbConfig'),
    Utils = require('../qbUtils');

// cross-browser polyfill
var RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
var RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;
var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
var URL = window.URL || window.webkitURL;

var signalingType = {
  CALL: 'call',
  ACCEPT: 'accept',
  REJECT: 'reject',
  STOP: 'hangUp',
  CANDIDATE: 'iceCandidates',
  PARAMETERS_CHANGED: 'update'
};

var WEBRTC_MODULE_ID = 'WebRTCVideoChat';

var connection, peer,
    callers = {};

// we use this timeout to fix next issue:
// "From Android/iOS make a call to Web and kill the Android/iOS app instantly. Web accept/reject popup will be still visible.
// We need a way to hide it if sach situation happened."
//
var answerTimers = {};

// We use this timer interval to dial a user - produce the call reqeusts each N seconds.
//
var dialingTimerIntervals = {};

// We use this timer on a caller's side to notify him if the opponent doesn't respond.
//
var callTimers = {};


/* WebRTC module: Core
--------------------------------------------------------------------------------- */
function WebRTCProxy(service, conn) {
  var self = this;
  connection = conn;

  this.service = service;
  this.helpers = new Helpers();

  this._onMessage = function(stanza) {
    var from = stanza.getAttribute('from'),
        extraParams = stanza.querySelector('extraParams'),
        delay = stanza.querySelector('delay'),
        userId = self.helpers.getIdFromNode(from),
        extension = self._getExtension(extraParams);

    var sessionId = extension.sessionID;

    if (delay || extension.moduleIdentifier !== WEBRTC_MODULE_ID) return true;

    // clean for users
    delete extension.moduleIdentifier;

    switch (extension.signalType) {
    case signalingType.CALL:
      trace('onCall from ' + userId);

      if (callers[userId]) {
      	trace('skip onCallListener, a user already got it');
      	return true;
      }

      // run caller availability timer and run again for this user
      clearAnswerTimer(userId);
      if(peer == null){
        startAnswerTimer(userId, self._answerTimeoutCallback);
      }
      //

      callers[userId] = {
        sessionID: extension.sessionID,
        sdp: extension.sdp
      };

      extension.callType = extension.callType === '1' ? 'video' : 'audio';
      delete extension.sdp;

      if (typeof self.onCallListener === 'function'){
        self.onCallListener(userId, extension);
      }

      break;
    case signalingType.ACCEPT:
      trace('onAccept from ' + userId);

      clearDialingTimerInterval(userId);
      clearCallTimer(userId);

      if (typeof peer === 'object')
        peer.onRemoteSessionCallback(extension.sdp, 'answer');
      delete extension.sdp;
      if (typeof self.onAcceptCallListener === 'function')
        self.onAcceptCallListener(userId, extension);
      break;
    case signalingType.REJECT:
      trace('onReject from ' + userId);

      clearDialingTimerInterval(userId);
      clearCallTimer(userId);

      self._close();
      if (typeof self.onRejectCallListener === 'function')
        self.onRejectCallListener(userId, extension);
      break;
    case signalingType.STOP:
      trace('onStop from ' + userId);

      clearDialingTimerInterval(userId);
      clearCallTimer(userId);

      clearCallers(userId);

      self._close();
      if (typeof self.onStopCallListener === 'function')
        self.onStopCallListener(userId, extension);
      break;
    case signalingType.CANDIDATE:
      if (typeof peer === 'object') {
        peer.addCandidates(extension.iceCandidates);
        if (peer.type === 'answer')
          self._sendCandidate(peer.opponentId, peer.iceCandidates);
      }
      break;
    case signalingType.PARAMETERS_CHANGED:
      trace('onUpdateCall from ' + userId);
      if (typeof self.onUpdateCallListener === 'function')
        self.onUpdateCallListener(userId, extension);
      break;
    }

    // we must return true to keep the handler alive
    // returning false would remove it after it finishes
    return true;
  };

  this._getExtension = function(extraParams) {
    var extension = {}, iceCandidates = [], opponents = [],
        candidate, oponnent, items, childrenNodes;

    if (extraParams) {
      for (var i = 0, len = extraParams.childNodes.length; i < len; i++) {
        if (extraParams.childNodes[i].tagName === 'iceCandidates') {

          // iceCandidates
          items = extraParams.childNodes[i].childNodes;
          for (var j = 0, len2 = items.length; j < len2; j++) {
            candidate = {};
            childrenNodes = items[j].childNodes;
            for (var k = 0, len3 = childrenNodes.length; k < len3; k++) {
              candidate[childrenNodes[k].tagName] = childrenNodes[k].textContent;
            }
            iceCandidates.push(candidate);
          }

        } else if (extraParams.childNodes[i].tagName === 'opponentsIDs') {

          // opponentsIDs
          items = extraParams.childNodes[i].childNodes;
          for (var j = 0, len2 = items.length; j < len2; j++) {
            oponnent = items[j].textContent;
            opponents.push(oponnent);
          }

        } else {
          if (extraParams.childNodes[i].childNodes.length > 1) {

            extension = self._XMLtoJS(extension, extraParams.childNodes[i].tagName, extraParams.childNodes[i]);

          } else {

            extension[extraParams.childNodes[i].tagName] = extraParams.childNodes[i].textContent;

          }
        }
      }
      if (iceCandidates.length > 0)
        extension.iceCandidates = iceCandidates;
      if (opponents.length > 0)
        extension.opponents = opponents;
    }

    return extension;
  };

  this._answerTimeoutCallback = function (userId){
  	clearCallers(userId);
    self._close();

    if(typeof self.onSessionStateChangedListener === 'function'){
      self.onSessionStateChangedListener(self.SessionState.CLOSED, userId);
    }
  };

  this._callTimeoutCallback = function (userId){
    trace("User " + userId + " not asnwer");

    clearDialingTimerInterval(userId);

    clearCallers(userId);
    self._close();

    if(typeof self.onUserNotAnswerListener === 'function'){
      self.onUserNotAnswerListener(userId);
    }
  };
}

WebRTCProxy.prototype.SessionState = {
  UNDEFINED: 0,
  CONNECTING: 1,
  CONNECTED: 2,
  FAILED: 3,
  DISCONNECTED: 4,
  CLOSED: 5
};

/* WebRTC module: User Media Steam
--------------------------------------------------------------------------------- */
// get local stream from user media interface (web-camera, microphone)
WebRTCProxy.prototype.getUserMedia = function(params, callback) {
  if (!getUserMedia) throw new Error('getUserMedia() is not supported in your browser');
  getUserMedia = getUserMedia.bind(navigator);
  var self = this;

  // Additional parameters for Media Constraints
  // http://tools.ietf.org/html/draft-alvestrand-constraints-resolution-00
  /**********************************************
   * googEchoCancellation: true
   * googAutoGainControl: true
   * googNoiseSuppression: true
   * googHighpassFilter: true
   * minWidth: 640
   * minHeight: 480
   * maxWidth: 1280
   * maxHeight: 720
   * minFrameRate: 60
   * maxAspectRatio: 1.333
  **********************************************/
  getUserMedia(
    {
      audio: params.audio || false,
      video: params.video || false
    },

    function(stream) {
      self.localStream = stream;
      if (params.elemId)
        self.attachMediaStream(params.elemId, stream, params.options);
      callback(null, stream);
    },

    function(err) {
      callback(err, null);
    }
  );
};

// attach media stream to audio/video element
WebRTCProxy.prototype.attachMediaStream = function(id, stream, options) {
  var elem = document.getElementById(id);
  if (elem) {
    elem.src = URL.createObjectURL(stream);
    if (options && options.muted) elem.muted = true;
    if (options && options.mirror) {
      elem.style.webkitTransform = 'scaleX(-1)';
      elem.style.transform = 'scaleX(-1)';
    }
    elem.play();
  } else {
    throw new Error('Unable to attach media stream, element ' + id  + ' is undefined');
  }
};

WebRTCProxy.prototype.snapshot = function(id) {
  var video = document.getElementById(id),
      canvas = document.createElement('canvas'),
      context = canvas.getContext('2d'),
      dataURL, blob;

  if (video) {
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;
    if (video.style.transform === 'scaleX(-1)') {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }
    context.drawImage(video, 0, 0, video.clientWidth, video.clientHeight);
    dataURL = canvas.toDataURL();

    blob = dataURItoBlob(dataURL, 'image/png');
    blob.name = 'snapshot_' + getLocalTime() + '.png';
    blob.url = dataURL;

    return blob;
  }
};

// add CSS filters to video stream
// http://css-tricks.com/almanac/properties/f/filter/
WebRTCProxy.prototype.filter = function(id, filters) {
  var video = document.getElementById(id);
  if (video) {
    video.style.webkitFilter = filters;
    video.style.filter = filters;
  }
};

WebRTCProxy.prototype.mute = function(type) {
  this._switchOffDevice(0, type);
};

WebRTCProxy.prototype.unmute = function(type) {
  this._switchOffDevice(1, type);
};

WebRTCProxy.prototype._switchOffDevice = function(bool, type) {
  if (type === 'audio' && this.localStream.getAudioTracks().length > 0) {
    this.localStream.getAudioTracks().forEach(function (track) {
      track.enabled = !!bool;
    });
  }
  if (type === 'video' && this.localStream.getVideoTracks().length > 0) {
    this.localStream.getVideoTracks().forEach(function (track) {
      track.enabled = !!bool;
    });
  }
};

/* WebRTC module: Real-Time Communication (Signaling)
--------------------------------------------------------------------------------- */
WebRTCProxy.prototype._createPeer = function(params) {
  if (!RTCPeerConnection) throw new Error('RTCPeerConnection() is not supported in your browser');
  if (!this.localStream) throw new Error("You don't have an access to the local stream");

  // Additional parameters for RTCPeerConnection options
  // new RTCPeerConnection(pcConfig, options)
  /**********************************************
   * DtlsSrtpKeyAgreement: true
   * RtpDataChannels: true
  **********************************************/
  var pcConfig = {
    iceServers: config.iceServers
  };
  peer = new RTCPeerConnection(pcConfig);
  peer.init(this, params);

  trace("Peer._createPeer: " + peer + ", sessionID: " + peer.sessionID);
};

WebRTCProxy.prototype.call = function(opponentsIDs, callType, extension) {

  trace('Call. userId: ' + opponentsIDs + ", callType: " + callType + ', extension: ' + JSON.stringify(extension));

  this._createPeer();

  var self = this;

  // For now we support only 1-1 calls.
  //
  var userIdsToCall = opponentsIDs instanceof Array ? opponentsIDs : [opponentsIDs];
  var userIdToCall = userIdsToCall[0];

  peer.opponentId = userIdToCall;
  peer.getSessionDescription(function(err, res) {
    if (err) {
      trace("getSessionDescription error: " + err);
    } else {

      // let's send call requests to user
      //
      clearDialingTimerInterval(userIdToCall);
      var functionToRun = function() {
        self._sendMessage(userIdToCall, extension, 'CALL', callType, userIdsToCall);
      };
      functionToRun(); // run a function for the first time and then each N seconds.
      startDialingTimerInterval(userIdToCall, functionToRun);
      //
      clearCallTimer(userIdToCall);
      startCallTimer(userIdToCall, self._callTimeoutCallback);
      //
      //
    }
  });
};

WebRTCProxy.prototype.accept = function(userId, extension) {
  var extension = extension || {};

  trace('Accept. userId: ' + userId + ', extension: ' + JSON.stringify(extension));

  clearAnswerTimer(userId);

  var caller = callers[userId];
  if (caller) {
    this._createPeer({
      sessionID: caller.sessionID,
      description: caller.sdp
    });
    // delete callers[userId];
  }

  var self = this;
  peer.opponentId = userId;

  peer.getSessionDescription(function(err, res) {
    if (err) {
      trace(err);
    } else {
      self._sendMessage(userId, extension, 'ACCEPT');
    }
  });
};

WebRTCProxy.prototype.reject = function(userId, extension) {
  var extension = extension || {};

  trace('Reject. userId: ' + userId + ', extension: ' + JSON.stringify(extension));

  clearAnswerTimer(userId);

  if (callers[userId]) {
    extension.sessionID = callers[userId].sessionID;
    delete callers[userId];
  }

  this._sendMessage(userId, extension, 'REJECT');
};

WebRTCProxy.prototype.stop = function(userId, extension) {
  var extension = extension || {};

  trace('Stop. userId: ' + userId + ', extension: ' + JSON.stringify(extension));

  clearAnswerTimer(userId);
  clearDialingTimerInterval(userId);
  clearCallTimer(userId);

  this._sendMessage(userId, extension, 'STOP');
  this._close();

  clearCallers(userId);
};

WebRTCProxy.prototype.update = function(userId, extension) {
  var extension = extension || {};
  trace('Update. userId: ' + userId + ', extension: ' + JSON.stringify(extension));

  this._sendMessage(userId, extension, 'PARAMETERS_CHANGED');
};

WebRTCProxy.prototype.close = function() {
  Object.keys(answerTimers).forEach(function(key) {
    clearAnswerTimer(key);
  });

  Object.keys(dialingTimerIntervals).forEach(function(key) {
    clearDialingTimerInterval(key);
  });

  Object.keys(callTimers).forEach(function(key) {
    clearCallTimer(key);
  });

  this._close();

  Object.keys(callers).forEach(function(key) {
    clearCallers(key);
  });
};

// close peer connection and local stream
WebRTCProxy.prototype._close = function() {
  trace("Peer._close");

  if (peer) {
    peer.close();
  }
  if (this.localStream) {
    this.localStream.getAudioTracks().forEach(function (audioTrack) {
      audioTrack.stop();
    });
    this.localStream.getVideoTracks().forEach(function (videoTrack) {
      videoTrack.stop();
    });
    this.localStream = null;
  }
};

WebRTCProxy.prototype._sendCandidate = function(userId, iceCandidates) {
  var extension = {
    iceCandidates: iceCandidates
  };
  this._sendMessage(userId, extension, 'CANDIDATE');
};

WebRTCProxy.prototype._sendMessage = function(userId, extension, type, callType, opponentsIDs) {
  var extension = extension || {},
      self = this,
      msg, params;

  extension.moduleIdentifier = WEBRTC_MODULE_ID;
  extension.signalType = signalingType[type];
  extension.sessionID = peer && peer.sessionID || extension.sessionID;

  if (callType) {
    extension.callType = callType === 'video' ? '1' : '2';
  }

  if (type === 'CALL' || type === 'ACCEPT') {
    extension.sdp = peer.localDescription.sdp;
    extension.platform = 'web';
  }

  if (type === 'CALL') {
    extension.callerID = this.helpers.getIdFromNode(connection.jid);
    extension.opponentsIDs = opponentsIDs;
  }

  params = {
    from: connection.jid,
    to: this.helpers.getUserJid(userId, config.creds.appId),
    type: 'headline',
    id: Utils.getBsonObjectId()
  };

  msg = $msg(params).c('extraParams', {
    xmlns: Strophe.NS.CLIENT
  });

  Object.keys(extension).forEach(function(field) {
    if (field === 'iceCandidates') {

      // iceCandidates
      msg = msg.c('iceCandidates');
      extension[field].forEach(function(candidate) {
        msg = msg.c('iceCandidate');
        Object.keys(candidate).forEach(function(key) {
          msg.c(key).t(candidate[key]).up();
        });
        msg.up();
      });
      msg.up();

    } else if (field === 'opponentsIDs') {

      // opponentsIDs
      msg = msg.c('opponentsIDs');
      extension[field].forEach(function(opponentId) {
        msg = msg.c('opponentID').t(opponentId).up();
      });
      msg.up();

    } else if (typeof extension[field] === 'object') {

      self._JStoXML(field, extension[field], msg);

    } else {
      msg.c(field).t(extension[field]).up();
    }
  });

  connection.send(msg);
};

// TODO: the magic
WebRTCProxy.prototype._JStoXML = function(title, obj, msg) {
  var self = this;
  msg.c(title);
  Object.keys(obj).forEach(function(field) {
    if (typeof obj[field] === 'object')
      self._JStoXML(field, obj[field], msg);
    else
      msg.c(field).t(obj[field]).up();
  });
  msg.up();
};

// TODO: the magic
WebRTCProxy.prototype._XMLtoJS = function(extension, title, obj) {
  var self = this;
  extension[title] = {};
  for (var i = 0, len = obj.childNodes.length; i < len; i++) {
    if (obj.childNodes[i].childNodes.length > 1) {
      extension[title] = self._XMLtoJS(extension[title], obj.childNodes[i].tagName, obj.childNodes[i]);
    } else {
      extension[title][obj.childNodes[i].tagName] = obj.childNodes[i].textContent;
    }
  }
  return extension;
};

/* WebRTC module: RTCPeerConnection extension
--------------------------------------------------------------------------------- */
if (RTCPeerConnection) {

RTCPeerConnection.prototype.init = function(service, options) {
  this.service = service;
  this.sessionID = options && options.sessionID || Date.now();
  this.type = options && options.description ? 'answer' : 'offer';

  this.addStream(this.service.localStream);
  this.onicecandidate = this.onIceCandidateCallback;
  this.onaddstream = this.onRemoteStreamCallback;
  this.onsignalingstatechange = this.onSignalingStateCallback;
  this.oniceconnectionstatechange = this.onIceConnectionStateCallback;

  if (this.type === 'answer') {
    this.onRemoteSessionCallback(options.description, 'offer');
  }
};

RTCPeerConnection.prototype.getSessionDescription = function(callback) {
  if (peer.type === 'offer') {
    // Additional parameters for SDP Constraints
    // http://www.w3.org/TR/webrtc/#constraints
    // peer.createOffer(successCallback, errorCallback, constraints)
    peer.createOffer(successCallback, errorCallback);
  } else {
    peer.createAnswer(successCallback, errorCallback);
  }

  function successCallback(desc) {
    peer.setLocalDescription(desc, function() {
      callback(null, desc);
    }, errorCallback);
  }
  function errorCallback(error) {
    callback(error, null);
  }
};

RTCPeerConnection.prototype.onIceCandidateCallback = function(event) {
  var candidate = event.candidate;

  if (candidate) {
    trace("onICECandidate: " + JSON.stringify(candidate));

    peer.iceCandidates = peer.iceCandidates || [];
    peer.iceCandidates.push({
      sdpMLineIndex: candidate.sdpMLineIndex,
      sdpMid: candidate.sdpMid,
      candidate: candidate.candidate
    });
  }
};

// handler of remote session description
RTCPeerConnection.prototype.onRemoteSessionCallback = function(sessionDescription, type) {
  var desc = new RTCSessionDescription({sdp: sessionDescription, type: type});
  this.setRemoteDescription(desc);
};

// handler of remote media stream
RTCPeerConnection.prototype.onRemoteStreamCallback = function(event) {
  if (typeof peer.service.onRemoteStreamListener === 'function')
    peer.service.onRemoteStreamListener(event.stream);
};

RTCPeerConnection.prototype.addCandidates = function(iceCandidates) {
  var candidate;
  for (var i = 0, len = iceCandidates.length; i < len; i++) {
    candidate = {
      sdpMLineIndex: iceCandidates[i].sdpMLineIndex,
      sdpMid: iceCandidates[i].sdpMid,
      candidate: iceCandidates[i].candidate
    };
    this.addIceCandidate(new RTCIceCandidate(candidate));
  }
};

RTCPeerConnection.prototype.onSignalingStateCallback = function() {
  // send candidates
  if (peer && peer.signalingState === 'stable' && peer.type === 'offer'){
    peer.service._sendCandidate(peer.opponentId, peer.iceCandidates);
  }
};

RTCPeerConnection.prototype.onIceConnectionStateCallback = function() {
  trace("onIceConnectionStateCallback: " + peer.iceConnectionState);

  var newIceConnectionState = peer.iceConnectionState;

  // read more about all states:
  // http://w3c.github.io/webrtc-pc/#idl-def-RTCIceConnectionState
  //
  // 'disconnected' happens in a case when a user has killed an application (for example, on iOS/Android via task manager).
  // So we should notify our user about it.

  // notify user about state changes
  //
  if(typeof peer.service.onSessionStateChangedListener === 'function'){
	var sessionState = null;
	if (newIceConnectionState === 'checking'){
      sessionState = peer.service.SessionState.CONNECTING;
	} else if (newIceConnectionState === 'connected'){
      sessionState = peer.service.SessionState.CONNECTED;
	} else if (newIceConnectionState === 'failed'){
      sessionState = peer.service.SessionState.FAILED;
	} else if (newIceConnectionState === 'disconnected'){
      sessionState = peer.service.SessionState.DISCONNECTED;
	} else if (newIceConnectionState === 'closed'){
      sessionState = peer.service.SessionState.CLOSED;
	}

	if(sessionState != null){
      peer.service.onSessionStateChangedListener(sessionState);
    }
  }

  //
  if (newIceConnectionState === 'closed'){
    peer = null;
  }
};

}

/* Helpers
---------------------------------------------------------------------- */
function Helpers() {}

Helpers.prototype = {

  getUserJid: function(id, appId) {
    return id + '-' + appId + '@' + config.endpoints.chat;
  },

  getIdFromNode: function(jid) {
    if (jid.indexOf('@') < 0) return null;
    return parseInt(jid.split('@')[0].split('-')[0]);
  }

};

module.exports = WebRTCProxy;

/* Private
---------------------------------------------------------------------- */
function trace(text) {
  if (config.debug) {
    Utils.QBLog('[QBWebRTC]', text);
  }
}

function getLocalTime() {
  var arr = (new Date()).toString().split(' ');
  return arr.slice(1,5).join('-');
}

function clearCallers(userId){
	var caller = callers[userId];
	if (caller){
		delete callers[userId];
	}
}


////////////////////////////////////////////////////////////////////////

function clearAnswerTimer(userId){
	var answerTimer = answerTimers[userId];
  if(answerTimer){
    clearTimeout(answerTimer);
    delete answerTimers[userId];
  }
}

function startAnswerTimer(userId, callback){
  var answerTimeInterval = config.webrtc.answerTimeInterval*1000;
  var answerTimer = setTimeout(callback, answerTimeInterval, userId);
  answerTimers[userId] = answerTimer;
}

function clearDialingTimerInterval(userId){
  var dialingTimer = dialingTimerIntervals[userId];
  if(dialingTimer){
    clearInterval(dialingTimer);
    delete dialingTimerIntervals[userId];
  }
}

function startDialingTimerInterval(userId, functionToRun){
  var dialingTimeInterval = config.webrtc.dialingTimeInterval*1000;
  var dialingTimerId = setInterval(functionToRun, dialingTimeInterval);
  dialingTimerIntervals[userId] = dialingTimerId;
}

function clearCallTimer(userId){
  var callTimer = callTimers[userId];
  if(callTimer){
    clearTimeout(callTimer);
    delete callTimers[userId];
  }
}

function startCallTimer(userId, callback){
  var answerTimeInterval = config.webrtc.answerTimeInterval*1000;
  trace("startCallTimer, answerTimeInterval: " + answerTimeInterval);
  var callTimer = setTimeout(callback, answerTimeInterval, userId);
  callTimers[userId] = callTimer;
}

////////////////////////////////////////////////////////////////////////


// Convert Data URI to Blob
function dataURItoBlob(dataURI, contentType) {
  var arr = [],
      binary = window.atob(dataURI.split(',')[1]);

  for (var i = 0, len = binary.length; i < len; i++) {
    arr.push(binary.charCodeAt(i));
  }

  return new Blob([new Uint8Array(arr)], {type: contentType});
}

// Download Blob to local file system
Blob.prototype.download = function() {
  download(this, this.name, this.type);
};
