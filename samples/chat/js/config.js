var QBApp = {
    appId: 16,
    authKey: 'E5y5Ug8xXrKdz57',
    authSecret: 'DtD9zbS28New6tg'
};

var config = {
	endpoints: {
		api: "apistage4.quickblox.com", // set custom API endpoint
		chat: "chatstage4.quickblox.com" // set custom Chat endpoint
	},
    chatProtocol: {
        active: 2
    },
    debug: {
        mode: 0,
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
    },
	streamManagement: {
    	enable: true
	}
};

var QBUser1 = {
		id: 619,
		name: 'user1user1',
		login: 'user1user1',
		pass: 'user1user1'
	},
    QBUser2 = {
	    id: 620,
	    name: 'user2user2',
	    login: 'user2user2',
	    pass: 'user2user2'
    };

QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret, config);