/*
 * QuickBlox JavaScript SDK
 *
 * Strophe Connection Object
 *
 */

require('../lib/strophe/strophe.min');
var config = require('./qbConfig');
var Utils = require('./qbUtils');

function Connection() {
  var protocol = config.chatProtocol.active === 1 ? config.chatProtocol.bosh : config.chatProtocol.websocket;
  var conn = new Strophe.Connection(protocol);
  if (config.chatProtocol.active === 1) {
    conn.xmlInput = function(data) { if (data.childNodes[0]) {for (var i = 0, len = data.childNodes.length; i < len; i++) {
      Utils.QBLog('[QBChat]', 'RECV:', data.childNodes[i]);
    }} };
    conn.xmlOutput = function(data) { if (data.childNodes[0]) {for (var i = 0, len = data.childNodes.length; i < len; i++) {
      Utils.QBLog('[QBChat]', 'SENT:', data.childNodes[i]);
    }} };
  } else {
    conn.xmlInput = function(data) {
      Utils.QBLog('[QBChat]', 'RECV:', data);
    };
    conn.xmlOutput = function(data) {
      Utils.QBLog('[QBChat]', 'SENT:', data);
    };
  }

  return conn;
}

module.exports = Connection;
