/*
 * QuickBlox JavaScript SDK
 *
 * Location module
 *
 */

// Browserify exports and dependencies
module.exports = LocationProxy;
var config = require('./qbConfig');

var geoUrl = config.urls.base + config.urls.geo;
var geoFindUrl = config.urls.base + 'find' + config.urls.geo;
var placesUrl = config.urls.base + config.urls.places;


function LocationProxy(service){
  this.service = service;
  this.geodata = new GeoProxy(service);
  this.places = new PlacesProxy(service);
  if (config.debug) { console.debug("LocationProxy", service); }
}


function GeoProxy(service){
  this.service = service;
}

GeoProxy.prototype.create = function(params, callback){
  if (config.debug) { console.debug('GeoProxy.create', {geo_data: params});}
  this.service.ajax({url: geoUrl + config.urls.type, data: {geo_data: params}, type: 'POST'}, function(err,result){
    if (err){ callback(err, null); }
    else { callback (err, result.geo_datum); }
  });
};

GeoProxy.prototype.update = function(params, callback){
  if (config.debug) { console.debug('GeoProxy.create', params);}
  this.service.ajax({url: geoUrl + params.id + config.urls.type, data: {geodata:params}, type: 'PUT'}, callback);
};

GeoProxy.prototype.get = function(id, callback){
  if (config.debug) { console.debug('GeoProxy.get', params);}
  this.service.ajax({url: geoUrl + params.id + config.urls.type}, callback);
};

GeoProxy.prototype.search = function(params, callback){
  if (config.debug) { console.debug('GeoProxy.get', params);}
  this.service.ajax({url: geoFindUrl, data: params}, callback);
};

GeoProxy.prototype.delete = function(id, callback){
  if (config.debug) { console.debug('GeoProxy.delete', id); }
  this.service.ajax({url: geoUrl + id + config.urls.type, type: 'DELETE'}, callback);
};

GeoProxy.prototype.purge = function(days, callback){
  if (config.debug) { console.debug('GeoProxy.purge', id); }
  this.service.ajax({url: geoUrl + config.urls.type, data: {days: days}, type: 'DELETE'}, callback);
};

function PlacesProxy(service) {
  this.service = service;
}

PlacesProxy.prototype.list = function(params, callback){
  if (config.debug) { console.debug('PlacesProxy.list', params);}
  this.service.ajax({url: placesUrl + config.urls.type}, callback);
};

PlacesProxy.prototype.create = function(params, callback){
  if (config.debug) { console.debug('PlacesProxy.create', params);}
  this.service.ajax({url: placesUrl + config.urls.type, data: {place:params}, type: 'POST'}, callback);
};

PlacesProxy.prototype.get = function(id, callback){
  if (config.debug) { console.debug('PlacesProxy.get', params);}
  this.service.ajax({url: placesUrl + id + config.urls.type}, callback);
};

PlacesProxy.prototype.update = function(place, callback){
  if (config.debug) { console.debug('PlacesProxy.update', place);}
  this.service.ajax({url: placesUrl + place.id + config.urls.type, data: {place: place}}, callback);
};

PlacesProxy.prototype.delete = function(id, callback){
  if (config.debug) { console.debug('PlacesProxy.delete', params);}
  this.service.ajax({url: placesUrl + id + config.urls.type, type: 'DELETE'}, callback);
};
