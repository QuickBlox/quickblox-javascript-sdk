'use strict';

/* eslint no-alert: "off" */
/* eslint no-console: "off" */
/* global QB_CREDS:true, QB_CONFIG:true, User:true, Places:true, Map:true, Handlebars:true */

function App() {
  this.ui = {
    'app': 'j-app',
    'map': 'j-map',
    'places': 'j-places'
  }

  this.$app = document.getElementById('j-app');

  this.user;
  this.map;

  this.activePage; // 'main', 'new_location', 

  this.init();
}

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
      // render panel / header and set listeners
      var $app = document.getElementById(self.ui.app);
      $app.innerHTML = self.renderView('dashboard-tpl', {'full_name': self.user.full_name});
      self.setListeners('dashboard');

      // render list of places and set listeners
      // var $places =  document.getElementById(self.ui.places);
      // $places.innerHTML = self.renderView('places_preview-tpl', {'items': self.places.items});

      // render map and set listeners
      self.map = new Map({'el': document.getElementById(self.ui.map)});
      self.setListeners('map');

      self.activePage = 'main';
    }).catch(function(err) {
      alert('Something goes wrong, please try again later.');
      throw new Error(err);
    });
  });
}

App.prototype.setListeners = function(view) {
  var self = this;

  switch(view) {
    case 'dashboard':
      self._setListenersDashboard();
      break;

    case 'map': 
      self._setListenersMap();
      break;
    
    default:
      console.warn('Cannot set listeners to ' + view);
      break;
  }
}

App.prototype._setListenersDashboard = function() {
  var self = this;
  // remove a user and reload a page
  document.getElementById('j-logout').addEventListener('click', function() {
    self.user.logout();
    document.location.reload(true);
  });
}

App.prototype._setListenersMap = function() {

}

App.prototype.renderView = function(idTpl, options) {
  var source = document.getElementById(idTpl).innerHTML;
  var tpl = Handlebars.compile(source);

  return tpl(options);
}

// this rule only for this line
/* eslint no-unused-vars:0*/
var app = new App();