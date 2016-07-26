var QBApp = {
    appId: 92,
    authKey: 'wJHdOcQSxXQGWx5',
    authSecret: 'BTFsj7Rtt27DAmT'
};

var config = {
    debug: {
        mode: 1,
        file: null
    },
    chatProtocol: {
        active: 2
    }
};

var QBUser1 = {
        id: 5449353,
        name: 'rosteruser111',
        login: 'rosteruser111',
        pass: 'rosteruser111'
    },
    QBUser2 = {
        id: 5449354,
        name: 'rosteruser112',
        login: 'rosteruser112',
        pass: 'rosteruser112'
    };

QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret, config);
