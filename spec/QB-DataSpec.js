describe('QuickBlox SDK - Data (custom objects)', function() {
  var needsInit = true;

  beforeEach(function(){
    var done;
    if (needsInit) {
      runs(function(){
        QB.init(CONFIG);
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

  describe('Simple CRUD funcitons', function() {

    it('can create an instance of Cars', function(){
      var done, error, result;
      runs(function(){
        QB.data.create('Cars', {make: 'Ford', model: 'Escort', value: 100, damaged: true}, function(err,res) {
          result = res;
          error = err;
          done = true;
        });
      });
      waitsFor(function(){return done;}, 'create custom object', TIMEOUT);
      runs(function(){
        expect(error).toBeNull();
        expect(result._id).not.toBeNull();
        expect(result.make).toBe('Ford');
      });
    });

    it('can delete an instance of Cars', function(){
      var done, error, result;
      runs(function(){
        QB.data.create('Cars', {make: 'Ford', model: 'Escort', value: 100, damaged: true}, function(err,res) {
          QB.data.delete('Cars', res._id, function(err, res) {
            result = res;
            error = err;
            done = true;
          });
        });
      });
      waitsFor(function(){return done;}, 'deleting a custom object', TIMEOUT);
      runs(function(){
        expect(error).toBeNull();
        expect(result._id).not.toBeNull();
        expect(result.make).toBe('Ford');
      });
    });


    it('can update an instance of Cars', function(){
      var done, error, result;
      runs(function(){
        QB.data.list('Cars', function(err,res) {
          res.items[0].model = 'T';
          QB.data.update('Cars', res.items[0], function(err, res) {
            result = res;
            error = err;
            done = true;
          });
        });
      });
      waitsFor(function(){return done;}, 'updating a custom object', TIMEOUT);
      runs(function(){
        expect(error).toBeNull();
        expect(result._id).not.toBeNull();
        expect(result.model).toBe('T');
      });
    });

    it('can list instances of Cars', function(){
      var done, error, result;
      runs(function(){
        QB.data.list('Cars', function(err,res) {
          result = res;
          error = err;
          done = true;
        });
      });
      waitsFor(function(){return done;}, 'updating a custom object', TIMEOUT);
      runs(function(){
        expect(error).toBeNull();
        expect(result.items.length).toBeGreaterThan(0);
      });
    });
  });

 describe('Some more complex searching', function() {

    it('can find instances of Cars with a value over 50', function(){
      var done, error, result;
      runs(function(){
        var filter = {value: {gt: 50}};
        QB.data.list('Cars', filter, function(err,res){
          error = err;
          result = res;
          done = true;
        });
      });
      waitsFor(function(){return done;}, 'searching with filter', TIMEOUT);
      runs(function(){
        expect(error).toBeNull();
        expect(result.items.length).toBeGreaterThan(0);
        for (var i=0,j=result.items.length; i<j; i++){
          expect(result.items[i].value).toBeGreaterThan(50);
        }
      });
    });

    it('cannot find instances of Cars with a value less than 50', function(){
      var done, error, result;
      runs(function(){
        var filter = {value: {lt: 50}};
        QB.data.list('Cars', filter, function(err,res){
          error = err;
          result = res;
          done = true;
        });
      });
      waitsFor(function(){return done;}, 'searching with filter', TIMEOUT);
      runs(function(){
        expect(error).toBeNull();
        expect(result.items.length).toBe(0);
      });
    });

 });

});


