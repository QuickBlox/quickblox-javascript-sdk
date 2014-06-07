/*
 * QuickBlox JavaScript SDK
 *
 * QuickBlox Utilities
 *
 */

// Browserify exports and dependencies
var config = require('./qbConfig');

// Shim for console.log on IE 9
exports.shim = function() {
  if (typeof console === 'undefined' || !console.log) {
    window.console = {
      log: function() {},
      info: function() {},
      warn: function() {},
      error: function() {}
    };
  }
};

exports.getRandomNonce = function() {
  return Math.floor(Math.random() * 10000);
};

exports.unixTime = function() {
  return Math.floor(Date.now() / 1000);
};

exports.resourceUrl = function(base, id) {
  return base + '/' + id + config.urls.type;
};
