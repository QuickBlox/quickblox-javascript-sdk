/*
 * QuickBlox JavaScript SDK
 *
 * Main SDK module
 *
 * For use in browser provides a convient QB window scoped var.
 * Also exports QuickBlox for using with node.js, browserify, etc. 
 *
 * Token/login service and resource proxy stub factories
 *
 */

// Browserify exports and dependencies
module.exports = QuickBlox;
var config = require('./qbConfig');
var utils = require('./qbUtils');
var Proxy = require('./qbProxy');
var Auth = require('./qbAuth');
var Users = require('./qbUsers');
var Messages = require('./qbMessages');
var Location = require('./qbLocation');
var Data = require('./qbData');

// IIEF to create a window scoped QB instance
var QB = (function(QB, window){
  utils.shims();
  if (typeof QB.config === 'undefined') {
    QB = new QuickBlox();
  }
  if (window && typeof window.QB === 'undefined'){
    window.QB= QB;
  }
  return QB;
}(QB || {}, window));


// Actual QuickBlox API starts here
function QuickBlox() {
  if (config.debug) {console.debug('Quickblox instantiated', this);}
}

QuickBlox.prototype.init = function init(appId, authKey, authSecret, debug) {
  this.session =  null;
  this.service = new Proxy(this);
  this.auth = new Auth(this.service);
  this.users = new Users(this.service);
  this.messages = new Messages(this.service);
  this.location = new Location(this.service);
  this.data = new Data(this.service);
  if (typeof appId === 'object') {
    debug = appId.debug;
    authSecret = appId.authSecret;
    authKey = appId.authKey;
    appId = appId.appId;
  }
  config.creds.appId = appId;
  config.creds.authKey = authKey;
  config.creds.authSecret = authSecret;
  if (debug) {
    config.debug = debug;
    console.debug('QuickBlox.init', this);
  }
};

QuickBlox.prototype.config = config;

QuickBlox.prototype.createSession = function (params, callback){
  var _this = this;
  if (typeof params === 'function') {
    callback = params;
    params = {};
  }
  this.auth.createSession(params, function(err,session) {
    if (session) {
      _this.session = session;
    }
    callback(err, session);
    });
};

QuickBlox.prototype.destroySession = function(callback){
  var _this = this;
  if (this.session) {
    this.auth.destroySession(function(err, result){
      if (typeof err === 'undefined'){
        _this.session = null;
      }
      callback(err,result);
    });
  }
};

QuickBlox.prototype.login = function (params, callback){
  var _this = this;
  this.auth.login(params, function (err,session) {
    if (session) {
      _this.session = session;
    }
    callback(err, session);
  });
};

QuickBlox.prototype.logout = function(callback){
  var _this = this;
  if (this.session) {
    this.auth.logout(function(err, result){
      if (typeof err === 'undefined'){
        _this.session = null;
      }
      callback(err,result);
    });
  }
};

