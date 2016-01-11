;(function(window) {
  /**
   * Add parameter to url search
   * for switch users groups
   *
   * Possible options:
   * https://examples.com?users=prod
   * https://examples.com?users=dev 
   * https://examples.com - for qa by default
   */
  var usersQuery = _getQueryVar('users');

  var CONFIG = {
    debug: true,
    webrtc: {
      answerTimeInterval: 30,
      dialingTimeInterval: 5,
      disconnectTimeInterval: 30
    }
  };

  /**
   * QBAppDefault for qa and dev
   * QBAppProd for production
   */
  var QBAppProd = {
    appId: 92,
    authKey: 'wJHdOcQSxXQGWx5',
    authSecret: 'BTFsj7Rtt27DAmT'
  },
  QBAppDefault = {
    appId: 28287,
    authKey: 'XydaWcf8OO9xhGT',
    authSecret: 'JZfqTspCvELAmnW'
  };

  /** set QBApp */
  var QBApp = usersQuery === 'qa' ? QBAppDefault : usersQuery === 'dev' ? QBAppDefault : QBAppProd;

  var QBUsersQA = [
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
  ],
  QBUsersDev = [
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
  ],
  QBUsersProd = [
    {
      id: 2436251,
      login: 'webrtc_user1',
      password: 'x6Bt0VDy5',
      full_name: 'User 1',
      colour: 'FD8209'
    },
    {
      id: 2436254,
      login: 'webrtc_user2',
      password: 'x6Bt0VDy5',
      full_name: 'User 2',
      colour: '1765FB'
    },
    {
      id: 2436257,
      login: 'webrtc_user3',
      password: 'x6Bt0VDy5',
      full_name: 'User 3',
      colour: 'F81480'
    },
    {
      id: 2436258,
      login: 'webrtc_user4',
      password: 'x6Bt0VDy5',
      full_name: 'User 4',
      colour: '39A345'
    },
    {
      id: 2436259,
      login: 'webrtc_user5',
      password: 'x6Bt0VDy5',
      full_name: 'User 5',
      colour: '921392'
    },
    {
      id: 2436262,
      login: 'webrtc_user6',
      password: 'x6Bt0VDy5',
      full_name: 'User 6',
      colour: '6594C5'
    },
    {
      id: 2436263,
      login: 'webrtc_user7',
      password: 'x6Bt0VDy5',
      full_name: 'User 7',
      colour: 'C1061E'
    },
    {
      id: 2436265,
      login: 'webrtc_user8',
      password: 'x6Bt0VDy5',
      full_name: 'User 8',
      colour: '898989'
    },
    {
      id: 2436266,
      login: 'webrtc_user9',
      password: 'x6Bt0VDy5',
      full_name: 'User 9',
      colour: 'C7B325'
    },
    {
      id: 2436269,
      login: 'webrtc_user10',
      password: 'x6Bt0VDy5',
      full_name: 'User 10',
      colour: 'BDA0CA'
    }
  ];

  /** set QBUsers */
  var QBUsers = usersQuery === 'qa' ? QBUsersQA : usersQuery === 'dev' ? QBUsersDev : QBUsersProd;

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

  /**
   * PRIVATE
   */
  /**
   * [_getQueryVar get value of key from search string of url]
   * @param  {[string]} q [name of query]
   * @return {[string]}   [value of query]
   */
  function _getQueryVar(q) {
    var query = window.location.search.substring(1),
        vars = query.split("&"),
        answ = false;

    vars.forEach(function(el, i){
      var pair = el.split('=');

      if(pair[0] === q) {
        answ = pair[1];
      }
    });

    return answ;
  }

  /**
   * set configuration variables in global
   */
  window.QBApp = QBApp;
  window.CONFIG = CONFIG;
  window.QBUsers = QBUsers;
  window.MESSAGES = MESSAGES;
}(window));
