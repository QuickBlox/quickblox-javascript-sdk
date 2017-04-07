
/**
 * [User description]
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
}

User._generateUui = function() {
  var navigator_info = window.navigator;
  var screen_info = window.screen;
  var uid = navigator_info.mimeTypes.length;

  uid += navigator_info.userAgent.replace(/\D+/g, '');
  uid += navigator_info.plugins.length;
  uid += screen_info.height || '';
  uid += screen_info.width || '';
  uid += screen_info.pixelDepth || '';

  return uid;
}

User.prototype._write = function(objUser) {
  this.id = objUser.id;
  this.login = objUser.login;
  this.full_name = objUser.full_name;
}

User.prototype._getLoginInStorage = function() {
  var loginInStorage = sessionStorage.getItem(this.config._saveMarker);

  return loginInStorage ? loginInStorage : null;
}

/*
 * Flow:
 * 1. Check in sessionstorage for exist user
 * 2. Get info from storage / Generate user's creds
 * 3. Login / create a user and login
 */
User.prototype.auth = function() {
  var self = this;
  var loginInStorage = this._getLoginInStorage();

  return new Promise(function(resolve, reject) {
    if(loginInStorage) {
      self.login(loginInStorage).then(function(user) {
        console.info('[Data sample] Login as', user);

        self._processSuccessAuth(user);
        resolve();
      });
    } else {
      self.signup().then(function(user) {
        console.info('[Data sample] Signup as', user);

        self._processSuccessAuth(user);
        resolve();
      }).catch(function(err) {
        if(err.code === 422) {
          self.login().then(function(user) {
            console.info('[Data sample] Login as', user);

            self._processSuccessAuth(user);
            resolve();
          });
        } else {
          reject(err);
        }
      });
    }
  });
};

User.prototype.signup = function() {
  var self = this, 
    usersCreds = {
    'login': User._generateUui() + '_web_datasample',
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
}

User.prototype._processSuccessAuth = function(user) {
  this._write(user);
  sessionStorage.setItem(this.config._saveMarker, this.login);
};

User.prototype.login = function(login) {
  var self = this,
    userCreds = {
    'login': login || User._generateUui() + '_web_datasample',
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
}
