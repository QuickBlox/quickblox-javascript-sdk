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
var utils = require('./qbUtils');
var Users = require('./qbUsers');
var Proxy = require('./qbProxy');
var crypto = require('crypto-js/hmac-sha1');
var jQuery = require('../lib/jquery-1.10.2');

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

function QuickBlox() {
  this.config = {
    appId: '',
    authKey: '',
    authSecret: '',
    debug: false
  };
  this.urls =  {
      base: 'https://api.quickblox.com/',
      session: 'session',
      users: 'users',
      type: '.json'
  };
  this.proxies = {};
  this._nonce = Math.floor(Math.random() * 10000);
  this.service = new Proxy(this);
  if (this.config.debug) {console.debug('Quickblox instantiated', this);}
}

QuickBlox.prototype.nonce = function nonce(){
  return this._nonce++;
};

QuickBlox.prototype.init = function init(appId, authKey, authSecret, debug) {
  if (debug || this.config.debug) {console.debug('QuickBlox.init', appId, authKey, authSecret, debug);}
  if (typeof appId === 'object') {
    debug = appId.debug;
    authSecret = appId.authSecret;
    authKey = appId.authKey;
    appId = appId.appId;
  }
  this.config.appId = appId;
  this.config.authKey = authKey;
  this.config.authSecret = authSecret;
  this.session = null;
  if (debug) {
    this.config.debug = debug;
    console.debug('Debug is', (debug?'ON':'OFF'));
  }
};

QuickBlox.prototype.createSession = function createSession(params, callback) {
  var message, _this = this;

  // Allow first param to be a hash of arguments used to override those set in init
  // could also include (future) user credentials
  if (typeof params === 'function'){
    callback = params;
    params = {};
  }

  // Allow params to override config
  message = {
    application_id : params.appId || this.config.appId,
    auth_key : params.authKey || this.config.authKey,
    nonce: this.nonce().toString(),
    timestamp: utils.unixTime()
  };

  // Optionally permit a user session to be created
  if (params.user && params.user.password) {
    message.user = params.user;
  }
  if (params.social && params.social.provider) {
    message.provider = social.provider;
    message.scope = params.social.scope;
    message.keys = { token: params.social.token, secret: params.social.secret };
  }
  // Sign message with SHA-1 using secret key and add to payload
  this.signMessage(message,  params.authSecret || this.config.authSecret);

  if (this.config.debug) {console.debug('Creating session using', message, jQuery.param(message));}
  this.service.ajax({url: this.urls.base + this.urls.session + this.urls.type, data: message, type: 'POST'}, 
                    function(err,data){
                      var session;
                      if (data) {
                        session = data.session;
                        _this.session = session;
                        _this.sessionChanged(_this);
                      }
                      if (_this.config.debug) { console.debug('QuickBlox.createSession', session); }
                      callback(err,session);
                    });
};

QuickBlox.prototype.signMessage= function(message, secret){
  var data = jQuery.param(message);
  signature =  crypto(data, secret).toString();
  jQuery.extend(message, {signature: signature});
};

// Currently fails due a CORS issue
QuickBlox.prototype.destroySession = function(callback){
  var _this = this, url, message;
  message = {
    token: this.session.token
  };
  if (this.config.debug) {console.debug('Destroy session using', message, jQuery.param(message));}
  this.service.ajax({url: this.urls.base+this.urls.session, type: 'DELETE'},
                    function(err,data){
                      if (typeof err ==='undefined'){
                        _this.session = null;
                      }
                      callback(err,data);
                    });
};

QuickBlox.prototype.sessionChanged= function(qb){
  var name, proxy, proxies = this.proxies;
  for (name in proxies){
    if (proxies.hasOwnProperty(name)){
      if (qb.config.debug) {console.debug('Changing session for proxy', name, qb.session);}
      proxy = proxies[name];
      proxy.config = qb.config;
      proxy.session = qb.session;
    }
  }
};

QuickBlox.prototype.users = function(){
  if (typeof this.proxies.users === 'undefined') {
    this.proxies.users = new Users(this);
    if (this.config.debug) { console.debug('New QuickBlox.users', this.proxies.users); }
  }
  //if (this.config.debug) { console.debug('QuickBlox.users', this.proxies.users); }
  return this.proxies.users;
}
