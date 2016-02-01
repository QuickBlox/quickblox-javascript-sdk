describe('Users API', function() {
  'use strict';

  var REST_REQUESTS_TIMEOUT = 3000;

  var isNodeEnv = typeof window === 'undefined' && typeof exports === 'object';
  var request = isNodeEnv ? require('request') : {};

  var QB = isNodeEnv ? require('../js/qbMain') : window.QB;
  var CREDENTIALS = isNodeEnv ? require('./config').CREDENTIALS : window.CREDENTIALS;
  var CONFIG =  isNodeEnv ? require('./config').CONFIG : window.CONFIG;
  var QBUser1 = isNodeEnv ? require('./config').QBUser1 : window.QBUser1;

  beforeAll(function(done){
    QB.init(CREDENTIALS.appId, CREDENTIALS.authKey, CREDENTIALS.authSecret, CONFIG);

    QB.createSession(QBUser1, function(err, result) {
      if (err) {
        done.fail("Create session error: " + JSON.stringify(err));
      } else {
        expect(result).not.toBeNull();
        
        done();
      }
    }, REST_REQUESTS_TIMEOUT);
  });

  /**
   * TEST CASES
   */
  it('can list users', function(done){
    QB.users.listUsers(function(err, res){
      if(err){
        done.fail("List users error: " + JSON.stringify(err));
      }else{
        expect(res).not.toBeNull();
        expect(res.items.length).toBeGreaterThan(0);

        done();
      }
    });
  }, REST_REQUESTS_TIMEOUT);

  it('can filter users by email', function() {
    var params = {filter: { field: 'email', param: 'eq', value: 'nobody@nowhere.com' }};

    QB.users.listUsers(params, function(err, res){
      if (err) {
        fail("Filter users by email error: " + JSON.stringify(err));
      }else{
        expect(res).not.toBeNull();
        expect(res.items.length).toBe(0);
      }
    });
  }, REST_REQUESTS_TIMEOUT);

  it('can filter users by login', function(done) {
    var params = {
      filter: {
        field: 'login',
        param: 'eq',
        value: 'js_jasmine1'
      }
    };

    QB.users.listUsers(params, function(err, res){
      if (err) {
        done.fail("Filter users by login error: " + JSON.stringify(err));
      }else{
        expect(res).not.toBeNull();
        expect(res.items.length).toBe(1);
        expect(res.items[0].user.id).toBe(6126733);

        done();
      }
    });
  }, REST_REQUESTS_TIMEOUT);

  describe('Create, update & delete Users', function(){
    var userId, login = 'New_QB_User_' + Math.floor(Math.random()*9999999);

    it('can create a user (' + login + ')', function(done) {
      var params = { 'login': login, 'password': 'someSecret', 'full_name': 'QuickBlox Test', 'website': 'http://quickblox.com' };

      QB.users.create(params, function(err, res){
        if (err) {
          done.fail("Create user error: " + JSON.stringify(err));
        }else{
          expect(res).not.toBeNull();
          expect(res.full_name).toBe('QuickBlox Test');
          userId = res.id;

          done();
        }
      });
    }, REST_REQUESTS_TIMEOUT);

    it('can update a user (' + login + ')', function(done) {
      QB.login({login: login, password: 'someSecret'}, function(err, res){
        if (err) {
          done.fail("User login error: " + JSON.stringify(err));
        }else{
          QB.users.update(userId, {full_name: 'Updated QuickBlox Test'}, function(err, updated){
            if (err) {
              fail("Update user error: " + JSON.stringify(err));
            }else{
              expect(updated).not.toBeNull();
              expect(updated.full_name).toBe('Updated QuickBlox Test');

              done();
            }
          });
        }
      });
    }, REST_REQUESTS_TIMEOUT);

    it('can delete a user (' + login + ')', function(done) {
      QB.users.delete(userId, function(err, res){
        if (err) {
          done.fail("Delete user error: " + JSON.stringify(err));
        }else{
          expect(res).not.toBeNull();
          expect(res).toBe(' ');

          done();
        }
      });
    });
  }, REST_REQUESTS_TIMEOUT);

  describe('Get Users', function(){

    it('can get users by login', function(done) {
      var params = { 'login': 'js_jasmine2' };

      QB.users.get(params, function(err, res){
        if (err) {
          done.fail("Get user by login error: " + JSON.stringify(err));
        }else{
          expect(res).not.toBeNull();
          expect(res.id).toBe(6126741);

          done();
        }
      });
    }, REST_REQUESTS_TIMEOUT);

    it('can get users by email', function(done) {
      var params = { 'email': 'js_jasmine2@quickblox.com' };

      QB.users.get(params, function(err, res){
        if (err) {
          done.fail("Get user by email error: " + JSON.stringify(err));
        }else{
          expect(res).not.toBeNull();
          expect(res.id).toBe(6126741);

          done();
        }
      });
    }, REST_REQUESTS_TIMEOUT);

    it('can get users by id', function(done) {
      var params = 6126741;

      QB.users.get(params, function(err, res){
        if (err) {
          done.fail("Get user by id error: " + JSON.stringify(err));
        }else{
          expect(res).not.toBeNull();
          expect(res.login).toBe('js_jasmine2');

          done();
        }
      });
    }, REST_REQUESTS_TIMEOUT);
  });
});
