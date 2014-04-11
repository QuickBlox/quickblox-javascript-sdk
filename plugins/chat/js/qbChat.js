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
	
	this.version = '0.8.1';
	this.config = config;
	
	this._autoPresence = true;
	
	// Storage of joined rooms and user nicknames
	this._rooms = {};
	
	// create Strophe Connection object
	this._connection = new Strophe.Connection(config.bosh);
	
	if (params) {
		if (params.debug) {
			this._debug = params.debug;
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
		var from, type, body, extraParams, invite;
		var senderID, message, extension = {};
		
		from = $(stanza).attr('from');
		type = $(stanza).attr('type');
		body = $(stanza).find('body')[0];
		extraParams = $(stanza).find('extraParams')[0];
		invite = $(stanza).find('invite')[0];
		
		if (params && params.debug) {
			console.log(stanza);
			trace(invite && 'Invite' || (body ? 'Message' : 'Chat state notification'));
		}
		
		senderID = invite && QBChatHelpers.getIDFromNode($(invite).attr('from')) ||
		           ( (type === 'groupchat') ? QBChatHelpers.getIDFromResource(from) : QBChatHelpers.getIDFromNode(from) );
		
		$(extraParams && extraParams.childNodes).each(function() {
			extension[$(this).context.tagName] = $(this).context.textContent;
		});
		
		if (invite) {
			message = {
				room: from.split('@')[0].slice(from.indexOf('_') + 1),
				type: 'invite',
			};
		} else if (body) {
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
		
		invite || body ? self._callbacks.onChatMessage(senderID, message) :
		                 self._callbacks.onChatState && self._callbacks.onChatState(senderID, message);
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
		self._callbacks.onMUCRoster && self._callbacks.onMUCRoster(users, room);
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
		if (!self._autoPresence) return false;
		
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
			self._connection.addHandler(self._onMessage, null, 'message');
			if (self._callbacks.onMUCPresence)
				self._connection.addHandler(self._onPresence, null, 'presence');
			
			self._callbacks.onConnectSuccess();
			break;
		case Strophe.Status.DISCONNECTING:
			trace('Disconnecting');
			self._autoPresence = false;
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
	var msg, jid;
	
	jid = (message.type === 'groupchat') ? QBChatHelpers.getRoom(userID) : QBChatHelpers.getJID(userID);
	
	msg = $msg({
		to: jid,
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

QBChat.prototype.join = function(roomName, nick) {
	var roomJID = QBChatHelpers.getRoom(roomName);
	this._rooms[roomName] = nick;
	this._connection.muc.join(roomJID, nick, null, null, this._onRoster);
};

QBChat.prototype.leave = function(roomName) {
	var roomJID = QBChatHelpers.getRoom(roomName);
	var nick = this._rooms[roomName];
	delete this._rooms[roomName];
	this._connection.muc.leave(roomJID, nick);
};

QBChat.prototype.createRoom = function(params, callback) {
	var nick, roomJID, pres, self = this;
	
	nick = params.nick || QBChatHelpers.getIDFromNode(this._connection.jid);
	roomJID = QBChatHelpers.getRoom(params.room);
	
	pres = $pres({
		to: roomJID + '/' + nick
	}).c('x', {
		xmlns: Strophe.NS.MUC
	});
	
	this._connection.send(pres);
	setTimeout(createInstant, 1 * 1000);
	
	function createInstant() {
		self._connection.muc.createInstantRoom(roomJID,
		      
		      function onSuccess() {
		        trace('Room created');
		        configure();
		      },
		      
		      function onError() {
		        trace('Room created error');
		        callback(true, null);
		      }
		);
	}
	
	function configure() {
		self._connection.muc.configure(roomJID,
		      
		      function onSuccess(roomConfig) {
		        trace('Room config set');
		        console.log(roomConfig);
		        var data = [];
		        var roomname = $(roomConfig).find('field[var="muc#roomconfig_roomname"]');
		        var membersonly = $(roomConfig).find('field[var="muc#roomconfig_membersonly"]');
		        var persistentroom = $(roomConfig).find('field[var="muc#roomconfig_persistentroom"]');
		        
		        roomname.find('value').text(params.room);
		        if (params.membersOnly) membersonly.find('value').text(1);
		        if (params.persistent) persistentroom.find('value').text(1);
		        
		        data[0] = roomname[0];
		        data[1] = membersonly[0];
		        data[2] = persistentroom[0];
		        
		        saveConfiguration(data);
		      },
		      
		      function onError() {
		        trace('Room config error');
		        callback(true, null);
		      }
		);
	}
	
	function saveConfiguration(data) {
		self._connection.muc.saveConfiguration(roomJID, data,
		      
		      function onSuccess() {
		        trace('Saving of room config is completed');
		        self._rooms[params.room] = nick;
		        callback(null, true);
		      },
		      
		      function onError() {
		        trace('Room created error');
		        callback(true, null);
		      }
		);
	}
};

QBChat.prototype.addMembers = function(params, callback) {
	var roomJID, iq, self = this;
	
	roomJID = QBChatHelpers.getRoom(params.room);
	
	iq = $iq({
		to: roomJID,
		type: 'set'
	}).c('query', {
		xmlns: Strophe.NS.MUC_ADMIN
	});
	
	$(params.users).each(function() {
		iq.cnode($build('item', {jid: QBChatHelpers.getJID(this), affiliation: 'owner'}).node).up();
	});
	
	self._connection.sendIQ(iq.tree(),
	      
	      function onSuccess() {
	        callback(null, true);
	      },
	      
	      function onError() {
	        callback(true, null);
	      }
	);
};

QBChat.prototype.deleteMembers = function(params, callback) {
	console.log('deleteMembers');
	var roomJID, iq, self = this;
	
	roomJID = QBChatHelpers.getRoom(params.room);
	
	iq = $iq({
		to: roomJID,
		type: 'set'
	}).c('query', {
		xmlns: Strophe.NS.MUC_ADMIN
	});
	
	$(params.users).each(function() {
		iq.cnode($build('item', {jid: QBChatHelpers.getJID(this), affiliation: 'none'}).node).up();
	});
	
	self._connection.sendIQ(iq.tree(),
	      
	      function onSuccess() {
	        callback(null, true);
	      },
	      
	      function onError() {
	        callback(true, null);
	      }
	);
};

QBChat.prototype.getRoomMembers = function(room, callback) {
	console.log('getRoomMembers');
	var roomJID, iq, self = this;
	
	roomJID = QBChatHelpers.getRoom(room);
	
	iq = $iq({
		to: roomJID,
		type: 'get'
	}).c('query', {
		xmlns: Strophe.NS.MUC_ADMIN
	}).c('item', {
		affiliation: 'owner'
	});
	
	self._connection.sendIQ(iq.tree(),
	      
	      function onSuccess() {
	        callback(null, true);
	      },
	      
	      function onError() {
	        callback(true, null);
	      }
	);
};

QBChat.prototype.getOnlineUsers = function(room, callback) {
	console.log('getOnlineUsers');
	var roomJID = QBChatHelpers.getRoom(room);
	self._connection.muc.queryOccupants(roomJID,
	      
	      function onSuccess() {
	        callback(null, true);
	      },
	      
	      function onError() {
	        callback(true, null);
	      }
	);
};

QBChat.prototype.listRooms = function(callback) {
	console.log('listRooms');
	self._connection.muc.listRooms(config.muc,
	      
	      function onSuccess() {
	        callback(null, true);
	      },
	      
	      function onError() {
	        callback(true, null);
	      }
	);
};

/*QBChat.prototype.invite = function(receiver) {
	console.log('invite');
	var userJID = QBChatHelpers.getJID(receiver);
	this._connection.muc.invite(this.newRoom, userJID);
};*/

/*QBChat.prototype.destroy = function(roomName) {
	console.log('destroy');
	var roomJid = QB.session.application_id + '_' + roomName + '@' + config.muc;
	var iq = $iq({
		to: roomJid,
		type: 'set'
	}).c('query', {xmlns: Strophe.NS.MUC_OWNER})
	  .c('destroy').c('reason').t('Sorry, this room was removed');
	this._connection.send(iq);
};*/
