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
		
		extraParams = $(stanza).find('extraParams')[0];
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
