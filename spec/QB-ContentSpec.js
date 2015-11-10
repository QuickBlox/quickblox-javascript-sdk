var LOGIN_TIMEOUT = 5000;
var token;

describe('QuickBlox SDK - Content', function() {

  // beforeAll
  //
  beforeAll(function(done){

    QB.init(CREDENTIALS.appId, CREDENTIALS.authKey, CREDENTIALS.authSecret);

    QB.createSession(QBUser1, function(err, result) {
      if (err) {
        expect(error).toBeNull();
        done.fail("Create session error: " + JSON.stringify(err));
      } else {
        expect(result).not.toBeNull();
        token = result.token;
        done();
      }
    });

  }, LOGIN_TIMEOUT);

  //
  //
  it('can make privat and public URLs', function() {
    var fileUID = "97f5802dcbd34a59a4921d73f6baedd000",
        privateURL = QB.content.privateUrl(fileUID),
        publicUrl = QB.content.publicUrl(fileUID);

    expect(privateURL).toEqual("https://api.quickblox.com/blobs/97f5802dcbd34a59a4921d73f6baedd000?token="+token);
    expect(publicUrl).toEqual("https://api.quickblox.com/blobs/97f5802dcbd34a59a4921d73f6baedd000");

  });

});
