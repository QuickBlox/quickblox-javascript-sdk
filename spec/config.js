/*eslint strict:off */

(function() {
    'use strict';

    var CREDS =  {
        'appId': 72448,
        'authKey': 'f4HYBYdeqTZ7KNb',
        'authSecret': 'ZC7dK39bOjVc-Z8'
    };

    var QBUser1 = {
        'id': 55754625,
        'login': "webrtctest1",
        'password': "x6Bt0VDy5",
        'email': "webrtctest1@test.com"
    };
    var QBUser2 = {
        'id': 55754637,
        'login': "webrtctest2",
        'password': "x6Bt0VDy5",
        'email': "webrtctest2@test.com"
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
