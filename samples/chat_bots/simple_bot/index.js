'use strict';

const QB = require('../../../src/qbMain.js');

// In order to start develop you first Chat Bot you have to register new QuickBlox account and create your first application.
// Go to https://quickblox.com/signup and get a QuickBlox account, then go to https://admin.quickblox.com/apps/new
// and create your first application. Then put here Application ID, Authorization key, Authorization secret.
//
// also
//
// Go to Users module in QuickBlox dashboard
// (e.g. <your_app_id>/service/users https://admin.quickblox.com/apps/<your_app_id>/service/users) and create
// new user for you chat bot. Then put here user's ID, password and full name.
//
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
