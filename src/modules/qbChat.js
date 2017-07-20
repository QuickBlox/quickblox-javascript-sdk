'use strict';

/** JSHint inline rules */
/* globals Strophe, $pres, $msg, $iq */

var chatUtils = require('./qbChatHelpers'),
    config = require('../qbConfig'),
    Utils = require('../qbUtils'),
    StreamManagement = require('../plugins/streamManagement');

var unsupportedError = 'This function isn\'t supported outside of the browser (...yet)';

var DIALOGS_API_URL = config.urls.chat + '/Dialog';
var MESSAGES_API_URL = config.urls.chat + '/Message';

/** create StropheJS or NodeXMPP connection object */
if (Utils.getEnv().browser) {
    var Connection = require('../qbStrophe');

    require('strophe.js');

    Strophe.addNamespace('CARBONS', chatUtils.MARKERS.CARBONS);
    Strophe.addNamespace('CHAT_MARKERS', chatUtils.MARKERS.CHAT);
    Strophe.addNamespace('PRIVACY_LIST', chatUtils.MARKERS.PRIVACY);
    Strophe.addNamespace('CHAT_STATES', chatUtils.MARKERS.STATES);
}else{
    var NodeClient = require('node-xmpp-client');
}


function ChatProxy(service) {
    var self = this;

    self.webrtcSignalingProcessor = null;

    /**
     * Browser env.
     * Uses by Strophe
     */
    if (Utils.getEnv().browser) {
        // strophe js
        self.connection = new Connection();

        /** Add extension methods to track handlers for removal on reconnect */
        self.connection.XHandlerReferences = [];
        self.connection.XAddTrackedHandler = function (handler, ns, name, type, id, from, options) {
            self.connection.XHandlerReferences.push(self.connection.addHandler(handler, ns, name, type, id, from, options));
        };
        self.connection.XDeleteHandlers = function () {
            while (self.connection.XHandlerReferences.length) {
                self.connection.deleteHandler(self.connection.XHandlerReferences.pop());
            }
        };
    } else {
        // node-xmpp-client
        self.nClient = new NodeClient({
            'autostart': false,
            'reconnect': true
        });

        // override 'send' function to add some logs
        var originSendFunction = self.nClient.send;
        self.nClient.send = function(stanza) {
            Utils.QBLog('[Chat]', 'SENT:', stanza.toString());
            originSendFunction.call(self.nClient, stanza);
        };

        self.nodeStanzasCallbacks = {};
    }

    this.service = service;

    this._isLogout = false;
    this._isDisconnected = false;

    //
    this.helpers = new Helpers();
    //
    var chatOptions = {
        service: service,
        helpers: self.helpers,
        stropheClient: self.connection,
        nodeClient: self.nClient,
        nodeStanzasCallbacks: self.nodeStanzasCallbacks
    };

    var restOptions = {
        service: service,
        helpers: self.helpers
    };

    this.roster = new RosterProxy(chatOptions);
    this.privacylist = new PrivacyListProxy(chatOptions);
    this.muc = new MucProxy(chatOptions);
    //
    this.dialog = new DialogProxy(restOptions);
    this.message = new MessageProxy(restOptions);

    this.chatUtils = chatUtils;

    if (config.streamManagement.enable){
        if(config.chatProtocol.active === 2){
            this.streamManagement = new StreamManagement(config.streamManagement);
            self._sentMessageCallback = function(messageLost, messageSent){
                if(typeof self.onSentMessageCallback === 'function'){
                    if(messageSent){
                        self.onSentMessageCallback(null, messageSent);
                    } else {
                        self.onSentMessageCallback(messageLost);
                    }
                }
            };
        } else {
            Utils.QBLog('[Chat] StreamManagement:', 'BOSH protocol doesn\'t support stream management. Set WebSocket as the "chatProtocol" parameter to use this functionality. https://quickblox.com/developers/Javascript#Configuration');
        }
    }

    /**
     * User's callbacks (listener-functions):
     * - onMessageListener
     * - onMessageErrorListener (messageId, error)
     * - onSentMessageCallback(messageLost, messageSent)
     * - onMessageTypingListener
     * - onDeliveredStatusListener (messageId, dialogId, userId);
     * - onReadStatusListener (messageId, dialogId, userId);
     * - onSystemMessageListener (message)
     * - onKickOccupant(dialogId, initiatorUserId)
     * - onJoinOccupant(dialogId, userId)
     * - onLeaveOccupant(dialogId, userId)
     * - onContactListListener (userId, type)
     * - onSubscribeListener (userId)
     * - onConfirmSubscribeListener (userId)
     * - onRejectSubscribeListener (userId)
     * - onDisconnectedListener
     * - onReconnectListener
     */

    /**
     * You need to set onMessageListener function, to get messages. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Create_new_dialog More info.}
     * @function onMessageListener
     * @memberOf QB.chat
     * @param {Number} error - The error object
     * @param {Object} message - Object of subscribed users.
     **/

    /**
     * Blocked entities receive an error when try to chat with a user in a 1-1 chat and receivie nothing in a group chat. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Blocked_user_attempts_to_communicate_with_user More info.}
     * @function onMessageErrorListener
     * @memberOf QB.chat
     * @param {Number} error - The error object
     * @param {Object} message - Object of subscribed users.
     **/

    /**
     * This feature defines an approach for ensuring is the message delivered to the server. This feature is unabled by default. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Sent_message More info.}
     * @function onSentMessageCallback
     * @memberOf QB.chat
     * @param {Number} error - The error object
     * @param {Object} message - Object of subscribed users.
     **/

    /**
     * Show typing status in chat or groupchat. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Typing_status More info.}
     * @function onMessageTypingListener
     * @memberOf QB.chat
     * @param {Boolean} isTyping - Typing Status
     * @param {Number} userId - Object of subscribed users.
     * @param {String} dialogId -The dialog id
     **/

    /**
     * Receive delivery confirmations {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Delivered_status More info.}
     * @function onDeliveredStatusListener
     * @memberOf QB.chat
     * @param {String} messageId - Typing Status
     * @param {String} dialogId -The dialog id
     * @param {Number} userId - User Id.
     **/

    /**
     * You can manage 'read' notifications in chat. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Read_status More info.}
     * @function onReadStatusListener
     * @memberOf QB.chat
     * @param {String} messageId - Typing Status
     * @param {String} dialogId -The dialog id
     * @param {Number} userId - User Id.
     **/

    /**
     * These messages work over separated channel and won't be mixed with the regular chat messages. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#System_notifications More info.}
     * @function onSystemMessageListener
     * @memberOf QB.chat
     * @param {Object} receivedMessage - Recieved Message. Always have type: 'headline'
     **/

    /**
     * You will receive this callback when you are in group chat dialog(joined) and other user (chat dialog's creator) removed you from occupants.
     * @function onKickOccupant
     * @memberOf QB.chat
     * @param {String} dialogId - An Id of chat dialog where you was kicked from.
     * @param {Number} initiatorUserId - An Id of user who has kicked you.
     **/

    /**
     * You will receive this callback when some user joined group chat dialog you are in.
     * @function onJoinOccupant
     * @memberOf QB.chat
     * @param {String} dialogId - An Id of chat dialog that user joined.
     * @param {Number} userId - An Id of user who joined chat dialog.
     **/

    /**
     * You will receive this callback when some user left group chat dialog you are in.
     * @function onLeaveOccupant
     * @memberOf QB.chat
     * @param {String} dialogId - An Id of chat dialog that user left.
     * @param {Number} userId - An Id of user who left chat dialog.
     **/

    /**
     * Receive user status (online / offline). {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Roster_callbacks More info.}
     * @function onContactListListener
     * @memberOf QB.chat
     * @param {Number} userId - The sender ID
     * @param {String} type - If user leave the chat, type will be 'unavailable'
     **/

    /**
     * Receive subscription request. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Roster_callbacks More info.}
     * @function onSubscribeListener
     * @memberOf QB.chat
     * @param {Number} userId - The sender ID
     **/

    /**
     * Receive confirm request. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Roster_callbacks More info.}
     * @function onConfirmSubscribeListener
     * @memberOf QB.chat
     * @param {Number} userId - The sender ID
     **/

    /**
     * Receive reject request. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Roster_callbacks More info.}
     * @function onRejectSubscribeListener
     * @memberOf QB.chat
     * @param {Number} userId - The sender ID
     **/

    /**
     * Run after disconnect from chat. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Logout_from_Chat More info.}
     * @function onDisconnectedListener
     * @memberOf QB.chat
     **/

    /**
     * By default Javascript SDK reconnects automatically when connection to server is lost. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Reconnection More info.}
     * @function onReconnectListener
     * @memberOf QB.chat
     **/


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

            jid = self.connection.jid;
        } else if(Utils.getEnv().node){
            jid = self.nClient.options.jid.user;
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
            id = chatUtils.getAttr(stanza, 'id'),
            type = chatUtils.getAttr(stanza, 'type'),
            currentUserId = self.helpers.getIdFromNode(self.helpers.userCurrentJid(Utils.getEnv().browser ? self.connection : self.nClient)),
            x = chatUtils.getElement(stanza, 'x'),
            xXMLNS, status, statusCode, dialogId, userId;

        if(x){
            xXMLNS = chatUtils.getAttr(x, 'xmlns');
            status = chatUtils.getElement(x, 'status');
            if(status){
                statusCode = chatUtils.getAttr(status, 'code');
            }
        }


        // MUC presences go here

        if(xXMLNS && xXMLNS == "http://jabber.org/protocol/muc#user"){

            dialogId = self.helpers.getDialogIdFromNode(from);
            userId = self.helpers.getUserIdFromRoomJid(from);

            // KICK from dialog event
            if(status && statusCode == "301"){
                if (typeof self.onKickOccupant === 'function'){
                    var actorElement = chatUtils.getElement(chatUtils.getElement(x, 'item'), 'actor');
                    var initiatorUserJid = chatUtils.getAttr(actorElement, 'jid');
                    Utils.safeCallbackCall(self.onKickOccupant,
                        dialogId,
                        self.helpers.getIdFromNode(initiatorUserJid));
                }

                delete self.muc.joinedRooms[self.helpers.getRoomJidFromRoomFullJid(from)];

                return true;

                // Occupants JOIN/LEAVE events
            }else if(!status){
                if(userId != currentUserId){
                    // Leave
                    if(type && type === 'unavailable'){
                        if (typeof self.onLeaveOccupant === 'function'){
                            Utils.safeCallbackCall(self.onLeaveOccupant, dialogId, parseInt(userId));
                        }
                        return true;
                        // Join
                    }else{
                        if (typeof self.onJoinOccupant === 'function'){
                            Utils.safeCallbackCall(self.onJoinOccupant, dialogId, parseInt(userId));
                        }
                        return true;
                    }

                }
            }
        }

        if(Utils.getEnv().node) {
            /** MUC */
            if(xXMLNS){
                if(xXMLNS == "http://jabber.org/protocol/muc#user"){
                    /**
                     * if you make 'leave' from dialog
                     * stanza will be contains type="unavailable"
                     */
                    if(type && type === 'unavailable'){
                        /** LEAVE from dialog */
                        if(status && statusCode == "110"){
                            if(typeof self.nodeStanzasCallbacks['muc:leave'] === 'function') {
                                Utils.safeCallbackCall(self.nodeStanzasCallbacks['muc:leave'], null);
                            }
                            return true;
                        }
                    }

                    /** JOIN to dialog success */
                    if(id.endsWith(":join") && status && statusCode == "110"){
                        if(typeof self.nodeStanzasCallbacks[id] === 'function') {
                            Utils.safeCallbackCall(self.nodeStanzasCallbacks[id], stanza);
                        }
                        return true;
                    }

                    // an error
                }else if(type && type === 'error' && xXMLNS == "http://jabber.org/protocol/muc"){
                    /** JOIN to dialog error */
                    if(id.endsWith(":join")){
                        if(typeof self.nodeStanzasCallbacks[id] === 'function') {
                            Utils.safeCallbackCall(self.nodeStanzasCallbacks[id], stanza);
                        }
                        return true;
                    }
                }
            }
        }


        // ROSTER presences go here

        userId = self.helpers.getIdFromNode(from);

        if (!type) {
            if (typeof self.onContactListListener === 'function' && self.roster.contacts[userId] && self.roster.contacts[userId].subscription !== 'none'){
                Utils.safeCallbackCall(self.onContactListListener, userId);
            }
        } else {
            switch (type) {
                case 'subscribe':
                    if (self.roster.contacts[userId] && self.roster.contacts[userId].subscription === 'to') {
                        self.roster.contacts[userId] = {
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
                    if (self.roster.contacts[userId] && self.roster.contacts[userId].subscription === 'from') {
                        self.roster.contacts[userId] = {
                            subscription: 'both',
                            ask: null
                        };
                    } else {
                        self.roster.contacts[userId] = {
                            subscription: 'to',
                            ask: null
                        };

                        if (typeof self.onConfirmSubscribeListener === 'function'){
                            Utils.safeCallbackCall(self.onConfirmSubscribeListener, userId);
                        }
                    }
                    break;
                case 'unsubscribed':
                    self.roster.contacts[userId] = {
                        subscription: 'none',
                        ask: null
                    };

                    if (typeof self.onRejectSubscribeListener === 'function') {
                        Utils.safeCallbackCall(self.onRejectSubscribeListener, userId);
                    }

                    break;
                case 'unsubscribe':
                    self.roster.contacts[userId] = {
                        subscription: 'to',
                        ask: null
                    };

                    break;
                case 'unavailable':
                    if (typeof self.onContactListListener === 'function' && self.roster.contacts[userId] && self.roster.contacts[userId].subscription !== 'none') {
                        Utils.safeCallbackCall(self.onContactListListener, userId, type);
                    }

                    // send initial presence if one of client (instance) goes offline
                    if (userId === currentUserId) {
                        if(Utils.getEnv().browser){
                            self.connection.send($pres());
                        } else if(Utils.getEnv().node){
                            self.nClient.send(chatUtils.createStanza(NodeClient.Stanza, null,'presence'));
                        }
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

            if(self.nodeStanzasCallbacks[stanzaId]){
                Utils.safeCallbackCall(self.nodeStanzasCallbacks[stanzaId], stanza);
                delete self.nodeStanzasCallbacks[stanzaId];
            }
        }

        return true;
    };

    this._onSystemMessageListener = function(stanza) {
        var from = chatUtils.getAttr(stanza, 'from'),
            to = chatUtils.getAttr(stanza, 'to'),
            messageId = chatUtils.getAttr(stanza, 'id'),
            extraParams = chatUtils.getElement(stanza, 'extraParams'),
            userId = self.helpers.getIdFromNode(from),
            delay = chatUtils.getElement(stanza, 'delay'),
            moduleIdentifier = chatUtils.getElementText(extraParams, 'moduleIdentifier'),
            bodyContent = chatUtils.getElementText(stanza, 'body'),
            extraParamsParsed = chatUtils.parseExtraParams(extraParams),
            message;

        if (moduleIdentifier === 'SystemNotifications' && typeof self.onSystemMessageListener === 'function') {
            message = {
                id: messageId,
                userId: userId,
                body: bodyContent,
                extension: extraParamsParsed.extension
            };

            Utils.safeCallbackCall(self.onSystemMessageListener, message);
        } else if(self.webrtcSignalingProcessor && !delay && moduleIdentifier === 'WebRTCVideoChat'){
            self.webrtcSignalingProcessor._onMessage(from, extraParams, delay, userId, extraParamsParsed.extension);
        }

        /**
         * we must return true to keep the handler alive
         * returning false would remove it after it finishes
         */
        return true;
    };

    this._onMessageErrorListener = function(stanza) {
        // <error code="503" type="cancel">
        //   <service-unavailable xmlns="urn:ietf:params:xml:ns:xmpp-stanzas"/>
        //   <text xmlns="urn:ietf:params:xml:ns:xmpp-stanzas" xml:lang="en">Service not available.</text>
        // </error>

        var messageId = chatUtils.getAttr(stanza, 'id');
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

    /**
     * self.connection to the chat. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Login_to_Chat More info.}
     * @memberof QB.chat
     * @param {Object} params - Connect to the chat parameters.
     * @param {chatConnectCallback} callback - The chatConnectCallback callback.
     * */
    connect: function(params, callback) {
        /**
         * This callback Returns error or contact list.
         * @callback chatConnectCallback
         * @param {Object} error - The error object
         * @param {Object} roster - Object of subscribed users.
         * */
        Utils.QBLog('[Chat]', 'connect', params);

        var self = this,
            err, rooms;

        var userJid = chatUtils.buildUserJid(params);

        /** Connect for browser env. */
        if(Utils.getEnv().browser) {
            self.connection.connect(userJid, params.password, function(status) {
                switch (status) {
                    case Strophe.Status.ERROR:
                        err = Utils.getError(422, 'Status.ERROR - An error has occurred');
                        if (typeof callback === 'function') {
                            callback(err, null);
                        }
                        break;
                    case Strophe.Status.CONNECTING:
                        Utils.QBLog('[Chat]', 'Status.CONNECTING');
                        Utils.QBLog('[Chat]', 'Chat Protocol - ' + (config.chatProtocol.active === 1 ? 'BOSH' : 'WebSocket'));
                        break;
                    case Strophe.Status.CONNFAIL:
                        Utils.QBLog('[Chat]', 'Status.CONNFAIL');

                        err = Utils.getError(422, 'Status.CONNFAIL - The connection attempt failed');
                        if (typeof callback === 'function') {
                            callback(err, null);
                        }
                        break;
                    case Strophe.Status.AUTHENTICATING:
                        Utils.QBLog('[Chat]', 'Status.AUTHENTICATING');
                        break;
                    case Strophe.Status.AUTHFAIL:
                        Utils.QBLog('[Chat]', 'Status.AUTHFAIL');

                        err = Utils.getError(401, 'Status.AUTHFAIL - The authentication attempt failed');

                        if (typeof callback === 'function') {
                            callback(err, null);
                        }

                        if(self._isDisconnected && typeof self.onReconnectFailedListener === 'function'){
                            Utils.safeCallbackCall(self.onReconnectFailedListener, err);
                        }

                        break;
                    case Strophe.Status.CONNECTED:
                        Utils.QBLog('[Chat]', 'Status.CONNECTED at ' + chatUtils.getLocalTime());

                        // Remove any handlers that might exist from a previous connection via
                        // extension method added to the connection on initialization in qbMain.
                        // NOTE: streamManagement also adds handlers, so do this first.
                        self.connection.XDeleteHandlers();

                        if(config.streamManagement.enable && config.chatProtocol.active === 2){
                            self.streamManagement.enable(self.connection, null);
                            self.streamManagement.sentMessageCallback = self._sentMessageCallback;
                        }

                        self._isLogout = false;
                        self._isDisconnected = false;

                        self.helpers.setUserCurrentJid(self.helpers.userCurrentJid(self.connection));

                        self.connection.XAddTrackedHandler(self._onMessage, null, 'message', 'chat');
                        self.connection.XAddTrackedHandler(self._onMessage, null, 'message', 'groupchat');
                        self.connection.XAddTrackedHandler(self._onPresence, null, 'presence');
                        self.connection.XAddTrackedHandler(self._onIQ, null, 'iq');
                        self.connection.XAddTrackedHandler(self._onSystemMessageListener, null, 'message', 'headline');
                        self.connection.XAddTrackedHandler(self._onMessageErrorListener, null, 'message', 'error');

                        // enable carbons
                        self._enableCarbons();

                        // chat server will close your connection if you are not active in chat during one minute
                        // initial presence and an automatic reminder of it each 55 seconds
                        self.connection.send($pres());

                        if (typeof callback === 'function') {
                            if (params.connectWithoutGettingRoster) {
                                // connected and return nothing as result
                                callback(null, undefined);
                                // get the roster and save
                                self.roster.get(function(contacts) {
                                    self.roster.contacts = contacts;
                                });
                            } else {
                                // get the roster and save
                                self.roster.get(function(contacts) {
                                    self.roster.contacts = contacts;
                                    // connected and return roster as result
                                    callback(null, self.roster.contacts);
                                });
                            }
                        } else {
                            // recover the joined rooms
                            rooms = Object.keys(self.muc.joinedRooms);
                            Utils.QBLog('[Chat]', 'Re-joining ' + rooms.length + " rooms..");
                            for (var i = 0, len = rooms.length; i < len; i++) {
                                self.muc.join(rooms[i]);
                            }

                            // fire 'onReconnectListener'
                            if (typeof self.onReconnectListener === 'function'){
                                Utils.safeCallbackCall(self.onReconnectListener);
                            }
                        }

                        break;
                    case Strophe.Status.DISCONNECTING:
                        Utils.QBLog('[Chat]', 'Status.DISCONNECTING');
                        break;
                    case Strophe.Status.DISCONNECTED:
                        Utils.QBLog('[Chat]', 'Status.DISCONNECTED at ' + chatUtils.getLocalTime());

                        self.connection.reset();

                        // fire 'onDisconnectedListener' only once
                        if (!self._isDisconnected && typeof self.onDisconnectedListener === 'function'){
                            Utils.safeCallbackCall(self.onDisconnectedListener);
                        }

                        self._isDisconnected = true;

                        // reconnect to chat
                        if (!self._isLogout) {
                            self.connect(params);
                        }

                        break;
                    case Strophe.Status.ATTACHED:
                        Utils.QBLog('[Chat]', 'Status.ATTACHED');
                        break;
                }
            });
        }

        /** connect for node */
        if(Utils.getEnv().node) {
            self.nClient.options.jid = userJid;
            self.nClient.options.password = params.password;

            /** HANDLERS */
            self.nClient.on('auth', function () {
                Utils.QBLog('[Chat]', 'Status.CONNECTED at ' + chatUtils.getLocalTime());
            });

            self.nClient.on('online', function () {
                Utils.QBLog('[Chat]', 'Status.CONNECTED at ' + chatUtils.getLocalTime());

                if(config.streamManagement.enable){
                    self.streamManagement.enable(self.nClient, NodeClient);
                    self.streamManagement.sentMessageCallback = self._sentMessageCallback;
                }

                self._isDisconnected = false;
                self._isLogout = false;

                self.helpers.setUserCurrentJid(self.helpers.userCurrentJid(self.nClient));

                /** Send first presence if user is online */
                var presence = chatUtils.createStanza(NodeClient.Stanza, null,'presence');
                self.nClient.send(presence);

                if (typeof callback === 'function') {
                    callback(null, true);
                }
            });

            self.nClient.on('connect', function () {
                Utils.QBLog('[Chat] client is connected');
                self._enableCarbons();
            });

            self.nClient.on('reconnect', function () {
                Utils.QBLog('[Chat] client is reconnected');

                self._isDisconnected = true;
                self._isLogout = true;
            });

            self.nClient.on('disconnect', function () {
                Utils.QBLog('[Chat] client is disconnected');


                // fire 'onDisconnectedListener' only once
                if (!self._isDisconnected && typeof self.onDisconnectedListener === 'function'){
                    Utils.safeCallbackCall(self.onDisconnectedListener);
                }

                self._isLogout = true;
                self._isDisconnected = true;
            });

            self.nClient.on('stanza', function (stanza) {
                Utils.QBLog('[QBChat] RECV:', stanza.toString());

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
                    }else if(stanza.attrs.type === 'error') {
                        self._onMessageErrorListener(stanza);
                    } else {
                        self._onMessage(stanza);
                    }
                }
            });

            self.nClient.on('offline', function () {
                Utils.QBLog('[QBChat] client goes offline');

                self._isDisconnected = true;
                self._isLogout = true;
            });

            self.nClient.on('error', function (e) {
                Utils.QBLog('[QBChat] client got error', e);

                self._isDisconnected = true;
                self._isLogout = true;

                err = Utils.getError(422, 'Status.ERROR - An error has occurred');

                if(typeof callback === 'function') {
                    callback(err, null);
                }
            });

            self.nClient.connect();
        }
    },

    /**
     * Send message to 1 to 1 or group dialog. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Chat_in_dialog More info.}
     * @memberof QB.chat
     * @param {String | Number} jid_or_user_id - Use opponent id for 1 to 1 chat, and jid for group chat.
     * @param {Object} message - The message object.
     * @returns {String} messageId
     * */
    send: function(jid_or_user_id, message) {
        var self = this,
            builder = Utils.getEnv().browser ? $msg : NodeClient.Stanza;

        var paramsCreateMsg = {
            from: self.helpers.getUserCurrentJid(),
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

        if (message.extension) {
            stanza.c('extraParams', {
                xmlns: chatUtils.MARKERS.CLIENT
            });

            stanza = chatUtils.filledExtraParams(stanza, message.extension);
        }

        if(Utils.getEnv().browser) {
            if(config.streamManagement.enable){
                message.id = paramsCreateMsg.id;
                message.jid_or_user_id = jid_or_user_id;
                self.connection.send(stanza, message);
            } else {
                self.connection.send(stanza);
            }
        } else if (Utils.getEnv().node) {
            if(config.streamManagement.enable){
                message.id = paramsCreateMsg.id;
                message.jid_or_user_id = jid_or_user_id;
                self.nClient.send(stanza, message);
            } else {
                self.nClient.send(stanza);
            }

        }

        return paramsCreateMsg.id;
    },

    /**
     * Send system message (system notification) to 1 to 1 or group dialog. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#System_notifications More info.}
     * @memberof QB.chat
     * @param {String | Number} jid_or_user_id - Use opponent id for 1 to 1 chat, and jid for group chat.
     * @param {Object} message - The message object.
     * @returns {String} messageId
     * */
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

            self.connection.send(stanza);
        }

        if(Utils.getEnv().node) {
            if (message.extension) {
                stanza.c('extraParams',  {
                    xmlns: chatUtils.MARKERS.CLIENT
                }).c('moduleIdentifier').t('SystemNotifications');

                stanza = chatUtils.filledExtraParams(stanza, message.extension);
            }

            self.nClient.send(stanza);
        }

        return paramsCreateMsg.id;
    },

    /**
     * Send is typing status. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Typing_status More info.}
     * @memberof QB.chat
     * @param {String | Number} jid_or_user_id - Use opponent id for 1 to 1 chat, and jid for group chat.
     * */
    sendIsTypingStatus: function(jid_or_user_id) {
        var self = this,
            stanzaParams = {
                from: self.helpers.getUserCurrentJid(),
                to: this.helpers.jidOrUserId(jid_or_user_id),
                type: this.helpers.typeChat(jid_or_user_id)
            },
            builder = Utils.getEnv().browser ? $msg : NodeClient.Stanza;

        var stanza = chatUtils.createStanza(builder, stanzaParams);

        stanza.c('composing', {
            xmlns: chatUtils.MARKERS.STATES
        });

        if(Utils.getEnv().browser){
            self.connection.send(stanza);
        } else if(Utils.getEnv().node) {
            self.nClient.send(stanza);
        }
    },

    /**
     * Send is stop typing status. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Typing_status More info.}
     * @memberof QB.chat
     * @param {String | Number} jid_or_user_id - Use opponent id for 1 to 1 chat, and jid for group chat.
     * */
    sendIsStopTypingStatus: function(jid_or_user_id) {
        var self = this,
            stanzaParams = {
                from: self.helpers.getUserCurrentJid(),
                to: this.helpers.jidOrUserId(jid_or_user_id),
                type: this.helpers.typeChat(jid_or_user_id)
            },
            builder = Utils.getEnv().browser ? $msg : NodeClient.Stanza;

        var stanza = chatUtils.createStanza(builder, stanzaParams);

        stanza.c('paused', {
            xmlns: chatUtils.MARKERS.STATES
        });

        if(Utils.getEnv().browser){
            self.connection.send(stanza);
        } else if(Utils.getEnv().node) {
            self.nClient.send(stanza);
        }
    },

    /**
     * Send is delivered status. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Delivered_status More info.}
     * @memberof QB.chats
     * @param {Object} params - Object of parameters. Consist of messageId, userId and dialogId keys.
     * */
    sendDeliveredStatus: function(params) {
        var self = this,
            stanzaParams = {
                type: 'chat',
                from: self.helpers.getUserCurrentJid(),
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
            self.connection.send(stanza);
        } else if(Utils.getEnv().node) {
            self.nClient.send(stanza);
        }
    },

    /**
     * Send is read status. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Read_status More info.}
     * @memberof QB.chat
     * @param {Object} params - Object of parameters. Consist of messageId, userId and dialogId keys.
     * */
    sendReadStatus: function(params) {
        var self = this,
            stanzaParams = {
                type: 'chat',
                from: self.helpers.getUserCurrentJid(),
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
            self.connection.send(stanza);
        } else if(Utils.getEnv().node){
            self.nClient.send(stanza);
        }
    },

    /**
     * Logout from the Chat. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Logout_from_Chat More info.}
     * @memberof QB.chat
     * */
    disconnect: function() {
        this.muc.joinedRooms = {};
        this._isLogout = true;
        this.helpers.setUserCurrentJid('');

        if(Utils.getEnv().browser) {
            this.connection.flush();
            this.connection.disconnect();
        } else if(Utils.getEnv().node) {
            this.nClient.end();
        }
    },

    addListener: function(params, callback) {
        Utils.QBLog('[Deprecated!]', 'Avoid using it, this feature will be removed in future version.');

        if(Utils.getEnv().node) {
            throw new Error(unsupportedError);
        }

        return this.connection.XAddTrackedHandler(handler, null, params.name || null, params.type || null, params.id || null, params.from || null);

        function handler() {
            callback();
            // if 'false' - a handler will be performed only once
            return params.live !== false;
        }
    },
    deleteListener: function(ref) {
        Utils.QBLog('[Deprecated!]', 'Avoid using it, this feature will be removed in future version.');

        if(Utils.getEnv().node) {
            throw new Error(unsupportedError);
        }

        this.connection.deleteHandler(ref);
    },
    /**
     * Carbons XEP [http://xmpp.org/extensions/xep-0280.html]
     */
    _enableCarbons: function(cb) {
        var self = this,
            carbonParams = {
                type: 'set',
                from: self.helpers.getUserCurrentJid(),
                id: chatUtils.getUniqueId('enableCarbons')
            },
            builder = Utils.getEnv().browser ? $iq : NodeClient.Stanza;

        var iq = chatUtils.createStanza(builder, carbonParams, 'iq');

        iq.c('enable', {
            xmlns: chatUtils.MARKERS.CARBONS
        });

        if(Utils.getEnv().browser) {
            self.connection.sendIQ(iq);
        } else if(Utils.getEnv().node) {
            self.nClient.send(iq);
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
/**
 * @namespace QB.chat.roster
 **/
function RosterProxy(options) {
    this.service = options.service;
    this.helpers = options.helpers;
    this.connection = options.stropheClient;
    this.nClient = options.nodeClient;
    this.nodeStanzasCallbacks = options.nodeStanzasCallbacks;
    //
    this.contacts = {};
}

RosterProxy.prototype = {

    /**
     * Receive contact list. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Contact_List More info.}
     * @memberof QB.chat.roster
     * @param {getRosterCallback} callback - The callback function.
     * */
    get: function(callback) {
        /**
         * This callback Return contact list.
         * @callback getRosterCallback
         * @param {Object} roster - Object of subscribed users.
         * */

        var self = this,
            items, userId, contacts = {},
            iqParams = {
                'type': 'get',
                'from': self.helpers.getUserCurrentJid(),
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
            self.connection.sendIQ(iq, _callbackWrap);
        } else if(Utils.getEnv().node){
            self.nodeStanzasCallbacks[iqParams.id] = _callbackWrap;
            self.nClient.send(iq);
        }
    },

    /**
     * Add users to contact list. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Add_users More info.}
     * @memberof QB.chat.roster
     * @param {String | Number} jidOrUserId - Use opponent id for 1 to 1 chat, and jid for group chat.
     * @param {addRosterCallback} callback - The callback function.
     * */
    add: function(jidOrUserId, callback) {

        /**
         * Callback for QB.chat.roster.add(). Run without parameters.
         * @callback addRosterCallback
         * */
        var self = this;
        var userJid = this.helpers.jidOrUserId(jidOrUserId);
        var userId = this.helpers.getIdFromNode(userJid).toString();

        self.contacts[userId] = {
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

    /**
     * Confirm subscription with some user. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Confirm_subscription_request More info.}
     * @memberof QB.chat.roster
     * @param {String | Number} jidOrUserId - Use opponent id for 1 to 1 chat, and jid for group chat.
     * @param {confirmRosterCallback} callback - The callback function.
     * */
    confirm: function(jidOrUserId, callback) {

        /**
         * Callback for QB.chat.roster.confirm(). Run without parameters.
         * @callback confirmRosterCallback
         * */
        var self = this;
        var userJid = this.helpers.jidOrUserId(jidOrUserId);
        var userId = this.helpers.getIdFromNode(userJid).toString();

        self.contacts[userId] = {
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

    /**
     * Reject subscription with some user. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Reject_subscription_request More info.}
     * @memberof QB.chat.roster
     * @param {String | Number} jidOrUserId - Use opponent id for 1 to 1 chat, and jid for group chat.
     * @param {rejectRosterCallback} callback - The callback function.
     * */
    reject: function(jidOrUserId, callback) {

        /**
         * Callback for QB.chat.roster.reject(). Run without parameters.
         * @callback rejectRosterCallback
         * */
        var self = this;
        var userJid = this.helpers.jidOrUserId(jidOrUserId);
        var userId = this.helpers.getIdFromNode(userJid).toString();

        self.contacts[userId] = {
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


    /**
     * Remove subscription with some user from your contact list. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Remove_users More info.}
     * @memberof QB.chat.roster
     * @param {String | Number} jidOrUserId - Use opponent id for 1 to 1 chat, and jid for group chat.
     * @param {removeRosterCallback} callback - The callback function.
     * */
    remove: function(jidOrUserId, callback) {

        /**
         * Callback for QB.chat.roster.remove(). Run without parameters.
         * @callback removeRosterCallback
         * */
        var self = this,
            userJid = this.helpers.jidOrUserId(jidOrUserId),
            userId = this.helpers.getIdFromNode(userJid);

        var iqParams = {
            'type': 'set',
            'from': self.connection ? self.connection.jid : self.nClient.jid.user,
            'id': chatUtils.getUniqueId('getRoster')
        };

        var builder = Utils.getEnv().browser ? $iq : NodeClient.Stanza,
            iq = chatUtils.createStanza(builder, iqParams, 'iq');

        function _callbackWrap() {
            delete self.contacts[userId];

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
            self.connection.sendIQ(iq, _callbackWrap);

        } else if(Utils.getEnv().node) {
            self.nodeStanzasCallbacks[iqParams.id] = _callbackWrap;
            self.nClient.send(iq);
        }
    },
    _sendSubscriptionPresence: function(params) {
        var builder = Utils.getEnv().browser ? $pres : NodeClient.Stanza,
            presParams = {
                to: params.jid,
                type: params.type
            };

        var pres = chatUtils.createStanza(builder, presParams, 'presence');

        if(Utils.getEnv().browser){
            this.connection.send(pres);
        } else if (Utils.getEnv().node) {
            this.nClient.send(pres);
        }
    }
};

/* Chat module: Group Chat (Dialog)
 *
 * Multi-User Chat
 * http://xmpp.org/extensions/xep-0045.html
 *
 ----------------------------------------------------------------------------- */

/**
 * @namespace QB.chat.muc
 * */
function MucProxy(options) {
    this.service = options.service;
    this.helpers = options.helpers;
    this.connection = options.stropheClient;
    this.nClient = options.nodeClient;
    this.nodeStanzasCallbacks = options.nodeStanzasCallbacks;
    //
    this.joinedRooms = {};
}

MucProxy.prototype = {

    /**
     * Join to the group dialog. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Chat_in_group_dialog More info.}
     * @memberof QB.chat.muc
     * @param {String} dialogJid - Use dialog jid to join to this dialog.
     * @param {joinMacCallback} callback - The callback function.
     * */
    join: function(dialogJid, callback) {
        /**
         * Callback for QB.chat.muc.join().
         * @param {Object} resultStanza - Returns the stanza.
         * @callback joinMacCallback
         * */

        var self = this,
            id = chatUtils.getUniqueId('join');

        var presParams = {
                id: id,
                from: self.helpers.getUserCurrentJid(),
                to: self.helpers.getRoomJid(dialogJid)
            },
            builder = Utils.getEnv().browser ? $pres : NodeClient.Stanza;

        var pres = chatUtils.createStanza(builder, presParams, 'presence');

        pres.c('x', {
            xmlns: chatUtils.MARKERS.MUC
        }).c('history', { maxstanzas: 0 });

        this.joinedRooms[dialogJid] = true;

        if (Utils.getEnv().browser) {
            if (typeof callback === 'function') {
                self.connection.XAddTrackedHandler(callback, null, 'presence', null, id);
            }

            self.connection.send(pres);
        } else if(Utils.getEnv().node){
            if (typeof callback === 'function') {
                self.nodeStanzasCallbacks[id] = callback;
            }

            self.nClient.send(pres);
        }
    },

    /**
     * Leave group chat dialog. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Chat_in_group_dialog More info.}
     * @memberof QB.chat.muc
     * @param {String} dialogJid - Use dialog jid to join to this dialog.
     * @param {leaveMacCallback} callback - The callback function.
     * */
    leave: function(jid, callback) {
        /**
         * Callback for QB.chat.muc.leave().
         * run without parameters;
         * @callback leaveMacCallback
         * */

        var self = this,
            presParams = {
                type: 'unavailable',
                from: self.helpers.getUserCurrentJid(),
                to: self.helpers.getRoomJid(jid)
            },
            builder = Utils.getEnv().browser ? $pres : NodeClient.Stanza;

        var pres = chatUtils.createStanza(builder, presParams, 'presence');

        delete this.joinedRooms[jid];

        if (Utils.getEnv().browser) {
            var roomJid = self.helpers.getRoomJid(jid);

            if (typeof callback === 'function') {
                self.connection.XAddTrackedHandler(callback, null, 'presence', presParams.type, null, roomJid);
            }

            self.connection.send(pres);
        } else if(Utils.getEnv().node) {
            /** The answer don't contain id */
            if(typeof callback === 'function') {
                self.nodeStanzasCallbacks['muc:leave'] = callback;
            }

            self.nClient.send(pres);
        }
    },

    /**
     * Leave group chat dialog. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Chat_in_group_dialog More info.}
     * @memberof QB.chat.muc
     * @param {String} dialogJid - Use dialog jid to join to this dialog.
     * @param {listOnlineUsersMacCallback} callback - The callback function.
     * */
    listOnlineUsers: function(dialogJID, callback) {
        /**
         * Callback for QB.chat.muc.leave().
         * @param {Object} Users - list of online users
         * @callback listOnlineUsersMacCallback
         * */

        var self = this,
            onlineUsers = [];

        var iqParams = {
                type: 'get',
                to: dialogJID,
                from: self.helpers.getUserCurrentJid(),
                id: chatUtils.getUniqueId('muc_disco_items'),
            },
            builder = Utils.getEnv().browser ? $iq : NodeClient.Stanza;
        var iq = chatUtils.createStanza(builder, iqParams, 'iq');
        iq.c('query', {
            xmlns: 'http://jabber.org/protocol/disco#items'
        });

        function _getUsers(stanza) {
            var stanzaId = stanza.attrs.id;

            if(self.nodeStanzasCallbacks[stanzaId]) {
                var users = [],
                    items = stanza.getChild('query').getChildElements('item'),
                    userId;

                for(var i = 0, len = items.length; i < len; i++) {
                    userId = self.helpers.getUserIdFromRoomJid(items[i].attrs.jid);
                    users.push(parseInt(userId));
                }

                callback(users);
            }
        }

        if (Utils.getEnv().browser) {
            self.connection.sendIQ(iq, function(stanza) {
                var items = stanza.getElementsByTagName('item'),
                    userId;

                for (var i = 0, len = items.length; i < len; i++) {
                    userId = self.helpers.getUserIdFromRoomJid(items[i].getAttribute('jid'));
                    onlineUsers.push(parseInt(userId));
                }

                callback(onlineUsers);
            });
        } else if(Utils.getEnv().node) {
            self.nClient.send(iq);

            self.nodeStanzasCallbacks[iqParams.id] = _getUsers;
        }
    }
};

/* Chat module: Privacy list
 *
 * Privacy list
 * http://xmpp.org/extensions/xep-0016.html
 * by default 'mutualBlock' is work in one side
----------------------------------------------------------------------------- */
function PrivacyListProxy(options) {
    this.service = options.service;
    this.helpers = options.helpers;
    this.connection = options.stropheClient;
    this.nClient = options.nodeClient;
    this.nodeStanzasCallbacks = options.nodeStanzasCallbacks;
}

/**
 * @namespace QB.chat.privacylist
 **/
PrivacyListProxy.prototype = {
    /**
     * Create a privacy list. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Create_a_privacy_list_or_edit_existing_list More info.}
     * @memberof QB.chat.privacylist
     * @param {Object} list - privacy list object.
     * @param {createPrivacylistCallback} callback - The callback function.
     * */
    create: function(list, callback) {
        /**
         * Callback for QB.chat.privacylist.create().
         * @param {Object} error - The error object
         * @callback createPrivacylistCallback
         * */
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
                from: self.helpers.getUserCurrentJid(),
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

        for (var index = 0, j = 0, len = listUserId.length; index < len; index++, j = j + 2) {
            userId = listUserId[index];
            mutualBlock = listPrivacy[userId].mutualBlock;

            userAction = listPrivacy[userId].action;
            userJid = self.helpers.jidOrUserId(parseInt(userId, 10));
            userMuc = self.helpers.getUserNickWithMucDomain(userId);

            if(mutualBlock && userAction === 'deny'){
                iq = createPrivacyItemMutal(iq, {
                    order: j+1,
                    jidOrMuc: userJid,
                    userAction: userAction
                });
                iq = createPrivacyItemMutal(iq, {
                    order: j+2,
                    jidOrMuc: userMuc,
                    userAction: userAction
                }).up().up();
            } else {
                iq = createPrivacyItem(iq, {
                    order: j+1,
                    jidOrMuc: userJid,
                    userAction: userAction
                });
                iq = createPrivacyItem(iq, {
                    order: j+2,
                    jidOrMuc: userMuc,
                    userAction: userAction
                });
            }
        }

        if(Utils.getEnv().browser) {
            self.connection.sendIQ(iq, function(stanzaResult) {
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
            self.nClient.send(iq);

            self.nodeStanzasCallbacks[iqParams.id] = function (stanza) {
                if(!stanza.getChildElements('error').length){
                    callback(null);
                } else {
                    callback(Utils.getError(408));
                }
            };
        }
    },

    /**
     * Get the privacy list. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Retrieve_a_privacy_list More info.}
     * @memberof QB.chat.privacylist
     * @param {String} name - The name of the list.
     * @param {getListPrivacylistCallback} callback - The callback function.
     * */
    getList: function(name, callback) {
        /**
         * Callback for QB.chat.privacylist.getList().
         * @param {Object} error - The error object
         * @param {Object} response - The privacy list object
         * @callback getListPrivacylistCallback
         * */

        var self = this,
            items, userJid, userId,
            usersList = [], list = {};

        var iqParams = {
                type: 'get',
                from: self.helpers.getUserCurrentJid(),
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
            self.connection.sendIQ(iq, function(stanzaResult) {
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
            self.nodeStanzasCallbacks[iqParams.id] = function(stanza){
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
                delete self.nodeStanzasCallbacks[iqParams.id];
            };

            self.nClient.send(iq);
        }
    },

    /**
     * Update the privacy list.
     * @memberof QB.chat.privacylist
     * @param {String} name - The name of the list.
     * @param {updatePrivacylistCallback} callback - The callback function.
     * */
    update: function(listWithUpdates, callback) {
        /**
         * Callback for QB.chat.privacylist.update().
         * @param {Object} error - The error object
         * @param {Object} response - The privacy list object
         * @callback updatePrivacylistCallback
         * */

        var self = this;

        self.getList(listWithUpdates.name, function(error, existentList) {
            if (error) {
                callback(error, null);
            } else {
                var updatedList = {};
                updatedList.items = Utils.MergeArrayOfObjects(existentList.items, listWithUpdates.items);
                updatedList.name = listWithUpdates.name;

                self.create(updatedList, function(err, result) {
                    if (error) {
                        callback(err, null);
                    }else{
                        callback(null, result);
                    }
                });
            }
        });
    },

    /**
     * Get names of privacy lists. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Retrieve_privacy_lists_names More info.}
     * Run without parameters
     * @memberof QB.chat.privacylist
     * @param {getNamesPrivacylistCallback} callback - The callback function.
     * */
    getNames: function(callback) {
        /**
         * Callback for QB.chat.privacylist.getNames().
         * @param {Object} error - The error object
         * @param {Object} response - The privacy list object (var names = response.names;)
         * @callback getNamesPrivacylistCallback
         * */

        var self = this,
            iq,
            stanzaParams = {
                'type': 'get',
                'from': self.helpers.getUserCurrentJid(),
                'id': chatUtils.getUniqueId('getNames')
            };

        if(Utils.getEnv().browser){
            iq = $iq(stanzaParams).c('query', {
                xmlns: Strophe.NS.PRIVACY_LIST
            });

            self.connection.sendIQ(iq, function(stanzaResult) {
                var allNames = [], namesList = {},
                    defaultList = stanzaResult.getElementsByTagName('default'),
                    activeList = stanzaResult.getElementsByTagName('active'),
                    allLists = stanzaResult.getElementsByTagName('list');

                var defaultName = defaultList && defaultList.length > 0 ? defaultList[0].getAttribute('name') : null;
                var activeName = activeList && activeList.length > 0 ? activeList[0].getAttribute('name') : null;

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
                xmlns: chatUtils.MARKERS.PRIVACY
            });

            self.nodeStanzasCallbacks[iq.attrs.id] = function(stanza){
                if(stanza.attrs.type !== 'error'){

                    var allNames = [], namesList = {},
                        query = stanza.getChild('query'),
                        defaultList = query.getChild('default'),
                        activeList = query.getChild('active'),
                        allLists = query.getChildElements('list');

                    var defaultName = defaultList ? defaultList.attrs.name : null,
                        activeName = activeList ? activeList.attrs.name : null;

                    for (var i = 0, len = allLists.length; i < len; i++) {
                        allNames.push(allLists[i].attrs.name);
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

            self.nClient.send(iq);
        }
    },

    /**
     * Delete privacy list. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Delete_existing_privacy_list More info.}
     * @param {String} name - The name of privacy list.
     * @memberof QB.chat.privacylist
     * @param {deletePrivacylistCallback} callback - The callback function.
     * */
    delete: function(name, callback) {
        /**
         * Callback for QB.chat.privacylist.delete().
         * @param {Object} error - The error object
         * @callback deletePrivacylistCallback
         * */

        var iq,
            stanzaParams = {
                'from': this.connection ? this.connection.jid : this.nClient.jid.user,
                'type': 'set',
                'id': chatUtils.getUniqueId('remove')
            };

        if(Utils.getEnv().browser){
            iq = $iq(stanzaParams).c('query', {
                xmlns: Strophe.NS.PRIVACY_LIST
            }).c('list', {
                name: name ? name : ''
            });

            this.connection.sendIQ(iq, function(stanzaResult) {
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
                xmlns: chatUtils.MARKERS.PRIVACY
            }).c('list', {
                name: name ? name : ''
            });

            this.nodeStanzasCallbacks[stanzaParams.id] = function(stanza){
                if(!stanza.getChildElements('error').length){
                    callback(null);
                } else {
                    callback(Utils.getError(408));
                }
            };

            this.nClient.send(iq);
        }

    },

    /**
     * Set as default privacy list. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Activate_a_privacy_list More info.}
     * @param {String} name - The name of privacy list.
     * @memberof QB.chat.privacylist
     * @param {setAsDefaultPrivacylistCallback} callback - The callback function.
     * */
    setAsDefault: function(name, callback) {
        /**
         * Callback for QB.chat.privacylist.setAsDefault().
         * @param {Object} error - The error object
         * @callback setAsDefaultPrivacylistCallback
         * */

        var iq,
            stanzaParams = {
                'from': this.connection ? this.connection.jid : this.nClient.jid.user,
                'type': 'set',
                'id': chatUtils.getUniqueId('default')
            };

        if(Utils.getEnv().browser){
            iq = $iq(stanzaParams).c('query', {
                xmlns: Strophe.NS.PRIVACY_LIST
            }).c('default', name && name.length > 0 ? {name: name} : {});

            this.connection.sendIQ(iq, function(stanzaResult) {
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
                xmlns: chatUtils.MARKERS.PRIVACY
            }).c('default', name && name.length > 0 ? {name: name} : {});

            this.nodeStanzasCallbacks[stanzaParams.id] = function(stanza){
                if(!stanza.getChildElements('error').length){
                    callback(null);
                } else {
                    callback(Utils.getError(408));
                }
            };
            this.nClient.send(iq);
        }
    },

    /**
     * @deprecated Only QB.chat.privacylist.setAsDefault() will be used since version 2.8.0.
     * Set as active privacy list. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Activate_a_privacy_list More info.}
     * @param {String} name - The name of privacy list.
     * @memberof QB.chat.privacylist
     * @param {setAsActivePrivacylistCallback} callback - The callback function.
     * */
    setAsActive: function(name, callback) {
        /**
         * Callback for QB.chat.privacylist.setAsActive().
         * @param {Object} error - The error object
         * @callback setAsActivePrivacylistCallback
         * */

        var iq,
            stanzaParams = {
                'from': this.connection ? this.connection.jid : this.nClient.jid.user,
                'type': 'set',
                'id': chatUtils.getUniqueId('active')
            };

        Utils.QBLog('Deprecated!', 'QB.chat.privacylist.setAsActive() will be deprecated since version 2.8.0');

        if(Utils.getEnv().browser){
            iq = $iq(stanzaParams).c('query', {
                xmlns: Strophe.NS.PRIVACY_LIST
            }).c('active', name && name.length > 0 ? {name: name} : {});

            this.connection.sendIQ(iq, function(stanzaResult) {
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
                xmlns: chatUtils.MARKERS.PRIVACY
            }).c('active', name && name.length > 0 ? {name: name} : {});

            this.nodeStanzasCallbacks[stanzaParams.id] = function(stanza){
                if(!stanza.getChildElements('error').length){
                    callback(null);
                } else {
                    callback(Utils.getError(408));
                }
            };

            this.nClient.send(iq);
        }
    }
};

/*
 * DialogProxy
 */
function DialogProxy(options) {
    this.service = options.service;
    this.helpers = options.helpers;
}

/**
 * @namespace QB.chat.dialog
 **/
DialogProxy.prototype = {
    /**
     * Retrieve list of dialogs. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Retrieve_list_of_dialogs More info.}
     * @memberof QB.chat.dialog
     * @param {Object} params - Some filters to get only chat dialogs you need.
     * @param {listDialogCallback} callback - The callback function.
     * */
    list: function(params, callback) {
        /**
         * Callback for QB.chat.dialog.list().
         * @param {Object} error - The error object
         * @param {Object} resDialogs - the dialog list
         * @callback listDialogCallback
         * */

        if (typeof params === 'function' && typeof callback === 'undefined') {
            callback = params;
            params = {};
        }

        this.service.ajax({
            url: Utils.getUrl(DIALOGS_API_URL),
            data: params
        }, callback);
    },

    /**
     * Create new dialog. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Create_new_dialog More info.}
     * @memberof QB.chat.dialog
     * @param {Object} params - Object of parameters.
     * @param {createDialogCallback} callback - The callback function.
     * */
    create: function(params, callback) {
        /**
         * Callback for QB.chat.dialog.create().
         * @param {Object} error - The error object
         * @param {Object} createdDialog - the dialog object
         * @callback createDialogCallback
         * */

        if (params.occupants_ids instanceof Array) {
            params.occupants_ids = params.occupants_ids.join(', ');
        }

        this.service.ajax({
            url: Utils.getUrl(DIALOGS_API_URL),
            type: 'POST',
            data: params
        }, callback);
    },

    /**
     * Update group dialog. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Update_group_dialog More info.}
     * @memberof QB.chat.dialog
     * @param {String} id - The dialog ID.
     * @param {Object} params - Object of parameters.
     * @param {updateDialogCallback} callback - The callback function.
     * */
    update: function(id, params, callback) {
        /**
         * Callback for QB.chat.dialog.update()
         * @param {Object} error - The error object
         * @param {Object} res - the dialog object
         * @callback updateDialogCallback
         * */

        this.service.ajax({
            url: Utils.getUrl(DIALOGS_API_URL, id),
            type: 'PUT',
            data: params
        }, callback);
    },

    /**
     * Delete a dialog or dialogs. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Delete_dialog More info.}
     * @memberof QB.chat.dialog
     * @param {Array} id - The dialog IDs array.
     * @param {Object | function} params_or_callback - Object of parameters or callback function.
     * @param {deleteDialogCallback} callback - The callback function.
     * */
    delete: function(id, params_or_callback, callback) {
        /**
         * Callback for QB.chat.dialog.delete()
         * @param {Object} error - The error object
         * @callback deleteDialogCallback
         * */

        var ajaxParams = {
            url: Utils.getUrl(DIALOGS_API_URL, id),
            type: 'DELETE',
            dataType: 'text'
        };

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
function MessageProxy(options) {
    this.service = options.service;
    this.helpers = options.helpers;
}

/**
 * @namespace QB.chat.message
 **/
MessageProxy.prototype = {
    /**
     * get a chat history. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#List_chat_messages More info.}
     * @memberof QB.chat.message
     * @param {Object} params - Object of parameters.
     * @param {listMessageCallback} callback - The callback function.
     * */
    list: function(params, callback) {
        /**
         * Callback for QB.chat.message.list()
         * @param {Object} error - The error object
         * @param {Object} messages - The messages object.
         * @callback listMessageCallback
         * */

        this.service.ajax({
            url: Utils.getUrl(MESSAGES_API_URL),
            data: params
        }, callback);
    },

    /**
     * Create message. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Put_chat_messages_to_history More info.}
     * @memberof QB.chat.message
     * @param {Object} params - Object of parameters.
     * @param {createMessageCallback} callback - The callback function.
     * */
    create: function(params, callback) {
        /**
         * Callback for QB.chat.message.create()
         * @param {Object} error - The error object
         * @param {Object} messages - The message object.
         * @callback createMessageCallback
         * */

        this.service.ajax({
            url: Utils.getUrl(MESSAGES_API_URL),
            type: 'POST',
            data: params
        }, callback);
    },

    /**
     * Update message. {@link http://quickblox.com/developers/Chat#Update_message More info.}
     * @memberof QB.chat.message
     * @param {String} id - The message id.
     * @param {Object} params - Object of parameters. You can set change read, delivered or message parameter.
     * @param {updateMessageCallback} callback - The callback function.
     * */
    update: function(id, params, callback) {
        /**
         * Callback for QB.chat.message.update()
         * @param {Object} error - The error object
         * @param {Object} messages - The message object.
         * @callback updateMessageCallback
         * */

        var attrAjax = {
            'type': 'PUT',
            'dataType': 'text',
            'url': Utils.getUrl(MESSAGES_API_URL, id),
            'data': params
        };

        this.service.ajax(attrAjax, callback);
    },

    /**
     * Delete message. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Delete_chat_messages More info.}
     * @memberof QB.chat.message
     * @param {String} id - The message id.
     * @param {Object} params - Object of parameters.
     * @param {deleteMessageCallback} callback - The callback function.
     * */
    delete: function(id, params_or_callback, callback) {
        /**
         * Callback for QB.chat.message.delete()
         * @param {Object} error - The error object.
         * @param {String} res - Empty string.
         * @callback deleteMessageCallback
         * */

        var ajaxParams = {
            url: Utils.getUrl(MESSAGES_API_URL, id),
            type: 'DELETE',
            dataType: 'text'
        };

        if (arguments.length == 2) {
            this.service.ajax(ajaxParams, params_or_callback);
        } else if (arguments.length == 3) {
            ajaxParams.data = params_or_callback;

            this.service.ajax(ajaxParams, callback);
        }
    },

    /**
     * Get unread messages counter for one or group of dialogs. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Unread_messages_count More info.}
     * @memberof QB.chat.message
     * @param {Object} params - Object of parameters.
     * @param {unreadCountMessageCallback} callback - The callback function.
     * */
    unreadCount: function(params, callback) {
        /**
         * Callback for QB.chat.message.unreadCount()
         * @param {Object} error - The error object.
         * @param {Object} res - The requested dialogs Object.
         * @callback unreadCountMessageCallback
         * */

        this.service.ajax({
            url: Utils.getUrl(MESSAGES_API_URL + '/unread'),
            data: params
        }, callback);
    }
};


/* Helpers
 ----------------------------------------------------------------------------- */
function Helpers() {
    this._userCurrentJid = '';
}
/**
 * @namespace QB.chat.helpers
 * */
Helpers.prototype = {

    /**
     * Get unique id.
     * @memberof QB.chat.helpers
     * @param {String | Number} suffix - not required parameter.
     * @returns {String} - UniqueId.
     * */
    getUniqueId: chatUtils.getUniqueId,

    /**
     * Get unique id.
     * @memberof QB.chat.helpers
     * @param {String | Number} jid_or_user_id - Jid or user id.
     * @returns {String} - jid.
     * */
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

    /**
     * Get the chat type.
     * @memberof QB.chat.helpers
     * @param {String | Number} jid_or_user_id - Jid or user id.
     * @returns {String} - jid.
     * */
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

    /**
     * Get the recipint id.
     * @memberof QB.chat.helpers
     * @param {Array} occupantsIds - Array of user ids.
     * @param {Number} UserId - Jid or user id.
     * @returns {Number} recipient - recipient id.
     * */
    getRecipientId: function(occupantsIds, UserId) {
        var recipient = null;
        occupantsIds.forEach(function(item) {
            if(item != UserId){
                recipient = item;
            }
        });
        return recipient;
    },

    /**
     * Get the User jid id.
     * @memberof QB.chat.helpers
     * @param {Number} UserId - The user id.
     * @param {Number} appId - The application id.
     * @returns {String} jid - The user jid.
     * */
    getUserJid: function(userId, appId) {
        if(!appId){
            return userId + '-' + config.creds.appId + '@' + config.endpoints.chat;
        }
        return userId + '-' + appId + '@' + config.endpoints.chat;
    },

    /**
     * Get the User nick with the muc domain.
     * @memberof QB.chat.helpers
     * @param {Number} UserId - The user id.
     * @returns {String} mucDomainWithNick - The mac domain with he nick.
     * */
    getUserNickWithMucDomain: function(userId) {
        return config.endpoints.muc + '/' + userId;
    },

    /**
     * Get the User id from jid.
     * @memberof QB.chat.helpers
     * @param {String} jid - The user jid.
     * @returns {Number} id - The user id.
     * */
    getIdFromNode: function(jid) {
        return (jid.indexOf('@') < 0) ? null : parseInt(jid.split('@')[0].split('-')[0]);
    },

    /**
     * Get the dialog id from jid.
     * @memberof QB.chat.helpers
     * @param {String} jid - The dialog jid.
     * @returns {String} dialogId - The dialog id.
     * */
    getDialogIdFromNode: function(jid) {
        if (jid.indexOf('@') < 0) return null;
        return jid.split('@')[0].split('_')[1];
    },

    /**
     * Get the room jid from dialog id.
     * @memberof QB.chat.helpers
     * @param {String} dialogId - The dialog id.
     * @returns {String} jid - The dialog jid.
     * */
    getRoomJidFromDialogId: function(dialogId) {
        return config.creds.appId + '_' + dialogId + '@' + config.endpoints.muc;
    },

    /**
     * Get the full room jid from room bare jid & user jid.
     * @memberof QB.chat.helpers
     * @param {String} jid - dialog's bare jid.
     * @param {String} userJid - user's jid.
     * @returns {String} jid - dialog's full jid.
     * */
    getRoomJid: function(jid) {
        return jid + '/' + this.getIdFromNode(this._userCurrentJid);
    },

    /**
     * Get user id from dialog's full jid.
     * @memberof QB.chat.helpers
     * @param {String} jid - dialog's full jid.
     * @returns {String} user_id - User Id.
     * */
    getIdFromResource: function(jid) {
        var s = jid.split('/');
        if (s.length < 2) return null;
        s.splice(0, 1);
        return parseInt(s.join('/'));
    },

    /**
     * Get bare dialog's jid from dialog's full jid.
     * @memberof QB.chat.helpers
     * @param {String} jid - dialog's full jid.
     * @returns {String} room_jid - dialog's bare jid.
     * */
    getRoomJidFromRoomFullJid: function(jid) {
        var s = jid.split('/');
        if (s.length < 2) return null;
        return s[0];
    },

    /**
     * Generate BSON ObjectId.
     * @memberof QB.chat.helpers
     * @returns {String} BsonObjectId - The bson object id.
     **/
    getBsonObjectId: function() {
        return Utils.getBsonObjectId();
    },

    /**
     * Get the user id from the room jid.
     * @memberof QB.chat.helpers
     * @param {String} jid - resourse jid.
     * @returns {String} userId - The user id.
     * */
    getUserIdFromRoomJid: function(jid) {
        var arrayElements = jid.toString().split('/');
        if(arrayElements.length === 0){
            return null;
        }
        return arrayElements[arrayElements.length-1];
    },

    userCurrentJid: function(client){
        try {
            if (client instanceof Strophe.Connection){
                return client.jid;
            } else {
                return client.jid.user + '@' + client.jid._domain + '/' + client.jid._resource;
            }
        } catch (e) { // ReferenceError: Strophe is not defined
            return client.jid.user + '@' + client.jid._domain + '/' + client.jid._resource;
        }
    },

    getUserCurrentJid: function() {
        return this._userCurrentJid;
    },

    setUserCurrentJid: function(jid) {
        this._userCurrentJid = jid;
    }
};
/**
 * @namespace QB.chat
 * */
module.exports = ChatProxy;
