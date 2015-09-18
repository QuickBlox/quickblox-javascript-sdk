var QBApp = {
  appId: 92,
  authKey: 'wJHdOcQSxXQGWx5',
  authSecret: 'BTFsj7Rtt27DAmT'
};

var config = {
  chatProtocol: {
    websocket: 'wss://chat.quickblox.com:5291',
    active: 2
  },
  ssl: true,
  debug: false
};

var QBUser1 = {
        id: 5449429,
        name: 'chatsampleuser111',
        login: 'chatsampleuser111',
        pass: 'chatsampleuser111'
    },
    QBUser2 = {
        id: 5449431,
        name: 'chatsampleuser112',
        login: 'chatsampleuser112',
        pass: 'chatsampleuser112'
    };

QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret, config);
