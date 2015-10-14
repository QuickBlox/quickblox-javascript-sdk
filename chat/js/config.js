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
  debug: true
};

// var QBUser1 = {
//         id: 6085852,
//         name: 'Affonja',
//         login: 'Affonja',
//         pass: 'CK$TRJa[aB&RGG/Q5vv67SS1[.)'
var QBUser1 = {
        id: 5966645,
        name: 'Zurab',
        login: 'Zurab',
        pass: '12121212'
    },
    QBUser2 = {
        id: 5967981,
        name: 'Gusha',
        login: 'Gusha',
        pass: '12121212'
    };

QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret, config);
