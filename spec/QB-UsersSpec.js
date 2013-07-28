describe('QuickBlox SDK - User functions', function() {
  var quickBlox = new QuickBlox();
  var session, done;

  beforeEach(function(){
    quickBlox.init(CONFIG);
    // create a session
    runs(function(){
      done = false;
      quickBlox.createSession(function (err, result){
          expect(err).toBe(null);
          session = result;
          done = true;
      });
    });
    waitsFor(function(){
      return done;
    },'create session', TIMEOUT);
  });

  it('should be able to list users', function(){
    var users, done;
    expect(session).not.toBe(null);
    runs(function(){
      done = false;
      quickBlox.listUsers(function(err, results){
        expect(err).toBe(null);
        users = results;
        done = true;
      });
    });
    waitsFor(function(){
      return done;
    },'list users', TIMEOUT);
  });

});
