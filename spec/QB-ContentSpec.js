var REST_REQUEST_TIMEOUT = 3000;
var token;

describe('Content API', function() {

  // beforeAll
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

  });

  it('can list content objects', function(done) {
    QB.content.list(function(err, res) {
      if (err) {
        done.fail("List content objects error: " + JSON.stringify(err));
      }else{
        expect(result).not.toBeNull();
        expect(result.items.length).toBeGreaterThan(0);
        done();
      }
    });
  });

  

  it('can access privat URL', function() {
    var fileUID = "97f5802dcbd34a59a4921d73f6baedd000",
        privateURL = QB.content.privateUrl(fileUID);

    expect(privateURL).toEqual("https://api.quickblox.com/blobs/97f5802dcbd34a59a4921d73f6baedd000?token="+token);
  });


  it('can access public URL', function() {
    var fileUID = "97f5802dcbd34a59a4921d73f6baedd000",
        publicUrl = QB.content.publicUrl(fileUID);

    expect(publicUrl).toEqual("https://api.quickblox.com/blobs/97f5802dcbd34a59a4921d73f6baedd000");
  });

});
