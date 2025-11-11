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
  version: '2.21.3',
  buildNumber: '1169',
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
  pingDebug: false,
  initBlockOnSettings: false,
  initBlockDurationMs: 3000,
  pingLocalhostTimeInterval: 5,
  chatReconnectionTimeInterval: 3,
  webrtc: {
    answerTimeInterval: 60,
    autoReject: true,
    incomingLimit: 1,
    dialingTimeInterval: 5,
    disconnectTimeInterval: 30,
    statsReportTimeInterval: false,
    /**
     * ICE transport policy.
     * If undefined -> do not pass this option into RTCPeerConnection.
     * Allowed values when set: "all" | "relay".
     */
    iceTransportPolicy: undefined,
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

config.set = function (options) {
    // Update chat endpoints (same behavior as before)
    if (typeof options.endpoints === 'object' && options.endpoints.chat) {
        config.endpoints.muc = 'muc.' + options.endpoints.chat;
        config.chatProtocol.bosh = 'https://' + options.endpoints.chat + ':5281';
        config.chatProtocol.websocket = 'wss://' + options.endpoints.chat + ':5291';
    }

    // Shallow merge: copy only known keys; skip undefined values
    Object.keys(options).forEach(function (key) {
        if (key !== 'set' && Object.prototype.hasOwnProperty.call(config, key)) {
            if (typeof options[key] !== 'object' || options[key] === null) {
                // Primitive or null: assign as is
                if (typeof options[key] !== 'undefined') {
                    config[key] = options[key];
                }
            } else {
                // Object: copy only known subkeys; skip undefined values
                Object.keys(options[key]).forEach(function (nextkey) {
                    if (
                        Object.prototype.hasOwnProperty.call(config[key], nextkey) &&
                        typeof options[key][nextkey] !== 'undefined'
                    ) {
                        config[key][nextkey] = options[key][nextkey];
                    }
                });
            }
        }

        // Backward compatibility: allow top-level iceServers
        if (key === 'iceServers' && typeof options[key] !== 'undefined') {
            config.webrtc.iceServers = options[key];
        }

        // Backward compatibility: allow top-level iceTransportPolicy
        if (key === 'iceTransportPolicy' && typeof options[key] !== 'undefined') {
            // Allowed values when set: "all" | "relay"
            config.webrtc.iceTransportPolicy = options[key];
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
