(function() {
  'use strict';

  /**
   * Config file used to test SDK
   */
  var CREDENTIALS =  {
    appId: 29650,
    authKey: 'WULOyezrmxpOgQ-',
    authSecret: 'TqQmBFbANJ6cfu4'
  };

  var QBUser1 = {
      id: 6126733,
      login: "js_jasmine1",
      password: "js_jasmine1"
    },
    QBUser2 = {
      id: 6126741,
      login: "js_jasmine2",
      password: "js_jasmine2"
    };

  var CONFIG = {
    debug: {mode: 0, file: null}
  };

  /**
   * Check Node env.
   * If we use Node env. export variables
   * or window as global variable for browser env.
   */
  var isNodeEnv = typeof window == 'undefined' && typeof exports == 'object',
    customExport = isNodeEnv ? exports : window;

  customExport.CREDENTIALS = CREDENTIALS;
  customExport.QBUser1 = QBUser1;
  customExport.QBUser2 = QBUser2;
  customExport.CONFIG = CONFIG;
}());
