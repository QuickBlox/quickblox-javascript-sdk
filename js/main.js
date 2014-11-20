/*
 * QuickBlox JavaScript SDK
 *
 * RequireJS config and main file
 *
 */

if (typeof module !== 'undefined' && module.exports) {
  var requirejs = require('requirejs');
}

requirejs.config({
  nodeRequire: require,

  shim: {
    strophe: {
      exports: 'Strophe'
    }
  },

  packages: [
    {
      name: 'crypto-js',
      location: '../node_modules/crypto-js',
      main: 'hmac-sha1'
    }
  ],

  paths: {
    // libs
    strophe: '../lib/strophe/strophe.min',

    quickblox: 'qbMain',
    config: 'qbConfig',
    Utils: 'qbUtils',
    Proxy: 'qbProxy',
    Auth: 'modules/qbAuth',
    Users: 'modules/qbUsers',
    Chat: 'modules/qbChat',
    Content: 'modules/qbContent',
    Location: 'modules/qbLocation',
    Messages: 'modules/qbMessages',
    Data: 'modules/qbData'
  }
});

requirejs(['quickblox']);
