/*
 * QuickBlox JavaScript SDK
 *
 * Chat 2.0 Module
 *
 */

/*
 * User's callbacks (listener-functions):
 * - onMessageListener
 * - onContactListListener
 * - onSubscribeListener
 * - onConfirmSubscribeListener
 * - onRejectSubscribeListener
 * - onDisconnectingListener
 * - onReconnectListener
 */

var config = require('../qbConfig'),
    Utils = require('../qbUtils');

var isBrowser = typeof window !== "undefined";
var unsupported = "This function isn't supported outside of the browser (...yet)";

if (isBrowser) {
  require('../../lib/strophe/strophe.min');
  // add extra namespaces for Strophe
  Strophe.addNamespace('CARBONS', 'urn:xmpp:carbons:2');
  Strophe.addNamespace('CHAT_MARKERS', 'urn:xmpp:chat-markers:0');
}
 
var dialogUrl = config.urls.chat + '/Dialog';
var messageUrl = config.urls.chat + '/Message';

var connection,
    webrtc,
    roster = {},
    joinedRooms = {};

function ChatProxy(service, webrtcModule, conn) {
  var self = this;
  webrtc = webrtcModule;
  connection = conn;

  this.service = service;
  if(isBrowser) {
    this.roster = new RosterProxy(service);
    this.muc = new MucProxy(service);
  }
  this.dialog = new DialogProxy(service);
  this.message = new MessageProxy(service);
  this.helpers = new Helpers;

  // reconnect to chat if it wasn't the logout method
  this._isLogout = false;

  // stanza callbacks (Message, Presence, IQ)

  this._onMessage = function(stanza) {
    var from = stanza.getAttribute('from'),
        to = stanza.getAttribute('to'),
        type = stanza.getAttribute('type'),
        body = stanza.querySelector('body'),
        markable = stanza.querySelector('markable'),
        received = stanza.querySelector('received'),
        displayed = stanza.querySelector('displayed'),
        invite = stanza.querySelector('invite'),
        extraParams = stanza.querySelector('extraParams'),
        delay = stanza.querySelector('delay'),
        messageId = stanza.getAttribute('id'),
        dialogId = type === 'groupchat' ? self.helpers.getDialogIdFromNode(from) : null,
        userId = type === 'groupchat' ? self.helpers.getIdFromResource(from) : self.helpers.getIdFromNode(from),
        marker = received || displayed || null,
        message, extension, attachments, attach, attributes,
        msg;

    if (invite) return true;

    // custom parameters
    // TODO: need rewrite this block
    if (extraParams) {
      extension = {};
      attachments = [];
      for (var i = 0, len = extraParams.childNodes.length; i < len; i++) {
        if (extraParams.childNodes[i].tagName === 'attachment') {
          
          // attachments
          attach = {};
          attributes = extraParams.childNodes[i].attributes;
          for (var j = 0, len2 = attributes.length; j < len2; j++) {
            if (attributes[j].name === 'id' || attributes[j].name === 'size')
              attach[attributes[j].name] = parseInt(attributes[j].value);
            else
              attach[attributes[j].name] = attributes[j].value;
          }
          attachments.push(attach);

        } else {
          if (extraParams.childNodes[i].childNodes.length > 1) {

            extension = self._XMLtoJS(extension, extraParams.childNodes[i].tagName, extraParams.childNodes[i]);

          } else {

            extension[extraParams.childNodes[i].tagName] = extraParams.childNodes[i].textContent;

          }
        }
      }

      if (attachments.length > 0)
        extension.attachments = attachments;
    }

    message = {
      id: messageId,
      dialog_id: dialogId,
      type: type,
      body: (body && body.textContent) || null,
      extension: extension || null
    };

    // chat markers
    if (marker) {
      message.markerType = received ? 'received' : 'displayed';
      message.markerMessageId = marker.getAttribute('id');
    }

    // !delay - this needed to don't duplicate messages from chat 2.0 API history
    // with typical XMPP behavior of history messages in group chat
    if (typeof self.onMessageListener === 'function' && (type === 'chat' || !delay))
      self.onMessageListener(userId, message, to, delay);

    // we must return true to keep the handler alive
    // returning false would remove it after it finishes
    return true;
  };

  this._onPresence = function(stanza) {
    var from = stanza.getAttribute('from'),
        type = stanza.getAttribute('type'),
        userId = self.helpers.getIdFromNode(from);

    if (!type) {
      if (typeof self.onContactListListener === 'function' && roster[userId] && roster[userId].subscription !== 'none')
        self.onContactListListener(userId);
    } else {

      // subscriptions callbacks
      switch (type) {
      case 'subscribe':
        if (roster[userId] && roster[userId].subscription === 'to') {
          roster[userId] = {
            subscription: 'both',
            ask: null
          };
          self.roster._sendSubscriptionPresence({
            jid: from,
            type: 'subscribed'
          });
        } else {
          if (typeof self.onSubscribeListener === 'function')
            self.onSubscribeListener(userId);
        }
        break;
      case 'subscribed':
        if (roster[userId] && roster[userId].subscription === 'from') {
          roster[userId] = {
            subscription: 'both',
            ask: null
          };          
        } else {
          roster[userId] = {
            subscription: 'to',
            ask: null
          };
          if (typeof self.onConfirmSubscribeListener === 'function')
            self.onConfirmSubscribeListener(userId);
        }
        break;
      case 'unsubscribed':
        roster[userId] = {
          subscription: 'none',
          ask: null
        };
        if (typeof self.onRejectSubscribeListener === 'function')
          self.onRejectSubscribeListener(userId);
        break;
      case 'unsubscribe':
        roster[userId] = {
          subscription: 'to',
          ask: null
        };
        // if (typeof self.onRejectSubscribeListener === 'function')
        //   self.onRejectSubscribeListener(userId);
        break;
      case 'unavailable':
        if (typeof self.onContactListListener === 'function' && roster[userId] && roster[userId].subscription !== 'none')
          self.onContactListListener(userId, type);
        break;
      }

    }

    // we must return true to keep the handler alive
    // returning false would remove it after it finishes
    return true;
  };

  this._onIQ = function(stanza) {

    // we must return true to keep the handler alive
    // returning false would remove it after it finishes
    return true;
  };
}

/* Chat module: Core
---------------------------------------------------------------------- */
ChatProxy.prototype = {

  connect: function(params, callback) {
    if(!isBrowser) throw unsupported;

    if (config.debug) { console.log('ChatProxy.connect', params); }
    var self = this,
        err, rooms;

    connection.connect(params.jid, params.password, function(status) {
      switch (status) {
      case Strophe.Status.ERROR:
        err = getError(422, 'Status.ERROR - An error has occurred');
        if (typeof callback === 'function') callback(err, null);
        break;
      case Strophe.Status.CONNECTING:
        trace('Status.CONNECTING');
        trace('Chat Protocol - ' + (config.chatProtocol.active === 1 ? 'BOSH' : 'WebSocket'));
        break;
      case Strophe.Status.CONNFAIL:
        err = getError(422, 'Status.CONNFAIL - The connection attempt failed');
        if (typeof callback === 'function') callback(err, null);
        break;
      case Strophe.Status.AUTHENTICATING:
        trace('Status.AUTHENTICATING');
        break;
      case Strophe.Status.AUTHFAIL:
        err = getError(401, 'Status.AUTHFAIL - The authentication attempt failed');
        if (typeof callback === 'function') callback(err, null);
        break;
      case Strophe.Status.CONNECTED:
        trace('Status.CONNECTED at ' + getLocalTime());

        connection.addHandler(self._onMessage, null, 'message', 'chat');
        connection.addHandler(self._onMessage, null, 'message', 'groupchat');
        connection.addHandler(self._onPresence, null, 'presence');
        connection.addHandler(self._onIQ, null, 'iq');

        // set signaling callbacks
        connection.addHandler(webrtc._onMessage, null, 'message', 'headline');

        // enable carbons
        self._enableCarbons(function() {
          // get the roster
          self.roster.get(function(contacts) {
            roster = contacts;

            // chat server will close your connection if you are not active in chat during one minute
            // initial presence and an automatic reminder of it each 55 seconds
            connection.send($pres().tree());
            connection.addTimedHandler(55 * 1000, self._autoSendPresence);

            if (typeof callback === 'function') {
              callback(null, roster);
            } else {
              self._isLogout = false;

              // recover the joined rooms
              rooms = Object.keys(joinedRooms);
              for (var i = 0, len = rooms.length; i < len; i++) {
                self.muc.join(rooms[i]);
              }

              if (typeof self.onReconnectListener === 'function')
                self.onReconnectListener();
            }
          });
        });

        break;
      case Strophe.Status.DISCONNECTING:
        trace('Status.DISCONNECTING');
        break;
      case Strophe.Status.DISCONNECTED:
        trace('Status.DISCONNECTED at ' + getLocalTime());
        connection.reset();

        if (typeof self.onDisconnectingListener === 'function')
          self.onDisconnectingListener();

        // reconnect to chat
        if (!self._isLogout) self.connect(params);
        break;
      case Strophe.Status.ATTACHED:
        trace('Status.ATTACHED');
        break;
      }
    });
  },

  send: function(jid, message) {
    if(!isBrowser) throw unsupported;

    var self = this,
        msg = $msg({
          from: connection.jid,
          to: jid,
          type: message.type,
          id: message.id || Utils.getBsonObjectId()
        });
    
    if (message.body) {
      msg.c('body', {
        xmlns: Strophe.NS.CLIENT
      }).t(message.body).up();
    }
    
    // custom parameters
    if (message.extension) {
      msg.c('extraParams', {
        xmlns: Strophe.NS.CLIENT
      });
      
      Object.keys(message.extension).forEach(function(field) {
        if (field === 'attachments') {

          // attachments
          message.extension[field].forEach(function(attach) {
            msg.c('attachment', attach).up();
          });

        } else if (typeof message.extension[field] === 'object') {

          self._JStoXML(field, message.extension[field], msg);

        } else {
          msg.c(field).t(message.extension[field]).up();
        }
      });

      msg.up();
    }

    // chat markers
    if (message.type === 'chat') {
      msg.c('markable', {
        xmlns: Strophe.NS.CHAT_MARKERS
      });
    }
    
    connection.send(msg);
  },

  // helper function for ChatProxy.send()
  sendPres: function(type) {
    if(!isBrowser) throw unsupported;

    connection.send($pres({ 
      from: connection.jid,
      type: type
    }));
  },

  sendDeliveredMessage: function(jid, messageId) {
    if(!isBrowser) throw unsupported;

    var msg = $msg({
      from: connection.jid,
      to: jid,
      type: 'chat',
      id: Utils.getBsonObjectId()
    });

    msg.c('received', {
      xmlns: Strophe.NS.CHAT_MARKERS,
      id: messageId
    });
    
    connection.send(msg);
  },

  sendReadMessage: function(jid, messageId) {
    if(!isBrowser) throw unsupported;

    var msg = $msg({
      from: connection.jid,
      to: jid,
      type: 'chat',
      id: Utils.getBsonObjectId()
    });

    msg.c('displayed', {
      xmlns: Strophe.NS.CHAT_MARKERS,
      id: messageId
    });
    
    connection.send(msg);
  },

  disconnect: function() {
    if(!isBrowser) throw unsupported;

    joinedRooms = {};
    this._isLogout = true;
    connection.flush();
    connection.disconnect();
  },

  addListener: function(params, callback) {
    if(!isBrowser) throw unsupported;

    return connection.addHandler(handler, null, params.name || null, params.type || null, params.id || null, params.from || null);

    function handler() {
      callback();
      // if 'false' - a handler will be performed only once
      return params.live !== false;
    }
  },

  deleteListener: function(ref) {
    if(!isBrowser) throw unsupported;

    connection.deleteHandler(ref);
  },

  // TODO: the magic
  _JStoXML: function(title, obj, msg) {
    var self = this;
    msg.c(title);
    Object.keys(obj).forEach(function(field) {
      if (typeof obj[field] === 'object')
        self._JStoXML(field, obj[field], msg);
      else
        msg.c(field).t(obj[field]).up();
    });
    msg.up();
  },

  // TODO: the magic
  _XMLtoJS: function(extension, title, obj) {
    var self = this;
    extension[title] = {};
    for (var i = 0, len = obj.childNodes.length; i < len; i++) {
      if (obj.childNodes[i].childNodes.length > 1) {
        extension[title] = self._XMLtoJS(extension[title], obj.childNodes[i].tagName, obj.childNodes[i]);
      } else {
        extension[title][obj.childNodes[i].tagName] = obj.childNodes[i].textContent;
      }
    }
    return extension;
  },

  _autoSendPresence: function() {
    if(!isBrowser) throw unsupported;

    connection.send($pres().tree());
    // we must return true to keep the handler alive
    // returning false would remove it after it finishes
    return true;
  },

  // Carbons XEP [http://xmpp.org/extensions/xep-0280.html]
  _enableCarbons: function(callback) {
    if(!isBrowser) throw unsupported;

    var iq;

    iq = $iq({
      from: connection.jid,
      type: 'set',
      id: connection.getUniqueId('enableCarbons')
    }).c('enable', {
      xmlns: Strophe.NS.CARBONS
    });

    connection.sendIQ(iq, function(stanza) {
      callback();
    });
  }

};

/* Chat module: Roster
 *
 * Integration of Roster Items and Presence Subscriptions
 * http://xmpp.org/rfcs/rfc3921.html#int
 * default - Mutual Subscription
 *
---------------------------------------------------------------------- */
function RosterProxy(service) {
  this.service = service;
  this.helpers = new Helpers;
}

RosterProxy.prototype = {

  get: function(callback) {
    var iq, self = this,
        items, userId, contacts = {};

    iq = $iq({
      from: connection.jid,
      type: 'get',
      id: connection.getUniqueId('getRoster')
    }).c('query', {
      xmlns: Strophe.NS.ROSTER
    });

    connection.sendIQ(iq, function(stanza) {
      items = stanza.getElementsByTagName('item');
      for (var i = 0, len = items.length; i < len; i++) {
        userId = self.helpers.getIdFromNode(items[i].getAttribute('jid')).toString();
        contacts[userId] = {
          subscription: items[i].getAttribute('subscription'),
          ask: items[i].getAttribute('ask') || null
        };
      }
      callback(contacts);
    });
  },

  add: function(jid, callback) {
    var self = this,
        userId = self.helpers.getIdFromNode(jid).toString();

    roster[userId] = {
      subscription: 'none',
      ask: 'subscribe'
    };

    self._sendSubscriptionPresence({
      jid: jid,
      type: 'subscribe'
    });

    if (typeof callback === 'function') callback();
  },

  confirm: function(jid, callback) {
    var self = this,
        userId = self.helpers.getIdFromNode(jid).toString();

    roster[userId] = {
      subscription: 'from',
      ask: 'subscribe'
    };

    self._sendSubscriptionPresence({
      jid: jid,
      type: 'subscribed'
    });

    self._sendSubscriptionPresence({
      jid: jid,
      type: 'subscribe'
    });

    if (typeof callback === 'function') callback();
  },

  reject: function(jid, callback) {
    var self = this,
        userId = self.helpers.getIdFromNode(jid).toString();

    roster[userId] = {
      subscription: 'none',
      ask: null
    };

    self._sendSubscriptionPresence({
      jid: jid,
      type: 'unsubscribed'
    });

    if (typeof callback === 'function') callback();
  },

  remove: function(jid, callback) {
    var iq, userId, self = this;

    iq = $iq({
      from: connection.jid,
      type: 'set',
      id: connection.getUniqueId('removeRosterItem')
    }).c('query', {
      xmlns: Strophe.NS.ROSTER
    }).c('item', {
      jid: jid,
      subscription: 'remove'
    });

    userId = self.helpers.getIdFromNode(jid).toString();

    connection.sendIQ(iq, function() {
      delete roster[userId];
      if (typeof callback === 'function') callback();
    });
  },

  _sendSubscriptionPresence: function(params) {
    var pres;

    pres = $pres({
      to: params.jid,
      type: params.type
    });

    connection.send(pres);
  }

};

/* Chat module: Group Chat
 *
 * Multi-User Chat
 * http://xmpp.org/extensions/xep-0045.html
 *
---------------------------------------------------------------------- */
function MucProxy(service) {
  this.service = service;
  this.helpers = new Helpers;
}

MucProxy.prototype = {

  join: function(jid, callback) {
    var pres, self = this,
        id = connection.getUniqueId('join');

    joinedRooms[jid] = true;

    pres = $pres({
      from: connection.jid,
      to: self.helpers.getRoomJid(jid),
      id: id
    }).c("x", {
      xmlns: Strophe.NS.MUC
    }).c("history", {
      maxstanzas: 0
    });

    if (typeof callback === 'function') connection.addHandler(callback, null, 'presence', null, id);
    connection.send(pres);
  },

  leave: function(jid, callback) {
    var pres, self = this,
        roomJid = self.helpers.getRoomJid(jid);

    delete joinedRooms[jid];

    pres = $pres({
      from: connection.jid,
      to: roomJid,
      type: 'unavailable'
    });

    if (typeof callback === 'function') connection.addHandler(callback, null, 'presence', 'unavailable', null, roomJid);
    connection.send(pres);
  }

};

/* Chat module: History
---------------------------------------------------------------------- */

// Dialogs

function DialogProxy(service) {
  this.service = service;
  this.helpers = new Helpers;
}

DialogProxy.prototype = {

  list: function(params, callback) {
    if (typeof params === 'function' && typeof callback === 'undefined') {
      callback = params;
      params = {};
    }

    if (config.debug) { console.log('DialogProxy.list', params); }
    this.service.ajax({url: Utils.getUrl(dialogUrl), data: params}, callback);
  },

  create: function(params, callback) {
    if (config.debug) { console.log('DialogProxy.create', params); }
    this.service.ajax({url: Utils.getUrl(dialogUrl), type: 'POST', data: params}, callback);
  },

  update: function(id, params, callback) {
    if (config.debug) { console.log('DialogProxy.update', id, params); }
    this.service.ajax({url: Utils.getUrl(dialogUrl, id), type: 'PUT', data: params}, callback);
  },

  delete: function(id, callback) {
    if (config.debug) { console.log('DialogProxy.delete', id); }
    this.service.ajax({url: Utils.getUrl(dialogUrl, id), type: 'DELETE', dataType: 'text'}, callback);
  }

};

// Messages

function MessageProxy(service) {
  this.service = service;
  this.helpers = new Helpers;
}

MessageProxy.prototype = {

  list: function(params, callback) {
    if (config.debug) { console.log('MessageProxy.list', params); }
    this.service.ajax({url: Utils.getUrl(messageUrl), data: params}, callback);
  },

  create: function(params, callback) {
    if (config.debug) { console.log('MessageProxy.create', params); }
    this.service.ajax({url: Utils.getUrl(messageUrl), type: 'POST', data: params}, callback);
  },

  update: function(id, params, callback) {
    if (config.debug) { console.log('MessageProxy.update', id, params); }
    this.service.ajax({url: Utils.getUrl(messageUrl, id), type: 'PUT', data: params}, callback);
  },

  delete: function(id, callback) {
    if (config.debug) { console.log('MessageProxy.delete', id); }
    this.service.ajax({url: Utils.getUrl(messageUrl, id), type: 'DELETE', dataType: 'text'}, callback);
  }

};

/* Helpers
---------------------------------------------------------------------- */
function Helpers() {}

Helpers.prototype = {

  getUserJid: function(id, appId) {
    return id + '-' + appId + '@' + config.endpoints.chat;
  },

  getIdFromNode: function(jid) {
    if (jid.indexOf('@') < 0) return null;
    return parseInt(jid.split('@')[0].split('-')[0]);
  },

  getDialogIdFromNode: function(jid) {
    if (jid.indexOf('@') < 0) return null;
    return jid.split('@')[0].split('_')[1];
  },

  getRoomJid: function(jid) {
    if(!isBrowser) throw unsupported;
    return jid + '/' + this.getIdFromNode(connection.jid);
  },  

  getIdFromResource: function(jid) {
    var s = jid.split('/');
    if (s.length < 2) return null;
    s.splice(0, 1);
    return parseInt(s.join('/'));
  },

  getUniqueId: function(suffix) {
    if(!isBrowser) throw unsupported;
    return connection.getUniqueId(suffix);
  },

  getBsonObjectId: function() {
    return Utils.getBsonObjectId();
  }  

};

module.exports = ChatProxy;

/* Private
---------------------------------------------------------------------- */
function trace(text) {
  // if (config.debug) {
    console.log('[QBChat]:', text);
  // }
}

function getError(code, detail) {
  var errorMsg = {
    code: code,
    status: 'error',
    message: code === 401 ? 'Unauthorized' : 'Unprocessable Entity',
    detail: detail
  };

  trace(detail);
  return errorMsg;
}

function getLocalTime() {
  return (new Date).toTimeString().split(' ')[0];
}
