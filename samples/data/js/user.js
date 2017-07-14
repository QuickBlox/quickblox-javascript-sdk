'use strict';

/**
 * [User manage user
 * 
 * Flow:
 * 1. Check in [session]storage for exist user
 * 2. Get info from storage / Generate user's creds
 * 3. Login / create a user and login
 */
function User(params) {
  this.config = Object.assign({
    _saveMarker: 'qb_data_sample_login',
    _password: 'datasamplepassword'
  }, params);
}

User.userNames = ['Achilles', 'Hector', 'Hercules', 'Odysseus', 'Orpheus', 'Perseus', 'Yason'];

User._getRandomName = function() {
  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min)) + min;
  }

  return User.userNames[getRandomInt(0, User.userNames.length)];
};

// 8 characters
User._generateLogin = function() {
  return Math.random().toString(36).substring(4);
};

User.prototype._getLoginInStorage = function() {
  var loginInStorage = sessionStorage.getItem(this.config._saveMarker);

  return loginInStorage ? loginInStorage : null;
};

User.prototype._processSuccessAuth = function(user) {
  this._write(user);
  sessionStorage.setItem(this.config._saveMarker, user.login);
};

User.prototype._write = function(user) {
  this.id = user.id;
  this.login = user.login;
  this.full_name = user.full_name;
};

User.prototype._login = function(login) {
  var self = this,
    userCreds = {
    'login': login,
    'password': self.config._password
  };

  return new Promise(function(resolve, reject) {
    QB.login(userCreds, function(err, user) {
      if (err) {
        reject(err);
      } else  {
        resolve(user);
      }
    });
  });
};

User.prototype.login = function(login) {
  var self = this;

  return new Promise(function(resolve, reject) {
    self._login(login).then(function(user) {
      self._processSuccessAuth(user);

      resolve();
    }).catch(function(err) {
      self._signupAndLogin().then(function() {
        resolve();
      }).catch(function(err) {
        reject(err);
      });
    });
  });
};

User.prototype.signup = function() {
   var self = this;

  var usersCreds = {
    'login': User._generateLogin() + '_web_datasample',
    'password': self.config._password,
    'full_name': User._getRandomName()
  };

  return new Promise(function(resolve, reject) {
    QB.users.create(usersCreds, function(err, user){
      if (err) {
        reject(err);
      } else  {
        resolve(user);
      }
    });
  });
};

User.prototype._signupAndLogin = function() {
  var self = this;

  return new Promise(function(resolve , reject) {
    self.signup().then(function(user) {
      return self.login(user.login);
    }).then(function() {
      resolve();
    }).catch(function(err) {
      reject(err);
    });
  });
};

User.prototype.auth = function() {
  var self = this;
  var loginInStorage = self._getLoginInStorage();

  return loginInStorage ? self.login(loginInStorage) : self._signupAndLogin();
};

// cleanup session storage by marker
// and it's all, folks (
User.prototype.logout = function() {
  sessionStorage.removeItem(this.config._saveMarker);
};