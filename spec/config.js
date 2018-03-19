/*eslint strict:off */

(function() {
    'use strict';

    var CREDS =  {
        'appId': 29650,
        'authKey': 'WULOyezrmxpOgQ-',
        'authSecret': 'TqQmBFbANJ6cfu4'
    };

    var QBUser1 = {
        'id': 45267491,
        'login': "js_specsymbols",
        'password': "[yo^kj?]i246#(!*&d7sm/zb@xwagrv5",
        'email': "js_specsymbols@quickblox.com"
    };
    var QBUser2 = {
        'id': 26904575,
        'login': "js_jasmine22",
        'password': "js_jasmine22",
        'email': "js_jasmine22@quickblox.com"
    };

    var CONFIG = {
        endpoints: {
            api: "api.quickblox.com",
            chat: "chat.quickblox.com"
        },
        chatProtocol: {
            active: 2 // set 1 to use BOSH, set 2 to use WebSockets (default)
        },
        debug: {
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
