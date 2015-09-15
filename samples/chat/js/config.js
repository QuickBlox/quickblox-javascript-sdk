// var QBApp = {
//   appId: 92,
//   authKey: 'wJHdOcQSxXQGWx5',
//   authSecret: 'BTFsj7Rtt27DAmT'
// };
var QBApp = {
  appId: 28287,
  authKey: 'XydaWcf8OO9xhGT',
  authSecret: 'JZfqTspCvELAmnW'
};

var config = {
  chatProtocol: {
    websocket: 'wss://chat.quickblox.com:5291',
    active: 2
  },
  ssl: true,
  debug: false
};

// var QBUser1 = {
//         id: 9267,
//         name: 'igor',
//         login: 'igor',
//         pass: 'igor8888'
//     },
//     QBUser2 = {
//         id: 4834885,
//         name: 'bloxuser',
//         login: 'bloxuser',
//         pass: 'bloxuser'
//     };

var QBUser1 = {
        id: 5395743,
        name: 'webuser111',
        login: 'webuser111',
        pass: 'webuser111'
    },
    QBUser2 = {
        id: 5395747,
        name: 'webuser112',
        login: 'webuser112',
        pass: 'webuser112'
    };

QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret, config);
