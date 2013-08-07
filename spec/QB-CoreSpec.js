describe('QuickBlox SDK - Basic functions', function() {
  var done;

  it('can be instantiate', function(){
    expect(QB).not.toBeNull();
  });

  describe('Default settings', function(){
    it('knows api endpoints and paths', function(){
      expect(QB.config.urls).toEqual(DEFAULTS.urls);
    });
    it('has the correct default config', function(){
      expect(QB.config.creds).toEqual(DEFAULTS.creds);
    });
    it('has debug off by default', function(){
      expect(QB.config.debug).toBe(DEFAULTS.debug);
    });
  });

  describe('Configuration values', function(){
    it('can load a config', function(){
      QB.init(CONFIG.appId, CONFIG.authKey, CONFIG.authSecret, CONFIG.debug);
      expect(QB.config.creds.appId).toEqual(CONFIG.appId);
      expect(QB.config.creds.authKey).toEqual(CONFIG.authKey);
      expect(QB.config.creds.authSecret).toEqual(CONFIG.authSecret);
      expect(QB.config.debug).toBe(CONFIG.debug);
    });
  });

  describe('Session functions', function(){
    beforeEach(function (){
      QB.init(CONFIG);
    });

    it('can create an API session', function(){
      var done = false, session, error;
      runs(function(){
        QB.createSession(function (err, result){
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
        QB.createSession({login: VALID_USER, password: VALID_PASSWORD}, function (err, result){
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
        QB.createSession(function (err, result){
          expect(err).toBe(null);
          QB.destroySession(function (err, result){
            done = true;
            expect(err).toBeNull();
          });
        });
      });
      waitsFor(function(){
        return done;
      },'delete session', TIMEOUT);
      runs(function(){
        expect(QB.session).toBeNull();
      });
    });

    it('can login a user', function(){
      var done = false, user, error;
      runs(function(){
        QB.login({login: VALID_USER, password: VALID_PASSWORD}, function (err, result){
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
        QB.login({login: INVALID_USER, password: INVALID_PASSWORD}, function (err, res){
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
        QB.login({login: VALID_USER, password: VALID_PASSWORD}, function (err, result){
          QB.logout(function(err, result){
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
