describe('QuickBlox SDK - Content', function() {
  var needsInit = true;

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

  describe('Basic CRUD functions', function() {

    it('can create a content object', function() {
      var done,error, result;
      runs(function(){
        var data = {content_type: 'image/png', name: 'myAvatar.png', public: true, tag_list: 'user_pics,avatar'};
        QB.content.create(data, function(err, res) {
          error = err;
          result = res;
          done = true;
        });
      });
      waitsFor(function(){ return done; }, 'create content instance', TIMEOUT );
      runs(function() {
        expect(error).toBeNull();
        expect(result).not.toBeNull();
        expect(result.name).toBe('myAvatar.png');
      });
    });

    it('can list content objects', function() {
      var done,error, result;
      runs(function(){
        QB.content.list(function(err, res) {
          error = err;
          result = res;
          done = true;
        });
      });
      waitsFor(function(){ return done; }, 'create content instance', TIMEOUT );
      runs(function() {
        expect(error).toBeNull();
        expect(result).not.toBeNull();
        expect(result.items.length).toBeGreaterThan(0);
      });
    });

  });

});
