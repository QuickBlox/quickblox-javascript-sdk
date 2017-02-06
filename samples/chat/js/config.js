var QBApp = {
    appId: 28783,
    authKey: 'b5bVGCHHv6rcAmD',
    authSecret: 'ySwEpardeE7ZXHB'
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
        id: 23285724,
        name: 'DemoChatUser1',
        login: 'DemoChatUser1',
        pass: 'DemoChatUser1'
    },
    QBUser2 = {
        id: 23285731,
        name: 'DemoChatUser2',
        login: 'DemoChatUser2',
        pass: 'DemoChatUser2'
    };

QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret, config);

$('.j-version').text('v.' + QB.version + '.' + QB.buildNumber);
