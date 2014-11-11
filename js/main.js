/*
 * QuickBlox JavaScript SDK
 *
 * RequireJS config and main file
 *
 */

var requirejs = require('requirejs');

requirejs.config({
  baseUrl: 'js',
  nodeRequire: require,

  shim: {
    strophe: {
      exports: 'Strophe'
    }
  },

  paths: {
    // libs
    strophe: '../lib/strophe/strophe',

    QuickBlox: 'quickblox',
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

var QuickBlox = requirejs('QuickBlox');

// Window scoped variable (QB) for using in browsers
if (typeof window !== 'undefined' && typeof window.QB === 'undefined') {
  window.QB = new QuickBlox();
}

// Node.js exports
module.exports = new QuickBlox();
module.exports.QuickBlox = QuickBlox;
