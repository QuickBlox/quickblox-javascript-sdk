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
    id: 5395743,
    login: 'webuser111',
    password: 'webuser111',
    full_name: 'User 1',
    colour: 'ffaa00'
  },
  {
    id: 5395747,
    login: 'webuser112',
    password: 'webuser112',
    full_name: 'User 2',
    colour: '0890ff'
  },
  {
    id: 5681538,
    login: 'webuser113',
    password: 'webuser113',
    full_name: 'User 3',
    colour: 'ff03a6'
  },
  {
    id: 5719859,
    login: 'webuser114',
    password: 'webuser114',
    full_name: 'User 4',
    colour: '60e27a'
  },
  {
    id: 5719860,
    login: 'webuser115',
    password: 'webuser115',
    full_name: 'User 5',
    colour: '5e55de'
  },
  {
    id: 5719866,
    login: 'webuser116',
    password: 'webuser116',
    full_name: 'User 6',
    colour: 'b831b7'
  }
];

var MESSAGES = {
  'login': 'Login as any user on this computer and another user on another computer.',
  'create_session': 'Creating a session...',
  'connect': 'Connecting to chat...',
  'connect_error': 'Something wrong with connect to chat. Check user info.',
  'login_as': 'Logged in as ',
  'title_login': 'Choose a user to login with:',
  'title_callee': 'Choose a users to call:'
};