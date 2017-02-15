describe('Session Managment', function() {
    'use strict';

    var REST_REQUESTS_TIMEOUT = 10000;

    var isNodeEnv = typeof window === 'undefined' && typeof exports === 'object';

    var QuickBlox = isNodeEnv ? require('../src/qbMain') : window.QB.QuickBlox;

    var CREDS = isNodeEnv ? require('./config').CREDS : window.CREDS;
    var CONFIG =  isNodeEnv ? require('./config').CONFIG : window.CONFIG;
    var QBUser1 = isNodeEnv ? require('./config').QBUser1 : window.QBUser1;
    // Upd the CONFIG 
    CONFIG.sessionManagement = {
        enable: true,
        onerror: function() {
            console.error('sessionManagement client callback');
        }
    }
    // Started FUN!
    describe('Application Session', function() {
        var QB = new QuickBlox();
        var tokenSaved;

        it('can init SDK by application credentials', function(done) {
            QB.init(CREDS.appId, CREDS.authKey, CREDS.authSecret, CONFIG).then(function(token) {
                tokenSaved = token; // save token for next cases

                expect(token).not.toBeNull();
                done();
            });
        });

        it('can send a request', function (done) {
            QB.users.listUsers(function(err, res){
                if(err) {
                    done.fail('CAN SEND A REQUES got a error');
                } else {
                    expect(res).not.toBeNull();
                    done();
                }
            });
        });

        it('can destroy a session', function (done) {
            QB.destroySession(function(err) {
                expect(err).toBeNull();
                done();
            });
        });

        // it('can send a request without existing session', function (done) {
        //     QB.users.listUsers(function(err, res){
        //         if(err) {
        //             done.fail('CAN SEND A REQUES got a error');
        //         } else {
        //             expect(res).not.toBeNull();
        //             done();
        //         }
        //     });
        // });

    });
});






      //   
      //     console.log('Destroyed a sesion.');
      //       QB.users.listUsers(function(err, res){
      //         if(err) {
      //           console.error(err)
      //         } else {
      //           expect(res).not.toBeNull();
      //           done();
      //         }
      //       });
      //   });
      // });
  // 

