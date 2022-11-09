var creds = {
  'appId': 0,
  'authKey': '',
  'authSecret': '',
  'accountKey': ''
};

var config = {
  debug: false,
  endpoints: {
    api: "api.quickblox.com",
    chat: "chat.quickblox.com"
  },
  webrtc: {
    answerTimeInterval: 60,
    dialingTimeInterval: 5
  }
};

var MESSAGES = {
  no_server_error: 'The "server" query parameter is not set. You need to provide it in order to run the sample. Multi-conference server is available only for Enterprise plans. Please refer to https://docs.quickblox.com/docs/js-video-conference for more information and contacts.'
};

var CONFIG = {
  CREDENTIALS: creds,
  APP_CONFIG: config,
  MESSAGES: MESSAGES
};
