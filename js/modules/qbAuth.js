/*
 * QuickBlox JavaScript SDK
 *
 * Authentication Module
 *
 */

// Browerify exports and dependencies
module.exports = AuthProxy;
var config = require('../qbConfig');
var Utils = require('../qbUtils');
var crypto = require('crypto-js/hmac-sha1');

function AuthProxy(service) {
  this.service = service;
}

AuthProxy.prototype.createSession = function(params, callback) {
  var _this = this, message;

  if (typeof params === 'function' && typeof callback === 'undefined') {
    callback = params;
    params = {};
  }

  // Signature of message with SHA-1 using secret key
  message = generateAuthMsg(params);
  console.log(message);
  signature = signMessage(message, config.creds.authSecret);
  console.log(signature);
  message.signature = signature;
  console.log(message);

  this.service.ajax({url: Utils.getUrl(config.urls.session), data: message, type: 'POST'},
                    function(err, data) {
                      if (config.debug) { console.log('AuthProxy.createSession callback', err, data); }
                      if (data && data.session) {
                        _this.service.setSession(data.session);
                        callback(err,data.session);
                      } else {
                        callback(err, null);
                      }
                    });
};

AuthProxy.prototype.destroySession = function(callback) {
  var _this = this, message;
  message = {
    token: this.service.getSession().token
  };
  this.service.ajax({url: Utils.getUrl(config.urls.session), type: 'DELETE', dataType: 'text'},
                    function(err,data){
                      if (config.debug) {console.log('AuthProxy.destroySession callback', err, data);}
                      if (err === null){
                        _this.service.setSession(null);
                      }
                      callback(err,true);
                    });
};

AuthProxy.prototype.login = function(params, callback) {
  var _this = this;
  if (this.service.getSession() !== null) {
    params.token = this.service.getSession().token;
    this.service.ajax({url: Utils.getUrl(config.urls.login), type: 'POST', data: params},
                      function(err, data) {
                        if (err) { callback(err, data);}
                        else { callback(err,data.user);}
                      });
  } else {
    this.createSession(function(err,session){
      params.token = session.token;
      _this.service.ajax({url: Utils.getUrl(config.urls.login), type: 'POST', data: params},
                      function(err, data) {
                        if (err) { callback(err, data);}
                        else { callback(err,data.user);}
                      });
    });
  }
};

AuthProxy.prototype.logout = function(callback) {
  var message;
  message = {
    token: this.service.getSession().token
  };
  this.service.ajax({url: Utils.getUrl(config.urls.login), dataType:'text', data:message, type: 'DELETE'}, callback);
};

function generateAuthMsg(params) {
  var message = {
    application_id: config.creds.appId,
    auth_key: config.creds.authKey,
    nonce: Utils.randomNonce(),
    timestamp: Utils.unixTime()
  };
  
  // With user authorization
  if (params.login && params.password) {
    message.user = {login: params.login, password: params.password};
  } else if (params.email && params.password) {
    message.user = {email: params.email, password: params.password};
  } else if (params.provider) {
    // Via social networking provider (e.g. facebook, twitter etc.)
    message.provider = params.provider;
    message.keys = {token: params.keys.token};
    if (params.scope) {
      message.scope = params.scope;
    }
    if (params.keys.secret) {
      messages.keys.secret = params.keys.secret;
    }
  }
  
  return message;
}

function signMessage(message, secret) {
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
  
  var signature =  crypto(sessionMsg, secret).toString();
  return signature;
}
