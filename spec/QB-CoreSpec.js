var REST_REQUESTS_TIMEOUT = 3000;

describe('Session API', function() {

  // Load config
  //
  beforeAll(function (){
    QB.init(CREDENTIALS.appId, CREDENTIALS.authKey, CREDENTIALS.authSecret, CONFIG);
    expect(QB.service.qbInst.config.creds.appId).toEqual(CREDENTIALS.appId);
    expect(QB.service.qbInst.config.creds.authKey).toEqual(CREDENTIALS.authKey);
    expect(QB.service.qbInst.config.creds.authSecret).toEqual(CREDENTIALS.authSecret);
    expect(QB.service.qbInst.config.debug).toEqual(CONFIG.debug);
  });


  // Create a session
  //
  it('can create a session', function(done){
    QB.createSession(function (err, session){
      if(err){
        done.fail("Create a session error: " + JSON.stringify(err));
      }else{
        expect(session).not.toBeNull();
        expect(session.application_id).toEqual(CREDENTIALS.appId);
        done();
      }
    });
  }, REST_REQUESTS_TIMEOUT);


  // Create a User session
  //
  it('can create a User session', function(done){

    QB.createSession({login: QBUser1.login, password: QBUser1.pass}, function (err, session){
      if(err){
        done.fail("Create a User session error: " + JSON.stringify(err));
      }else{
        expect(session).not.toBeNull();
        expect(session.application_id).toEqual(CREDENTIALS.appId);
        expect(session.user_id).toEqual(QBUser1.id);
        done();
      }
    });
  }, REST_REQUESTS_TIMEOUT);


  // Destroy a session
  //
  it('can destroy a session', function(done){

    QB.createSession(function (err, result){
      if(err){
        done.fail("Destroy session error1: " + JSON.stringify(err));
      }else{
        QB.destroySession(function (err, result){
          if(err){
            done.fail("Destroy session error2: " + JSON.stringify(err));
          }else{
            expect(QB.service.qbInst.session).toBeNull();
            done()
          }
        });
      }
    });
  }, REST_REQUESTS_TIMEOUT);


  // Login a user
  //
  it('can login a user', function(done){

    QB.createSession(function (err, result){
      if(err){
        done.fail("Login user error1: " + JSON.stringify(err));
      }else{
        QB.login({login: QBUser1.login, password: QBUser1.pass}, function (err, user){
          if(err){
            done.fail("Login user error2: " + JSON.stringify(err));
          }else{
            expect(user).not.toBeNull();
            expect(user.login).toEqual(QBUser1.login);
            expect(user.id).toEqual(QBUser1.id);
            done()
          }
        });
      }
    });
  }, REST_REQUESTS_TIMEOUT);


  // Login a user when initialised with just a valid token
  //
  it('can login a user when initialised with just a valid token', function(done){

    QB.createSession(function (err, session){
      if(err){
        done.fail("Login user when initialised with just a valid token error1: " + JSON.stringify(err));
      }else{
        QB.init(session.token);

        QB.login({login: QBUser1.login, password: QBUser1.pass}, function (err, user){
          if(err){
            done.fail("Login user when initialised with just a valid token error2: " + JSON.stringify(err));
          }else{
            expect(user).not.toBeNull();
            expect(user.login).toEqual(QBUser1.login);
            expect(user.id).toEqual(QBUser1.id);
            done();
          }
        });
      }
    });
  }, REST_REQUESTS_TIMEOUT);


  // Logout a user
  //
  it('can logout a user', function(done){

    QB.createSession(function (err, result){
      if(err){
        done.fail("Logout user error1: " + JSON.stringify(err));
      }else{
        QB.login({login: QBUser1.login, password: QBUser1.pass}, function (err, user){
          if(err){
            done.fail("Logout user error2: " + JSON.stringify(err));
          }else{
            QB.logout(function(err, result){
              if(err){
                done.fail("Logout user error3: " + JSON.stringify(err));
              }else{
                done();
              }
            });
          }
        });
      }
    });
  }, REST_REQUESTS_TIMEOUT);

});
