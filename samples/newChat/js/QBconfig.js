var QBconfig = {
    credentials: {
        appId: 53036,
        authKey: 'ZdJacVeNw3B3FBF',
        authSecret: 'AQadYv32xN54Oad'
    },
    appConfig: {
        chatProtocol: {
            active: 2
        },
        streamManagement: {
            enable: true
        },
        sessionManagement: {
            enable: false,
            onerror: function() {
                console.error('SDK can\'t reestablish a session.');
            }
        },
        debug: {
            mode: 0,
            file: null
        },
    }
};

var appConfig = {
    dilogsPerRequers: 15,
    messagesPerRequest: 30,
    usersPerRequest: 15,
    typingTymeout: 3 // in seconds
};

var usersList = [
    {
        id: 23398045,
        name: 'Chat User 1',
        login: 'chatuser-1',
        pass: 'x6Bt0VDy5'
    },
    {
        id: 23398116,
        name: 'Chat User 2',
        login: 'chatuser-2',
        pass: 'x6Bt0VDy5'
    },
    {
        id: 23398127,
        name: 'Chat User 3',
        login: 'chatuser-3',
        pass: 'x6Bt0VDy5'
    },
    {
        id: 23398133,
        name: 'Chat User 4',
        login: 'chatuser-4',
        pass: 'x6Bt0VDy5'
    },
    {
        id: 23398152,
        name: 'Chat User 5',
        login: 'chatuser-5',
        pass: 'x6Bt0VDy5'
    },
    {
        id: 23398159,
        name: 'Chat User 6',
        login: 'chatuser-6',
        pass: 'x6Bt0VDy5'
    },
    {
        id: 23398166,
        name: 'Chat User 7',
        login: 'chatuser-7',
        pass: 'x6Bt0VDy5'
    },
    {
        id: 23398171,
        name: 'Chat User 8',
        login: 'chatuser-8',
        pass: 'x6Bt0VDy5'
    },
    {
        id: 23398178,
        name: 'Chat User 9',
        login: 'chatuser-9',
        pass: 'x6Bt0VDy5'
    },
    {
        id: 23398182,
        name: 'Chat User 10',
        login: 'chatuser-10',
        pass: 'x6Bt0VDy5'
    }
];
