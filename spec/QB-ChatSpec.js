'use strict';

var LOGIN_TIMEOUT = 10000;
var MESSAGING_TIMEOUT = 7000;
var IQ_TIMEOUT = 3000;
var REST_REQUESTS_TIMEOUT = 6000;

var isNodeEnv = typeof window === 'undefined' && typeof exports === 'object';

var QB = isNodeEnv ? require('../src/qbMain.js') : window.QB;
var QB_SENDER;
var QB_RECEIVER;
if(isNodeEnv){
    QB_SENDER = new QB.QuickBlox();
    QB_RECEIVER = new QB.QuickBlox();
}else{
    QB_SENDER = new window.QB.QuickBlox();
    QB_RECEIVER = new window.QB.QuickBlox();
}

var CREDS = isNodeEnv ? require('./config').CREDS : window.CREDS;
var CONFIG = isNodeEnv ? require('./config').CONFIG : window.CONFIG;
var chatEndpoint = CONFIG.endpoints.chat;

var QBUser1 = isNodeEnv ? require('./config').QBUser1 : window.QBUser1;
var QBUser2 = isNodeEnv ? require('./config').QBUser2 : window.QBUser2;


var isOldVersion = chatEndpoint != "chatkafkacluster.quickblox.com";


var dialogId1Group;
var dialogId2GroupNotJoinable;
var dialogId3PublicGroup;
var dialogId4Private;
var messageIdGroup;
var messageIdToDelete;

describe('Chat API', function() {

    beforeAll(function() {
        QB_SENDER.init(CREDS.appId, CREDS.authKey, CREDS.authSecret, CONFIG);
        QB_RECEIVER.init(CREDS.appId, CREDS.authKey, CREDS.authSecret, CONFIG);
    });

    // =========================== REST API ======================================

    describe('REST API:', function() {

        beforeAll(function(done) {

            var createSessionParams = {
                'login': QBUser1.login,
                'password': QBUser1.password
            };

            QB_SENDER.createSession(createSessionParams, function (err, result) {
                expect(err).toBeNull();
                expect(result).toBeDefined();
                expect(result.application_id).toEqual(CREDS.appId);

                var connectToChatParams = {
                    'userId': QBUser2.id,
                    'password': QBUser2.password
                };
                QB_RECEIVER.chat.connect(connectToChatParams, function(err) {
                    expect(err).toBeNull();
                    done();
                });
            });
        }, REST_REQUESTS_TIMEOUT+LOGIN_TIMEOUT);

        // =======================CREATE PRIVATE DIALOG=============================

        describe('Create Private Dialog:', function() {
            it('can create a dialog (private)', function(done) {
                var params = {
                    occupants_ids: [QBUser2.id],
                    type: 3
                };

                QB_SENDER.chat.dialog.create(params, function(err, res) {
                    var usersIds = [QBUser1.id, QBUser2.id].sort();

                    expect(err).toBeNull();
                    expect(res).not.toBeNull();
                    expect(res._id).not.toBeNull();
                    expect(res.type).toEqual(3);
                    if(!isOldVersion){
                        expect(res.is_joinable).toEqual(0);
                    }
                    expect(res.occupants_ids).toEqual(usersIds);

                    dialogId4Private = res._id;

                    done();
                });
            }, REST_REQUESTS_TIMEOUT);

            it("can't create a dialog (private) (is_joinable=1)", function(done) {
                if(isOldVersion){
                    done();
                    return;
                }

                var params = {
                    occupants_ids: [QBUser2.id],
                    type: 3,
                    is_joinable: 1
                };

                QB_SENDER.chat.dialog.create(params, function(err, res) {
                    expect(err).not.toBeNull();
                    expect(res).toBeNull();

                    done();
                });
            }, REST_REQUESTS_TIMEOUT);
        });

        // =========================CREATE GROUP DIALOG=============================

        describe('Create Group Dialog:', function() {
            it('can create a dialog (group) and then join and send/receive a message', function(done) {
                var params = {
                    occupants_ids: [QBUser2.id],
                    name: 'joinable',
                    type: 2
                };

                QB_SENDER.chat.dialog.create(params, function(err, res) {
                    var usersIds = [QBUser1.id, QBUser2.id].sort();

                    expect(err).toBeNull();
                    expect(res).not.toBeNull();
                    expect(res._id).not.toBeNull();
                    expect(res.type).toEqual(params.type);
                    expect(res.name).toEqual(params.name);
                    expect(res.xmpp_room_jid).toContain(chatEndpoint);
                    if(!isOldVersion){
                        expect(res.is_joinable).toEqual(1);
                    }
                    expect(res.occupants_ids).toEqual(usersIds);

                    dialogId1Group = res._id;
                    console.info("dialogId1Group: " + dialogId1Group);

                    // now try to join and send a message
                    groupChat_joinAndSendAndReceiveMessageAndLeave(res.xmpp_room_jid, res._id, function(){
                        done();
                    });

                });
            }, REST_REQUESTS_TIMEOUT+MESSAGING_TIMEOUT+5000);

            it('can create a dialog (group)(not joinable) and then send/receive a message', function(done) {
                if(isOldVersion){
                    done();
                    return;
                }

                var params = {
                    occupants_ids: [QBUser2.id],
                    name: 'joinable=0',
                    type: 2,
                    is_joinable: 0
                };

                QB_SENDER.chat.dialog.create(params, function(err, res) {
                    var usersIds = [QBUser1.id, QBUser2.id].sort();

                    expect(err).toBeNull();
                    expect(res).not.toBeNull();
                    expect(res._id).not.toBeNull();
                    expect(res.type).toEqual(params.type);
                    expect(res.name).toEqual(params.name);
                    expect(res.xmpp_room_jid).toContain(chatEndpoint);
                    expect(res.is_joinable).toEqual(params.is_joinable);
                    expect(res.occupants_ids).toEqual(usersIds);

                    dialogId2GroupNotJoinable = res._id;

                    // now try to send a message without join
                    groupChat_sendAndReceiveMessage(res.xmpp_room_jid, res._id, function(){
                        done();
                    });

                });
            }, REST_REQUESTS_TIMEOUT+MESSAGING_TIMEOUT);
        });

        // =======================CREATE PUBLIC GROUP DIALOG========================

        describe('Create Public Group Dialog:', function() {
            it('can create a dialog (public group) and then join and send/receive a message', function(done) {
                var params = {
                    name: 'Public Awesome chat',
                    type: 1
                };
                QB_SENDER.chat.dialog.create(params, function(err, res) {
                    expect(err).toBeNull();
                    expect(res).not.toBeNull();
                    expect(res._id).not.toBeNull();
                    expect(res.type).toEqual(params.type);
                    expect(res.name).toEqual(params.name);
                    expect(res.xmpp_room_jid).toContain(chatEndpoint);

                    if(!isOldVersion){
                        expect(res.is_joinable).toEqual(1);
                    }

                    dialogId3PublicGroup = res._id;

                    // now try to send a message
                    //
                    groupChat_joinAndSendAndReceiveMessageAndLeave(res.xmpp_room_jid, res._id, function(){
                        done();
                    });
                });
            }, REST_REQUESTS_TIMEOUT+MESSAGING_TIMEOUT);

            it("can't create a dialog (public group) with is_joinable=0", function(done) {
                if(isOldVersion){
                    done();
                    return;
                }

                var params = {
                    name: 'Public Awesome chat',
                    type: 1,
                    is_joinable: 0
                };

                QB_SENDER.chat.dialog.create(params, function(err, res) {
                    expect(res).toBeNull();
                    expect(err).not.toBeNull();

                    done();
                });
            }, REST_REQUESTS_TIMEOUT);

        });

        // ==============================LIST DIALOGS===============================

        describe('List Dialogs:', function() {

            it('can list dialogs', function(done) {
                var filters = {};
                QB_SENDER.chat.dialog.list(filters, function(err, res) {
                    var minDialogsCount = 2;

                    expect(err).toBeNull();
                    expect(res).not.toBeNull();
                    expect(res.total_entries).toBeGreaterThan(minDialogsCount);
                    expect(res.items.length).toBeGreaterThan(minDialogsCount);
                    expect(res.skip).toEqual(0);
                    expect(res.limit).toEqual(100);

                    done();
                });
            }, REST_REQUESTS_TIMEOUT);

        });

        // ==========================UPDATE PRIVATE DIALOG==========================

        describe('Update Private Dialog:', function() {

            it("can't update a dialog (private) (set is_joinable=1)", function(done) {
                if(isOldVersion){
                    done();
                    return;
                }

                var toUpdate = {
                    is_joinable: 1
                };

                QB_SENDER.chat.dialog.update(dialogId4Private, toUpdate, function(err, res) {
                    expect(res).toBeNull();
                    expect(err).not.toBeNull();

                    done();
                });
            }, REST_REQUESTS_TIMEOUT);

        });

        // ===========================UPDATE GROUP DIALOG===========================

        describe('Update Group Dialog:', function() {

            it('can update a dialog (group) (also set is_joinable=0) and then send/receive a message', function(done) {
                if(isOldVersion){
                    done();
                    return;
                }

                var toUpdate = {
                    name: 'is_joinable=0_NewName',
                    is_joinable: 0
                };

                QB_SENDER.chat.dialog.update(dialogId1Group, toUpdate, function(err, res) {
                    expect(err).toBeNull();
                    expect(res).not.toBeNull();
                    expect(res.name).toEqual(toUpdate.name);
                    expect(res.is_joinable).toEqual(toUpdate.is_joinable);

                    // wait until Chat receive the packet through Kafka.
                    setTimeout(function(){
                        // now try to send a message without join
                        groupChat_sendAndReceiveMessage(res.xmpp_room_jid, res._id, function(){
                            done();
                        });
                    }, 1000);

                });
            }, REST_REQUESTS_TIMEOUT+MESSAGING_TIMEOUT);

            it('can update a dialog (group) (also set is_joinable=1)', function(done) {
                if(isOldVersion){
                    done();
                    return;
                }

                var toUpdate = {
                    name: 'is_joinable=1_NewName',
                    is_joinable: 1
                };

                QB_SENDER.chat.dialog.update(dialogId1Group, toUpdate, function(err, res) {
                    expect(err).toBeNull();
                    expect(res).not.toBeNull();
                    expect(res.name).toEqual(toUpdate.name);
                    expect(res.is_joinable).toEqual(toUpdate.is_joinable);

                    // wait until Chat receive the packet through Kafka.
                    setTimeout(function(){
                        // now try to send a message
                        groupChat_joinAndSendAndReceiveMessageAndLeave(res.xmpp_room_jid, res._id, function(){
                            done();
                        });
                    }, 1000);

                });
            }, REST_REQUESTS_TIMEOUT+MESSAGING_TIMEOUT);

            it("can't update a dialog (group) (set is_joinable=0) (if you are not an owner)", function(done) {
                if(isOldVersion){
                    done();
                    return;
                }

                // login with other user
                //
                var createSessionParams = {
                    'login': QBUser2.login,
                    'password': QBUser2.password
                };
                QB_SENDER.createSession(createSessionParams, function (err, result) {
                    expect(err).toBeNull();
                    expect(result).toBeDefined();
                    expect(result.application_id).toEqual(CREDS.appId);

                    var toUpdate = {
                        is_joinable: 0
                    };
                    QB_SENDER.chat.dialog.update(dialogId1Group, toUpdate, function(err, res) {
                        expect(res).toBeNull();
                        expect(err).not.toBeNull();

                        // back to origin user session
                        //
                        var createSessionParams = {
                            'login': QBUser1.login,
                            'password': QBUser1.password
                        };
                        QB_SENDER.createSession(createSessionParams, function (err, result) {
                            expect(err).toBeNull();
                            expect(result).toBeDefined();
                            expect(result.application_id).toEqual(CREDS.appId);

                            done();
                        });
                    });
                });
            }, 3*REST_REQUESTS_TIMEOUT);

            it("can update a dialog (group) (remove user and he received a 'kick' message)", function(done) {
                // User2 to join dialog
                var dialogJid = QB_SENDER.chat.helpers.getRoomJidFromDialogId(dialogId1Group);

                QB_RECEIVER.chat.muc.join(dialogJid, function(error, responce) {
                    expect(error).toBeNull();
                    expect(responce).toBeDefined();

                    // User1 to remove User2 from occupants
                    var toUpdateParams = {
                        pull_all: {occupants_ids: [QBUser2.id]},
                    };

                    QB_SENDER.chat.dialog.update(dialogId1Group, toUpdateParams, function(err, res) {
                        expect(err).toBeNull();
                        expect(res).toBeDefined();
                        expect(res.occupants_ids).toEqual([QBUser1.id]);
                    });

                    // User2 should receive a 'kick' message
                    //
                    QB_RECEIVER.chat.onKickOccupant = function(dialogId, initiatorUserId) {
                        expect(dialogId).toEqual(dialogId1Group);
                        if(!isOldVersion){
                            // we have different logic of 'actor' formation. In current version it's the account owner.
                            expect(initiatorUserId).toEqual(QBUser1.id);
                        }

                        QB_RECEIVER.chat.onKickOccupant = null;

                        done();
                    };

                });
            }, REST_REQUESTS_TIMEOUT+MESSAGING_TIMEOUT);

            it("can't join dialog where user is not in occupants", function(done) {
                setTimeout(function(){
                    var dialogJid = QB_SENDER.chat.helpers.getRoomJidFromDialogId(dialogId1Group);
                    QB_RECEIVER.chat.muc.join(dialogJid, function(error, responce) {
                        expect(error).not.toBeNull();
                        expect(error.code).toEqual('500');
                        expect(error.message).toBeDefined();

                        done();
                    });
                }, 1000);

            }, MESSAGING_TIMEOUT+1000);

            it("can't join not existent dialog", function(done) {
                setTimeout(function(){
                    QB_RECEIVER.chat.muc.join(CREDS.appId+"_53fc460b515c128132016675@muc."+chatEndpoint, function(error, responce) {
                        expect(error).not.toBeNull();
                        expect(error.code).toEqual('500');
                        expect(error.message).toBeDefined();

                        done();
                    });
                }, 1000);

            }, MESSAGING_TIMEOUT+1000);

            it("can update a dialog (group) (add user)", function(done) {
                // User1 to add User2 from occupants
                var toUpdateParams = {
                    push_all: {occupants_ids: [QBUser2.id]},
                };

                QB_SENDER.chat.dialog.update(dialogId1Group, toUpdateParams, function(err, res) {
                    var usersIds = [QBUser1.id, QBUser2.id].sort();

                    expect(err).toBeNull();
                    expect(res).toBeDefined();
                    expect(res.occupants_ids.sort()).toEqual(usersIds);

                    done();
                });

            }, REST_REQUESTS_TIMEOUT);

        });

        // =========================UPDATE PUBLIC GROUP DIALOG======================

        describe('Update Public Group Dialog:', function() {

            it("can't update a dialog (public group) (set is_joinable=0)", function(done) {
                if(isOldVersion){
                    done();
                    return;
                }

                var toUpdate = {
                    is_joinable: 0
                };

                QB_SENDER.chat.dialog.update(dialogId3PublicGroup, toUpdate, function(err, res) {
                    expect(res).toBeNull();
                    expect(err).not.toBeNull();

                    done();
                });
            }, REST_REQUESTS_TIMEOUT);

        });

        // =======================CREATE NORMAL MESSAGE=============================

        describe('Create Normal Private Message:', function() {

            it('can create a message and then DO NOT receive it (private dialog)(chat_dialog_id)', function(done) {
                var params = {
                    chat_dialog_id: dialogId4Private,
                    message: 'Warning! People are coming! REST message ' + Math.floor((Math.random() * 100) + 1)
                };

                var self = this;

                createNormalMessageViaRESTWithoutReceivingItTest(params, dialogId4Private, MESSAGING_TIMEOUT, function(messageId){
                    messageIdToDelete = messageId;
                    done();
                });

            }, REST_REQUESTS_TIMEOUT+MESSAGING_TIMEOUT);

            it('can create a message and then DO NOT receive it (private dialog)(recipient_id)', function(done) {
                var params = {
                    recipient_id: QBUser2.id,
                    message: 'Warning! People are coming! REST message ' + Math.floor((Math.random() * 100) + 1)
                };

                createNormalMessageViaRESTWithoutReceivingItTest(params, dialogId4Private, MESSAGING_TIMEOUT, function(messageId){
                    done();
                });

            }, REST_REQUESTS_TIMEOUT+MESSAGING_TIMEOUT);

            it('can create a message and then receive it (private dialog) (send_to_chat=1) (chat_dialog_id)', function(done) {
                var msgExtension = {
                    param1: "value1",
                    param2: "value2"
                };
                
                var params = {
                    chat_dialog_id: dialogId4Private,
                    message: "hello world, it's me, a message with send_to_chat=1 in private dialog " + Math.floor((Math.random() * 100) + 1),
                    param1: msgExtension.param1,
                    param2: msgExtension.param2,
                    send_to_chat: 1
                };

                createNormalMessageViaRESTAndReceiveItTest(params, msgExtension, dialogId4Private, "chat", function(messageId){
                    done();
                });

            }, REST_REQUESTS_TIMEOUT+MESSAGING_TIMEOUT);

            it('can create a message and then receive it (private dialog) (send_to_chat=1) (recipient_id)', function(done) {
                var msgExtension = {
                    param1: "value1",
                    param2: "value2"
                };
                var params = {
                    recipient_id: QBUser2.id,
                    message: "hello world, it's me, a message with send_to_chat=1 in private dialog " + Math.floor((Math.random() * 100) + 1),
                    param1: msgExtension.param1,
                    param2: msgExtension.param2,
                    send_to_chat: 1
                };

                createNormalMessageViaRESTAndReceiveItTest(params, msgExtension, dialogId4Private, "chat", function(messageId){
                    done();
                });

            }, REST_REQUESTS_TIMEOUT+MESSAGING_TIMEOUT);

            it("can't create a message for none existent dialog (send_to_chat= 1)", function(done) {
                var params = {
                    chat_dialog_id: "123_not_existent",
                    message: "hello world, it's me, a message with send_to_chat=1 in private dialog",
                    send_to_chat: 1
                };

                QB_SENDER.chat.message.create(params, function(err, res) {
                    expect(res).toBeNull();
                    expect(err).not.toBeNull();

                    done();
                });

            }, REST_REQUESTS_TIMEOUT);

            it("can't create a message for none existent dialog", function(done) {
                var params = {
                    chat_dialog_id: "123_not_existent",
                    message: "hello world, it's me, a message with send_to_chat=1 in private dialog"
                };

                QB_SENDER.chat.message.create(params, function(err, res) {
                    expect(res).toBeNull();
                    expect(err).not.toBeNull();

                    done();
                });

            }, REST_REQUESTS_TIMEOUT);

        });

        describe('Create Normal Group Message:', function() {

            it('can create a message and then DO NOT receive it (group dialog)', function(done) {
                var params = {
                    chat_dialog_id: dialogId1Group,
                    message: "hello world, it's me, group chat message " + Math.floor((Math.random() * 100) + 1)
                };

                createNormalMessageViaRESTWithoutReceivingItTest(params, dialogId1Group, MESSAGING_TIMEOUT, function(messageId){
                    done();
                });

            }, REST_REQUESTS_TIMEOUT+MESSAGING_TIMEOUT);

            it('can create a message and then receive it (group dialog) (send_to_chat=1)', function(done) {
                var msgExtension = {
                    param1: "value1",
                    param2: "value2"
                };

                var params = {
                    chat_dialog_id: dialogId1Group,
                    message: "hello world, it's me, a message with send_to_chat=1 in group dialog " + Math.floor((Math.random() * 100) + 1),
                    param1: msgExtension.param1,
                    param2: msgExtension.param2,
                    send_to_chat: 1
                };

                var dialogJid = QB_SENDER.chat.helpers.getRoomJidFromDialogId(dialogId1Group);
                QB_RECEIVER.chat.muc.join(dialogJid, function(error, responce) {
                    expect(error).toBeNull();
                    expect(responce).toBeDefined();

                    createNormalMessageViaRESTAndReceiveItTest(params, msgExtension, dialogId1Group, "groupchat", function(messageId){

                        QB_RECEIVER.chat.muc.leave(dialogJid, function() {
                            done();
                        });

                    });

                });

            }, REST_REQUESTS_TIMEOUT+MESSAGING_TIMEOUT);

        });

        // =======================CREATE SYSTEM MESSAGE=============================

        describe('Create System Message:', function() {

            it("can create a system message and then receive it (private dialog)", function(done) {
                if(isOldVersion){
                    done();
                    return;
                }

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

                var self = this;

                var finalize = function(restMessageId, xmppMessageId){
                    expect(restMessageId).toEqual(xmppMessageId);
                    done();
                };

                QB_SENDER.chat.message.create(params, function(err, res) {
                    expect(err).toBeNull();
                    expect(res._id).not.toBeNull();
                    expect(res.param1).toEqual(msgExtension.param1);
                    expect(res.param2).toEqual(msgExtension.param2);
                    expect(res.chat_dialog_id).toEqual(dialogId4Private);

                    if(self.systemMessageIdXMPP){
                        finalize(res._id, self.systemMessageIdXMPP);
                    }else{
                        self.systemMessageIdREST = res._id;
                    }
                });

                QB_RECEIVER.chat.onSystemMessageListener = function(receivedMessage) {
                    expect(receivedMessage.userId).toEqual(QBUser1.id);
                    expect(receivedMessage).toBeDefined();
                    expect(receivedMessage.body).toBeNull();
                    expect(receivedMessage.extension).toEqual(jasmine.objectContaining(msgExtension));

                    QB_RECEIVER.chat.onSystemMessageListener = null;

                    // sometimes we can receive an XMPP message earlier than REST response
                    if(self.systemMessageIdREST){
                        finalize(self.systemMessageIdREST, receivedMessage.id);
                    }else{
                        self.systemMessageIdXMPP = receivedMessage.id;
                    }
                };

            }, REST_REQUESTS_TIMEOUT);

            it("can't create a system message (group dialog)", function(done) {
                if(isOldVersion){
                    done();
                    return;
                }

                var params = {
                    chat_dialog_id: dialogId1Group,
                    param1: "value1",
                    param2: "value2",
                    system: 1
                };

                QB_SENDER.chat.message.create(params, function(err, res) {
                    expect(res).toBeNull();
                    expect(err).not.toBeNull();

                    done();
                });
            }, REST_REQUESTS_TIMEOUT);

        });

        // ============================UNREAD MESSAGES==============================

        describe('Unread Messages:', function() {

            it('can request unread messages count', function(done) {
                var params = { chat_dialog_ids: [dialogId1Group] };

                console.info("List unread messages for " + dialogId1Group);

                QB_SENDER.chat.message.unreadCount(params, function(err, res) {
                    expect(err).toBeNull();
                    expect(res[dialogId1Group]).toEqual(messagesUnreadStats[dialogId1Group][QBUser1.id]);

                    var totalUnread = 0;
                    expect(res.total).toBeGreaterThan(totalUnread);

                    done();
                });
            }, REST_REQUESTS_TIMEOUT);

        });

        // ============================UPDATE MESSAGES==============================

        describe('Update Messages:', function() {
            it("can set 'read' status for all messages in dialog", function(done) {
                QB_SENDER.chat.message.update('', {
                    'read': '1',
                    'chat_dialog_id': dialogId1Group
                }, function(error, result) {
                    expect(error).toBeNull();

                    var params = { chat_dialog_ids: [dialogId1Group] };
                    QB_SENDER.chat.message.unreadCount(params, function(err, res) {
                        expect(err).toBeNull();
                        expect(res[dialogId1Group]).toEqual(0);

                        var totalUnread = 0;
                        expect(res[dialogId1Group]).toEqual(totalUnread);

                        done();
                    });

                });
            }, REST_REQUESTS_TIMEOUT*2);

        });

        // ============================LIST MESSAGES================================

        describe('List Messages:', function() {

            it('can list messages', function(done) {
                var filters = { chat_dialog_id: dialogId1Group };
                console.info("List messages for " + dialogId1Group);

                QB_SENDER.chat.message.list(filters, function(err, res) {
                    expect(err).toBeNull();
                    expect(res).not.toBeNull();
                    expect(res.items.length).toBeGreaterThan(0);

                    done();
                });
            }, REST_REQUESTS_TIMEOUT);

        });

        // ============================DELETE MESSAGES==============================

        describe('Delete Messages:', function() {

            it('can delete a message with id', function(done) {
                QB_SENDER.chat.message.delete([messageIdToDelete, 'notExistentId'], {force: 1}, function(err, res) {
                    expect(err).toBeNull();

                    messageIdToDelete = null;

                    done();
                });
            }, REST_REQUESTS_TIMEOUT);

        });

        // ============================DELETE DIALOG==============================

        describe('Delete Dialog:', function() {

            it('can delete a dialog (group)', function(done) {
                QB_SENDER.chat.dialog.delete([dialogId1Group, 'notExistentId'], {force: 1}, function(err, res) {
                    var answ = JSON.parse(res);

                    expect(answ.SuccessfullyDeleted.ids).toEqual([dialogId1Group]);
                    expect(answ.NotFound.ids).toEqual(["notExistentId"]);
                    expect(answ.WrongPermissions.ids).toEqual([]);

                    done();
                });
            }, REST_REQUESTS_TIMEOUT);

            it('can delete dialogs', function(done) {
                if(!dialogId2GroupNotJoinable && !dialogId3PublicGroup && !dialogId4Private){
                    done();
                    return;
                }

                var dialogs = [];
                if(dialogId2GroupNotJoinable){
                    dialogs.push(dialogId2GroupNotJoinable);
                }
                if(dialogId3PublicGroup){
                    dialogs.push(dialogId3PublicGroup);
                }
                if(dialogId4Private){
                    dialogs.push(dialogId4Private);
                }

                QB_SENDER.chat.dialog.delete(dialogs.concat(["notExistentId"]), {force: 1}, function(err, res) {
                    var answ = JSON.parse(res);

                    expect(answ.SuccessfullyDeleted.ids.sort()).toEqual(dialogs.sort());
                    expect(answ.NotFound.ids).toEqual(["notExistentId"]);
                    expect(answ.WrongPermissions.ids).toEqual([]);

                    done();
                });
            }, REST_REQUESTS_TIMEOUT);

        });

        afterAll(function(done) {
            QB_SENDER.destroySession(function (err, result){
                expect(QB_SENDER.service.qbInst.session).toBeNull();

                QB_RECEIVER.chat.disconnect();

                done();
            });

        });

    });

    // ================================Real-time==================================

    describe('Real-time: ', function() {

        beforeAll(function(done) {
            QB_SENDER.chat.connect({
                'userId': QBUser1.id,
                'password': QBUser1.password
            }, function(err) {
                expect(err).toBeNull();
                console.info("CONNECTED with User1");

                QB_RECEIVER.chat.connect({
                    'userId': QBUser2.id,
                    'password': QBUser2.password
                }, function(err) {
                    expect(err).toBeNull();
                    console.info("CONNECTED with User2");

                    done();
                });

            });
        }, LOGIN_TIMEOUT);

        // =============================1-1 MESSAGING===============================

        describe('Messaging: ', function() {

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

                QB_RECEIVER.chat.onMessageListener = onMsgCallback;
                msg.id = QB_SENDER.chat.send(QBUser2.id, msg);

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

                QB_RECEIVER.chat.onSystemMessageListener = onSystemMessageListenerCb;
                msg.id = QB_SENDER.chat.sendSystemMessage(QBUser2.id, msg);

            }, MESSAGING_TIMEOUT);
        });

        // ===============================STATUSES==================================

        describe('Statuses: ', function() {
            var statusParams = {
                userId: QBUser2.id,
                messageId: '507f1f77bcf86cd799439011',
                dialogId: '507f191e810c19729de860ea'
            };

            var dialog;
            var message;

            beforeAll(function(done){

                var createSessionParams = {
                    'login': QBUser1.login,
                    'password': QBUser1.password
                };

                QB_SENDER.createSession(createSessionParams, function (err, result) {
                    expect(err).toBeNull();
                    expect(result).toBeDefined();
                    expect(result.application_id).toEqual(CREDS.appId);

                    var dialogCreateParams = {
                        type: 2,
                        occupants_ids: [QBUser2.id],
                        name: 'Jasmine Test Dialog'
                    };

                    QB_SENDER.chat.dialog.create(dialogCreateParams, function (err, res) {
                        var usersIds = [QBUser1.id, QBUser2.id].sort();

                        expect(err).toBeNull();
                        expect(res).toBeDefined();
                        expect(res.type).toEqual(dialogCreateParams.type);
                        expect(res.name).toEqual(dialogCreateParams.name);
                        expect(res.occupants_ids).toEqual(usersIds);

                        dialog = res;

                        var params = {
                            chat_dialog_id: res._id,
                            message: "checking how delivered_ids & read_ids work"
                        };

                        QB_SENDER.chat.message.create(params, function(err, res) {
                            expect(err).toBeNull();
                            expect(res).not.toBeNull();
                            expect(res.delivered_ids).toEqual([QBUser1.id]);
                            expect(res.read_ids).toEqual([QBUser1.id]);

                            message = res;

                            done();
                        });

                    });

                });

            });

            it('can send and receive \'delivered\' status', function(done) {
                function onDeliveredStatusListenerCb(messageId, dialogId, userId) {
                    expect(messageId).toEqual(statusParams.messageId);
                    expect(dialogId).toEqual(statusParams.dialogId);
                    expect(userId).toEqual(QBUser1.id);

                    done();
                }

                QB_RECEIVER.chat.onDeliveredStatusListener = onDeliveredStatusListenerCb;

                QB_SENDER.chat.sendDeliveredStatus(statusParams);

            }, MESSAGING_TIMEOUT);

            it('can send and receive \'read\' status', function(done) {
                function onReadStatusListenerCB(messageId, dialogId, userId) {
                    expect(messageId).toEqual(statusParams.messageId);
                    expect(dialogId).toEqual(statusParams.dialogId);
                    expect(userId).toEqual(QBUser1.id);

                    done();
                }

                QB_RECEIVER.chat.onReadStatusListener = onReadStatusListenerCB;

                QB_SENDER.chat.sendReadStatus(statusParams);
            }, MESSAGING_TIMEOUT);

            it('can send and receive \'is typing\' status (private)', function(done) {
                function onMessageTypingListenerCB(composing, userId, dialogId) {
                    expect(composing).toEqual(true);
                    expect(userId).toEqual(QBUser1.id);
                    expect(dialogId).toBeNull();

                    done();
                }

                QB_RECEIVER.chat.onMessageTypingListener = onMessageTypingListenerCB;

                QB_SENDER.chat.sendIsTypingStatus(QBUser2.id);

            }, MESSAGING_TIMEOUT);

            it('delivered_ids is updated properly', function(done) {

                var deliveredParams = {
                    userId: QBUser1.id,
                    messageId: message._id,
                    dialogId: dialog._id
                };

                function onDeliveredStatusListenerCb(messageId, dialogId, userId) {
                    expect(messageId).toEqual(deliveredParams.messageId);
                    expect(dialogId).toEqual(deliveredParams.dialogId);
                    expect(userId).toEqual(QBUser2.id);

                    QB_SENDER.chat.message.list({_id: message._id, chat_dialog_id: dialog._id}, function(err, res) {
                        var usersIds = [QBUser1.id, QBUser2.id].sort();
                        expect(err).toBeNull();
                        expect(res).not.toBeNull();
                        expect(res.items[0].delivered_ids.sort()).toEqual(usersIds);

                        done();
                    });
                }

                QB_SENDER.chat.onDeliveredStatusListener = onDeliveredStatusListenerCb;
                QB_RECEIVER.chat.sendDeliveredStatus(deliveredParams);

            }, MESSAGING_TIMEOUT+REST_REQUESTS_TIMEOUT);

            it('read_ids is updated properly', function(done) {

                var readParams = {
                    userId: QBUser1.id,
                    messageId: message._id,
                    dialogId: dialog._id
                };

                function onReadStatusListenerCb(messageId, dialogId, userId) {
                    expect(messageId).toEqual(readParams.messageId);
                    expect(dialogId).toEqual(readParams.dialogId);
                    expect(userId).toEqual(QBUser2.id);

                    QB_SENDER.chat.message.list({_id: message._id, chat_dialog_id: dialog._id}, function(err, res){
                        var usersIds = [QBUser1.id, QBUser2.id].sort();

                        expect(err).toBeNull();
                        expect(res).not.toBeNull();
                        expect(res.items[0].read_ids.sort()).toEqual(usersIds);

                        done();
                    });
                }

                QB_SENDER.chat.onReadStatusListener = onReadStatusListenerCb;
                QB_RECEIVER.chat.sendReadStatus(readParams);

            }, MESSAGING_TIMEOUT+REST_REQUESTS_TIMEOUT);

            afterAll(function(done) {
                QB_SENDER.chat.dialog.delete([dialog._id], {force: 1}, function(err, res) {
                    expect(err).toBeNull();

                    QB_SENDER.destroySession(function (err, result){
                        expect(err).toBeNull();

                        done();
                    });

                });
            });

        });

        // =============================GROUP MESSAGING=============================

        describe('Group Messaging: ', function() {
            var dialogJoinable;

            beforeAll(function(done){
                var createSessionParams = {
                    'login': QBUser1.login,
                    'password': QBUser1.password
                };

                QB_SENDER.createSession(createSessionParams, function (err, result) {
                    expect(err).toBeNull();
                    expect(result).toBeDefined();
                    expect(result.application_id).toEqual(CREDS.appId);

                    var dialogCreateParams = {
                        type: 2,
                        occupants_ids: [QBUser2.id],
                        name: 'Jasmine Test Dialog'
                    };

                    QB_SENDER.chat.dialog.create(dialogCreateParams, function (err, res) {
                        var usersIds = [QBUser1.id, QBUser2.id].sort();

                        expect(err).toBeNull();
                        expect(res).toBeDefined();
                        expect(res.type).toEqual(dialogCreateParams.type);
                        expect(res.name).toEqual(dialogCreateParams.name);
                        expect(res.occupants_ids).toEqual(usersIds);

                        dialogJoinable = res;

                        done();
                    });
                });

            }, REST_REQUESTS_TIMEOUT*2);

            it('can join group chat by JID / OLD way', function(done) {
                var dialogId = QB_SENDER.chat.helpers.getDialogIdFromNode(dialogJoinable.xmpp_room_jid);

                QB_SENDER.chat.muc.join(dialogJoinable.xmpp_room_jid, function(stanza) {
                    expect(stanza).not.toBeNull();

                    done();
                });
            }, MESSAGING_TIMEOUT);

            it('can join group chat by JID', function(done) {
                var dialogId = QB_SENDER.chat.helpers.getDialogIdFromNode(dialogJoinable.xmpp_room_jid);

                QB_SENDER.chat.muc.join(dialogJoinable.xmpp_room_jid, function(error, responce) {
                    expect(error).toBeNull();
                    expect(responce.dialogId).toEqual(dialogId);

                    done();
                });
            }, MESSAGING_TIMEOUT);

            it('can join group chat by Id', function(done) {
                var dialogId = QB_SENDER.chat.helpers.getDialogIdFromNode(dialogJoinable.xmpp_room_jid);

                QB_SENDER.chat.muc.join(dialogId, function(error, responce) {
                    expect(error).toBeNull();
                    expect(responce.dialogId).toEqual(dialogId);

                    done();
                });
            }, MESSAGING_TIMEOUT);

            it('can get error joining unexisted dialog', function(done) {
                var wrongJid = 'a'+ dialogJoinable.xmpp_room_jid;
                var dialogId = QB_SENDER.chat.helpers.getDialogIdFromNode(wrongJid);

                QB_SENDER.chat.muc.join(wrongJid, function(error, responce) {
                    expect(error).toBeDefined();
                    expect(responce.dialogId).toEqual(dialogId);

                    done();
                });
            }, MESSAGING_TIMEOUT);

            it('can get error joining unexisted dialog / OLD way', function(done) {
                var wrongJid = 'a'+ dialogJoinable.xmpp_room_jid;
                var dialogId = QB_SENDER.chat.helpers.getDialogIdFromNode(wrongJid);

                QB_SENDER.chat.muc.join(wrongJid, function(stanza) {
                    var errorCode;
                    var errorName;
                    var errElement = xmlGetElement(stanza, 'error');

                    if(errElement){	
                        errorCode = xmlGetAttr(errElement, 'code');	
                        errorName = xmlGetElement(errElement, 'item-not-found');	
                    }

                    expect(errorCode).toEqual('500');

                    done();
                });
            }, MESSAGING_TIMEOUT);

            it('can get online users', function(done) {
                QB_SENDER.chat.muc.listOnlineUsers(dialogJoinable.xmpp_room_jid, function(users) {
                    expect(users).toEqual([QBUser1.id]);

                    done();
                });
            }, MESSAGING_TIMEOUT);

            it('can leave group chat', function(done) {
                QB_SENDER.chat.muc.leave(dialogJoinable.xmpp_room_jid, function() {
                    done();
                });
            }, MESSAGING_TIMEOUT);

            it("can receive statuses related to join", function(done){
                var statusesReceivedCount = 0;

                var maybeDone = function(){
                    ++statusesReceivedCount;
                    if(statusesReceivedCount == 3){
                        done();
                    }
                };

                var dialogId = QB_SENDER.chat.helpers.getDialogIdFromNode(dialogJoinable.xmpp_room_jid);

                QB_SENDER.chat.muc.join(dialogJoinable.xmpp_room_jid, function(error, responce) {
                    expect(error).toBeNull();
                    expect(responce.dialogId).toEqual(dialogId);


                    QB_RECEIVER.chat.muc.join(dialogJoinable.xmpp_room_jid, function(error, responce) {
                        expect(error).toBeNull();
                        expect(responce.dialogId).toEqual(dialogId);

                        maybeDone();
                    });

                    QB_RECEIVER.chat.onJoinOccupant = function(dialogId, userId){
                        expect(userId).toEqual(QBUser1.id);
                        expect(dialogId).toEqual(dialogJoinable._id);

                        QB_RECEIVER.chat.onJoinOccupant = null;

                        maybeDone();
                    };

                });

                QB_SENDER.chat.onJoinOccupant = function(dialogId, userId){
                    expect(userId).toEqual(QBUser2.id);
                    expect(dialogId).toEqual(dialogJoinable._id);

                    QB_SENDER.chat.onJoinOccupant = null;

                    maybeDone();
                };

            }, 10000);

            it("can receive statuses related to leave", function(done){
                QB_SENDER.chat.onLeaveOccupant = function(dialogId, userId){
                    expect(userId).toEqual(QBUser2.id);
                    expect(dialogId).toEqual(dialogJoinable._id);

                    QB_SENDER.chat.onLeaveOccupant = null;

                    // cleanup
                    QB_SENDER.chat.muc.leave(dialogJoinable.xmpp_room_jid, function() {
                        done();
                    });

                };

                console.info("LEAVE");
                QB_RECEIVER.chat.muc.leave(dialogJoinable.xmpp_room_jid, function() {
                    console.info("LEAVED");
                });

            }, 5000);

            it("can't send messages to not joined room", function(done) {
                var msg = {
                    type: 'groupchat',
                    body: 'Warning! People are coming! XMPP message ' + Math.floor((Math.random() * 100) + 1)
                };

                QB_SENDER.chat.onMessageErrorListener = function (messageId, error) {
                    console.info(error, messageId);
                    QB_SENDER.chat.onMessageErrorListener = null;

                    done();
                };
                msg.id = QB_SENDER.chat.send(dialogJoinable.xmpp_room_jid, msg);

            }, MESSAGING_TIMEOUT);

            it("can't send messages to not existent room", function(done) {
                var msg = {
                    type: 'groupchat',
                    body: 'Warning! People are coming! XMPP message ' + Math.floor((Math.random() * 100) + 1)
                };

                QB_SENDER.chat.onMessageErrorListener = function (messageId, error) {
                    console.info(messageId);
                    console.info(error);
                    QB_SENDER.chat.onMessageErrorListener = null;

                    done();
                };
                msg.id = QB_SENDER.chat.send(CREDS.appId+"_53fc460b515c128132016675@muc."+chatEndpoint, msg);

            }, MESSAGING_TIMEOUT);

            it("can join joinable=0 room and do not receive room statuses", function(done) {
                if(isOldVersion){
                    done();
                    return;
                }

                QB_SENDER.chat.dialog.update(dialogJoinable._id, {is_joinable: 0}, function(err, res) {
                    expect(res).not.toBeNull();
                    expect(err).toBeNull();

                    setTimeout(function(){

                        var statusesReceivedCount = 0;

                        QB_SENDER.chat.onJoinOccupant = function(dialogId, userId){
                            ++statusesReceivedCount;
                        };

                        QB_SENDER.chat.muc.join(dialogJoinable.xmpp_room_jid, function(error, responce) {
                            expect(error).not.toBeNull();
                            expect(responce).toBeDefined();

                            QB_RECEIVER.chat.onJoinOccupant = function(dialogId, userId){
                                ++statusesReceivedCount;
                            };

                            QB_RECEIVER.chat.muc.join(dialogJoinable.xmpp_room_jid, function(error, responce) {
                                expect(error).not.toBeNull();
                                expect(responce).toBeDefined();
                            });
                        });

                        console.info("Waiting for ROOM statuses timeout");
                        setTimeout(function(){
                            console.info("ROOM statuses timeout");
                            QB_RECEIVER.chat.onJoinOccupant = null;
                            QB_SENDER.chat.onJoinOccupant = null;

                            console.info(statusesReceivedCount);
                            expect(statusesReceivedCount).toEqual(0);
                            done();

                        }, 5000);

                    }, 3000);

                });
            }, REST_REQUESTS_TIMEOUT+MESSAGING_TIMEOUT+3000);

            afterAll(function(done) {
                QB_SENDER.chat.dialog.delete([dialogJoinable._id], {force: 1}, function(err, res) {
                    expect(err).toBeNull();

                    QB_SENDER.destroySession(function (err, result){
                        expect(err).toBeNull();

                        done();
                    });

                });
            }, REST_REQUESTS_TIMEOUT*2);

        });

        // ============================Last Activity================================

        describe('User Last Activity: ', function() {

            it('can send query to the last user activity and get response (not existing user)', function(done) {
                var notExistingUserId = 999999999999000;

                QB_SENDER.chat.onLastUserActivityListener = function(userId, seconds) {
                    expect(userId).toEqual(notExistingUserId);
                    expect(seconds).toBeUndefined();

                    done();
                };

                // send query to the last user activity from the never logged user
                QB_SENDER.chat.getLastUserActivity(notExistingUserId);
            }, IQ_TIMEOUT);

            it('can send query to the last user activity and get response (existing user)', function(done) {
                QB_SENDER.chat.onLastUserActivityListener = function(userId, seconds) {
                    expect(userId).toEqual(QBUser2.id);
                    expect(seconds).toBeGreaterThanOrEqual(0);

                    done();
                };

                // send query to the last user activity from the receiver
                QB_SENDER.chat.getLastUserActivity(QBUser2.id);
            }, IQ_TIMEOUT);

        });

        // ============================Contact List=================================

        describe('[Roster] Contact list: ', function() {

            it('can add a user to contact list and confirm the subscription request', function(done) {
                QB_RECEIVER.chat.onSubscribeListener = function(userId) {
                    QB_SENDER.chat.onSubscribeListener = null;

                    expect(userId).toEqual(QBUser1.id);

                    QB_RECEIVER.chat.roster.confirm(userId, function() {

                    });
                };
                QB_RECEIVER.chat.onContactListListener = function(userId, type) {
                    QB_RECEIVER.chat.onContactListListener = null;

                    expect(userId).toEqual(QBUser1.id);
                    expect(type).not.toBeDefined();

                    done();
                };

                QB_SENDER.chat.onConfirmSubscribeListener = function(userId) {
                    QB_SENDER.chat.onConfirmSubscribeListener = null;

                    expect(userId).toEqual(QBUser2.id);
                };
                QB_SENDER.chat.onContactListListener = function(userId, type) {
                    QB_SENDER.chat.onContactListListener = null;

                    expect(userId).toEqual(QBUser2.id);
                    expect(type).not.toBeDefined();
                };

                QB_SENDER.chat.roster.add(QBUser2.id, function() {

                });

            }, IQ_TIMEOUT*2);

            it('can retrieve contact list', function(done) {
                QB_SENDER.chat.roster.get(function(roster) {
                    expect(roster).toBeDefined();
                    expect(QBUser2.id in roster).toEqual(true);
                    expect(roster[QBUser2.id].ask).toBeNull();
                    expect(roster[QBUser2.id].subscription).toEqual("both");

                    QB_RECEIVER.chat.roster.get(function(roster) {
                        expect(roster).toBeDefined();
                        expect(QBUser1.id in roster).toEqual(true);
                        expect(roster[QBUser1.id].ask).toBeNull();
                        expect(roster[QBUser1.id].subscription).toEqual("both");

                        done();
                    });
                });

            }, IQ_TIMEOUT*2);

            it('can remove user from contact list', function(done) {
                QB_SENDER.chat.roster.remove(QBUser2.id, function() {
                    QB_RECEIVER.chat.roster.remove(QBUser1.id, function() {
                        done();
                    });
                });
            }, IQ_TIMEOUT);

            it('can reject subscription request', function(done) {
                QB_RECEIVER.chat.onSubscribeListener = function(userId) {
                    QB_RECEIVER.chat.onSubscribeListener = null;

                    expect(userId).toEqual(QBUser1.id);

                    QB_RECEIVER.chat.roster.reject(userId, function() {

                    });
                };

                QB_SENDER.chat.onRejectSubscribeListener = function(userId) {
                    expect(userId).toEqual(QBUser2.id);

                    done();
                };

                QB_SENDER.chat.roster.add(QBUser2.id, function() {

                });

            }, IQ_TIMEOUT);

        });

        // ==========================Privacy Lists==================================

        describe('Privacy list: ', function() {
            var PRIVACY_LIST_NAME = "blockedusers";

            it('can create new list with items', function(done) {
                var usersObj = [
                    {user_id: QBUser2.id, action: 'deny', mutualBlock: true}
                ];

                var list = {name: PRIVACY_LIST_NAME, items: usersObj};

                QB_SENDER.chat.privacylist.create(list, function(error) {
                    expect(error).toBeNull();

                    done();
                });

                QB_RECEIVER.chat.privacylist.create(list, function(error) {
                    expect(error).toBeNull();

                    done();
                });
            }, IQ_TIMEOUT);

            it('can set default list', function(done) {
                QB_SENDER.chat.privacylist.setAsDefault(PRIVACY_LIST_NAME, function(error) {
                    expect(error).toBeNull();

                    QB_SENDER.chat.privacylist.getNames(function(error, response) {
                        expect(error).toBeNull();
                        expect(response.default).toEqual(PRIVACY_LIST_NAME);

                        done();
                    });
                });

                QB_RECEIVER.chat.privacylist.setAsDefault(PRIVACY_LIST_NAME, function(error) {
                    expect(error).toBeNull();

                    QB_RECEIVER.chat.privacylist.getNames(function(error, response) {
                        expect(error).toBeNull();
                        expect(response.default).toEqual(PRIVACY_LIST_NAME);

                        done();
                    });
                });
            });

            it('can get list by name', function(done) {
                QB_SENDER.chat.privacylist.getList(PRIVACY_LIST_NAME, function(error, response) {
                    expect(error).toBeNull();

                    expect(response.name).toEqual(PRIVACY_LIST_NAME);
                    expect(response.items.length).toEqual(1);
                    expect(response.items[0]).toEqual({user_id: QBUser2.id, action: 'deny'});

                    done();
                });
            }, IQ_TIMEOUT);

            it('can not send a message when blocked', function(done) {
                // Try to send a message
                //
                var msg = {
                        type: 'chat',
                        body: 'Warning! Privacy is coming'
                    };

                var sendersMessageId = QB_SENDER.chat.send(QBUser2.id, msg),
                    receiversMessageId = QB_RECEIVER.chat.send(QBUser1.id, msg);

                QB_SENDER.chat.onMessageErrorListener = function(messageId, error) {
                    expect(sendersMessageId).toEqual(messageId);

                    done();
                };

                QB_RECEIVER.chat.onMessageErrorListener = function(messageId, error) {
                    expect(receiversMessageId).toEqual(messageId);

                    done();
                };
            });

            it('can declines the use of default lists', function(done) {
                QB_SENDER.chat.privacylist.setAsDefault(null, function(error) {
                    expect(error).toBeNull();

                    QB_SENDER.chat.privacylist.getNames(function(error, response) {
                        expect(error).toBeNull();
                        expect(response.default).toBeNull();

                        done();
                    });
                });

                QB_RECEIVER.chat.privacylist.setAsDefault(null, function(error) {
                    expect(error).toBeNull();

                    QB_RECEIVER.chat.privacylist.getNames(function(error, response) {
                        expect(error).toBeNull();
                        expect(response.default).toBeNull();

                        done();
                    });
                });
            });

            it('can get names of privacy lists', function(done) {
                QB_SENDER.chat.privacylist.getNames(function(error, response) {
                    expect(error).toBeNull();
                    expect(response.default).toBeNull();
                    expect(response.names.length).toEqual(1);
                    expect(response.names[0]).toEqual(PRIVACY_LIST_NAME);

                    done();
                });
            });

            it('can update list by name', function(done) {
                var usersArr = [
                    {user_id: QBUser2.id, action: 'allow'}
                ];

                var list = {name: PRIVACY_LIST_NAME, items: usersArr};

                QB_SENDER.chat.privacylist.update(list, function(error) {
                    expect(error).toBeDefined();

                    QB_SENDER.chat.privacylist.getList(PRIVACY_LIST_NAME, function(error, response) {
                        expect(error).toBeNull();

                        expect(response.name).toEqual(PRIVACY_LIST_NAME);
                        expect(response.items.length).toEqual(1);

                        done();
                    });

                });
            }, IQ_TIMEOUT*2);

            it('can delete list by name', function(done) {
                QB_SENDER.chat.privacylist.delete(PRIVACY_LIST_NAME, function(error) {
                    expect(error).toBeNull();

                    QB_SENDER.chat.privacylist.getNames(function(error, response) {
                        expect(error).toBeNull();
                        expect(response.names.length).toEqual(0);

                        done();
                    });
                });

                QB_RECEIVER.chat.privacylist.delete(PRIVACY_LIST_NAME, function(error) {
                    expect(error).toBeNull();

                    QB_RECEIVER.chat.privacylist.getNames(function(error, response) {
                        expect(error).toBeNull();
                        expect(response.names.length).toEqual(0);

                        done();
                    });
                });
            });

        });

        afterAll(function(done) {
            QB_SENDER.chat.onDisconnectedListener = function(){

                QB_RECEIVER.chat.onDisconnectedListener = function(){
                    done();
                };

                QB_RECEIVER.chat.disconnect();
            };

            QB_SENDER.chat.disconnect();
        });
    });
});


//////////////// HELPERS

var messagesSentStats = {};
var messagesUnreadStats = {};

function incrementMessagesSentPerDialog(dialogId, isREST, userId){
    // SENT
    var count = messagesSentStats[dialogId];
    if(!count){
        count = 0;
    }
    ++count;
    messagesSentStats[dialogId] = count;
    console.info("SENT: " + count + ". userId: " + userId + ", isREST:" + isREST + ". Dialog: " + dialogId);

    // UNREAD
    //
    // ignoring 'UNREAD' statuses for public dialogs
    if(dialogId == dialogId3PublicGroup){
        return;
    }
    //
    var uid = userId == QBUser1.id ? QBUser2.id : QBUser1.id;
    var dlg = messagesUnreadStats[dialogId];
    if(!dlg){
        messagesUnreadStats[dialogId] = {};
        messagesUnreadStats[dialogId][uid] = 0;
    }
    count = messagesUnreadStats[dialogId][uid];
    if(!count){
        count = 0;
    }
    ++count;
    messagesUnreadStats[dialogId][uid] = count;
    console.info("UNREAD: " + count+ ". userId: " + uid + ". Dialog: " + dialogId);
}

function groupChat_joinAndSendAndReceiveMessageAndLeave(roomJid, dialogId, callback) {
    groupChat_joinAndSendAndReceiveMessage(roomJid, dialogId, function() {
        QB_RECEIVER.chat.muc.leave(roomJid, function() {
            callback();
        });
    });
}

function groupChat_joinAndSendAndReceiveMessage(roomJid, dialogId, callback) {
    QB_RECEIVER.chat.muc.join(roomJid, function(error, responce) {
        expect(error).toBeNull();
        expect(responce).toBeDefined();

        groupChat_sendAndReceiveMessage(roomJid, dialogId, function(){
            callback();
        });

    });
}

function groupChat_sendAndReceiveMessage(roomJid, dialogId, callback){
    var body = 'Warning! People are coming! XMPP message ' + Math.floor((Math.random() * 100) + 1);
    var msgExtension = {
        name: 'skynet',
        mission: 'take over the planet',
        save_to_history: 1
    };
    var msg = {
        type: 'groupchat',
        body: body,
        extension: msgExtension,
        markable: 1
    };

    incrementMessagesSentPerDialog(dialogId, false, QBUser2.id);

    function onMsgCallback(userId, receivedMessage) {
        expect(userId).toEqual(QBUser2.id);
        expect(receivedMessage).toBeDefined();
        expect(receivedMessage.id).toEqual(msg.id);
        expect(receivedMessage.type).toEqual(msg.type);
        expect(receivedMessage.body).toEqual(body);
        expect(receivedMessage.extension.name).toEqual(msgExtension.name);
        expect(receivedMessage.extension.mission).toEqual(msgExtension.mission);
        expect(receivedMessage.extension.dialog_id).toEqual(dialogId);
        expect(receivedMessage.markable).toEqual(msg.markable);

        QB_RECEIVER.chat.onMessageListener = null;

        callback();
    }

    QB_RECEIVER.chat.onMessageListener = onMsgCallback;
    msg.id = QB_RECEIVER.chat.send(roomJid, msg);
}

function createNormalMessageViaRESTWithoutReceivingItTest(params, dialogId, timeout, callback){
    var mesageId;

    QB_SENDER.chat.message.create(params, function(err, res) {
        expect(err).toBeNull();
        expect(res).toBeDefined()
        expect(res._id).not.toBeNull();
        expect(res.message).toEqual(params.message);
        expect(res.chat_dialog_id).toEqual(dialogId);

        mesageId = res._id;

        incrementMessagesSentPerDialog(dialogId, true, QBUser1.id);
    });

    var messageReceived = false;
    QB_RECEIVER.chat.onMessageListener = function(userId, receivedMessage) {
        messageReceived = true;
    };

    console.info("Waiting for MSG timeout");
    setTimeout(function(){
        console.info("MSG receive timeout");
        QB_RECEIVER.chat.onMessageListener = null;
        expect(messageReceived).toEqual(false);
        callback(mesageId);
    }, timeout);
};

function createNormalMessageViaRESTAndReceiveItTest(params, msgExtension, dialogId, xmppMessageType, callback){
    var normalMessageIdXMPP, normalMessageIdREST;

    var finalize = function(restMessageId, xmppMessageId){
        expect(restMessageId).toEqual(xmppMessageId);
        callback(restMessageId);
    };

    QB_SENDER.chat.message.create(params, function(err, res) {
        expect(err).toBeNull();
        expect(res).toBeDefined();
        expect(res._id).not.toBeNull();
        expect(res.message).toEqual(params.message);
        expect(res.chat_dialog_id).toEqual(dialogId);
        expect(res.date_sent).not.toBeNull();

        incrementMessagesSentPerDialog(dialogId, true, QBUser1.id);

        if(normalMessageIdXMPP){
            finalize(res._id, normalMessageIdXMPP);
        }else{
            normalMessageIdREST = res._id;
        }
    });

    QB_RECEIVER.chat.onMessageListener = function(userId, receivedMessage) {
        expect(userId).toEqual(QBUser1.id);
        expect(receivedMessage).toBeDefined();
        expect(receivedMessage.id).not.toBeNull();
        expect(receivedMessage.type).toEqual(xmppMessageType);
        expect(receivedMessage.body).toEqual(params.message);

        expect(receivedMessage.extension.save_to_history).toEqual("1");
        expect(receivedMessage.extension).toEqual(jasmine.objectContaining(msgExtension));
        expect(receivedMessage.extension.dialog_id).toEqual(dialogId);
        expect(receivedMessage.extension.date_sent).toBeDefined();

        QB_RECEIVER.chat.onMessageListener = null;

        if(normalMessageIdREST){
            finalize(normalMessageIdREST, receivedMessage.id);
        }else{
            normalMessageIdXMPP = receivedMessage.id;
        }
    };
};

function xmlGetAttr(el, attrName) {	
    var attr;	
	
    if(typeof el.getAttribute === 'function') {	
        attr = el.getAttribute(attrName);	
    } else if(el.attrs) {	
        attr = el.attrs[attrName];	
    } else {	
        throw ERR_UNKNOWN_INTERFACE;	
    }	
	
    return attr ? attr : null;	
};	
	
function xmlGetElement(stanza, elName) {	
    var el;	
    	
    if(typeof stanza.querySelector === 'function') {	
        el = stanza.querySelector(elName);	
    } else if(typeof stanza.getChild === 'function'){	
        el = stanza.getChild(elName);	
    } else {	
        throw ERR_UNKNOWN_INTERFACE;	
    }	
    	
    return el ? el : null;	
};
