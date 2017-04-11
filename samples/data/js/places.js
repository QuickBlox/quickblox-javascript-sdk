'use strict';

function Places() {
  this.className = 'Place';

  this.items = [];
}

Places.prototype.sync = function() {
  var self = this;

  var filter = { 
    'sort_asc': 'created_at'
  };

  return new Promise(function(resolve, reject) {
    QB.data.list(self.className, filter, function(err, res){
      if (err) { 
        reject(err);
      } else {
        res.items.forEach(function(el) {
          self.items.push(el);
        });

        resolve();
      }
    });
  })
}