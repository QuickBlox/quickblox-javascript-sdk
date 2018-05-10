describe('Users API', function() {
  'use strict';

  var REST_REQUESTS_TIMEOUT = 5000;

  var isNodeEnv = typeof window === 'undefined' && typeof exports === 'object';
  var request = isNodeEnv ? require('request') : {};

  var QB = isNodeEnv ? require('../src/qbMain') : window.QB;
  var CREDENTIALS = isNodeEnv ? require('./config').CREDS : window.CREDS;
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
    });
  }, REST_REQUESTS_TIMEOUT);

  describe('Get Users', function(){

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
          value: QBUser1.login
        }
      };

      QB.users.listUsers(params, function(err, res){
        if (err) {
          done.fail("Filter users by login error: " + JSON.stringify(err));
        }else{
          expect(res).not.toBeNull();
          expect(res.items.length).toBe(1);
          expect(res.items[0].user.id).toBe(QBUser1.id);

          done();
        }
      });
    }, REST_REQUESTS_TIMEOUT);

    it('can get users by login', function(done) {
      var params = { 'login': QBUser1.login };

      QB.users.get(params, function(err, res){
        if (err) {
          done.fail("Get user by login error: " + JSON.stringify(err));
        }else{
          expect(res).not.toBeNull();
          expect(res.id).toBe(QBUser1.id);

          done();
        }
      });
    }, REST_REQUESTS_TIMEOUT);
    
    it('can get users by email', function(done) {
      var params = { 'email': QBUser1.email };

      QB.users.get(params, function(err, res){
        if (err) {
          done.fail("Get user by email error: " + JSON.stringify(err));
        }else{
          expect(res).not.toBeNull();
          expect(res.id).toBe(QBUser1.id);

          done();
        }
      });
    }, REST_REQUESTS_TIMEOUT);

    it('can get users by id', function(done) {
      var params = QBUser1.id;

      QB.users.get(params, function(err, res){
        if (err) {
          done.fail("Get user by id error: " + JSON.stringify(err));
        }else{
          expect(res).not.toBeNull();
          expect(res.login).toBe(QBUser1.login);

          done();
        }
      });
    }, REST_REQUESTS_TIMEOUT);
  });

  describe('CUD operations: ', function(){
    var userId, login = 'New_QB_User_' + Math.floor(Math.random()*9999999);

    it('can create a user', function(done) {
      var params = { 'login': login, 'password': 'someSecret', 'full_name': 'QuickBlox Test' };

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

    it('can update a user', function(done) {
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

    it('can delete a user', function(done) {
      QB.users.delete(userId, function(err, res){
        if (err) {
          done.fail("Delete user error: " + JSON.stringify(err));
        }else{
          expect(res).not.toBeNull();

          done();
        }
      });
    }, REST_REQUESTS_TIMEOUT);

    afterAll(function(done) {
      // return to origin user
      QB.createSession(QBUser1, function(err, result) {
        done();
      });
    });

  });

  describe('Service operations: ', function(){

    it('can reset password', function(done) {

      QB.users.resetPassword(QBUser1.email, function(err, res){
        expect(err).toBeNull();

        done();
      });

    }, REST_REQUESTS_TIMEOUT);

  });

  afterAll(function(done){
    QB.destroySession(function (err, result){
      expect(err).toBeNull();
      expect(result).not.toBeNull();
      expect(QB.service.qbInst.session).toBeNull();
      done();
    });
  });

});
