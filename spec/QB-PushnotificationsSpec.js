var REST_REQUESTS_TIMEOUT = 3000;

describe('PushNotifications API', function() {

  beforeAll(function(done){
    QB.init(CREDENTIALS.appId, CREDENTIALS.authKey, CREDENTIALS.authSecret);

    QB.createSession(QBUser1, function(err, session) {
      if (err) {
        done.fail("Create session error: " + JSON.stringify(err));
      } else {
        expect(session).not.toBeNull();
        token = session.token;
        console.log(token);
        done();
      }
    });
  }, REST_REQUESTS_TIMEOUT);

  describe('Subscriptions', function(){

    it('can create a subscription', function(done){
      var params = {notification_channels: 'apns'};
      QB.pushnotifications.subscriptions.create(params, function(err, res){
        if (err) {
          done.fail("Create a subscription error: " + JSON.stringify(err));
        } else {
          subscription = res;
          expect(subscription).not.toBeNull();
          expect(subscription.token).not.toBeNull();
          console.log(subscription);
          done();
        }
      });
    });

    it('can list a subscription', function(done){
      QB.pushnotifications.subscriptions.list(function(err, result){
        if (err) {
          done.fail("List a subscription error: " + JSON.stringify(err));
        } else {
          expect(result).not.toBeNull();
          expect(result.length).not.toBeNull();
          console.log(result);
          done();
        }
      });
    });

    it('can delete subscription', function(done){
      QB.pushnotifications.subscriptions.list(function(err, result){
        if (err) {
          done.fail("List a subscription error: " + JSON.stringify(err));
        } else {
          QB.pushnotifications.subscriptions.delete(id, function(err, res){
            if (err) {
              done.fail("Delete subscription error: " + JSON.stringify(err));
            } else {
              console.log(res);
              expect(res).toBeNull();
              done();
            }
          });
        }
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
        QB.pushnotifications.events.create(params, function(err, res){
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
        QB.pushnotifications.events.pullEvents(function(err, res){
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

