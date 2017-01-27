var QBApp = {
    appId: 52816,
    authKey: '28FpyzMXfZydQRG',
    authSecret: 'Qdrw3hGyKV9mSRe'
};

var config = {
    chatProtocol: {
        active: 2
    },
    streamManagement: {
        enable: true
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
        id: 23161730,
        name: 'user2',
        login: 'user2',
        pass: 'test1test'
    },
    QBUser2 = {
        id: 6729119,
        name: 'bloxuser',
        login: 'chatusr22',
        pass: 'chatusr22'
    };

QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret, config);

$('.j-version').text('v.' + QB.version + '.' + QB.buildNumber);
