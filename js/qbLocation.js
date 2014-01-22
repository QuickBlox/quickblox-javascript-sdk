/*
 * QuickBlox JavaScript SDK
 *
 * Location module
 *
 */

// Browserify exports and dependencies
module.exports = LocationProxy;
var config = require('./qbConfig');
var utils = require('./qbUtils');

var geoUrl = config.urls.base + config.urls.geo;
var geoFindUrl = geoUrl + '/' + config.urls.find + config.urls.type;
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
  var allowedProps = ['longitude', 'latitude', 'status'], prop, msg = {};
  for (prop in params) {
    if (params.hasOwnProperty(prop)) {
      if (allowedProps.indexOf(prop)>0) {
        msg[prop] = params[prop];
      } 
    }
  }
  if (config.debug) { console.debug('GeoProxy.create', params);}
  this.service.ajax({url: utils.resourceUrl(geoUrl, params.id), data: {geo_data:msg}, type: 'PUT'},
                   function(err,res){
                    if (err) { callback(err,null);}
                    else { callback(err, res.geo_datum);}
                   });
};

GeoProxy.prototype.get = function(id, callback){
  if (config.debug) { console.debug('GeoProxy.get', id);}
  this.service.ajax({url: utils.resourceUrl(geoUrl, id)}, function(err,result){
     if (err) { callback (err, null); }
     else { callback(null, result.geo_datum); }
  });
};

GeoProxy.prototype.list = function(params, callback){
  if (typeof params === 'function') {
    callback = params;
    params = undefined;
  }
  if (config.debug) { console.debug('GeoProxy.find', params);}
  this.service.ajax({url: geoFindUrl, data: params}, callback);
};

GeoProxy.prototype.delete = function(id, callback){
  if (config.debug) { console.debug('GeoProxy.delete', id); }
  this.service.ajax({url: utils.resourceUrl(geoUrl, id), type: 'DELETE', dataType: 'text'},
                   function(err,res){
                    if (err) { callback(err, null);}
                    else { callback(null, true);}
                   });
};

GeoProxy.prototype.purge = function(days, callback){
  if (config.debug) { console.debug('GeoProxy.purge', days); }
  this.service.ajax({url: geoUrl + config.urls.type, data: {days: days}, type: 'DELETE', dataType: 'text'},
                   function(err, res){
                    if (err) { callback(err, null);}
                    else { callback(null, true);}
                   });
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
  this.service.ajax({url: utils.resourceUrl(placesUrl, id)}, callback);
};

PlacesProxy.prototype.update = function(place, callback){
  if (config.debug) { console.debug('PlacesProxy.update', place);}
  this.service.ajax({url: utils.resourceUrl(placesUrl, id), data: {place: place}, type: 'PUT'} , callback);
};

PlacesProxy.prototype.delete = function(id, callback){
  if (config.debug) { console.debug('PlacesProxy.delete', params);}
  this.service.ajax({url: utils.resourceUrl(placesUrl, id), type: 'DELETE'}, callback);
};
