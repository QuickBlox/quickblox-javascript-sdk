/**
 * QuickBlox VideoChat WebRTC signaling library
 * 
 */

/*
  Public methods:
    - call(userID, sessionDescription, sessionID, userName, userAvatar)
    - accept(userID, sessionDescription, sessionID, userName)
    - reject(userID, sessionID, userName)
    - stop(userID, reason, sessionID, userName)
    - sendCandidate(userID, candidate, sessionID, userName)
  
  Public callbacks:
    - onCall(fromUserID, sessionDescription, sessionID, fromUserAvatar)
    - onAccept(fromUserID)
    - onReject(fromUserID)
    - onStop(fromUserID, reason)
    - onInnerAccept(sessionDescription)
    - onCandidate(candidate)
 */

// Browserify exports
module.exports = QBVideoChatSignaling;

var QBSignalingType = {
	CALL: 'qbvideochat_call',
	ACCEPT: 'qbvideochat_acceptCall',
	REJECT: 'qbvideochat_rejectCall',
	STOP: 'qbvideochat_stopCall',
	CANDIDATE: 'qbvideochat_candidate'
};

var QBCallType = {
	VIDEO_AUDIO: 'VIDEO_AUDIO',
    AUDIO: 'AUDIO'
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
		var author, type, body;
		var qbID, sessionID, name, avatar;
		
		author = $(msg).attr('from');
		type = $(msg).attr('type');
		body = $(msg).find('body')[0].textContent;
		sessionID = $(msg).find('session')[0].textContent;
		name = $(msg).find('full_name')[0].textContent;
		avatar = $(msg).find('avatar')[0] && $(msg).find('avatar')[0].textContent;
		
		qbID = QBChatHelpers.getIDFromNode(author);
		
		switch (type) {
		case QBSignalingType.CALL:
			traceS('onCall from ' + qbID);
			self._callbacks.onCallCallback(qbID, body, sessionID, name, avatar);
			break;
		case QBSignalingType.ACCEPT:
			traceS('onAccept from ' + qbID);
			self._callbacks.onAcceptCallback(qbID);
			self._callbacks.onInnerAcceptCallback(body);
			break;
		case QBSignalingType.REJECT:
			traceS('onReject from ' + qbID);
			self._callbacks.onRejectCallback(qbID);
			break;
		case QBSignalingType.STOP:
			traceS('onStop from ' + qbID);
			self._callbacks.onStopCallback(qbID, body);
			break;
		case QBSignalingType.CANDIDATE:
			self._callbacks.onCandidateCallback(body);
			break;
		}
		
		return true;
	};
	
	this._sendMessage = function(userID, signalingType, data, sessionID, userName, userAvatar, callType) {
		var reply, params, opponentJID = QBChatHelpers.getJID(userID);
		
		params = {
			to: opponentJID,
			from: chatService._connection.jid,
			type: signalingType
		};
		
		reply = $msg(params).c('body').t(data).up().c('extraParams')
		                                           .c('session').t(sessionID).up()
		                                           .c('full_name').t(userName).up();
		if (userAvatar)
			reply.c('avatar').t(userAvatar).up();
		if (callType)
			reply.c('callType').t(callType);
			
		chatService._connection.send(reply);
	};
	
	// set WebRTC callbacks
	$(Object.keys(QBSignalingType)).each(function() {
		chatService._connection.addHandler(self._onMessage, null, 'message', QBSignalingType[this]);
	});
}

function traceS(text) {
	console.log("[qb_videochat_signalling]: " + text);
}

/* Public methods
----------------------------------------------------------*/
QBVideoChatSignaling.prototype.call = function(userID, sessionDescription, sessionID, userName, userAvatar) {
	traceS('call to ' + userID);
	this._sendMessage(userID, QBSignalingType.CALL, sessionDescription, sessionID, userName, userAvatar, QBCallType.VIDEO_AUDIO);
};

QBVideoChatSignaling.prototype.accept = function(userID, sessionDescription, sessionID, userName) {
	traceS('accept ' + userID);
	this._sendMessage(userID, QBSignalingType.ACCEPT, sessionDescription, sessionID, userName);
};

QBVideoChatSignaling.prototype.reject = function(userID, sessionID, userName) {
	traceS('reject ' + userID);
	this._sendMessage(userID, QBSignalingType.REJECT, null, sessionID, userName);
};

QBVideoChatSignaling.prototype.stop = function(userID, reason, sessionID, userName) {
	traceS('stop ' + userID);
	this._sendMessage(userID, QBSignalingType.STOP, reason, sessionID, userName);
};

QBVideoChatSignaling.prototype.sendCandidate = function(userID, candidate, sessionID, userName) {
	this._sendMessage(userID, QBSignalingType.CANDIDATE, candidate, sessionID, userName);
};
