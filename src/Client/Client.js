import Crypto from 'crypto-js/hmac-sha1';
import axios from 'axios';

import ERRORS from '../Error.js';
import config from '../config.js';
import {urls as defaultUrls, endpoints as defaultEndpoints } from '../defaults.js';

import User from '../User/User.js';

// import QBRESTController from '../QBRESTController.js';

// import {QBRESTController as restController} from '../QBRESTController.js';

class Client extends User {
  constructor(creds, opts = {}) {
    super();

    if(!creds || !creds.appId) {
      throw new Error(Client.ERRORS['InvalidConfigurationError'].message);
    }

    this._appId = creds.appId;
    this._authKey = creds.authKey ? creds.authKey : null;
    this._authSecret = creds.authSecret ? creds.authSecret : null;

    Object.assign(this, config);
    
    this._urls = {};
    Object.assign(this._urls, defaultUrls, opts.urls);

    this._endpoints = {};
    Object.assign(this._endpoints, defaultEndpoints, opts.endpoints);

    this.version = '3.0.0';
  }

  auth() {
    return new Promise((resolve, reject) => {
      this._createApplicationSession().then((responce) => {
        console.log(responce.data.session.token);
        resolve(responce.data.session.token);
      }).catch(error => {
        reject(error);
      });
    });
  }

  _createApplicationSession() {
    const self = this;

    return new Promise((resolve, reject) => {
      let authMessage = this._generateAuthMessage(this._appId, this._authKey);
      authMessage.signature = this._signAuthMessage(authMessage, this._authSecret);
      // console.log(authMessage);
      axios({
        method: 'POST',
        url: `https://${self._endpoints.api}/${self._urls.session}.json`,
        data: authMessage
      }).then(function(data) {
        resolve(data);
      }).catch(function(error) {
        reject(error);
      });
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
}

Client.ERRORS = ERRORS;

export default Client;
