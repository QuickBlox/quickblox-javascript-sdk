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
    
  },

  packages: [
    
  ],

  paths: {
    config: 'qbConfig',
    Utils: 'qbUtils',
    Proxy: 'qbProxy',

    App: 'qbApp',
    Auth: 'modules/qbAuth',
    Users: 'modules/qbUsers',
    Chat: 'modules/qbChat',
    Content: 'modules/qbContent',
    Location: 'modules/qbLocation',
    Messages: 'modules/qbMessages',
    Data: 'modules/qbData'
  }
});

requirejs(['App'],
function (App) {
  


});
