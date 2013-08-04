/* 
 * QuickBlox JavaScript SDK
 *
 * Configuration Module
 *
 */

// Browserify exports

var config = {
  creds:{
    appId: '',
    authKey: '',
    authSecret: ''
  },
  urls:{
    base: 'https://api.quickblox.com/',
    session: 'session',
    login: 'login',
    users: 'users',
    chat: 'chat',
    type: '.json'
    },
  debug: false
};

module.exports = config;
