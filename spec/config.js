(function() {
    'use strict';

    var CREDS =  {
        'appId': 29650,
        'authKey': 'WULOyezrmxpOgQ-',
        'authSecret': 'TqQmBFbANJ6cfu4'
    };

    var QBUser1 = {
            'id': 23286054,
            'login': "js_jasmine11",
            'password': "js_jasmine11",
            'email': "js_jasmine11@quickblox.com"
        },
        QBUser2 = {
            'id': 6126741,
            'login': "js_jasmine2",
            'password': "js_jasmine2"
        };

    var CONFIG = {
      endpoints: {
        api: "api.quickblox.com", // set custom API endpoint
        chat: "chat.quickblox.com" // set custom Chat endpoint
      },
      chatProtocol: {
        active: 2 // set 1 to use BOSH, set 2 to use WebSockets (default)
      },
      'debug': {
          'mode': 0,
          'file': null
      }
    };


    /**
     * Check Node env.
     * If we use Node env. export variables
     * or window as global variable for browser env.
     */
    var isNodeEnv = typeof window == 'undefined' && typeof exports == 'object',
        customExport = isNodeEnv ? exports : window;

    customExport.CREDS = CREDS;
    customExport.QBUser1 = QBUser1;
    customExport.QBUser2 = QBUser2;
    customExport.CONFIG = CONFIG;
}());
