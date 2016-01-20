describe('WebRTC API', function() {
  'use strict';
  var LOGIN_TIMEOUT = 10000;

  var isNodeEnv = typeof window === 'undefined' && typeof exports === 'object';

  var QB = isNodeEnv ? require('../js/qbMain') : window.QB;
  var CREDENTIALS = isNodeEnv ? require('./config').CREDENTIALS : window.CREDENTIALS;
  var CONFIG =  isNodeEnv ? require('./config').CONFIG : window.CONFIG;
  var QBUser1 = isNodeEnv ? require('./config').QBUser1 : window.QBUser1;
  var QBUser2 = isNodeEnv ? require('./config').QBUser2 : window.QBUser2;

  var session;

  beforeAll(function(done){
    QB.init(CREDENTIALS.appId, CREDENTIALS.authKey, CREDENTIALS.authSecret);

    QB.chat.connect({userId: QBUser1.id, password: QBUser1.password}, function(err, roster) {
      if(err){
        done.fail("Chat login error: " + JSON.stringify(err));
      }else{
        done();
      }
    });
  }, LOGIN_TIMEOUT);

  it('can create a session', function() {
    if(isNodeEnv) {
      pending('WebRTC API isn\'t supported outside of the browser');
    }

    session = QB.webrtc.createNewSession([QBUser2.id], QB.webrtc.CallType.VIDEO);

    expect(session).not.toBeNull();
    expect(session.ID).not.toBeNull();
    expect(session.opponentsIDs).toEqual( jasmine.any(Array) );
  });


  it('can not create a session with the same opponents', function() {
    if(isNodeEnv) {
      pending('WebRTC API isn\'t supported outside of the browser');
    }

    var errorString = 'Can\'t create a session with the same opponentsIDs. There is a session already in NEW or ACTIVE state.';

    expect(function() {
      QB.webrtc.createNewSession([QBUser2.id], QB.webrtc.CallType.VIDEO);
    }).toThrow( new Error(errorString) );
  });
});
