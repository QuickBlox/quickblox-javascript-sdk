if (typeof define !== 'function') { var define = require('amdefine')(module) }
/*
 * QuickBlox JavaScript SDK
 *
 * Strophe Connection Object
 *
 */

define(['qbConfig', 'strophe'],
function(config, Strophe) {

  var protocol = config.chatProtocol.active === 1 ? config.chatProtocol.bosh : config.chatProtocol.websocket;
  var connection = new Strophe.Connection(protocol);
  if (config.debug) {
    if (config.chatProtocol.active === 1) {
      connection.xmlInput = function(data) { if (data.childNodes[0]) {for (var i = 0, len = data.childNodes.length; i < len; i++) { console.log('[QBChat RECV]:', data.childNodes[i]); }} };
      connection.xmlOutput = function(data) { if (data.childNodes[0]) {for (var i = 0, len = data.childNodes.length; i < len; i++) { console.log('[QBChat SENT]:', data.childNodes[i]); }} };
    } else {
      connection.xmlInput = function(data) { console.log('[QBChat RECV]:', data); };
      connection.xmlOutput = function(data) { console.log('[QBChat SENT]:', data); };
    }
  }

  return connection;

});
