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
 */

require('../../lib/strophe/strophe.min');
require('../../lib/adapter');
var config = require('../qbConfig');

var connection;

var QBSignalingType = {
  CALL: 'qbvideochat_call',
  ACCEPT: 'qbvideochat_acceptCall',
  REJECT: 'qbvideochat_rejectCall',
  STOP: 'qbvideochat_stopCall',
  CANDIDATE: 'qbvideochat_candidate',
  PARAMETERS_CHANGED: 'qbvideochat_callParametersChanged'
};

var PC_CONSTRAINTS = {
  'optional': []
};

var SDP_CONSTRAINTS = {
  'optional': [],
  'mandatory': {
    'OfferToReceiveAudio': true,
    'OfferToReceiveVideo': true
  }
};

var QBVideoChatState = {
  INACTIVE: 'inactive',
  ESTABLISHING: 'establishing'
};

var QBStopReason = {
  MANUALLY: 'kStopVideoChatCallStatus_Manually',
  BAD_CONNECTION: 'kStopVideoChatCallStatus_BadConnection',
  CANCEL: 'kStopVideoChatCallStatus_Cancel',
  NOT_ANSWER: 'kStopVideoChatCallStatus_OpponentDidNotAnswer'
};

function WebRTCProxy(service, conn) {
  var self = this;
  connection = conn;

  this.service = service;
  this.core = new CoreProxy(service, this);
  this.helpers = new Helpers;

  // set WebRTC callbacks
  connection.addHandler(self._onMessage, null, 'message', 'headline');

  this._onMessage = function(msg) {
    var author, qbID;
    var extraParams, extension = {};
    
    author = msg.getAttribute('from');
    qbID = self.helpers.getIdFromNode(author);
    
    extraParams = msg.querySelector('extraParams');
    extraParams.childNodes.forEach(function(tag) {
      extension[tag.context.tagName] = tag.context.textContent;
    });
    
    switch (extension.videochat_signaling_type) {
    case QBSignalingType.CALL:
      trace('onCall from ' + qbID);
      if (typeof self.onCallListener === 'function')
        self.onCallListener(qbID, extension);
      break;
    case QBSignalingType.ACCEPT:
      trace('onAccept from ' + qbID);
      if (typeof self.onAcceptCallListener === 'function')
        self.onAcceptCallListener(qbID, extension);
      self.core.onAcceptSignalingCallback(extension.sdp);
      break;
    case QBSignalingType.REJECT:
      trace('onReject from ' + qbID);
      if (typeof self.onRejectCallListener === 'function')
        self.onRejectCallListener(qbID, extension);
      break;
    case QBSignalingType.STOP:
      trace('onStop from ' + qbID);
      if (typeof self.onStopCallListener === 'function')
        self.onStopCallListener(qbID, extension);
      break;
    case QBSignalingType.CANDIDATE:
      self.core.addCandidate({
        sdpMLineIndex: extension.sdpMLineIndex,
        candidate: extension.candidate,
        sdpMid: extension.sdpMid
      });
      break;
    case QBSignalingType.PARAMETERS_CHANGED:
      break;
    }
    
    return true;
  };
}

WebRTCProxy.prototype = {
  init: function(params) {
    this.core.init(params);
  },

  call: function(opponentID, sessionDescription, sessionID, extraParams) {
    trace('call to ' + opponentID);
    extraParams = extraParams || {};
    
    extraParams.videochat_signaling_type = QBSignalingType.CALL;
    extraParams.sessionID = sessionID;
    extraParams.sdp = sessionDescription;
    extraParams.platform = 'web';
    extraParams.device_orientation = 'portrait';
    
    this._sendMessage(opponentID, extraParams);
  },

  accept: function(opponentID, sessionDescription, sessionID, extraParams) {
    trace('accept ' + opponentID);
    extraParams = extraParams || {};

    extraParams.videochat_signaling_type = QBSignalingType.ACCEPT;
    extraParams.sessionID = sessionID;
    extraParams.sdp = sessionDescription;
    extraParams.platform = 'web';
    extraParams.device_orientation = 'portrait';

    this._sendMessage(opponentID, extraParams);
  },

  reject: function(opponentID, sessionID, extraParams) {
    trace('reject ' + opponentID);
    extraParams = extraParams || {};

    extraParams.videochat_signaling_type = QBSignalingType.REJECT;
    extraParams.sessionID = sessionID;

    this._sendMessage(opponentID, extraParams);
  },

  stop: function(opponentID, sessionID, extraParams) {
    trace('stop ' + opponentID);
    extraParams = extraParams || {};

    extraParams.videochat_signaling_type = QBSignalingType.STOP;
    extraParams.sessionID = sessionID;

    this._sendMessage(opponentID, extraParams);
  },

  sendCandidate: function(opponentID, candidate, sessionID) {
    var extraParams = {
      videochat_signaling_type: QBSignalingType.CANDIDATE,
      sessionID: sessionID,
      sdpMLineIndex: candidate.sdpMLineIndex,
      candidate: candidate.candidate,
      sdpMid: candidate.sdpMid
    };

    this._sendMessage(opponentID, extraParams);
  },

  _sendMessage: function(opponentID, extraParams) {
    var reply, params;
    
    params = {
      to: self.helpers.getUserJid(opponentID, self.service.getSession().application_id),
      from: connection.jid,
      type: 'headline'
    };
    
    reply = $msg(params).c('extraParams', {
      xmlns: Strophe.NS.CLIENT
    });
    
    Object.keys(extraParams).forEach(function(key) {
      reply.c(key).t(extraParams[key]).up();
    });
    
    connection.send(reply);
  }
};

/* WebRTC: Core
---------------------------------------------------------------------- */
function CoreProxy(service, webrtc) {
  this.service = service;
  this.webrtc = webrtc;
  this.helpers = new Helpers;

  this.stopReason = QBStopReason;
  this._state = QBVideoChatState.INACTIVE;
  this._candidatesQueue = [];
  this.localVideoElement = null;
  this.remoteVideoElement = null;
}

CoreProxy.prototype = {

  init: function(params) {
    this.sessionID = params.sessionID || new Date().getTime();
    this.remoteSessionDescription = params.sessionDescription || null;
    this.constraints = params.constraints || null;
    
    trace('sessionID ' + this.sessionID);
  },

  // Signalling callbacks
  onAcceptSignalingCallback: function(sessionDescription) {
    this.setRemoteDescription(sessionDescription, 'answer');
  },
  
  addCandidate: function(data) {
    var candidate = new RTCIceCandidate(data);
    this.pc.addIceCandidate(candidate);
  },

  // MediaStream getUserMedia
  getUserMedia: function() {
    var self = this;
    trace('getUserMedia...');
    
    getUserMedia(this.constraints, successCallback, errorCallback);
    
    function successCallback(localMediaStream) {
      trace('getUserMedia success');
      self.localStream = localMediaStream;
      self.createRTCPeerConnection();
      if (typeof self.onGetUserMediaSuccess === 'function')
        self.onGetUserMediaSuccess();
    }
    
    function errorCallback(error) {
      trace('getUserMedia error: ' + JSON.stringify(error));
      if (typeof self.onGetUserMediaError === 'function')
        self.onGetUserMediaError();
    }
  },
  
  // MediaStream attachMedia
  attachMediaStream: function(elem, stream) {
    attachMediaStream(elem, stream);
  },
  
  // MediaStream reattachMedia
  reattachMediaStream: function(to, from) {
    reattachMediaStream(to, from);
  },
  
  // RTCPeerConnection creation
  createRTCPeerConnection: function() {
    var self = this;
    trace('RTCPeerConnection...');
    try {
      self.pc = new RTCPeerConnection(config.iceServers, PC_CONSTRAINTS);
      self.pc.addStream(self.localStream);
      self.pc.onicecandidate = self.onIceCandidateCallback;
      self.pc.onaddstream = self.onRemoteStreamAddedCallback;
      trace('RTCPeerConnnection created');
    } catch (e) {
      trace('RTCPeerConnection failed: ' + e.message);
    }
  },
  
  // onIceCandidate callback
  onIceCandidateCallback: function(event) {
    var self = this,
        candidate = event.candidate;
    
    if (candidate) {
      if (self._state == QBVideoChatState.INACTIVE)
        self._candidatesQueue.push(candidate);
      else {
        // Send ICE candidate to opponent
        self.webrtc.sendCandidate(self.opponentID, candidate, self.sessionID);
      }
    }
  },

  // onRemoteStreamAdded callback
  onRemoteStreamAddedCallback: function(event) {
    trace('Remote stream added');
    this.remoteStream = event.stream;
    this.attachMediaStream(this.remoteVideoElement, event.stream);
  },
  
  // Set LocalDescription
  onGetSessionDescriptionSuccessCallback: function(sessionDescription) {
    var self = this;
    trace('LocalDescription...');
    
    self.pc.setLocalDescription(sessionDescription,
                                
                                function onSuccess() {
                                  trace('LocalDescription success');
                                  self.localSessionDescription = sessionDescription;
                                  
                                  // ICE gathering starts work here
                                  if (sessionDescription.type === 'offer')
                                    self.sendCallRequest();
                                  else if (sessionDescription.type === 'answer')
                                    self.sendAceptRequest();
                                },
                                
                                function onError(error) {
                                  trace('LocalDescription error: ' + JSON.stringify(error));
                                }
    );
  },

  onCreateOfferFailureCallback: function(error) {
    trace('createOffer() error: ' + JSON.stringify(error));
  },
  
  // Set RemoteDescription
  setRemoteDescription: function(descriptionSDP, descriptionType) {
    trace('RemoteDescription...');
    var self = this,
        sessionDescription, candidate;
    
    self._state = QBVideoChatState.ESTABLISHING;
    sessionDescription = new RTCSessionDescription({sdp: descriptionSDP, type: descriptionType});
    
    self.pc.setRemoteDescription(sessionDescription,
                                 
                                 function onSuccess() {
                                   trace('RemoteDescription success');
                                   
                                   if (sessionDescription.type === 'offer')
                                     self.pc.createAnswer(self.onGetSessionDescriptionSuccessCallback, self.onCreateAnswerFailureCallback, SDP_CONSTRAINTS);
                                 },
                                 
                                 function onError(error) {
                                   trace('RemoteDescription error: ' + JSON.stringify(error));
                                 }
    );
    
    // send candidates
    for (var i = 0; i < self._candidatesQueue.length; i++) {
      candidate = self._candidatesQueue.pop();
      self.webrtc.sendCandidate(self.opponentID, candidate, self.sessionID);
    }
  },
  
  onCreateAnswerFailureCallback: function(error) {
    trace('createAnswer() error: ' + JSON.stringify(error));
  },
  
  sendCallRequest: function() {
    // Send only string representation of sdp
    // http://www.w3.org/TR/webrtc/#rtcsessiondescription-class
  
    this.webrtc.call(this.opponentID, this.localSessionDescription.sdp, this.sessionID, this.extraParams);
  },
  
  sendAceptRequest: function() {
    // Send only string representation of sdp
    // http://www.w3.org/TR/webrtc/#rtcsessiondescription-class
  
    this.webrtc.accept(this.opponentID, this.localSessionDescription.sdp, this.sessionID, this.extraParams);
  },

  // Cleanup 
  hangup: function() {
    this._state = QBVideoChatState.INACTIVE;
    this.localStream.stop();
    this.pc.close();
    this.pc = null;
  },

  // Call to user
  call: function(userID, extraParams) {
    if (this.localSessionDescription) {
      this.sendCallRequest();
    } else {
      this.opponentID = userID;
      this.extraParams = extraParams;
      
      this.pc.createOffer(this.onGetSessionDescriptionSuccessCallback, this.onCreateOfferFailureCallback, SDP_CONSTRAINTS);
    }
  },

  // Accept call from user 
  accept: function(userID, extraParams) {
    this.opponentID = userID;
    this.extraParams = extraParams;
    this.setRemoteDescription(this.remoteSessionDescription, "offer");
  },

  // Reject call from user
  reject: function(userID, extraParams) {
    this.webrt.reject(userID, this.sessionID, extraParams);
  },

  // Stop call with user
  stop: function(userID, extraParams) {
    this.webrtc.stop(userID, this.sessionID, extraParams);
  }

};

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
