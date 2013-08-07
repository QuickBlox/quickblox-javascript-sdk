describe('QuickBlox SDK - Location', function() {

  beforeEach(function(){
    var done;
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
  });

  describe('GeoData', function(){
    var geoData;
    it('can create geodata', function(){
      //coordinates of Big Ben from http://www.openstreetmap.org/?way=123557148#map=18/51.50065/-0.12525
      runs(function(){
        done = false;
        var params = {latitude: 51.50065, longitude:-0.12525, status: 'Under the clocktower'};
        QB.location.geodata.create(params, function(err,result){
          done = true;
          expect(err).toBeNull();
          geoData = result;
        });
      });
      waitsFor(function(){
        return done;
      },'create push token', TIMEOUT);
      runs(function(){
        expect(geoData).not.toBeNull();
        expect(geoData.id).toBeGreaterThan(0);
      });
    });
  });

});

