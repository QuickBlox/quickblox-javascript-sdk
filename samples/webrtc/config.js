var QBApp = {
  appId: 28287,
  authKey: 'XydaWcf8OO9xhGT',
  authSecret: 'JZfqTspCvELAmnW'
};

var CONFIG = {
  debug: true,
  webrtc: {
    answerTimeInterval: 30,
    dialingTimeInterval: 5,
    disconnectTimeInterval: 30
  }
};

var USE_DEV_USERS = true;

// dev users
//
if(USE_DEV_USERS){

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

// prod users
//
}else{
  var QBUsers = [
    {
      id: 5395743,
      login: 'webuser111',
      password: 'webuser111',
      full_name: 'User 1',
      colour: 'FD8209'
    },
    {
      id: 5395747,
      login: 'webuser112',
      password: 'webuser112',
      full_name: 'User 2',
      colour: '11a209'
    },
    {
      id: 5681538,
      login: 'webuser113',
      password: 'webuser113',
      full_name: 'User 3',
      colour: '11a2a9'
    },
    {
      id: 5719859,
      login: 'webuser114',
      password: 'webuser114',
      full_name: 'User 4',
      colour: '51c209'
    },
    {
      id: 5719860,
      login: 'webuser115',
      password: 'webuser115',
      full_name: 'User 5',
      colour: '511209'
    },
    {
      id: 5719866,
      login: 'webuser116',
      password: 'webuser116',
      full_name: 'User 6',
      colour: '01e209'
    }
  ];
}

var MESSAGES = {
  'login': 'Login as any user on this computer and another user on another computer.',
  'create_session': 'Creating a session...',
  'connect': 'Connecting...',
  'connect_error': 'Something wrong with connect to chat. Check internet connection or user info and trying again.',
  'login_as': 'Logged in as ',
  'title_login': 'Choose a user to login with:',
  'title_callee': 'Choose users to call:',
  'calling': 'Calling...',
  'webrtc_not_avaible': 'WebRTC is not available in your browser',
  'no_internet': 'Please check your Internet connection and try again'
};
