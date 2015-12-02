var REST_REQUESTS_TIMEOUT = 3000;

describe('Location API', function() {

  //
  //
  beforeAll(function(done){
    QB.init(CREDENTIALS.appId, CREDENTIALS.authKey, CREDENTIALS.authSecret);

    QB.createSession(QBUser1, function(err, session) {
      if (err) {
        done.fail("Create session error: " + JSON.stringify(err));
      } else {
        expect(session).not.toBeNull();
        token = session.token;
        done();
      }
    });
  }, REST_REQUESTS_TIMEOUT);

  //
  //
  it('can create geodata', function(done){
    //coordinates of Big Ben from http://www.openstreetmap.org/?way=123557148#map=18/51.50065/-0.12525
    var params = {latitude: 51.50065, longitude:-0.12525, status: 'Under the clocktower'};
    QB.location.geodata.create(params, function(err, res){
      if (err) {
        done.fail("Create geodata error: " + JSON.stringify(err));
      } else {
        expect(res).not.toBeNull();
        expect(res.id).toBeGreaterThan(0);
        console.info('can create geodata');
        done();
      }
    });
  });

  //
  //
  it('can get existing geodata', function(done){
    QB.location.geodata.create({latitude: 51.50332, longitude:-0.12805, status: 'Keeping \'em in line'}, function(err, res){
      if (err) {
        done.fail("Create geodata error: " + JSON.stringify(err));
      } else {
        QB.location.geodata.get(res.id, function(err, result){
          if (err) {
            done.fail("Get existing geodata error: " + JSON.stringify(err));
          } else {
            expect(result).not.toBeNull();
            expect(result.status).toBe("Keeping 'em in line");
            console.info('can get existing geodata');
            done();
          }
        });
      }
    });
  });

  //
  //
  it('can update existing geodata', function(done){
    QB.location.geodata.create({latitude: 51.50332, longitude:-0.12805, status: 'Waiting outside'}, function(err, res){
      if (err) {
        done.fail("Create geodata error: " + JSON.stringify(err));
      } else {
        res.status='Still waiting';
        QB.location.geodata.update(res, function(err, result){
          if (err) {
            done.fail("Update existing geodata error: " + JSON.stringify(err));
          } else {
            expect(result).not.toBeNull();
            expect(result.status).toBe("Still waiting");
            console.info('can update existing geodata');
            done();
          }
        });
      }
    });
  });

  //
  //
  it('can delete existing geodata', function(done){
    QB.location.geodata.list(function(err, res) {
      if (err) {
        done.fail("List geodata error: " + JSON.stringify(err));
      } else {
        QB.location.geodata.delete(res.items[0].geo_datum.id, function(err, result){
          if (err) {
            done.fail("Delete existing existing geodata error: " + JSON.stringify(err));
          } else {
            expect(result).not.toBeNull();
            expect(result).toBe(true);
            console.info('can delete existing geodata');
            done();
          }
        });
      }
    });
  });

  //
  //
  it('can list geodata', function(done){
    QB.location.geodata.list(function(err, res) {
      if (err) {
        done.fail("List geodata error: " + JSON.stringify(err));
      } else {
        expect(res).not.toBeNull();
        expect(res.items.length).toBeGreaterThan(0);
        console.info('can delete existing geodata');
        done();
      }
    });
  });

  it('can purge geodata', function(done){
    QB.location.geodata.purge(7, function(err, result){
      if (err) {
        done.fail("Purge geodata error: " + JSON.stringify(err));
      } else {
        expect(result).not.toBeNull();
        expect(result).toBe(true);
        console.info('can purge geodata');
        done();
      }
    });
  });

});
