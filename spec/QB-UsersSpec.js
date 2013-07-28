describe('QuickBlox SDK - User functions', function() {
  var quickBlox = new QuickBlox(), session;

  beforeEach(function(){
    var done;
    quickBlox.init(CONFIG);
    runs(function(){
      done = false;
      quickBlox.createSession(function (err, result){
          expect(err).toBeNull();
          session = result;
          expect(session).not.toBeNull();
          done = true;
      });
    });
    waitsFor(function(){
      return done;
    },'create session', TIMEOUT);
  });

  it('should be able to list users', function(){
    var done, result;
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
      expect(result.total_entries).toBeGreaterThan(0);
    });
  });

  it('should be able to filter users away (email nobody@nowhere.org)', function() {
    var done, result;
    params = {filter: { type: 'email', value: 'nobody@nowhere.org' }};
    runs(function(){
      done = false;
      quickBlox.listUsers(params, function(err, res){
        expect(err).toBeNull();
        result = res;
        done = true;
      });
    });
    waitsFor(function isDone(){
      return done;
      }, 'filter users', TIMEOUT);
    runs(function(){
      expect(result).not.toBeNull();
      expect(result.items.length).toBe(0);
    });
  });

});
