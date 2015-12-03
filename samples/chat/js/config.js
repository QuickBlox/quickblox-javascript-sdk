var QBApp = {
  appId: 28287,
  authKey: 'XydaWcf8OO9xhGT',
  authSecret: 'JZfqTspCvELAmnW'
};

var config = {
  chatProtocol: {
    active: 2
  },
  debug: {
    mode: 0,
    file: null
  }
};

var QBUser1 = {
        id: 6729114,
        name: 'quickuser',
        login: 'chatusr11',
        pass: 'chatusr11'
    },
    QBUser2 = {
        id: 6729119,
        name: 'bloxuser',
        login: 'chatusr22',
        pass: 'chatusr22'
    };

QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret, config);