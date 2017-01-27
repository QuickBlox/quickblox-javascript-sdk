'use strict';

var CryptoSHA1 = require('crypto-js/hmac-sha1');
var Promise = require('bluebird');

var CONFIG = require('./qbConfig');
var UTILS = require('./qbUtils');

/**
 * @private
 * SessionManager - Session AutoManagment
 *
 * There are 3 types of session (http://quickblox.com/developers/Authentication_and_Authorization#Access_Rights):
 * 1. API Application (AS). 
 * 2. User session (US).
 * 3. Account owner (AO).
 *
 * There 4 ways to create a session:
 * 1. Create a AS (without user auth)
 * Need to know: AppID
 * 2. Create a user (US)
 * 3. Login a user (US)
 * 4. Set a exist session (AS/US) 
 *
 * @param {Object} [args] - Object of parameters
 * @param {Number} args[].appId - id of current app, get a appId from qb admin panel. Require param
 * @param {String} args.[].authKey - Authentication Key, get a appId from qb admin panel.
 * @param {String} args.[].authSecret - 
 * 
 */
function SessionManager() {
    this.session = null; // all info all session
    this.onerror = null; // save a handler for session reestablish error 
    this.lastRequest = {}; // a parameters for the last request
    this.createSessionParams = {}; // saved params for create a session again

    // console.info(CONFIG);
}

SessionManager._ajax = typeof window !== 'undefined' ? require('./plugins/jquery.ajax').ajax : require('request');

SessionManager.prototype.create = function(params) {
    var self = this,
        reqData = {
            'type': 'POST',
            'url': UTILS.getUrl(CONFIG.urls.session)
        };
   
    if(params) {
        self.createSessionParams = params;
        reqData.data = self._createASRequestParams(params);
    } else {
        reqData.data = self._createASRequestParams(self.createSessionParams);
    }

    return new Promise(function(resolve, reject) {
        SessionManager._ajax(reqData).done(function(response) {
            self.session = response.session;

            resolve(self.session.token);
        }).fail(function(jqXHR, textStatus) {
            reject(jqXHR, textStatus);
        });
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

/*
 * Get session info from server
 */
SessionManager.prototype.sync = function() {
    var self = this;

    var reqParams = {
        'url': UTILS.getUrl(CONFIG.urls.session),
        beforeSend: function(jqXHR) {
            jqXHR.setRequestHeader('QB-Token', self.session.token);
            jqXHR.setRequestHeader('QB-SDK', 'JS ' + CONFIG.version + ' - Client');
        }
    };

    return new Promise(function(resolve, reject) {
        SessionManager._ajax(reqParams)
            .done(function(response) {
                self.session = response;
                console.info('SYNC', self.session);

                resolve(response);
            }).fail(function(jqXHR, textStatus) {
                console.error('SYNC', textStatus);
                reject(jqXHR, textStatus);
            });
    });
};

SessionManager.prototype.destroy = function(){
    var self = this;
    
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
};

module.exports = SessionManager;
