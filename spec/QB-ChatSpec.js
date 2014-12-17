describe('QuickBlox SDK - Chat', function() {
  var needsInit = true;
  
  var dialog_data = {
    group: {},
    priv_group: {},
    priv: {}
  };

  beforeEach(function(){
    var done;
    if (needsInit) {
      runs(function(){
        QB.init(CONFIG.appId, CONFIG.authKey, CONFIG.authSecret, CONFIG.debug);
        done = false;
        QB.createSession({login: VALID_USER, password: VALID_PASSWORD},function (err, result){
          expect(err).toBeNull();
          expect(result).not.toBeNull();
          done = true;
        });
      });
      waitsFor(function(){
        return done;
        },'create session', TIMEOUT);
    }
  });

  describe('Chat 2.0 API', function() {

    it('can create a dialog (public)', function() {
      var done, error, result;
      runs(function(){
        QB.chat.dialog.create({ name: "Chatroom", type: 1}, function(err, res) {
          error = err;
          result = res;
          done = true;
        });
      });
      waitsFor(function(){ return done; }, 'create chat dialog', TIMEOUT );
      runs(function() {
        expect(error).toBeNull();
        expect(result).not.toBeNull();
        expect(result.xmpp_room_jid).toMatch('muc.chat.quickblox.com');
      });
    });
    
    it('can create a dialog (private group)', function() {
      var done, error, result;
      runs(function(){
        QB.chat.dialog.create({ name: "Chatroom", type: 2, occupants_ids: [239647, 255591, 255603].toString() }, function(err, res) {
          error = err;
          result = res;
          done = true;
        });
      });
      waitsFor(function(){ return done; }, 'create chat dialog', TIMEOUT );
      runs(function() {
        expect(error).toBeNull();
        expect(result).not.toBeNull();
        expect(result.occupants_ids).toContain(239647);
      });
    });
    
    it('can create a dialog (one-to-one)', function() {
      var done, error, result;
      runs(function(){
        QB.chat.dialog.create({ type: 3, occupants_ids: 239647 }, function(err, res) {
          error = err;
          result = res;
          done = true;
        });
      });
      waitsFor(function(){ return done; }, 'create chat dialog', TIMEOUT );
      runs(function() {
        expect(error).toBeNull();
        expect(result).not.toBeNull();
        expect(result.occupants_ids.length).toBe(2);
      });
    });

  });
});
