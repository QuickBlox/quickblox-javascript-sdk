(function() {
    'use strict';

    var CREDS =  {
        'appId': 10,
        'authKey': 'XR-B4J64ad6SGvL',
        'authSecret': 'Nw27vzzEVfNXw47'
    };

    var QBUser1 = {
            'id': 4275,
            'login': "js_jasmine22",
            'password': "js_jasmine22",
            'email': "js_jasmine22@quickblox.com"
        },
        QBUser2 = {
            'id': 4276,
            'login': "js_jasmine222",
            'password': "js_jasmine222"
        };

    var CONFIG = {
      endpoints: {
        api: "apikafkacluster.quickblox.com", // set custom API endpoint
        chat: "chatkafkacluster.quickblox.com" // set custom Chat endpoint
      },
      chatProtocol: {
        active: 2 // set 1 to use BOSH, set 2 to use WebSockets (default)
      },
      'debug': {
          'mode': 1,
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
