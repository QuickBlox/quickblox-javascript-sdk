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

function ChatProxy(service) {
  var protocol = config.chatProtocol.active === 1 ? config.chatProtocol.bosh : config.chatProtocol.websocket;

  this.service = service;

  // create Strophe Connection object
  this._connection = new Strophe.Connection(protocol);
  // if (config.debug) {
    this._connection.rawInput = function(data) { console.log('[QBChat RECV]:', data); };
    this._connection.rawOutput = function(data) { console.log('[QBChat SENT]:', data); };
  // }
}

ChatProxy.prototype.connect = function(params, callback) {
  var self = this, err;
  if (config.debug) { console.log('ChatProxy.connect', params); }

  this._connection.connect(params.jid, params.password, function(status) {
    switch (status) {
    case Strophe.Status.ERROR:
      err = getError(422, 'Status.ERROR - An error has occurred');
      callback(err, null);
      break;
    case Strophe.Status.CONNECTING:
      trace('Connecting');
      break;
    case Strophe.Status.CONNFAIL:
      err = getError(422, 'Status.CONNFAIL - The connection attempt failed');
      callback(err, null);
      break;
    case Strophe.Status.AUTHENTICATING:
      trace('Authenticating');
      break;
    case Strophe.Status.AUTHFAIL:
      err = getError(401, 'Status.AUTHFAIL - The authentication attempt failed');
      callback(err, null);
      break;
    case Strophe.Status.CONNECTED:
      trace('Connected');

      self._connection.addHandler(self.onMessageListener, null, 'message', 'chat');
      self._connection.addHandler(self.onMessageListener, null, 'message', 'groupchat');
      self._connection.addHandler(self.onIQstanzaListener, null, 'iq', 'result');
      self._connection.addHandler(self.onPresenceListener, null, 'presence');
      
      callback(null, '');
      break;
    case Strophe.Status.DISCONNECTING:
      trace('Disconnecting');
      if (typeof self.onDisconnectingListener === 'function')
        self.onDisconnectingListener();
      break;
    case Strophe.Status.DISCONNECTED:
      trace('Disconnected');
      break;
    case Strophe.Status.ATTACHED:
      trace('Status.ATTACHED - The connection has been attached');
      break;
    }
  });
};

/* Helpers
---------------------------------------------------------------------- */
ChatProxy.prototype.getUserJid = function(id) {
  var appId = this.service.getSession().application_id;
  return id + '-' + appId + '@' + config.endpoints.chat;
};

/* Private
---------------------------------------------------------------------- */
function trace(text) {
  // if (config.debug) {
    console.log('QBChat:', text);
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
