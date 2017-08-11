import config from '../config.js';
import {urls as defaultUrls, endpoints as defaultEndpoints } from '../defaults.js';

import ERRORS from '../Error.js';
import User from '../User/User.js';

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
  }
}

Client.ERRORS = ERRORS;

export default Client;
