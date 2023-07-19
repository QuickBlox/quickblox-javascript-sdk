export const QBConfig = {
    credentials: {
        appId: -1,
        accountKey: '',
        authKey: '',
        authSecret: '',
        sessionToken: '',
    },
    appConfig: {
        chatProtocol: {
            Active: 2,
        },
        debug: false,
        endpoints: {
            apiEndpoint: 'https://api.quickblox.com',
            chatEndpoint: 'chat.quickblox.com',
        },
        on: {
            async sessionExpired(handleResponse: any, retry: any) {
                console.log(`Test sessionExpired… ${handleResponse} ${retry}`);
            }
        },
        streamManagement: {
            Enable: true,
        },
    },
};
