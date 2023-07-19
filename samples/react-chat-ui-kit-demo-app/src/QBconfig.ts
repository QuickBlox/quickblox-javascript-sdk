export const QBConfig = {
  credentials: {
    appId: 75950,
    authKey: 'FCdNhkvcBsZbJg5',
    authSecret: 'RSXrOzjP4kZ-WZC',
    accountKey: 'uK_8uinNyz8-npTNB6tx',
    sessionToken: '',
  },
  appConfig: {
    maxFileSize: 10 * 1024 * 1024,
    sessionTimeOut: 122,
    chatProtocol: {
      active: 2,
    },
    debug: true,
    endpoints: {
      api: 'api.quickblox.com',
      chat: 'chat.quickblox.com',
    },
    on: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/require-await
      async sessionExpired(handleResponse: any, retry: any) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        console.log(`Test sessionExpired....${handleResponse} ${retry}`);
      },
    },
    streamManagement: {
      enable: true,
    },
  },
};
