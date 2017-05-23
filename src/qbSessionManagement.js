'use strict';

var CryptoSHA1 = require('crypto-js/hmac-sha1');
var Promise = require('bluebird');

var CONFIG = require('./qbConfig');
var UTILS = require('./qbUtils');

function SessionManager(appCreds, params) {
  this._appParams = appCreds;
  this._userParams = null;

  this._session = null; // session token
  this._lastValidRequestTime = null;
  this._lastRequest = {};

  this.liveTime = params.expiredTime;
  this.onerror = params.onerror; // client handle of error

  this._QB_APP_CREDS = 'QBAC';
  this._QB_USER_PARAMS = 'QBUP';
  this._QB_SESSION = 'QBS';
  this._QB_SESSION_LIVETIME = 'QBSLT';

  UTILS.QBLog('[SessionManager] switched ON');

  this._init();
}
/* STATIC METHODS */
SessionManager._ajax = require('./plugins/jquery.ajax').ajax;

SessionManager.isEqualObj = function(f, s) {
  var keysF = Object.keys(f);
  var keysS = Object.keys(s);

  if ( keysF.length != keysS.length ) {
    return false;
  }

  return !keysF.filter(function( key ){
    if ( typeof f[key] == 'object' ||  Array.isArray( f[key] ) ) {
      return !Object.equal(f[key], s[key]);
    } else {
      return f[key] !== s[key];
    }
  }).length;
};

SessionManager._b64EncodeUnicode = function(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
    function toSolidBytes(match, p1) {
      return String.fromCharCode('0x' + p1);
  }));
};

SessionManager._b64DecodeUnicode = function(str) {
  return decodeURIComponent(atob(str).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
};

SessionManager.prototype._init = function() {
  var self = this;

  var encodedAppCreds = sessionStorage.getItem(self._QB_APP_CREDS);
  var appCreds = encodedAppCreds ? JSON.parse( SessionManager._b64DecodeUnicode(encodedAppCreds) ) : null;

  if(appCreds && SessionManager.isEqualObj(appCreds, self._appParams)) {
    var encodedUserParams = sessionStorage.getItem(self._QB_USER_PARAMS);
    var userParams = encodedUserParams ? JSON.parse( SessionManager._b64DecodeUnicode(encodedUserParams) ) : null;

    if(userParams) {
      self._userParams = userParams;
    }

    var encodedSession = sessionStorage.getItem(self._QB_SESSION);
    var session = encodedSession ? JSON.parse( SessionManager._b64DecodeUnicode(encodedSession) ) : null;

    if(session) {
      self._session = session;
    }

    var ecodedSessionLivetime = sessionStorage.getItem(self._QB_SESSION_LIVETIME);
    var sessionLivetime = ecodedSessionLivetime ? JSON.parse( SessionManager._b64DecodeUnicode(ecodedSessionLivetime) ) : null;


    if(sessionLivetime) {
      self._lastValidRequestTime = sessionLivetime;
    }
  } else {
    window.localStorage.setItem(self._QB_APP_CREDS, SessionManager._b64EncodeUnicode( JSON.stringify( self._appParams ) ));

    window.localStorage.removeItem(self._QB_USER_PARAMS);
    window.localStorage.removeItem(self._QB_SESSION);
    window.localStorage.removeItem(self._QB_SESSION_LIVETIME);
  }
};

SessionManager.prototype.isSessionValid = function() {
    return this._session !== null && this._isSessionExpiredByLivetime();
};

SessionManager.prototype._isSessionExpiredByLivetime = function() {
    var liveTimeInMillisec = this.liveTime * 60 * 1000;
    var timeFromLastRequestInMillisec = Date.now() - this._lastValidRequestTime;

    return this._lastValidRequestTime !== null && (liveTimeInMillisec > timeFromLastRequestInMillisec);
};

SessionManager.prototype.createSession = function() {
  UTILS.QBLog('[SessionManager] createSession starting...');

  var self = this;

  var requestData = {
      'type': 'POST',
      'url': UTILS.getUrl(CONFIG.urls.session),
      'data': this._getAuthMsg()
  };

  return new Promise(function(resolve, reject) {
    SessionManager._ajax(requestData)
      .done(function(res) {
        self._lastValidRequestTime = Date.now();
        self._session = res.session.token;

        window.localStorage.setItem(self._QB_SESSION_LIVETIME, SessionManager._b64EncodeUnicode( JSON.stringify( self._lastValidRequestTime ) ) );
        window.localStorage.setItem(self._QB_SESSION, SessionManager._b64EncodeUnicode( JSON.stringify( self._session ) ) );

        resolve();
      }).fail(function(jqXHR, textStatus) {
        self._session = null;
        self._lastValidRequestTime = null;

        window.localStorage.clear();

        reject(textStatus);
    });
  });
};

SessionManager.prototype._getAuthMsg = function() {
  function randomNonce() {
    return Math.floor(Math.random() * 10000);
  }

  function unixTime() {
    return Math.floor(Date.now() / 1000);
  }

  function serialize(obj) {
    var serializedRequest = Object.keys(obj).reduce(function(accumulator, currentVal, currentIndex, array) {
      accumulator.push(currentVal + '=' + obj[currentVal]);

      return accumulator;
    }, []).sort().join('&');

    return serializedRequest;
  }

  function signRequest(reqParams, salt) {
    var serializedRequest = serialize(reqParams);

    return new CryptoSHA1(serializedRequest, salt).toString();
  }

  var self = this;

  var reqParams = {
    'application_id': self._appParams.appId,
    'auth_key': self._appParams.authKey,
    'nonce': randomNonce(),
    'timestamp': unixTime()
  };

  if(self._userParams) {
    reqParams.user = {};

    for(var i in self._userParams) {
      reqParams.user[i] = self._userParams[i];
    }
  }

  reqParams.signature = signRequest(reqParams, self._appParams.authSecret);

  return reqParams;
};

SessionManager.prototype.updateLiveTime = function() {
  this._lastValidRequestTime = Date.now();
  window.localStorage.setItem(this._QB_SESSION_LIVETIME, SessionManager._b64EncodeUnicode( JSON.stringify( this._lastValidRequestTime ) ) );
};

SessionManager.prototype.saveUserParams = function(obj) {
  var self = this;

  if(obj === null) {
    self._userParams = null;
    window.localStorage.removeItem(self._QB_USER_PARAMS);
  } else {
    self._userParams = obj;
    window.localStorage.setItem(this._QB_USER_PARAMS, SessionManager._b64EncodeUnicode( JSON.stringify( self._userParams ) ) );
  }
};

module.exports = SessionManager;
