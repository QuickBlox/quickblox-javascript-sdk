import Crypto from 'crypto-js/hmac-sha1';
import axios from 'axios';

import ERRORS from '../Error.js';
import config from '../config.js';
import {urls as defaultUrls, endpoints as defaultEndpoints } from '../defaults.js';

import eventEmitterMixin from '../eventEmitter/eventEmitterMixin.js';

import User from '../User/User.js';
import Data from '../Data/Data.js';

/**
 * Contains all JS SDK API classes and functions.
 * This is the top level component for any Quickblox based application.
 * 
 * @extends {User}
 */
class Client extends User {
  /**
   * Creates an instance of Client.
   * @param {Object} creds - all of this parameters you could found in admin panel.
   * @param {number} creds.appId - The Id of uses app.
   * @param {string} [creds.authKey] - The authKey of uses app for authorization/ 
   * @param {string} [creds.authSecret] - Uses as salt.
   * @param {any} [opts={}]
   * @memberof Client
   */
  constructor(creds, opts = {}) {
    super();

    if(!creds || !creds.appId) {
      throw new Error(Client.ERRORS['InvalidConfigurationError'].message);
    }

    this.version = '3.0.0';

    this._appId = creds.appId;
    this._authKey = creds.authKey ? creds.authKey : null;
    this._authSecret = creds.authSecret ? creds.authSecret : null;

    Object.assign(this, config);
    
    this._urls = {};
    Object.assign(this._urls, defaultUrls, opts.urls);

    this._endpoints = {};
    Object.assign(this._endpoints, defaultEndpoints, opts.endpoints);

    this.service = axios.create({
      baseURL: `https://${this._endpoints.api}/`,
    });
  }

  auth(userCreds) {
    const self = this;

    return new Promise((resolve, reject) => {
      // auth without user parameters
      // will create an application session 

      // responce always return session and user info
      // user info schema:
      // - 

      // Error schema:
      // 
      if(!userCreds) {
        this._createApplicationSession().then((responce) => {
          // TODO: session management switch on
          // write user info
          let data = responce.data.session;
          
          self.session_token = data.token;
          self.user_id = data.user_id !== 0 ? data.user_id : null;

          resolve();
        }).catch(error => {
          reject(error);
        });
      } 
      else if(userCreds.session) {
        // need to get info about session
        // need to get info about user 

        this._authByExistSession(userCreds.session);
        // .then(function(responce) {

        // }).catch(error => {
        //   reject(error);
        // });
      } 
    });
  }

  // Auth MODULE
  // TODO: make pure function
  _createApplicationSession() {
    const self = this;

    // TODO - check authKey, authSecret

    return new Promise((resolve, reject) => {
      let authMessage = this._generateAuthMessage(this._appId, this._authKey);
      authMessage.signature = this._signAuthMessage(authMessage, this._authSecret);

      // this.service()

      this.service({
        method: 'POST',
        url: `${self._urls.session}.json`,
        data: authMessage
      }).then(function(data) {
        resolve(data);
      }).catch(function(error) {
        reject(error);
      });
    });
  }

  _authByExistSession(sessionToken) {
    const self = this;

    // return new Promise 

    this.service({
      method: 'GET',
      url: `${self._urls.session}.json`,
      headers: {
        'QB-Token': sessionToken
      }
    }).then( (responce) => {
      const userId = responce.data.session.user_id;

      // if(userId && userId !== 0) {
        
      // } 

      // Get user info / if session with user id

      console.log('AA');
      console.log(responce.data.session.user_id);

      // resolve(data);
    }).catch(function(error) {
      console.log('BB');
      console.log(error);
      // reject(error);
    });
  }

  _generateAuthMessage(appId, authKey) {
    /**
     * randomNonce - generate 4-digit number 
     */
    function randomNonce() {
      return Math.floor(Math.random() * 10000);
    }

    /** unixTime - return now in Unix format */
    function unixTime() {
      return Math.floor(Date.now() / 1000);
    }

    return {
      application_id: appId,
      auth_key: authKey,
      nonce: randomNonce(),
      timestamp: unixTime()
    };
  }

  _signAuthMessage(message, salt) {
    const stingify =  Object.keys(message).map(function(key) {
      if (typeof message[key] === 'object') {
        return Object.keys(message[key]).map(function(keySub) {
          return key + '[' + keySub + ']=' + message[key][keySub];
        }).sort().join('&');
      } else {
        return key + '=' + message[key];
      }
    }).sort().join('&');

    return Crypto(stingify, salt).toString();
  }

  createData(className) {
    
    const token = this.session_token;
    const SDK_version = this.version;

    if(!token) {
      throw new Error(ERRORS['AuthorizationRequired'].message);
    }

    let service = axios.create({
      baseURL: `https://${this._endpoints.api}/${this._urls.data}/`,
      headers: {
        'QB-SDK': `Quickblox JS SDK ${SDK_version}`,
        'QB-Token': token
      }
    });

    return new Data(className, service);
  }

  createDataCollection() {

  }

}

Object.assign(Client.prototype, eventEmitterMixin);

Client.ERRORS = ERRORS;

export default Client;
