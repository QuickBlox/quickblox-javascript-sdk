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
    mode: 1,
    file: null
  },
  stickerpipe: {
    elId: 'stickers_btn',

    apiKey: '847b82c49db21ecec88c510e377b452c',

    enableEmojiTab: false,
    enableHistoryTab: true,
    enableStoreTab: true,

    userId: null,

    priceB: '0.99 $',
    priceC: '1.99 $'
  }
};

var QBUser1 = {
        id: 18065508,
        name: 'dima1',
        login: 'dimajs1',
        pass: 'dimatest'
    }, 
    QBUser2 = {
        id: 18065532,
        name: 'dima2',
        login: 'dimatest2',
        pass: 'dimatest'
    };

QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret, config);
