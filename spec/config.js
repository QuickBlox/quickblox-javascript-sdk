(function() {
    'use strict';


    var NEW_SERVER = true;

    if(NEW_SERVER){

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

    }else{
      var CREDS =  {
          'appId': 29650,
          'authKey': 'WULOyezrmxpOgQ-',
          'authSecret': 'TqQmBFbANJ6cfu4'
      };

      var QBUser1 = {
              'id': 26904575,
              'login': "js_jasmine22",
              'password': "js_jasmine22",
              'email': "js_jasmine22@quickblox.com"
          },
          QBUser2 = {
              'id': 26904594,
              'login': "js_jasmine222",
              'password': "js_jasmine222"
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
            'mode': 1,
            'file': null
        }
      };

    }


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
