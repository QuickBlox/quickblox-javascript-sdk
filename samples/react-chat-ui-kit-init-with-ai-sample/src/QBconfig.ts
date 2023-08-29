export const QBConfig = {
    credentials: {
        appId: -1,
        accountKey: '',
        authKey: '',
        authSecret: '',
        sessionToken: '',
    },
    configAIApi: {
        AIAnswerAssistWidgetConfig: {
            apiKey: '',
            useDefault: true,
            proxyConfig: {
                api: 'v1/chat/completions',
                servername: 'http://localhost',
                port: '3001',
                sessionToken: '',
            },
        },
        AITranslateWidgetConfig: {
            apiKey: '',
            useDefault: true,
            defaultLanguage: 'English',
            languages: [
                'English',
                'Spanish',
                'French',
                'Portuguese',
                'German',
                'Ukrainian',
            ],
            proxyConfig: {
                api: 'v1/chat/completions',
                servername: 'http://localhost',
                port: '3001',
                sessionToken: '',
            },
        },
        AIRephraseWidgetConfig: {
            apiKey: '',
            useDefault: true,
            proxyConfig: {
                api: 'v1/chat/completions',
                servername: 'http://localhost',
                port: '3001',
                sessionToken: '',
            },
        },
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
