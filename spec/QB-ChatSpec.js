describe('Chat API', function() {
    'use strict';

    var LOGIN_TIMEOUT = 10000;
    var MESSAGING_TIMEOUT = 3500;
    var IQ_TIMEOUT = 3000;
    var REST_REQUESTS_TIMEOUT = 3000;

    var isNodeEnv = typeof window === 'undefined' && typeof exports === 'object';

    var QB = isNodeEnv ? require('../src/qbMain.js') : window.QB;
    var CREDS = isNodeEnv ? require('./config').CREDS : window.CREDS;
    var CONFIG = isNodeEnv ? require('./config').CONFIG : window.CONFIG;

    var QBUser1 = isNodeEnv ? require('./config').QBUser1 : window.QBUser1;
    var QBUser2 = isNodeEnv ? require('./config').QBUser2 : window.QBUser2;

    var chatEndpoint = CONFIG.endpoints.chat;

    beforeAll(function(done) {
        QB.init(CREDS.appId, CREDS.authKey, CREDS.authSecret, CONFIG);

        var createSessionParams = {
            'login': QBUser1.login,
            'password': QBUser1.password
        };

        function createSessionCb(err, result) {
            expect(err).toBeNull();

            expect(result).toBeDefined();
            expect(result.application_id).toEqual(CREDS.appId);

            done();
        }

        QB.createSession(createSessionParams, createSessionCb);
    }, REST_REQUESTS_TIMEOUT);

    describe('XMPP - real time messaging', function() {
        var statusCheckingParams = {
            userId: QBUser1.id,
            messageId: '507f1f77bcf86cd799439011',
            dialogId: '507f191e810c19729de860ea'
        };

        it('can connect to chat', function(done) {
            var connectParams = {
                'userId': QBUser1.id,
                'password': QBUser1.password
            };

            function connectCb(err) {
                expect(err).toBeNull();
                done();
            }
            QB.chat.connect(connectParams, connectCb);
        }, LOGIN_TIMEOUT);

        it('can send and receive private message', function(done) {
            var body = 'Warning! People are coming',
                msgExtension = {
                    name: 'skynet',
                    mission: 'take over the planet'
                },
                msg = {
                    type: 'chat',
                    body: body,
                    extension: msgExtension,
                    markable: 1
                };

            function onMsgCallback(userId, receivedMessage) {
                expect(userId).toEqual(QBUser1.id);

                expect(receivedMessage).toBeDefined();
                expect(receivedMessage.id).toEqual(msg.id);
                expect(receivedMessage.type).toEqual(msg.type);
                expect(receivedMessage.body).toEqual(body);
                expect(receivedMessage.extension).toEqual(msgExtension);
                expect(receivedMessage.markable).toEqual(1);

                done();
            }

            QB.chat.onMessageListener = onMsgCallback;
            msg.id = QB.chat.send(QBUser1.id, msg);
        }, MESSAGING_TIMEOUT);

        it('can send and receive system message', function(done) {
            var msg = {
                    body: 'Notification',
                    extension:{
                        name: 'Walle',
                        action: 'Found love'
                    }
                };

            function onSystemMessageListenerCb(receivedMessage) {
                expect(receivedMessage).toBeDefined();

                expect(receivedMessage.userId).toEqual(QBUser1.id);
                expect(receivedMessage.id).toEqual(msg.id);
                expect(receivedMessage.body).toEqual(msg.body);
                expect(receivedMessage.extension).toEqual(msg.extension);

                done();
            }

            QB.chat.onSystemMessageListener = onSystemMessageListenerCb;
            msg.id = QB.chat.sendSystemMessage(QBUser1.id, msg);
        }, MESSAGING_TIMEOUT);

        it('can send and receive \'delivered\' status', function(done) {
            function onDeliveredStatusListenerCb(messageId, dialogId, userId) {
                expect(messageId).toEqual(statusCheckingParams.messageId);
                expect(dialogId).toEqual(statusCheckingParams.dialogId);
                expect(userId).toEqual(statusCheckingParams.userId);

                done();
            }

            QB.chat.onDeliveredStatusListener = onDeliveredStatusListenerCb;

            QB.chat.sendDeliveredStatus(statusCheckingParams);
        }, MESSAGING_TIMEOUT);

        it('can send and receive \'read\' status', function(done) {
            function onReadStatusListenerCB(messageId, dialogId, userId) {
                expect(messageId).toEqual(statusCheckingParams.messageId);
                expect(dialogId).toEqual(statusCheckingParams.dialogId);
                expect(userId).toEqual(statusCheckingParams.userId);

                done();
            }

            QB.chat.onReadStatusListener = onReadStatusListenerCB;

            QB.chat.sendReadStatus(statusCheckingParams);
        }, MESSAGING_TIMEOUT);

        it('can send and receive \'is typing\' status (private)', function(done) {
            function onMessageTypingListenerCB(composing, userId, dialogId) {
                expect(composing).toEqual(true);
                expect(userId).toEqual(QBUser1.id);
                expect(dialogId).toBeNull();

                done();
            }

            QB.chat.onMessageTypingListener = onMessageTypingListenerCB;
            QB.chat.sendIsTypingStatus(QBUser1.id);
        }, MESSAGING_TIMEOUT);

        describe('[MUC] Dialogs', function() {
            var dialog;

            beforeAll(function(done){
                var dialogCreateParams = {
                    type: 2,
                    occupants_ids: [QBUser1.id, QBUser2.id],
                    name: 'Jasmine Test Dialog'
                };

                function createDialogCb(err, createdDialog) {
                    expect(err).toBeNull();

                    expect(createdDialog).toBeDefined();
                    expect(createdDialog.type).toEqual(dialogCreateParams.type);
                    expect(createdDialog.name).toEqual(dialogCreateParams.name);

                    dialog = createdDialog;

                    done();
                }

                QB.chat.dialog.create(dialogCreateParams, createDialogCb);
            });

            afterAll(function(done) {
                QB.chat.dialog.delete([dialog._id], {force: 1}, function(err, res) {
                    expect(err).toBeNull();

                    done();
                });
            });

            it('can join group chat', function(done) {
                function dialogJoinCb(stanza) {
                    expect(stanza).not.toBeNull();
                    done();
                }

                QB.chat.muc.join(dialog.xmpp_room_jid, dialogJoinCb);
            }, MESSAGING_TIMEOUT);

            it('can get online users', function(done) {
                function listOnlineUsersCb(users) {
                    expect(users).toBeDefined();

                    done();
                }

                QB.chat.muc.listOnlineUsers(dialog.xmpp_room_jid, listOnlineUsersCb);
            }, MESSAGING_TIMEOUT);

            it('can leave group chat', function(done) {
                function dialogLeaveCb() {
                    done();
                }

                QB.chat.muc.leave(dialog.xmpp_room_jid, dialogLeaveCb);
            }, MESSAGING_TIMEOUT);
        });

        describe('[Roster] Contact list: ', function() {
            /** !!Don't give back any response */
            it('can add user to contact list', function(done) {
                QB.chat.roster.add(QBUser2.id, function() {
                    done();
                });
            }, IQ_TIMEOUT);

            it('can retrieve contact list', function(done) {
                QB.chat.roster.get(function(roster) {
                    expect(roster).toBeDefined();
                    expect(QBUser2.id in roster).toEqual(true);

                    done();
                });
            }, IQ_TIMEOUT);

            it('can remove user from contact list', function(done) {
                QB.chat.roster.remove(QBUser2.id, function() {
                  done();
                });
            }, IQ_TIMEOUT);

            it('can confirm subscription request', function(done) {
                QB.chat.roster.confirm(QBUser2.id, function() {
                    done();
                });
            }, IQ_TIMEOUT);

            it('can reject subscription request', function(done) {
                QB.chat.roster.reject(QBUser2.id, function() {
                    done();
                });
            }, IQ_TIMEOUT);
        });

        describe('Privacy list: ', function() {
            it('can create new list with items', function(done) {
                var usersObj = [
                    {user_id: 1010101, action: 'allow'},
                    {user_id: 1111111, action: 'deny', mutualBlock: true}
                ];

                var list = {name: 'test', items: usersObj};

                QB.chat.privacylist.create(list, function(error) {
                    expect(error).toBeNull();
                    done();
                });
            });

            it('can update list by name', function(done) {
                var usersArr = [
                        {user_id: 1999991, action: 'allow'},
                        {user_id: 1010101, action: 'deny'}
                    ],
                    list = {name: 'test', items: usersArr};

                QB.chat.privacylist.update(list, function(error) {
                    expect(error).toBeDefined();

                    done();
                });
            });

            it('can get list by name', function(done) {
                QB.chat.privacylist.getList('test', function(error, response) {
                    expect(error).toBeNull();

                    expect(response.name).toBe('test');
                    expect(response.items.length).toEqual(3);

                    done();
                });
            });

            it('can set active list', function(done) {
                QB.chat.privacylist.setAsActive('test', function(error) {
                    expect(error).toBeNull();

                    done();
                });
            });

            it('can declines the use of active lists', function(done) {
                QB.chat.privacylist.setAsActive('', function(error) {
                    expect(error).toBeNull();

                    done();
                });
            });

            it('can set default list', function(done) {
                QB.chat.privacylist.setAsDefault('test', function(error) {
                    expect(error).toBeNull();

                    done();
                });
            });

            it('can declines the use of default lists', function(done) {
                QB.chat.privacylist.setAsDefault('', function(error) {
                    expect(error).toBeNull();

                    done();
                });
            });

            it('can get names of privacy lists', function(done) {
                QB.chat.privacylist.getNames(function(error, response) {
                    expect(error).toBeNull();

                    expect(response.names.length).toBeGreaterThan(0);

                    done();
                });
            });

            /** !! REVIEW */
            // it('can delete list by name', function(done) {
            //     QB.chat.privacylist.delete('test', function(error) {
            //         expect(error).toBeNull();
            //         done();
            //     });
            // });
        });
    });

    describe('REST API', function() {
        var dialogId;
        var messageId;

        it('can create a dialog (group)', function(done) {
            var params = {
                occupants_ids: [QBUser2.id],
                name: 'GroupDialogName',
                type: 2
            };

            QB.chat.dialog.create(params, function(err, res) {
                expect(err).toBeNull();

                expect(res).not.toBeNull();
                expect(res._id).not.toBeNull();
                expect(res.type).toEqual(2);
                expect(res.name).toEqual('GroupDialogName');
                expect(res.xmpp_room_jid).toContain(chatEndpoint);

                var ocuupantsArray = [QBUser2.id, QBUser1.id].sort(function(a,b){
                    return a - b;
                });

                expect(res.occupants_ids).toEqual(ocuupantsArray);

                dialogId = res._id;

                done();
            });
        }, REST_REQUESTS_TIMEOUT);

        it('can list dialogs', function(done) {
            var filters = null;
            QB.chat.dialog.list(filters, function(err, res) {
                expect(err).toBeNull();

                expect(res).not.toBeNull();
                expect(res.items.length).toBeGreaterThan(0);

                done();
            });
        }, REST_REQUESTS_TIMEOUT);

        it('can update a dialog (group)', function(done) {
            var toUpdate = {
                name: 'GroupDialogNewName',
                pull_all: {
                  occupants_ids: [QBUser2.id]
                }
            };

            QB.chat.dialog.update(dialogId, toUpdate, function(err, res) {
                expect(err).toBeNull();

                expect(res).not.toBeNull();
                expect(res.name).toEqual('GroupDialogNewName');
                expect(res.occupants_ids).toEqual([QBUser1.id]);

                done();
            });
        }, REST_REQUESTS_TIMEOUT);

        it('can create a message', function(done) {
            var params = {
                chat_dialog_id: dialogId,
                message: 'hello world'
            };

            QB.chat.message.create(params, function(err, res) {
                expect(err).toBeNull();

                expect(res._id).not.toBeNull();
                expect(res.message).toEqual("hello world");
                expect(res.chat_dialog_id).toEqual(dialogId);

                messageId = res._id;

                done();
            });
        }, REST_REQUESTS_TIMEOUT);

        it('can list messages', function(done) {
            var filters = { chat_dialog_id: dialogId };

            QB.chat.message.list(filters, function(err, res) {
                expect(err).toBeNull();

                expect(res).not.toBeNull();
                expect(res.items.length).toBeGreaterThan(0);

                done();
            });
        }, REST_REQUESTS_TIMEOUT);

        it('can request unread messages count', function(done) {
            var params = { chat_dialog_ids: [dialogId] };

            QB.chat.message.unreadCount(params, function(err, res) {
                expect(err).toBeNull();

                expect(res.total).toEqual(0);
                expect(res[dialogId]).toEqual(0);

                done();
            });
        }, REST_REQUESTS_TIMEOUT);

        it('can set \'read\' status for all messages in dialog', function(done) {
            /**
             * dialogId we get from previous test case 'can create a dialog'
             */

            QB.chat.message.update('', {
              'read': '1',
              'chat_dialog_id': dialogId
            }, function(error, result) {
                expect(error).toBeNull();

            /** result will be equal to empty */
            done();
          });
        }, REST_REQUESTS_TIMEOUT);

        it('can delete a message with id', function(done) {
            QB.chat.message.delete([messageId, 'notExistentId'], {force: 1}, function(err, res) {
                expect(err).toBeNull();

                done();

                messageId = null;
            });
        }, REST_REQUESTS_TIMEOUT);

        it('can delete a dialog (group)', function(done) {
            QB.chat.dialog.delete([dialogId, 'notExistentId'], {force: 1}, function(err, res) {
                var answ = JSON.parse(res);

                expect(answ.SuccessfullyDeleted.ids).toEqual([dialogId]);
                expect(answ.NotFound.ids).toEqual(["notExistentId"]);
                expect(answ.WrongPermissions.ids).toEqual([]);

                done();
            });
        }, REST_REQUESTS_TIMEOUT);
    });

    /** Doesn't work on OS */
    // it('can disconnect', function(done){
    //     QB.chat.onDisconnectedListener = function(){
    //         console.log("DISCONNECTED DONE");
    //         expect(true).toEqual(true);
    //         done();
    //     };
    //
    //     QB.chat.disconnect();
    // }, REST_REQUESTS_TIMEOUT);
});
