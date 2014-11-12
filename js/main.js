if (typeof define !== 'function') { var define = require('amdefine')(module) }
/*
 * QuickBlox JavaScript SDK
 *
 * RequireJS config and main file
 *
 */

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
      location: 'node_modules/crypto-js',
      main: 'hmac-sha1'
    }
  ],

  paths: {
    // libs
    strophe: 'lib/strophe/strophe.min',

    QuickBlox: 'js/quickblox',
    config: 'js/qbConfig',
    Utils: 'js/qbUtils',
    Proxy: 'js/qbProxy',
    Auth: 'js/modules/qbAuth',
    Users: 'js/modules/qbUsers',
    Chat: 'js/modules/qbChat',
    Content: 'js/modules/qbContent',
    Location: 'js/modules/qbLocation',
    Messages: 'js/modules/qbMessages',
    Data: 'js/modules/qbData'
  }
});

requirejs(['QuickBlox'], function(QuickBlox) {
  // Window scoped variable (QB) for using in browsers
  if (typeof window !== 'undefined' && typeof window.QB === 'undefined') {
    window.QB = new QuickBlox();
  }

  // Node.js exports
  module.exports = new QuickBlox();
  module.exports.QuickBlox = QuickBlox;
});
