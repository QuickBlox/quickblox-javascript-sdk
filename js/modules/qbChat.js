/*
 * QuickBlox JavaScript SDK
 *
 * Chat 2.0 Module
 *
 */

// Browserify exports and dependencies
module.exports = ChatProxy;
var config = require('../qbConfig');
var Utils = require('../qbUtils');

function ChatProxy(service) {
  this.service = service;
}
