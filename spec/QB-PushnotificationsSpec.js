var REST_REQUESTS_TIMEOUT = 3000;

describe("PushNotifications API", function() {
  var params;

  beforeAll(function(done){
    QB.init(CREDENTIALS.appId, CREDENTIALS.authKey, CREDENTIALS.authSecret);

    QB.createSession(QBUser1, function(err, session) {
      if (err) {
        done.fail("Create session error: " + JSON.stringify(err));
      } else {
        expect(session).not.toBeNull();
        done();
      }
    });
  }, REST_REQUESTS_TIMEOUT);

  describe("Subscriptions", function(){

    it("can create a subscription", function(done){
      params = {
        notification_channels: "gcm",
        device: {
          platform: "android",
          udid: "jasmineUnique"
        },
        push_token: {
          environment: "development",
          client_identification_sequence:"APA91bH91emYD8BYyveyO0C9M--p8xW9yTr1k_Nzr8-SfjCfSIljzYqNIX9fK9JxPsWm3NQ6P-"+
                                         "zCDkdtktVLEYJI5CLfg_3_auErc_29piz2zLHp5OjK0RdFnod-j0Pclo-a57FaKWxvNSr_EBwbP"+
                                         "_oFDuXo1x0ucQ"
        }
      };
      QB.pushnotifications.subscriptions.create(params, function(err, res){
        if (err) {
          done.fail("Create a subscription error: " + JSON.stringify(err));
        } else {
          expect(res).not.toBeNull();
          expect(res[0].subscription.device.platform.name).toBe("android");
          console.info("can create a subscription");
          done();
        }
      });
    });

    it("can list a subscription", function(done){
      QB.pushnotifications.subscriptions.list(function(err, result){
        if (err) {
          done.fail("List a subscription error: " + JSON.stringify(err));
        } else {
          expect(result).not.toBeNull();
          expect(result[0].subscription.device.udid).toBe("jasmineUnique");
          console.info("can list a subscription");
          done();
        }
      });
    });

    it("can delete subscription", function(done){
      QB.pushnotifications.subscriptions.list(function(err, result){
        if (err) {
          done.fail("List a subscription error: " + JSON.stringify(err));
        } else {
          var subscriptionId = result[0].subscription.id;
          QB.pushnotifications.subscriptions.delete(subscriptionId, function(err, res){
            if (err) {
              done.fail("Delete subscription error: " + JSON.stringify(err));
            } else {
              expect(res).not.toBeNull();
              expect(res).toBe(true);
              console.info("can delete subscription");
              done();
            }
          });
        }
      });
    });

  });

  describe("Events", function(){
    var eventId;

    beforeAll(function(done){
      QB.pushnotifications.subscriptions.create(params, function(err, res){
        if (err) {
          done.fail("Create a subscription error: " + JSON.stringify(err));
        } else {
          expect(res).not.toBeNull();
          done();
        }
      });
    });

    it("can create event", function(done){
      var params = {
        notification_type: "push",
        push_type: "gcm",
        user: {ids: [QBUser1.id]},
        environment: "development",
        message: QB.pushnotifications.base64Encode("hello QuickBlox!")
      };

      QB.pushnotifications.events.create(params, function(err, response) {
        if (err) {
          done.fail("Create event error: " + JSON.stringify(err));
        } else {
          expect(response).not.toBeNull();
          expect(response.event.message).toBe("data.message=aGVsbG8rUXVpY2tCbG94JTIx");
          console.info("can create event");
          done();
        }
      });
    });

    it("can list events", function(done){
      QB.pushnotifications.events.list({page: "1", per_page: "25"}, function(err, response) {
        if (err) {
          done.fail("List events error: " + JSON.stringify(err));
        } else {
          eventId = response.items[0].event.id;
          expect(response).not.toBeNull();
          expect(response.items.length).toBeGreaterThan(0);
          console.info("can list events");
          done();
        }
      });
    });

    it("can get event by id", function(done){
      QB.pushnotifications.events.get(eventId, function(err, response) {
        if (err) {
          done.fail("Get event by id error: " + JSON.stringify(err));
        } else {
          expect(response).not.toBeNull();
          expect(response.event.id).toBe(eventId);
          console.info("can get event by id");
          done();
        }
      });
    });

    it("can get event's status by id", function(done){
      QB.pushnotifications.events.status(eventId, function(err, response) {
        if (err) {
          done.fail("Get event's status by id error: " + JSON.stringify(err));
        } else {
          expect(response).not.toBeNull();
          expect(response.event.id).toBe(eventId);
          console.info("can get event's status by id");
          done();
        }
      });
    });

    it("can delete event", function(done){
      QB.pushnotifications.events.delete(eventId, function(err, response) {
        expect(response).toBeNull();
        console.info("can delete event");
        done();
      });
    });

    afterAll(function(done){
      QB.pushnotifications.subscriptions.list(function(err, result){
        if (err) {
          done.fail("List a subscription error: " + JSON.stringify(err));
        } else {
          var subscriptionId = result[0].subscription.id;
          QB.pushnotifications.subscriptions.delete(subscriptionId, function(err, res){
            if (err) {
              done.fail("Delete subscription error: " + JSON.stringify(err));
            } else {
              expect(res).not.toBeNull();
              done();
            }
          });
        }
      });
    });

  });

});

