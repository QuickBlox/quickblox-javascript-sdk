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

        QB.createSession(createSessionParams, function (err, result) {
            expect(err).toBeNull();
            expect(result).toBeDefined();
            expect(result.application_id).toEqual(CREDS.appId);

            var connectToChatParams = {
                'userId': QBUser2.id,
                'password': QBUser2.password
            };
            QB.chat.connect(connectToChatParams, function(err) {
                expect(err).toBeNull();
                done();
            });
        });
    }, REST_REQUESTS_TIMEOUT+LOGIN_TIMEOUT);

// =========================== REST API ========================================

    describe('REST API', function() {
        var dialogId1Group;
        var dialogId2GroupNotJoinable;
        var dialogId3PublicGroup;
        var dialogId4Private;
        var messageIdPrivate;
        var messageIdGroup;
        var messageIdSystem;

// =======================CREATE PRIVATE DIALOG=================================

        fdescribe('Create Private Dialog', function() {

          it('can create a dialog (private)', function(done) {
              var params = {
                  occupants_ids: [QBUser2.id],
                  type: 3
              };

              QB.chat.dialog.create(params, function(err, res) {
                  expect(err).toBeNull();
                  expect(res).not.toBeNull();
                  expect(res._id).not.toBeNull();
                  expect(res.type).toEqual(3);
                  expect(res.is_joinable).toEqual(0);
                  expect(res.occupants_ids).toEqual(sortUsers(QBUser2.id, QBUser1.id));

                  dialogId4Private = res._id;

                  done();
              });
          }, REST_REQUESTS_TIMEOUT);

          it("can't create a dialog (private) (is_joinable=1)", function(done) {
              var params = {
                  occupants_ids: [QBUser2.id],
                  type: 3,
                  is_joinable: 1
              };

              QB.chat.dialog.create(params, function(err, res) {
                  expect(err).not.toBeNull();
                  expect(res).toBeNull();

                  done();
              });
          }, REST_REQUESTS_TIMEOUT);
        });

// =========================CREATE GROUP DIALOG=================================

        fdescribe('Create Group Dialog:', function() {

          it('can create a dialog (group) and then join and send/receive a message', function(done) {
              var params = {
                  occupants_ids: [QBUser2.id],
                  name: 'joinable=1',
                  type: 2
              };

              QB.chat.dialog.create(params, function(err, res) {
                  expect(err).toBeNull();
                  expect(res).not.toBeNull();
                  expect(res._id).not.toBeNull();
                  expect(res.type).toEqual(params.type);
                  expect(res.name).toEqual(params.name);
                  expect(res.xmpp_room_jid).toContain(chatEndpoint);
                  expect(res.is_joinable).toEqual(1);
                  expect(res.occupants_ids).toEqual(sortUsers(QBUser2.id, QBUser1.id));

                  dialogId1Group = res._id;

                  // now try to join and send a message
                  //
                  groupChat_joinAndSendAndReceiveMessageAndLeave(res.xmpp_room_jid, res._id, function(){
                    done();
                  });
              });
          }, REST_REQUESTS_TIMEOUT+MESSAGING_TIMEOUT);

          it('can create a dialog (group)(not joinable) and then send/receive a message', function(done) {
              var params = {
                  occupants_ids: [QBUser2.id],
                  name: 'joinable=0',
                  type: 2,
                  is_joinable: 0
              };

              QB.chat.dialog.create(params, function(err, res) {
                  expect(err).toBeNull();
                  expect(res).not.toBeNull();
                  expect(res._id).not.toBeNull();
                  expect(res.type).toEqual(params.type);
                  expect(res.name).toEqual(params.name);
                  expect(res.xmpp_room_jid).toContain(chatEndpoint);
                  expect(res.is_joinable).toEqual(params.is_joinable);
                  expect(res.occupants_ids).toEqual(sortUsers(QBUser2.id, QBUser1.id));

                  dialogId2GroupNotJoinable = res._id;

                  // now try to send a message without join
                  //
                  groupChat_sendAndReceiveMessage(res.xmpp_room_jid, res._id, function(){
                    done();
                  });

              });
          }, REST_REQUESTS_TIMEOUT+MESSAGING_TIMEOUT);

        });

// =======================CREATE PUBLIC GROUP DIALOG============================

      fdescribe('Create Public Group Dialog:', function() {

          it('can create a dialog (public group) and then join and send/receive a message', function(done) {
              var params = {
                  name: 'Public Awesome chat',
                  type: 1
              };

              QB.chat.dialog.create(params, function(err, res) {
                  expect(err).toBeNull();
                  expect(res).not.toBeNull();
                  expect(res._id).not.toBeNull();
                  expect(res.type).toEqual(params.type);
                  expect(res.name).toEqual(params.name);
                  expect(res.xmpp_room_jid).toContain(chatEndpoint);
                  expect(res.is_joinable).toEqual(1);

                  dialogId3PublicGroup = res._id;

                  // now try to send a message
                  //
                  groupChat_joinAndSendAndReceiveMessageAndLeave(res.xmpp_room_jid, res._id, function(){
                    done();
                  });
              });
          }, REST_REQUESTS_TIMEOUT+MESSAGING_TIMEOUT);

          it("can't create a dialog (public group) with is_joinable=0", function(done) {
              var params = {
                  name: 'Public Awesome chat',
                  type: 1,
                  is_joinable: 0
              };

              QB.chat.dialog.create(params, function(err, res) {
                  expect(res).toBeNull();
                  expect(err).not.toBeNull();

                  done();
              });
          }, REST_REQUESTS_TIMEOUT);

        });

// ==============================LIST DIALOGS===================================

    fdescribe('List Dialogs', function() {

        it('can list dialogs', function(done) {
            var filters = {};
            QB.chat.dialog.list(filters, function(err, res) {
                expect(err).toBeNull();
                expect(res).not.toBeNull();
                expect(res.total_entries).toEqual(4);
                expect(res.skip).toEqual(0);
                expect(res.limit).toEqual(100);
                expect(res.items.length).toEqual(4);

                done();
            });
        }, REST_REQUESTS_TIMEOUT);

      });

// ==========================UPDATE PRIVATE DIALOG==============================

        fdescribe('Update Private Dialog', function() {

          it("can't update a dialog (private) (set is_joinable=1)", function(done) {
              var toUpdate = {
                  is_joinable: 1
              };

              QB.chat.dialog.update(dialogId4Private, toUpdate, function(err, res) {
                  expect(res).toBeNull();
                  expect(err).not.toBeNull();

                  done();
              });
          }, REST_REQUESTS_TIMEOUT);

        });

// ===========================UPDATE GROUP DIALOG===============================

        fdescribe('Update Group Dialog', function() {

          it('can update a dialog (group) (also set is_joinable=0) and then send/receive a message', function(done) {
              var toUpdate = {
                  name: 'GroupDialogNewName_is_joinable=0',
                  is_joinable: 0
              };

              QB.chat.dialog.update(dialogId1Group, toUpdate, function(err, res) {
                  expect(err).toBeNull();
                  expect(res).not.toBeNull();
                  expect(res.name).toEqual(toUpdate.name);
                  expect(res.is_joinable).toEqual(toUpdate.is_joinable);

                  // now try to send a message without join
                  //
                  groupChat_sendAndReceiveMessage(res.xmpp_room_jid, res._id, function(){
                    done();
                  });

              });
          }, REST_REQUESTS_TIMEOUT);

          it('can update a dialog (group) (also set is_joinable=1)', function(done) {
              var toUpdate = {
                  name: 'GroupDialogNewName_is_joinable=1',
                  is_joinable: 1
              };

              QB.chat.dialog.update(dialogId1Group, toUpdate, function(err, res) {
                  expect(err).toBeNull();
                  expect(res).not.toBeNull();
                  expect(res.name).toEqual(toUpdate.name);
                  expect(res.is_joinable).toEqual(toUpdate.is_joinable);

                  // now try to send a message
                  //
                  groupChat_joinAndSendAndReceiveMessageAndLeave(res.xmpp_room_jid, res._id, function(){
                    done();
                  });
              });
          }, REST_REQUESTS_TIMEOUT);

          it("can't update a dialog (group) (set is_joinable=0) (if you are not an owner)", function(done) {
            // login with other user
            //
            var createSessionParams = {
                'login': QBUser2.login,
                'password': QBUser2.password
            };
            QB.createSession(createSessionParams, function (err, result) {
                expect(err).toBeNull();
                expect(result).toBeDefined();
                expect(result.application_id).toEqual(CREDS.appId);

                var toUpdate = {
                    is_joinable: 0
                };
                QB.chat.dialog.update(dialogId1Group, toUpdate, function(err, res) {
                    expect(res).toBeNull();
                    expect(err).not.toBeNull();

                    // back to origin user session
                    //
                    var createSessionParams = {
                        'login': QBUser1.login,
                        'password': QBUser1.password
                    };
                    QB.createSession(createSessionParams, function (err, result) {
                        expect(err).toBeNull();
                        expect(result).toBeDefined();
                        expect(result.application_id).toEqual(CREDS.appId);

                        done();
                    });
                });
            });
          }, 3*REST_REQUESTS_TIMEOUT);

        });

// =========================UPDATE PUBLIC GROUP DIALOG===========================

        fdescribe('Update Public Group Dialog', function() {

          it("can't update a dialog (public group) (set is_joinable=0)", function(done) {
              var toUpdate = {
                  is_joinable: 0
              };

              QB.chat.dialog.update(dialogId3PublicGroup, toUpdate, function(err, res) {
                  expect(res).toBeNull();
                  expect(err).not.toBeNull();

                  done();
              });
          }, REST_REQUESTS_TIMEOUT);

        });

// =======================CREATE NORMAL MESSAGE=================================

        var createNormalMessageWithoutReceivingItTest = function(params, done){
          QB.chat.message.create(params, function(err, res) {
              expect(err).toBeNull();
              expect(res).toBeDefined()
              expect(res._id).not.toBeNull();
              expect(res.message).toEqual(params.message);
              expect(res.chat_dialog_id).toEqual(dialogId4Private);

              messageIdPrivate = res._id;
          });

          var messageReceived = false;
          QB.chat.onMessageListener = function(userId, receivedMessage) {
              messageReceived = true;
          };

          setTimeout(function(){
            console.info("MSG receive timeout");
            QB.chat.onMessageListener = null;
            expect(messageReceived).toEqual(false);
            done();
          }, MESSAGING_TIMEOUT);
        };

        it('can create a message and then DO NOT receive it (private dialog)(chat_dialog_id)', function(done) {
            var params = {
                chat_dialog_id: dialogId4Private,
                message: 'hello world'
            };

            createNormalMessageWithoutReceivingItTest(params, done);

        }, REST_REQUESTS_TIMEOUT+MESSAGING_TIMEOUT);

        it('can create a message and then DO NOT receive it (private dialog)(recipient_id)', function(done) {
            var params = {
                recipient_id: QBUser2.id,
                message: 'hello world'
            };

            createNormalMessageWithoutReceivingItTest(params, done);

        }, REST_REQUESTS_TIMEOUT+MESSAGING_TIMEOUT);

        it('can create a message and then DO NOT receive it (group dialog)', function(done) {
            var params = {
                chat_dialog_id: dialogId1Group,
                message: 'hello world'
            };

            createNormalMessageWithoutReceivingItTest(params, done);

        }, REST_REQUESTS_TIMEOUT+MESSAGING_TIMEOUT);


        var createNormalMessageAndReceiveItTest = function(params, msgExtension, dialogId, xmppMessageType, done){
          QB.chat.message.create(params, function(err, res) {
              expect(err).toBeNull();
              expect(res).toBeDefined()
              expect(res._id).not.toBeNull();
              expect(res.message).toEqual(params.message);
              expect(res.chat_dialog_id).toEqual(dialogId);

              messageIdPrivate = res._id;
          });

          QB.chat.onMessageListener = function(userId, receivedMessage) {
              expect(userId).toEqual(QBUser1.id);
              expect(receivedMessage).toBeDefined();
              expect(receivedMessage.id).not.toBeNull();
              // expect(receivedMessage.id).toEqual(messageIdPrivate);
              expect(receivedMessage.type).toEqual(xmppMessageType);
              expect(receivedMessage.body).toEqual(params.message);
              expect(receivedMessage.extension).toEqual($.extend({save_to_history: '1'}, msgExtension));

              QB.chat.onMessageListener = null;

              done();
          };
        };

        it('can create a message and then receive it (private dialog) (send_to_chat=1) (chat_dialog_id)', function(done) {
            var msgExtension = {
              param1: "value1",
              param2: "value2"
            };
            var params = {
                chat_dialog_id: dialogId4Private,
                message: "hello world, it's me, a message with send_to_chat=1 in private dialog",
                param1: msgExtension.param1,
                param2: msgExtension.param2,
                send_to_chat: 1
            };

            createNormalMessageAndReceiveItTest(params, msgExtension, dialogId4Private, "chat", done);

        }, REST_REQUESTS_TIMEOUT);

        it('can create a message and then receive it (private dialog) (send_to_chat=1) (recipient_id)', function(done) {
            var msgExtension = {
              param1: "value1",
              param2: "value2"
            };
            var params = {
                recipient_id: QBUser2.id,
                message: "hello world, it's me, a message with send_to_chat=1 in private dialog",
                param1: msgExtension.param1,
                param2: msgExtension.param2,
                send_to_chat: 1
            };

            createNormalMessageAndReceiveItTest(params, msgExtension, dialogId4Private, "chat", done);

        }, REST_REQUESTS_TIMEOUT);

        it('can create a message and then receive it (group dialog) (send_to_chat=1)', function(done) {
            var msgExtension = {
              param1: "value1",
              param2: "value2"
            };
            var params = {
                chat_dialog_id: dialogId1Group,
                message: "hello world, it's me, a message with send_to_chat=1 in group dialog",
                param1: msgExtension.param1,
                param2: msgExtension.param2,
                send_to_chat: 1
            };

            createNormalMessageAndReceiveItTest(params, msgExtension, dialogId1Group, "groupchat", done);

        }, REST_REQUESTS_TIMEOUT);

// =======================CREATE SYSTEM MESSAGE=================================

        it("can create a system message and then receive it (private dialog)", function(done) {
            var msgExtension = {
              param1: "value1",
              param2: "value2",
            };
            var params = {
                chat_dialog_id: dialogId4Private,
                param1: msgExtension.param1,
                param2: msgExtension.param2,
                system: 1
            };

            QB.chat.message.create(params, function(err, res) {
                expect(err).toBeNull();
                expect(res._id).not.toBeNull();
                expect(res.param1).toEqual("value1");
                expect(res.param2).toEqual("value2");
                expect(res.chat_dialog_id).toEqual(dialogId4Private);

                messageIdSystem = res._id;
            });

            QB.chat.onSystemMessageListener = function(receivedMessage) {
                expect(receivedMessage.userId).toEqual(QBUser1.id);
                expect(receivedMessage).toBeDefined();
                expect(receivedMessage.id).toEqual(messageIdSystem);
                expect(receivedMessage.body).toBeNull();
                expect(receivedMessage.extension).toEqual(msgExtension);

                QB.chat.onSystemMessageListener = null;

                done();
            };

        }, REST_REQUESTS_TIMEOUT);

        it("can't create a system message (group dialog)", function(done) {
            var params = {
                chat_dialog_id: dialogId1Group,
                param1: "value1",
                param2: "value2",
                system: 1
            };

            QB.chat.message.create(params, function(err, res) {
              console.info(err);
                expect(res).toBeNull();
                expect(err).not.toBeNull();

                done();
            });
        }, REST_REQUESTS_TIMEOUT);

// ============================LIST MESSAGES====================================

        it('can list messages', function(done) {
            var filters = { chat_dialog_id: dialogId4Private };

            QB.chat.message.list(filters, function(err, res) {
                expect(err).toBeNull();
                expect(res).not.toBeNull();
                expect(res.items.length).toEqual(2); // it should be 2 messages in this private chat, without system

                done();
            });
        }, REST_REQUESTS_TIMEOUT);

        it('can request unread messages count', function(done) {
            var params = { chat_dialog_ids: [dialogId1Group] };

            QB.chat.message.unreadCount(params, function(err, res) {
                expect(err).toBeNull();
                expect(res.total).toEqual(0);
                expect(res[dialogId1Group]).toEqual(0);

                done();
            });
        }, REST_REQUESTS_TIMEOUT);

        it('can set \'read\' status for all messages in dialog', function(done) {
            QB.chat.message.update('', {
              'read': '1',
              'chat_dialog_id': dialogId1Group
            }, function(error, result) {
                expect(error).toBeNull();

                done();
          });
        }, REST_REQUESTS_TIMEOUT);

        it('can delete a message with id', function(done) {
            QB.chat.message.delete([messageIdGroup, 'notExistentId'], {force: 1}, function(err, res) {
                expect(err).toBeNull();

                done();

                messageIdGroup = null;
            });
        }, REST_REQUESTS_TIMEOUT);

        it('can delete a dialog (group)', function(done) {
            QB.chat.dialog.delete([dialogId1Group, 'notExistentId'], {force: 1}, function(err, res) {
                var answ = JSON.parse(res);

                expect(answ.SuccessfullyDeleted.ids).toEqual([dialogId1Group]);
                expect(answ.NotFound.ids).toEqual(["notExistentId"]);
                expect(answ.WrongPermissions.ids).toEqual([]);

                done();
            });
        }, REST_REQUESTS_TIMEOUT);

        afterAll(function(done) {
          QB.chat.dialog.delete([dialogId1Group, dialogId2GroupNotJoinable, dialogId3PublicGroup, dialogId4Private], {force: 1}, function(err, res) {
              var answ = JSON.parse(res);

              expect(answ.SuccessfullyDeleted.ids.sort()).toEqual([dialogId1Group, dialogId2GroupNotJoinable, dialogId3PublicGroup, dialogId4Private].sort());
              expect(answ.NotFound.ids).toEqual([]);
              expect(answ.WrongPermissions.ids).toEqual([]);

              done();
          });
        });

    });

//     describe('XMPP - real time messaging', function() {
//         var statusCheckingParams = {
//             userId: QBUser1.id,
//             messageId: '507f1f77bcf86cd799439011',
//             dialogId: '507f191e810c19729de860ea'
//         };
//
//         it('can send and receive private message', function(done) {
//             var body = 'Warning! People are coming',
//                 msgExtension = {
//                     name: 'skynet',
//                     mission: 'take over the planet'
//                 },
//                 msg = {
//                     type: 'chat',
//                     body: body,
//                     extension: msgExtension,
//                     markable: 1
//                 };
//
//             function onMsgCallback(userId, receivedMessage) {
//                 expect(userId).toEqual(QBUser1.id);
//
//                 expect(receivedMessage).toBeDefined();
//                 expect(receivedMessage.id).toEqual(msg.id);
//                 expect(receivedMessage.type).toEqual(msg.type);
//                 expect(receivedMessage.body).toEqual(body);
//                 expect(receivedMessage.extension).toEqual(msgExtension);
//                 expect(receivedMessage.markable).toEqual(1);
//
//                 done();
//             }
//
//             QB.chat.onMessageListener = onMsgCallback;
//             msg.id = QB.chat.send(QBUser1.id, msg);
//         }, MESSAGING_TIMEOUT);
//
//         it('can send and receive system message', function(done) {
//             var msg = {
//                     body: 'Notification',
//                     extension:{
//                         name: 'Walle',
//                         action: 'Found love'
//                     }
//                 };
//
//             function onSystemMessageListenerCb(receivedMessage) {
//                 expect(receivedMessage).toBeDefined();
//
//                 expect(receivedMessage.userId).toEqual(QBUser1.id);
//                 expect(receivedMessage.id).toEqual(msg.id);
//                 expect(receivedMessage.body).toEqual(msg.body);
//                 expect(receivedMessage.extension).toEqual(msg.extension);
//
//                 done();
//             }
//
//             QB.chat.onSystemMessageListener = onSystemMessageListenerCb;
//             msg.id = QB.chat.sendSystemMessage(QBUser1.id, msg);
//         }, MESSAGING_TIMEOUT);
//
//         it('can send and receive \'delivered\' status', function(done) {
//             function onDeliveredStatusListenerCb(messageId, dialogId, userId) {
//                 expect(messageId).toEqual(statusCheckingParams.messageId);
//                 expect(dialogId).toEqual(statusCheckingParams.dialogId);
//                 expect(userId).toEqual(statusCheckingParams.userId);
//
//                 done();
//             }
//
//             QB.chat.onDeliveredStatusListener = onDeliveredStatusListenerCb;
//
//             QB.chat.sendDeliveredStatus(statusCheckingParams);
//         }, MESSAGING_TIMEOUT);
//
//         it('can send and receive \'read\' status', function(done) {
//             function onReadStatusListenerCB(messageId, dialogId, userId) {
//                 expect(messageId).toEqual(statusCheckingParams.messageId);
//                 expect(dialogId).toEqual(statusCheckingParams.dialogId);
//                 expect(userId).toEqual(statusCheckingParams.userId);
//
//                 done();
//             }
//
//             QB.chat.onReadStatusListener = onReadStatusListenerCB;
//
//             QB.chat.sendReadStatus(statusCheckingParams);
//         }, MESSAGING_TIMEOUT);
//
//         it('can send and receive \'is typing\' status (private)', function(done) {
//             function onMessageTypingListenerCB(composing, userId, dialogId) {
//                 expect(composing).toEqual(true);
//                 expect(userId).toEqual(QBUser1.id);
//                 expect(dialogId).toBeNull();
//
//                 done();
//             }
//
//             QB.chat.onMessageTypingListener = onMessageTypingListenerCB;
//             QB.chat.sendIsTypingStatus(QBUser1.id);
//         }, MESSAGING_TIMEOUT);
//
// // =============================================================================
//
//         describe('[MUC] Dialogs', function() {
//             var dialog;
//
//             beforeAll(function(done){
//                 var dialogCreateParams = {
//                     type: 2,
//                     occupants_ids: [QBUser1.id, QBUser2.id],
//                     name: 'Jasmine Test Dialog'
//                 };
//
//                 function createDialogCb(err, createdDialog) {
//                     expect(err).toBeNull();
//
//                     expect(createdDialog).toBeDefined();
//                     expect(createdDialog.type).toEqual(dialogCreateParams.type);
//                     expect(createdDialog.name).toEqual(dialogCreateParams.name);
//
//                     dialog = createdDialog;
//
//                     done();
//                 }
//
//                 QB.chat.dialog.create(dialogCreateParams, createDialogCb);
//             });
//
//             afterAll(function(done) {
//                 QB.chat.dialog.delete([dialog._id], {force: 1}, function(err, res) {
//                     expect(err).toBeNull();
//
//                     done();
//                 });
//             });
//
//             it('can join group chat', function(done) {
//                 function dialogJoinCb(stanza) {
//                     expect(stanza).not.toBeNull();
//                     done();
//                 }
//
//                 QB.chat.muc.join(dialog.xmpp_room_jid, dialogJoinCb);
//             }, MESSAGING_TIMEOUT);
//
//             it('can get online users', function(done) {
//                 function listOnlineUsersCb(users) {
//                     expect(users).toBeDefined();
//
//                     done();
//                 }
//
//                 QB.chat.muc.listOnlineUsers(dialog.xmpp_room_jid, listOnlineUsersCb);
//             }, MESSAGING_TIMEOUT);
//
//             it('can leave group chat', function(done) {
//                 function dialogLeaveCb() {
//                     done();
//                 }
//
//                 QB.chat.muc.leave(dialog.xmpp_room_jid, dialogLeaveCb);
//             }, MESSAGING_TIMEOUT);
//         });
//
// // =============================================================================
//
//         describe('[Roster] Contact list: ', function() {
//             /** !!Don't give back any response */
//             it('can add user to contact list', function(done) {
//                 QB.chat.roster.add(QBUser2.id, function() {
//                     done();
//                 });
//             }, IQ_TIMEOUT);
//
//             it('can retrieve contact list', function(done) {
//                 QB.chat.roster.get(function(roster) {
//                     expect(roster).toBeDefined();
//                     expect(QBUser2.id in roster).toEqual(true);
//
//                     done();
//                 });
//             }, IQ_TIMEOUT);
//
//             it('can remove user from contact list', function(done) {
//                 QB.chat.roster.remove(QBUser2.id, function() {
//                   done();
//                 });
//             }, IQ_TIMEOUT);
//
//             it('can confirm subscription request', function(done) {
//                 QB.chat.roster.confirm(QBUser2.id, function() {
//                     done();
//                 });
//             }, IQ_TIMEOUT);
//
//             it('can reject subscription request', function(done) {
//                 QB.chat.roster.reject(QBUser2.id, function() {
//                     done();
//                 });
//             }, IQ_TIMEOUT);
//         });
//
// // =============================================================================
//
//         describe('Privacy list: ', function() {
//             it('can create new list with items', function(done) {
//                 var usersObj = [
//                     {user_id: 1010101, action: 'allow'},
//                     {user_id: 1111111, action: 'deny', mutualBlock: true}
//                 ];
//
//                 var list = {name: 'test', items: usersObj};
//
//                 QB.chat.privacylist.create(list, function(error) {
//                     expect(error).toBeNull();
//                     done();
//                 });
//             });
//
//             it('can update list by name', function(done) {
//                 var usersArr = [
//                         {user_id: 1999991, action: 'allow'},
//                         {user_id: 1010101, action: 'deny'}
//                     ],
//                     list = {name: 'test', items: usersArr};
//
//                 QB.chat.privacylist.update(list, function(error) {
//                     expect(error).toBeDefined();
//
//                     done();
//                 });
//             });
//
//             it('can get list by name', function(done) {
//                 QB.chat.privacylist.getList('test', function(error, response) {
//                     expect(error).toBeNull();
//
//                     expect(response.name).toBe('test');
//                     expect(response.items.length).toEqual(3);
//
//                     done();
//                 });
//             });
//
//             it('can set active list', function(done) {
//                 QB.chat.privacylist.setAsActive('test', function(error) {
//                     expect(error).toBeNull();
//
//                     done();
//                 });
//             });
//
//             it('can declines the use of active lists', function(done) {
//                 QB.chat.privacylist.setAsActive('', function(error) {
//                     expect(error).toBeNull();
//
//                     done();
//                 });
//             });
//
//             it('can set default list', function(done) {
//                 QB.chat.privacylist.setAsDefault('test', function(error) {
//                     expect(error).toBeNull();
//
//                     done();
//                 });
//             });
//
//             it('can declines the use of default lists', function(done) {
//                 QB.chat.privacylist.setAsDefault('', function(error) {
//                     expect(error).toBeNull();
//
//                     done();
//                 });
//             });
//
//             it('can get names of privacy lists', function(done) {
//                 QB.chat.privacylist.getNames(function(error, response) {
//                     expect(error).toBeNull();
//
//                     expect(response.names.length).toBeGreaterThan(0);
//
//                     done();
//                 });
//             });
//
//             /** !! REVIEW */
//             // it('can delete list by name', function(done) {
//             //     QB.chat.privacylist.delete('test', function(error) {
//             //         expect(error).toBeNull();
//             //         done();
//             //     });
//             // });
//         });
//     });

    afterAll(function(done) {
        QB.destroySession(function (err, result){
            expect(QB.service.qbInst.session).toBeNull();

            QB.chat.disconnect();

            done();
        });
    });

});
