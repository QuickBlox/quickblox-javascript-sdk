'use strict';

var LOGIN_TIMEOUT = 10000;
var MESSAGING_TIMEOUT = 7000;

var isNodeEnv = typeof window === 'undefined' && typeof exports === 'object';

var QB = isNodeEnv ? require('../src/qbMain.js') : window.QB;

var QB_SENDER = new QB.QuickBlox();

var CREDS = isNodeEnv ? require('./config').CREDS : window.CREDS;
var CONFIG = isNodeEnv ? require('./config').CONFIG : window.CONFIG;

var QBUser1 = isNodeEnv ? require('./config').QBUser1 : window.QBUser1;
var QBUser2 = isNodeEnv ? require('./config').QBUser2 : window.QBUser2;

describe('Stream Managment', function() {
    beforeAll(function(done) {
        // Extends config with streamManagement
        CONFIG.streamManagement = { 'enable': true };
        // Init SDK
        QB_SENDER.init(CREDS.appId, CREDS.authKey, CREDS.authSecret, CONFIG);
        // Create the session & connect to chat
        QB_SENDER.createSession({
            'login': QBUser1.login,
            'password': QBUser1.password
        }, function(err, res) {
            expect(err).toBeNull();
            expect(res).toBeDefined();

            QB_SENDER.chat.connect({
                'userId': QBUser1.id,
                'password': QBUser1.password
            }, function(err) {
                expect(err).toBeNull();

                done();
            });
        });
    }, LOGIN_TIMEOUT);

    it('private message', function(done) {
        var message = {
            type: 'chat',
            body: 'It is the message with attachments',
            extension: {
                attachments: [
                    {
                        id: '5a2d9695a0eb475c80d139d1',
                        type: 'photo'
                    }
                ]
            },
            markable: 1
        };

        function onSentMessageCallback(messageLost, messageSent) {
            if(message.id === messageSent.id) {
                expect(messageLost).toBeNull();
                expect(messageSent).toBeDefined();
        
                expect(messageSent.extension.attachments[0].id).toEqual(message.extension.attachments[0].id);
                expect(messageSent.extension.attachments[0].type).toEqual(message.extension.attachments[0].type);
        
                done();
            }
        };
        QB_SENDER.chat.onSentMessageCallback = onSentMessageCallback;

        // Sent the message
        message.id = QB_SENDER.chat.send(QBUser2.id, message);
    }, MESSAGING_TIMEOUT);

    it('group message', function(done) {
        var dialogJoinable;

        var dialogCreateParams = {
            type: 2,
            occupants_ids: [QBUser2.id],
            name: 'Jasmine Test Dialog'
        };

        var message = {
            type: 'groupchat',
            body: 'It is the message with attachments',
            extension: {
                attachments: [
                    {
                        id: '5a2d9695a0eb475c80d139d1',
                        type: 'photo'
                    }
                ]
            },
            markable: 1
        };

        function onSentMessageCallback(messageLost, messageSent) {

            if(message.id === messageSent.id) {
                expect(messageLost).toBeNull();
                expect(messageSent).toBeDefined();
        
                expect(messageSent.extension.attachments[0].id).toEqual(message.extension.attachments[0].id);
                expect(messageSent.extension.attachments[0].type).toEqual(message.extension.attachments[0].type);
        
                done();
            }
        };
        QB_SENDER.chat.onSentMessageCallback = onSentMessageCallback;

        function handleDialogJoined(error, responce) {
            expect(error).toBeNull();
            expect(responce).toBeDefined();

            message.id = QB_SENDER.chat.send(dialogJoinable.xmpp_room_jid, message);
        }

        function handleDialogCreated(err, res) {
            expect(err).toBeNull();
            expect(res).toBeDefined();

            dialogJoinable = res;

            QB_SENDER.chat.muc.join(dialogJoinable.xmpp_room_jid, handleDialogJoined);
        }

        QB_SENDER.chat.dialog.create(dialogCreateParams, handleDialogCreated);
    }, LOGIN_TIMEOUT + MESSAGING_TIMEOUT);

    afterAll(function(done) {
        QB_SENDER.chat.onDisconnectedListener = function() {
            done();
        };

        QB_SENDER.destroySession(function (err, result){
            expect(QB_SENDER.service.qbInst.session).toBeNull();

            QB_SENDER.chat.disconnect();
        });
    });
});
