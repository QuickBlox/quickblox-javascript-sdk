'use strict';

var CryptoSHA1 = require('crypto-js/hmac-sha1');
var Promise = require('bluebird');

var CONFIG = require('./qbConfig');
var UTILS = require('./qbUtils');

/**
 * @private
 * SessionManager - Session AutoManagment
 * SessionManager является частью qbProxy
 *
 * There are 3 types of session (http://quickblox.com/developers/Authentication_and_Authorization#Access_Rights):
 * 1. API Application (AS). 
 * 2. User session (US).
 * 3. Account owner (AO).
 * 
 * 1. How is SessionManager works?
 * SessionManager управляет сессией, обновляет и сохраняет (document.cookie - qb*) предыдущее состояние,
 * а так же данные для повторного создания сессии.
 *
 * Cases:
 * 1.Перед создание сессии проверяется хранилище на наличие токена.
 *   Если в хранилище есть токен, тогда проверяется соответствие appId и количество пройденного времени с config.expiredTime.
 *   
 *   1.1 Создание API Application (AS).
 *   After this action you have a read rules.
 *   ```javascript
 *     QB.init(creds.appId, creds.authKey, creds.authSecret, config); // return a Promise with get a session token.
 *   ```
 *   
 *   1.2 Update AS to User session.
 *   After create a AS session by QB.init with apps parameters you can login by user.
 *   ```javascript
 *     QB.login(userParams, function(err, result) {
 *       console.log('LOGIN Callback', result, err);
 *     });
 *   ```
 * @param {Object} [args] - Object of parameters
 * @param {Number} args[].appId - id of current app, get a appId from qb admin panel. Require param
 * @param {String} args.[].authKey - Authentication Key, get a appId from qb admin panel.
 * @param {String} args.[].authSecret - 
 * 
 */
function SessionManager() {
    this.session = null; // info session
    this.onerror = null; // save a handler for session reestablish error
    this.lastRequest = {}; // a parameters for the last request
    this.createSessionParams = {}; // saved params for create the session again

    this._SAVED_TOKEN_NAME = 'qbst';
    this._SAVED_APP_ID = 'qbai';
    this._SAVED_USER_ID = 'qbui';

    this._CREATE_SESSION_PARAMS = 'qbcsp';
}

SessionManager._ajax = typeof window !== 'undefined' ? require('./plugins/jquery.ajax').ajax : require('request');

SessionManager._b64EncodeUnicode = function(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
};

SessionManager._b64DecodeUnicode = function(str) {
     return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
};

SessionManager._getFromCookie = function(name) {
    var regExp = new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)");
    var matches = document.cookie.match(regExp);

    return matches ? SessionManager._b64DecodeUnicode(matches[1]) : false;
};

SessionManager.prototype.destroy = function(){
    this.session = null;
    this.onerror = null;
    this.lastRequest = {};
    this.createSessionParams = {};

    var cookies = document.cookie.split(';');

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf('=');
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
};

SessionManager.prototype.create = function(params) {
    var self = this,
        reqData = {
            'type': 'POST',
            'url': UTILS.getUrl(CONFIG.urls.session)
        };

    return new Promise(function(resolve, reject) {
        var savedToken = self._getSavedToken(params);

        self.session = {};

        if(savedToken) {
            self.session.token = savedToken;
            resolve(self.session.token);
        } else {
            reqData.data = self._createASRequestParams(params);

            SessionManager._ajax(reqData).done(function(response) {
                self.createSessionParams = params;
                self.session = response.session;

                // save cookies without expired time
                // save for a browser session (when browser will be close cookie will be a remove)
                var now = new Date();
                var time = now.getTime();
                var expireTime = CONFIG.sessionManagement.expiredTime * 3600;
                
                now.setTime(expireTime);

                document.cookie = self._SAVED_TOKEN_NAME + '=' + SessionManager._b64EncodeUnicode(self.session.token) + ';expires='+ now.toGMTString() +';path=/';
                document.cookie = self._CREATE_SESSION_PARAMS + '=' + SessionManager._b64EncodeUnicode(JSON.stringify(params)) + ';expires='+ now.toGMTString() +';path=/';

                resolve(self.session.token);
            }).fail(function(jqXHR, textStatus) {
                this.session = null;
                reject(jqXHR, textStatus);
            });
        }
    });
};

SessionManager.prototype._createASRequestParams = function (params) {
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

    var reqParams = {
        'application_id': params.appId,
        'auth_key': params.authKey,
        'nonce': randomNonce(),
        'timestamp': unixTime()
    };

    reqParams.signature = signRequest(reqParams, params.authSecret);

    return reqParams;
};

SessionManager.prototype._getSavedToken = function (params) {
    var self = this;
    var token = SessionManager._getFromCookie(this._SAVED_TOKEN_NAME);

    if(!token) {
        return false;
    }

    var credsApp = JSON.parse(SessionManager._getFromCookie(this._CREATE_SESSION_PARAMS));

    if(params.appId === (+credsApp.appId)) {
        self.createSessionParams = credsApp;
        return token;
    } else {
        return false;
    }
};

SessionManager.prototype.reestablish = function() {
    var self = this,
        reqData = {
            'type': 'POST',
            'url': UTILS.getUrl(CONFIG.urls.session)
        };

    reqData.data = self._createASRequestParams(self.createSessionParams);

    return new Promise(function(resolve, reject) {
        SessionManager._ajax(reqData).done(function(response) {
            self.session = response.session;

            document.cookie = self._SAVED_TOKEN_NAME + '=' + SessionManager._b64EncodeUnicode(self.session.token);
            document.cookie = self._SAVED_APP_ID + '=' + SessionManager._b64EncodeUnicode(params.appId);

            resolve(self.session.token);
        }).fail(function(jqXHR, textStatus) {
            this.session = null;
            reject(jqXHR, textStatus);
        });
    });
};









































// SessionManager.prototype.getSessionFromCookie = function() {
//     var sessionToken = SessionManager._getSessionTokenFromCookie('qbst'),
//         sessionDateExp = SessionManager._getSessionTokenFromCookie('qbstte');

//     // if(sessionToken && sessionDateExp) {
//     //     sessionDateExp
//     // }

// };


/*
 * Get session info from server
 */
// SessionManager.prototype.sync = function() {
//     var self = this;

//     var reqParams = {
//         'url': UTILS.getUrl(CONFIG.urls.session),
//         beforeSend: function(jqXHR) {
//             jqXHR.setRequestHeader('QB-Token', self.session.token);
//             jqXHR.setRequestHeader('QB-SDK', 'JS ' + CONFIG.version + ' - Client');
//         }
//     };

//     return new Promise(function(resolve, reject) {
//         SessionManager._ajax(reqParams)
//             .done(function(response) {
//                 self.session = response;
//                 console.info('SYNC', self.session);

//                 resolve(response);
//             }).fail(function(jqXHR, textStatus) {
//                 console.error('SYNC', textStatus);
//                 reject(jqXHR, textStatus);
//             });
//     });
// };

// SessionManager.prototype.destroy = function(){
//     var self = this;
    
    // var reqParams = {
    //     'type': 'DELETE',
    //     'dataType': 'text',
    //     'url': UTILS.getUrl(CONFIG.urls.session),
    //     beforeSend: 
    // }
    
    
    // return new Promise(function(resolve, reject) {
    //     SessionManager._ajax(reqParams)
    //         .done(function(response) {
    //             self.session = null;
    //             console.info(response);
    //             resolve(response);
    //         }).fail(function() {
    //             console.info(response);
    //             reject(jqXHR, textStatus);
    //         });
    // });
// };

module.exports = SessionManager;
