/* globals describe, beforeAll, expect, it */
'use strict';

describe('AddressBook', function() {
  var REST_REQUESTS_TIMEOUT = 5000;

  var isNodeEnv = typeof window === 'undefined' && typeof exports === 'object';

  var QB = isNodeEnv ? require('../src/qbMain') : window.QB;

  var CREDS = isNodeEnv ? require('./config').CREDS : window.CREDS;
  var CONFIG =  isNodeEnv ? require('./config').CONFIG : window.CONFIG;
  var QBUser1 = isNodeEnv ? require('./config').QBUser1 : window.QBUser1;

  var CONTACTS = [
    {
      'name':'Frederic Cartwright',
      'phone': '8879108395'
    },
    {
      'name':'Nessi McLaughlin',
      'phone': '8759108396'
    }
  ];

  beforeAll(function(done){
    QB.init(CREDS.appId, CREDS.authKey, CREDS.authSecret, CONFIG);

    QB.createSession(QBUser1, function(err, res) {
      if (err) {
        done.fail('Create session error: ' + JSON.stringify(err));
      } else {
        expect(res).not.toBeNull();
        done();
      }
    });
  }, REST_REQUESTS_TIMEOUT);

  describe('Create / Overwrite', function() {
    it('save contacts in global address book / without UDID', function(done) {
      function addressBookSaved(err, res) {
        expect(err).toBeNull();
        expect(res).toBeDefined();

        done();
      }

      QB.addressbook.save(CONTACTS, addressBookSaved);
    }, REST_REQUESTS_TIMEOUT);

    // TODO
    // it('with UDID', function(done){
    // }, REST_REQUESTS_TIMEOUT);
  });

  // describe('get address book', function() {
  //   it('without UDID', function(done) {
  //     function gotAddressBook(err, res) {
  //       expect(err).toBeNull();
  //       expect(res).not.toBeNull();

  //       done();
  //     }

  //     QB.addressbook.get(null, gotAddressBook);
  //   }, REST_REQUESTS_TIMEOUT);

  //   // TODO
  //   // it('with UDID', function(done){
  //   // }, REST_REQUESTS_TIMEOUT);
  // });



  // describe('retrive / get', function() {
  //   it('without UDID', function(done){
  //     // 
  //   }, REST_REQUESTS_TIMEOUT);

  //   // TODO
  //   // it('with UDID', function(done){
  //   // }, REST_REQUESTS_TIMEOUT);
  // });

  


});
