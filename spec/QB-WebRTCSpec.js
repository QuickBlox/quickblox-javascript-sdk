'use strict';

describe('QuickBlox SDK - WebRTC', function() {
  var session,
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
        session.call({});

        expect(session.state).toEqual(2);
        done();
      }
    });
  }

  beforeAll(function(done){
    QB.init(CREDENTIALS.appId, CREDENTIALS.authKey, CREDENTIALS.authSecret);

    QB.chat.connect({userId: QBUser2.id, password: QBUser2.pass}, function(err, roster) {
      if(err){
        done.fail("Chat login error: " + JSON.stringify(err));
      }else{
        done();
      }
    });
  }, LOGIN_TIMEOUT);

  it('should create the session;', function() {
    session = QB.webrtc.createNewSession( getAllCalees(QBUsers), 2, QBUser2.id );

    expect(session).not.toBeNull();
    expect(session.ID).not.toBeNull();
    expect(session.opponentsIDs).toEqual( jasmine.any(Array) );
  });

  it('should not create a session with the same opponents;', function() {
    var errorString = 'Can\'t create a session with the same opponentsIDs. There is a session already in NEW or ACTIVE state.';

    expect(function() {
      QB.webrtc.createNewSession( getAllCalees(QBUsers) );
    }).toThrow( new Error(errorString) );
  });

  it('should create the call;', function(done) {
    getUserMediaAndCall(session, done);
  });

  it('should stop the session;', function(done) {
    session.stop({});

    expect(session.state).toEqual(5);

    done();
  });
});