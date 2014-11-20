if (typeof define !== 'function') { var define = require('amdefine')(module) }
/*
 * QuickBlox JavaScript SDK
 *
 * Utilities
 *
 */

define(['config'],
function(config) {

  var Utils = {
    randomNonce: function() {
      return Math.floor(Math.random() * 10000);
    },

    unixTime: function() {
      return Math.floor(Date.now() / 1000);
    },

    getUrl: function(base, id) {
      var protocol = config.ssl ? 'https://' : 'http://';
      var resource = id ? '/' + id : '';
      return protocol + config.endpoints.api + '/' + base + resource + config.urls.type;
    }
  };

  return Utils;
});
