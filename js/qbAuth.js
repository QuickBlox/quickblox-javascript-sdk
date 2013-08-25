/*
 * AuthProxy JavaScript SDK
 *
 * Authentication Module
 *
 */

// Browerify exports and dependencies
module.exports = AuthProxy;
var utils = require('./qbUtils');
var config = require('./qbConfig');
var Proxy = require('./qbProxy');
var jQuery = require('../lib/jquery-1.10.2');
var crypto = require('crypto-js/hmac-sha1');

var sessionUrl = config.urls.base + config.urls.session + config.urls.type;
var loginUrl = config.urls.base + config.urls.login + config.urls.type;

function AuthProxy(service) {
  this.service = service;
}

AuthProxy.prototype.createSession = function createSession(params, callback) {
  var message, _this = this;

  if (typeof params === 'function' && typeof callback === 'undefined'){
    callback = params;
    params = {};
  }
  
  message = generateAuthMsg(params);

  // Sign message with SHA-1 using secret key and add to payload
  message = signMessage(message,  params.authSecret || config.creds.authSecret);

  //if (config.debug) {console.debug('Creating session using', message, jQuery.param(message));}
  this.service.ajax({url: sessionUrl, data: message, type: 'POST', processData: false},
                    function handleProxy(err,data){
                      if (config.debug) { console.debug('AuthProxy.createSession', err, data); }
                      var session;
                      if (data && data.session) {
                        session = data.session;
                        _this.session = session;
                      }
                      callback(err,session);
                    });
};

// Currently fails due a CORS issue
AuthProxy.prototype.destroySession = function(callback){
  var _this = this, message;
  message = {
    token: this.session.token
  };
  this.service.ajax({url: sessionUrl, type: 'DELETE'},
                    function(err,data){
                      if (config.debug) {console.debug('AuthProxy destroySession callback', err, data);}
                      if (typeof err ==='undefined'){
                        _this.session = null;
                      }
                      callback(err,data);
                    });
};

AuthProxy.prototype.login = function(params, callback){
  var _this = this;
  if (this.session) {
    params.token = this.session.token;
    this.service.ajax({url: loginUrl, type: 'POST', data: params},
                      function(err, data) {
                        if (err) { callback(err, data);}
                        else { callback(err,data.user);}
                      });
  } else {
    this.createSession(function(err,session){
      params.token = session.token;
      _this.service.ajax({url: loginUrl, type: 'POST', data: params},
                      function(err, data) {
                        if (err) { callback(err, data);}
                        else { callback(err,data.user);}
                      });
    });
  }
};

AuthProxy.prototype.logout = function(callback){
  var _this = this, message;
  message = {
    token: this.session.token
  };
  //if (config.debug) {console.debug('Logout', message, jQuery.param(message));}
  this.service.ajax({url: loginUrl, type: 'DELETE'}, callback);
};

AuthProxy.prototype.nonce = function nonce(){
  return this._nonce++;
};

function signMessage(message, secret){
  signature =  crypto(message, secret).toString();
  //if (config.debug) { console.debug ('AuthProxy signature of', message, 'is', signature); }
  return message + '&signature=' + signature;
}

function generateAuthMsg(params){
   // Allow params to override config
  var message = {
    application_id : params.appId || config.creds.appId,
    auth_key : params.authKey || config.creds.authKey,
    nonce: Math.floor(Math.random() * 10000),
    timestamp: utils.unixTime()
  };
  // Optionally permit a user session to be created
  if (params.login && params.password) {
    message.user = {login : params.login, password: params.password};
  } else if (params.email && params.password) {
    message.user = {email: params.email, password: params.password};
  } else if (params.provider) {
    // With social networking (eg. facebook, twitter etc) provider
    message.provider = params.provider;
    if (params.scope) {message.scope = params.scope;}
    message.keys = { token: params.keys.token };
    if (params.keys.secret) { messages.keys.secret = params.keys.secret; }
  }

  var sessionMsg = 'application_id=' + message.application_id + '&auth_key=' + message.auth_key;
  if (message.keys && message.keys.token) {sessionMsg+= '&keys[token]=' + message.keys.token;}
  sessionMsg += '&nonce=' + message.nonce;
  if (message.provider) { sessionMsg += '&provider=' + message.provider;}
  sessionMsg += '&timestamp=' + message.timestamp;
  if (message.user) {
    if (message.user.login) { sessionMsg += '&user[login]=' + message.user.login; }
    if (message.user.email) { sessionMsg += '&user[email]=' + message.user.email; }
    if (message.user.password) { sessionMsg += '&user[password]=' + message.user.password; }
  }
  //if (config.debug) { console.debug ('AuthProxy authMsg', sessionMsg); }
  return sessionMsg;
}

