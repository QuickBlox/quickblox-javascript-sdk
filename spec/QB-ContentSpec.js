var fileId;

describe('Content API', function() {
  'use strict';

  var REST_REQUESTS_TIMEOUT = 3000;
  var UPLOAD_TIMEOUT = 6000;

  var isNodeEnv = typeof window === 'undefined' && typeof exports === 'object';

  var QB = isNodeEnv ? require('../src/qbMain') : window.QB;
  
  var CREDENTIALS = isNodeEnv ? require('./config').CREDS : window.CREDS;
  var QBUser1 = isNodeEnv ? require('./config').QBUser1 : window.QBUser1;
  var CONFIG = isNodeEnv ? require('./config').CONFIG : window.CONFIG;

  var token,
      data = {},
      fileUID = '97f5802dcbd34a59a4921d73f6baedd000',
      urlToBlobs = 'https://' + CONFIG.endpoints.api + '/blobs/';

  beforeAll(function(done){
    QB.init(CREDENTIALS.appId, CREDENTIALS.authKey, CREDENTIALS.authSecret, CONFIG);

    QB.createSession(QBUser1, function(err, session) {
      if (err) {
        done.fail('Create session error: ' + JSON.stringify(err));
      } else {
        expect(session).not.toBeNull();
        token = session.token;

        done();
      }
    });
  }, REST_REQUESTS_TIMEOUT);

  it('can create and upload files', function(done) {

    function upload(data){
      QB.content.createAndUpload(data, function(err, res) {
        if (err) {
          done.fail('Create and upload files error: ' + JSON.stringify(err));
        }else{
          fileId = res.id;

          expect(res).not.toBeNull();
          expect(res.name).toBe(isNodeEnv ? "logo.png" : 'QB.txt');

          done();
        }
      });
    }

    if(isNodeEnv){
      var fs = require('fs');

      var imgName = "logo.png";
      var srcIMG = 'spec/' + imgName;
      fs.stat(srcIMG, function (err, stats) {
        fs.readFile(srcIMG, function (err, data) {
          if (err) throw err;
          var data = {name: imgName, file: data, type: "image/png", size: data.length, public: false};
          upload(data);
        });
      });

    }else{
      var d = new Date(2015, 10, 13, 14, 30, 30, 600);
      var genFile = new File(['Hello QuickBlox'], 'QB.txt', {type: 'text/plain', lastModified: d});
      var data = {name: genFile.name, file: genFile, type: genFile.type, size: genFile.size, public: false};
      upload(data);
    }

  }, UPLOAD_TIMEOUT);

  it('can get file information by ID', function(done) {
    QB.content.getInfo(fileId, function(err, res) {
      if (err) {
        done.fail("Get file information by ID error: " + JSON.stringify(err));
      }else{
        expect(res).not.toBeNull();
        expect(res.blob.id).toEqual(fileId);

        done();
      }
    });
  }, REST_REQUESTS_TIMEOUT);

  it('can list content objects', function(done) {
    QB.content.list(function(err, res) {
      if (err) {
        done.fail("List content objects error: " + JSON.stringify(err));
      }else{
        expect(res).not.toBeNull();
        expect(res.items.length).toBeGreaterThan(0);

        done();
      }
    });
  }, REST_REQUESTS_TIMEOUT);

  it('can delete content objects', function(done) {
    QB.content.delete(fileId, function(err, result) {
      if (err) {
        done.fail('Delete content objects error: ' + JSON.stringify(err));
      }else{
        expect(result).toEqual(true);

        done();
      }
    });
  }, REST_REQUESTS_TIMEOUT);

  it('can access public URL', function() {
    var publicUrl = QB.content.publicUrl(fileUID);

    expect(publicUrl).toEqual(urlToBlobs + fileUID);
  });

  it('can access private URL', function() {
    var privateURL = QB.content.privateUrl(fileUID);
    var url = urlToBlobs + fileUID + '?token=';

    expect(privateURL).toBe(url + token);
  });
});
