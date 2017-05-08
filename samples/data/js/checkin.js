'use strict';

function Checkin() {
  this.className = 'Checkin';

  this.items = [];
}

Checkin.prototype.create = function(params) {
  var self = this;

  return new Promise(function(resolve, reject) {
    QB.data.create(self.className, params, function(err, checkin) {
      if (err) {
          reject(err);
      } else {
        resolve(checkin);
      }
    });
  });
}

Checkin.prototype.get = function(params) {
  var self = this;

  return new Promise(function(resolve, reject) {
    QB.data.list(self.className, params, function(err, checkins) {
      if (err) {
        reject(err);
      } else {
        resolve(checkins.items);
      }
    });
  });
}