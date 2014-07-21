/*
 * QuickBlox JavaScript SDK
 *
 * Chat 2.0 Module
 *
 */

// Browserify exports and dependencies
require('../../lib/strophe/strophe.min');
var config = require('../qbConfig');
var Utils = require('../qbUtils');
module.exports = ChatProxy;

var dialogUrl = config.urls.chat + '/Dialog';
var messageUrl = config.urls.chat + '/Message';

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
  this.dialog = new DialogProxy(service);
  this.message = new MessageProxy(service);
  this.helpers = new Helpers;

  this._onPresence = function(stanza) {
    var from = stanza.getAttribute('from'),
        type = stanza.getAttribute('type'),
        userId = self.helpers.getIdFromNode(from);

    switch (type) {
    case 'subscribe':
      self.onSubscribeListener(from);
      break;
    }

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

      connection.addHandler(self._onPresence, null, 'presence');
      // connection.addHandler(self.onMessageListener, null, 'message', 'chat');
      // connection.addHandler(self.onMessageListener, null, 'message', 'groupchat');
      // connection.addHandler(self.onIQstanzaListener, null, 'iq', 'result');

      // self.sendRosterRequest('get');
      
      // chat server will close your connection if you are not active in chat during one minute
      // initial presence and an automatic reminder of it each 55 seconds
      connection.send($pres().tree());
      connection.addTimedHandler(55 * 1000, self._autoSendPresence);
      
      callback(null, '');
      break;
    case Strophe.Status.DISCONNECTING:
      trace('Status.DISCONNECTING');
      if (typeof self.onDisconnectingListener === 'function')
        self.onDisconnectingListener();
      break;
    case Strophe.Status.DISCONNECTED:
      trace('Status.DISCONNECTED at ' + getLocalTime());
      connection.reset();
      break;
    case Strophe.Status.ATTACHED:
      trace('Status.ATTACHED');
      break;
    }
  });
};

ChatProxy.prototype.sendMessage = function(jid, message) {
  var msg;
  
  msg = $msg({
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
    
    $(Object.keys(message.extension)).each(function() {
      msg.c(this).t(message.extension[this]).up();
    });
  }
  
  connection.send(msg);
};

ChatProxy.prototype.disconnect = function() {
  connection.flush();
  connection.disconnect();
};

/* Chat module: Roster
---------------------------------------------------------------------- */
ChatProxy.prototype.sendSubscriptionPresence = function(params) {
  if (config.debug) { console.log('ChatProxy.sendSubscriptionPresence', params); }
  var pres;

  pres = $pres({
    to: params.jid,
    type: params.type
  });

  // custom parameters
  if (params.extension) {
    pres.c('x', {
      xmlns: 'http://quickblox.com/extraParams'
    });
    
    Object.keys(params.extension).forEach(function(key) {
      pres.c(key).t(params.extension[key]).up();
    });
  }

  connection.send(pres);
};

ChatProxy.prototype.sendRosterRequest = function(type, params) {
  var iq = $iq({
    type: type,
    id: connection.getUniqueId('roster')
  }).c('query', {
    xmlns: Strophe.NS.ROSTER
  });

  if (params.jid)
    iq.c('item', params);

  connection.send(iq);
};

/* Chat module: History
---------------------------------------------------------------------- */

// Dialogs

function DialogProxy(service) {
  this.service = service;
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
  this.service.ajax({url: Utils.getUrl(dialogUrl), type: 'POST', data: {dialog: params}}, callback);
};

DialogProxy.prototype.update = function(id, params, callback) {
  if (config.debug) { console.log('DialogProxy.update', id, params); }
  this.service.ajax({url: Utils.getUrl(dialogUrl, id), type: 'PUT', data: {dialog: params}}, callback);
};

// Messages

function MessageProxy(service) {
  this.service = service;
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
