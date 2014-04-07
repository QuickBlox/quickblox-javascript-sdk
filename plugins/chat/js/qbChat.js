/*
 * QuickBlox JavaScript SDK / XMPP Chat plugin
 *
 * Chat module
 *
 */

// Browserify dependencies
require('../libs/strophe');
require('../libs/strophe.muc');
var config = require('./config');
var QBChatHelpers = require('./qbChatHelpers');

window.QBChat = QBChat;
window.QBChatHelpers = QBChatHelpers;

// add extra namespaces for Strophe
Strophe.addNamespace('CHATSTATES', 'http://jabber.org/protocol/chatstates');

function QBChat(params) {
	var self = this;
	
	this.version = '0.6.2';
	this.config = config;
	
	// create Strophe Connection object
	this._connection = new Strophe.Connection(config.bosh);
	
	if (params) {
		if (params.debug) {
			this._connection.rawInput = function(data) {console.log('RECV: ' + data)};
			this._connection.rawOutput = function(data) {console.log('SENT: ' + data)};
		}
		
		// set user callbacks
		this._callbacks = {
			onConnectFailed: params.onConnectFailed || null,
			onConnectSuccess: params.onConnectSuccess || null,
			onConnectClosed: params.onConnectClosed || null,
			onChatMessage: params.onChatMessage || null,
			onChatState: params.onChatState || null,
			onMUCPresence: params.onMUCPresence || null,
			onMUCRoster: params.onMUCRoster || null
		};
	}
	
	this._onMessage = function(stanza) {
		var from, type, body, extraParams;
		var senderID, message, extension = {};
		
		from = $(stanza).attr('from');
		type = $(stanza).attr('type');
		body = $(stanza).find('body')[0];
		extraParams = $(stanza).find('extraParams')[0];
		
		if (params && params.debug) {
			console.log(stanza);
			trace(body ? 'Message' : 'Chat state notification');
		}
		
		senderID = (type == 'groupchat') ? QBChatHelpers.getIDFromResource(from) : QBChatHelpers.getIDFromNode(from);
		
		$(extraParams && extraParams.childNodes).each(function() {
			extension[$(this).context.tagName] = $(this).context.textContent;
		});
		
		if (body) {
			message = {
				body: $(body).context.textContent,
				time: $(stanza).find('delay').attr('stamp') || new Date().toISOString(),
				type: type,
				extension: extension
			};
		} else {
			message = {
				state: $(stanza).context.firstChild.tagName,
				type: type,
				extension: extension
			};
		}
		
		body ? self._callbacks.onChatMessage(senderID, message) : self._callbacks.onChatState(senderID, message);
		return true;
	};
	
	this._onPresence = function(stanza, room) {
		var from, type, senderID, presence;
		
		from = $(stanza).attr('from');
		type = $(stanza).attr('type');
		
		if (params && params.debug) {
			console.log(stanza);
			trace('Presence');
		}
		
		senderID = QBChatHelpers.getIDFromResource(from);
		
		presence = {
			time: new Date().toISOString(),
			type: type
		};
		
		self._callbacks.onMUCPresence(senderID, presence);
		return true;
	};
	
	this._onRoster = function(users, room) {
		self._callbacks.onMUCRoster(users, room);
		return true;
	};
}

function trace(text) {
	console.log("[qb_chat]: " + text);
}

/* One to One chat methods
----------------------------------------------------------*/
QBChat.prototype.startAutoSendPresence = function(timeout) {
	var self = this;
	setTimeout(sendPresence, timeout * 1000);
	
	function sendPresence() {
		self._connection.send($pres());
		self.startAutoSendPresence(timeout);
	}
};

QBChat.prototype.connect = function(user) {
	var self = this;
	var userJID = QBChatHelpers.getJID(user.id);
	
	this._connection.connect(userJID, user.pass, function(status) {
		switch (status) {
		case Strophe.Status.ERROR:
			trace('Error');
			break;
		case Strophe.Status.CONNECTING:
			trace('Connecting');
			break;
		case Strophe.Status.CONNFAIL:
			trace('Failed to connect');
			self._callbacks.onConnectFailed();
			break;
		case Strophe.Status.AUTHENTICATING:
			trace('Authenticating');
			break;
		case Strophe.Status.AUTHFAIL:
			trace('Unauthorized');
			self._callbacks.onConnectFailed();
			break;
		case Strophe.Status.CONNECTED:
			trace('Connected');
			self._connection.addHandler(self._onMessage, null, 'message', 'chat');
			self._callbacks.onConnectSuccess();
			break;
		case Strophe.Status.DISCONNECTING:
			trace('Disconnecting');
			self._callbacks.onConnectClosed();
			break;
		case Strophe.Status.DISCONNECTED:
			trace('Disconnected');
			break;
		case Strophe.Status.ATTACHED:
			trace('Attached');
			break;
		}
	});
};

QBChat.prototype.sendMessage = function(userID, message) {
	var msg, userJID = QBChatHelpers.getJID(userID);
	
	msg = $msg({
		to: userJID,
		type: message.type
	});
	
	if (message.body) {
		msg.c('body', {
			xmlns: Strophe.NS.CLIENT
		}).t(message.body);
	}
	
	// Chat State Notifications (XEP 0085)
	// http://xmpp.org/extensions/xep-0085.html
	if (message.state) {
		msg.c(message.state, {
			xmlns: Strophe.NS.CHATSTATES
		});
	}
	
	// custom parameters
	if (message.extension) {
		msg.up().c('extraParams', { xmlns: '' });
		
		$(Object.keys(message.extension)).each(function() {
			msg.c(this).t(message.extension[this]).up();
		});
	}
	
	this._connection.send(msg);
};

QBChat.prototype.disconnect = function() {
	this._connection.send($pres());
	this._connection.flush();
	this._connection.disconnect();
};

/* MUC methods
----------------------------------------------------------*/
// Multi-User Chat (XEP 0045)
// http://xmpp.org/extensions/xep-0045.html

QBChat.prototype.join = function(roomJid, nick) {
	this._connection.muc.join(roomJid, nick, this._onMessage, this._onPresence, this._onRoster);
};

QBChat.prototype.leave = function(roomJid, nick) {
	this._connection.muc.leave(roomJid, nick);
};

QBChat.prototype.createRoom = function(roomName, nick) {
	var self = this;
	
	this.newRoom = QB.session.application_id + '_' + roomName + '@' + config.muc;
	this._connection.send(
		$pres({
			to: this.newRoom + '/' + nick
		}).c('x', {xmlns: Strophe.NS.MUC})
	);
	
	setTimeout(function() {
		self._connection.muc.createInstantRoom(self.newRoom,
		                                       function() {
		                                         console.log('Room created');
	                                             self._connection.muc.configure(self.newRoom, configureSuccess, configureError);
		                                       },
		                                       function() {
		                                       	 console.log('Room created error');
		                                       });
	}, 1 * 1000);
	
	function configureSuccess(config) {
		console.log('Room config set');
		var param = $(config).find('field[var="muc#roomconfig_persistentroom"]');
		param.find('value').text(1);
		self._connection.muc.saveConfiguration(self.newRoom, [param[0]], saveSuccess, configureError);
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
	this._connection.muc.invite(this.newRoom, userJID);
};

QBChat.prototype.destroy = function(roomName) {
	console.log('destroy');
	var roomJid = QB.session.application_id + '_' + roomName + '@' + config.muc;
	var iq = $iq({
		to: roomJid,
		type: 'set'
	}).c('query', {xmlns: Strophe.NS.MUC_OWNER})
	  .c('destroy').c('reason').t('Sorry, this room was removed');
	this._connection.send(iq);
};
