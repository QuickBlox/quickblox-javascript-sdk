/* 
 * QuickBlox JavaScript SDK
 *
 * Configuration Module
 *
 */

var config = {
  version: '1.9.0',
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
    active: 1
  },
  iceServers: [
    // {
    //   'url': 'stun:stun.l.google.com:19302'
    // },
    // {
    //   'url': 'turn:turnservertest.quickblox.com:3478?transport=udp',
    //   'credential': 'testqbtest',
    //   'username': 'testqb'
    // },
    // {
    //   'url': 'turn:turnservertest.quickblox.com:3478?transport=tcp',
    //   'credential': 'testqbtest',
    //   'username': 'testqb'
    // }

    {
      'url': 'stun:stun.l.google.com:19302'
    },
    {
      'url': 'stun:stun.anyfirewall.com:3478'
    },
    {
      'url': 'stun:turn2.xirsys.com'
    },
    {
      'url': 'turn:turn.bistri.com:80',
      'username': 'homeo',
      'credential': 'homeo'
    },
    {
      'url': 'turn:turn.anyfirewall.com:443?transport=tcp',
      'username': 'webrtc',
      'credential': 'webrtc'
    },
    {
      'url': 'turn:turn2.xirsys.com:443?transport=udp',
      'username': '36b7fdaf-524e-4c38-a6d3-b174166fd573',      
      'credential': '0371abb5-fa95-4bbe-b282-25e5888513f7'
    },
    {
      'url': 'turn:turn2.xirsys.com:443?transport=tcp',
      'username': '36b7fdaf-524e-4c38-a6d3-b174166fd573',      
      'credential': '0371abb5-fa95-4bbe-b282-25e5888513f7'
    }
  ],
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
