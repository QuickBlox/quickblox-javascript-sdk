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
 */

// Browserify exports and dependencies
require('../../lib/strophe/strophe.min');
var config = require('../qbConfig');
var Utils = require('../qbUtils');
module.exports = ChatProxy;

var dialogUrl = config.urls.chat + '/Dialog';
var messageUrl = config.urls.chat + '/Message';

var mutualSubscriptions = {};

// create Strophe Connection object
var protocol = config.chatProtocol.active === 1 ? config.chatProtocol.bosh : config.chatProtocol.websocket;
var connection = new Strophe.Connection(protocol);
// if (config.debug) {
  connection.xmlInput = function(data) { console.log('[QBChat RECV]:', data); };
  connection.xmlOutput = function(data) { console.log('[QBChat SENT]:', data); };
// }

function ChatProxy(service) {
  var self = this;

  this.service = service;
  this.roster = new RosterProxy(service);
  this.dialog = new DialogProxy(service);
  this.message = new MessageProxy(service);
  this.helpers = new Helpers;

  // stanza callbacks (Message, Presence, IQ)

  this._onMessage = function(stanza) {
    var from = stanza.getAttribute('from'),
        type = stanza.getAttribute('type'),
        body = stanza.querySelector('body'),
        extraParams = stanza.querySelector('extraParams'),
        userId = self.helpers.getIdFromNode(from),
        message, extension;

    // custom parameters
    if (extraParams) {
      extraParams.children.forEach(function(elem) {
        extension[elem.tagName] = elem.textContent;
      });
    }

    message = {
      type: type,
      body: (body && body.textContent) || null,
      extension: extension || null
    };

    if (typeof self.onMessageListener === 'function')
      self.onMessageListener(userId, message);

    // we must return true to keep the handler alive
    // returning false would remove it after it finishes
    return true;
  };

  this._onPresence = function(stanza) {
    var from = stanza.getAttribute('from'),
        type = stanza.getAttribute('type'),
        userId = self.helpers.getIdFromNode(from);

    if (!type) {
      if (typeof self.onContactListListener === 'function' && mutualSubscriptions[userId])
        self.onContactListListener(userId, type);
    } else {

      // subscriptions callbacks
      switch (type) {
      case 'subscribe':
        if (mutualSubscriptions[userId]) {
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
        if (typeof self.onConfirmSubscribeListener === 'function')
          self.onConfirmSubscribeListener(userId);
        break;
      case 'unsubscribed':
        if (typeof self.onRejectSubscribeListener === 'function')
          self.onRejectSubscribeListener(userId);
        break;
      case 'unsubscribe':
        delete mutualSubscriptions[userId];
        if (typeof self.onRejectSubscribeListener === 'function')
          self.onRejectSubscribeListener(userId);
        break;
      case 'unavailable':
        if (typeof self.onContactListListener === 'function' && mutualSubscriptions[userId])
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
ChatProxy.prototype._autoSendPresence = function() {
  connection.send($pres().tree());
  // we must return true to keep the handler alive
  // returning false would remove it after it finishes
  return true;
};

ChatProxy.prototype.connect = function(params, callback) {
  if (config.debug) { console.log('ChatProxy.connect', params); }
  var self = this, err;

  connection.connect(params.jid, params.password, function(status) {
    switch (status) {
    case Strophe.Status.ERROR:
      err = getError(422, 'Status.ERROR - An error has occurred');
      callback(err, null);
      break;
    case Strophe.Status.CONNECTING:
      trace('Status.CONNECTING');
      break;
    case Strophe.Status.CONNFAIL:
      err = getError(422, 'Status.CONNFAIL - The connection attempt failed');
      callback(err, null);
      break;
    case Strophe.Status.AUTHENTICATING:
      trace('Status.AUTHENTICATING');
      break;
    case Strophe.Status.AUTHFAIL:
      err = getError(401, 'Status.AUTHFAIL - The authentication attempt failed');
      callback(err, null);
      break;
    case Strophe.Status.CONNECTED:
      trace('Status.CONNECTED at ' + getLocalTime());

      connection.addHandler(self._onMessage, null, 'message');
      connection.addHandler(self._onPresence, null, 'presence');
      connection.addHandler(self._onIQ, null, 'iq');

      // get the roster
      self.roster.get(function(contacts) {

        // chat server will close your connection if you are not active in chat during one minute
        // initial presence and an automatic reminder of it each 55 seconds
        connection.send($pres().tree());
        connection.addTimedHandler(55 * 1000, self._autoSendPresence);

        mutualSubscriptions = contacts;
        callback(null, contacts);
      });

      break;
    case Strophe.Status.DISCONNECTING:
      trace('Status.DISCONNECTING');
      break;
    case Strophe.Status.DISCONNECTED:
      trace('Status.DISCONNECTED at ' + getLocalTime());

      if (typeof self.onDisconnectingListener === 'function')
        self.onDisconnectingListener();

      mutualSubscriptions = {};
      connection.reset();
      break;
    case Strophe.Status.ATTACHED:
      trace('Status.ATTACHED');
      break;
    }
  });
};

ChatProxy.prototype.send = function(jid, message) {
  var msg = $msg({
    to: jid,
    type: message.type
  });
  
  if (message.body) {
    msg.c('body', {
      xmlns: Strophe.NS.CLIENT
    }).t(message.body);
  }
  
  // custom parameters
  if (message.extension) {
    msg.up().c('extraParams', {
      xmlns: Strophe.NS.CLIENT
    });
    
    Object.keys(message.extension).forEach(function(field) {
      msg.c(field).t(message.extension[field]).up();
    });
  }
  
  connection.send(msg);
};

ChatProxy.prototype.disconnect = function() {
  connection.flush();
  connection.disconnect();
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

RosterProxy.prototype.get = function(callback) {
  var iq, self = this,
      items, userId, contacts = {};

  iq = $iq({
    type: 'get',
    id: connection.getUniqueId('roster')
  }).c('query', {
    xmlns: Strophe.NS.ROSTER
  });

  connection.sendIQ(iq, function(stanza) {
    items = stanza.getElementsByTagName('item');
    for (var i = 0, len = items.length; i < len; i++) {
      userId = self.helpers.getIdFromNode(items[i].getAttribute('jid')).toString();
      contacts[userId] = items[i].getAttribute('subscription');
    }
    callback(contacts);
  });
};

RosterProxy.prototype.add = function(jid) {
  this._sendRosterRequest({
    jid: jid,
    type: 'subscribe'
  });
};

RosterProxy.prototype.confirm = function(jid) {
  this._sendRosterRequest({
    jid: jid,
    type: 'subscribed'
  });
};

RosterProxy.prototype.reject = function(jid) {
  this._sendRosterRequest({
    jid: jid,
    type: 'unsubscribed'
  });
};

RosterProxy.prototype.remove = function(jid) {
  this._sendSubscriptionPresence({
    jid: jid,
    type: 'unsubscribe'
  });
  this._sendSubscriptionPresence({
    jid: jid,
    type: 'unsubscribed'
  });
  this._sendRosterRequest({
    jid: jid,
    subscription: 'remove',
    type: 'unsubscribe'
  });
};

RosterProxy.prototype._sendRosterRequest = function(params) {
  var iq, attr = {},
      userId, self = this;

  iq = $iq({
    type: 'set',
    id: connection.getUniqueId('roster')
  }).c('query', {
    xmlns: Strophe.NS.ROSTER
  });

  if (params.jid)
    attr.jid = params.jid;
  if (params.subscription)
    attr.subscription = params.subscription;

  iq.c('item', attr);

  connection.sendIQ(iq, function() {

    // subscriptions requests
    switch (params.type) {
    case 'subscribe':
      self._sendSubscriptionPresence(params);
      break;
    case 'subscribed':
      self._sendSubscriptionPresence(params);

      userId = self.helpers.getIdFromNode(params.jid).toString();
      mutualSubscriptions[userId] = true;

      params.type = 'subscribe';
      self._sendSubscriptionPresence(params);
      break;
    case 'unsubscribed':
      self._sendSubscriptionPresence(params);
      break;
    case 'unsubscribe':
      delete mutualSubscriptions[userId];
      params.type = 'unavailable';
      self._sendSubscriptionPresence(params);
      break;
    }

  });
};

RosterProxy.prototype._sendSubscriptionPresence = function(params) {
  var pres, self = this;

  pres = $pres({
    to: params.jid,
    type: params.type
  });

  connection.send(pres);
};

/* Chat module: History
---------------------------------------------------------------------- */

// Dialogs

function DialogProxy(service) {
  this.service = service;
  this.helpers = new Helpers;
}

DialogProxy.prototype.list = function(params, callback) {
  if (typeof params === 'function' && typeof callback === 'undefined') {
    callback = params;
    params = {};
  }

  if (config.debug) { console.log('DialogProxy.list', params); }
  this.service.ajax({url: Utils.getUrl(dialogUrl), data: params}, callback);
};

DialogProxy.prototype.create = function(params, callback) {
  if (config.debug) { console.log('DialogProxy.create', params); }
  this.service.ajax({url: Utils.getUrl(dialogUrl), type: 'POST', data: params}, callback);
};

DialogProxy.prototype.update = function(id, params, callback) {
  if (config.debug) { console.log('DialogProxy.update', id, params); }
  this.service.ajax({url: Utils.getUrl(dialogUrl, id), type: 'PUT', data: params}, callback);
};

// Messages

function MessageProxy(service) {
  this.service = service;
  this.helpers = new Helpers;
}

MessageProxy.prototype.list = function(params, callback) {
  if (config.debug) { console.log('MessageProxy.list', params); }
  this.service.ajax({url: Utils.getUrl(messageUrl), data: params}, callback);
};

MessageProxy.prototype.update = function(id, params, callback) {
  if (config.debug) { console.log('MessageProxy.update', id, params); }
  this.service.ajax({url: Utils.getUrl(messageUrl, id), type: 'PUT', data: params}, callback);
};

MessageProxy.prototype.delete = function(id, callback) {
  if (config.debug) { console.log('MessageProxy.delete', id); }
  this.service.ajax({url: Utils.getUrl(messageUrl, id), type: 'DELETE', dataType: 'text'}, callback);
};

/* Helpers
---------------------------------------------------------------------- */
function Helpers() {}

Helpers.prototype = {

  getUserJid: function(id, appId) {
    return id + '-' + appId + '@' + config.endpoints.chat;
  },

  getIdFromNode: function(jid) {
    return parseInt(Strophe.getNodeFromJid(jid).split('-')[0]);
  }

};

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
