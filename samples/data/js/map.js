'use strict';

/* TODO:
 * 1. set PATH to markers, markers name
 * 2. set map params
 */

/* global google:true */

function Map(params) {
  // set required params
  this.el = params.el;

  this.gmap;
  this._sketchedPlace = null; 
  this._listener = null;

  this._markersUrl = 'https://samples.quickblox.com/web/resources/';

  this.init();
}

Map.prototype.init = function() {
  var mapsOptions = {
    'zoom': 14,
    'center': {
      'lat': 51.5028056,
      'lng': -0.1281803
    },
    'disableDefaultUI': true
  };

  this.gmap = new google.maps.Map(this.el, mapsOptions);
}

Map.prototype.setClickListener = function(cb) {
  var self = this;

  self.gmap.addListener('click', function(e) {
    var latLng = e.latLng;

    if(!self._sketchedPlace) {
      self.sketchPlace(latLng);
      cb();
    }
  });
}

Map.transfromLocationOnGmapSyntax = function(location) {
  return {
      'lat': location[1],
      'lng': location[0]
    };
}

Map.prototype.createMarker = function(position) {
  var self = this;

  new google.maps.Marker({
    position: position,
    map: self.gmap,
    icon: self._markersUrl + 'marker.png'
  });
}

Map.prototype.setPlace = function(place) {
  var position = Map.transfromLocationOnGmapSyntax(place.location);

  this.createMarker(position);
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

Map.prototype.sketchPlace = function(latLng) {
  var self = this;

  self._sketchedPlace = new google.maps.Marker({
    'map': self.gmap,
    'position': latLng,
    'animation': google.maps.Animation.DROP,
    'icon': self._markersUrl + 'marker_create.png'
  });

  self.gmap.panTo(latLng);
}

Map.prototype.getPositionSketchedPlace = function() {
  return this._sketchedPlace.getPosition().toJSON(); 
}

Map.prototype.removeSketchedPlace = function() {
  var self = this;

  self._sketchedPlace.setMap(null);
  self._sketchedPlace = null;
}