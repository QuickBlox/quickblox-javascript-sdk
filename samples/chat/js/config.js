var QBApp = {
    appId: 10,
    authKey: 'XR-B4J64ad6SGvL',
    authSecret: 'Nw27vzzEVfNXw47'
};

var config = {
    endpoints: {
      api: "apikafkacluster.quickblox.com", // set custom API endpoint
      chat: "chatkafkacluster.quickblox.com" // set custom Chat endpoint
    },
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
        id: 4275,
        name: 'js_jasmine22',
        login: 'js_jasmine22',
        pass: 'js_jasmine22'
    },
    QBUser2 = {
        id: 4276,
        name: 'js_jasmine222',
        login: 'js_jasmine222',
        pass: 'js_jasmine222'
    };

QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret, config);

$('.j-version').text('v.' + QB.version + '.' + QB.buildNumber);
