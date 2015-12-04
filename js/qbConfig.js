/*
 * QuickBlox JavaScript SDK
 *
 * Configuration Module
 *
 */

var config = {
  version: '1.17.0',
  creds: {
    appId: '',
    authKey: '',
    authSecret: ''
  },
  endpoints: {
    api: 'api.quickblox.com',
    chat: 'chat.quickblox.com',
    muc: 'muc.chat.quickblox.com'
  },
  chatProtocol: {
    bosh: 'https://chat.quickblox.com:5281',
    websocket: 'wss://chat.quickblox.com:5291',
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
    pushtokens: 'push_tokens',
    subscriptions: 'subscriptions',
    events: 'events',
    data: 'data',
    type: '.json'
  },
  on: {
    sessionExpired: null
  },
  timeout: null,
  debug: {mode: 0, file: null},
  addISOTime: false
};

config.set = function(options) {
  if (typeof options.endpoints === 'object' && options.endpoints.chat) {
    config.endpoints.muc = 'muc.'+options.endpoints.chat;
    config.chatProtocol.bosh = 'https://'+options.endpoints.chat+':5281';
    config.chatProtocol.websocket = 'wss://'+options.endpoints.chat+':5291';
  }

  Object.keys(options).forEach(function(key) {
    if(key !== 'set' && config.hasOwnProperty(key)) {
      if(typeof options[key] !== 'object') {
        config[key] = options[key];
      } else {
        Object.keys(options[key]).forEach(function(nextkey) {
          if(config[key].hasOwnProperty(nextkey)){
            config[key][nextkey] = options[key][nextkey];
          }
        });
      }
    }
  });


};

module.exports = config;
