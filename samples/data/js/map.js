'use strict';

/* global google:true */

function Map(params) {
  this.el = params.el;

  this.gmap;

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
