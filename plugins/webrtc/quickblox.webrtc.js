(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* 
 * QuickBlox JavaScript SDK / WebRTC Videochat plugin
 *
 * Configuration module
 *
 */

var config = {
	iceServers: [
		{urls: "stun:stun.l.google.com:19302"},
		{urls: "turn:turnserver.quickblox.com:3478?transport=udp", username: "", credential: ""},
		{urls: "turn:turnserver.quickblox.com:3478?transport=tcp", username: "", credential: ""}
	]
};

// Other public ICE Servers
/*
		'stun:stun01.sipphone.com',
		'stun:stun.ekiga.net',
		'stun:stun.fwdnet.net',
		'stun:stun.ideasip.com',
		'stun:stun.iptel.org',
		'stun:stun.rixtelecom.se',
		'stun:stun.schlund.de',
		'stun:stun.l.google.com:19302',
		'stun:stun1.l.google.com:19302',
		'stun:stun2.l.google.com:19302',
		'stun:stun3.l.google.com:19302',
		'stun:stun4.l.google.com:19302',
		'stun:stunserver.org',
		'stun:stun.softjoys.com',
		'stun:stun.voiparound.com',
		'stun:stun.voipbuster.com',
		'stun:stun.voipstunt.com',
		'stun:stun.voxgratia.org',
		'stun:stun.xten.com',
{
    url: 'turn:numb.viagenie.ca',
    credential: 'muazkh',
    username: 'webrtc@live.com'
},
{
    url: 'turn:192.158.29.39:3478?transport=udp',
    credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
    username: '28224511:1379330808'
},
{
    url: 'turn:192.158.29.39:3478?transport=tcp',
    credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
    username: '28224511:1379330808'
}*/

module.exports = config;

},{}],2:[function(require,module,exports){
/**
 * QuickBlox VideoChat WebRTC signaling library
 * 
 */

// Browserify exports
module.exports = QBVideoChatSignaling;

var QBSignalingType = {
	CALL: 'qbvideochat_call',
	ACCEPT: 'qbvideochat_acceptCall',
	REJECT: 'qbvideochat_rejectCall',
	STOP: 'qbvideochat_stopCall',
	CANDIDATE: 'qbvideochat_candidate',
	PARAMETERS_CHANGED: 'qbvideochat_callParametersChanged'
};

var QBCallType = {
	VIDEO: '1',
	AUDIO: '2'
};

var QBStopReason = {
	MANUALLY: 'kStopVideoChatCallStatus_Manually',
	BAD_CONNECTION: 'kStopVideoChatCallStatus_BadConnection',
	CANCEL: 'kStopVideoChatCallStatus_Cancel',
	NOT_ANSWER: 'kStopVideoChatCallStatus_OpponentDidNotAnswer'
};

function QBVideoChatSignaling(chatService, params) {
	var self = this;
	
	if (params) {
		this._debug = params.debug || null;
		
		// set user callbacks
		this._callbacks = {
			onCallCallback: params.onCallCallback || null,
			onAcceptCallback: params.onAcceptCallback || null,
			onRejectCallback: params.onRejectCallback || null,
			onStopCallback: params.onStopCallback || null,
			onInnerAcceptCallback: null,
			onCandidateCallback: null
		};
	}
 	
	this._onMessage = function(msg) {
		var author, signalingType, sessionID;
		var sessionDescription, candidate = {};
		var qbID, name, avatar;
		
		author = $(msg).attr('from');
		signalingType = $(msg).find('videochat_signaling_type')[0].textContent;
		sessionID = $(msg).find('sessionID')[0].textContent;
		
		sessionDescription = $(msg).find('sdp')[0] && $(msg).find('sdp')[0].textContent;
		candidate.sdpMLineIndex = $(msg).find('sdpMLineIndex')[0] && $(msg).find('sdpMLineIndex')[0].textContent;
		candidate.candidate = $(msg).find('candidate')[0] && $(msg).find('candidate')[0].textContent;
		candidate.sdpMid = $(msg).find('sdpMid')[0] && $(msg).find('sdpMid')[0].textContent;
		
		// custom parameters
		name = $(msg).find('full_name')[0] && $(msg).find('full_name')[0].textContent;
		avatar = $(msg).find('avatar')[0] && $(msg).find('avatar')[0].textContent;
		
		qbID = QBChatHelpers.getIDFromNode(author);
		
		switch (signalingType) {
		case QBSignalingType.CALL:
			traceS('onCall from ' + qbID);
			self._callbacks.onCallCallback(qbID, sessionDescription, sessionID, name, avatar);
			break;
		case QBSignalingType.ACCEPT:
			traceS('onAccept from ' + qbID);
			self._callbacks.onAcceptCallback(qbID);
			self._callbacks.onInnerAcceptCallback(sessionDescription);
			break;
		case QBSignalingType.REJECT:
			traceS('onReject from ' + qbID);
			self._callbacks.onRejectCallback(qbID);
			break;
		case QBSignalingType.STOP:
			traceS('onStop from ' + qbID);
			self._callbacks.onStopCallback(qbID);
			break;
		case QBSignalingType.CANDIDATE:
			self._callbacks.onCandidateCallback(candidate);
			break;
		case QBSignalingType.PARAMETERS_CHANGED:
			//self._callbacks.onCandidateCallback(body);
			break;
		}
		
		return true;
	};
	
	this._sendMessage = function(extraParams) {
		var reply, params;
		
		params = {
			to: QBChatHelpers.getJID(extraParams.opponentID),
			from: chatService._connection.jid,
			type: 'headline'
		};
		
		reply = $msg(params).c('extraParams', {xmlns: Strophe.NS.CLIENT})
		                    .c('videochat_signaling_type').t(extraParams.signalingType).up()
		                    .c('sessionID').t(extraParams.sessionID).up();
		
		if (extraParams.callType)
			reply.c('callType').t(extraParams.callType).up();
		if (extraParams.sdp)
			reply.c('sdp').t(extraParams.sdp).up();
		if (extraParams.platform)
			reply.c('platform').t(extraParams.platform).up();
		if (extraParams.deviceOrientation)
			reply.c('device_orientation').t(extraParams.deviceOrientation).up();
		if (extraParams.status)
			reply.c('status').t(extraParams.status).up();
		if (extraParams.candidate) {
			reply.c('sdpMLineIndex').t(extraParams.candidate.sdpMLineIndex).up();
			reply.c('candidate').t(extraParams.candidate.candidate).up();
			reply.c('sdpMid').t(extraParams.candidate.sdpMid).up();
		}
		
		// custom parameters
		if (extraParams.userName)
			reply.c('full_name').t(extraParams.userName).up();
		if (extraParams.userAvatar)
			reply.c('avatar').t(extraParams.userAvatar).up();
		
		chatService._connection.send(reply);
	};
	
	// set WebRTC callbacks
	chatService._connection.addHandler(self._onMessage, null, 'message', 'headline');
}

function traceS(text) {
	console.log("[qb_videochat_signalling]: " + text);
}

/* Public methods
----------------------------------------------------------*/
QBVideoChatSignaling.prototype.call = function(opponentID, sessionDescription, sessionID, userName, userAvatar) {
	traceS('call to ' + opponentID);
	var extraParams = {
		opponentID: opponentID,
		signalingType: QBSignalingType.CALL,
		sessionID: sessionID,
		callType: QBCallType.VIDEO,
		sdp: sessionDescription,
		platform: 'web',
		deviceOrientation: 'portrait',
		
		// custom parameters
		userName: userName,
		userAvatar: userAvatar
	};
	this._sendMessage(extraParams);
};

QBVideoChatSignaling.prototype.accept = function(opponentID, sessionDescription, sessionID, userName) {
	traceS('accept ' + opponentID);
	var extraParams = {
		opponentID: opponentID,
		signalingType: QBSignalingType.ACCEPT,
		sessionID: sessionID,
		sdp: sessionDescription,
		platform: 'web',
		deviceOrientation: 'portrait',
		
		// custom parameters
		userName: userName
	};
	this._sendMessage(extraParams);
};

QBVideoChatSignaling.prototype.reject = function(opponentID, sessionID, userName) {
	traceS('reject ' + opponentID);
	var extraParams = {
		opponentID: opponentID,
		signalingType: QBSignalingType.REJECT,
		sessionID: sessionID,
		
		// custom parameters
		userName: userName
	};
	this._sendMessage(extraParams);
};

QBVideoChatSignaling.prototype.stop = function(opponentID, sessionID, userName) {
	traceS('stop ' + opponentID);
	var extraParams = {
		opponentID: opponentID,
		signalingType: QBSignalingType.STOP,
		sessionID: sessionID,
		status: QBStopReason.MANUALLY,
		
		// custom parameters
		userName: userName
	};
	this._sendMessage(extraParams);
};

QBVideoChatSignaling.prototype.sendCandidate = function(opponentID, candidate, sessionID) {
	var extraParams = {
		opponentID: opponentID,
		signalingType: QBSignalingType.CANDIDATE,
		sessionID: sessionID,
		candidate: candidate,
	};
	this._sendMessage(extraParams);
};

},{}],3:[function(require,module,exports){
/**
 * QuickBlox VideoChat WebRTC library
 *
 */

// Browserify dependencies
var adapter = require('../libs/adapter');
var pcConfig = require('./config');
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
 	
 	this.version = '0.5.1';
 	
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
		var candidate;
		
		candidate = new adapter.RTCIceCandidate(data);
		self.pc.addIceCandidate(candidate);
	};
	
	this.signaling = signaling;
	this.signaling._callbacks.onInnerAcceptCallback = this.onAcceptSignalingCallback;
	this.signaling._callbacks.onCandidateCallback = this.addCandidate;
	
	// MediaStream getUserMedia
	this.getUserMedia = function() {
		traceVC("getUserMedia...");
		
		adapter.getUserMedia(self.constraints, successCallback, errorCallback);
		
		function successCallback(localMediaStream) {
			traceVC("getUserMedia success");
			self.localStream = localMediaStream;
			self.createRTCPeerConnection();
			self._callbacks.onGetUserMediaSuccess();
		}
		
		function errorCallback(error) {
			traceVC("getUserMedia error: " + JSON.stringify(error));
			self._callbacks.onGetUserMediaError();
		}
	};
	
	// MediaStream attachMedia
	this.attachMediaStream = function(elem, stream) {
		adapter.attachMediaStream(elem, stream);
	}
	
	// MediaStream reattachMedia
	this.reattachMediaStream = function(to, from) {
		adapter.reattachMediaStream(to, from);
	}
	
	// RTCPeerConnection creation
	this.createRTCPeerConnection = function() {
		traceVC("RTCPeerConnection...");
		try {
			self.pc = new adapter.RTCPeerConnection(pcConfig, PC_CONSTRAINTS);
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
		var candidate = event.candidate;
		
		if (candidate) {
			if (self._state == QBVideoChatState.INACTIVE)
				self._candidatesQueue.push(candidate);
			else {
				// Send ICE candidate to opponent
				self.signaling.sendCandidate(self.opponentID, candidate, self.sessionID);
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
		sessionDescription = new adapter.RTCSessionDescription({sdp: descriptionSDP, type: descriptionType});
		
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
			self.signaling.sendCandidate(self.opponentID, candidate, self.sessionID);
		}
	};
	
	this.onCreateAnswerFailureCallback = function(error) {
		traceVC('createAnswer() error: ' + JSON.stringify(error));
	};
	
	this.sendCallRequest = function() {
		// Send only string representation of sdp
		// http://www.w3.org/TR/webrtc/#rtcsessiondescription-class
	
		self.signaling.call(self.opponentID, self.localSessionDescription.sdp, self.sessionID, self.myUsername, self.myAvatar);
	};
	
	this.sendAceptRequest = function() {
		// Send only string representation of sdp
		// http://www.w3.org/TR/webrtc/#rtcsessiondescription-class
	
		self.signaling.accept(self.opponentID, self.localSessionDescription.sdp, self.sessionID, self.myUsername);
	};

	// Cleanup 
	this.hangup = function() {
		self._state = QBVideoChatState.INACTIVE;
		self.signaling = null;
		self.localStream.stop();
		self.pc.close();
		self.pc = null;
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
		this.myUsername = userName;
		this.myAvatar = userAvatar;
		this.pc.createOffer(this.onGetSessionDescriptionSuccessCallback, this.onCreateOfferFailureCallback, SDP_CONSTRAINTS);
	}
};

// Accept call from user 
QBVideoChat.prototype.accept = function(userID, userName) {
	this.opponentID = userID;
	this.myUsername = userName;
	this.setRemoteDescription(this.remoteSessionDescription, "offer");
};

// Reject call from user
QBVideoChat.prototype.reject = function(userID, userName) {
	this.signaling.reject(userID, this.sessionID, userName);
};

// Stop call with user
QBVideoChat.prototype.stop = function(userID, userName) {
	this.signaling.stop(userID, this.sessionID, userName);
};

},{"../libs/adapter":4,"./config":1,"./qbSignalling":2}],4:[function(require,module,exports){
var RTCPeerConnection = null;
var getUserMedia = null;
var attachMediaStream = null;
var reattachMediaStream = null;
var webrtcDetectedBrowser = null;
var webrtcDetectedVersion = null;

function trace(text) {
  // This function is used for logging.
  if (text[text.length - 1] == '\n') {
    text = text.substring(0, text.length - 1);
  }
  console.log((performance.now() / 1000).toFixed(3) + ": " + text);
}
function maybeFixConfiguration(pcConfig) {
  if (pcConfig == null) {
    return;
  }
  for (var i = 0; i < pcConfig.iceServers.length; i++) {
    if (pcConfig.iceServers[i].hasOwnProperty('urls')){
      pcConfig.iceServers[i]['url'] = pcConfig.iceServers[i]['urls'];
      delete pcConfig.iceServers[i]['urls'];
    }
  }
}

if (navigator.mozGetUserMedia) {
  //console.log("This appears to be Firefox");

  webrtcDetectedBrowser = "firefox";

  webrtcDetectedVersion =
           parseInt(navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1], 10);

  // The RTCPeerConnection object.
  var RTCPeerConnection = function(pcConfig, pcConstraints) {
    // .urls is not supported in FF yet.
    maybeFixConfiguration(pcConfig);
    return new mozRTCPeerConnection(pcConfig, pcConstraints);
  }

  // The RTCSessionDescription object.
  RTCSessionDescription = mozRTCSessionDescription;

  // The RTCIceCandidate object.
  RTCIceCandidate = mozRTCIceCandidate;

  // Get UserMedia (only difference is the prefix).
  // Code from Adam Barth.
  getUserMedia = navigator.mozGetUserMedia.bind(navigator);
  navigator.getUserMedia = getUserMedia;

  // Creates iceServer from the url for FF.
  createIceServer = function(url, username, password) {
    var iceServer = null;
    var url_parts = url.split(':');
    if (url_parts[0].indexOf('stun') === 0) {
      // Create iceServer with stun url.
      iceServer = { 'url': url };
    } else if (url_parts[0].indexOf('turn') === 0) {
      if (webrtcDetectedVersion < 27) {
        // Create iceServer with turn url.
        // Ignore the transport parameter from TURN url for FF version <=27.
        var turn_url_parts = url.split("?");
        // Return null for createIceServer if transport=tcp.
        if (turn_url_parts.length === 1 ||
            turn_url_parts[1].indexOf('transport=udp') === 0) {
          iceServer = {'url': turn_url_parts[0],
                       'credential': password,
                       'username': username};
        }
      } else {
        // FF 27 and above supports transport parameters in TURN url,
        // So passing in the full url to create iceServer.
        iceServer = {'url': url,
                     'credential': password,
                     'username': username};
      }
    }
    return iceServer;
  };

  createIceServers = function(urls, username, password) {
    var iceServers = [];
    // Use .url for FireFox.
    for (i = 0; i < urls.length; i++) {
      var iceServer = createIceServer(urls[i],
                                      username,
                                      password);
      if (iceServer !== null) {
        iceServers.push(iceServer);
      }
    }
    return iceServers;
  }

  // Attach a media stream to an element.
  attachMediaStream = function(element, stream) {
    //console.log("Attaching media stream");
    element.mozSrcObject = stream;
    element.play();
  };

  reattachMediaStream = function(to, from) {
    //console.log("Reattaching media stream");
    to.mozSrcObject = from.mozSrcObject;
    to.play();
  };

  // Fake get{Video,Audio}Tracks
  if (!MediaStream.prototype.getVideoTracks) {
    MediaStream.prototype.getVideoTracks = function() {
      return [];
    };
  }

  if (!MediaStream.prototype.getAudioTracks) {
    MediaStream.prototype.getAudioTracks = function() {
      return [];
    };
  }
} else if (navigator.webkitGetUserMedia) {
  //console.log("This appears to be Chrome");

  webrtcDetectedBrowser = "chrome";
  webrtcDetectedVersion =
         parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2], 10);

  // Creates iceServer from the url for Chrome M33 and earlier.
  createIceServer = function(url, username, password) {
    var iceServer = null;
    var url_parts = url.split(':');
    if (url_parts[0].indexOf('stun') === 0) {
      // Create iceServer with stun url.
      iceServer = { 'url': url };
    } else if (url_parts[0].indexOf('turn') === 0) {
      // Chrome M28 & above uses below TURN format.
      iceServer = {'url': url,
                   'credential': password,
                   'username': username};
    }
    return iceServer;
  };

  // Creates iceServers from the urls for Chrome M34 and above.
  createIceServers = function(urls, username, password) {
    var iceServers = [];
    if (webrtcDetectedVersion >= 34) {
      // .urls is supported since Chrome M34.
      iceServers = {'urls': urls,
                    'credential': password,
                    'username': username };
    } else {
      for (i = 0; i < urls.length; i++) {
        var iceServer = createIceServer(urls[i],
                                        username,
                                        password);
        if (iceServer !== null) {
          iceServers.push(iceServer);
        }
      }
    }
    return iceServers;
  };

  // The RTCPeerConnection object.
  var RTCPeerConnection = function(pcConfig, pcConstraints) {
    // .urls is supported since Chrome M34.
    if (webrtcDetectedVersion < 34) {
      maybeFixConfiguration(pcConfig);
    }
    return new webkitRTCPeerConnection(pcConfig, pcConstraints);
  }

  // Get UserMedia (only difference is the prefix).
  // Code from Adam Barth.
  getUserMedia = navigator.webkitGetUserMedia.bind(navigator);
  navigator.getUserMedia = getUserMedia;

  // Attach a media stream to an element.
  attachMediaStream = function(element, stream) {
    if (typeof element.srcObject !== 'undefined') {
      element.srcObject = stream;
    } else if (typeof element.mozSrcObject !== 'undefined') {
      element.mozSrcObject = stream;
    } else if (typeof element.src !== 'undefined') {
      element.src = URL.createObjectURL(stream);
    } else {
      console.log('Error attaching stream to element.');
    }
  };

  reattachMediaStream = function(to, from) {
    to.src = from.src;
  };
} else {
  console.log("Browser does not appear to be WebRTC-capable");
}

// Browserify exports
module.exports.RTCPeerConnection = RTCPeerConnection;
module.exports.getUserMedia = getUserMedia;
module.exports.attachMediaStream = attachMediaStream;
module.exports.reattachMediaStream = reattachMediaStream;
module.exports.RTCSessionDescription = RTCSessionDescription;
module.exports.RTCIceCandidate = RTCIceCandidate;

},{}]},{},[3])