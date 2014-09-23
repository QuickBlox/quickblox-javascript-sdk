/* 
 * QuickBlox JavaScript SDK
 *
 * Configuration Module
 *
 */

var config = {
  version: '1.3.4',
  creds: {
    appId: '',
    authKey: '',
    authSecret: ''
  },
  endpoints: {
    api: 'api.quickblox.com',
    chat: 'chat.quickblox.com',
    muc: 'muc.chat.quickblox.com',
    turn: 'turnserver.quickblox.com',
    s3Bucket: 'qbprod'
  },
  chatProtocol: {
    //bosh: 'http://chat.quickblox.com:8080',
    bosh: 'https://chat.quickblox.com:8081', // With SSL
    websocket: 'ws://chat.quickblox.com:5290',
    active: 1
  },
  urls: {
    session: 'session',
    login: 'login',
    users: 'users',
    chat: 'chat',
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

// Browserify exports
module.exports = config;
