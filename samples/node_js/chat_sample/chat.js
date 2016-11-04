'use strict';

/**
 * Before using you need to install universal_rivescript
 * by the command `npm i`
 */

const CONFIGURATION = require('./config');
const USER = CONFIGURATION.QBUser;
const CONFIG = CONFIGURATION.config;
const QBApp = CONFIGURATION.QBApp;
const QB = require('../../../src/qbMain.js');
const RiveScript = require('rivescript');

// Init RiveScript
var riveScriptGenerator = new RiveScript();

function loadingDone(batch_num) {
    console.log(`[RiveScript] Batch #${batch_num} has finished loading!`);

    riveScriptGenerator.sortReplies();
}

function loadingError(batch_num, error) {
    console.log(`[RiveScript] Load the batch #${batch_num} is failed`, JSON.stringify(error));
}

riveScriptGenerator.loadFile('replies.rive', loadingDone, loadingError);

process.on('exit', function () {
    console.log('The qbot is gone.');
    QB.chat.disconnect();
});

/** Start fun */
QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret, CONFIG);

var qbListeners = {
    onSubscribeListener: function (userId) {
        console.log(`[QB] onSubscribeListener. Subscribe from ${userId}`);

        QB.chat.roster.confirm(userId, function() {
            console.log(`[QB] Confirm subscription from user ${userId}`);
        });
    },
    onSystemMessageListener: function (msg) {
        if(msg.extension.notification_type === '1'){
            console.log(`[QB] The user ${msg.userId} adds you to dialog`);

            var roomJid = QB.chat.helpers.getRoomJidFromDialogId(msg.extension.dialog_id);

            QB.chat.muc.join(roomJid);
        }
    },
    onMessageListener: function (userId, msg) {
        var answer;

        if (msg.type == 'groupchat') {

            // - skip own messages in the group chat, don't replay to them
            // - reply only when someone mentions you. For example: "@YourBotBestFriend how are you?"
            var mentionStartIndex = -1;
            var mentionPattern = '@' + USER.name;
            var mentionLength = mentionPattern.length;

            if(msg.body){
                mentionStartIndex = msg.body.indexOf(mentionPattern);
            }

            if(userId != USER.id && mentionStartIndex >= 0){
                // build a reply
                var realBody;

                if(mentionStartIndex === 0 && msg.body.substring(mentionLength, mentionLength+1) == ' '){
                    realBody = msg.body.substring(mentionLength + 1);
                }else{
                    realBody = "What's up? I react only for commands like this: '@YourBotBestFriend <text>'";
                }

                answer = {
                    type: 'groupchat',
                    body: riveScriptGenerator.reply(userId, realBody),
                    extension: {
                        save_to_history: 1
                    }
                };

                QB.chat.send(QB.chat.helpers.getRoomJidFromDialogId(msg.dialog_id), answer);
            }
        } else if (msg.type == 'chat') {
            if(msg.body){
                answer = {
                    type: 'chat',
                    body: riveScriptGenerator.reply(userId, msg.body),
                    extension: {
                        save_to_history: 1
                    }
                };

                QB.chat.send(userId, answer);
            }
        }
    }
};

QB.createSession({
        login: USER.name,
        password: USER.pass
    }, (createSessionError, res) => {
        if(createSessionError) {
            console.error('[QB] createSession is failed', JSON.stringify(createSessionError));
            process.exit(1);
        }

        QB.chat.connect({
            userId: USER.id,
            password: USER.pass
        }, (chatConnectError) => {
            if (chatConnectError) {
                console.log('[QB] chat.connect is failed', JSON.stringify(chatConnectError));
                process.exit(1);
            }

            var getContacts = new Promise((res, rej) => {
                return QB.chat.roster.get((contacts) => {
                    res(contacts);
                });
            });


            var dialogList = new Promise((res, rej) => {
                return QB.chat.dialog.list({type: 2},(dialogListError, dialogList) => {
                    if(dialogListError){
                        rej(dialogListError);
                    }
                    res(dialogList);
                });
            }).catch(err => {
                console.log('[QB] dialog.list is failed', JSON.stringify(err));
                process.exit(1);
            });


            Promise.all([getContacts, dialogList]).then((result) => {
                var contacts = result[0],
                    dialogs = result[1];

                // connect to all group chats.
                dialogs.items.forEach((dialog) => {
                    QB.chat.muc.join(dialog.xmpp_room_jid);
                });
            });

            QB.chat.onMessageListener = qbListeners.onMessageListener;
            QB.chat.onSubscribeListener = qbListeners.onSubscribeListener;
            QB.chat.onSystemMessageListener = qbListeners.onSystemMessageListener;

            QB.chat.onSentMessageCallback = function (err, success) {
                if (err) {
                    console.log('sendErrorCallback', err);
                } else {
                    console.log('sendMessageSuccessCallback', success);
                }
            };
        });
    }
);
