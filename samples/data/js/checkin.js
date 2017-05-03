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

// Places.prototype.getPlace = function(id) {
//   return this.items.find(function(place) {
//     return place._id === id;
//   })
// }

// Places.prototype.sync = function() {
//   var self = this;

//   var filter = { 
//     'sort_asc': 'created_at'
//   };

//   return new Promise(function(resolve, reject) {
//     QB.data.list(self.className, filter, function(err, res){
//       if (err) { 
//         reject(err);
//       } else {
//         res.items.forEach(function(el) {
//           self.items.push(el);
//         });

//         resolve();
//       }
//     });
//   })
// }