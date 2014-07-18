/*
 * QuickBlox JavaScript SDK
 *
 * Chat 2.0 Module
 *
 */

// Browserify exports and dependencies
require('../../lib/strophe/strophe.min');
var config = require('../qbConfig');
module.exports = ChatProxy;

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
  this.helpers = new Helpers;

  this._onPresence = function(stanza) {
    var from = stanza.getAttribute('from'),
        type = stanza.getAttribute('type'),
        userId = self.helpers.getIdFromNode(from);

    switch (type) {
    case 'subscribe':
      self.onSubscribeListener(userId);
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
      trace('Status.CONNECTED');

      connection.addHandler(self._onPresence, null, 'presence');
      // connection.addHandler(self.onMessageListener, null, 'message', 'chat');
      // connection.addHandler(self.onMessageListener, null, 'message', 'groupchat');
      // connection.addHandler(self.onIQstanzaListener, null, 'iq', 'result');

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
      trace('Status.DISCONNECTED');
      connection.reset();
      break;
    case Strophe.Status.ATTACHED:
      trace('Status.ATTACHED');
      break;
    }
  });
};

ChatProxy.prototype.disconnect = function() {
  connection.flush();
  connection.disconnect();
};

/* Chat module: Roster
---------------------------------------------------------------------- */
ChatProxy.prototype.sendSubscriptionPresence = function(params) {
  if (config.debug) { console.log('ChatProxy.sendSubscriptionPresence', params); }

  connection.send($pres({
    to: params.jid,
    type: params.type
  }).tree());
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
