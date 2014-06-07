/*
 * QuickBlox JavaScript SDK
 *
 * Main SDK Module
 *
 * Provides a window scoped variable (QB) for use in browsers.
 * Also exports QuickBlox for using with node.js, browserify, etc. 
 *
 */

// Browserify dependencies
var config = require('./qbConfig');
var Proxy = require('./qbProxy');
var Utils = require('./qbUtils');

var Auth = require('./modules/qbAuth');
var Users = require('./modules/qbUsers');
var Messages = require('./modules/qbMessages');
var Location = require('./modules/qbLocation');
var Data = require('./modules/qbData');
var Content = require('./modules/qbContent');

var QB;

// For server-side applications through using npm package 'quickblox' you should comment the following block
// IIEF to create a window scoped QB instance
QB = (function(QB, window) {
  utils.shims();
  if (typeof QB.config === 'undefined') {
    QB = new QuickBlox();
  }
  if (window && typeof window.QB === 'undefined') {
    window.QB = QB;
  }
  return QB;
}(QB || {}, window));


// Actual QuickBlox API starts here
function QuickBlox() {
  if (config.debug) {console.log('Quickblox instantiated', this);}
}

QuickBlox.prototype.init = function init(appId, authKey, authSecret, debug) {
  this.session =  null;
  this.service = new Proxy(this);
  this.auth = new Auth(this.service);
  this.users = new Users(this.service);
  this.messages = new Messages(this.service);
  this.location = new Location(this.service);
  this.data = new Data(this.service);
  this.content = new Content(this.service);
  if (typeof appId === 'object') {
    debug = appId.debug;
    authSecret = appId.authSecret;
    authKey = appId.authKey;
    appId = appId.appId;
  } else if (typeof appId === 'string' && typeof authKey === 'undefined' && typeof authSecret === 'undefined') {
    this.session = { token: appId };
    appId = null;
    debug = true;
  }
  config.creds.appId = appId;
  config.creds.authKey = authKey;
  config.creds.authSecret = authSecret;
  if (debug) {
    config.debug = debug;
    console.log('QuickBlox.init', this);
  }
};

QuickBlox.prototype.config = config;

QuickBlox.prototype.createSession = function (params, callback) {
  this.auth.createSession(params, callback);
};

QuickBlox.prototype.destroySession = function(callback) {
  if (this.session) {
    this.auth.destroySession(callback);
  }
};

QuickBlox.prototype.login = function (params, callback) {
  this.auth.login(params, callback);
};

QuickBlox.prototype.logout = function(callback) {
  if (this.session) {
    this.auth.logout(callback);
  }
};

// Browserify exports
module.exports = (typeof QB === 'undefined') ? new QuickBlox() : QuickBlox;
