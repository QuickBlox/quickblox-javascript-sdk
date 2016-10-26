'use strict';

module.exports = {
    QBApp: {
        appId: 16,
        authKey: 'E5y5Ug8xXrKdz57',
        authSecret: 'DtD9zbS28New6tg'
    },
    config: {
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
        streamManagement: {
            enable: true
        }
    },
    QBUser: {
        id: 2649,
        name: 'qbot',
        login: 'qbot',
        pass: 'qbot1qbot'
    }
};
