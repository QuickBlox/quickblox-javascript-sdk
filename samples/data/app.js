'use strict';

/**
 * [App description]
 */
function App() {
  this.ui = {
    'app': 'j-app',
    'map': 'j-map',
    'places': 'j-places'
  }
  this.$app = document.getElementById('j-app');

  this.user;
  this.map;

  this.init();
};

/**
 * 1. Auth user
 * 2. Create a map
 * 3. Sync a places (get from server)
 * 4. Set listeners
 */
App.prototype.init = function() {
  var self = this;

  // init the SDK, be careful the SDK must init one time
  QB.init(QB_CREDS.appId, QB_CREDS.authKey, QB_CREDS.authSecret, QB_CONFIG);
  // create a session
  QB.createSession(function() {
    // sync user and places from server
    self.user = new User();
    self.places = new Places();

    Promise.all([self.user.auth(), self.places.sync()]).then(function() {
      // render panel / header
      var $app = document.getElementById(self.ui.app);
      $app.innerHTML = self.renderView('dashboard-tpl', {'full_name': self.user.full_name});
      // render list of places
      var $places =  document.getElementById(self.ui.places);
      $places.innerHTML = self.renderView('places_preview-tpl', {'items': self.places.items});
      // render map
      self.map = new Map({'el': document.getElementById(self.ui.map)});
    }).catch(function(err) {
      throw new Error(err);
      alert('Something goes wrong, please try again later.');
    });
  });
}

App.prototype.renderView = function(idTpl, options) {
  var source = document.getElementById(idTpl).innerHTML;
  var tpl = Handlebars.compile(source);

  return tpl(options);
}

new App();





// var wl = window.location;
// var router = new Navigo(wl.origin + wl.pathname, true, '#!');

// router.on({
//   '/places/:id': function (id) {
//     console.log(id);
//   },
//   "*": function() {
//     console.info('Home');
//   }
// }).resolve();