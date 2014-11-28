/*
 * QuickBlox JavaScript SDK
 *
 * Location module
 *
 */

var config = require('../qbConfig'),
    Utils = require('../qbUtils');

var geoFindUrl = config.urls.geodata + '/find';

function LocationProxy(service){
  this.service = service;
  this.geodata = new GeoProxy(service);
  this.places = new PlacesProxy(service);
  if (config.debug) { console.log("LocationProxy", service); }
}

function GeoProxy(service){
  this.service = service;
}

GeoProxy.prototype = {

  create: function(params, callback){
    if (config.debug) { console.log('GeoProxy.create', {geo_data: params});}
    this.service.ajax({url: Utils.getUrl(config.urls.geodata), data: {geo_data: params}, type: 'POST'}, function(err,result){
      if (err){ callback(err, null); }
      else { callback (err, result.geo_datum); }
    });
  },

  update: function(params, callback){
    var allowedProps = ['longitude', 'latitude', 'status'], prop, msg = {};
    for (prop in params) {
      if (params.hasOwnProperty(prop)) {
        if (allowedProps.indexOf(prop)>0) {
          msg[prop] = params[prop];
        } 
      }
    }
    if (config.debug) { console.log('GeoProxy.create', params);}
    this.service.ajax({url: Utils.getUrl(config.urls.geodata, params.id), data: {geo_data:msg}, type: 'PUT'},
                     function(err,res){
                      if (err) { callback(err,null);}
                      else { callback(err, res.geo_datum);}
                     });
  },

  get: function(id, callback){
    if (config.debug) { console.log('GeoProxy.get', id);}
    this.service.ajax({url: Utils.getUrl(config.urls.geodata, id)}, function(err,result){
       if (err) { callback (err, null); }
       else { callback(null, result.geo_datum); }
    });
  },

  list: function(params, callback){
    if (typeof params === 'function') {
      callback = params;
      params = undefined;
    }
    if (config.debug) { console.log('GeoProxy.find', params);}
    this.service.ajax({url: Utils.getUrl(geoFindUrl), data: params}, callback);
  },

  delete: function(id, callback){
    if (config.debug) { console.log('GeoProxy.delete', id); }
    this.service.ajax({url: Utils.getUrl(config.urls.geodata, id), type: 'DELETE', dataType: 'text'},
                     function(err,res){
                      if (err) { callback(err, null);}
                      else { callback(null, true);}
                     });
  },

  purge: function(days, callback){
    if (config.debug) { console.log('GeoProxy.purge', days); }
    this.service.ajax({url: Utils.getUrl(config.urls.geodata), data: {days: days}, type: 'DELETE', dataType: 'text'},
                     function(err, res){
                      if (err) { callback(err, null);}
                      else { callback(null, true);}
                     });
  }

};

function PlacesProxy(service) {
  this.service = service;
}

PlacesProxy.prototype = {

  list: function(params, callback){
    if (config.debug) { console.log('PlacesProxy.list', params);}
    this.service.ajax({url: Utils.getUrl(config.urls.places)}, callback);
  },

  create: function(params, callback){
    if (config.debug) { console.log('PlacesProxy.create', params);}
    this.service.ajax({url: Utils.getUrl(config.urls.places), data: {place:params}, type: 'POST'}, callback);
  },

  get: function(id, callback){
    if (config.debug) { console.log('PlacesProxy.get', id);}
    this.service.ajax({url: Utils.getUrl(config.urls.places, id)}, callback);
  },

  update: function(place, callback){
    if (config.debug) { console.log('PlacesProxy.update', place);}
    this.service.ajax({url: Utils.getUrl(config.urls.places, place.id), data: {place: place}, type: 'PUT'} , callback);
  },

  delete: function(id, callback){
    if (config.debug) { console.log('PlacesProxy.delete', id);}
    this.service.ajax({url: Utils.getUrl(config.urls.places, id), type: 'DELETE', dataType: 'text'}, callback);
  }

};

module.exports = LocationProxy;
