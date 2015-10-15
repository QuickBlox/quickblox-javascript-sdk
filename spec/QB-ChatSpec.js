describe('QuickBlox SDK - Chat', function() {

  describe('Chat XMPP', function() {

    // beforeAll
    //
    beforeAll(function(done){

      QB.init(CONFIG.appId, CONFIG.authKey, CONFIG.authSecret, true);

      QB.chat.connect({userId: QBUser1.id, password: QBUser1.pass}, function(err, roster) {
        if(err){
          done.fail("Chat login error: " + err);
        }else{
          expect(err).toBeNull();
          expect(roster).not.toBeNull();
          done();
        }
      });

    }, 5000);


    // 1-1 mesasging
    //
    it('can send and receive private messages', function(done) {

      var self = this;

      QB.chat.onMessageListener = function(userId, receivedMessage){
        expect(receivedMessage).not.toBeNull();
        expect(receivedMessage.type).toEqual("chat");
        expect(userId).toEqual(QBUser1.id);
        expect(receivedMessage.extension).toEqual({
          param1: "value1",
          param2: "value2"
        });
        expect(receivedMessage.id).toEqual(self.messageId);
        self.messageId = null;

        done();
      };

      var message = {
        type: "chat",
        extension: {
          param1: "value1",
          param2: "value2"
        }
      };
      QB.chat.send(QBUser1.id, message);
      this.messageId = message.id;

    }, 1500);


    // System messages
    //
    it('can send and receive system messages', function(done) {

      var self = this;

      QB.chat.onSystemMessageListener = function(receivedMessage){
        expect(receivedMessage).not.toBeNull();
        expect(receivedMessage.userId).toEqual(QBUser1.id);
        expect(receivedMessage.extension).toEqual({
          param1: "value1",
          param2: "value2"
        });
        expect(receivedMessage.id).toEqual(self.messageId);
        self.messageId = null;

        done();
      };

      var message = {
        extension: {
          param1: "value1",
          param2: "value2"
        }
      };
      QB.chat.sendSystemMessage(QBUser1.id, message);
      this.messageId = message.id;

    }, 1500);

  });

  // describe('Chat REST API', function() {
  //
  //   var needsInit = true;
  //
  //   var dialog_data = {
  //     group: {},
  //     priv_group: {},
  //     priv: {}
  //   };
  //
  //   beforeEach(function(){
  //     var done;
  //     if (needsInit) {
  //       runs(function(){
  //         QB.init(CONFIG.appId, CONFIG.authKey, CONFIG.authSecret, CONFIG.debug);
  //         done = false;
  //         QB.createSession({login: VALID_USER, password: VALID_PASSWORD},function (err, result){
  //           expect(err).toBeNull();
  //           expect(result).not.toBeNull();
  //           done = true;
  //         });
  //       });
  //       waitsFor(function(){
  //         return done;
  //         },'create session', TIMEOUT);
  //     }
  //   });
  //
  //   it('can create a dialog (public)', function() {
  //     var done, error, result;
  //     runs(function(){
  //       QB.chat.dialog.create({ name: "Chatroom", type: 1}, function(err, res) {
  //         error = err;
  //         result = res;
  //         done = true;
  //       });
  //     });
  //     waitsFor(function(){ return done; }, 'create chat dialog', TIMEOUT );
  //     runs(function() {
  //       expect(error).toBeNull();
  //       expect(result).not.toBeNull();
  //       expect(result.xmpp_room_jid).toMatch('muc.chat.quickblox.com');
  //     });
  //   });
  //
  //   it('can create a dialog (private group)', function() {
  //     var done, error, result;
  //     runs(function(){
  //       QB.chat.dialog.create({ name: "Chatroom", type: 2, occupants_ids: [239647, 255591, 255603].toString() }, function(err, res) {
  //         error = err;
  //         result = res;
  //         done = true;
  //       });
  //     });
  //     waitsFor(function(){ return done; }, 'create chat dialog', TIMEOUT );
  //     runs(function() {
  //       expect(error).toBeNull();
  //       expect(result).not.toBeNull();
  //       expect(result.occupants_ids).toContain(239647);
  //     });
  //   });
  //
  //   it('can create a dialog (one-to-one)', function() {
  //     var done, error, result;
  //     runs(function(){
  //       QB.chat.dialog.create({ type: 3, occupants_ids: 239647 }, function(err, res) {
  //         error = err;
  //         result = res;
  //         done = true;
  //       });
  //     });
  //     waitsFor(function(){ return done; }, 'create chat dialog', TIMEOUT );
  //     runs(function() {
  //       expect(error).toBeNull();
  //       expect(result).not.toBeNull();
  //       expect(result.occupants_ids.length).toBe(2);
  //     });
  //   });
  //
  // });
});
