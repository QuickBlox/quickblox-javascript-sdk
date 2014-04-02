/*
 * QuickBlox JavaScript SDK / XMPP Chat plugin
 *
 * Chat module
 *
 */

// Browserify dependencies
require('../libs/strophe');
require('../libs/strophe.muc');
require('../libs/strophe.chatstates');
var config = require('./config');
var QBChatHelpers = require('./qbChatHelpers');

window.QBChat = QBChat;
window.QBChatHelpers = QBChatHelpers;

function QBChat(params) {
	var _this = this;
	
	this.config = config;
	
	// create Strophe Connection object
	this.connection = new Strophe.Connection(config.bosh);
	
	// set user callbacks
	if (params) {
		this.onConnectFailed = params.onConnectFailed || null;
		this.onConnectSuccess = params.onConnectSuccess || null;
		this.onConnectClosed = params.onConnectClosed || null;
		this.onChatMessage = params.onChatMessage || null;
		this.onMUCPresence = params.onMUCPresence || null;
		this.onMUCRoster = params.onMUCRoster || null;
		
		// logs
		if (params.debug) {
			this.connection.rawInput = function(data) {console.log('RECV: ' + data)};
			this.connection.rawOutput = function(data) {console.log('SENT: ' + data)};
		}
	}
	
	this.onMessage = function(stanza, room) {
		var senderJID, type, time, message, nick;
		
		if (params && params.debug) {
			traceChat('Message');
			console.log(stanza);
		}
		
		senderJID = $(stanza).attr('from');
		type = $(stanza).attr('type');
		time = $(stanza).find('delay').attr('stamp') || new Date().toISOString();
		message = $(stanza).find('body').context.textContent;
		
		if (type == 'groupchat')
			nick = QBChatHelpers.getIDFromResource(senderJID);
		else
			nick = QBChatHelpers.getIDFromNode(senderJID);
		
		_this.onChatMessage(nick, type, time, message);
		return true;
	};
	
	this.onPresence = function(stanza, room) {
		var jid, type, time, nick;
		
		if (params && params.debug) {
			traceChat('Presence');
			console.log(stanza);
		}
		
		jid = $(stanza).attr('from');
		type = $(stanza).attr('type');
		time = new Date().toISOString();
		
		nick = QBChatHelpers.getIDFromResource(jid);
		
		_this.onMUCPresence(nick, type, time);
		return true;
	};
	
	this.onRoster = function(users, room) {
		_this.onMUCRoster(users, room);
		return true;
	};
}

function traceChat(text) {
	console.log("[qb_chat]: " + text);
}

/* One to One chat methods
----------------------------------------------------------*/
QBChat.prototype.connect = function(userID, userPass) {
	var _this = this;
	var userJID = QBChatHelpers.getJID(userID);
	
	this.connection.connect(userJID, userPass, function(status) {
		switch (status) {
		case Strophe.Status.ERROR:
			traceChat('Error');
			break;
		case Strophe.Status.CONNECTING:
			traceChat('Connecting');
			break;
		case Strophe.Status.CONNFAIL:
			traceChat('Failed to connect');
			_this.onConnectFailed();
			break;
		case Strophe.Status.AUTHENTICATING:
			traceChat('Authenticating');
			break;
		case Strophe.Status.AUTHFAIL:
			traceChat('Unauthorized');
			_this.onConnectFailed();
			break;
		case Strophe.Status.CONNECTED:
			traceChat('Connected');
			_this.connection.addHandler(_this.onMessage, null, 'message', 'chat', null, null, null);
			_this.onConnectSuccess();
			break;
		case Strophe.Status.DISCONNECTING:
			traceChat('Disconnecting');
			_this.onConnectClosed();
			break;
		case Strophe.Status.DISCONNECTED:
			traceChat('Disconnected');
			break;
		case Strophe.Status.ATTACHED:
			traceChat('Attached');
			break;
		}
	});
};

QBChat.prototype.send = function(userID, body, type) {
	var params, msg;
	var userJID = QBChatHelpers.getJID(userID);
	
	params = {
		to: userJID,
		from: this.connection.jid,
		type: type
	};
	
	msg = $msg(params).c('body').t(body);
	this.connection.send(msg);
};

QBChat.prototype.disconnect = function() {
	this.connection.send($pres());
	this.connection.flush();
	this.connection.disconnect();
};

/* MUC methods
----------------------------------------------------------*/
QBChat.prototype.join = function(roomJid, nick) {
	this.connection.muc.join(roomJid, nick, this.onMessage, this.onPresence, this.onRoster);
};

QBChat.prototype.leave = function(roomJid, nick) {
	this.connection.muc.leave(roomJid, nick);
};

QBChat.prototype.createRoom = function(roomName, nick) {
	var _this = this;
	
	this.newRoom = QB.session.application_id + '_' + roomName + '@' + config.muc;
	this.connection.send(
		$pres({
			'from': this.connection.jid,
			'to': this.newRoom + '/' + nick
		}).c('x', {xmlns: Strophe.NS.MUC})
	);
	
	setTimeout(function() {
		_this.connection.muc.createInstantRoom(_this.newRoom,
		                                       function() {
		                                         console.log('Room created');
	                                             _this.connection.muc.configure(_this.newRoom, configureSuccess, configureError);
		                                       },
		                                       function() {
		                                       	 console.log('Room created error');
		                                       });
	}, 1 * 1000);
	
	function configureSuccess(config) {
		console.log('Room config set');
		var param = $(config).find('field[var="muc#roomconfig_persistentroom"]');
		param.find('value').text(1);
		_this.connection.muc.saveConfiguration(_this.newRoom, [param[0]], saveSuccess, configureError);
	}
	
	function configureError(err) {
		console.log('Room config error');
		console.log(err);
	}
	
	function saveSuccess() {
		console.log('Saving of room config is completed');
	}
};

QBChat.prototype.invite = function(receiver) {
	console.log('invite');
	var userJID = QBChatHelpers.getJID(receiver);
	this.connection.muc.invite(this.newRoom, userJID);
};

QBChat.prototype.destroy = function(roomName) {
	console.log('destroy');
	var roomJid = QB.session.application_id + '_' + roomName + '@' + config.muc;
	var iq = $iq({
		'from': this.connection.jid,
		'to': roomJid,
		'type': 'set'
	}).c('query', {xmlns: Strophe.NS.MUC_OWNER})
	  .c('destroy').c('reason').t('Sorry, this room was removed');
	this.connection.send(iq);
};
