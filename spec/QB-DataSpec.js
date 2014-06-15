describe('QuickBlox SDK - Data (custom objects)', function() {
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
        expect(result).toBe(true);
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

  /*
   * Can't get this working so will do a sample as per Content API file upload
   * (not permitted to create a new File object due to security limitations
   * tried to work around this by creating a dynamic form but so far just
   * triggers an inifinite loop running the spec runner :(
  describe('Custom Objects with files', function() {

    it ('can upload a file to an existing record', function(){
      var done, result, error, id, file;
      runs(function() {
        QB.data.list('Cars', function(err, res) {
          var form, file, fileList;
          id = res.items[0].id;
          form = document.createElement('form');
          file = document.createElement('input');
          file.value = 'http://quickblox.github.io/quickblox-web-sdk/spec/logo.png';
          file.type = 'file';
          file.id = 'uploadFile';
          form.appendChild(file);
          form.addEventListener("submit", function(){
            console.log(this, arguments);
            fileList = document.getElementById('uploadFile').files;
            console.log(fileList);
          }, false);
          form.onsubmit = function(e){
            console.log('asd');
            e.preventDefault();
            return false;
          };
          document.body.appendChild(form);
          form.submit();
        });
      });
      waitsFor(function(){return done;}, 'uploading file', TIMEOUT);
      runs(function(){
        expect(error).toBeNull();
        expect(result).toBeNotNull();
      });
    });

  });
  */

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


