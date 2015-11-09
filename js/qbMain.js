/*
 * QuickBlox JavaScript SDK
 *
 * Main SDK Module
 *
 */

var config = require('./qbConfig');
var Utils = require('./qbUtils');

var isBrowser = typeof window !== "undefined";

// Actual QuickBlox API starts here
function QuickBlox() {}

QuickBlox.prototype = {

  init: function(appId, authKey, authSecret, configMap) {
    if (configMap && typeof configMap === 'object') {
      config.set(configMap);
    }

    var Proxy = require('./qbProxy');
    this.service = new Proxy();

    // include dependencies
    var Auth = require('./modules/qbAuth'),
        Users = require('./modules/qbUsers'),
        Chat = require('./modules/qbChat'),
        Content = require('./modules/qbContent'),
        Location = require('./modules/qbLocation'),
        PushNotifications = require('./modules/qbPushNotifications'),
        Data = require('./modules/qbData');

    if (isBrowser) {
      // create Strophe Connection object
      var Connection = require('./qbStrophe');
      var conn = new Connection();

      // add WebRTC API
      var WebRTC = require('./modules/qbWebRTC');
      this.webrtc = new WebRTC(this.service, conn || null);
    }

    this.auth = new Auth(this.service);
    this.users = new Users(this.service);
    this.chat = new Chat(this.service, this.webrtc || null, conn || null);
    this.content = new Content(this.service);
    this.location = new Location(this.service);
    this.pushnotifications = new PushNotifications(this.service);
    this.data = new Data(this.service);

    // Initialization by outside token
    if (typeof appId === 'string' && !authKey && !authSecret) {
      this.service.setSession({ token: appId });
    } else {
      config.creds.appId = appId;
      config.creds.authKey = authKey;
      config.creds.authSecret = authSecret;
    }
  },

  getSession: function(callback) {
    this.auth.getSession(callback);
  },

  createSession: function(params, callback) {
    this.auth.createSession(params, callback);
  },

  destroySession: function(callback) {
    this.auth.destroySession(callback);
  },

  login: function(params, callback) {
    this.auth.login(params, callback);
  },

  logout: function(callback) {
    this.auth.logout(callback);
  }

};

var QB = new QuickBlox();
QB.QuickBlox = QuickBlox;

module.exports = QB;
