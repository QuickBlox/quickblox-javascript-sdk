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

var stopCallReason = {
  MANUALLY: 'manually',
  BAD_CONNECTION: 'bad_connection',
  CANCEL: 'cancel',
  NOT_ANSWER: 'not_answer'
};

var WEBRTC_MODULE_ID = 'WebRTCVideoChat';

var connection, peer,
    callers = {};

/* WebRTC module: Core
--------------------------------------------------------------------------------- */
function WebRTCProxy(service, conn) {
  var self = this;
  connection = conn;

  this.service = service;
  this.helpers = new Helpers;

  this._onMessage = function(stanza) {
    var from = stanza.getAttribute('from'),
        extraParams = stanza.querySelector('extraParams'),
        delay = stanza.querySelector('delay'),
        userId = self.helpers.getIdFromNode(from),
        extension = self._getExtension(extraParams);
    
    if (delay || extension.moduleIdentifier !== WEBRTC_MODULE_ID) return true;

    // clean for users
    delete extension.moduleIdentifier;

    switch (extension.signalType) {
    case signalingType.CALL:
      trace('onCall from ' + userId);
      if (callers[userId]) return true;
      callers[userId] = {
        sessionID: extension.sessionID,
        sdp: extension.sdp
      };
      extension.callType = extension.callType === '1' ? 'video' : 'audio';
      delete extension.sdp;
      if (typeof self.onCallListener === 'function')
        self.onCallListener(userId, extension);
      break;
    case signalingType.ACCEPT:
      trace('onAccept from ' + userId);
      if (typeof peer === 'object')
        peer.onRemoteSessionCallback(extension.sdp, 'answer');
      delete extension.sdp;
      if (typeof self.onAcceptCallListener === 'function')
        self.onAcceptCallListener(userId, extension);
      break;
    case signalingType.REJECT:
      trace('onReject from ' + userId);
      self._close();
      if (typeof self.onRejectCallListener === 'function')
        self.onRejectCallListener(userId, extension);
      break;
    case signalingType.STOP:
      trace('onStop from ' + userId);
      if (callers[userId]) delete callers[userId];
      self._checkReason(extension.reason);
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

  this._checkReason = function(reason) {
    var self = this;

    if (reason === stopCallReason.MANUALLY) {
      self._close();
    }
  };
}

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
  var pcConfig = {
    iceServers: config.iceServers
  };
  
  // Additional parameters for RTCPeerConnection options
  // new RTCPeerConnection(pcConfig, options)
  /**********************************************
   * DtlsSrtpKeyAgreement: true
   * RtpDataChannels: true
  **********************************************/
  peer = new RTCPeerConnection(pcConfig);
  peer.init(this, params);
  trace('SessionID ' + peer.sessionID);
  trace(peer);
};

WebRTCProxy.prototype.call = function(opponentsIDs, callType, extension) {
  this._createPeer();

  var self = this;
  // TODO: need to add a posibility created group calls
  var ids = opponentsIDs instanceof Array ? opponentsIDs : [opponentsIDs];

  peer.opponentId = ids[0];
  peer.getSessionDescription(function(err, res) {
    if (err) {
      trace(err);
    } else {
      trace('call ' + peer.opponentId);
      self._sendMessage(peer.opponentId, extension, 'CALL', callType, ids);
    }
  });
};

WebRTCProxy.prototype.accept = function(userId, extension) {
  if (callers[userId]) {
    this._createPeer({
      sessionID: callers[userId].sessionID,
      description: callers[userId].sdp
    });
    delete callers[userId];
  }
  
  var self = this;
  peer.opponentId = userId;

  peer.getSessionDescription(function(err, res) {
    if (err) {
      trace(err);
    } else {
      trace('accept ' + userId);
      self._sendMessage(userId, extension, 'ACCEPT');
    }
  });
};

WebRTCProxy.prototype.reject = function(userId, extension) {
  var extension = extension || {};

  if (callers[userId]) {
    extension.sessionID = callers[userId].sessionID;
    delete callers[userId];
  }
  trace('reject ' + userId);
  this._sendMessage(userId, extension, 'REJECT');
};

WebRTCProxy.prototype.stop = function(userId, reason, extension) {
  var extension = extension || {},
      status = reason || 'manually';

  extension.reason = stopCallReason[status.toUpperCase()] || reason;
  trace('stop ' + userId);
  this._sendMessage(userId, extension, 'STOP');
  this._close();
};

WebRTCProxy.prototype.update = function(userId, extension) {
  trace('update ' + userId);
  this._sendMessage(userId, extension, 'PARAMETERS_CHANGED');
};

// close peer connection and local stream
WebRTCProxy.prototype._close = function() {
  if (peer) {
    peer.close();
  }
  if (this.localStream) {
    this.localStream.stop();
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
    to: this.helpers.getUserJid(userId, this.service.getSession().application_id),
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
    });
  }
  function errorCallback(error) {
    callback(error, null);
  }
};

RTCPeerConnection.prototype.onIceCandidateCallback = function(event) {
  var candidate = event.candidate;
  if (candidate) {
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
  if (peer && peer.signalingState === 'stable' && peer.type === 'offer')
    peer.service._sendCandidate(peer.opponentId, peer.iceCandidates);
};

RTCPeerConnection.prototype.onIceConnectionStateCallback = function() {
  if (peer.iceConnectionState === 'closed' || peer.iceConnectionState === 'disconnected')
    peer = null;
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
  // if (config.debug) {
    console.log('[QBWebRTC]:', text);
  // }
}

function getLocalTime() {
  var arr = (new Date).toString().split(' ');
  return arr.slice(1,5).join('-');
}

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
