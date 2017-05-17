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

    UTILS.QBLog('[SessionManager] switched on');

    this._init();
}
/* STATIC METHODS */
SessionManager._ajax = require('./plugins/jquery.ajax').ajax;

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
        self._lastValidRequestTime = new Date(res.session.created_at).getTime();
        self._session = res.session.token;

        window.localStorage.setItem(self._QB_SESSION_LIVETIME,  self._lastValidRequestTime);
        window.localStorage.setItem(self._QB_SESSION, self._session);

        resolve();
      }).fail(function(jqXHR, textStatus) {
        this._session = null;
        self._lastValidRequestTime = null;

        reject(textStatus);
    });
  });
};

SessionManager.prototype.updateLiveTime = function(time) {
  this._lastValidRequestTime = time;
  window.localStorage.setItem(this._QB_SESSION_LIVETIME, this._lastValidRequestTime);
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

SessionManager.prototype._init = function() {
  var self = this;

  var savedAndEncodedAppCreds = sessionStorage.getItem(self._QB_APP_CREDS);
  var savedAppCreds = savedAndEncodedAppCreds ? SessionManager._b64DecodeUnicode(savedAndEncodedAppCreds) : null;

  if(savedAppCreds && SessionManager.isEqualObj(savedAppCreds, self._appParams)) {
    var savedAndEncodedUserParams = sessionStorage.getItem(self._QB_USER_PARAMS);
    var savedUserParams = savedAndEncodedUserParams ? SessionManager._b64DecodeUnicode(savedAndEncodedUserParams) : null;

    var savedAndEncodedSession = sessionStorage.getItem(self._QB_SESSION);
    var savedSession = savedAndEncodedSession ? SessionManager._b64DecodeUnicode(savedAndEncodedSession) : null;

    var savedAndEncodedSessionLivetime = sessionStorage.getItem(self._QB_SESSION_LIVETIME);
    var savedSessionLivetime = savedAndEncodedSessionLivetime ? SessionManager._b64DecodeUnicode(savedAndEncodedSessionLivetime) : null;

    if(savedUserParams) {
      self._userParams = savedUserParams;
    }

    if(savedSession) {
      self._session = savedSession;
      self._lastValidRequestTime = savedSessionLivetime;
    }
  } else {
    var EncodedAppCreds = SessionManager._b64EncodeUnicode(self._appParams);
    window.localStorage.setItem(self._QB_APP_CREDS, EncodedAppCreds);
  }
};

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

// SessionManager._getSavedInitialInfo = function(value) {
//     var regExp = new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)');
//     var matches = document.cookie.match(regExp);

//     return matches ? SessionManager._b64DecodeUnicode(matches[1]) : false;
// };

// SessionManager.prototype._saveToCookie = function(params) {
//     var now = new Date();
//     var time = now.getTime();
//     var expireTime = CONFIG.sessionManagement.expiredTime * 3600;
//     now.setTime(expireTime);

//     document.cookie = SessionManager._SAVED_TOKEN_NAME + '=' + SessionManager._b64EncodeUnicode(this.session.token) + ';expires='+ now.toGMTString() +';path=/';
//     document.cookie = SessionManager._CREATE_SESSION_PARAMS + '=' + SessionManager._b64EncodeUnicode(JSON.stringify(params)) + ';expires='+ now.toGMTString() +';path=/';
// };



// SessionManager.prototype._getSavedInfo = function (params) {
//     var self = this;
//     var token = SessionManager._getFromCookie(this._SAVED_TOKEN_NAME);

//     if(!token) {
//         return null;
//     }

//     var credsApp = +(JSON.parse(SessionManager._getFromCookie(this._CREATE_SESSION_PARAMS)));
//     var userId = +(JSON.parse(SessionManager._getFromCookie(this._SAVED_USER_ID)));

//     if(params.appId === (+credsApp.appId)) {
//         self.createSessionParams = credsApp;

//         return token;
//     } else {
//         return false;
//     }
// };

// SessionManager.prototype.destroy = function(){
//     this.session = null;
//     this.onerror = null;
//     this.lastRequest = {};
//     this.createSessionParams = {};

//     var cookies = document.cookie.split(';');

//     for (var i = 0; i < cookies.length; i++) {
//         var cookie = cookies[i];
//         var eqPos = cookie.indexOf('=');
//         var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
//         document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
//     }
// };



// SessionManager.prototype.reestablishSession = function() {
//     var self = this,
//         reqData = {
//             'type': 'POST',
//             'url': UTILS.getUrl(CONFIG.urls.session)
//         };

//     reqData.data = self._createASRequestParams(self.createSessionParams);

//     return new Promise(function(resolve, reject) {
//         if(self._isReestablished) {
//             reject(SessionManager.ERRORS.reestablish);
//         } else {
//              self._isReestablished = true;

//              SessionManager._ajax(reqData).done(function(response) {
//                 self.session = response.session;

//                 document.cookie = self._SAVED_TOKEN_NAME + '=' + SessionManager._b64EncodeUnicode(self.session.token);
//                 document.cookie = self._SAVED_APP_ID + '=' + SessionManager._b64EncodeUnicode(self.createSessionParams.appId);

//                 self._isReestablished = false;
//                 resolve(self.session.token);
//             }).fail(function(jqXHR, textStatus) {
//                 this.session = null;
//                 reject(textStatus);
//             });
//         }
//     });
// };

// SessionManager.prototype.updateUser = function(params){
//     this.session.id = params.userId;
//     document.cookie = this._SAVED_USER_ID + '=' + SessionManager._b64EncodeUnicode(params.userId);

//     console.info(this.session);
// };



// SessionManager._APP_CREDS = 'qbac';
// SessionManager._SAVED_TOKEN_NAME = 'qbst';
// SessionManager._SAVED_APP_ID = 'qbai';
// SessionManager._SAVED_USER_ID = 'qbui';


module.exports = SessionManager;
