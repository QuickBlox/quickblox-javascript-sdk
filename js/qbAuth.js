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
  //this.session = qb.session;
  this._nonce = Math.floor(Math.random() * 10000);
  this.service = service;
}

AuthProxy.prototype.createSession = function createSession(params, callback) {
  var message, _this = this;

  // Allow first param to be a hash of arguments used to override those set in init
  // or
  if (typeof params === 'function' && typeof callback === 'undefined'){
    callback = params;
    params = {};
  }

  // Allow params to override config
  message = {
    application_id : params.appId || config.creds.appId,
    auth_key : params.authKey || config.creds.authKey,
    nonce: this.nonce().toString(),
    timestamp: utils.unixTime()
  };

  // Optionally permit a user session to be created
  if (params.login && params.password) {
    //message.user = { login : params.login, password : params.password};
    message.user = {login : params.login, password: params.password};
  } else if (params.email && params.password) {
    message.user = {email: params.email, password: params.password};
  }
  if (params.social && params.social.provider) {
    message.provider = social.provider;
    message.scope = params.social.scope;
    message.keys = { token: params.social.token, secret: params.social.secret };
  }
  // Sign message with SHA-1 using secret key and add to payload
  this.signMessage(message,  params.authSecret || config.creds.authSecret);

  //if (config.debug) {console.debug('Creating session using', message, jQuery.param(message));}
  this.service.ajax({url: sessionUrl, data: message, type: 'POST'},
                    function handleProxy(err,data){
                      var session;
                      if (data) {
                        session = data.session;
                        _this.session = session;
                      }
                      if (config.debug) { console.debug('AuthProxy.createSession', session); }
                      callback(err,session);
                    });
};

// Currently fails due a CORS issue
AuthProxy.prototype.destroySession = function(callback){
  var _this = this, message;
  message = {
    token: this.session.token
  };
  //if (config.debug) {console.debug('Destroy session using', message, jQuery.param(message));}
  this.service.ajax({url: sessionUrl, type: 'DELETE'},
                    function(err,data){
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

AuthProxy.prototype.signMessage= function(message, secret){
  var data = jQuery.param(message);
  var toSign = data.replace(/%5B/g, '[');
  toSign = toSign.replace(/%5D/g ,']');
  signature =  crypto(toSign, secret).toString();
  //if (config.debug) { console.debug ('Signature of', toSign, 'is', signature); }
  jQuery.extend(message, {signature: signature});
};
