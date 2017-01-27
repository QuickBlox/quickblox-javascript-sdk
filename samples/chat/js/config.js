var QBApp = {
    appId: 28783,
    authKey: 'b5bVGCHHv6rcAmD',
    authSecret: '7yvNe17TnjNUqDoPwfqp'
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
        id: 5605413,
        name: 'sample user3',
        login: '@sampleuser3',
        pass: 'x6Bt0VDy5'
    },
    QBUser2 = {
        id: 11712617,
        name: 'sample user9',
        login: '@sampleuser9',
        pass: 'x6Bt0VDy5'
    };

QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret, config);

$('.j-version').text('v.' + QB.version + '.' + QB.buildNumber);
