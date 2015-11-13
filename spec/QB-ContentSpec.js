var REST_REQUEST_TIMEOUT = 3000;
var token;

describe('Content API', function() {

  // beforeAll
  //
  beforeAll(function(done){

    QB.init(CONFIG.appId, CONFIG.authKey, CONFIG.authSecret);

    QB.createSession(QBUser1, function(err, session) {
      if (err) {
        done.fail("Create session error: " + JSON.stringify(err));
      } else {
        expect(session).not.toBeNull();
        token = session.token;

        done();
      }
    });

  }, REST_REQUEST_TIMEOUT);

  // Private Url
  //
  it('can access privat URL', function() {
    var fileUID = "97f5802dcbd34a59a4921d73f6baedd000",
        privateURL = QB.content.privateUrl(fileUID);

    expect(privateURL).toEqual("https://api.quickblox.com/blobs/97f5802dcbd34a59a4921d73f6baedd000?token="+token);
  });


  // Private Url
  //
  it('can access public URL', function() {
    var fileUID = "97f5802dcbd34a59a4921d73f6baedd000",
        publicUrl = QB.content.publicUrl(fileUID);

    expect(publicUrl).toEqual("https://api.quickblox.com/blobs/97f5802dcbd34a59a4921d73f6baedd000");
  });
});
