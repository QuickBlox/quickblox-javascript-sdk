describe('Session API', function() {
  'use strict';

  var REST_REQUESTS_TIMEOUT = 3000;

  var isNodeEnv = typeof window === 'undefined' && typeof exports === 'object';
  var request = isNodeEnv ? require('request') : {};

  var QB = isNodeEnv ? require('../js/qbMain') : window.QB;
  var CREDENTIALS = isNodeEnv ? require('./config').CREDENTIALS : window.CREDENTIALS;
  var CONFIG =  isNodeEnv ? require('./config').CONFIG : window.CONFIG;
  var QBUser1 = isNodeEnv ? require('./config').QBUser1 : window.QBUser1;

  /**
   * TEST CASES
   */
  it('can init SDK with session token and appId', function(){
    QB.init('56655ac9a0eb476d92002b66', CREDENTIALS.appId);

    expect(QB.service.qbInst.config.creds.appId).toEqual(CREDENTIALS.appId);
  });

  it('can init SDK with appId, authKey, authSecret, config', function(){
    QB.init(CREDENTIALS.appId, CREDENTIALS.authKey, CREDENTIALS.authSecret, CONFIG);

    expect(QB.service.qbInst.config.creds.appId).toEqual(CREDENTIALS.appId);
    expect(QB.service.qbInst.config.creds.authKey).toEqual(CREDENTIALS.authKey);
    expect(QB.service.qbInst.config.creds.authSecret).toEqual(CREDENTIALS.authSecret);
    expect(QB.service.qbInst.config.debug).toEqual(CONFIG.debug);
  });

  it('can create a session', function(done){
    QB.createSession(function (err, session){
      if(err){
        done.fail("Create a session error: " + JSON.stringify(err));
      }else{
        expect(session).not.toBeNull();
        expect(session.application_id).toEqual(CREDENTIALS.appId);

        done();
      }
    });
  }, REST_REQUESTS_TIMEOUT);

  it('can create a User session', function(done){
    QB.createSession(QBUser1, function (err, session){
      if(err){
        done.fail("Create a User session error: " + JSON.stringify(err));
      }else{
        expect(session).not.toBeNull();
        expect(session.application_id).toEqual(CREDENTIALS.appId);
        expect(session.user_id).toEqual(QBUser1.id);

        done();
      }
    });
  }, REST_REQUESTS_TIMEOUT);

  it('can login a user', function(done){
    QB.login(QBUser1, function (err, user){
      if(err){
        done.fail("Login user error2: " + JSON.stringify(err));
      }else{
        expect(user).not.toBeNull();
        expect(user.login).toEqual(QBUser1.login);
        expect(user.id).toEqual(QBUser1.id);

        done();
      }
    });
  }, REST_REQUESTS_TIMEOUT);

  it('can logout a user', function(done){
    QB.logout(function(err, result){
      if(err){
        done.fail("Logout user error3: " + JSON.stringify(err));
      }else{
        expect(null).toBeNull(); /** we just have to have some expectations. */

        done();
      }
    });
  }, REST_REQUESTS_TIMEOUT);

  it('can destroy a session', function(done){
    QB.destroySession(function (err, result){
      if(err){
        done.fail("Destroy session error2: " + JSON.stringify(err));
      }else{
        expect(QB.service.qbInst.session).toBeNull();

        done();
      }
    });
  }, REST_REQUESTS_TIMEOUT);

  it('can connect to custom domains', function(){
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

    QB.init(CREDENTIALS.appId, CREDENTIALS.authKey, CREDENTIALS.authSecret, CUSTOMCONFIG);

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

    QB.init(CREDENTIALS.appId, CREDENTIALS.authKey, CREDENTIALS.authSecret, CUSTOMCONFIG2);

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

    QB.init(CREDENTIALS.appId, CREDENTIALS.authKey, CREDENTIALS.authSecret, DEFAULTCONFIG);

    expect(QB.service.qbInst.config.endpoints.api).toEqual('api.quickblox.com');
    expect(QB.service.qbInst.config.endpoints.chat).toEqual('chat.quickblox.com');
    expect(QB.service.qbInst.config.endpoints.muc).toEqual('muc.chat.quickblox.com');
    expect(QB.service.qbInst.config.chatProtocol.bosh).toEqual('https://chat.quickblox.com:5281');
    expect(QB.service.qbInst.config.chatProtocol.websocket).toEqual('wss://chat.quickblox.com:5291');
  });
});
