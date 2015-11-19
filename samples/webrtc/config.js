var QBApp = {
  appId: 28287,
  authKey: 'XydaWcf8OO9xhGT',
  authSecret: 'JZfqTspCvELAmnW'
};

var CONFIG = {
  chatProtocol: {
    active: 2,
  },
  debug: true,
  webrtc: {
    answerTimeInterval: 25,
    dialingTimeInterval: 5,
    disconnectTimeInterval: 25
  }
};

var QBUsers = [
  {
    id: 6970356,
    login: 'dev_user_1',
    password: 'dev_user_1',
    full_name: 'User 1',
    colour: 'ffaa00'
  },
  {
    id: 6970368,
    login: 'dev_user_2',
    password: 'dev_user_2',
    full_name: 'User 2',
    colour: '0890ff'
  },
  {
    id: 6970375,
    login: 'dev_user_3',
    password: 'dev_user_3',
    full_name: 'User 3',
    colour: 'ff03a6'
  },
  {
    id: 6970379,
    login: 'dev_user_4',
    password: 'dev_user_4',
    full_name: 'User 4',
    colour: '60e27a'
  }
];

var MESSAGES = {
  'login': 'Login as any user on this computer and another user on another computer.',
  'create_session': 'Creating a session...',
  'connect': 'Connecting...',
  'connect_error': 'Something wrong with connect to chat. Check user info.',
  'login_as': 'Logged in as ',
  'title_login': 'Choose a user to login with:',
  'title_callee': 'Choose users to call:',
  'calling': 'Calling...',
  'accept_call': 'User has accepted the call',
  'webrtc_not_avaible': 'WebRTC is not available in your browser'
};
