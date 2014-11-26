if (typeof define !== 'function') { var define = require('amdefine')(module) }
/*
 * QuickBlox JavaScript SDK
 *
 * WebRTC Module
 *
 */

define(['qbConfig', 'strophe', 'webRTCAdapter'],
function(config, Strophe) {

  var connection;

  function WebRTCProxy(service, conn) {
    var self = this;
    connection = conn;

    this.service = service;
  }

  WebRTCProxy.prototype = {

  };

  return WebRTCProxy;

});
