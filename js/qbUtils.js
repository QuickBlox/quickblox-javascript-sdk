/*
 * QuickBlox JavaScript SDK
 *
 * qbUtils.js - QuickBlox utilities
 *
 *
 */

var config = require('./qbConfig');

function shims() {
  // Shim for Date.now function (IE < 9)
  if (!Date.now) {
    Date.now = function now() {
      return new Date().getTime();
      };
  }
  // Shim for console log on IE
  // (http://stackoverflow.com/questions/1423267/are-there-any-logging-frameworks-for-javascript#answer-10816237)
  if (typeof console === 'undefined' || !console.log) {
    window.console = {
      debug: function() {},
      trace: function() {},
      log: function() {},
      info: function() {},
      warn: function() {},
      error: function() {}
    };
  }
}


exports.shims = function() {shims();};
exports.unixTime = function() { return Math.floor(Date.now() / 1000).toString(); };
exports.resourceUrl = function(base, id, type) { return base + '/' + id + (typeof type === 'undefined'? config.urls.type : type); };
