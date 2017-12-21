'use strict';

/*
 * QuickBlox JavaScript SDK
 *
 * Configuration Module
 *
 * NOTE:
 *  - config.webrtc.statsReportTimeInterval [integer, sec]:
 *  could add listener onCallStatsReport(session, userId, bytesReceived) if
 *  want to get stats (bytesReceived) about peer every X sec;
 */

var config = {
  version: '2.8.0',
  buildNumber: '1053',
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
  streamManagement: {
    enable: false
  },
  chatProtocol: {
    bosh: 'https://chat.quickblox.com:5281',
    websocket: 'wss://chat.quickblox.com:5291',
    active: 2
  },
  webrtc: {
    answerTimeInterval: 60,
    dialingTimeInterval: 5,
    disconnectTimeInterval: 30,
    statsReportTimeInterval: false,
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
      {
       'url': 'turn:turnsingapor.quickblox.com:3478?transport=udp',		
       'username': 'quickblox',		
       'credential': 'baccb97ba2d92d71e26eb9886da5f1e0'		
      },
      {
        'url': 'turn:turnsingapore.quickblox.com:3478?transport=tcp',		
        'username': 'quickblox',		
        'credential': 'baccb97ba2d92d71e26eb9886da5f1e0'		
      },
      {
        'url': 'turn:turnireland.quickblox.com:3478?transport=udp',		
        'username': 'quickblox',		
        'credential': 'baccb97ba2d92d71e26eb9886da5f1e0'		
      },
      {
        'url': 'turn:turnireland.quickblox.com:3478?transport=tcp',		
        'username': 'quickblox',		
        'credential': 'baccb97ba2d92d71e26eb9886da5f1e0'		
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
    pushtokens: 'push_tokens',
    subscriptions: 'subscriptions',
    events: 'events',
    data: 'data',
    addressbook: 'address_book',
    addressbookRegistered: 'address_book/registered_users',
    type: '.json'
  },
  on: {
    sessionExpired: null
  },
  timeout: null,
  debug: {
    mode: 0,
    file: null
  },
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

    // backward compatibility: for config.iceServers
    if(key === 'iceServers') {
      config.webrtc.iceServers = options[key];
    }
  });
};

module.exports = config;
