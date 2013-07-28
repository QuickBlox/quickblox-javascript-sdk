describe("QuickBlox SDK - Basic functions", function() {
  var quickBlox;

  beforeEach(function (){
    quickBlox = new QuickBlox();
  });

  it("can be instantiate", function(){
    expect(new QuickBlox()).not.toBe(null);
  });

  describe("Default settings", function(){
    it("should know api endpoints and paths", function(){
      expect(quickBlox.urls).toEqual(DEFAULTS.urls);
    });
  
    it("should have the correct default config", function(){
      expect(quickBlox.config).toEqual(DEFAULTS.config);
    });
  });

  describe("Configuration values", function(){
    beforeEach(function (){
      quickBlox.init(CONFIG.appId, CONFIG.authKey, CONFIG.authSecret, CONFIG.debug);
    });

    it("should load a config", function(){
      expect(quickBlox.config).toEqual(CONFIG);
    });
  });

  describe("Session functions", function(){

    beforeEach(function (){
      quickBlox.init(CONFIG);
    });

    it("should be able to create a session", function(){
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
      },"waiting failed", TIMEOUT);

      runs(function(){
        expect(error).toBe(null);
        expect(session).not.toBe(null);
      });
    });

    it("should be able to delete a session", function(){
      var done = false, session, error;

      runs(function(){
        quickBlox.createSession(function (err, result){
          expect(err).toBe(null);
          quickBlox.destroySession(function (err, result){
            expect(err).toBe(null);
            done = true;
          });
        });
      });

      waitsFor(function(){
        return done;
      },"waiting failed", TIMEOUT);

      runs(function(){
        expect(error).toBe(null);
        expect(session).not.toBe(null);
      });
    });

  });

});
