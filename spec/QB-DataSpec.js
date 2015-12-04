var REST_REQUESTS_TIMEOUT = 3000;

describe('Сustom Objects API', function() {
  var session;

  beforeAll(function(done){
    QB.init(CREDENTIALS.appId, CREDENTIALS.authKey, CREDENTIALS.authSecret);

    QB.createSession(QBUser1, function(err, res) {
      if (err) {
        done.fail("Create session error: " + JSON.stringify(err));
      } else {
        session = res;
        expect(session).not.toBeNull();
        done();
      }
    });
  }, REST_REQUESTS_TIMEOUT);

  describe('The basic functions of Custom Objects', function() {

    it('can create custom object', function(done){
      QB.data.create('cars', {make: 'BMW', model: 'M5', value: 100, damaged: true}, function(err, result) {
        if (err) {
          done.fail("Create custom object error: " + JSON.stringify(err));
        } else {
          expect(result._id).not.toBeNull();
          expect(result.make).toBe('BMW');
          expect(result.model).toBe('M5');
          console.info('can create custom object');
          done();
        }
      });
    });


    it('can update custom object', function(done){
      QB.data.create('cars', {make: 'BMW', model: 'M5', value: 100, damaged: true}, function(err, result) {
        if (err) {
          done.fail("Create custom object error: " + JSON.stringify(err));
        } else {
          result.model = 'M3';
          QB.data.update('cars', result, function(err, res) {
            if (err) {
              done.fail("Update custom object error: " + JSON.stringify(err));
            } else {
              expect(res._id).not.toBeNull();
              expect(res.model).toBe('M3');
              console.info('can update custom object');
              done();
            }
          });
        }
      });
    });

    it('can list custom object', function(done){
      QB.data.list('cars', function(err, result) {
        if (err) {
          done.fail("List custom object error: " + JSON.stringify(err));
        } else {
          expect(result).not.toBeNull();
          expect(result.items.length).toBeGreaterThan(0);
          console.info('can list custom object');
          done();
        }
      });
    });

    it('can delete custom object', function(done){
      QB.data.create('cars', {make: 'BMW', model: 'M5', value: 100, damaged: true}, function(err, result) {
        if (err) {
          done.fail("Create custom object error: " + JSON.stringify(err));
        } else {
          QB.data.delete('cars', result._id, function(err, res) {
            if (err) {
              done.fail("Create delete object error: " + JSON.stringify(err));
            } else {
              expect(res).not.toBeNull();
              expect(res).toBe(true);
              console.info('can delete custom object');
              done();
            }
          });
        }
      });
    });

  });


  describe('Custom Objects with files', function(done) {
    var paramsFile, paramsFor;

    it ('can upload a file to an existing record', function(done){
      QB.data.create('cars', {make: 'BMW', model: 'M5', value: 100, damaged: true}, function(err, result) {
        if (err) {
          done.fail("Create custom object error: " + JSON.stringify(err));
        } else {
          var d = new Date(2015, 10, 19, 12, 00, 00, 600),
              genFile = new File(["Hello QuickBlox cars"], "bmw.txt", {type: "text/plain", lastModified: d});
          paramsFile = {field_name: "motors", file: genFile, id: result._id};

          QB.data.uploadFile('cars', paramsFile, function(err, res) {
            if (err) {
              done.fail("Upload a file to an existing record error: " + JSON.stringify(err));
            } else {
              expect(res).not.toBeNull();
              expect(res.name).toBe("bmw.txt");
              console.info('can upload a file to an existing record');
              done();
            }
          });
        }
      });
    });

    it ('can dawnload a file from existing record', function(done){
      paramsFor = {
        id: paramsFile.id,
        field_name: paramsFile.field_name
      }

      QB.data.downloadFile('cars', paramsFor, function(err, res) {
        if (err) {
          done.fail("Dawnload a file from existing record error: " + JSON.stringify(err));
        } else {
          expect(res).not.toBeNull();
          expect(res).toBe("https://api.quickblox.com/data/cars/"+paramsFile.id+
                           "/file.json?field_name="+paramsFile.field_name+
                           "&token="+session.token);
          console.info('can dawnload a file from existing record');
          done();
        }
      });
    });

    it ('can delete a file from existing record', function(done){
      QB.data.deleteFile('cars', paramsFor, function(err, res) {
        if (err) {
          done.fail("Delete a file from existing record error: " + JSON.stringify(err));
        } else {
          expect(res).not.toBeNull();
          expect(res).toBe(true);
          console.info('can delete a file from existing record');
          done();
        }
      });
    });

  });


  describe('Some more complex searching', function() {

    it('can find instances of cars with a value over 50 (value: 100)', function(done){
      var filter = {value: {gt: 50}};
      QB.data.list('cars', filter, function(err, result){
        if (err) {
          done.fail("List custom object error: " + JSON.stringify(err));
        } else {
          expect(result).not.toBeNull();
          expect(result.items.length).toBeGreaterThan(0);
          for (var i=0,j=result.items.length; i<j; i++){
            expect(result.items[i].value).toBeGreaterThan(50);
          }
          console.info('can find instances of cars with a value over 50 (value: 100)');
          done();
        }
      });
    });

    it('cannot find instances of cars with a value less than 50 (value: 100)', function(done){
      var filter = {value: {lt: 50}};
      QB.data.list('cars', filter, function(err, result){
        if (err) {
          done.fail("List custom object error: " + JSON.stringify(err));
        } else {
          expect(result).not.toBeNull();
          expect(result.items.length).toBe(0);
          console.info('cannot find instances of cars with a value less than 50 (value: 100)');
          done();
        }
      });
    });

  });

});
