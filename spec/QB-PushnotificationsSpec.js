describe('QuickBlox SDK - Messages', function() {
  var session, needsInit = true;

  beforeEach(function(){
    var done;
    if (needsInit){
      QB.init(CONFIG.appId, CONFIG.authKey, CONFIG.authSecret, CONFIG.debug);
      runs(function(){
        done = false;
        QB.createSession({login: VALID_USER, password: VALID_PASSWORD},function (err, result){
            expect(err).toBeNull();
            session = result;
            expect(session).not.toBeNull();
            needsInit = false;
            done = true;
        });
      });
      waitsFor(function(){
        return done;
      },'create session', TIMEOUT);
    }
  });

  describe('Tokens', function(){
    var pushToken;
    it('can create a push token', function(){
      var done;
      runs(function(){
        done = false;
        params = {environment: 'production', client_identification_sequence: 'aw03O90yoKaKhr3NsVjUNdzP732d0sPlIbIUJsLJqoy0EqjVMCEg76fJH0WHIsrn', platform: 'iOS', udid: '5f5930e927660e6e7d8ff0548b3c404a4d16c04f'};
        QB.messages.tokens.create(params, function(err, res){
          pushToken = res;
          done = true;
          expect(err).toBeNull();
        });
      });
      waitsFor(function(){
        return done;
      },'create push token', TIMEOUT);
      runs(function(){
        expect(pushToken).not.toBeNull();
        expect(pushToken.id).toBeGreaterThan(0);
      });
    });

    it('can delete a push token', function(){
      var done;
      runs(function(){
        done = false;
        expect(pushToken).not.toBeNull();
        QB.messages.tokens.delete(pushToken.id, function(err, res){
          expect(err).toBeNull();
          done = true;
        });
      });
      waitsFor(function(){
        return done;
      },'delete push token', TIMEOUT);
    });
  });

  describe('Subscriptions', function(){
    it('can create a subscription', function(){
      var subscription, done;
      runs(function(){
        done = false;
        params = {notification_channels: 'apns'};
        QB.messages.subscriptions.create(params, function(err, res){
          subscription = res;
          done = true;
          expect(err).toBeNull();
        });
      });
      waitsFor(function(){
        return done;
      },'create subscription', TIMEOUT);
      runs(function(){
        expect(subscription).not.toBeNull();
        expect(subscription.token).not.toBeNull();
      });
    });

    it('can list subscriptions', function(){
      var done, result;
      runs(function(){
        done = false;
        QB.messages.subscriptions.list(function(err, res){
          result = res;
          done = true;
          expect(err).toBeNull();
        });
      });
      waitsFor(function(){
        return done;
      },'list subscriptions', TIMEOUT);
      runs(function(){
        console.log('subscriptions',result);
        expect(result).not.toBeNull();
        expect(result.length).not.toBeNull();
      });
    });

    it('can delete subscription', function(){
      var done, error, subscription, id;
      runs(function(){
        done = false;
        QB.messages.subscriptions.list(function(err, res) {
          if (res && !err) {
            id = res[0].subscription.id;
            console.log(res[0], id);
            QB.messages.subscriptions.delete(id, function(err, res){
              error = err;
              done = true;
            });
          }
        });
      });
      waitsFor(function(){
        return done;
      },'delete subscription', TIMEOUT);
      runs(function(){
        expect(error).toBeNull();
      });
    });

  });

  /*describe('Events', function(){
    it('can create a pull event', function(){
      var done, result;
      runs(function(){
      done = false;
        params = {notification_type: 'pull', environment:'production', message: window.btoa('QuickBlox JavaScript SDK Spec Event'),
            user: { id : [239647, 245530]},
            end_date:  Math.floor((Date.now() / 1000) +(24*60*60)).toString()};
        QB.messages.events.create(params, function(err, res){
          result = res;
          done = true;
          expect(err).toBeNull();
        });
      });
      waitsFor(function(){
        return done;
      },'create pull event', TIMEOUT * 3);
      runs(function(){
        expect(result).not.toBeNull();
        expect(result.token).not.toBeNull();
      });
    });

    it('can get pull events', function(){
      var done, result;
      runs(function(){
      done = false;
        QB.messages.events.pullEvents(function(err, res){
          result = res;
          done = true;
          expect(err).toBeNull();
        });
      });
      waitsFor(function(){
        return done;
      },'get pull events', TIMEOUT * 3);
      runs(function(){
        expect(result).not.toBeNull();
        expect(result.length).not.toBeNull();
      });
    });
  });*/

});

