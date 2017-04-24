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

  this._activePlace = null;

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

// Map.prototype.setPlace = function(latLng) {
//   new google.maps.Marker({
//       position: latLng,
//       map: self.gmap,
//       icon: self._markersUrl + 'marker.png'
//     });
// }

Map.prototype.createAndSetPlace = function(latLng) {
  var self = this;

  self._activePlace = new google.maps.Marker({
    'map': self.gmap,
    'position': latLng,
    'animation': google.maps.Animation.DROP,
    'icon': self._markersUrl + 'marker_create.png'
  });

  self.gmap.panTo(latLng);
}
