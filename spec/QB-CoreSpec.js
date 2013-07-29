describe('QuickBlox SDK - Basic functions', function() {
  var quickBlox, done;

  beforeEach(function (){
    quickBlox = new QuickBlox();
  });

  it('can be instantiate', function(){
    expect(new QuickBlox()).not.toBeNull();
  });

  describe('Default settings', function(){
    it('should know api endpoints and paths', function(){
      expect(quickBlox.urls).toEqual(DEFAULTS.urls);
    });
    it('should have the correct default config', function(){
      expect(quickBlox.config).toEqual(DEFAULTS.config);
    });
  });

  describe('Configuration values', function(){
    it('should load a config', function(){
      quickBlox.init(CONFIG.appId, CONFIG.authKey, CONFIG.authSecret, CONFIG.debug);
      expect(quickBlox.config).toEqual(CONFIG);
    });
  });

  describe('Session functions', function(){
    beforeEach(function (){
      quickBlox.init(CONFIG);
    });

    it('should be able to create a session', function(){
      var done = false, session, error;
      runs(function(){
        quickBlox.createSession(function (err, result){
          error = err;
          sesison = result;
          done = true;
        });
      });
      waitsFor(function(){
        return done;
      },'create session', TIMEOUT);
      runs(function(){
        expect(error).toBeNull();
        expect(session).not.toBeNull();
      });
    });

    it('should be able to delete a session', function(){
      var done = false, session, error;
      runs(function(){
        quickBlox.createSession(function (err, result){
          expect(err).toBe(null);
          quickBlox.destroySession(function (err, result){
            expect(err).toBeNull();
            done = true;
          });
        });
      });
      waitsFor(function(){
        return done;
      },'delete session', TIMEOUT);
      runs(function(){
        expect(error).toBeNull();
        expect(session).not.toBeNull();
      });
    });
  });

});
