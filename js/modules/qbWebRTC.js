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
 * - onRemoteStreamListener
 */

require('../../lib/strophe/strophe.min');
var config = require('../qbConfig');

// cross-browser polyfill
var RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
var RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;
var getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia).bind(navigator);
var URL = window.URL || window.webkitURL;

var signalingType = {
  CALL: 'qbvideochat_call',
  ACCEPT: 'qbvideochat_acceptCall',
  REJECT: 'qbvideochat_rejectCall',
  STOP: 'qbvideochat_stopCall',
  CANDIDATE: 'qbvideochat_candidate',
  PARAMETERS_CHANGED: 'qbvideochat_callParametersChanged'
};

var stopCallReason = {
  MANUALLY: 'kStopVideoChatCallStatus_Manually',
  BAD_CONNECTION: 'kStopVideoChatCallStatus_BadConnection',
  CANCEL: 'kStopVideoChatCallStatus_Cancel',
  NOT_ANSWER: 'kStopVideoChatCallStatus_OpponentDidNotAnswer'
};

var connection, peer;

/* WebRTC module: Core
--------------------------------------------------------------------------------- */
function WebRTCProxy(service, conn) {
  var self = this;
  connection = conn;

  this.service = service;
  this.helpers = new Helpers;

  // set signaling callbacks
  connection.addHandler(self._onMessage, null, 'message', 'headline');

  this._onMessage = function(stanza) {
    var from = stanza.getAttribute('from'),
        extraParams = stanza.querySelector('extraParams'),
        userId = self.helpers.getIdFromNode(from),
        extension = {};
    
    if (extraParams) {
      for (var i = 0, len = extraParams.childNodes.length; i < len; i++) {
        extension[extraParams.childNodes[i].tagName] = extraParams.childNodes[i].textContent;
      }
    }
    
    switch (extension.videochat_signaling_type) {
    case signalingType.CALL:
      trace('onCall from ' + userId);
      if (typeof self.onCallListener === 'function')
        self.onCallListener(userId, extension);
      break;
    case signalingType.ACCEPT:
      trace('onAccept from ' + userId);
      // self.core.onAcceptSignalingCallback(extension.sdp);
      if (typeof self.onAcceptCallListener === 'function')
        self.onAcceptCallListener(userId, extension);
      break;
    case signalingType.REJECT:
      trace('onReject from ' + userId);
      if (typeof self.onRejectCallListener === 'function')
        self.onRejectCallListener(userId, extension);
      break;
    case signalingType.STOP:
      trace('onStop from ' + userId);
      if (typeof self.onStopCallListener === 'function')
        self.onStopCallListener(userId, extension);
      break;
    case signalingType.CANDIDATE:
      // self.core.addCandidate({
      //   sdpMLineIndex: extension.sdpMLineIndex,
      //   candidate: extension.candidate,
      //   sdpMid: extension.sdpMid
      // });
      break;
    case signalingType.PARAMETERS_CHANGED:
      break;
    }
    
    // we must return true to keep the handler alive
    // returning false would remove it after it finishes
    return true;
  };
}

/* WebRTC module: User Media Steam
--------------------------------------------------------------------------------- */

// get local stream from user media interface (web-camera, microphone)
WebRTCProxy.prototype.getUserMedia = function(params, callback) {
  if (!getUserMedia) throw new Error('getUserMedia() is not supported in your browser');
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
    params,

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

// add CSS filters to video stream
// http://css-tricks.com/almanac/properties/f/filter/
WebRTCProxy.prototype.filter = function(id, filters) {
  var video = document.getElementById(id);
  if (video) {
    video.style.webkitFilter = filters;
    video.style.filter = filters;
  }
};

WebRTCProxy.prototype.snapshot = function(id) {
  var video = document.getElementById(id),
      canvas = document.createElement('canvas'),
      context = canvas.getContext('2d');
  
  if (video) {
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;
    if (video.style.transform === 'scaleX(-1)') {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }
    context.drawImage(video, 0, 0, video.clientWidth, video.clientHeight);

    return canvas.toDataURL('image/png');
  }
};

/* Real-Time Communication (+ Signaling)
--------------------------------------------------------------------------------- */

WebRTCProxy.prototype.createPeer = function(params) {
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
  trace('Session ID ' + peer.sessionId);
  trace(params);
  trace(peer);
};

WebRTCProxy.prototype.call = function(userId, extension) {
  peer.getSessionDescription(function(err, res) {
    if (err) {
      trace(err);
    } else {
      trace('call ' + userId);
      this._sendMessage(userId, extension, 'CALL');
    }
  });
};

WebRTCProxy.prototype.accept = function(userId, extension) {
  // this.setRemoteDescription(this.remoteSessionDescription, "offer");
  peer.createAnswer(
    function(sessionDescription) {
      peer.onSessionDescriptionCallback(sessionDescription, function() {
        trace('accept ' + userId);
        this._sendMessage(userId, extension, 'ACCEPT');
      });
    },

    function(error) {
      trace(error);
    }
  );
};

WebRTCProxy.prototype.reject = function(userId, extension) {
  trace('reject ' + userId);
  this._sendMessage(userId, extension, 'REJECT');
};

WebRTCProxy.prototype.hangup = function(userId, extension) {
  trace('stop ' + userId);
  this._sendMessage(userId, extension, 'STOP');

  this.localStream.stop();
  peer.close();
  peer = null;
};

WebRTCProxy.prototype._sendCandidate = function(userId, candidate) {
  var extension = {
    sdpMLineIndex: candidate.sdpMLineIndex,
    candidate: candidate.candidate,
    sdpMid: candidate.sdpMid
  };

  this._sendMessage(userId, extension, 'CANDIDATE');
};

WebRTCProxy.prototype._sendMessage = function(userId, extension, type) {
  var reply, params;
  extension = extension || {};

  extension.videochat_signaling_type = signalingType[type];
  extension.sessionID = sessionID;

  if (type === 'CALL' || type === 'ACCEPT') {
    extraParams.sdp = sessionDescription;
    extraParams.platform = 'web';
    extraParams.device_orientation = 'portrait';
  }
  
  params = {
    to: self.helpers.getUserJid(userId, self.service.getSession().application_id),
    from: connection.jid,
    type: 'headline'
  };
  
  reply = $msg(params).c('extraParams', {
    xmlns: Strophe.NS.CLIENT
  });
  
  Object.keys(extension).forEach(function(key) {
    reply.c(key).t(extension[key]).up();
  });
  
  connection.send(reply);
};

/* RTCPeerConnection extension
--------------------------------------------------------------------------------- */

RTCPeerConnection.prototype.init = function(service, options) {
  var desc;

  this.service = service;
  this.sessionId = options && options.sessionId || Date.now();
  this.type = options && options.peerType || 'offer';
  this.addStream(this.service.localStream);

  if (this.type === 'answer') {
    desc = new RTCSessionDescription(options.sdp);
    // this.setRemoteDescription(desc, successCallback, errorCallback);
    this.setRemoteDescription(desc);
  }

  this.onicecandidate = this.onIceCandidateCallback;
  this.onaddstream = this.onRemoteStreamCallback;

  this.oniceconnectionstatechange = function() {
    trace('oniceconnectionstatechange START');
    trace(peer.iceConnectionState);
    trace('oniceconnectionstatechange END');
  };
  this.onsignalingstatechange = function() {
    trace('onsignalingstatechange START');
    trace(peer.iceGatheringState);
    trace(peer.signalingState);
    trace('onsignalingstatechange END');
  };
};

RTCPeerConnection.prototype.getSessionDescription = function(callback) {
  var request = peer.type === 'offer' ? peer.createOffer : peer.createAnswer;

  // Additional parameters for SDP Constraints
  // http://www.w3.org/TR/webrtc/#constraints
  // peer.createOffer(successCallback, errorCallback, constraints)
  request(
    function(desc) {
      trace(desc);

      // peer.setLocalDescription(desc, successCallback, errorCallback)
      peer.setLocalDescription(desc);
      callback(null, desc);
    },

    function(error) {
      callback(error, null);
    }
  );
}

// // Set RemoteDescription
//   setRemoteDescription: function(descriptionSDP, descriptionType) {
//     trace('RemoteDescription...');
//     var self = this,
//         sessionDescription, candidate;
    
//     // self._state = QBVideoChatState.ESTABLISHING;
//     sessionDescription = new RTCSessionDescription({sdp: descriptionSDP, type: descriptionType});
    
//     self.pc.setRemoteDescription(sessionDescription,
                                 
//                                  function onSuccess() {
//                                    trace('RemoteDescription success');
                                   
//                                    if (sessionDescription.type === 'offer')
//                                      self.pc.createAnswer(self.onGetSessionDescriptionSuccessCallback, self.onCreateAnswerFailureCallback);
//                                  },
                                 
//                                  function onError(error) {
//                                    trace('RemoteDescription error: ' + JSON.stringify(error));
//                                  }
//     );
    
//     // send candidates
//     for (var i = 0; i < self._candidatesQueue.length; i++) {
//       candidate = self._candidatesQueue.pop();
//       self.webrtc.sendCandidate(self.opponentID, candidate, self.sessionID);
//     }
//   },

RTCPeerConnection.prototype.onIceCandidateCallback = function(event) {
  trace(event.candidate);

  var self = this,
        candidate = event.candidate;
    
    if (candidate) {
      // if (self._state == QBVideoChatState.INACTIVE)
        self._candidatesQueue.push(candidate);
      else {
        // Send ICE candidate to opponent
        self.webrtc.sendCandidate(self.opponentID, candidate, self.sessionID);
      }
    }

  // if (event.candidate) {
  //   sendMessage({type: 'candidate',
  //     label: event.candidate.sdpMLineIndex,
  //     id: event.candidate.sdpMid,
  //     candidate: event.candidate.candidate});
  // } else {
  //   trace("End of candidates.");
  // }
  // signalingChannel.send(JSON.stringify({'candidate': event.candidate}));
};

RTCPeerConnection.prototype.onRemoteStreamCallback = function(event) {
  trace('Remote stream ' + event);
  if (typeof peer.service.onRemoteStreamListener === 'function')
    peer.service.onRemoteStreamListener(event.stream);
};

// var candidate = new RTCIceCandidate({sdpMLineIndex:msg.label,
//                                      candidate:msg.candidate});
// peer.addIceCandidate(candidate);
// peer.addIceCandidate(new RTCIceCandidate(signal.candidate));

// // Signalling callbacks
//   onAcceptSignalingCallback: function(sessionDescription) {
//     this.setRemoteDescription(sessionDescription, 'answer');
//   },
  
//   addCandidate: function(data) {
//     var candidate = new RTCIceCandidate(data);
//     this.pc.addIceCandidate(candidate);
//   },

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
