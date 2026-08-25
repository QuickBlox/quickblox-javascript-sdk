const env = import.meta.env;
const appId = Number(env.VITE_QB_APP_ID);

const emptyProxyConfig = {
  api: '',
  servername: '',
  port: '',
};

const emptyWidgetConfig = {
  smartChatAssistantId: '',
  organizationName: '',
  openAIModel: '',
  apiKey: '',
  maxTokens: 0,
  useDefault: true,
  proxyConfig: emptyProxyConfig,
};

export const QBConfig = {
  credentials: {
    appId,
    authKey: env.VITE_QB_AUTH_KEY || '',
    authSecret: env.VITE_QB_AUTH_SECRET || '',
    accountKey: env.VITE_QB_ACCOUNT_KEY || '',
    sessionToken: '',
  },
  configAIApi: {
    AIAnswerAssistWidgetConfig: {
      ...emptyWidgetConfig,
    },
    AITranslateWidgetConfig: {
      ...emptyWidgetConfig,
      defaultLanguage: 'English',
      languages: ['English'],
    },
    AIRephraseWidgetConfig: {
      ...emptyWidgetConfig,
      defaultTone: 'Professional',
      Tones: [],
    },
  },
  appConfig: {
    maxFileSize: 100 * 1000000,
    sessionTimeOut: 122,
    debug: false,
    enableForwarding: true,
    enableReplying: true,
    enableCopying: true,
    enableEditing: true,
    enableDeleting: true,
    chatProtocol: {
      active: 2,
    },
    endpoints: {
      api: 'api.quickblox.com',
      chat: 'chat.quickblox.com',
    },
    streamManagement: {
      enable: true,
    },
  },
};

export const isQBConfigReady = Boolean(
  QBConfig.credentials.appId &&
    QBConfig.credentials.authKey &&
    QBConfig.credentials.authSecret &&
    QBConfig.credentials.accountKey,
);
