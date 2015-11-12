'use strict';

describe('WebRTC API', function() {
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


  it('can create a session', function() {
    session = QB.webrtc.createNewSession( getAllCalees(QBUsers), 2, QBUser2.id );

    expect(session).not.toBeNull();
    expect(session.ID).not.toBeNull();
    expect(session.opponentsIDs).toEqual( jasmine.any(Array) );
  });


  it('can not create a session with the same opponents', function() {
    var errorString = 'Can\'t create a session with the same opponentsIDs. There is a session already in NEW or ACTIVE state.';

    expect(function() {
      QB.webrtc.createNewSession( getAllCalees(QBUsers) );
    }).toThrow( new Error(errorString) );
  });


  it('can get user media', function(done) {
    var mediaParams = {
      audio: true,
      video: true,
      options: {
        muted: true,
        mirror: true
      }
    };

    session.getUserMedia(mediaParams, function(err, stream) {
      if(err) {
        done.fail('getUserMedia: No access to mic or camera;');
      } else {
        expect(stream).not.toBeNull();
        done();
      }
    });
  });

  it('can call', function(done) {
    session.call({});

    expect(session.state).toEqual(2);
    done();
  });


  it('can stop the session', function(done) {
    session.stop({});

    expect(session.state).toEqual(5);

    done();
  });

});
