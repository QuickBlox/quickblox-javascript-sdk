/* 
 * QuickBlox JavaScript SDK
 *
 * Configuration Module
 *
 */

var config = {
  version: '1.2.0',
  creds: {
    appId: '',
    authKey: '',
    authSecret: ''
  },
  endpoints: {
    accountId: '',
    api: 'https://api.quickblox.com',
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
  debug: false
};

// Browserify exports
module.exports = config;
