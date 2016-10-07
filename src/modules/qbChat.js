/*
 * QuickBlox JavaScript SDK
 * Chat Module
 */
var chatUtils = require('./qbChatHelpers'),
    config = require('../qbConfig'),
    Utils = require('../qbUtils');

var webrtc,
    roster = {},
    joinedRooms = {};

var unsupportedError = 'This function isn\'t supported outside of the browser (...yet)';

var dialogUrl = config.urls.chat + '/Dialog';
var messageUrl = config.urls.chat + '/Message';

var userCurrentJid;

/**
 * Browser env.
 * Uses by Strophe
 */
var connection;

/**
 * Node env.
 * NodeClient - constructor from node-xmpp-client
 * nClient - connection
 */
var NodeClient,
    nClient,
    nodeStanzasCallbacks = {};

if (Utils.getEnv().browser) {
    require('strophe.js');

    Strophe.addNamespace('CARBONS', chatUtils.MARKERS.CARBONS);
    Strophe.addNamespace('CHAT_MARKERS', chatUtils.MARKERS.CHAT);
    Strophe.addNamespace('PRIVACY_LIST', chatUtils.MARKERS.PRIVACY);
    Strophe.addNamespace('CHAT_STATES', chatUtils.MARKERS.STATES);
} else {
    NodeClient = require('node-xmpp-client');
}

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
 * - onMessageErrorListener (messageId, error)
 * - onMessageTypingListener
 * - onDeliveredStatusListener (messageId, dialogId, userId);
 * - onReadStatusListener (messageId, dialogId, userId);
 * - onSystemMessageListener (message)
 * - onContactListListener (userId, type)
 * - onSubscribeListener (userId)
 * - onConfirmSubscribeListener (userId)
 * - onRejectSubscribeListener (userId)
 * - onDisconnectedListener
 * - onReconnectListener
 */
    this._onMessage = function(stanza) {
        var from = chatUtils.getAttr(stanza, 'from'),
            to = chatUtils.getAttr(stanza, 'to'),
            type = chatUtils.getAttr(stanza, 'type'),
            messageId = chatUtils.getAttr(stanza, 'id'),
            markable = chatUtils.getElement(stanza, 'markable'),
            delivered = chatUtils.getElement(stanza, 'received'),
            read = chatUtils.getElement(stanza, 'displayed'),
            composing = chatUtils.getElement(stanza, 'composing'),
            paused = chatUtils.getElement(stanza, 'paused'),
            invite = chatUtils.getElement(stanza, 'invite'),
            delay = chatUtils.getElement(stanza, 'delay'),
            extraParams = chatUtils.getElement(stanza, 'extraParams'),
            bodyContent = chatUtils.getElementText(stanza, 'body'),
            jid;

        var recipient, recipientId;
        var extraParamsParsed;

        if (Utils.getEnv().browser) {
            recipient = stanza.querySelector('forwarded') ? stanza.querySelector('forwarded').querySelector('message').getAttribute('to') : null;
            recipientId = recipient ? self.helpers.getIdFromNode(recipient) : null;

            jid = connection.jid;
        } else if(Utils.getEnv().node){
            jid = nClient.options.jid.user;
        }

        var dialogId = type === 'groupchat' ? self.helpers.getDialogIdFromNode(from) : null,
            userId = type === 'groupchat' ? self.helpers.getIdFromResource(from) : self.helpers.getIdFromNode(from),
            marker = delivered || read || null;

        // ignore invite messages from MUC
        if (invite) return true;

        if(extraParams) {
            extraParamsParsed = chatUtils.parseExtraParams(extraParams);

            if(extraParamsParsed.dialogId){
                dialogId = extraParamsParsed.dialogId;
            }
        }

        if(composing || paused){
            if (typeof self.onMessageTypingListener === 'function' && (type === 'chat' || type === 'groupchat' || !delay)){
                Utils.safeCallbackCall(self.onMessageTypingListener, !!composing, userId, dialogId);
            }

            return true;
        }

        if (marker) {
            if (delivered) {
                if (typeof self.onDeliveredStatusListener === 'function' && type === 'chat') {
                    Utils.safeCallbackCall(self.onDeliveredStatusListener, chatUtils.getAttr(delivered, 'id'), dialogId, userId);
                }
            } else {
                if (typeof self.onReadStatusListener === 'function' && type === 'chat') {
                    Utils.safeCallbackCall(self.onReadStatusListener, chatUtils.getAttr(read, 'id'), dialogId, userId);
                }
            }

            return true;
        }

        // autosend 'received' status (ignore messages from yourself)
        if (markable && userId != self.helpers.getIdFromNode(jid)) {
            var autoSendReceiveStatusParams = {
                messageId: messageId,
                userId: userId,
                dialogId: dialogId
            };

            self.sendDeliveredStatus(autoSendReceiveStatusParams);
        }

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
        var from = chatUtils.getAttr(stanza, 'from'),
            to = chatUtils.getAttr(stanza, 'to'),
            type = chatUtils.getAttr(stanza, 'type'),
            userId = self.helpers.getIdFromNode(from),
            currentUserId = self.helpers.getIdFromNode(userCurrentJid);

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
                        Utils.safeCallbackCall(nodeStanzasCallbacks['muc:leave'], null);
                        return;
                    }
                }

                /** JOIN to dialog */
                if(stanza.attrs.id) {
                    if(status && status.attrs.code == "110"){
                        if(typeof nodeStanzasCallbacks[stanza.attrs.id] === 'function') {
                            Utils.safeCallbackCall(nodeStanzasCallbacks[stanza.attrs.id], stanza);
                        }
                    } else {
                        if(typeof nodeStanzasCallbacks[stanza.attrs.id] === 'function') {
                            Utils.safeCallbackCall(nodeStanzasCallbacks[stanza.attrs.id], null);
                        }
                    }
                }
            }
        }

        if (!type) {
            if (typeof self.onContactListListener === 'function' && roster[userId] && roster[userId].subscription !== 'none')
                Utils.safeCallbackCall(self.onContactListListener, userId);
        } else {
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
                        if (typeof self.onSubscribeListener === 'function') {
                            Utils.safeCallbackCall(self.onSubscribeListener, userId);
                        }
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

                    break;
                case 'unavailable':
                    if (typeof self.onContactListListener === 'function' && roster[userId] && roster[userId].subscription !== 'none') {
                        Utils.safeCallbackCall(self.onContactListListener, userId, type);
                    }

                    // send initial presence if one of client (instance) goes offline
                    if (userId === currentUserId) {
                        connection.send($pres().tree());
                    }

                    break;
            }
        }

        // we must return true to keep the handler alive
        // returning false would remove it after it finishes
        return true;
    };

    this._onIQ = function(stanza) {
        if(Utils.getEnv().node){
            var stanzaId = chatUtils.getAttr(stanza, 'id');

            if(nodeStanzasCallbacks[stanzaId]){
                Utils.safeCallbackCall(nodeStanzasCallbacks[stanzaId], stanza);
                delete nodeStanzasCallbacks[stanzaId];
            }
        }

        return true;
    };

    this._onSystemMessageListener = function(stanza) {
        var from = chatUtils.getAttr(stanza, 'from'),
            to = chatUtils.getAttr(stanza, 'to'),
            messageId = chatUtils.getAttr(stanza, 'id'),
            extraParams = chatUtils.getElement(stanza, 'extraParams'),
            delay = chatUtils.getElement(stanza, 'delay'),
            moduleIdentifier = chatUtils.getElementText(extraParams, 'moduleIdentifier'),
            bodyContent = chatUtils.getElementText(stanza, 'body'),
            message;

        if (moduleIdentifier === 'SystemNotifications' && typeof self.onSystemMessageListener === 'function') {
            var extraParamsParsed = chatUtils.parseExtraParams(extraParams);

            message = {
                id: messageId,
                userId: self.helpers.getIdFromNode(from),
                body: bodyContent,
                extension: extraParamsParsed.extension
            };

            Utils.safeCallbackCall(self.onSystemMessageListener, message);
        }

        return true;
    };

    /** TODO! */
    this._onMessageErrorListener = function(stanza) {
        // <error code="503" type="cancel">
        //   <service-unavailable xmlns="urn:ietf:params:xml:ns:xmpp-stanzas"/>
        //   <text xmlns="urn:ietf:params:xml:ns:xmpp-stanzas" xml:lang="en">Service not available.</text>
        // </error>

        var messageId = stanza.getAttribute('id');
        var error = chatUtils.getErrorFromXMLNode(stanza);

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

        var userJid = chatUtils.buildUserJid(params);

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
                        Utils.QBLog('[ChatProxy]', 'Status.CONNECTED at ' + chatUtils.getLocalTime());

                        self._isDisconnected = false;
                        userCurrentJid = connection.jid;

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
                        self._enableCarbons();

                        // get the roster
                        self.roster.get(function(contacts) {
                            roster = contacts;

                            // chat server will close your connection if you are not active in chat during one minute
                            // initial presence and an automatic reminder of it each 55 seconds
                            connection.send($pres().tree());

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

                        break;
                    case Strophe.Status.DISCONNECTING:
                        Utils.QBLog('[ChatProxy]', 'Status.DISCONNECTING');
                        break;
                    case Strophe.Status.DISCONNECTED:
                        Utils.QBLog('[ChatProxy]', 'Status.DISCONNECTED at ' + chatUtils.getLocalTime());

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
                Utils.QBLog('[ChatProxy]', 'Status.CONNECTED at ' + chatUtils.getLocalTime());
            });

            nClient.on('online', function () {
                Utils.QBLog('[ChatProxy]', 'Status.CONNECTED at ' + chatUtils.getLocalTime());

                self._isDisconnected = false;
                self._isLogout = false;

                /** Send first presence if user is online */
                nClient.send('<presence/>');

                userCurrentJid = nClient.jid.user + '@' + nClient.jid._domain + '/' + nClient.jid._resource;

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
            builder = Utils.getEnv().browser ? $msg : NodeClient.Stanza;

        var paramsCreateMsg = {
            from: userCurrentJid,
            to: this.helpers.jidOrUserId(jid_or_user_id),
            type: message.type ? message.type : 'chat',
            id: message.id ? message.id : Utils.getBsonObjectId()
        };

        var stanza = chatUtils.createStanza(builder, paramsCreateMsg);

        if (message.body) {
            stanza.c('body', {
                xmlns: chatUtils.MARKERS.CLIENT,
            }).t(message.body).up();
        }

        if (message.markable) {
            stanza.c('markable', {
                xmlns: chatUtils.MARKERS.CHAT
            }).up();
        }

        if(Utils.getEnv().browser) {
            if (message.extension) {
                stanza.c('extraParams', {
                    xmlns: chatUtils.MARKERS.CLIENT
                });

                stanza = chatUtils.filledExtraParams(stanza, message.extension);
            }

            connection.send(stanza);
        }

        if(Utils.getEnv().node) {
            if (message.extension) {
                stanza.c('extraParams', {
                    xmlns: chatUtils.MARKERS.CLIENT
                });

                stanza = chatUtils.filledExtraParams(stanza, message.extension);
            }

            nClient.send(stanza);
        }
    },
    sendSystemMessage: function(jid_or_user_id, message) {
        var self = this,
            builder = Utils.getEnv().browser ? $msg : NodeClient.Stanza,
            paramsCreateMsg = {
                type: 'headline',
                id: message.id ? message.id : Utils.getBsonObjectId(),
                to: this.helpers.jidOrUserId(jid_or_user_id)
            };

        var stanza = chatUtils.createStanza(builder, paramsCreateMsg);

        if (message.body) {
            stanza.c('body', {
                xmlns: chatUtils.MARKERS.CLIENT,
            }).t(message.body).up();
        }

        if(Utils.getEnv().browser) {
            // custom parameters
            if (message.extension) {
              stanza.c('extraParams', {
                xmlns: chatUtils.MARKERS.CLIENT
              }).c('moduleIdentifier').t('SystemNotifications').up();

             stanza = chatUtils.filledExtraParams(stanza, message.extension);
            }

            connection.send(stanza);
        }

        if(Utils.getEnv().node) {
            if (message.extension) {
                stanza.c('extraParams',  {
                    xmlns: chatUtils.MARKERS.CLIENT
                }).c('moduleIdentifier').t('SystemNotifications');

                stanza = chatUtils.filledExtraParams(stanza, message.extension);
            }

            nClient.send(stanza);
        }
    },
    sendIsTypingStatus: function(jid_or_user_id) {
        var self = this,
            stanzaParams = {
                from: userCurrentJid,
                to: this.helpers.jidOrUserId(jid_or_user_id),
                type: this.helpers.typeChat(jid_or_user_id)
            },
            builder = Utils.getEnv().browser ? $msg : NodeClient.Stanza;

        var stanza = chatUtils.createStanza(builder, stanzaParams);

        stanza.c('composing', {
            xmlns: chatUtils.MARKERS.STATES
        });

        if(Utils.getEnv().browser){
            connection.send(stanza);
        } else if(Utils.getEnv().node) {
            nClient.send(stanza);
        }
    },
    sendIsStopTypingStatus: function(jid_or_user_id) {
        var self = this,
            stanzaParams = {
                from: userCurrentJid,
                to: this.helpers.jidOrUserId(jid_or_user_id),
                type: this.helpers.typeChat(jid_or_user_id)
            },
            builder = Utils.getEnv().browser ? $msg : NodeClient.Stanza;

        var stanza = chatUtils.createStanza(builder, stanzaParams);

        stanza.c('paused', {
            xmlns: chatUtils.MARKERS.STATES
        });

        if(Utils.getEnv().browser){
            connection.send(stanza);
         } else if(Utils.getEnv().node) {
            nClient.send(stanza);
        }
    },
    sendDeliveredStatus: function(params) {
        var self = this,
            stanzaParams = {
                type: 'chat',
                from: userCurrentJid,
                id: Utils.getBsonObjectId(),
                to: this.helpers.jidOrUserId(params.userId)
            },
            builder = Utils.getEnv().browser ? $msg : NodeClient.Stanza;

        var stanza = chatUtils.createStanza(builder, stanzaParams);

        stanza.c('received', {
            xmlns: chatUtils.MARKERS.MARKERS,
            id: params.messageId
        }).up();

        stanza.c('extraParams', {
          xmlns: chatUtils.MARKERS.CLIENT
        }).c('dialog_id').t(params.dialogId);

        if(Utils.getEnv().browser) {
            connection.send(stanza);
        } else if(Utils.getEnv().node) {
            nClient.send(stanza);
        }
    },
    sendReadStatus: function(params) {
        var self = this,
            stanzaParams = {
                type: 'chat',
                from: userCurrentJid,
                to: this.helpers.jidOrUserId(params.userId),
                id: Utils.getBsonObjectId()
            },
            builder = Utils.getEnv().browser ? $msg : NodeClient.Stanza;

        var stanza = chatUtils.createStanza(builder, stanzaParams);

        stanza.c('displayed', {
            xmlns: chatUtils.MARKERS.MARKERS,
            id: params.messageId
        }).up();

        stanza.c('extraParams', {
            xmlns: chatUtils.MARKERS.CLIENT
        }).c('dialog_id').t(params.dialogId);

        if(Utils.getEnv().browser) {
            connection.send(stanza);
        } else if(Utils.getEnv().node){
            nClient.send(stanza);
        }
    },
    disconnect: function() {
        joinedRooms = {};
        this._isLogout = true;
        userCurrentJid = '';

        if(Utils.getEnv().browser) {
            connection.flush();
            connection.disconnect();
        } else if(Utils.getEnv().node) {
            nClient.end();
        }
    },
    addListener: function(params, callback) {
        if(Utils.getEnv().node) {
            throw new Error(unsupportedError);
        }

        return connection.addHandler(handler, null, params.name || null, params.type || null, params.id || null, params.from || null);

        function handler() {
            callback();
            // if 'false' - a handler will be performed only once
            return params.live !== false;
        }
    },
    deleteListener: function(ref) {
        if(Utils.getEnv().node) {
            throw new Error(unsupportedError);
        }

        connection.deleteHandler(ref);
    },
    /**
     * Carbons XEP [http://xmpp.org/extensions/xep-0280.html]
     */
    _enableCarbons: function(cb) {
        var self = this,
            carbonParams = {
                type: 'set',
                from: userCurrentJid,
                id: chatUtils.getUniqueId('enableCarbons')
            },
            builder = Utils.getEnv().browser ? $iq : NodeClient.Stanza;

        var iq = chatUtils.createStanza(builder, carbonParams, 'iq');

        iq.c('enable', {
            xmlns: chatUtils.MARKERS.CARBONS
        });

        if(Utils.getEnv().browser) {
            connection.sendIQ(iq);
        } else if(Utils.getEnv().node) {
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
        var self = this,
            items, userId, contacts = {},
            iqParams = {
                'type': 'get',
                'from': userCurrentJid,
                'id': chatUtils.getUniqueId('getRoster')
            },
            builder = Utils.getEnv().browser ? $iq : NodeClient.Stanza;

        var iq = chatUtils.createStanza(builder, iqParams, 'iq');

        function _getItems(stanza) {
            if(Utils.getEnv().browser) {
                return stanza.getElementsByTagName('item');
            } else if(Utils.getEnv().node) {
                return stanza.getChild('query').children;
            }
        }

        function _callbackWrap(stanza) {
            var items = _getItems(stanza);
            /** TODO */
            for (var i = 0, len = items.length; i < len; i++) {
                var userId = self.helpers.getIdFromNode( chatUtils.getAttr(items[i], 'jid') ),
                    ask = chatUtils.getAttr(items[i], 'ask'),
                    subscription = chatUtils.getAttr(items[i], 'subscription');

                contacts[userId] = {
                    subscription: subscription,
                    ask: ask || null
                };
            }

            callback(contacts);
        }

        iq.c('query', {
            xmlns: chatUtils.MARKERS.ROSTER
        });

        if(Utils.getEnv().browser) {
            connection.sendIQ(iq, _callbackWrap);
        } else if(Utils.getEnv().node){
            nodeStanzasCallbacks[iqParams.id] = _callbackWrap;
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

        if (typeof callback === 'function') {
            callback();
        }
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


        if (typeof callback === 'function') {
            callback();
        }
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

        if (typeof callback === 'function') {
            callback();
        }
    },
    remove: function(jidOrUserId, callback) {
        var self = this,
            userJid = this.helpers.jidOrUserId(jidOrUserId),
            userId = this.helpers.getIdFromNode(userJid);

        var iqParams = {
            'type': 'set',
            'from': connection ? connection.jid : nClient.jid.user,
            'id': chatUtils.getUniqueId('getRoster')
        };

        var builder = Utils.getEnv().browser ? $iq : NodeClient.Stanza,
            iq = chatUtils.createStanza(builder, iqParams, 'iq');

        function _callbackWrap() {
            delete roster[userId];

            if (typeof callback === 'function') {
                callback();
            }
        }

        iq.c('query', {
            xmlns: chatUtils.MARKERS.ROSTER
        }).c('item', {
            jid: userJid,
            subscription: 'remove'
        });

        if(Utils.getEnv().browser) {
            connection.sendIQ(iq, _callbackWrap);

        } else if(Utils.getEnv().node) {
            nodeStanzasCallbacks[iqParams.id] = _callbackWrap;
            nClient.send(iq);
        }
    },
    _sendSubscriptionPresence: function(params) {
        var builder = Utils.getEnv().browser ? $pres : NodeClient.Stanza,
            presParams = {
                to: params.jid,
                type: params.type
            };

        var pres = chatUtils.createStanza(builder, presParams, 'presence');

        Utils.QBLog('[_sendSubscriptionPresence]', params);

        if(Utils.getEnv().browser){
             connection.send(pres);
        } else if (Utils.getEnv().node) {
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
            id = chatUtils.getUniqueId('join');

        var presParams = {
                id: id,
                from: userCurrentJid,
                to: self.helpers.getRoomJid(jid)
            },
            builder = Utils.getEnv().browser ? $pres : NodeClient.Stanza;

        var pres = chatUtils.createStanza(builder, presParams, 'presence');

        pres.c('x', {
            xmlns: chatUtils.MARKERS.MUC
        }).c('history', { maxstanzas: 0 });

        joinedRooms[jid] = true;

        if (Utils.getEnv().browser) {
            if (typeof callback === 'function') {
                connection.addHandler(callback, null, 'presence', null, id);
            }

            connection.send(pres);
        } else if(Utils.getEnv().node){
            if (typeof callback === 'function') {
                nodeStanzasCallbacks[id] = callback;
            }

            nClient.send(pres);
        }
    },
    leave: function(jid, callback) {
        var self = this,
            presParams = {
                type: 'unavailable',
                from: userCurrentJid,
                to: self.helpers.getRoomJid(jid)
            },
            builder = Utils.getEnv().browser ? $pres : NodeClient.Stanza;

        var pres = chatUtils.createStanza(builder, presParams, 'presence');

        delete joinedRooms[jid];

        if (Utils.getEnv().browser) {
            var roomJid = self.helpers.getRoomJid(jid);

            if (typeof callback === 'function') {
                connection.addHandler(callback, null, 'presence', presParams.type, null, roomJid);
            }

            connection.send(pres);
        } else if(Utils.getEnv().node) {
            /** The answer don't contain id */
            if(typeof callback === 'function') {
                nodeStanzasCallbacks['muc:leave'] = callback;
            }

            nClient.send(pres);
        }
    },
    listOnlineUsers: function(dialogJID, callback) {
        var self = this,
            onlineUsers = [];

        var iqParams = {
                type: 'get',
                to: dialogJID,
                from: userCurrentJid,
                id: chatUtils.getUniqueId('muc_disco_items'),
            },
            builder = Utils.getEnv().browser ? $iq : NodeClient.Stanza;

        var iq = chatUtils.createStanza(builder, iqParams, 'iq');

        iq.c('query', {
            xmlns: 'http://jabber.org/protocol/disco#items'
        });

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
        }

        if (Utils.getEnv().browser) {
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
            nClient.send(iq);
            nodeStanzasCallbacks[iqParams.id] = _getUsers;
        }
    }
};

/* Chat module: Privacy list
 *
 * Privacy list
 * http://xmpp.org/extensions/xep-0016.html
 * by default 'mutualBlock' is work in one side
----------------------------------------------------------------------------- */
function PrivacyListProxy(service) {
    this.service = service;
    this.helpers = new Helpers();
}

PrivacyListProxy.prototype = {
    create: function(list, callback) {
        var self = this,
            userId, userJid, userMuc,
            userAction,
            mutualBlock,
            listPrivacy = {},
            listUserId = [];

        /** Filled listPrivacys */
        for (var i = list.items.length - 1; i >= 0; i--) {
            var user = list.items[i];

            listPrivacy[user.user_id] = {
                action: user.action,
                mutualBlock: user.mutualBlock === true ? true : false
            };
        }

        /** Filled listUserId */
        listUserId = Object.keys(listPrivacy);

        var iqParams = {
            type: 'set',
            from: userCurrentJid,
            id: chatUtils.getUniqueId('edit')
        },
        builder = Utils.getEnv().browser ? $iq : NodeClient.Stanza;

        var iq = chatUtils.createStanza(builder, iqParams, 'iq');

        iq.c('query', {
            xmlns: chatUtils.MARKERS.PRIVACY
        }).c('list', {
          name: list.name
        });

        function createPrivacyItem(iq, params){
            if(Utils.getEnv().browser) {
                iq.c('item', {
                    type: 'jid',
                    value: params.jidOrMuc,
                    action: params.userAction,
                    order: params.order
                }).c('message', {})
                .up().c('presence-in', {})
                .up().c('presence-out', {})
                .up().c('iq', {})
                .up().up();
            } else if(Utils.getEnv().node) {
                var list = iq.getChild('query').getChild('list');

                list.c('item', {
                    type: 'jid',
                    value: params.jidOrMuc,
                    action: params.userAction,
                    order: params.order
                }).c('message', {})
                .up().c('presence-in', {})
                .up().c('presence-out', {})
                .up().c('iq', {})
                .up().up();
            }

            return iq;
        }

        function createPrivacyItemMutal(iq, params) {
            if(Utils.getEnv().browser) {
                iq.c('item', {
                  type: 'jid',
                  value: params.jidOrMuc,
                  action: params.userAction,
                  order: params.order
                }).up();
            } else if(Utils.getEnv().node) {
                var list = iq.getChild('query').getChild('list');

                list.c('item', {
                  type: 'jid',
                  value: params.jidOrMuc,
                  action: params.userAction,
                  order: params.order
                }).up();
            }

            return iq;
        }

        for (var index = 0, i = 0, len = listUserId.length; index < len; index++, i=i+2) {
            userId = listUserId[index];
            mutualBlock = listPrivacy[userId].mutualBlock;

            userAction = listPrivacy[userId].action;
            userJid = self.helpers.jidOrUserId(parseInt(userId, 10));
            userMuc = self.helpers.getUserNickWithMucDomain(userId);

            if(mutualBlock && userAction === 'deny'){
                iq = createPrivacyItemMutal(iq, {
                    order: i+1,
                    jidOrMuc: userJid,
                    userAction: userAction
                });
                iq = createPrivacyItemMutal(iq, {
                    order: i+2,
                    jidOrMuc: userMuc,
                    userAction: userAction
                }).up().up();
            } else {
                iq = createPrivacyItem(iq, {
                    order: i+1,
                    jidOrMuc: userJid,
                    userAction: userAction
                });
                iq = createPrivacyItem(iq, {
                    order: i+2,
                    jidOrMuc: userMuc,
                    userAction: userAction
                });
            }
        }

        if(Utils.getEnv().browser) {
            connection.sendIQ(iq, function(stanzaResult) {
                callback(null);
            }, function(stanzaError){
                if(stanzaError){
                    var errorObject = chatUtils.getErrorFromXMLNode(stanzaError);
                    callback(errorObject);
                }else{
                    callback(Utils.getError(408));
                }
            });
        } else if(Utils.getEnv().node) {
            nClient.send(iq);

            nodeStanzasCallbacks[iqParams.id] = function (stanza) {
                if(!stanza.getChildElements('error').length){
                    callback(null);
                } else {
                    callback(Utils.getError(408));
                }
            };
        }
    },
    getList: function(name, callback) {
        var self = this,
            items, userJid, userId,
            usersList = [], list = {};

        var iqParams = {
                type: 'get',
                from: userCurrentJid,
                id: chatUtils.getUniqueId('getlist')
            },
            builder = Utils.getEnv().browser ? $iq : NodeClient.Stanza;

        var iq = chatUtils.createStanza(builder, iqParams, 'iq');

        iq.c('query', {
            xmlns: chatUtils.MARKERS.PRIVACY
        }).c('list', {
            name: name
        });

        if(Utils.getEnv().browser) {
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
                    callback(null, list);
                }, function(stanzaError){
                    if(stanzaError){
                        var errorObject = chatUtils.getErrorFromXMLNode(stanzaError);
                        callback(errorObject, null);
                    }else{
                        callback(Utils.getError(408), null);
                    }
                });
        } else if(Utils.getEnv().node){
            nodeStanzasCallbacks[iqParams.id] = function(stanza){
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
                delete nodeStanzasCallbacks[iqParams.id];
            };

            nClient.send(iq);
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
    getNames: function(callback) {
        var self = this,
            iq,
            stanzaParams = {
                'type': 'get',
                'from': userCurrentJid,
                'id': chatUtils.getUniqueId('getNames')
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
                    var errorObject = chatUtils.getErrorFromXMLNode(stanzaError);
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
    delete: function(name, callback) {
        var iq = $iq({
            from: connection.jid,
            type: 'set',
            id: chatUtils.getUniqueId('remove')
        }).c('query', {
            xmlns: Strophe.NS.PRIVACY_LIST
        }).c('list', {
            name: name ? name : ''
        });

        connection.sendIQ(iq, function(stanzaResult) {
            callback(null);
        }, function(stanzaError){
            if(stanzaError){
                var errorObject = chatUtils.getErrorFromXMLNode(stanzaError);
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
                'id': chatUtils.getUniqueId('default')
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
                    var errorObject = chatUtils.getErrorFromXMLNode(stanzaError);
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
            'id': chatUtils.getUniqueId('active')
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
                    var errorObject = chatUtils.getErrorFromXMLNode(stanzaError);
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

/**
 * DialogProxy
 */
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

        this.service.ajax({
            url: Utils.getUrl(dialogUrl),
            data: params
        }, callback);
    },
    create: function(params, callback) {
        if (params.occupants_ids instanceof Array) {
            params.occupants_ids = params.occupants_ids.join(', ');
        }

        Utils.QBLog('[DialogProxy]', 'create', params);

        this.service.ajax({
            url: Utils.getUrl(dialogUrl),
            type: 'POST',
            data: params
        }, callback);
    },
    update: function(id, params, callback) {
        Utils.QBLog('[DialogProxy]', 'update', params);

        this.service.ajax({
            url: Utils.getUrl(dialogUrl, id),
            type: 'PUT',
            data: params
        }, callback);
    },
    delete: function(id, params_or_callback, callback) {
        var ajaxParams = {
            url: Utils.getUrl(dialogUrl, id),
            type: 'DELETE',
            dataType: 'text'
        };

        Utils.QBLog('[DialogProxy]', 'delete', id);

        if (arguments.length == 2) {
            this.service.ajax(ajaxParams, params_or_callback);
        } else if (arguments.length == 3) {
            ajaxParams.data = params_or_callback;

            this.service.ajax(ajaxParams, callback);
        }
    }
};

/**
 * MessageProxy
 */
function MessageProxy(service) {
    this.service = service;
    this.helpers = new Helpers();
}

MessageProxy.prototype = {
    list: function(params, callback) {
        Utils.QBLog('[MessageProxy]', 'list', params);

        this.service.ajax({
            url: Utils.getUrl(messageUrl),
            data: params
        }, callback);
    },
    create: function(params, callback) {
        Utils.QBLog('[MessageProxy]', 'create', params);

        this.service.ajax({
            url: Utils.getUrl(messageUrl),
            type: 'POST',
            data: params
        }, callback);
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
        var ajaxParams = {
                url: Utils.getUrl(messageUrl, id),
                type: 'DELETE',
                dataType: 'text'
            };

        Utils.QBLog('[DialogProxy]', 'delete', id);

        if (arguments.length == 2) {
            this.service.ajax(ajaxParams, params_or_callback);
        } else if (arguments.length == 3) {
            ajaxParams.data = params_or_callback;

            this.service.ajax(ajaxParams, callback);
        }
    },
    unreadCount: function(params, callback) {
        Utils.QBLog('[MessageProxy]', 'unreadCount', params);

        this.service.ajax({
            url: Utils.getUrl(messageUrl + '/unread'),
            data: params
        }, callback);
    }
};


/* Helpers
----------------------------------------------------------------------------- */
function Helpers() {}

Helpers.prototype = {
    getUniqueId: chatUtils.getUniqueId,
    jidOrUserId: function(jid_or_user_id) {
        var jid;
        if (typeof jid_or_user_id === 'string') {
            jid = jid_or_user_id;
        } else if (typeof jid_or_user_id === 'number') {
            jid = jid_or_user_id + '-' + config.creds.appId + '@' + config.endpoints.chat;
        } else {
            throw new Error('The method "jidOrUserId" may take jid or id');
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
            throw new Error(unsupportedError);
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
        return jid + '/' + this.getIdFromNode(userCurrentJid);
    },

    getIdFromResource: function(jid) {
        var s = jid.split('/');
        if (s.length < 2) return null;
        s.splice(0, 1);
        return parseInt(s.join('/'));
    },
    getBsonObjectId: function() {
        return Utils.getBsonObjectId();
    },

    getUserIdFromRoomJid: function(jid) {
        var arrayElements = jid.toString().split('/');
        if(arrayElements.length === 0){
            return null;
        }
        return arrayElements[arrayElements.length-1];
    },
    getUniqueId: function(suffix) {
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : r & 0x3 | 0x8;
            return v.toString(16);
        });
        if (typeof(suffix) == 'string' || typeof(suffix) == 'number') {
            return uuid + ':' + suffix;
        } else {
            return uuid + '';
        }
    }
};

module.exports = ChatProxy;
