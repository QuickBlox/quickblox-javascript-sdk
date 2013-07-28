describe('QuickBlox SDK - User functions', function() {
  var quickBlox = new QuickBlox();
  var session, done;

  beforeEach(function(){
    quickBlox.init(CONFIG);
    // create a session
    runs(function(){
      done = false;
      quickBlox.createSession(function (err, result){
          expect(err).toBeNull();
          session = result;
          done = true;
      });
    });
    waitsFor(function(){
      return done;
    },'create session', TIMEOUT);
  });

  it('should be able to list users', function(){
    var result, done;
    expect(session).not.toBeNull();
    runs(function(){
      done = false;
      quickBlox.listUsers(function(err, res){
        expect(err).toBeNull();
        result = res;
        done = true;
      });
    });
    waitsFor(function(){
      return done;
    },'list users', TIMEOUT);

    runs(function(){
      expect(result).not.toBeNull();
      expect(result.items.length).toBeGreaterThan(0);
    });
  });

  it('should be able to filter users away!', function() {
    var result, done;
    expect(session).not.toBeNull();
    runs(function(){
      done = false;
      filter = { type: 'email', value: 'nobody@nowhere.org' };
      quickBlox.listUsers({filter: filter}, function(err, res){
        expect(err).toBeNull();
        result = res;
        done = true;
      });
    });
    waitsFor(function(){
      return done;
    },'filter users', TIMEOUT);

    runs(function(){
      expect(result).not.toBeNull();
      expect(result.items.length).toBe(0);
    });

  });

});
