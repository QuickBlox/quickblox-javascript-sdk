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

var Auth = require('./modules/qbAuth');
var Users = require('./modules/qbUsers');
var Chat = require('./modules/qbChat');
var Content = require('./modules/qbContent');
var Location = require('./modules/qbLocation');
var Messages = require('./modules/qbMessages');
var Data = require('./modules/qbData');

// Creating a window scoped QB instance
if (typeof window !== 'undefined' && typeof window.QB === 'undefined') {
  window.QB = new QuickBlox();
}

// Actual QuickBlox API starts here
function QuickBlox() {}

QuickBlox.prototype.init = function(appId, authKey, authSecret, debug) {
  if (debug && typeof debug === 'boolean') config.debug = debug;
  else if (debug && typeof debug === 'object') config.set(debug);
  
  this.service = new Proxy();
  this.auth = new Auth(this.service);
  this.users = new Users(this.service);
  this.chat = new Chat(this.service);
  this.content = new Content(this.service);
  this.location = new Location(this.service);
  this.messages = new Messages(this.service);
  this.data = new Data(this.service);
  
  // Initialization by outside token
  if (typeof appId === 'string' && !authKey && !authSecret) {
    this.service.setSession({ token: appId });
  } else {
    config.creds.appId = appId;
    config.creds.authKey = authKey;
    config.creds.authSecret = authSecret;
  }
  if(console && config.debug) console.log('QuickBlox.init', this);
};

QuickBlox.prototype.createSession = function(params, callback) {
  this.auth.createSession(params, callback);
};

QuickBlox.prototype.destroySession = function(callback) {
  this.auth.destroySession(callback);
};

QuickBlox.prototype.login = function(params, callback) {
  this.auth.login(params, callback);
};

QuickBlox.prototype.logout = function(callback) {
  this.auth.logout(callback);
};

// Browserify exports
module.exports = (typeof window === 'undefined') ? new QuickBlox() : QuickBlox;
