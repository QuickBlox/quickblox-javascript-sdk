'use strict';

/* eslint no-alert: "off" */
/* eslint no-console: "off" */
/* global QB_CREDS:true, QB_CONFIG:true, User:true, Places:true, Map:true, Handlebars:true */

function App() {
  this.ui = {
    'map': 'j-map',
    'panel': 'j-panel',
    'header': 'j-header'
  }

  // root el
  this.$app = document.getElementById('j-app');

  this.map;
  this.user = new User();
  this.places = new Places();

  /* Write to root element a class name of page by set activePage */
  this._activePages = ['dashboard', 'new_place', 'place_detailed'];

  Object.defineProperty(this, 'activePage', {
    set: function(params) {
      var self = this;

      // Set a class (pageName) to root el of app
      // Remove all previously options 
      self._activePages.forEach(function(pName) {
        self.$app.classList.remove(pName);
      });
      // set a name of current page
      self.$app.classList.add(params.pageName);
      
      // render the page
      self.renderPage(params.pageName, params.detailed);
    }
  });

  this._init();
}

App.prototype._init = function() {
  var self = this;

  // init the SDK, be careful the SDK must init one time
  QB.init(QB_CREDS.appId, QB_CREDS.authKey, QB_CREDS.authSecret, QB_CONFIG);

  // create a session
  QB.createSession(function() {
    // sync user and places from server
    Promise.all([self.user.auth(), self.places.sync()]).then(function() {
      // render skeleton of app
      self.$app.innerHTML = document.getElementById('app-tpl').innerHTML;
      // render the map and set listener
      self.map = new Map({'el': document.getElementById(self.ui.map)});
      self._setListenersMap();

      self.activePage = {
        pageName: 'dashboard'
      };
    }).catch(function(err) {
      console.error(err);
      alert('Something goes wrong, checkout late.')
    });
  });
}

App.prototype.renderPage = function(pageName, detailed) {
  var self = this;

  switch(pageName) {
    case 'dashboard':
      self.renderDashboard()
      break;
    case 'new_place':
      self.renderCreatePlace();
      break;
    case 'place_detailed':
      self.renderPlaceDetailed(detailed);
      break;
  }
}

App.prototype.renderView = function(idTpl, options) {
  var source = document.getElementById(idTpl).innerHTML;
  var tpl = Handlebars.compile(source);

  return tpl(options);
}

App.prototype.renderDashboard = function() {
  var self = this;

  // render header and set listener
  var $header = document.getElementById(self.ui.header);
  $header.innerHTML = self.renderView('header-tpl', self.user);
  self._setListenersHeader();

  // render list of places and set listeners
  var $panel = document.getElementById(self.ui.panel);
  $panel.innerHTML = self.renderView('places_preview-tpl', {'items': self.places.items});
  self._setListenersPlacesPreview();
}

App.prototype._setListenersHeader = function() {
  var self = this;

  // remove a user and reload a page
  document.getElementById('j-logout').addEventListener('click', function() {
    self.user.logout();
    document.location.reload(true);
  });
}

App.prototype._setListenersPlacesPreview = function() {
  var self = this;

  var $places = document.querySelectorAll('.j-place'),
    placesAmount = $places.length;

  function showPlace(e) {
    var $item = e.target.closest('.j-place');

    self.activePage = {
      pageName: 'place_detailed',
      detailed: $item.dataset.id
    }
  }

  if(placesAmount) {
    for(var i = 0, l = (placesAmount - 1); i <= l; i++) {
      $places[i].addEventListener('click', showPlace);
    }
  }
}

App.prototype._setListenersMap = function() {
  var self = this;

  self.map.setClickListener(function() {
    self.activePage = {
      pageName: 'new_place'
    };
  });
}

App.prototype.renderCreatePlace = function() {
  var self = this;

  var $header = document.getElementById(self.ui.header);
  // Remove innerHTML of header
  while ($header.hasChildNodes()) {
    $header.removeChild($header.lastChild);
  }

  var latLng = self.map.getPositionSketchedPlace();

  var $panel = document.getElementById(self.ui.panel);
  $panel.innerHTML = self.renderView('new_place-tpl', {'latLng': JSON.stringify(latLng)});
  self._setListenersPlacesNew();
}

App.prototype._setListenersPlacesNew = function() {
  var self = this;

  var ui = {
    backBtn: 'j-to_dashboard',
    createPlaceForm: 'j-create'
  };

  document.getElementById(ui.backBtn).addEventListener('click', function(e) {
    e.preventDefault();

    self.map.removeSketchedPlace();

    self.activePage = {
      pageName: 'dashboard'
    };
  });

  document.getElementById(ui.createPlaceForm).addEventListener('submit', function(e) {
    e.preventDefault();

    var ltln = JSON.parse(document.getElementById('latlng').value),
      title = document.getElementById('title').value,
      description = document.getElementById('description').value,
      rate = document.getElementById('rate').value;

    var dataInfo = {
      location:  [ltln.lng, ltln.lat],
      title: title.trim(),
      description: description.trim(),
      rate: +rate,
    };

    self.places.create(dataInfo).then(function(res) {
      self.map.setPlaces(res);

      self.activePage = {
        pageName: 'place_detailed',
        detailed: res._id
      };

    }).catch(function(err) {
      // TODO: handle error
      console.error(err);
    });
  });
}

App.prototype.renderPlaceDetailed = function(placeId) {
  var self = this;
  
  var placeInfo = self.places.getPlace(placeId);

  var $header = document.getElementById(self.ui.header);
  // Remove innerHTML of header
  while ($header.hasChildNodes()) {
    $header.removeChild($header.lastChild);
  }

  var $panel = document.getElementById(self.ui.panel);
  $panel.innerHTML = self.renderView('place_detailed-tpl', placeInfo);

  document.getElementById('j-to_dashboard').addEventListener('click', function(e) {
    e.preventDefault();

    self.activePage = {
      pageName: 'dashboard'
    };
  });
}

// this rule only for this line
/* eslint no-unused-vars:0 */
var app = new App();