var QBApp = {
  appId: 92,
  authKey: 'wJHdOcQSxXQGWx5',
  authSecret: 'BTFsj7Rtt27DAmT'
};

var config = {
  chatProtocol: {
    websocket: 'ws://chat.quickblox.com:5290',
    // websocket: 'wss://chat.quickblox.com:5291',
    active: 2
  },
  ssl: true,
  debug: true
};

var QBUser1 = {
        id: 4983781,
        name: 'BROTHER',
        login: 'BROTHER',
        pass: '123456789'
    },
    QBUser2 = {
        id: 4983792,
        name: 'SISTER',
        login: 'SISTER',
        pass: '123456789'
    };

QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret, config);