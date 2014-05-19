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
module.exports = QBSignaling;

var QBSignalingType = {
	CALL: 'qbvideochat_call',
	ACCEPT: 'qbvideochat_acceptCall',
	REJECT: 'qbvideochat_rejectCall',
	STOP: 'qbvideochat_stopCall',
	CANDIDATE: 'qbvideochat_candidate',
	PARAMETERS_CHANGED: 'qbvideochat_callParametersChanged'
};

function QBSignaling(chatService, params) {
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
		var author, qbID;
		var extraParams, extension = {};
		
		author = $(msg).attr('from');
		qbID = QBChatHelpers.getIDFromNode(author);
		
		extraParams = $(msg).find('extraParams')[0];
		$(extraParams.childNodes).each(function() {
			extension[$(this).context.tagName] = $(this).context.textContent;
		});
		
		switch (extension.videochat_signaling_type) {
		case QBSignalingType.CALL:
			traceS('onCall from ' + qbID);
			self._callbacks.onCallCallback(qbID, extension);
			break;
		case QBSignalingType.ACCEPT:
			traceS('onAccept from ' + qbID);
			self._callbacks.onAcceptCallback(qbID, extension);
			self._callbacks.onInnerAcceptCallback(extension.sdp);
			break;
		case QBSignalingType.REJECT:
			traceS('onReject from ' + qbID);
			self._callbacks.onRejectCallback(qbID, extension);
			break;
		case QBSignalingType.STOP:
			traceS('onStop from ' + qbID);
			self._callbacks.onStopCallback(qbID, extension);
			break;
		case QBSignalingType.CANDIDATE:
			self._callbacks.onCandidateCallback({
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
	
	this._sendMessage = function(opponentID, extraParams) {
		var reply, params;
		
		params = {
			to: QBChatHelpers.getJID(opponentID),
			from: chatService._connection.jid,
			type: 'headline'
		};
		
		reply = $msg(params).c('extraParams', {
			xmlns: Strophe.NS.CLIENT
		});
		
		$(Object.keys(extraParams)).each(function() {
			reply.c(this).t(extraParams[this]).up();
		});
		
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
QBSignaling.prototype.call = function(opponentID, sessionDescription, sessionID, extraParams) {
	traceS('call to ' + opponentID);
	extraParams = extraParams || {};
	
	extraParams.videochat_signaling_type = QBSignalingType.CALL;
	extraParams.sessionID = sessionID;
	extraParams.sdp = sessionDescription;
	extraParams.platform = 'web';
	extraParams.device_orientation = 'portrait';
	
	this._sendMessage(opponentID, extraParams);
};

QBSignaling.prototype.accept = function(opponentID, sessionDescription, sessionID, extraParams) {
	traceS('accept ' + opponentID);
	extraParams = extraParams || {};
	
	extraParams.videochat_signaling_type = QBSignalingType.ACCEPT;
	extraParams.sessionID = sessionID;
	extraParams.sdp = sessionDescription;
	extraParams.platform = 'web';
	extraParams.device_orientation = 'portrait';
	
	this._sendMessage(opponentID, extraParams);
};

QBSignaling.prototype.reject = function(opponentID, sessionID, extraParams) {
	traceS('reject ' + opponentID);
	extraParams = extraParams || {};
	
	extraParams.videochat_signaling_type = QBSignalingType.REJECT;
	extraParams.sessionID = sessionID;
	
	this._sendMessage(opponentID, extraParams);
};

QBSignaling.prototype.stop = function(opponentID, sessionID, extraParams) {
	traceS('stop ' + opponentID);
	extraParams = extraParams || {};
	
	extraParams.videochat_signaling_type = QBSignalingType.STOP;
	extraParams.sessionID = sessionID;
	
	this._sendMessage(opponentID, extraParams);
};

QBSignaling.prototype.sendCandidate = function(opponentID, candidate, sessionID) {
	var extraParams = {
		videochat_signaling_type: QBSignalingType.CANDIDATE,
		sessionID: sessionID,
		sdpMLineIndex: candidate.sdpMLineIndex,
		candidate: candidate.candidate,
		sdpMid: candidate.sdpMid
	};
	
	this._sendMessage(opponentID, extraParams);
};

},{}],3:[function(require,module,exports){
/**
 * QuickBlox VideoChat WebRTC library
 *
 */

// Browserify dependencies
var adapter = require('../libs/adapter');
var pcConfig = require('./config');
var QBSignaling = require('./qbSignaling');

window.QBSignaling = QBSignaling;
window.QBVideoChat = QBVideoChat;

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

function QBVideoChat(signaling, params) {
 	var self = this;
 	
 	this.version = '0.6.1';
 	this.stopReason = QBStopReason;
 	
	this._state = QBVideoChatState.INACTIVE;
	this._candidatesQueue = [];
	this.localStreamElement = null;
	this.remoteStreamElement = null;
	
	if (params) {
		this._debug = params.debug || null;
		
		this.sessionID = params.sessionID || new Date().getTime();
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
	
		self.signaling.call(self.opponentID, self.localSessionDescription.sdp, self.sessionID, self.extraParams);
	};
	
	this.sendAceptRequest = function() {
		// Send only string representation of sdp
		// http://www.w3.org/TR/webrtc/#rtcsessiondescription-class
	
		self.signaling.accept(self.opponentID, self.localSessionDescription.sdp, self.sessionID, self.extraParams);
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
QBVideoChat.prototype.call = function(userID, extraParams) {
	if (this.localSessionDescription) {
		this.sendCallRequest();
	} else {
		this.opponentID = userID;
		this.extraParams = extraParams;
		
		this.pc.createOffer(this.onGetSessionDescriptionSuccessCallback, this.onCreateOfferFailureCallback, SDP_CONSTRAINTS);
	}
};

// Accept call from user 
QBVideoChat.prototype.accept = function(userID, extraParams) {
	this.opponentID = userID;
	this.extraParams = extraParams;
	this.setRemoteDescription(this.remoteSessionDescription, "offer");
};

// Reject call from user
QBVideoChat.prototype.reject = function(userID, extraParams) {
	this.signaling.reject(userID, this.sessionID, extraParams);
};

// Stop call with user
QBVideoChat.prototype.stop = function(userID, extraParams) {
	this.signaling.stop(userID, this.sessionID, extraParams);
};

},{"../libs/adapter":4,"./config":1,"./qbSignaling":2}],4:[function(require,module,exports){
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