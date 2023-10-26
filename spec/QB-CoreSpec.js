'use strict';

var REST_REQUESTS_TIMEOUT = 10000;

var isNodeEnv = typeof window === 'undefined' && typeof exports === 'object';

var QuickBlox = isNodeEnv ? require('../src/qbMain') : window.QB;
var QB;
var QBtmp;

var CREDS = isNodeEnv ? require('./config').CREDS : window.CREDS;
var CONFIG = isNodeEnv ? require('./config').CONFIG : window.CONFIG;
var QBUser1 = isNodeEnv ? require('./config').QBUser1 : window.QBUser1;

describe('QB init tests', function () {

  beforeEach(function () {
    QB = new QuickBlox.QuickBlox();
  });

  it('1. can init SDK with session token and appId (without accountKey)', function () {
    QB.init('56655ac9a0eb476d92002b66', CREDS.appId);

    expect(QB.service.qbInst.config.creds.appId).toEqual(CREDS.appId);
  });

  ///
  it('2. can init SDK with appId, accountKey, config ', function () {
    QB.initWithAppId(CREDS.appId, CREDS.accountKey, CONFIG);

    expect(QB.service.qbInst.config.creds.appId).toEqual(CREDS.appId);
    expect(QB.service.qbInst.config.creds.accountKey).toEqual(CREDS.accountKey);
    expect(QB.service.qbInst.config.debug).toEqual(CONFIG.debug);
  });

  it('2.1. can init SDK with wrong type of appId', function () {
    expect( function(){
      QB.initWithAppId(CREDS.appId.toString(), CREDS.accountKey, CONFIG);
    } ).toThrow(new Error('Type of appId must be a number'));


  });

  ///

  it('3. can init SDK with appId, authKey, authSecret, accountKey, config', function () {
    QB.init(CREDS.appId, CREDS.authKey, CREDS.authSecret, CREDS.accountKey, CONFIG);

    expect(QB.service.qbInst.config.creds.appId).toEqual(CREDS.appId);
    expect(QB.service.qbInst.config.creds.authKey).toEqual(CREDS.authKey);
    expect(QB.service.qbInst.config.creds.authSecret).toEqual(CREDS.authSecret);
    expect(QB.service.qbInst.config.creds.accountKey).toEqual(CREDS.accountKey);
    expect(QB.service.qbInst.config.debug).toEqual(CONFIG.debug);
  });

  it('4. can init SDK with appId, authKey, authSecret, config (without accountKey)', function () {
    QB.init(CREDS.appId, CREDS.authKey, CREDS.authSecret, undefined, CONFIG);

    expect(QB.service.qbInst.config.creds.appId).toEqual(CREDS.appId);
    expect(QB.service.qbInst.config.creds.authKey).toEqual(CREDS.authKey);
    expect(QB.service.qbInst.config.creds.authSecret).toEqual(CREDS.authSecret);
    expect(QB.service.qbInst.config.debug).toEqual(CONFIG.debug);
  });

});

describe('Ping tests', function () {

  beforeAll(function (done) {
    QB = new QuickBlox.QuickBlox();
    QB.init(
      CREDS.appId,
      CREDS.authKey,
      CREDS.authSecret,
      CREDS.accountKey,
      CONFIG
    );
    var chatConnectParams = {
      userId: QBUser1.id,
      password: QBUser1.password
    };
    console.log('Test SDK.... call QB-CoreSpec.js 62 line QB.chat.connect');
    QB.chat.connect(chatConnectParams, function(err) {
      if (err) {
        done.fail('Connection to chat error: ' + JSON.stringify(err));
      } else {
        done();
      }
    });
  });

  afterAll(function () {
    QB.chat.disconnect();
  });

  it('should ping shared chat server', function (done) {
    QB.chat.ping(function (err) {
      if (err) {
        done.fail(err);
      } else {
        done();
      }
    });
  });

  it('should ping logged-in user and respond with pong', function (done) {
    QB.chat.ping(QBUser1.id, function (err) {
      if (err) {
        done.fail(err);
      } else {
        done();
      }
    });
  });

  it('should return error within "pingTimeout"', function (done) {
    QB.chat.ping(-1, function (err) {
      expect(err).toEqual('No answer');
      done();
    });
  });

});

describe('1. Session API', function () {

  beforeAll(function () {
    QB = new QuickBlox.QuickBlox();
    QB.init(CREDS.appId, CREDS.authKey, CREDS.authSecret, CREDS.accountKey, CONFIG);
  });

  it('can create an App session', function (done) {
    QB.createSession(function (err, session) {
      if (err) {
        done.fail('Create a session error: ' + JSON.stringify(err));
      } else {
        expect(session).not.toBeNull();
        expect(session.application_id).toEqual(CREDS.appId);

        done();
      }
    });
  }, REST_REQUESTS_TIMEOUT);

  it('can create a User session', function (done) {
    QB.createSession(QBUser1, function (err, session) {
      if (err) {
        done.fail("Create a User session error: " + JSON.stringify(err));
      } else {
        expect(session).not.toBeNull();
        expect(session.application_id).toEqual(CREDS.appId);
        expect(session.user_id).toEqual(QBUser1.id);

        done();
      }
    });
  }, REST_REQUESTS_TIMEOUT);

  it('can login a user', function (done) {
    QB.login(QBUser1, function (err, user) {
      if (err) {
        done.fail("Login user error2: " + JSON.stringify(err));
      } else {
        expect(user).not.toBeNull();
        expect(user.login).toEqual(QBUser1.login);
        expect(user.id).toEqual(QBUser1.id);

        done();
      }
    });
  }, REST_REQUESTS_TIMEOUT);

  it('can logout a user', function (done) {
    QB.logout(function (err, result) {
      if (err) {
        done.fail("Logout user error3: " + JSON.stringify(err));
      } else {
        expect(null).toBeNull(); /** we just have to have some expectations. */

        done();
      }
    });
  }, REST_REQUESTS_TIMEOUT);

  it('can destroy a session', function (done) {
    QB.destroySession(function (err, result) {
      if (err) {
        done.fail("Destroy session error2: " + JSON.stringify(err));
      } else {
        expect(QB.service.qbInst.session).toBeNull();

        done();
      }
    });
  }, REST_REQUESTS_TIMEOUT);

  it('can connect to custom domains', function () {
    /** Test old way to set domains */
    var CUSTOMCONFIG = {
      endpoints: {
        api: 'apicustomdomain.quickblox.com',
        chat: 'chatcustomdomain.quickblox.com',
        muc: 'muc.chatcustomdomain.quickblox.com'
      },
      chatProtocol: {
        bosh: 'https://chatcustomdomain.quickblox.com:5281',
        websocket: 'wss://chatcustomdomain.quickblox.com:5291'
      }
    };

    QB.init(CREDS.appId, CREDS.authKey, CREDS.authSecret, CREDS.accountKey, CUSTOMCONFIG);

    expect(QB.service.qbInst.config.endpoints.api).toEqual('apicustomdomain.quickblox.com');
    expect(QB.service.qbInst.config.endpoints.chat).toEqual('chatcustomdomain.quickblox.com');
    expect(QB.service.qbInst.config.endpoints.muc).toEqual('muc.chatcustomdomain.quickblox.com');
    expect(QB.service.qbInst.config.chatProtocol.bosh).toEqual('https://chatcustomdomain.quickblox.com:5281');
    expect(QB.service.qbInst.config.chatProtocol.websocket).toEqual('wss://chatcustomdomain.quickblox.com:5291');

    /** Test new way to set domains */
    var CUSTOMCONFIG2 = {
      endpoints: {
        api: 'apicustomdomain2.quickblox.com',
        chat: 'chatcustomdomain2.quickblox.com'
      }
    };

    QB.init(CREDS.appId, CREDS.authKey, CREDS.authSecret, CREDS.accountKey, CUSTOMCONFIG2);

    expect(QB.service.qbInst.config.endpoints.api).toEqual('apicustomdomain2.quickblox.com');
    expect(QB.service.qbInst.config.endpoints.chat).toEqual('chatcustomdomain2.quickblox.com');
    expect(QB.service.qbInst.config.endpoints.muc).toEqual('muc.chatcustomdomain2.quickblox.com');
    expect(QB.service.qbInst.config.chatProtocol.bosh).toEqual('https://chatcustomdomain2.quickblox.com:5281');
    expect(QB.service.qbInst.config.chatProtocol.websocket).toEqual('wss://chatcustomdomain2.quickblox.com:5291');

    /** return back to default domains */
    var DEFAULTCONFIG = {
      endpoints: {
        api: 'api.quickblox.com',
        chat: 'chat.quickblox.com'
      }
    };

    QB.init(CREDS.appId, CREDS.authKey, CREDS.authSecret, CREDS.accountKey, DEFAULTCONFIG);

    expect(QB.service.qbInst.config.endpoints.api).toEqual('api.quickblox.com');
    expect(QB.service.qbInst.config.endpoints.chat).toEqual('chat.quickblox.com');
    expect(QB.service.qbInst.config.endpoints.muc).toEqual('muc.chat.quickblox.com');
    expect(QB.service.qbInst.config.chatProtocol.bosh).toEqual('https://chat.quickblox.com:5281');
    expect(QB.service.qbInst.config.chatProtocol.websocket).toEqual('wss://chat.quickblox.com:5291');
  });
});

describe('2. Session API. Init with User Session token tests', function () {

  beforeAll(function () {
    QB = new QuickBlox.QuickBlox();
    QB.initWithAppId(CREDS.appId, CREDS.accountKey, CONFIG);
  });

  // afterAll(function () {
  //   QB.chat.disconnect();
  //   QB.destroySession(function (err, result) {
  //
  //   });
  // });

  it(`0.0. get session token for tests token value is ${CREDS.sessionToken}`, function () {
    //
    //
    QBtmp = new QuickBlox.QuickBlox();
    QBtmp.init(
        CREDS.appId,
        CREDS.authKey,
        CREDS.authSecret,
        CREDS.accountKey,
        CONFIG
    );
    //get the user session token
    QBtmp.createSession(QBUser1, function (err, session) {
      if (err) {
        done.fail("Create a User session error: " + JSON.stringify(err));
      } else {
        expect(session).not.toBeNull();
        expect(session.application_id).toEqual(CREDS.appId);
        expect(session.user_id).toEqual(QBUser1.id);
        expect(session.token).not.toBeUndefined();
      }
    });
    //
    //
  });

  it('1.1. can not call startSessionWithToken without callback function', function () {
    expect( function(){
      QB.startSessionWithToken('56655ac9a0eb476d92002b66' , null);
    } ).toThrow(new Error('Cannot start session without callback function'));

  });

  it('1.2. can not call startSessionWithToken with null value for session token', function () {
    expect( function(){
      QB.startSessionWithToken(null, function (err, session){});
    } ).toThrow(new Error('Cannot start session with null value token'));

  });

  it('1.3. can not call startSessionWithToken with empty string value for session token', function () {
    expect( function(){
      QB.startSessionWithToken('', function (err, session){});
    } ).toThrow(new Error('Cannot start session with empty string token'));

  });

  it(`2.can start a session with token from user session`, function () {
    //
    //
    QBtmp = new QuickBlox.QuickBlox();
    QBtmp.init(
        CREDS.appId,
        CREDS.authKey,
        CREDS.authSecret,
        CREDS.accountKey,
        CONFIG
    );
    //get the user session token
    QBtmp.createSession(QBUser1, function (err, usrSession) {
      if (err) {
        done.fail("Create a User session error: " + JSON.stringify(err));
      } else {
        expect(usrSession).not.toBeNull();
        expect(usrSession.application_id).toEqual(CREDS.appId);
        expect(usrSession.user_id).toEqual(QBUser1.id);
        expect(usrSession.token).not.toBeUndefined();
        //
        QB.startSessionWithToken(usrSession.token, function (err, openSession) {
          if (err) {
            done.fail('Start a session with token error: ' + JSON.stringify(err));
          } else {
            expect(openSession).not.toBeNull();
            expect(openSession.application_id).toEqual(CREDS.appId);
            expect(openSession.user_id).toEqual(QBUser1.id);
            expect(openSession.token).not.toBeUndefined();
            //connect to chat
            var chatConnectParams = {
              userId: QBUser1.id,
              password: openSession.token
            };
            console.log('Test SDK.... call QB-CoreSpec.js 296 line QB.chat.connect');
            QB.chat.connect(chatConnectParams, function(err) {
              if (err) {
                done.fail('Connection to chat error: ' + JSON.stringify(err));
              } else {
                done('Test SDK.... call QB-CoreSpec.js 410 line QB.chat.connect');
              }
            });
            //
          }
        });

        //
        done();
      }
    });
    //
    //
  });

  xit('3. can destroy a session', function (done) {
    QB.destroySession(function (err, result) {
      if (err) {
        done.fail("Destroy session error: " + JSON.stringify(err));
      } else {
        expect(QB.service.qbInst.session).toBeNull();

        done();
      }
    });
  }, REST_REQUESTS_TIMEOUT);

});

