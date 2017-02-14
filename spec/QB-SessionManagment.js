describe('Session Managment', function() {
  'use strict';

  var REST_REQUESTS_TIMEOUT = 10000;

  var isNodeEnv = typeof window === 'undefined' && typeof exports === 'object';

  var QuickBlox = isNodeEnv ? require('../src/qbMain') : window.QB.QuickBlox;

  var CREDS = isNodeEnv ? require('./config').CREDS : window.CREDS;
  var CONFIG =  isNodeEnv ? require('./config').CONFIG : window.CONFIG;
  var QBUser1 = isNodeEnv ? require('./config').QBUser1 : window.QBUser1;

  var token;

  CONFIG.sessionManagement = {
    enable: true,
    onerror: function() {
      console.error('sessionManagement client callback');
    }
  }

  describe('Application Session', function() {
    it('can init SDK by application credentials', function(done) {
      var QB = new QuickBlox();

      QB.init(CREDS.appId, CREDS.authKey, CREDS.authSecret, CONFIG).then(function(token) {
        token = token; // save token for next cases

        expect(token).not.toBeNull();

        done();
      });
    });

    it('can init SDK by token', function(done) {
      var QB = new QuickBlox();
      QB.init(token, CREDS.appId, CONFIG).then(function(token) {
        expect(token).not.toBeNull();

        done();
      });
    });


  });
});
