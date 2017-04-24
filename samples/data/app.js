'use strict';

/* eslint no-alert: "off" */
/* eslint no-console: "off" */
/* global QB_CREDS:true, QB_CONFIG:true, User:true, Places:true, Map:true, Handlebars:true */

function App() {
  this.ui = {
    'map': 'j-map',
    'places': 'j-places',
    'header': 'j-header'
  }
  // Root el
  this.$app = document.getElementById('j-app');

  /* Write to root element a class name of page by set activePage */
  this._activePages = ['dashboard', 'new_place', 'place_detailed'];

  Object.defineProperty(this, 'activePage', {
    set: function(pageName) {
      var self = this;

      // Set a class (pageName) to root el of app
      self._activePages.forEach(function(pageName) {
        self.$app.classList.remove(pageName);
      });
      this.$app.classList.add(pageName);
    }
  });

  this.user;
  this.map;
  this.places;

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
    self.user = new User();
    self.places = new Places();

    // sync user and places from server
    Promise.all([self.user.auth(), self.places.sync()]).then(function() {
      // render panel / header and set listeners
      self.$app.innerHTML = self.renderView('dashboard-tpl', {'full_name': self.user.full_name});
      self.setListeners('dashboard');

      // render list of places and set listeners
      var $places =  document.getElementById(self.ui.places);
      $places.innerHTML = self.renderView('places_preview-tpl', {'items': self.places.items});
      self.setListeners('places');

      // render map and set listeners
      self.map = new Map({'el': document.getElementById(self.ui.map)});
      self.setListeners('map');

      self.activePage = 'dashboard';
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

    case 'places': 
      self._setListenersPlaces();
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
  var self = this;

  var l = self.map.gmap.addListener('click', function(e) {
    var latLng = e.latLng;

    self.map.createAndSetPlace(latLng);
    // It's horrible, will replace in next release
    google.maps.event.removeListener(l);

    self.activePage = 'new_place';

    self._renderCreatePlacePage(latLng.toJSON());
  });
}

App.prototype._setListenersPlacesNew = function() {
  var self = this;

  var ui = {
    back: 'j-to_dashboard',
    form: 'j-create'
  };

  document.getElementById(ui.form).addEventListener('submit', function(e) {
    e.preventDefault();

    var ltln = JSON.parse(document.getElementById('latlng').value);

    var dataInfo = {
      location:  [ltln.lng, ltln.lat],
      title: document.getElementById('title').value,
      description: document.getElementById('description').value,
      rate: document.getElementById('rate').value,
    };

    console.log(dataInfo);

    self.places.create(dataInfo).then(function(res) {
      console.log(res);
    }).catch(function(err) {
      console.error(err);
    });

    return false;
  });
}

App.prototype._setListenersPlaces = function() {
  var self = this;

  var $places = document.querySelectorAll('.j-places');

  function showPlace(e) {
    var $item = e.target.closest('.j-places');
    // TODO
    console.log($item.dataset);
  }

  $places.forEach(function(place) {
    place.addEventListener('click', showPlace);
  });
}

App.prototype._renderCreatePlacePage = function(latLng) {
  var self = this;

  var $header = document.getElementById(self.ui.header);
  $header.remove();

  var $places = document.getElementById(self.ui.places);
  $places.innerHTML = self.renderView('new_place-tpl', {'latLng': JSON.stringify(latLng)});

  this._setListenersPlacesNew();
}

App.prototype.renderView = function(idTpl, options) {
  var source = document.getElementById(idTpl).innerHTML;
  var tpl = Handlebars.compile(source);

  return tpl(options);
}

// this rule only for this line
/* eslint no-unused-vars:0 */
var app = new App();