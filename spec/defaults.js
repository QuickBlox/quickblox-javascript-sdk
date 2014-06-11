
/*
 *  Contains the default expected settings etc
 *
 */

var DEFAULTS = {
  version: '1.2.0',
  creds: {
    appId: '',
    authKey: '',
    authSecret: ''
  },
  endpoints: {
    api: 'api.quickblox.com',
    chat: 'chat.quickblox.com',
    turn: 'turnserver.quickblox.com',
    s3Bucket: 'qbprod'
  },
  urls: {
    session: 'session',
    login: 'login',
    users: 'users',
    blobs: 'blobs',
    geodata: 'geodata',
    places: 'places',
    pushtokens: 'push_tokens',
    subscriptions: 'subscriptions',
    events: 'events',
    data: 'data',
    type: '.json'
  },
  ssl: true,
  debug: false
};

// Default timeout for calls to the API
var TIMEOUT = 5000;

var VALID_USER='qb-temp', VALID_PASSWORD = 'someSecret';
var INVALID_USER='notRegistered', INVALID_PASSWORD = 'doNotCare';
