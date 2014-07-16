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
  this.service = service;
}

ChatProxy.prototype.connect = function(params, callback) {
  var self = this, err;
  if (config.debug) { console.log('ChatProxy.connect', params); }

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

      connection.addHandler(self.onMessageListener, null, 'message', 'chat');
      connection.addHandler(self.onMessageListener, null, 'message', 'groupchat');
      connection.addHandler(self.onIQstanzaListener, null, 'iq', 'result');
      connection.addHandler(self.onPresenceListener, null, 'presence');
      
      callback(null, '');
      break;
    case Strophe.Status.DISCONNECTING:
      trace('Status.DISCONNECTING');
      if (typeof self.onDisconnectingListener === 'function')
        self.onDisconnectingListener();
      break;
    case Strophe.Status.DISCONNECTED:
      trace('Status.DISCONNECTED');
      break;
    case Strophe.Status.ATTACHED:
      trace('Status.ATTACHED');
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
