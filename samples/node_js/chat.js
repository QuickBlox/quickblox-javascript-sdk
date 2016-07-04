/**
 * Start an example 
 * by a command `node PATH_TO/chat.js`
 */

const QB = require('../../src/qbMain.js');

var QBApp = {
    appId: 28287,
    authKey: 'XydaWcf8OO9xhGT',
    authSecret: 'JZfqTspCvELAmnW'
};

/**
 * Configuration
 * http://quickblox.com/developers/Javascript#Configuration
 * chatProtocol (2) uses websocket
 * debug (1) uses console 
 */
var config = {
    chatProtocol: {
        active: 2
    },
    debug: {
        mode: 1
    }
};

var QBUser = {
    'id': 6729114,
    'name': 'quickuser',
    'login': 'chatusr11',
    'pass': 'chatusr11'
};

QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret, config);

/** Create a session */
QB.createSession({
    login: QBUser.login,
    password: QBUser.pass
}, function(csError, res) {
    if(csError) {
        console.error(csError);
        process.exit(1);
    }

    /** Connect to chat */
    QB.chat.connect({
        userId: QBUser.id,
        password: QBUser.pass
    }, function(err) {
        if (err) {
            console.error(err);
            process.exit(1);
        }

        console.log('connect to chat: success');

        QB.chat.onMessageListener = function(userId, receivedMessage){
            console.log('onMessageListener', userId, receivedMessage);
            process.exit(0);
        };

        /** TODO: can't create inner elements in Extraparams (custom parameters) */
        var msg = {
            type: 'chat',
            body: 'Hello from myself',
        };
            // sysMsg  = {
            //     extension: {
            //         param1: "value1",
            //         param2: "value2"
            //     }
            // };


        QB.chat.send(QBUser.id, msg);
        // QB.chat.sendSystemMessage(QBUser.id, sysMsg);
    });
 
});

process.on('exit', function () {
    QB.chat.disconnect();
});
