export const QBconfig = {
  credentials: {
    appId: 'YOUR_APP_ID',
    authKey: 'YOUR_AUTH_KEY',
    authSecret: 'DcFckTJd-hk',
    accountKey: 'Ks9sNV-F11T6Z3g'
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

export const CONSTANTS = {
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
  },
  NOTIFICATION_TYPES: {
    NEW_DIALOG: '1',
    UPDATE_DIALOG: '2',
    LEAVE_DIALOG: '3'
  }
};
