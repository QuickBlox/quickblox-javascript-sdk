export const QBConfig = {
    credentials: {
        appId: 75949,
        accountKey: 'uK_8uinNyz8-npTNB6tx',
        authKey: 'DdS7zxMEm5Q7DaS',
        authSecret: 'g88RhdOjnDOqFkv',
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
