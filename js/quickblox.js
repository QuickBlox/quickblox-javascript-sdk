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

// IIEF to create a window scoped QB instance
var QB = (function(QB, window){
  utils.shims();
  if (typeof QB.config === 'undefined') {
    QB = new QuickBlox();
  }
  if (window && typeof window.QB === 'undefined'){
    window.QB= QB;
  }
}(QB || {}, window));


// Actual QuickBlox API starts here
function QuickBlox() {
  if (config.debug) {console.debug('Quickblox instantiated', this);}
}

QuickBlox.prototype.init = function init(appId, authKey, authSecret, debug) {
  this.proxies = {};
  this.service = new Proxy(this);
  this.session =  null;
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
  if (typeof this.proxies.auth === 'undefined'){
    this.proxies.auth = new Auth(this.service);
    if (this.config.debug) { console.debug('New proxies.auth', this.proxies.auth); }
  }
  this.proxies.auth.createSession(params,
                                  function(err,session) {
                                    if (session) {
                                      _this.session = session;
                                    }
                                  callback(err, session);
                                  });
};

QuickBlox.prototype.destroySession = function(callback){
  var _this = this;
  if (this.proxies.auth) {
    this.proxies.auth.destroySession(function(err, result){
      if (typeof err === 'undefined'){
        _this.session = null;
      }
      callback(err,result);
    });
  }
};

QuickBlox.prototype.login = function (params, callback){
  var _this = this;
  if (typeof this.proxies.auth === 'undefined'){
    this.proxies.auth = new Auth(this.service);
    if (this.config.debug) { console.debug('New proxies.auth', this.proxies.auth); }
  }
  this.proxies.auth.login(params,
                          function (err,session) {
                                    if (session) {
                                      _this.session = session;
                                    }
                                    callback(err, session);
                           });
};

QuickBlox.prototype.logout = function(callback){
  var _this = this;
  if (this.proxies.auth) {
    this.proxies.auth.logout(function(err, result){
      if (typeof err === 'undefined'){
        _this.session = null;
      }
      callback(err,result);
    });
  }
};


QuickBlox.prototype.users = function(){
  if (typeof this.proxies.users === 'undefined') {
    this.proxies.users = new Users(this.service);
    if (this.config.debug) { console.debug('New proxies.users', this.proxies.users); }
  }
  return this.proxies.users;
};

QuickBlox.prototype.messages = function(){
  if (typeof this.proxies.messages === 'undefined') {
    this.proxies.messages = new Messages(this.service);
    if (this.config.debug) { console.debug('New proxies.messages', this.proxies.messages); }
  }
  return this.proxies.messages;
};

QuickBlox.prototype.location = function(){
  if (typeof this.proxies.location === 'undefined') {
    this.proxies.location = new Location(this.service);
    if (this.config.debug) { console.debug('New proxies.location', this.proxies.location); }
  }
  return this.proxies.location;
};





