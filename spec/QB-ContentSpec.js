describe('Content API', function() {
  var token,
      data = {};

  // beforeAll
  //
  beforeAll(function(done){
    QB.init(CREDENTIALS.appId, CREDENTIALS.authKey, CREDENTIALS.authSecret);

    QB.createSession(QBUser1, function(err, session) {
      if (err) {
        fail("Create session error: " + JSON.stringify(err));
      } else {
        expect(session).not.toBeNull();
        token = session.token;
        done();
      }
    });
  }, 3000);

  it('can create and upload files', function() {
    var d = new Date(2015, 10, 13, 14, 30, 30, 600),
        genFile = new File(["Hello QuickBlox"], "QB.txt", {type: "text/plain", lastModified: d});

    data = {name: genFile.name, file: genFile, type: genFile.type, size: genFile.size, public: false};

    QB.content.createAndUpload(data, function(err, res) {
      if (err) {
        fail("List content objects error: " + JSON.stringify(err));
      }else{
        expect(res).not.toBeNull();
        expect(res.name).toBe('QB.txt');
      }
    });
  });

  it('can list content objects', function() {
    QB.content.list(function(err, res) {
      if (err) {
        fail("List content objects error: " + JSON.stringify(err));
      }else{
        expect(res).not.toBeNull();
        expect(res.items.length).toBeGreaterThan(0);
      }
    });
  }); 

  it('can delete content objects', function() {
    QB.content.createAndUpload(data, function(err, response) {
      if (err) {
        fail("List content objects error: " + JSON.stringify(err));
      }else{
        var elemId = response.id;
        QB.content.delete(elemId, function(err, result) {
          if (err) {
            fail("List content objects error: " + JSON.stringify(err));
          }else{
            expect(result).not.toBeNull();
            expect(result).toBe(true);
          }
        });
      }
    });
  });

  it('can access private URL', function() {
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
