/*
 * QuickBlox JavaScript SDK
 *
 * Main SDK Module
 *
 */

var config = require('./qbConfig');
var isBrowser = typeof window !== "undefined";

// Actual QuickBlox API starts here
function QuickBlox() {}

QuickBlox.prototype = {

  init: function(appId, authKey, authSecret, debug) {
    if (debug && typeof debug === 'boolean') config.debug = debug;
    else if (debug && typeof debug === 'object') config.set(debug);

    // include dependencies
    var Proxy = require('./qbProxy'),
        Auth = require('./modules/qbAuth'),
        Users = require('./modules/qbUsers'),
        Chat = require('./modules/qbChat'),
        // WebRTC = require('./modules/qbWebRTC'),
        Content = require('./modules/qbContent'),
        Location = require('./modules/qbLocation'),
        Messages = require('./modules/qbMessages'),
        Data = require('./modules/qbData');

    if (isBrowser) {
      // create Strophe Connection object
      var Connection = require('./qbStrophe');
      var conn = new Connection();
    }
    
    this.service = new Proxy();
    this.auth = new Auth(this.service);
    this.users = new Users(this.service);
    this.chat = new Chat(this.service, conn || null);
    // this.webrtc = new WebRTC(this.service, conn || null);
    this.content = new Content(this.service);
    this.location = new Location(this.service);
    this.messages = new Messages(this.service);
    this.data = new Data(this.service);
    
    // Initialization by outside token
    if (typeof appId === 'string' && !authKey && !authSecret) {
      this.service.setSession({ token: appId });
    } else {
      config.creds.appId = appId;
      config.creds.authKey = authKey;
      config.creds.authSecret = authSecret;
    }
    if(console && config.debug) console.log('QuickBlox.init', this);
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
