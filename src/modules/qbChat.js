/*
 * QuickBlox JavaScript SDK
 * Chat Module
 */

var config = require('../qbConfig'),
    Utils = require('../qbUtils');

var unsupported = 'This function isn\'t supported outside of the browser (...yet)';

/**
 * For Node env.
 * NodeClient - constructor from node-xmpp-client
 * nClient - connection
 */
var NodeClient,
    nClient;

var nodeStanzasCallbacks = {};

if (Utils.getEnv().browser) {
    require('strophe');
    // add extra namespaces for Strophe
    Strophe.addNamespace('CARBONS', 'urn:xmpp:carbons:2');
    Strophe.addNamespace('CHAT_MARKERS', 'urn:xmpp:chat-markers:0');
    Strophe.addNamespace('PRIVACY_LIST', 'jabber:iq:privacy');
    Strophe.addNamespace('CHAT_STATES', 'http://jabber.org/protocol/chatstates');
} else {
    NodeClient = require('node-xmpp-client');
}

var dialogUrl = config.urls.chat + '/Dialog';
var messageUrl = config.urls.chat + '/Message';

var connection,
    webrtc,
    roster = {},
    joinedRooms = {};

function ChatProxy(service, webrtcModule, conn) {
    var self = this;

    webrtc = webrtcModule;
    connection = conn;

    this.service = service;
    this.roster = new RosterProxy(service);

    this._isLogout = false;
    this._isDisconnected = false;

    this.privacylist = new PrivacyListProxy(service);
    this.dialog = new DialogProxy(service);
    this.message = new MessageProxy(service);
    this.helpers = new Helpers();
    this.muc = new MucProxy(service);

/*
 * User's callbacks (listener-functions):
 * - onMessageListener
 * - onMessageErrorListener(messageId, error)
 * - onMessageTypingListener
 * - onDeliveredStatusListener
 * - onReadStatusListener
 * - onSystemMessageListener
 * - onContactListListener
 * - onSubscribeListener
 * - onConfirmSubscribeListener
 * - onRejectSubscribeListener
 * - onDisconnectedListener
 * - onReconnectListener
 */

    this._onMessage = function(stanza) {
        var from, to,
            type,
            messageId,
            body, bodyContent,
            markable, delivered, read,
            recipient, recipientId,
            composing, paused,
            invite,
            extraParams,
            delay,
            jid;

        if (Utils.getEnv().browser) {
            from = stanza.getAttribute('from');
            to = stanza.getAttribute('to');
            messageId = stanza.getAttribute('id');
            type = stanza.getAttribute('type');
            body = stanza.querySelector('body');
            bodyContent = (body && body.textContent) || null;
            recipient = stanza.querySelector('forwarded') ? stanza.querySelector('forwarded').querySelector('message').getAttribute('to') : null;
            recipientId = recipient ? self.helpers.getIdFromNode(recipient) : null;
            markable = stanza.querySelector('markable');
            delivered = stanza.querySelector('received');
            read = stanza.querySelector('displayed');
            composing = stanza.querySelector('composing');
            paused = stanza.querySelector('paused');
            invite = stanza.querySelector('invite');
            extraParams = stanza.querySelector('extraParams');
            delay = stanza.querySelector('delay');

            jid = connection.jid;
        } else if(Utils.getEnv().node){
            from = stanza.attrs.from;
            to = stanza.attrs.to;
            type = stanza.attrs.type;
            messageId = stanza.attrs.id;
            body = stanza.getChildText('body');
            bodyContent = body || null;
            markable = stanza.getChild('markable');
            delivered = stanza.getChild('received');
            read = stanza.getChild('displayed');
            composing = stanza.getChild('composing');
            paused = stanza.getChild('paused');
            invite = stanza.getChild('invite');
            extraParams = stanza.getChild('extraParams');
            delay = stanza.getChild('delay');
        
            jid = nClient.options.jid.user;
        }

        var dialogId = type === 'groupchat' ? self.helpers.getDialogIdFromNode(from) : null,
            userId = type === 'groupchat' ? self.helpers.getIdFromResource(from) : self.helpers.getIdFromNode(from),
            marker = delivered || read || null;

        var extraParamsParsed;

        // ignore invite messages from MUC
        //
        if (invite) return true;


        // parse extra params
        if(extraParams){
            extraParamsParsed = self._parseExtraParams(extraParams);

            if(extraParamsParsed.dialogId){
                dialogId = extraParamsParsed.dialogId;
            }
        }

        // fire 'is typing' callback
        //
        if(composing || paused){
            if (typeof self.onMessageTypingListener === 'function' && (type === 'chat' || type === 'groupchat' || !delay)){
                Utils.safeCallbackCall(self.onMessageTypingListener, !!composing, userId, dialogId);
            }

            return true;
        }

        // fire read/delivered listeners
        //
        if (marker) {
            if (delivered) {
                if (typeof self.onDeliveredStatusListener === 'function' && type === 'chat') {
                    if(Utils.getEnv().browser){
                        Utils.safeCallbackCall(self.onDeliveredStatusListener, delivered.getAttribute('id'), dialogId, userId);
                    } else if(Utils.getEnv().node){
                        Utils.safeCallbackCall(self.onDeliveredStatusListener, delivered.attrs.id, dialogId, userId);
                    }
                }
            } else {
                if (typeof self.onReadStatusListener === 'function' && type === 'chat') {
                    if(Utils.getEnv().browser){
                        Utils.safeCallbackCall(self.onReadStatusListener, read.getAttribute('id'), dialogId, userId);
                    } else if(Utils.getEnv().node){
                        Utils.safeCallbackCall(self.onReadStatusListener, read.attrs.id, dialogId, userId);
                    }
                }
            }
            return true;
        }

        // autosend 'received' status (ignore messages from self)
        //
        if (markable && userId != self.helpers.getIdFromNode(jid)) {
            var params = {
                messageId: messageId,
                userId: userId,
                dialogId: dialogId
            };

            self.sendDeliveredStatus(params);
        }

        // fire 'onMessageListener'
        //
        var message = {
            id: messageId,
            dialog_id: dialogId,
            recipient_id: recipientId,
            type: type,
            body: bodyContent,
            extension: extraParamsParsed ? extraParamsParsed.extension : null,
            delay: delay
        };

        if (markable) {
            message.markable = 1;
        }
        if (typeof self.onMessageListener === 'function' && (type === 'chat' || type === 'groupchat')){
            Utils.safeCallbackCall(self.onMessageListener, userId, message);
        }

        // we must return true to keep the handler alive
        // returning false would remove it after it finishes
        return true;
    };

    this._onPresence = function(stanza) {
        var from,
            type,
            userId;

        if(Utils.getEnv().browser){
            from = stanza.getAttribute('from');
            type = stanza.getAttribute('type');
        } else if(Utils.getEnv().node){
            from = stanza.attrs.from;
            type = stanza.attrs.type;
        }

        userId = self.helpers.getIdFromNode(from);

        if(Utils.getEnv().node) {
            var x = stanza.getChild('x');

            /** MUC */
            if(x && x.attrs.xmlns == "http://jabber.org/protocol/muc#user"){
                var status = x.getChild('status');
                /**
                 * if you make 'leave' from dialog
                 * stanza will be contains type="unavailable"
                 */
                var type = stanza.attrs.type;

                /** LEAVE from dialog */
                if(type && type === 'unavailable' && nodeStanzasCallbacks['muc:leave']) {
                    if(status && status.attrs.code == "110"){
                        nodeStanzasCallbacks['muc:leave'](null);
                        return;
                    }
                }
                
                /** JOIN to dialog */
                if(stanza.attrs.id) {
                    if(status && status.attrs.code == "110"){
                        if(typeof nodeStanzasCallbacks[stanza.attrs.id] === 'function') {
                            nodeStanzasCallbacks[stanza.attrs.id](stanza);
                        }
                    } else {
                        if(typeof nodeStanzasCallbacks[stanza.attrs.id] === 'function') {
                            nodeStanzasCallbacks[stanza.attrs.id](null);
                        }
                    }
                }
            }
        }

        if (!type) {
            if (typeof self.onContactListListener === 'function' && roster[userId] && roster[userId].subscription !== 'none')
                Utils.safeCallbackCall(self.onContactListListener, userId);
        } else {
            // subscriptions callbacks
            switch (type) {
                case 'subscribe':
                    if (roster[userId] && roster[userId].subscription === 'to') {
                        roster[userId] = {
                            subscription: 'both',
                            ask: null
                        };
                        self.roster._sendSubscriptionPresence({
                            jid: from,
                            type: 'subscribed'
                        });
                    } else {
                        if (typeof self.onSubscribeListener === 'function')
                        Utils.safeCallbackCall(self.onSubscribeListener, userId);
                    }
                    break;
                case 'subscribed':
                    if (roster[userId] && roster[userId].subscription === 'from') {
                        roster[userId] = {
                            subscription: 'both',
                            ask: null
                        };
                    } else {
                        roster[userId] = {
                            subscription: 'to',
                            ask: null
                        };
                        if (typeof self.onConfirmSubscribeListener === 'function'){
                            Utils.safeCallbackCall(self.onConfirmSubscribeListener, userId);
                        }
                    }
                    break;
                case 'unsubscribed':
                    roster[userId] = {
                        subscription: 'none',
                        ask: null
                    };
                    if (typeof self.onRejectSubscribeListener === 'function') {
                        Utils.safeCallbackCall(self.onRejectSubscribeListener, userId);
                    }

                    break;
                case 'unsubscribe':
                    roster[userId] = {
                        subscription: 'to',
                        ask: null
                    };
                    // if (typeof self.onRejectSubscribeListener === 'function')
                    //   self.onRejectSubscribeListener(userId);
                    break;
                case 'unavailable':
                    if (typeof self.onContactListListener === 'function' && roster[userId] && roster[userId].subscription !== 'none') {
                        Utils.safeCallbackCall(self.onContactListListener, userId, type);
                    }
                    break;
            }
        }

        // we must return true to keep the handler alive
        // returning false would remove it after it finishes
        return true;
    };

    this._onIQ = function(stanza) {
        // var type = stanza.getAttribute('type'),
        //     typeId = stanza.getAttribute('id').split(':')[1];

        // if (typeof self.onListEditListener === 'function' && typeId === 'push') {
        //   var listName = (stanza.getElementsByTagName('list')[0]).getAttribute('name');

        //   var iq = $iq({
        //     from: connection.jid,
        //     type: 'result',
        //     id: connection.getUniqueId('push')
        //   });

        //   connection.sendIQ(iq);

        //   Utils.safeCallbackCall(self.onListEditListener(listName));
        // }

        // we must return true to keep the handler alive
        // returning false would remove it after it finishes
        if(Utils.getEnv().browser) {
            return true;
        }

        if(Utils.getEnv().node){
            var stanzaId = stanza.attrs.id;

            if(nodeStanzasCallbacks[stanzaId]){
                nodeStanzasCallbacks[stanzaId](stanza);
                delete nodeStanzasCallbacks[stanzaId];
            }
        }
    };

    this._onSystemMessageListener = function(stanza) {
        var from, to, extraParams, moduleIdentifier, delay, messageId, message;

        if(Utils.getEnv().browser) {
            from = stanza.getAttribute('from');
            to = stanza.getAttribute('to');
            extraParams = stanza.querySelector('extraParams');
            moduleIdentifier = extraParams.querySelector('moduleIdentifier').textContent;
            delay = stanza.querySelector('delay');
            messageId = stanza.getAttribute('id');
        } else if(Utils.getEnv().node) {
            from = stanza.attrs.from;
            to = stanza.attrs.to;
            extraParams = stanza.getChild('extraParams');
            moduleIdentifier = extraParams.getChild('moduleIdentifier').getText();
            delay = stanza.getChild('delay');
            messageId = stanza.attrs.id;
        }

        if (moduleIdentifier === 'SystemNotifications' && typeof self.onSystemMessageListener === 'function') {
            var extraParamsParsed = self._parseExtraParams(extraParams);

            message = {
                id: messageId,
                userId: self.helpers.getIdFromNode(from),
                extension: extraParamsParsed.extension
            };

            Utils.safeCallbackCall(self.onSystemMessageListener, message);
        }

        return true;
    };

    this._onMessageErrorListener = function(stanza) {
        // <error code="503" type="cancel">
        //   <service-unavailable xmlns="urn:ietf:params:xml:ns:xmpp-stanzas"/>
        //   <text xmlns="urn:ietf:params:xml:ns:xmpp-stanzas" xml:lang="en">Service not available.</text>
        // </error>

        var messageId = stanza.getAttribute('id');
        var error = getErrorFromXMLNode(stanza);

        // fire 'onMessageErrorListener'
        //
        if (typeof self.onMessageErrorListener === 'function') {
            Utils.safeCallbackCall(self.onMessageErrorListener, messageId, error);
        }

        // we must return true to keep the handler alive
        // returning false would remove it after it finishes
        return true;
     };
}

/* Chat module: Core
----------------------------------------------------------------------------- */
ChatProxy.prototype = {
    connect: function(params, callback) {
        Utils.QBLog('[ChatProxy]', 'connect', params);

        var self = this,
            err, rooms;

        var userJid;

        if ('userId' in params) {
            userJid = params.userId + '-' + config.creds.appId + '@' + config.endpoints.chat;
          
            if ('resource' in params) {
                userJid = userJid + "/" + params.resource;
            }
        } else if ('jid' in params) {
            userJid = params.jid;
        }

        /** Connect for browser env. */
        if(Utils.getEnv().browser) {
            connection.connect(userJid, params.password, function(status) {
                switch (status) {
                    case Strophe.Status.ERROR:
                        err = Utils.getError(422, 'Status.ERROR - An error has occurred');
                        if (typeof callback === 'function') callback(err, null);
                        break;
                    case Strophe.Status.CONNECTING:
                        Utils.QBLog('[ChatProxy]', 'Status.CONNECTING');
                        Utils.QBLog('[ChatProxy]', 'Chat Protocol - ' + (config.chatProtocol.active === 1 ? 'BOSH' : 'WebSocket'));
                        break;
                    case Strophe.Status.CONNFAIL:
                        err = Utils.getError(422, 'Status.CONNFAIL - The connection attempt failed');
                        if (typeof callback === 'function') callback(err, null);
                        break;
                    case Strophe.Status.AUTHENTICATING:
                        Utils.QBLog('[ChatProxy]', 'Status.AUTHENTICATING');
                        break;
                    case Strophe.Status.AUTHFAIL:
                        err = Utils.getError(401, 'Status.AUTHFAIL - The authentication attempt failed');
                        
                        if (typeof callback === 'function') {
                            callback(err, null);
                        }

                        if(self._isDisconnected && typeof self.onReconnectFailedListener === 'function'){
                            Utils.safeCallbackCall(self.onReconnectFailedListener, err);
                        }
                        
                        break;
                    case Strophe.Status.CONNECTED:
                        Utils.QBLog('[ChatProxy]', 'Status.CONNECTED at ' + getLocalTime());

                        self._isDisconnected = false;

                        connection.addHandler(self._onMessage, null, 'message', 'chat');
                        connection.addHandler(self._onMessage, null, 'message', 'groupchat');
                        connection.addHandler(self._onPresence, null, 'presence');
                        connection.addHandler(self._onIQ, null, 'iq');
                        connection.addHandler(self._onSystemMessageListener, null, 'message', 'headline');
                        connection.addHandler(self._onMessageErrorListener, null, 'message', 'error');

                        // set signaling callbacks
                        if(webrtc){
                            connection.addHandler(webrtc._onMessage, null, 'message', 'headline');
                        }

                        // enable carbons
                        self._enableCarbons(function() {
                            // get the roster
                            self.roster.get(function(contacts) {
                                roster = contacts;

                                // chat server will close your connection if you are not active in chat during one minute
                                // initial presence and an automatic reminder of it each 55 seconds
                                connection.send($pres().tree());
                                connection.addTimedHandler(55 * 1000, self._autoSendPresence);


                                if (typeof callback === 'function') {
                                    callback(null, roster);
                                } else {
                                    self._isLogout = false;

                                    // recover the joined rooms
                                    rooms = Object.keys(joinedRooms);
                                    for (var i = 0, len = rooms.length; i < len; i++) {
                                        self.muc.join(rooms[i]);
                                    }

                                    // fire 'onReconnectListener'
                                    if (typeof self.onReconnectListener === 'function'){
                                        Utils.safeCallbackCall(self.onReconnectListener);
                                    }
                                }
                            });
                        });

                        break;
                    case Strophe.Status.DISCONNECTING:
                        Utils.QBLog('[ChatProxy]', 'Status.DISCONNECTING');
                        break;
                    case Strophe.Status.DISCONNECTED:
                        Utils.QBLog('[ChatProxy]', 'Status.DISCONNECTED at ' + getLocalTime());

                        connection.reset();

                        // fire 'onDisconnectedListener' only once
                        if (!self._isDisconnected && typeof self.onDisconnectedListener === 'function'){
                            Utils.safeCallbackCall(self.onDisconnectedListener);
                        }

                        self._isDisconnected = true;

                        // reconnect to chat
                        if (!self._isLogout) self.connect(params);
                        break;
                    case Strophe.Status.ATTACHED:
                        Utils.QBLog('[ChatProxy]', 'Status.ATTACHED');
                        break;
                }
            });
        }

        /** connect for node */
        if(Utils.getEnv().node) {
            nClient = new NodeClient({
                'jid': userJid,
                'password': params.password,
                'reconnect': true
            });

            /** HANDLERS */
            nClient.on('auth', function () {
                Utils.QBLog('[ChatProxy]', 'Status.CONNECTED at ' + getLocalTime());
            });

            nClient.on('online', function () {
                Utils.QBLog('[ChatProxy]', 'Status.CONNECTED at ' + getLocalTime());

                self._isDisconnected = false;
                self._isLogout = false;

                /** Send first presence if user is online */
                nClient.send('<presence/>');


                self._autoSendPresence();

                setInterval(function(){
                    self._autoSendPresence();
                }, 55 * 1000);

                if (typeof callback === 'function') {
                    callback(null, true);
                }
            });

            nClient.on('connect', function () {
                Utils.QBLog('[QBChat] client is connected');
                self._enableCarbons();
            });

            nClient.on('reconnect', function () {
                Utils.QBLog('[QBChat] client is reconnected');
                
                self._isDisconnected = true;
                self._isLogout = true;
            });

            nClient.on('disconnect', function () {
                Utils.QBLog('[QBChat] client is disconnected');


                self._isDisconnected = true;
                self._isLogout = true;

                callback(null, null);
            });

            nClient.on('stanza', function (stanza) {
                Utils.QBLog('[QBChat] RECV', stanza.toString());
               
                /**
                 * Detect typeof incoming stanza 
                 * and fire the Listener
                 */
                if (stanza.is('presence')) {
                    self._onPresence(stanza);
                } else if (stanza.is('iq')) {
                    self._onIQ(stanza);
                } else if(stanza.is('message')){
                    if(stanza.attrs.type === 'headline') {
                        self._onSystemMessageListener(stanza);
                    } else {
                        self._onMessage(stanza);
                    }
                }
            });

            nClient.on('offline', function () {
                Utils.QBLog('[QBChat] client goes offline');

                self._isDisconnected = true;
                self._isLogout = true;
            });

            nClient.on('error', function (e) {
                Utils.QBLog('[QBChat] client got error', e);

                self._isDisconnected = true;
                self._isLogout = true;

                err = Utils.getError(422, 'Status.ERROR - An error has occurred');

                if(typeof callback === 'function') {
                    console.log('error callback');
                    callback(err, null);
                }
            });
        }
    },
    send: function(jid_or_user_id, message) {
        var self = this,
            msg = {};

        if(Utils.getEnv().browser) {
            msg = $msg({
                from: connection.jid,
                to: this.helpers.jidOrUserId(jid_or_user_id),
                type: message.type ? message.type : 'chat',
                id: message.id ? message.id : Utils.getBsonObjectId()
            });

            if (message.body) {
              msg.c('body', {
                xmlns: Strophe.NS.CLIENT
              }).t(message.body).up();
            }

            // custom parameters
            if (message.extension) {
              msg.c('extraParams', {
                xmlns: Strophe.NS.CLIENT
              });

              Object.keys(message.extension).forEach(function(field) {
                if (field === 'attachments') {

                  // attachments
                  message.extension[field].forEach(function(attach) {
                    msg.c('attachment', attach).up();
                  });

                } else if (typeof message.extension[field] === 'object') {

                  self._JStoXML(field, message.extension[field], msg);

                } else {
                  msg.c(field).t(message.extension[field]).up();
                }
              });

              msg.up();
            }

            // chat markers
            //
            if (message.markable) {
              msg.c('markable', {
                xmlns: Strophe.NS.CHAT_MARKERS
              });
            }

            connection.send(msg);
        }

        if(Utils.getEnv().node) {
            var stanza = new NodeClient.Stanza('message', {
                from: nClient.options.jid.user,
                to: this.helpers.jidOrUserId(jid_or_user_id),
                type: message.type ? message.type : 'chat',
                id: message.id ? message.id : Utils.getBsonObjectId()
            });

            if (message.body) {
                stanza.c('body').t(message.body).up();
            }

            if (message.markable) {
                stanza.c('markable', {
                    xmlns: 'urn:xmpp:chat-markers:0'
                }).up();
            }

            if (message.extension) {
                stanza.c('extraParams', {xmlns: 'jabber:client'});

                Object.keys(message.extension).forEach(function(field) {
                    if (field === 'attachments') {
                          // attachments
                        message.extension[field].forEach(function(attach) {
                            msg.c('attachment', attach).up();
                        });
                    } else if (typeof message.extension[field] === 'object') {
                        self._JStoXML(field, message.extension[field], msg);
                    } else {
                        stanza.getChild('extraParams')
                            .c(field).t(message.extension[field]).up();
                    }
                });

                stanza.up();
            }
            Utils.QBLog('[QBChat] SEND', stanza.toString());
            nClient.send(stanza);
        }
    },
    sendSystemMessage: function(jid_or_user_id, message) {
        var self = this;

        if(!message.id){
            message.id = Utils.getBsonObjectId();
        }

        if(Utils.getEnv().browser) {
            var msg = $msg({
                    id: message.id,
                    type: 'headline',
                    to: this.helpers.jidOrUserId(jid_or_user_id)
                });

            // custom parameters
            if (message.extension) {
              msg.c('extraParams', {
                xmlns: Strophe.NS.CLIENT
              }).c('moduleIdentifier').t('SystemNotifications').up();

              Object.keys(message.extension).forEach(function(field) {
                if (typeof message.extension[field] === 'object') {
                  self._JStoXML(field, message.extension[field], msg);
                }else{
                  msg.c(field).t(message.extension[field]).up();
                }
              });

              msg.up();
            }

            connection.send(msg);
        }

        if(Utils.getEnv().node) {
            var msg = new NodeClient.Stanza('message', {
                id: message.id,
                type: 'headline',
                to: this.helpers.jidOrUserId(jid_or_user_id)
            });

            if (message.extension) {
                msg.c('extraParams',  {
                    xmlns: 'jabber:client'
                }).c('moduleIdentifier').t('SystemNotifications');

                Object.keys(message.extension).forEach(function(field) {
                    if (typeof message.extension[field] === 'object') {
                        self._JStoXML(field, message.extension[field], msg);
                    }else{
                        msg.getChild('extraParams')
                            .c(field).t(message.extension[field]).up();
                    }
                });

                msg.up();
            }

            nClient.send(msg);
        }
    },

    sendIsTypingStatus: function(jid_or_user_id) {
        var stanzaParams = {
            from: connection ? connection.jid : nClient.jid.user,
            to: this.helpers.jidOrUserId(jid_or_user_id),
            type: this.helpers.typeChat(jid_or_user_id)
        },
        msg;

        if(Utils.getEnv().browser){
            msg = $msg(stanzaParams);

            msg.c('composing', {
                xmlns: Strophe.NS.CHAT_STATES
            });

            connection.send(msg);
        } else if(Utils.getEnv().node) {
            msg = new NodeClient.Stanza('message', stanzaParams);

            msg.c('composing', {
                xmlns: 'http://www.jabber.org/protocol/chatstates'
            });

            nClient.send(msg);
        }
    },

    sendIsStopTypingStatus: function(jid_or_user_id) {
        var stanzaParams = {
            from: connection ? connection.jid : nClient.jid.user,
            to: this.helpers.jidOrUserId(jid_or_user_id),
            type: this.helpers.typeChat(jid_or_user_id)
        },
        msg;

        if(Utils.getEnv().browser){
            msg = $msg(stanzaParams);

            msg.c('paused', {
              xmlns: Strophe.NS.CHAT_STATES
            });

            connection.send(msg);
         } else if(Utils.getEnv().node) {
            msg = new NodeClient.Stanza('message', stanzaParams);

            msg.c('paused', {
                xmlns: 'http://www.jabber.org/protocol/chatstates'
            });

            nClient.send(msg);
        }
    },
    sendDeliveredStatus: function(params) {
        if(Utils.getEnv().browser) {
            var msg = $msg({
              from: connection.jid,
              to: this.helpers.jidOrUserId(params.userId),
              type: 'chat',
              id: Utils.getBsonObjectId()
            });

            msg.c('received', {
              xmlns: Strophe.NS.CHAT_MARKERS,
              id: params.messageId
            }).up();

            msg.c('extraParams', {
              xmlns: Strophe.NS.CLIENT
            }).c('dialog_id').t(params.dialogId);

            connection.send(msg);
        } else if(Utils.getEnv().node) {
            var stanza = new NodeClient.Stanza('message', {
                from: nClient.options.jid.user,
                to: this.helpers.jidOrUserId(params.userId),
                type: 'chat',
                id: Utils.getBsonObjectId()
            });

            stanza.c('received', {
                xmlns: 'urn:xmpp:chat-markers:0',
                id: params.messageId
            }).up();

            stanza.c('extraParams', {
                xmlns: 'jabber:client'
            }).c('dialog_id').t(params.dialogId || null);

            nClient.send(stanza);
        }
    },
    sendReadStatus: function(params) {
        var stanzaParams = {
                from: connection ? connection.jid : nClient.jid.user,
                to: this.helpers.jidOrUserId(params.userId),
                type: 'chat',
                id: Utils.getBsonObjectId()
            },
            msg;

        if(Utils.getEnv().browser) {
            msg = $msg(stanzaParams);

            msg.c('displayed', {
                xmlns: Strophe.NS.CHAT_MARKERS,
                id: params.messageId
            }).up();

            msg.c('extraParams', {
                xmlns: Strophe.NS.CLIENT
            }).c('dialog_id').t(params.dialogId);

            connection.send(msg);
        } else if(Utils.getEnv().node){
            msg = new NodeClient.Stanza('message', stanzaParams);

            msg.c('displayed', {
                xmlns: 'urn:xmpp:chat-markers:0',
                id: params.messageId
            }).up();

            msg.c('extraParams', {
                xmlns: 'jabber:client'
            }).c('dialog_id').t(params.dialogId);

            nClient.send(msg);
        }
    },
    disconnect: function() {
        joinedRooms = {};
        this._isLogout = true;

        if(Utils.getEnv().browser) {
            connection.flush();
            connection.disconnect();
        }

        if(Utils.getEnv().node) {
            nClient.end();
        }
    },
    addListener: function(params, callback) {
        if(Utils.getEnv().node) throw unsupported;

        return connection.addHandler(handler, null, params.name || null, params.type || null, params.id || null, params.from || null);

        function handler() {
            callback();
            // if 'false' - a handler will be performed only once
            return params.live !== false;
        }
    },
    deleteListener: function(ref) {
        if(Utils.getEnv().node) throw unsupported;

        connection.deleteHandler(ref);
    },
    // TODO: the magic
    _JStoXML: function(title, obj, msg) {
        var self = this;
        
        msg.c(title);
        
        Object.keys(obj).forEach(function(field) {
            if (typeof obj[field] === 'object') {
                self._JStoXML(field, obj[field], msg);
            } else {
                msg.c(field).t(obj[field]).up();
            }
        });
        msg.up();
    },
    _XMLtoJS: function(extension, title, obj) {
        var self = this;
        extension[title] = {};
        for (var i = 0, len = obj.childNodes.length; i < len; i++) {
            if (obj.childNodes[i].childNodes.length > 1) {
                extension[title] = self._XMLtoJS(extension[title], obj.childNodes[i].tagName, obj.childNodes[i]);
            } else {
                extension[title][obj.childNodes[i].tagName] = obj.childNodes[i].textContent;
            }
        }
        return extension;
    },
    _parseExtraParams: function(extraParams) {
        if(!extraParams){
            return null;
        }

        var extension = {};
        var dialogId;

        var attachments = [];

        if (Utils.getEnv().browser) {
            for (var i = 0, len = extraParams.childNodes.length; i < len; i++) {
                // parse attachments
                if (extraParams.childNodes[i].tagName === 'attachment') {
                    var attach = {};
                    var attributes = extraParams.childNodes[i].attributes;

                    for (var j = 0, len2 = attributes.length; j < len2; j++) {
                        if (attributes[j].name === 'id' || attributes[j].name === 'size'){
                            attach[attributes[j].name] = parseInt(attributes[j].value);
                        } else {
                            attach[attributes[j].name] = attributes[j].value;
                        }
                    }

                    attachments.push(attach);

                    // parse 'dialog_id'
                } else if (extraParams.childNodes[i].tagName === 'dialog_id') {
                    dialogId = extraParams.childNodes[i].textContent;
                    extension['dialog_id'] = dialogId;

                    // parse other user's custom parameters
                } else {
                    if (extraParams.childNodes[i].childNodes.length > 1) {
                        // Firefox issue with 4K XML node limit:
                        // http://www.coderholic.com/firefox-4k-xml-node-limit/
                        var nodeTextContentSize = extraParams.childNodes[i].textContent.length;
                        if (nodeTextContentSize > 4096) {
                            var wholeNodeContent = "";
                            for(var j=0; j<extraParams.childNodes[i].childNodes.length; ++j){
                                wholeNodeContent += extraParams.childNodes[i].childNodes[j].textContent;
                            }
                            extension[extraParams.childNodes[i].tagName] = wholeNodeContent;
                        } else {
                            extension = self._XMLtoJS(extension, extraParams.childNodes[i].tagName, extraParams.childNodes[i]);
                        }
                    } else {
                        extension[extraParams.childNodes[i].tagName] = extraParams.childNodes[i].textContent;
                    }
                }
            }

            if (attachments.length > 0) {
                extension.attachments = attachments;
            }
            
            if (extension.moduleIdentifier) {
                delete extension.moduleIdentifier;
            }

            return {
                extension: extension,
                dialogId: dialogId
            };
        }

        if(Utils.getEnv().node) {
            for (var i = 0, len = extraParams.children.length; i < len; i++) {
                if(extraParams.children[i].name === 'dialog_id') {
                    dialogId = extraParams.getChildText('dialog_id');
                    extension['dialog_id'] = dialogId;
                }
                 
                if(extraParams.children[i].children.length === 1) {
                    var child = extraParams.children[i];

                    extension[child.name] = child.children[0];
                }
            }

            if(extension.moduleIdentifier) {
                delete extension.moduleIdentifier;
            }

            return {
                extension: extension,
                dialogId: dialogId
            };
        }
    },
    _autoSendPresence: function() {
        if(Utils.getEnv().browser) {
            connection.send($pres().tree());
        } else if (Utils.getEnv().node) {
            var presence = new NodeClient.Stanza('presence', {
                    xmlns: 'jabber:client'
                });

            Utils.QBLog('[QBChat] Send', presence.toString());
            nClient.send(presence);
        }

        // we must return true to keep the handler alive
        // returning false would remove it after it finishes
        return true;
    },

    // Carbons XEP [http://xmpp.org/extensions/xep-0280.html]
    _enableCarbons: function(cb) {
        var self = this,
            iq;

        if(Utils.getEnv().browser) {
            iq = $iq({
                from: connection.jid,
                type: 'set',
                id: connection.getUniqueId('enableCarbons')
            }).c('enable', {
                xmlns: Strophe.NS.CARBONS
            });

            connection.sendIQ(iq, function(stanza) {
                /**
                * In future we need to remove cb
                */
                cb();
            });
        } else if(Utils.getEnv().node) {
            iq = new NodeClient.Stanza('iq', {
                type: 'set',
                from: nClient.jid.user,
                id: self.helpers.getUniqueIdCross('enableCarbons')
            });

            iq.c('enable', {
                xmlns: 'urn:xmpp:carbons:2'
            });

            nClient.send(iq);
        }
    }
};


/* Chat module: Roster
 *
 * Integration of Roster Items and Presence Subscriptions
 * http://xmpp.org/rfcs/rfc3921.html#int
 * default - Mutual Subscription
 *
----------------------------------------------------------------------------- */
function RosterProxy(service) {
    this.service = service;
    this.helpers = new Helpers();
}

RosterProxy.prototype = {

    get: function(callback) {
        var iq, self = this,
            items, userId, contacts = {};

        var stanzaParams = {
            'type': 'get',
            'from': connection ? connection.jid : nClient.jid.user,
            'id': self.helpers.getUniqueIdCross('getRoster')
        };

        if(Utils.getEnv().browser) {
            iq = $iq(stanzaParams).c('query', {
                xmlns: Strophe.NS.ROSTER
            });

            connection.sendIQ(iq, function(stanza) {
                items = stanza.getElementsByTagName('item');

                for (var i = 0, len = items.length; i < len; i++) {
                    userId = self.helpers.getIdFromNode(items[i].getAttribute('jid')).toString();

                    contacts[userId] = {
                        subscription: items[i].getAttribute('subscription'),
                        ask: items[i].getAttribute('ask') || null
                    };
                }

                callback(contacts);
            });
        } else if(Utils.getEnv().node){
            iq = new NodeClient.Stanza('iq', stanzaParams).c('query', {
                'xmlns': 'jabber:iq:roster'
            }).up();

            nodeStanzasCallbacks[stanzaParams.id] = function(stanza){
                var JSONStanza = stanza.toJSON(),
                    items = JSONStanza.children[0].children,
                    contacts = {};

                for (var i = 0, len = items.length; i < len; i++) {
                    userId = self.helpers.getIdFromNode(items[i].attrs.jid).toString();
                    contacts[userId] = {
                        subscription: items[i].attrs.subscription,
                        ask: items[i].attrs.ask || null
                    };
                }

                callback(contacts);
            };

            nClient.send(iq);
    }
  },

    add: function(jidOrUserId, callback) {
        var self = this;
        var userJid = this.helpers.jidOrUserId(jidOrUserId);
        var userId = this.helpers.getIdFromNode(userJid).toString();

        roster[userId] = {
            subscription: 'none',
            ask: 'subscribe'
        };

        self._sendSubscriptionPresence({
            jid: userJid,
            type: 'subscribe'
        });

        if (typeof callback === 'function') callback();
    },

    confirm: function(jidOrUserId, callback) {
        var self = this;
        var userJid = this.helpers.jidOrUserId(jidOrUserId);
        var userId = this.helpers.getIdFromNode(userJid).toString();

        roster[userId] = {
            subscription: 'from',
            ask: 'subscribe'
        };

        self._sendSubscriptionPresence({
            jid: userJid,
            type: 'subscribed'
        });

        self._sendSubscriptionPresence({
            jid: userJid,
            type: 'subscribe'
        });


        if (typeof callback === 'function') callback();
    },

    reject: function(jidOrUserId, callback) {
        var self = this;
        var userJid = this.helpers.jidOrUserId(jidOrUserId);
        var userId = this.helpers.getIdFromNode(userJid).toString();

        roster[userId] = {
            subscription: 'none',
            ask: null
        };

        self._sendSubscriptionPresence({
            jid: userJid,
            type: 'unsubscribed'
        });

        if (typeof callback === 'function') callback();
    },

    remove: function(jidOrUserId, callback) {
        var self = this,
            userJid = this.helpers.jidOrUserId(jidOrUserId);

        var userId = this.helpers.getIdFromNode(userJid);
        var iq;

        var stanzaParams = {
            'type': 'set',
            'from': connection ? connection.jid : nClient.jid.user,
            'id': self.helpers.getUniqueIdCross('getRoster')
        };

        if(Utils.getEnv().browser) {
            iq = $iq(stanzaParams).c('query', {
                xmlns: Strophe.NS.ROSTER
            }).c('item', {
                jid: userJid,
                subscription: 'remove'
            });

            connection.sendIQ(iq, function() {
                delete roster[userId];
                if (typeof callback === 'function') callback();
            });

        } else if(Utils.getEnv().node) {
            iq = new NodeClient.Stanza('iq', stanzaParams);

            iq.c('query', {
                xmlns: 'jabber:iq:roster'
            }).c('item', {
                jid: userJid,
                subscription: 'remove'
            });

            nodeStanzasCallbacks[stanzaParams.id] = function(stanza){
                delete roster[userId];
                if (typeof callback === 'function') {
                    callback();
                }
            };

            nClient.send(iq);

        }
    },

    _sendSubscriptionPresence: function(params) {
        var pres;

        Utils.QBLog('[_sendSubscriptionPresence]', params);

        if(Utils.getEnv().browser){
            pres = $pres({
                to: params.jid,
                type: params.type
            });

            connection.send(pres);
        } else if (Utils.getEnv().node) {
            pres = new NodeClient.Stanza('presence', {
                to: params.jid,
                type: params.type
            });

            nClient.send(pres);
        }

    }
};


/* Chat module: Group Chat (Dialog)
 *
 * Multi-User Chat
 * http://xmpp.org/extensions/xep-0045.html
 *
----------------------------------------------------------------------------- */
function MucProxy(service) {
    this.service = service;
    this.helpers = new Helpers();
}

MucProxy.prototype = {
    join: function(jid, callback) {
        var self = this,
            id = self.helpers.getUniqueIdCross('join'),
            pres;

        joinedRooms[jid] = true;

        if (Utils.getEnv().browser) {
            pres = $pres({
                from: connection.jid,
                to: self.helpers.getRoomJid(jid),
                id: id
            }).c("x", {
                xmlns: Strophe.NS.MUC
            }).c("history", {
                maxstanzas: 0
            });

            if (typeof callback === 'function') {
                connection.addHandler(callback, null, 'presence', null, id);
            }

            connection.send(pres);
        } else if(Utils.getEnv().node){
            pres = new NodeClient.Stanza('presence', {
                from: nClient.jid.user + '@' + nClient.jid._domain + '/' + nClient.jid._resource,
                to: jid + '/' + nClient.jid.user,
                id: id
            }); 

            pres.c('x', {
                xmlns: 'http://jabber.org/protocol/muc'
            }).c('history', {maxstanzas: 0});

            if (typeof callback === 'function') {
                nodeStanzasCallbacks[id] = callback;
            }

            nClient.send(pres);
        }
    },
    leave: function(jid, callback) {
        var self = this,
            pres,
            type = 'unavailable';

        delete joinedRooms[jid];

        if (Utils.getEnv().browser) {
            var roomJid = self.helpers.getRoomJid(jid);
            
            pres = $pres({
                from: connection.jid,
                to: self.helpers.getRoomJid(jid),
                type: type
            });

            if (typeof callback === 'function') {
                connection.addHandler(callback, null, 'presence', type, null, roomJid);
            }

            connection.send(pres);
        } else if(Utils.getEnv().node) {
            pres = new NodeClient.Stanza('presence', {
                from: nClient.jid.user + '@' + nClient.jid._domain + '/' + nClient.jid._resource,
                to: jid + '/' + nClient.jid.user,
                type: type
            });

            /** The answer don't contain id */
            if(typeof callback === 'function') {
                nodeStanzasCallbacks['muc:leave'] = callback;
            }

            nClient.send(pres);
        }
    },
    listOnlineUsers: function(dialogJID, callback) {
        var self = this,
            iq, 
            id = self.helpers.getUniqueIdCross('muc_disco_items'),
            onlineUsers = [];

        var TYPE = 'get';

        function _getUsers(stanza) {
            var stanzaId = stanza.attrs.id;

            if(nodeStanzasCallbacks[stanzaId]) {
                var users = [],
                    items = stanza.getChild('query').getChildElements('item');

                for(var i = 0, len = items.length; i < len; i++) {
                    users.push(items[i].attrs.name);
                }

                callback(users);
            }
        };

        if (Utils.getEnv().browser) {
            iq = $iq({
                id: id,
                from: connection.jid,
                to: dialogJID,
                type: TYPE
            }).c('query', {
              xmlns: 'http://jabber.org/protocol/disco#items'
            });

            connection.sendIQ(iq, function(stanza) {
                var items = stanza.getElementsByTagName('item'),
                    userId;
                
                for (var i = 0, len = items.length; i < len; i++) {
                    userId = self.helpers.getUserIdFromRoomJid(items[i].getAttribute('jid'));
                    onlineUsers.push(userId);
                }

                callback(onlineUsers);
            });
        } else if(Utils.getEnv().node) {
            iq = new NodeClient.Stanza('iq', {
                id: id,
                from: nClient.jid.user + '@' + nClient.jid._domain + '/' + nClient.jid._resource,
                to: dialogJID,
                type: TYPE
            });

            iq.c('query', {
              xmlns: 'http://jabber.org/protocol/disco#items'
            });

            nClient.send(iq);
            
            nodeStanzasCallbacks[id] = _getUsers;
        }
    }
};


/* Chat module: Privacy list
 *
 * Privacy list
 * http://xmpp.org/extensions/xep-0016.html
 *
----------------------------------------------------------------------------- */
function PrivacyListProxy(service) {
  this.service = service;
  this.helpers = new Helpers();
}

PrivacyListProxy.prototype = {

    getNames: function(callback) {
        var iq,
            stanzaParams = {
                'from': connection ? connection.jid : nClient.jid.user,
                'type': 'get',
                'id': this.helpers.getUniqueIdCross('getNames')
            };

        if(Utils.getEnv().browser){

            var iq = $iq(stanzaParams).c('query', {
                xmlns: Strophe.NS.PRIVACY_LIST
            });

            connection.sendIQ(iq, function(stanzaResult) {
                var allNames = [], namesList = {},
                    defaultList = stanzaResult.getElementsByTagName('default'),
                    activeList = stanzaResult.getElementsByTagName('active'),
                    allLists = stanzaResult.getElementsByTagName('list'),
                    defaultName = defaultList[0].getAttribute('name'),
                    activeName = activeList[0].getAttribute('name');

                for (var i = 0, len = allLists.length; i < len; i++) {
                    allNames.push(allLists[i].getAttribute('name'));
                }

                namesList = {
                    'default': defaultName,
                    'active': activeName,
                    'names': allNames
                };

                callback(null, namesList);
            }, function(stanzaError){
                if(stanzaError){
                    var errorObject = getErrorFromXMLNode(stanzaError);
                    callback(errorObject, null);
                }else{
                    callback(Utils.getError(408), null);
                }
            });
        } else if(Utils.getEnv().node) {
            iq = new NodeClient.Stanza('iq', stanzaParams);

            iq.c('query', {
                xmlns: 'jabber:iq:privacy'
            });

            nodeStanzasCallbacks[iq.attrs.id] = function(stanza){
                if(stanza.attrs.type !== 'error'){

                    var allNames = [], namesList = {},
                        query = stanza.getChild('query'),
                        defaultList = query.getChild('default'),
                        activeList = query.getChild('active'),
                        allLists = query.getChildElements('list');

                    var defaultName = defaultList ? defaultList.attrs.name : '',
                        activeName = activeList ? activeList.attrs.name : '';

                    for (var i = 0, len = allLists.length; i < len; i++) {
                        if(allLists[i].name !== 'default' && allLists[i].name !== 'active'){
                            allNames.push(allLists[i].attrs.name);
                        }
                    }

                    namesList = {
                        'default': defaultName,
                        'active': activeName,
                        'names': allNames
                    };

                    callback(null, namesList);
                } else {
                    callback(Utils.getError(408));
                }
            };

            nClient.send(iq);
        }
    },

    getList: function(name, callback) {
        var iq, self = this,
            items, userJid, userId,
            usersList = [], list = {};

        if(Utils.getEnv().browser) {

            iq = $iq({
                from: connection.jid,
                type: 'get',
                id: connection.getUniqueId('getlist')
            }).c('query', {
                xmlns: Strophe.NS.PRIVACY_LIST
            }).c('list', {
                name: name
            });

            connection.sendIQ(iq, function(stanzaResult) {
                items = stanzaResult.getElementsByTagName('item');

                for (var i = 0, len = items.length; i < len; i=i+2) {
                    userJid = items[i].getAttribute('value');
                    userId = self.helpers.getIdFromNode(userJid);
                    usersList.push({
                        user_id: userId,
                        action: items[i].getAttribute('action')
                    });
                }
                list = {
                    name: name,
                    items: usersList
                };
                    console.log(list);
                    callback(null, list);
                }, function(stanzaError){
                    if(stanzaError){
                        var errorObject = getErrorFromXMLNode(stanzaError);
                        callback(errorObject, null);
                    }else{
                        callback(Utils.getError(408), null);
                    }
                });
        } else if(Utils.getEnv().node){
            iq = new NodeClient.Stanza('iq', {
                type: 'get',
                id: self.helpers.getUniqueIdCross('getlist')
            });

            iq.c('query', {
                xmlns: 'jabber:iq:privacy'
            }).c('list', {
                name: name
            });

            nodeStanzasCallbacks[iq.attrs.id] = function(stanza){
                var stanzaQuery = stanza.getChild('query'),
                    list = stanzaQuery ? stanzaQuery.getChild('list') : null,
                    items = list ? list.getChildElements('item') : null,
                    userJid, userId, usersList = [];


                for (var i = 0, len = items.length; i < len; i=i+2) {
                    userJid = items[i].attrs.value;
                    userId = self.helpers.getIdFromNode(userJid);
                    usersList.push({
                        user_id: userId,
                        action: items[i].attrs.action
                    });
                }
                list = {
                    name: list.attrs.name,
                    items: usersList
                };

                callback(null, list);
                delete nodeStanzasCallbacks[stanza.attrs.id]
            };

            nClient.send(iq);
        }
    },

    create: function(list, callback) {
        var iq, self = this,
            userId, userJid,
            userAction, userMuc,
            mutualBlock,
            listObj = {},
            listKeys = [];

        if(Utils.getEnv().browser){
            iq = $iq({
                from: connection.jid,
                type: 'set',
                id: connection.getUniqueId('edit')
            }).c('query', {
                xmlns: Strophe.NS.PRIVACY_LIST
            }).c('list', {
                name: list.name
            });

            $(list.items).each(function(e, i){
                listObj[i.user_id] = i.action;
            });

            iq = fillCreatePrivacyListIq(iq, list);

            connection.sendIQ(iq, function(stanzaResult) {
                callback(null);
            }, function(stanzaError){
                if(stanzaError){
                    var errorObject = getErrorFromXMLNode(stanzaError);
                    callback(errorObject);
                }else{
                    callback(Utils.getError(408));
                }
            });

        } else if(Utils.getEnv().node){
            iq = new NodeClient.Stanza('iq', {
                from: nClient.jid.user + '@' + nClient.jid._domain + '/' + nClient.jid._resource,
                type: 'set',
                id: self.helpers.getUniqueIdCross('edit'),
                xmlns: "jabber:client"
            });

            iq.c('query', {
                xmlns: 'jabber:iq:privacy'
            }).c('list', {
                name: list.name
            });

            iq = fillCreatePrivacyListIq(iq, list);

            nodeStanzasCallbacks[iq.attrs.id] = function(stanza) {
                if(!stanza.getChildElements('error').length){
                    callback(null);
                } else {
                    callback(Utils.getError(408));
                }
            };

            nClient.send(iq);
        }

        function fillCreatePrivacyListIq(iq, list){

            for(var i=0; i< list.items.length; i++){
                listObj[list.items[i].user_id] = {
                    action: list.items[i].action,
                    mutualBlock: list.items[i].mutualBlock === true ? true : false
                }
            }


            listKeys = Object.keys(listObj);

            for (var index = 0, i = 0, len = listKeys.length; index < len; index++, i=i+2) {

                userId = listKeys[index];
                userAction = listObj[userId].action;
                mutualBlock = listObj[userId].mutualBlock;
                userJid = self.helpers.jidOrUserId(parseInt(userId, 10));
                userMuc = self.helpers.getUserNickWithMucDomain(userId);

                if(mutualBlock && userAction === 'deny'){
                    if(Utils.getEnv().browser){
                        iq.c('item', {
                            type: 'jid',
                            value: userJid,
                            action: userAction,
                            order: i+1
                        }).up();

                        iq.c('item', {
                            type: 'jid',
                            value: userMuc,
                            action: userAction,
                            order: i+2
                        });
                    } else if(Utils.getEnv().node){
                        var lists = iq.getChild('query').getChild('list');

                        lists.c('item', {
                            type: 'jid',
                            value: userJid,
                            action: userAction,
                            order: i+1
                        }).up()
                            .c('item', {
                                type: 'jid',
                                value: userMuc,
                                action: userAction,
                                order: i+2
                            });
                    }
                } else {
                    if(Utils.getEnv().browser){
                        iq.c('item', {
                            type: 'jid',
                            value: userJid,
                            action: userAction,
                            order: i+1
                        }).c('message', {
                        }).up().c('presence-in', {
                        }).up().c('presence-out', {
                        }).up().c('iq', {
                        }).up().up();

                        iq.c('item', {
                            type: 'jid',
                            value: userMuc,
                            action: userAction,
                            order: i+2
                        }).c('message', {
                        }).up().c('presence-in', {
                        }).up().c('presence-out', {
                        }).up().c('iq', {
                        }).up().up();
                    } else if(Utils.getEnv().node){
                        var lists = iq.getChild('query').getChild('list');

                        lists.c('item', {
                            type: 'jid',
                            value: userJid,
                            action: userAction,
                            order: i+1
                        }).c('message', {
                        }).up().c('presence-in', {
                        }).up().c('presence-out', {
                        }).up().c('iq', {
                            })
                            .up()
                            .up()
                            .c('item', {
                                type: 'jid',
                                value: userMuc,
                                action: userAction,
                                order: i+2
                            }).c('message', {
                        }).up().c('presence-in', {
                        }).up().c('presence-out', {
                        }).up().c('iq', {
                        });
                    }
                }
            }

            return iq;
        }
    },

    update: function(list, callback) {
        var self = this;

        self.getList(list.name, function(error, response) {
            if (error) {
                callback(error, null);
            } else {
                var copyList = (JSON.parse(JSON.stringify(list))),
                    oldArray = response.items,
                    newArray = copyList.items,
                    createdList = {};

                copyList.items = Utils.MergeArrayOfObjects(oldArray, newArray);
                createdList = copyList;

                self.create(createdList, function(err, result) {
                    if (error) {
                        callback(err, null);
                    }else{
                        callback(null, result);
                    }
                });
            }
        });
    },

    delete: function(name, callback) {
        var iq = $iq({
            from: connection.jid,
            type: 'set',
            id: connection.getUniqueId('remove')
        }).c('query', {
            xmlns: Strophe.NS.PRIVACY_LIST
        }).c('list', {
            name: name ? name : ''
        });

        connection.sendIQ(iq, function(stanzaResult) {
            callback(null);
        }, function(stanzaError){
            if(stanzaError){
                var errorObject = getErrorFromXMLNode(stanzaError);
                callback(errorObject);
            }else{
                callback(Utils.getError(408));
            }
        });
    },

    setAsDefault: function(name, callback) {
        var iq,
            stanzaParams = {
                'from': connection ? connection.jid : nClient.jid.user,
                'type': 'set',
                'id': this.helpers.getUniqueIdCross('default')
            };

        if(Utils.getEnv().browser){
            iq = $iq(stanzaParams).c('query', {
                xmlns: Strophe.NS.PRIVACY_LIST
            }).c('default', {
                name: name ? name : ''
            });

            connection.sendIQ(iq, function(stanzaResult) {
                callback(null);
            }, function(stanzaError){
                if(stanzaError){
                    var errorObject = getErrorFromXMLNode(stanzaError);
                    callback(errorObject);
                }else{
                    callback(Utils.getError(408));
                }
            });
        } else if(Utils.getEnv().node){
            iq = new NodeClient.Stanza('iq', stanzaParams);

            iq.c('query', {
                xmlns: 'jabber:iq:privacy'
            }).c('default', {
                name: name ? name : ''
            });

            nodeStanzasCallbacks[stanzaParams.id] = function(stanza){
                if(!stanza.getChildElements('error').length){
                    callback(null);
                } else {
                    callback(Utils.getError(408));
                }
            };
            nClient.send(iq);
        }

    },

    setAsActive: function(name, callback) {
        var iq,
            stanzaParams = {
            'from': connection ? connection.jid : nClient.jid.user,
            'type': 'set',
            'id': this.helpers.getUniqueIdCross('active')
        };

        if(Utils.getEnv().browser){
            iq = $iq(stanzaParams).c('query', {
                xmlns: Strophe.NS.PRIVACY_LIST
            }).c('active', {
                name: name ? name : ''
            });

            connection.sendIQ(iq, function(stanzaResult) {
                callback(null);
            }, function(stanzaError){
                if(stanzaError){
                    var errorObject = getErrorFromXMLNode(stanzaError);
                    callback(errorObject);
                }else{
                    callback(Utils.getError(408));
                }
            });
        } else if(Utils.getEnv().node){
            iq = new NodeClient.Stanza('iq', stanzaParams);

            iq.c('query', {
                xmlns: 'jabber:iq:privacy'
            }).c('active', {
                name: name ? name : ''
            });

            nodeStanzasCallbacks[stanzaParams.id] = function(stanza){
                if(!stanza.getChildElements('error').length){
                    callback(null);
                } else {
                    callback(Utils.getError(408));
                }
            };

            nClient.send(iq);
        }




    }
};


/* Chat module: History
----------------------------------------------------------------------------- */

// Dialogs

function DialogProxy(service) {
  this.service = service;
  this.helpers = new Helpers();
}

DialogProxy.prototype = {

  list: function(params, callback) {
    if (typeof params === 'function' && typeof callback === 'undefined') {
      callback = params;
      params = {};
    }

    Utils.QBLog('[DialogProxy]', 'list', params);

    this.service.ajax({url: Utils.getUrl(dialogUrl), data: params}, callback);
  },

  create: function(params, callback) {
    if (params.occupants_ids instanceof Array) params.occupants_ids = params.occupants_ids.join(', ');

    Utils.QBLog('[DialogProxy]', 'create', params);

    this.service.ajax({url: Utils.getUrl(dialogUrl), type: 'POST', data: params}, callback);
  },

  update: function(id, params, callback) {
    Utils.QBLog('[DialogProxy]', 'update', params);

    this.service.ajax({url: Utils.getUrl(dialogUrl, id), type: 'PUT', data: params}, callback);
  },

    delete: function(id, params_or_callback, callback) {
        Utils.QBLog('[DialogProxy]', 'delete', id);

        if (arguments.length == 2) {
            this.service.ajax({
                url: Utils.getUrl(dialogUrl, id),
                type: 'DELETE',
                dataType: 'text',
            }, params_or_callback);
        } else if (arguments.length == 3) {
            this.service.ajax({
                url: Utils.getUrl(dialogUrl, id),
                type: 'DELETE',
                data: params_or_callback,
                dataType: 'text'
            }, callback);
        }
    }
};

// Messages

function MessageProxy(service) {
  this.service = service;
  this.helpers = new Helpers();
}

MessageProxy.prototype = {

  list: function(params, callback) {
    Utils.QBLog('[MessageProxy]', 'list', params);

    this.service.ajax({url: Utils.getUrl(messageUrl), data: params}, callback);
  },

  create: function(params, callback) {
    Utils.QBLog('[MessageProxy]', 'create', params);

    this.service.ajax({url: Utils.getUrl(messageUrl), type: 'POST', data: params}, callback);
  },

  update: function(id, params, callback) {
    var attrAjax = {
        'type': 'PUT',
        'dataType': 'text',
        'url': Utils.getUrl(messageUrl, id),
        'data': params
    };

    Utils.QBLog('[MessageProxy]', 'update', id, params);

    this.service.ajax(attrAjax, callback);
  },

  delete: function(id, params_or_callback, callback) {
    Utils.QBLog('[DialogProxy]', 'delete', id);

    if (arguments.length == 2) {
      this.service.ajax({url: Utils.getUrl(messageUrl, id), type: 'DELETE', dataType: 'text'}, params_or_callback);
    } else if (arguments.length == 3) {
      this.service.ajax({url: Utils.getUrl(messageUrl, id), type: 'DELETE', data: params_or_callback, dataType: 'text'}, callback);
    }
  },

  unreadCount: function(params, callback) {
    Utils.QBLog('[MessageProxy]', 'unreadCount', params);

    this.service.ajax({url: Utils.getUrl(messageUrl+'/unread'), data: params}, callback);
  }

};


/* Helpers
----------------------------------------------------------------------------- */
function Helpers() {}

Helpers.prototype = {

    jidOrUserId: function(jid_or_user_id) {
        var jid;
        if (typeof jid_or_user_id === 'string') {
            jid = jid_or_user_id;
        } else if (typeof jid_or_user_id === 'number') {
            jid = jid_or_user_id + '-' + config.creds.appId + '@' + config.endpoints.chat;
        } else {
            throw unsupported;
        }
        return jid;
    },

    typeChat: function(jid_or_user_id) {
        var chatType;
        if (typeof jid_or_user_id === 'string') {
            chatType = jid_or_user_id.indexOf("muc") > -1 ? 'groupchat' : 'chat';
        } else if (typeof jid_or_user_id === 'number') {
            chatType = 'chat';
        } else {
            throw unsupported;
        }
        return chatType;
    },

    getRecipientId: function(occupantsIds, UserId) {
        var recipient = null;
        occupantsIds.forEach(function(item, i, arr) {
            if(item != UserId){
                recipient = item;
            }
        });
        return recipient;
    },

    getUserJid: function(userId, appId) {
        if(!appId){
            return userId + '-' + config.creds.appId + '@' + config.endpoints.chat;
        }
        return userId + '-' + appId + '@' + config.endpoints.chat;
    },

    getUserNickWithMucDomain: function(userId) {
        return config.endpoints.muc + '/' + userId;
    },

    getIdFromNode: function(jid) {
        if (jid.indexOf('@') < 0) return null;
        return parseInt(jid.split('@')[0].split('-')[0]);
    },

    getDialogIdFromNode: function(jid) {
        if (jid.indexOf('@') < 0) return null;
        return jid.split('@')[0].split('_')[1];
    },

    getRoomJidFromDialogId: function(dialogId) {
        return config.creds.appId + '_' + dialogId + '@' + config.endpoints.muc;
    },

    getRoomJid: function(jid) {
        if(Utils.getEnv().node) throw unsupported;
        return jid + '/' + this.getIdFromNode(connection.jid);
    },

    getIdFromResource: function(jid) {
        var s = jid.split('/');
        if (s.length < 2) return null;
        s.splice(0, 1);
        return parseInt(s.join('/'));
    },

    getUniqueId: function(suffix) {
        if(Utils.getEnv().node) throw unsupported;
        return connection.getUniqueId(suffix);
    },

  /**
   * Steel from Strophe
   */
    getUniqueIdCross: function(suffix) {
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : r & 0x3 | 0x8;
            return v.toString(16);
        });
        if (typeof(suffix) == "string" || typeof(suffix) == "number") {
            return uuid + ":" + suffix;
        } else {
            return uuid + "";
        }
    },

    getBsonObjectId: function() {
        return Utils.getBsonObjectId();
    },

    getUserIdFromRoomJid: function(jid) {
        var arrayElements = jid.toString().split('/');
        if(arrayElements.length == 0){
            return null;
        }
        return arrayElements[arrayElements.length-1];
    }
};

module.exports = ChatProxy;


/* Private
----------------------------------------------------------------------------- */
function getErrorFromXMLNode(stanzaError) {
  var errorElement = stanzaError.getElementsByTagName('error')[0];
  var errorCode = parseInt(errorElement.getAttribute('code'));
  var errorText = errorElement.getElementsByTagName('text')[0].textContent;
  return Utils.getError(errorCode, errorText);
}

function getLocalTime() {
  return (new Date()).toTimeString().split(' ')[0];
}
