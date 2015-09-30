
/*
 *  Contains the default expected settings etc
 *
 */

var DEFAULTS = {
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
  webrtc: {
    iceServers: [
      {
        'url': 'stun:stun.l.google.com:19302'
      },
      {
        'url': 'turn:turnservertest.quickblox.com:3478?transport=udp',
        'credential': 'testqbtest',
        'username': 'testqb'
      },
      {
        'url': 'turn:turnservertest.quickblox.com:3478?transport=tcp',
        'credential': 'testqbtest',
        'username': 'testqb'
      }
    ]
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

// Default timeout for calls to the API
var TIMEOUT = 5000;

var VALID_USER='qb-temp', VALID_PASSWORD = 'someSecret';
var INVALID_USER='notRegistered', INVALID_PASSWORD = 'doNotCare';
