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
    find: 'find',
    session: 'session',
    login: 'login',
    users: 'users',
    pushtokens: 'push_tokens',
    subscriptions: 'subscriptions',
    events: 'events',
    pullevents: 'pull_events',
    geo: 'geodata',
    places: 'places',
    data: 'data',
    content: 'blobs',
    chat: 'chat',
    type: '.json'
  },
  debug: false
};

// Browserify exports
module.exports = config;
