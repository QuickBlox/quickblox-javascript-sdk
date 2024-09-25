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
  version: '2.19.2',
  buildNumber: '1164',
  creds: {
    'appId': 0,
    'authKey': '',
    'authSecret': '',
    'accountKey': ''
  },
  endpoints: {
    api: 'api.quickblox.com',
    chat: 'chat.quickblox.com',
    muc: 'muc.chat.quickblox.com'
  },
  hash: 'sha1',
  streamManagement: {
    enable: false
  },
  chatProtocol: {
    bosh: 'https://chat.quickblox.com:5281',
    websocket: 'wss://chat.quickblox.com:5291',
    active: 2
  },
  pingTimeout: 1,
  pingLocalhostTimeInterval: 5,
  chatReconnectionTimeInterval: 3,
  webrtc: {
    answerTimeInterval: 60,
    autoReject: true,
    incomingLimit: 1,
    dialingTimeInterval: 5,
    disconnectTimeInterval: 30,
    statsReportTimeInterval: false,
    iceServers: [
      {
        urls: ['turn:turn.quickblox.com', 'stun:turn.quickblox.com'],
        username: 'quickblox',
        credential: 'baccb97ba2d92d71e26eb9886da5f1e0'
      }
    ]
  },
  urls: {
    account: 'account_settings',
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
  addISOTime: false,
  qbTokenExpirationDate: null,
  liveSessionInterval: 120,
  callBackInterval: 30,
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

config.updateSessionExpirationDate = function (tokenExpirationDate, headerHasToken = false) {
  var connectionTimeLag = 1; // minute
  var newDate;
  if (headerHasToken) {
    var d = tokenExpirationDate.replaceAll('-','/');
    newDate = new Date(d);
    newDate.setMinutes ( newDate.getMinutes() - connectionTimeLag);
  }
  else {
    newDate = new Date(tokenExpirationDate);
    newDate.setMinutes ( newDate.getMinutes() - connectionTimeLag);
    newDate.setMinutes ( newDate.getMinutes() + config.liveSessionInterval );
  }
  config.qbTokenExpirationDate = newDate;
};


module.exports = config;
