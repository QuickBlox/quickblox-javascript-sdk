'use strict';

/* global google:true, navigator:true */

function Map(params) {
  // el is require for Gmap
  this.el = params.el;
  // Gmap 
  this.gmap;
  // set cb to handle a click on map
  this.draftNewPlace = params.draftNewPlace;
  // places/markes saved
  this.places = {};

  this._MARKERS_BASE_URL = 'https://samples.quickblox.com/web/resources/';
  this._MARKER_ACTIVE = 'marker_create.png';
  this._MARKER = 'marker.png';

  this._DEFAULT_MAP_OPTIONS =  {
    'zoom': 14,
    'center': {
      'lat': 51.5028056,
      'lng': -0.1281803
    },
    'disableDefaultUI': true
  };

  this._sketchedPlace = null;

  this._activePlace = false;
  Object.defineProperty(this, 'activePlace', {
    set: function(placeId) {
      var self = this;

      if(placeId) {
        var marker = self.places[placeId];

        marker.setIcon(self._MARKERS_BASE_URL + self._MARKER_ACTIVE);
        self.gmap.setCenter(marker.getPosition());
     
        self._activePlace = true;
      } else {
        self._activePlace = false;
      }
    }
  });

  this._init();
}

Map.transfromLocationOnGmapSyntax = function(location) {
  return {
      'lat': location[1],
      'lng': location[0]
    };
}

Map.prototype.sketchPlace = function(latLng) {
  var self = this;

  self._sketchedPlace = new google.maps.Marker({
    'map': self.gmap,
    'position': latLng,
    'animation': google.maps.Animation.DROP,
    'icon': self._MARKERS_BASE_URL + self._MARKER_ACTIVE
  });

  self.gmap.panTo(latLng);
}

Map.prototype._init = function() {
  var self = this;

  self.gmap = new google.maps.Map(self.el, self._DEFAULT_MAP_OPTIONS);

  // set a listener on click on the map
  self.gmap.addListener('click', function(e) {
      var latLng = e.latLng;

      if(!self._sketchedPlace && !self._activePlace) {
        self.sketchPlace(latLng);
        self.draftNewPlace();
      }
  });
}

Map.prototype.getAndSetUserLocation = function() {
  var self = this;

  // check is geolocation avalable in this browser
  if (navigator.geolocation) {
    // get current location
    window.navigator.geolocation.getCurrentPosition(function(pos) {
      var position = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };

      self.gmap.setCenter(position);
    });
  }
}

Map.prototype.removeAllPlaces = function() {
  var self = this;

  for(var k in self.places) {
    self.places[k].setMap(null);
  }
}

Map.prototype._createMarker = function(position) {
  var self = this;

  return new google.maps.Marker({
    position: position,
    map: self.gmap,
    icon: self._MARKERS_BASE_URL + self._MARKER
  });
}

Map.prototype.setPlace = function(place) {
  var position = Map.transfromLocationOnGmapSyntax(place.location);

  var marker = this._createMarker(position);
  this.places[place._id] = marker;
}

Map.prototype.setPlaces = function(places) {
  var self = this;

  if(self._sketchedPlace) {
    self._sketchedPlace.setMap(null);
  }

  if(Array.isArray(places)) {
    places.forEach(self.setPlace, this);
  } else {
    self.setPlace(places);
  }
}



Map.prototype.getPositionSketchedPlace = function() {
  return this._sketchedPlace.getPosition().toJSON(); 
}

Map.prototype.removeSketchedPlace = function() {
  var self = this;

  self._sketchedPlace.setMap(null);
  self._sketchedPlace = null;
}