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

  init: function(appIdOrToken, authKeyOrAppId, authSecret, configMap) {
    if (configMap && typeof configMap === 'object') {
      config.set(configMap);
    }

    var Proxy = require('./qbProxy');
    this.service = new Proxy();

    /** include dependencies */
    var Auth = require('./modules/qbAuth'),
        Users = require('./modules/qbUsers'),
        Chat = require('./modules/qbChat'),
        Content = require('./modules/qbContent'),
        Location = require('./modules/qbLocation'),
        PushNotifications = require('./modules/qbPushNotifications'),
        Data = require('./modules/qbData'),
        conn;

    if (isBrowser) {
      /** create Strophe Connection object */
      var Connection = require('./qbStrophe');
      conn = new Connection();

      /** add WebRTC API if API is avaible */
      if( Utils.isWebRTCAvailble() ) {
        var WebRTCClient = require('./modules/webrtc/qbWebRTCClient');
        this.webrtc = new WebRTCClient(this.service, conn || null);
      } else {
        this.webrtc = false;
      }
    } else {
      this.webrtc = false;
    }

    this.auth = new Auth(this.service);
    this.users = new Users(this.service);
    this.chat = new Chat(this.service, this.webrtc ? this.webrtc.signalingProcessor : null, conn || null);
    this.content = new Content(this.service);
    this.location = new Location(this.service);
    this.pushnotifications = new PushNotifications(this.service);
    this.data = new Data(this.service);

    // Initialization by outside token
    if (typeof appIdOrToken === 'string' && (!authKeyOrAppId || typeof authKeyOrAppId === 'number') && !authSecret) {

      if(typeof authKeyOrAppId === 'number'){
        config.creds.appId = authKeyOrAppId;
      }

      this.service.setSession({ token: appIdOrToken });
    } else {
      config.creds.appId = appIdOrToken;
      config.creds.authKey = authKeyOrAppId;
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
