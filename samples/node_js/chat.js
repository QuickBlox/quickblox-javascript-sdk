"use strict";

/**
 * Start an example 
 * by a command `node PATH_TO/chat.js`
 */

const QB = require('../../src/qbMain.js');

var QBApp = {
    appId: 36125,
    authKey: 'gOGVNO4L9cBwkPE',
    authSecret: 'JdqsMHCjHVYkVxV'
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
    'id': 11878855,
    'name': 'iegor',
    'login': 'kozakov.e@gmail.com',
    'pass': 'distortionds1'
};

var login = 0;

QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret, config);

/** Create a session */
QB.createSession({email: QBUser.login,password: QBUser.pass}, function(csError, res) {
    if(csError) {
        console.error('error',csError);
        process.exit(1);
    }
    console.log('session created successfully');
    /** Connect to chat */
    QB.chat.connect({
        userId: QBUser.id,
        password: QBUser.pass,
        reconnect: false
    }, function(err) {
        if (err) {
            console.log('error',err);
            process.exit(1);
        }

        /* Listener for typing status */
        QB.chat.onMessageTypingListener = function(composing, userId, dialogId) {
            var msg = composing ? 'start typing...' : 'stop typing.';
            console.log('User ' + userId + ' ' + msg);
        };

        /* Listener for getting new messages */
        QB.chat.onMessageListener = function(userId, receivedMessage){
            var notification = receivedMessage.extension.notification_type;

            if(notification === '4'){
                return;
            }

            if(notification === '7'){
                console.log('notification type', notification);
                return;
            }

            if(receivedMessage.body){

                if(receivedMessage.body.toLowerCase() === 'delete me'){
                    removeUser();
                    return;
                }
                var msg = receivedMessage.body.toLowerCase() === 'yes' ? 'Gooood, bro' : 'Everyone says:"' + receivedMessage.body + '", are you want to buy a white elephant?.';

                var answer = {
                    type: 'chat',
                    body: msg,
                    extension: {
                        save_to_history: 1
                    }
                };

                QB.chat.send(userId, answer);
                return;
            }

            return;
        };

        QB.chat.onDeliveredStatusListener = function(status, dialogId, userId){
            console.log('Message from ' + dialogId + ' was getting status ' + status + ' from ' + userId);
        };

        QB.chat.onSubscribeListener = function(userId){
            if(userId === 13486905){
                rejectSubscibtion(userId);
                return;
            }

            QB.chat.roster.confirm(userId, function() {
                confirmSubscriber(userId);
            });
        };


        QB.chat.onConfirmSubscribeListener = function(userId){
            console.log('{{QB.chat.onConfirmSubscribeListener}}', userId);
        };
        
        QB.chat.onSystemMessageListener = function(receivedMessage){
            console.log('{{onSystemMessageListener receivedMessage}}', receivedMessage);
        };

        QB.chat.onRejectSubscribeListener = function(userId){
            console.log('user ' + userId + ' want to remove you from contact list');

            userId = +userId;

            QB.chat.roster.remove(userId, function(){
                QB.chat.roster.get(function(contactList) {
                    console.log(contactList);
                    if(userId in contactList){
                        console.log(userId + ' You can\'t delete this user');
                    } else {
                        console.log(userId + ' was successfully remover');
                    }
                });
            })
        };

        // get contact list of users
        QB.chat.roster.get(function(contactList) {
            for(var key in contactList){
                var userId = +key;
                if(contactList[key].subscription === 'both'){
                    setUserMessageTimeout(key);
                } else if(contactList[key].subscription === 'none') {
                    console.log('trying to remove user without subscription on me', typeof(userId), userId);
                    removeUser(userId);
                }
            }
        });


    });
});

process.on('exit', function () {
    console.log('logout 111');
    QB.chat.disconnect();
    login = 0;
});

function setUserMessageTimeout(userID){
    QB.chat.send(+userID, {
        type: 'chat',
        body: "Hey!!! Are you here? Do you wanna to talk?",
        extension: {
            save_to_history: 1
        }
    });
}

function confirmSubscriber(userId){
    QB.chat.send(userId, {
        'type': 'chat',
        'body': 'Contact request',
        'extension': {
            'save_to_history': 1,
            'notification_type': '5'
        }
    });

    QB.chat.send(userId, {
        type: 'chat',
        body: "Hello!!! How can i help you?",
        extension: {
            save_to_history: 1
        }
    });
}

function removeUser(userID){
    QB.chat.roster.remove(userId, function(){
        QB.chat.roster.get(function(contactList) {
            console.log('after removing ',contactList);
        });
    });
}

function rejectSubscibtion(userId){
    QB.chat.roster.reject(userId, function(){
        QB.chat.send(userId, {
            'type': 'chat',
            'body': 'Contact request',
            'extension': {
                'save_to_history': 1,
                'notification_type': '7'
            }
        });
    });

    addUser(userId);
}

function addUser(userId) {
    QB.chat.roster.add(userId, function(){
        QB.chat.send(userId, {
            'type': 'chat',
            'body': 'Contact request',
            'extension': {
                'save_to_history': 1,
                'notification_type': '4'
            }
        });
    });
}