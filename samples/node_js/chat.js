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
    'id': 15130505,
    'name': 'chatQbBot',
    'login': 'chatQbBot',
    'pass': 'chatQbBot'
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

        // console.log('[Sample] - Connected');

        // var dialogJid = '5788b425a28f9ac53900001c';

        // QB.chat.muc.join(dialogJid, function(error) {
        //     if(error) {
        //         throw new Error('Join to dialog is failed');
        //     }

        //     var msg = {
        //         type: 'groupchat',
        //         body: "How are you today?",
        //         extension: {
        //             save_to_history: 1,
        //         }
        //     };

        //     QB.chat.send(dialogJid, msg);
        // });

        QB.chat.onMessageListener = function(userId, receivedMessage){
            console.log('onMessageListener', userId, receivedMessage);
            
            if(receivedMessage.body) {
                var msg = receivedMessage.body.toLowerCase() === 'yes' ? 'Gooood, bro' : 'Everyone says:"' + receivedMessage.body + '", are you want to buy a white elephant?.';
     
                var answer = {
                    type: 'chat',
                    body: msg,
                    extension: {
                        save_to_history: 1,
                    }
                };

                QB.chat.send(userId, answer);
            }
        };
    });
 
});

process.on('exit', function () {
    QB.chat.disconnect();
});
