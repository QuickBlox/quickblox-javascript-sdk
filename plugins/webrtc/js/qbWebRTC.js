/**
 * QuickBlox VideoChat WebRTC library
 * version 0.2.1
 *
 * Authors: Igor Khomenko (igor@quickblox.com), Andrey Povelichenko (andrey.povelichenko@quickblox.com)
 *
 */

// Browserify dependencies
require('../libs/strophe');
require('../libs/adapter');
var config = require('./config');
var QBVideoChatSignaling = require('./qbSignalling');

window.QBVideoChat = QBVideoChat;
window.QBVideoChatSignaling = QBVideoChatSignaling;

/*
  Public methods:
    - call(userID, userName, userAvatar)
    - accept(userID, userName)
    - reject(userID, userName)
    - stop(userID, userName)
 */

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

function QBVideoChat(constraints, iceServers, signalingService, sessionID, sessionDescription) {
 	var _this = this;
	
	this.state = QBVideoChatState.INACTIVE;
	this.candidatesQueue = [];
	
	this.onGetUserMediaSuccess = null;
	this.onGetUserMediaError = null;
	this.localStreamElement = null;
	this.remoteStreamElement = null;
	
	this.constraints = constraints;
	this.iceServers = iceServers;
	this.sessionID = parseInt(sessionID || new Date().getTime());
	this.remoteSessionDescription = sessionDescription;
	traceVC("sessionID " + this.sessionID);
	
	// Signalling callbacks
	this.onAcceptSignalingCallback = function(sessionDescription) {
		_this.setRemoteDescription(sessionDescription, "answer");
	};
	
	this.addCandidate = function(data) {
		var jsonCandidate, candidate;
		
		jsonCandidate = _this.signalingService.xmppTextToDictionary(data);
		candidate = new RTCIceCandidate(jsonCandidate);
		
		_this.pc.addIceCandidate(candidate);
	};
	
	this.signalingService = signalingService;
	this.signalingService.onInnerAcceptCallback = this.onAcceptSignalingCallback;
	this.signalingService.onCandidateCallback = this.addCandidate;
	
	// MediaStream getUserMedia
	this.getUserMedia = function() {
		traceVC("getUserMedia...");
		
		getUserMedia(_this.constraints, successCallback, errorCallback);
		
		function successCallback(localMediaStream) {
			traceVC("getUserMedia success");
			_this.localStream = localMediaStream;
			_this.onGetUserMediaSuccess();
			_this.createRTCPeerConnection();
		}
		
		function errorCallback(error) {
			traceVC("getUserMedia error: " + JSON.stringify(error));
			_this.onGetUserMediaError();
		}
	};
	
	// MediaStream attachMedia
	this.attachMediaStream = function(elem, stream) {
		attachMediaStream(elem, stream);
	}
	
	// MediaStream reattachMedia
	this.reattachMediaStream = function(to, from) {
		reattachMediaStream(to, from);
	}
	
	// RTCPeerConnection creation
	this.createRTCPeerConnection = function() {
		traceVC("RTCPeerConnection...");
		var pcConfig = {
			'iceServers': createIceServers(_this.iceServers.urls, _this.iceServers.username, _this.iceServers.password)
		};
		try {
			_this.pc = new RTCPeerConnection(pcConfig, PC_CONSTRAINTS);
			_this.pc.addStream(_this.localStream);
			_this.pc.onicecandidate = _this.onIceCandidateCallback;
			_this.pc.onaddstream = _this.onRemoteStreamAddedCallback;
			traceVC('RTCPeerConnnection created');
		} catch (e) {
			traceVC('RTCPeerConnection failed: ' + e.message);
		}
	};
	
	// onIceCandidate callback
	this.onIceCandidateCallback = function(event) {
		var iceData, iceDataAsmessage, candidate = event.candidate;
		
		if (candidate) {
			iceData = {
				sdpMLineIndex: candidate.sdpMLineIndex,
				candidate: candidate.candidate,
				sdpMid: candidate.sdpMid
			};
			
			iceDataAsmessage = _this.signalingService.xmppDictionaryToText(iceData);
			console.log(iceDataAsmessage);
			
			if (_this.state == QBVideoChatState.INACTIVE)
				_this.candidatesQueue.push(iceDataAsmessage);
			else {
				// Send ICE candidate to opponent
				_this.signalingService.sendCandidate(_this.opponentID, iceDataAsmessage, _this.sessionID, _this.opponentUsername);
			}
		}
	};

	// onRemoteStreamAdded callback
	this.onRemoteStreamAddedCallback = function(event) {
		traceVC('Remote stream added');
		_this.remoteStream = event.stream;
		_this.attachMediaStream(_this.remoteStreamElement, event.stream);
	};
	
	// Set LocalDescription
	this.onGetSessionDescriptionSuccessCallback = function(sessionDescription) {
		traceVC('LocalDescription...');
		
		_this.pc.setLocalDescription(sessionDescription,
                                
                                function onSuccess() {
                                  traceVC('LocalDescription success');
                                  _this.localSessionDescription = sessionDescription;
                                  
                                  // ICE gathering starts work here
                                  if (sessionDescription.type === 'offer')
                                    _this.sendCallRequest();
                                  else if (sessionDescription.type === 'answer')
                                    _this.sendAceptRequest();
                                },
                                
                                function onError(error) {
                                  traceVC('LocalDescription error: ' + JSON.stringify(error));
                                }
		);
	};

	this.onCreateOfferFailureCallback = function(error) {
		traceVC('createOffer() error: ' + JSON.stringify(error));
	};
	
	// Set RemoteDescription
	this.setRemoteDescription = function(descriptionSDP, descriptionType) {
		traceVC('RemoteDescription...');
		var sessionDescription, candidate;
		
		_this.state = QBVideoChatState.ESTABLISHING;
		sessionDescription = new RTCSessionDescription({sdp: descriptionSDP, type: descriptionType});
		
		_this.pc.setRemoteDescription(sessionDescription,
                                 
                                 function onSuccess() {
                                   traceVC("RemoteDescription success");
                                   
                                   if (sessionDescription.type === 'offer')
                                     _this.pc.createAnswer(_this.onGetSessionDescriptionSuccessCallback, _this.onCreateAnswerFailureCallback, SDP_CONSTRAINTS);
                                 },
                                 
                                 function onError(error) {
                                   traceVC('RemoteDescription error: ' + JSON.stringify(error));
                                 }
		);
		
		// send candidates
		for (var i = 0; i < _this.candidatesQueue.length; i++) {
			candidate = _this.candidatesQueue.pop();
			_this.signalingService.sendCandidate(_this.opponentID, candidate, _this.sessionID, _this.opponentUsername);
		}
	};
	
	this.onCreateAnswerFailureCallback = function(error) {
		traceVC('createAnswer() error: ' + JSON.stringify(error));
	};
	
	this.sendCallRequest = function() {
		// Send only string representation of sdp
		// http://www.w3.org/TR/webrtc/#rtcsessiondescription-class
	
		_this.signalingService.call(_this.opponentID, _this.localSessionDescription.sdp, _this.sessionID, _this.opponentUsername, _this.opponentAvatar);
	};
	
	this.sendAceptRequest = function() {
		// Send only string representation of sdp
		// http://www.w3.org/TR/webrtc/#rtcsessiondescription-class
	
		_this.signalingService.accept(_this.opponentID, _this.localSessionDescription.sdp, _this.sessionID, _this.opponentUsername);
	};

	// Cleanup 
	this.hangup = function() {
		_this.state = QBVideoChatState.INACTIVE;
		_this.signalingService = null;
		_this.localStream.stop();
		_this.pc.close();
		_this.pc = null;
	};
}

// Call to user
QBVideoChat.prototype.call = function(userID, userName, userAvatar) {
	if (this.localSessionDescription) {
		this.sendCallRequest();
	} else {
		this.opponentID = userID;
		this.opponentUsername = userName;
		this.opponentAvatar = userAvatar;
		this.pc.createOffer(this.onGetSessionDescriptionSuccessCallback, this.onCreateOfferFailureCallback, SDP_CONSTRAINTS);
	}
};

// Accept call from user 
QBVideoChat.prototype.accept = function(userID, userName) {
	this.opponentID = userID;
	this.opponentUsername = userName;
	this.setRemoteDescription(this.remoteSessionDescription, "offer");
};

// Reject call from user
QBVideoChat.prototype.reject = function(userID, userName) {
	this.signalingService.reject(userID, this.sessionID, userName);
};

// Stop call with user
QBVideoChat.prototype.stop = function(userID, userName) {
	this.signalingService.stop(userID, "manual", this.sessionID, userName);
};

function traceVC(text) {
	console.log("[qb_videochat]: " + text);
}