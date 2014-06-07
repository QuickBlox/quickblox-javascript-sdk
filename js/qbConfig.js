/* 
 * QuickBlox JavaScript SDK
 *
 * Configuration Module
 *
 */

var config = {
  creds: {
    appId: '',
    authKey: '',
    authSecret: ''
  },
  urls: {
    base: 'https://api.quickblox.com/',
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
  version: '1.1.14',
  debug: false
};

// Browserify exports
module.exports = config;
