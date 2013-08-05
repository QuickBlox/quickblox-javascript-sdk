describe('QuickBlox SDK - Basic functions', function() {
  var quickBlox = QB, done;

  it('can be instantiate', function(){
    expect(quickBlox).not.toBeNull();
  });

  describe('Default settings', function(){
    it('knows api endpoints and paths', function(){
      expect(quickBlox.config.urls).toEqual(DEFAULTS.urls);
    });
    it('has the correct default config', function(){
      expect(quickBlox.config.creds).toEqual(DEFAULTS.creds);
    });
    it('has debug off by default', function(){
      expect(quickBlox.config.debug).toBe(DEFAULTS.debug);
    });
  });

  describe('Configuration values', function(){
    it('can load a config', function(){
      quickBlox.init(CONFIG.appId, CONFIG.authKey, CONFIG.authSecret, CONFIG.debug);
      expect(quickBlox.config.creds.appId).toEqual(CONFIG.appId);
      expect(quickBlox.config.creds.authKey).toEqual(CONFIG.authKey);
      expect(quickBlox.config.creds.authSecret).toEqual(CONFIG.authSecret);
      expect(quickBlox.config.debug).toBe(CONFIG.debug);
    });
  });

  describe('Session functions', function(){
    beforeEach(function (){
      quickBlox.init(CONFIG);
    });

    it('can create an API session', function(){
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

    it('can create an User session', function(){
      var done = false, session, error;
      runs(function(){
        quickBlox.createSession({login: VALID_USER, password: VALID_PASSWORD}, function (err, result){
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
        expect(session.user_id).toBe(245530);
      });
    });


    it('can destroy a session', function(){
      var done = false;
      runs(function(){
        quickBlox.createSession(function (err, result){
          expect(err).toBe(null);
          quickBlox.destroySession(function (err, result){
            done = true;
            expect(err).toBeNull();
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

    it('can login a user', function(){
      var done = false, user, error;
      runs(function(){
        quickBlox.login({login: VALID_USER, password: VALID_PASSWORD}, function (err, result){
          error = err;
          user = result;
          done = true;
        });
      });
      waitsFor(function(){
        return done;
      },'login user', TIMEOUT);
      runs(function(){
        expect(error).toBeNull();
        expect(user).not.toBeNull();
        expect(user.login).toBe(VALID_USER);
        expect(user.website).toBe('http://quickblox.com');
      });
    });

    it('cannot login an invalid user', function(){
      var done = false, result, error;
      runs(function(){
        quickBlox.login({login: INVALID_USER, password: INVALID_PASSWORD}, function (err, res){
          error = err;
          result = res;
          done = true;
        });
      });
      waitsFor(function(){
        return done;
      },'invalid login user', TIMEOUT);
      runs(function(){
        expect(error).not.toBeNull();
        expect(error.message).toBe('Unauthorized');
      });
    });

    it('can logout a user', function(){
      var done = false, user, error;
      runs(function(){
        quickBlox.login({login: VALID_USER, password: VALID_PASSWORD}, function (err, result){
          quickBlox.logout(function(err, result){
            error = err;
            user = result;
            done = true;
          });
        });
      });
      waitsFor(function(){
        return done;
      },'logout user', TIMEOUT);
      runs(function(){
        expect(error).toBeNull();
        expect(user).not.toBeNull();
        expect(user.login).toBe(VALID_USER);
        expect(user.website).toBe('http://quickblox.com');
      });
    });

  });

});
