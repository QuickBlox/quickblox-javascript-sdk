'use strict';

describe('QuickBlox SDK - WebRTC', function() {
  /**
   * [getAllCalees]
   * @return {[array]}      [array of calles's id]
   */
  var session = null;

  function getAllCalees(users) {
    var arr = [];

    users.forEach(function(el) { 
      arr.push(el.id); 
    });

    return arr;
  }

  beforeAll(function(done) {
    QB.init(CONFIG.appId, CONFIG.authKey, CONFIG.authSecret);

    session = QB.webrtc.createNewSession( getAllCalees(QBUsers) );

    done();
  });

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

  it('can reject session;', function(done) {
    session.reject();

    expect(session.state).toEqual( QB.webrtc.SessionConnectionState.CLOSED );

    done();
  });
});