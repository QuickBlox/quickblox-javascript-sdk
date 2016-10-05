describe('Custom Objects API', function() {
    'use strict';

    var REST_REQUESTS_TIMEOUT = 5000;
    var session;

    var isNodeEnv = typeof window === 'undefined' && typeof exports === 'object';

    var QB = isNodeEnv ? require('../src/qbMain') : window.QB;

    var CREDS = isNodeEnv ? require('./config').CREDS : window.CREDS;
    var CONFIG =  isNodeEnv ? require('./config').CONFIG : window.CONFIG;
    var QBUser1 = isNodeEnv ? require('./config').QBUser1 : window.QBUser1;

    beforeAll(function(done){
        QB.init(CREDS.appId, CREDS.authKey, CREDS.authSecret, CONFIG);

        QB.createSession(QBUser1, function(err, res) {
            if (err) {
                done.fail('Create session error: ' + JSON.stringify(err));
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

                    done();
                }
            });
        }, REST_REQUESTS_TIMEOUT);

        it('can update custom object', function(done){
            QB.data.create('cars', {
                'make': 'BMW',
                'model': 'M5',
                'value': 100,
                'damaged': true
            }, function(err, result) {
                if (err) {
                    done.fail('Create custom object error: ' + JSON.stringify(err));
                } else {
                    result.model = 'M3';

                    QB.data.update('cars', result, function(err, res) {
                        if (err) {
                            done.fail('Update custom object error: ' + JSON.stringify(err));
                        } else {
                            expect(res._id).not.toBeNull();
                            expect(res.model).toBe('M3');

                            done();
                        }
                    });
                }
            });
        }, REST_REQUESTS_TIMEOUT);

        it('can list custom object', function(done){
            QB.data.list('cars', function(err, result) {
                if (err) {
                    done.fail('List custom object error: ' + JSON.stringify(err));
                } else {
                    expect(result).not.toBeNull();
                    expect(result.items.length).toBeGreaterThan(0);

                    done();
                }
            });
        }, REST_REQUESTS_TIMEOUT);

        it('can delete custom object', function(done){
            QB.data.create('cars', {make: 'BMW', model: 'M5', value: 100, damaged: true}, function(err, result) {
                if (err) {
                    done.fail('Create custom object error: ' + JSON.stringify(err));
                } else {
                    QB.data.delete('cars', result._id, function(err, res) {
                        if (err) {
                            done.fail("Create delete object error: " + JSON.stringify(err));
                        } else {
                            expect(res).not.toBeNull();
                            expect(res).toBe(true);

                            done();
                        }
                    });
                }
            });
        }, REST_REQUESTS_TIMEOUT);
    });


    describe('Custom Objects with files', function() {
      var paramsFile,
          paramsFor;

      it ('can upload a file to an existing record', function(done){
        QB.data.create('cars', {make: 'BMW', model: 'M5', value: 100, damaged: true}, function(err, result) {
          if (err) {
            done.fail("Create custom object error: " + JSON.stringify(err));
          } else {
            if(isNodeEnv){
              var fs = require('fs');

              var imgName = "logo.png";
              var srcIMG = 'spec/' + imgName;
              fs.stat(srcIMG, function (err, stats) {
                fs.readFile(srcIMG, function (err, data) {
                  if (err) throw err;

                  paramsFile = {field_name: "motors", file: data, id: result._id, name: imgName};

                  QB.data.uploadFile('cars', paramsFile, function(err, res) {
                    if (err) {
                      done.fail("Upload a file to an existing record error: " + JSON.stringify(err));
                    } else {
                      expect(res).not.toBeNull();

                      done();
                    }
                  });

                });
              });
            }else{
              var d = new Date(2015, 10, 19, 12, 0, 0, 600);
              var genFile = new File(["Hello QuickBlox cars"], "bmw.txt", {type: "text/plain", lastModified: d});

              paramsFile = {field_name: "motors", file: genFile, id: result._id};

              QB.data.uploadFile('cars', paramsFile, function(err, res) {
                if (err) {
                  done.fail("Upload a file to an existing record error: " + JSON.stringify(err));
                } else {
                  expect(res).not.toBeNull();
                  expect(res.name).toBe("bmw.txt");

                  done();
                }
              });
            }
          }
        });
      });

      it ('can download a file from existing record', function(done){
        paramsFor = {
          id: paramsFile.id,
          field_name: paramsFile.field_name
        };

        QB.data.downloadFile('cars', paramsFor, function(err, res) {
          if (err) {
            done.fail("Download a file from existing record error: " + JSON.stringify(err));
          } else {
            expect(res).not.toBeNull();
            expect(res).toBe("https://" + CONFIG.endpoints.api + "/data/cars/"+paramsFile.id+
                             "/file.json?field_name="+paramsFile.field_name+
                             "&token="+session.token);

            done();
          }
        });
      }, REST_REQUESTS_TIMEOUT);

      it ('can get file url', function(){
        paramsFor = {
          id: paramsFile.id,
          field_name: paramsFile.field_name
        };

        var url = QB.data.fileUrl('cars', paramsFor);

        expect(url).not.toBeNull();
        expect(url).toBe("https://" + CONFIG.endpoints.api + "/data/cars/"+paramsFile.id+
                       "/file.json?field_name="+paramsFile.field_name+
                       "&token="+session.token);
      });

      it ('can delete a file from existing record', function(done){
        QB.data.deleteFile('cars', paramsFor, function(err, res) {
          if (err) {
            done.fail("Delete a file from existing record error: " + JSON.stringify(err));
          } else {
            expect(res).not.toBeNull();
            expect(res).toBe(true);

            done();
          }
        });
      });

    });


    describe('Some more complex searching', function() {

        it('can find instances of cars with a value over 50 (value: 100)', function(done){
            var filter = {
                'value': {
                    'gt': 50
                }
            };

            QB.data.list('cars', filter, function(err, result){
                if (err) {
                    done.fail('List custom object error: ' + JSON.stringify(err));
                } else {
                    expect(result).not.toBeNull();
                    expect(result.items.length).toBeGreaterThan(0);

                    for (var i=0,j=result.items.length; i<j; i++){
                        expect(result.items[i].value).toBeGreaterThan(50);
                    }

                    done();
                }
            });
        }, REST_REQUESTS_TIMEOUT);

        it('cannot find instances of cars with a value less than 50 (value: 100)', function(done){
            var filter = {
                'value': {
                    'lt': 50
                }
            };

            QB.data.list('cars', filter, function(err, result){
                if (err) {
                    done.fail('List custom object error: ' + JSON.stringify(err));
                } else {
                    expect(result).not.toBeNull();
                    expect(result.items.length).toBe(0);

                    done();
                }
            });
        }, REST_REQUESTS_TIMEOUT);
    });

});
