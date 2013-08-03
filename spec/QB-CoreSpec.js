describe('QuickBlox SDK - Basic functions', function() {
  var quickBlox = QB, done;

  it('can be instantiate', function(){
    expect(quickBlox).not.toBeNull();
  });

  describe('Default settings', function(){
    it('knows api endpoints and paths', function(){
      expect(quickBlox.urls).toEqual(DEFAULTS.urls);
    });
    it('has the correct default config', function(){
      expect(quickBlox.config).toEqual(DEFAULTS.config);
    });
  });

  describe('Configuration values', function(){
    it('can load a config', function(){
      quickBlox.init(CONFIG.appId, CONFIG.authKey, CONFIG.authSecret, CONFIG.debug);
      expect(quickBlox.config).toEqual(CONFIG);
    });
  });

  describe('Session functions', function(){
    beforeEach(function (){
      quickBlox.init(CONFIG);
    });

    it('can create a session', function(){
      var done = false, session, error;
      runs(function(){
        quickBlox.createSession(function (err, result){
          error = err;
          session = result;
          done = true;
        });
      });
      waitsFor(function(){
        return done;
      },'create session', TIMEOUT);
      runs(function(){
        expect(error).toBeNull();
        expect(session).not.toBeNull();
        console.debug('session',session);
        expect(session.application_id).toBe(parseInt(CONFIG.appId,10));
      });
    });

    it('can destroy a session', function(){
      var done = false;
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
        expect(quickBlox.session).toBeNull();
      });
    });
  });

});
