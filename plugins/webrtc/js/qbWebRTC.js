/**
 * QuickBlox VideoChat WebRTC library
 *
 */

/*
  Public methods:
    - call(userID, userName, userAvatar)
    - accept(userID, userName)
    - reject(userID, userName)
    - stop(userID, userName)
 */

// Browserify dependencies
require('../libs/adapter');
var config = require('./config');
var QBVideoChatSignaling = require('./qbSignalling');

window.QBVideoChat = QBVideoChat;
window.QBVideoChatSignaling = QBVideoChatSignaling;

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

function QBVideoChat(signaling, params) {
 	var self = this;
 	
 	this.version = '0.4.0';
 	
	this._state = QBVideoChatState.INACTIVE;
	this._candidatesQueue = [];
	this.localStreamElement = null;
	this.remoteStreamElement = null;
	
	if (params) {
		this._debug = params.debug || null;
		
		this.sessionID = parseInt(params.sessionID || new Date().getTime());
		this.remoteSessionDescription = params.sessionDescription || null;
		this.constraints = params.constraints || null;
		
		traceVC("sessionID " + this.sessionID);
		
		// set user callbacks
		this._callbacks = {
			onGetUserMediaSuccess: params.onGetUserMediaSuccess || null,
			onGetUserMediaError: params.onGetUserMediaError || null
		};
	}
	
	// Signalling callbacks
	this.onAcceptSignalingCallback = function(sessionDescription) {
		self.setRemoteDescription(sessionDescription, "answer");
	};
	
	this.addCandidate = function(data) {
		var jsonCandidate, candidate;
		
		jsonCandidate = self._xmppTextToDictionary(data);
		candidate = new RTCIceCandidate(jsonCandidate);
		
		self.pc.addIceCandidate(candidate);
	};
	
	this.signaling = signaling;
	this.signaling.onInnerAcceptCallback = this.onAcceptSignalingCallback;
	this.signaling.onCandidateCallback = this.addCandidate;
	
	// MediaStream getUserMedia
	this.getUserMedia = function() {
		traceVC("getUserMedia...");
		
		getUserMedia(self.constraints, successCallback, errorCallback);
		
		function successCallback(localMediaStream) {
			traceVC("getUserMedia success");
			self.localStream = localMediaStream;
			self._callbacks.onGetUserMediaSuccess();
			self.createRTCPeerConnection();
		}
		
		function errorCallback(error) {
			traceVC("getUserMedia error: " + JSON.stringify(error));
			self._callbacks.onGetUserMediaError();
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
			'iceServers': createIceServers(config.iceServers.urls, config.iceServers.username, config.iceServers.password)
		};
		try {
			self.pc = new RTCPeerConnection(pcConfig, PC_CONSTRAINTS);
			self.pc.addStream(self.localStream);
			self.pc.onicecandidate = self.onIceCandidateCallback;
			self.pc.onaddstream = self.onRemoteStreamAddedCallback;
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
			
			iceDataAsmessage = self._xmppDictionaryToText(iceData);
			console.log(iceDataAsmessage);
			
			if (self._state == QBVideoChatState.INACTIVE)
				self._candidatesQueue.push(iceDataAsmessage);
			else {
				// Send ICE candidate to opponent
				self.signaling.sendCandidate(self.opponentID, iceDataAsmessage, self.sessionID, self.opponentUsername);
			}
		}
	};

	// onRemoteStreamAdded callback
	this.onRemoteStreamAddedCallback = function(event) {
		traceVC('Remote stream added');
		self.remoteStream = event.stream;
		self.attachMediaStream(self.remoteStreamElement, event.stream);
	};
	
	// Set LocalDescription
	this.onGetSessionDescriptionSuccessCallback = function(sessionDescription) {
		traceVC('LocalDescription...');
		
		self.pc.setLocalDescription(sessionDescription,
                                
                                function onSuccess() {
                                  traceVC('LocalDescription success');
                                  self.localSessionDescription = sessionDescription;
                                  
                                  // ICE gathering starts work here
                                  if (sessionDescription.type === 'offer')
                                    self.sendCallRequest();
                                  else if (sessionDescription.type === 'answer')
                                    self.sendAceptRequest();
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
		
		self._state = QBVideoChatState.ESTABLISHING;
		sessionDescription = new RTCSessionDescription({sdp: descriptionSDP, type: descriptionType});
		
		self.pc.setRemoteDescription(sessionDescription,
                                 
                                 function onSuccess() {
                                   traceVC("RemoteDescription success");
                                   
                                   if (sessionDescription.type === 'offer')
                                     self.pc.createAnswer(self.onGetSessionDescriptionSuccessCallback, self.onCreateAnswerFailureCallback, SDP_CONSTRAINTS);
                                 },
                                 
                                 function onError(error) {
                                   traceVC('RemoteDescription error: ' + JSON.stringify(error));
                                 }
		);
		
		// send candidates
		for (var i = 0; i < self._candidatesQueue.length; i++) {
			candidate = self._candidatesQueue.pop();
			self.signaling.sendCandidate(self.opponentID, candidate, self.sessionID, self.opponentUsername);
		}
	};
	
	this.onCreateAnswerFailureCallback = function(error) {
		traceVC('createAnswer() error: ' + JSON.stringify(error));
	};
	
	this.sendCallRequest = function() {
		// Send only string representation of sdp
		// http://www.w3.org/TR/webrtc/#rtcsessiondescription-class
	
		self.signaling.call(self.opponentID, self.localSessionDescription.sdp, self.sessionID, self.opponentUsername, self.opponentAvatar);
	};
	
	this.sendAceptRequest = function() {
		// Send only string representation of sdp
		// http://www.w3.org/TR/webrtc/#rtcsessiondescription-class
	
		self.signaling.accept(self.opponentID, self.localSessionDescription.sdp, self.sessionID, self.opponentUsername);
	};

	// Cleanup 
	this.hangup = function() {
		self._state = QBVideoChatState.INACTIVE;
		self.signaling = null;
		self.localStream.stop();
		self.pc.close();
		self.pc = null;
	};
	
	// helpers
	this._xmppTextToDictionary = function(data) {
		return $.parseJSON(QBChatHelpers.xmlunescape(data));
	};
	
	this._xmppDictionaryToText = function(data) {
		return JSON.stringify(data);
	};
}

function traceVC(text) {
	console.log("[qb_videochat]: " + text);
}

/* Public methods
----------------------------------------------------------*/
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
	this.signaling.reject(userID, this.sessionID, userName);
};

// Stop call with user
QBVideoChat.prototype.stop = function(userID, userName) {
	this.signaling.stop(userID, "manual", this.sessionID, userName);
};
