/*
 * QuickBlox JavaScript SDK
 *
 * Configuration Module
 *
 */

var config = {
  version: '1.13.1',
  creds: {
    appId: '',
    authKey: '',
    authSecret: ''
  },
  endpoints: {
    api: 'api.quickblox.com',
    chat: 'chat.quickblox.com',
    muc: 'muc.chat.quickblox.com',
    turn: 'turnserver.quickblox.com',
    s3Bucket: 'qbprod'
  },
  chatProtocol: {
    // bosh: 'http://chat.quickblox.com:5280',
    bosh: 'https://chat.quickblox.com:5281', // With SSL
    // websocket: 'ws://chat.quickblox.com:5290',
    websocket: 'wss://chat.quickblox.com:5291', // With SSL
    active: 2
  },
  iceServers: [
    {
      'url': 'stun:stun.l.google.com:19302'
    },
    {
      'url': 'stun:turn.quickblox.com',
      'username': 'quickblox',
      'credential': 'baccb97ba2d92d71e26eb9886da5f1e0'
    },
    {
      'url': 'turn:turn.quickblox.com:3478?transport=udp',
      'username': 'quickblox',
      'credential': 'baccb97ba2d92d71e26eb9886da5f1e0'
    },
    {
      'url': 'turn:turn.quickblox.com:3478?transport=tcp',
      'username': 'quickblox',
      'credential': 'baccb97ba2d92d71e26eb9886da5f1e0'
    },
  ],
  webrtc: {
    answerTimeInterval: 60,
    dialingTimeInterval: 5,
  },
  urls: {
    session: 'session',
    login: 'login',
    users: 'users',
    chat: 'chat',
    blobs: 'blobs',
    geodata: 'geodata',
    places: 'places',
    pushtokens: 'push_tokens',
    subscriptions: 'subscriptions',
    events: 'events',
    data: 'data',
    type: '.json'
  },
  on: {
    sessionExpired: null
  },
  ssl: true,
  timeout: null,
  debug: false,
  addISOTime: false
};

config.set = function(options) {
  Object.keys(options).forEach(function(key) {
    if(key !== 'set' && config.hasOwnProperty(key)) {
      if(typeof options[key] !== 'object') {
        config[key] = options[key]
      } else {
        Object.keys(options[key]).forEach(function(nextkey) {
          if(config[key].hasOwnProperty(nextkey))
            config[key][nextkey] = options[key][nextkey];
        });
      }
    }
  })
};

module.exports = config;
