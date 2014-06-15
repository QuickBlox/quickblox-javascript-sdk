describe('QuickBlox SDK - Location', function() {

  beforeEach(function(){
    var done;
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
  });

  describe('GeoData', function(){
    it('can create geodata', function(){
      var geoData;
      //coordinates of Big Ben from http://www.openstreetmap.org/?way=123557148#map=18/51.50065/-0.12525
      runs(function(){
        done = false;
        var params = {latitude: 51.50065, longitude:-0.12525, status: 'Under the clocktower'};
        QB.location.geodata.create(params, function(err,result){
          geoData = result;
          done = true;
          expect(err).toBeNull();
        });
      });
      waitsFor(function(){
        return done;
      },'create geodata', TIMEOUT);
      runs(function(){
        expect(geoData).not.toBeNull();
        expect(geoData.id).toBeGreaterThan(0);
      });
    });

    it('can get existing geodata', function(){
      var geoData;
      runs(function(){
        done = false;
        QB.location.geodata.create({latitude: 51.50332, longitude:-0.12805, status: 'Keeping \'em in line'}, function(err,result){
          QB.location.geodata.get(result.id, function(err,result){
            geoData = result;
            done = true;
            expect(err).toBeNull();
          });
        });
      });
      waitsFor(function(){
        return done;
      },'create geodata', TIMEOUT);
      runs(function(){
        expect(geoData).not.toBeNull();
        expect(geoData.status).toBe("Keeping 'em in line");
      });
    });

    it('can update existing geodata', function(){
      var result, error;
      runs(function(){
        done = false;
        QB.location.geodata.create({latitude: 51.50332, longitude:-0.12805, status: 'Waiting outside'}, function(err,res){
          res.status='Still waiting';
          QB.location.geodata.update(res, function(err,res){
            result = res;
            error = err;
            done = true;
          });
        });
      });
      waitsFor(function(){
        return done;
      },'update geodata', TIMEOUT);
      runs(function(){
        expect(error).toBeNull();
        expect(result).not.toBeNull();
        expect(result.status).toBe("Still waiting");
      });
    });

    it('can delete existing geodata', function(){
      var error, deleted;
      runs(function(){
        done = false;
        QB.location.geodata.list(function(err,result){
          QB.location.geodata.delete(result.items[0].geo_datum.id, function(err,res){
            error = err;
            deleted = res;
            done = true;
          });
        });
      });
      waitsFor(function(){
        return done;
      },'delete geodata', TIMEOUT);
      runs(function(){
        expect(error).toBeNull();
        expect(deleted).toBe(true);
      });
    });


    it('can list geodata', function(){
      var geoData;
      runs(function(){
        done = false;
        QB.location.geodata.list(function(err,result){
          geoData = result;
          done = true;
          expect(err).toBeNull();
        });
      });
      waitsFor(function(){
        return done;
      },'list geodata', TIMEOUT);
      runs(function(){
        expect(geoData).not.toBeNull();
        expect(geoData.items.length).toBeGreaterThan(0);
      });
    });

    it('can purge geodata', function(){
      var error, purged;
      runs(function(){
        done = false;
        QB.location.geodata.purge(7,function(err,result){
          done = true;
          error = err;
          purged = result;
        });
      });
      waitsFor(function(){
        return done;
      },'list geodata', TIMEOUT);
      runs(function(){
        expect(error).toBeNull();
        expect(purged).toBe(true);
      });
    });



  });

});

