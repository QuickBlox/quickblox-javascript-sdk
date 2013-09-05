
/*
 *  Contains the default expected settings etc
 *
 */

var DEFAULTS = {
  creds:{
    appId: '',
    authKey: '',
    authSecret: ''
  },
  urls:{
    base: 'https://api.quickblox.com/',
    find: 'find',
    session: 'session',
    login: 'login',
    users: 'users',
    pushtokens: 'push_tokens',
    subscriptions: 'subscriptions',
    events: 'events',
    pullevents: 'pull_events',
    geo: 'geodata',
    data: 'data',
    places: 'places',
    content: 'blobs',
    chat: 'chat',
    type: '.json'
  },
  debug: false
};

// Default timeout for calls to the API
var TIMEOUT = 5000;

var VALID_USER='qb-temp', VALID_PASSWORD = 'someSecret';
var INVALID_USER='notRegistered', INVALID_PASSWORD = 'doNotCare';
