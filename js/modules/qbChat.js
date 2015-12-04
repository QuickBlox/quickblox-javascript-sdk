
/*
 * QuickBlox JavaScript SDK
 *
 * Chat 2.0 Module
 *
 */

var config = require('../qbConfig'),
    Utils = require('../qbUtils');

var isBrowser = typeof window !== "undefined";
var unsupported = "This function isn't supported outside of the browser (...yet)";

if (isBrowser) {
  require('../../lib/strophe/strophe.min');
  // add extra namespaces for Strophe
  Strophe.addNamespace('CARBONS', 'urn:xmpp:carbons:2');
  Strophe.addNamespace('CHAT_MARKERS', 'urn:xmpp:chat-markers:0');
  Strophe.addNamespace('PRIVACY_LIST', 'jabber:iq:privacy');
  Strophe.addNamespace('CHAT_STATES', 'http://jabber.org/protocol/chatstates');
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
  if(isBrowser) {
    this.roster = new RosterProxy(service);
    this.muc = new MucProxy(service);
    this.privacylist = new PrivacyListProxy(service);

    this._isLogout = false;
    this._isDisconnected = false;
  }
  this.dialog = new DialogProxy(service);
  this.message = new MessageProxy(service);
  this.helpers = new Helpers();

/*
 * User's callbacks (listener-functions):
 * - onMessageListener
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

  // stanza callbacks (Message, Presence, IQ, SystemNotifications)

  this._onMessage = function(stanza) {
    var from = stanza.getAttribute('from'),
        to = stanza.getAttribute('to'),
        type = stanza.getAttribute('type'),
        body = stanza.querySelector('body'),
        markable = stanza.querySelector('markable'),
        delivered = stanza.querySelector('received'),
        read = stanza.querySelector('displayed'),
        composing = stanza.querySelector('composing'),
        paused = stanza.querySelector('paused'),
        invite = stanza.querySelector('invite'),
        extraParams = stanza.querySelector('extraParams'),
        delay = stanza.querySelector('delay'),
        messageId = stanza.getAttribute('id'),
        dialogId = type === 'groupchat' ? self.helpers.getDialogIdFromNode(from) : null,
        userId = type === 'groupchat' ? self.helpers.getIdFromResource(from) : self.helpers.getIdFromNode(from),
        marker = delivered || read || null;


    // ignore invite messages from MUC
    //
    if (invite) return true;


    // parse extra params
    var extraParamsParsed;
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
        Utils.safeCallbackCall(self.onMessageTypingListener, composing != null, userId, dialogId);
      }
      return true;
    }

    // fire read/delivered listeners
    //
    if (marker) {
      if (delivered) {
        if (typeof self.onDeliveredStatusListener === 'function' && type === 'chat') {
          Utils.safeCallbackCall(self.onDeliveredStatusListener, delivered.getAttribute('id'), dialogId, userId);
        }
      } else {
        if (typeof self.onReadStatusListener === 'function' && type === 'chat') {
          Utils.safeCallbackCall(self.onReadStatusListener, read.getAttribute('id'), dialogId, userId);
        }
      }
      return true;
    }

    // autosend 'received' status (ignore messages from self)
    //
    if (markable && userId != self.helpers.getIdFromNode(connection.jid)) {
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
      type: type,
      body: (body && body.textContent) || null,
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
    var from = stanza.getAttribute('from'),
        type = stanza.getAttribute('type'),
        userId = self.helpers.getIdFromNode(from);

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
          if (typeof self.onConfirmSubscribeListener === 'function')
            Utils.safeCallbackCall(self.onConfirmSubscribeListener, userId);
        }
        break;
      case 'unsubscribed':
        roster[userId] = {
          subscription: 'none',
          ask: null
        };
        if (typeof self.onRejectSubscribeListener === 'function')
          Utils.safeCallbackCall(self.onRejectSubscribeListener, userId);
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
        if (typeof self.onContactListListener === 'function' && roster[userId] && roster[userId].subscription !== 'none')
          Utils.safeCallbackCall(self.onContactListListener, userId, type);
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
    return true;
  };

  this._onSystemMessageListener = function(stanza) {
    var from = stanza.getAttribute('from'),
        to = stanza.getAttribute('to'),
        extraParams = stanza.querySelector('extraParams'),
        moduleIdentifier = extraParams.querySelector('moduleIdentifier').textContent,
        delay = stanza.querySelector('delay'),
        messageId = stanza.getAttribute('id'),
        message;

    // fire 'onSystemMessageListener'
    //
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
    console.log(stanza);
    var type = stanza.getAttribute('type'),
        error = stanza.querySelector('text').textContent;

    // fire 'onMessageErrorListener'
    //
    if (typeof self.onMessageErrorListener === 'function' && type === 'error') {
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
    if(!isBrowser) throw unsupported;

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

    connection.connect(userJid, params.password, function(status) {

      switch (status) {
      case Strophe.Status.ERROR:
        err = getError(422, 'Status.ERROR - An error has occurred');
        if (typeof callback === 'function') callback(err, null);
        break;
      case Strophe.Status.CONNECTING:
        Utils.QBLog('[ChatProxy]', 'Status.CONNECTING');
        Utils.QBLog('[ChatProxy]', 'Chat Protocol - ' + (config.chatProtocol.active === 1 ? 'BOSH' : 'WebSocket'));
        break;
      case Strophe.Status.CONNFAIL:
        err = getError(422, 'Status.CONNFAIL - The connection attempt failed');
        if (typeof callback === 'function') callback(err, null);
        break;
      case Strophe.Status.AUTHENTICATING:
        Utils.QBLog('[ChatProxy]', 'Status.AUTHENTICATING');
        break;
      case Strophe.Status.AUTHFAIL:
        err = getError(401, 'Status.AUTHFAIL - The authentication attempt failed');
        if (typeof callback === 'function') callback(err, null);
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
        connection.addHandler(webrtc._onMessage, null, 'message', 'headline');

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
  },

  send: function(jid_or_user_id, message) {
    if(!isBrowser) throw unsupported;

    if(!message.id){
      message.id = Utils.getBsonObjectId();
    }

    var self = this,
        msg = $msg({
          from: connection.jid,
          to: this.helpers.jidOrUserId(jid_or_user_id),
          type: message.type,
          id: message.id
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
  },

  // send system messages
  sendSystemMessage: function(jid_or_user_id, message) {
    if(!isBrowser) throw unsupported;

    if(!message.id){
      message.id = Utils.getBsonObjectId();
    }

    var self = this,
        msg = $msg({
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
  },

  // send typing status
  sendIsTypingStatus: function(jid_or_user_id) {
    if(!isBrowser) throw unsupported;

    var msg = $msg({
      from: connection.jid,
      to: this.helpers.jidOrUserId(jid_or_user_id),
      type: this.helpers.typeChat(jid_or_user_id)
    });

    msg.c('composing', {
      xmlns: Strophe.NS.CHAT_STATES
    });

    connection.send(msg);
  },

  // send stop typing status
  sendIsStopTypingStatus: function(jid_or_user_id) {
    if(!isBrowser) throw unsupported;

    var msg = $msg({
      from: connection.jid,
      to: this.helpers.jidOrUserId(jid_or_user_id),
      type: this.helpers.typeChat(jid_or_user_id)
    });

    msg.c('paused', {
      xmlns: Strophe.NS.CHAT_STATES
    });

    connection.send(msg);
  },

  // helper function for ChatProxy.send()
  sendPres: function(type) {
    if(!isBrowser) throw unsupported;

    connection.send($pres({
      from: connection.jid,
      type: type
    }));
  },

  sendDeliveredStatus: function(params) {
    if(!isBrowser) throw unsupported;

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
  },

  sendReadStatus: function(params) {
    if(!isBrowser) throw unsupported;

    var msg = $msg({
      from: connection.jid,
      to: this.helpers.jidOrUserId(params.userId),
      type: 'chat',
      id: Utils.getBsonObjectId()
    });

    msg.c('displayed', {
      xmlns: Strophe.NS.CHAT_MARKERS,
      id: params.messageId
    }).up();

    msg.c('extraParams', {
      xmlns: Strophe.NS.CLIENT
    }).c('dialog_id').t(params.dialogId);

    connection.send(msg);
  },

  disconnect: function() {
    if(!isBrowser) throw unsupported;

    joinedRooms = {};
    this._isLogout = true;
    connection.flush();
    connection.disconnect();
  },

  addListener: function(params, callback) {
    if(!isBrowser) throw unsupported;

    return connection.addHandler(handler, null, params.name || null, params.type || null, params.id || null, params.from || null);

    function handler() {
      callback();
      // if 'false' - a handler will be performed only once
      return params.live !== false;
    }
  },

  deleteListener: function(ref) {
    if(!isBrowser) throw unsupported;

    connection.deleteHandler(ref);
  },

  // TODO: the magic
  _JStoXML: function(title, obj, msg) {
    var self = this;
    msg.c(title);
    Object.keys(obj).forEach(function(field) {
      if (typeof obj[field] === 'object')
        self._JStoXML(field, obj[field], msg);
      else
        msg.c(field).t(obj[field]).up();
    });
    msg.up();
  },

  // TODO: the magic
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

    for (var i = 0, len = extraParams.childNodes.length; i < len; i++) {

      // parse attachments
      if (extraParams.childNodes[i].tagName === 'attachment') {
        var attach = {};
        var attributes = extraParams.childNodes[i].attributes;
        for (var j = 0, len2 = attributes.length; j < len2; j++) {
          if (attributes[j].name === 'id' || attributes[j].name === 'size')
            attach[attributes[j].name] = parseInt(attributes[j].value);
          else
            attach[attributes[j].name] = attributes[j].value;
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

    return {extension: extension, dialogId: dialogId};
  },

  _autoSendPresence: function() {
    if(!isBrowser) throw unsupported;

    connection.send($pres().tree());
    // we must return true to keep the handler alive
    // returning false would remove it after it finishes
    return true;
  },

  // Carbons XEP [http://xmpp.org/extensions/xep-0280.html]
  _enableCarbons: function(callback) {
    if(!isBrowser) throw unsupported;

    var iq;

    iq = $iq({
      from: connection.jid,
      type: 'set',
      id: connection.getUniqueId('enableCarbons')
    }).c('enable', {
      xmlns: Strophe.NS.CARBONS
    });

    connection.sendIQ(iq, function(stanza) {
      callback();
    });
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

    iq = $iq({
      from: connection.jid,
      type: 'get',
      id: connection.getUniqueId('getRoster')
    }).c('query', {
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
    var self = this;
    var userJid = this.helpers.jidOrUserId(jidOrUserId);
    var userId = this.helpers.getIdFromNode(userJid).toString();
    var iq;

    iq = $iq({
      from: connection.jid,
      type: 'set',
      id: connection.getUniqueId('removeRosterItem')
    }).c('query', {
      xmlns: Strophe.NS.ROSTER
    }).c('item', {
      jid: userJid,
      subscription: 'remove'
    });

    connection.sendIQ(iq, function() {
      delete roster[userId];
      if (typeof callback === 'function') callback();
    });
  },

  _sendSubscriptionPresence: function(params) {
    var pres;

    pres = $pres({
      to: params.jid,
      type: params.type
    });

    connection.send(pres);
  }

};


/* Chat module: Group Chat
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
    var pres, self = this,
        id = connection.getUniqueId('join');

    joinedRooms[jid] = true;

    pres = $pres({
      from: connection.jid,
      to: self.helpers.getRoomJid(jid),
      id: id
    }).c("x", {
      xmlns: Strophe.NS.MUC
    }).c("history", {
      maxstanzas: 0
    });

    if (typeof callback === 'function') connection.addHandler(callback, null, 'presence', null, id);
    connection.send(pres);
  },

  leave: function(jid, callback) {
    var pres, self = this,
        roomJid = self.helpers.getRoomJid(jid);

    delete joinedRooms[jid];

    pres = $pres({
      from: connection.jid,
      to: roomJid,
      type: 'unavailable'
    });

    if (typeof callback === 'function') connection.addHandler(callback, null, 'presence', 'unavailable', null, roomJid);
    connection.send(pres);
  },

  listOnlineUsers: function(roomJid, callback) {
    var iq, self = this,
        onlineUsers = [];

    iq = $iq({
      from: connection.jid,
      id: connection.getUniqueId('muc_disco_items'),
      to: roomJid,
      type: "get"
    }).c("query", {
      xmlns: 'http://jabber.org/protocol/disco#items'
    });

    connection.sendIQ(iq, function(stanza) {
      var items = stanza.getElementsByTagName('item');
      var userId;
      for (var i = 0, len = items.length; i < len; i++) {
        userId = self.helpers.getUserIdFromRoomJid(items[i].getAttribute('jid'));
        onlineUsers.push(userId);
      }
      callback(onlineUsers);
    });
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
    var iq = $iq({
      from: connection.jid,
      type: 'get',
      id: connection.getUniqueId('getNames')
    }).c('query', {
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
        callback(getError(408), null);
      }
    });
  },

  getList: function(name, callback) {
    var iq, self = this,
        items, userJid, userId,
        usersList = [], list = {};

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
        userJid = items[i].getAttribute('value'),
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
        var errorObject = getErrorFromXMLNode(stanzaError);
        callback(errorObject, null);
      }else{
        callback(getError(408), null);
      }
    });
  },

  create: function(list, callback) {
    var iq, self = this,
        userId, userJid,
        userAction, userMuc,
        listObj = {},
        listKeys = [];

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

    listKeys = Object.keys(listObj);

    for (var index = 0, i = 0, len = listKeys.length; index < len; index++, i=i+2) {
      userId = listKeys[index];
      userAction = listObj[userId];
      userJid = self.helpers.jidOrUserId(parseInt(userId, 10));
      userMuc = self.helpers.getUserNickWithMucDomain(userId);

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
    }

    connection.sendIQ(iq, function(stanzaResult) {
      callback(null);
    }, function(stanzaError){
      if(stanzaError){
        var errorObject = getErrorFromXMLNode(stanzaError);
        callback(errorObject);
      }else{
        callback(getError(408));
      }
    });
  },

  update: function(list, callback) {
    var self = this;

    self.getList(list.name, function(error, response) {
      if (error) {
        callback(error, null);
      }else{
        var copyList = (JSON.parse(JSON.stringify(list))),
            oldArray = response.items,
            newArray = copyList.items,
            createdList = {};

        copyList.items = $.merge(oldArray, newArray);
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
        callback(getError(408));
      }
    });
  },

  setAsDefault: function(name, callback) {
    var iq = $iq({
      from: connection.jid,
      type: 'set',
      id: connection.getUniqueId('default')
    }).c('query', {
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
        callback(getError(408));
      }
    });
  },

  setAsActive: function(name, callback) {
    var iq = $iq({
      from: connection.jid,
      type: 'set',
      id: connection.getUniqueId('active')
    }).c('query', {
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
        callback(getError(408));
      }
    });
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
      this.service.ajax({url: Utils.getUrl(dialogUrl, id), type: 'DELETE'}, params_or_callback);
    } else if (arguments.length == 3) {
      this.service.ajax({url: Utils.getUrl(dialogUrl, id), type: 'DELETE', data: params_or_callback}, callback);
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
    Utils.QBLog('[MessageProxy]', 'update', id, params);

    this.service.ajax({url: Utils.getUrl(messageUrl, id), type: 'PUT', data: params}, callback);
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

  getRoomJid: function(jid) {
    if(!isBrowser) throw unsupported;
    return jid + '/' + this.getIdFromNode(connection.jid);
  },

  getIdFromResource: function(jid) {
    var s = jid.split('/');
    if (s.length < 2) return null;
    s.splice(0, 1);
    return parseInt(s.join('/'));
  },

  getUniqueId: function(suffix) {
    if(!isBrowser) throw unsupported;
    return connection.getUniqueId(suffix);
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
  return getError(errorCode, errorText);
}

function getError(code, detail) {
  var errorMsg = {
    code: code,
    status: 'error',
    detail: detail
  };

  var msg;
  switch (code) {
    case 401:
      msg = 'Unauthorized';
      break;
    case 422:
      msg = 'Unprocessable Entity';
      break;
    case 408:
      msg = 'Timeout';
      break;
    default:
      msg = 'Bad request'; // 400
  }

  errorMsg['message'] = msg;

  return errorMsg;
}

function getLocalTime() {
  return (new Date()).toTimeString().split(' ')[0];
}
