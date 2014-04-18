/**
 * QuickBlox VideoChat WebRTC signaling library
 * version 0.2.1
 *
 * Authors: Igor Khomenko (igor@quickblox.com), Andrey Povelichenko (andrey.povelichenko@quickblox.com)
 *
 */

// Browserify dependencies
require('../libs/strophe');
var config = require('./config');

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

function QBVideoChatSignaling(appID, chatServer, connection) {
	var _this = this;
	
	this.onCallCallback = null;
 	this.onAcceptCallback = null;
 	this.onRejectCallback = null;
	this.onStopCallback = null;
	
	this.onInnerAcceptCallback = null;
 	this.onCandidateCallback = null;
 	
 	this.appID = appID;
 	this.chatServer = chatServer;
 	this.connection = connection;
 	
	this.onMessage = function(msg) {
		var author, type, body;
		var qbID, sessionID, name, avatar;
		
		author = $(msg).attr('from');
		type = $(msg).attr('type');
		body = $(msg).find('body')[0].textContent;
		sessionID = $(msg).find('session')[0].textContent;
		name = $(msg).find('full_name')[0].textContent;
		avatar = $(msg).find('avatar')[0] && $(msg).find('avatar')[0].textContent;
		
		qbID = _this.getIDFromNode(author);
		
		switch (type) {
		case QBSignalingType.CALL:
			traceS('onCall from ' + qbID);
			_this.onCallCallback(qbID, body, sessionID, name, avatar);
			break;
		case QBSignalingType.ACCEPT:
			traceS('onAccept from ' + qbID);
			_this.onAcceptCallback(qbID);
			_this.onInnerAcceptCallback(body);
			break;
		case QBSignalingType.REJECT:
			traceS('onReject from ' + qbID);
			_this.onRejectCallback(qbID);
			break;
		case QBSignalingType.STOP:
			traceS('onStop from ' + qbID);
			_this.onStopCallback(qbID, body);
			break;
		case QBSignalingType.CANDIDATE:
			_this.onCandidateCallback(body);
			break;
		}
		
		return true;
	};
	
	this.sendMessage = function(userID, signalingType, data, sessionID, userName, userAvatar, callType) {
		var reply, params, opponentJID = _this.getJID(userID);
		
		params = {
			to: opponentJID,
			from: _this.connection.jid,
			type: signalingType
		};
		
		reply = $msg(params).c('body').t(data).up().c('extraParams')
		                                           .c('session').t(sessionID).up()
		                                           .c('full_name').t(userName).up();
		if (userAvatar)
			reply.c('avatar').t(userAvatar).up();
		if (callType)
			reply.c('callType').t(callType);
		_this.connection.send(reply);
	};
	
	// set WebRTC callbacks
	$(Object.keys(QBSignalingType)).each(function() {
		_this.connection.addHandler(_this.onMessage, null, 'message', QBSignalingType[this], null, null);
	});
	
	// helpers
	this.getJID = function(id) {
		return id + "-" + _this.appID + "@" + _this.chatServer;
	};
	
	this.getIDFromNode = function(jid) {
		return Strophe.getNodeFromJid(jid).split('-')[0];
	};
	
	this.xmppTextToDictionary = function(data) {
		//return $.parseJSON(Strophe.unescapeNode(data));
		return $.parseJSON(Strophe.xmlunescape(data));
	};
	
	this.xmppDictionaryToText = function(data) {
		//return Strophe.escapeNode(JSON.stringify(data));
		return JSON.stringify(data);
	};
}

QBVideoChatSignaling.prototype.call = function(userID, sessionDescription, sessionID, userName, userAvatar) {
	traceS('call to ' + userID);
	this.sendMessage(userID, QBSignalingType.CALL, sessionDescription, sessionID, userName, userAvatar, QBCallType.VIDEO_AUDIO);
};

QBVideoChatSignaling.prototype.accept = function(userID, sessionDescription, sessionID, userName) {
	traceS('accept ' + userID);
	this.sendMessage(userID, QBSignalingType.ACCEPT, sessionDescription, sessionID, userName);
};

QBVideoChatSignaling.prototype.reject = function(userID, sessionID, userName) {
	traceS('reject ' + userID);
	this.sendMessage(userID, QBSignalingType.REJECT, null, sessionID, userName);
};

QBVideoChatSignaling.prototype.stop = function(userID, reason, sessionID, userName) {
	traceS('stop ' + userID);
	this.sendMessage(userID, QBSignalingType.STOP, reason, sessionID, userName);
};

QBVideoChatSignaling.prototype.sendCandidate = function(userID, candidate, sessionID, userName) {
	this.sendMessage(userID, QBSignalingType.CANDIDATE, candidate, sessionID, userName);
};

function traceS(text) {
	console.log("[qb_videochat_signalling]: " + text);
}

module.exports = QBVideoChatSignaling;
