'use strict';

describe('QuickBlox SDK - WebRTC', function() {
  var session = null,
      LOGIN_TIMEOUT = 10000;

  /**
   * [getAllCalees]
   * @return {[array]}      [array of calles's id]
   */
  function getAllCalees(users) {
    var arr = [];

    users.forEach(function(el) { 
      arr.push(el.id); 
    });

    return arr;
  }

  /**
   * [getUserMedia - wrapper for made async in jasmine]
   */
  function getUserMediaAndCall(session, done) {
    var mediaParams = {
      audio: true,
      video: true,
      elemId: 'localVideo',
      options: {
        muted: true,
        mirror: true
      }
    };

    session.getUserMedia(mediaParams, function(err, stream) {
      if(err) {
        done.fail('getUserMedia: No access to mic or camera;');
      } else {
        done();
      }
    });
  }

  beforeAll(function(done){
    QB.init(CREDENTIALS.appId, CREDENTIALS.authKey, CREDENTIALS.authSecret);

    QB.chat.connect({userId: QBUser1.id, password: QBUser1.pass}, function(err, roster) {
      if(err){
        done.fail("Chat login error: " + JSON.stringify(err));
      }else{
        session = QB.webrtc.createNewSession( getAllCalees(QBUsers) );
        done();
      }
    });
  }, LOGIN_TIMEOUT);

  it('can create session;', function(done) {
    expect(session).not.toBeNull();
    expect(session.ID).not.toBeNull();
    expect(session.opponentsIDs).toEqual( jasmine.any(Array) );

    done();
  });

  it('trying create session one more time with the same opponents;', function(done) {
    var errorString = 'Can\'t create a session with the same opponentsIDs. There is a session already in NEW or ACTIVE state.';

    expect(function() {
      QB.webrtc.createNewSession( getAllCalees(QBUsers) );
    }).toThrow( new Error(errorString) );

    done();
  });

  it('can call;', function(done) {
    getUserMediaAndCall(session, done);

    expect(session.state).toEqual( QB.webrtc.SessionConnectionState.CONNECTING );
  });

  it('can reject session;', function() {
    session.reject();

    expect(session.state).toEqual( QB.webrtc.SessionConnectionState.CLOSED );
  });
});