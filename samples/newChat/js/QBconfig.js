var QBconfig = {
    credentials: {
        appId: 28783,
        authKey: 'b5bVGCHHv6rcAmD',
        authSecret: 'ySwEpardeE7ZXHB'
    },
    appConfig: {
        chatProtocol: {
            active: 2
        },
        streamManagement: {
            enable: true
        },
        debug: {
            mode: 1,
            file: null
        }
    }
};

var appConfig = {
    dilogsPerRequers: 15,
    messagesPerRequest: 30,
    usersPerRequest: 15,
    typingTymeout: 3 // 3 seconds
};

var usersList = [
    {
        id: 25431016,
        name: 'Chat Demo User1',
        login: 'chatdemouser1',
        pass: 'awesomechatpwd'
    },
    {
        id: 25431021,
        name: 'Chat Demo User2',
        login: 'chatdemouser2',
        pass: 'awesomechatpwd'
    },
    {
        id: 25431022,
        name: 'Chat Demo User3',
        login: 'chatdemouser3',
        pass: 'awesomechatpwd'
    },
    {
        id: 25431024,
        name: 'Chat Demo User4',
        login: 'chatdemouser4',
        pass: 'awesomechatpwd'
    },
    {
        id: 25431026,
        name: 'Chat Demo User5',
        login: 'chatdemouser5',
        pass: 'awesomechatpwd'
    },
    {
        id: 25431028,
        name: 'Chat Demo User6',
        login: 'chatdemouser6',
        pass: 'awesomechatpwd'
    },
    {
        id: 25431032,
        name: 'Chat Demo User7',
        login: 'chatdemouser7',
        pass: 'awesomechatpwd'
    },
    {
        id: 25431037,
        name: 'Chat Demo User8',
        login: 'chatdemouser8',
        pass: 'awesomechatpwd'
    },
    {
        id: 25431038,
        name: 'Chat Demo User9',
        login: 'chatdemouser9',
        pass: 'awesomechatpwd'
    },
    {
        id: 25431041,
        name: 'Chat Demo User10',
        login: 'chatdemouser10',
        pass: 'awesomechatpwd'
    }
];

var CONSTANTS = {
    DIALOG_TYPES: {
        CHAT: 3,
        GROUPCHAT: 2,
        PUBLICCHAT: 1
    },
    ATTACHMENT: {
        TYPE: 'image',
        BODY: '[attachment]',
        MAXSIZE: 2 * 1000000, // set 2 megabytes,
        MAXSIZEMESSAGE: 'Image is too large. Max size is 2 mb.'
    }
};
