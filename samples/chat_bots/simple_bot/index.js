'use strict';

const QB = require('../../../src/qbMain.js');

const CONFIG = {
    "appId": "13318",
    "authKey": "WzrAY7vrGmbgFfP",
    "authSecret": "xS2uerEveGHmEun",
    "botUser": {
        "id": "2740296",
        "password": "mehdoh00",
        "fullname": "Your best friend bot"
    }
};

// Initialise QuickBlox
QB.init(CONFIG.appId, CONFIG.authKey, CONFIG.authSecret);

// Connect to Real-Time Chat
QB.chat.connect({
    userId: CONFIG.botUser.id,
    password: CONFIG.botUser.password
  }, (chatConnectError) => {
    if (chatConnectError) {
        console.log('[QB] chat.connect is failed', JSON.stringify(chatConnectError));
        process.exit(1);
    }

    console.log('[QB] Bot is up and running');

    // Add chat messages listener
    QB.chat.onMessageListener = onMessageListener;
});

function onMessageListener(userId, msg) {

  // process 1-1 messages
  if (msg.type == 'chat') {
    if(msg.body){
        let answerMessage = {
            type: 'chat',
            body: msg.body, // echo back original message
            extension: {
                save_to_history: 1
            }
        };

        QB.chat.send(userId, answerMessage);
    }
  }

}

process.on('exit', function () {
    console.log('Kill bot');
    QB.chat.disconnect();
});
