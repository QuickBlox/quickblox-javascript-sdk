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
QBSignaling.prototype.call = function(opponentID, sessionDescription, sessionID, userName, userAvatar) {
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

QBSignaling.prototype.accept = function(opponentID, sessionDescription, sessionID, userName) {
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

QBSignaling.prototype.reject = function(opponentID, sessionID, userName) {
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

QBSignaling.prototype.stop = function(opponentID, sessionID, userName) {
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

QBSignaling.prototype.sendCandidate = function(opponentID, candidate, sessionID) {
	var extraParams = {
		opponentID: opponentID,
		signalingType: QBSignalingType.CANDIDATE,
		sessionID: sessionID,
		candidate: candidate,
	};
	this._sendMessage(extraParams);
};
