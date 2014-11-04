/*
 * QuickBlox JavaScript SDK
 *
 * QuickBlox Utilities
 *
 */

// Browserify exports and dependencies
var config = require('./qbConfig');

exports.randomNonce = function() {
  return Math.round(Math.random() * 10000);
};

exports.unixTime = function() {
  return Math.round(Date.now() / 1000);
};

exports.getUrl = function(base, id) {
  var protocol = config.ssl ? 'https://' : 'http://';
  var resource = id ? '/' + id : '';
  return protocol + config.endpoints.api + '/' + base + resource + config.urls.type;
};
