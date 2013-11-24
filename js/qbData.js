/*
 * QuickBlox JavaScript SDK
 *
 * Custom Objects module
 *
 */

// Browserify exports and dependencies
module.exports = DataProxy;
var config = require('./qbConfig');
var utils = require('./qbUtils');

var dataUrl = config.urls.base + config.urls.data;


function DataProxy(service){
  this.service = service;
  if (config.debug) { console.debug("LocationProxy", service); }
}

DataProxy.prototype.create = function(className, data, callback){
  if (config.debug) { console.debug('DataProxy.create', className, data);}
  this.service.ajax({url: utils.resourceUrl(dataUrl, className), data: data, type: 'POST'}, function(err,res){
    if (err){ callback(err, null); }
    else { callback (err, res); }
  });
};

DataProxy.prototype.list= function(className, filters, callback) {
  // make filters an optional parameter
  if (typeof callback === 'undefined' && typeof filters === 'function') {
    callback = filters;
    filters = null;
  }
  if (config.debug) { console.debug('DataProxy.list', className, filters);}
  this.service.ajax({url: utils.resourceUrl(dataUrl, className), data: filters}, function(err,result){
    if (err){ callback(err, null); }
    else { callback (err, result); }
  });
};

DataProxy.prototype.update= function(className, data, callback) {
  if (config.debug) { console.debug('DataProxy.update', className, data);}
  this.service.ajax({url: utils.resourceUrl(dataUrl, className + '/' + data._id), data: data, type: 'PUT'}, function(err,result){
    if (err){ callback(err, null); }
    else { callback (err, result); }
  });
};

DataProxy.prototype.delete= function(className, id, callback) {
  if (config.debug) { console.debug('DataProxy.delete', className, id);}
  this.service.ajax({url: utils.resourceUrl(dataUrl, className + '/' + id), type: 'DELETE', dataType: 'text'},
                    function(err,result){
                      if (err){ callback(err, null); }
                      else { callback (err, true); }
                    });
};

DataProxy.prototype.uploadFile= function(className, params, callback){
  var formData;
  if (config.debug) { console.debug('DataProxy.uploadFile', className, params);}
  formData = new FormData();
  formData.append('field_name', params.field_name);
  formData.append('file', params.file);
  this.service.ajax({url: utils.resourceUrl(dataUrl, className + '/' + params.id + '/file'), data: formData,
                    contentType: false, processData: false, type:'POST'}, function(err, result){
                      if (err) { callback(err, null);}
                      else { callback (err, result); }
                    });
};

DataProxy.prototype.updateFile= function(className, params, callback){
  var formData;
  if (config.debug) { console.debug('DataProxy.updateFile', className, params);}
  formData = new FormData();
  formData.append('field_name', params.field_name);
  formData.append('file', params.file);
  this.service.ajax({url: utils.resourceUrl(dataUrl, className + '/' + params.id + '/file'), data: formData,
                    contentType: false, processData: false, type: 'POST'}, function(err, result) {
                      if (err) { callback (err, null); }
                      else { callback (err, result); }
                    });
};

DataProxy.prototype.downloadFile= function(className, params, callback){
  if (config.debug) { console.debug('DataProxy.downloadFile', className, params);}
  this.service.ajax({url: utils.resourceUrl(dataUrl, className + '/' + params.id + '/file'), data: 'field_name=' + params.field_name,
                    type:'GET', contentType: false, processData:false, mimeType: 'text/plain; charset=x-user-defined', dataType: 'binary'},
                    function(err, result) {
                      if (err) { callback (err, null); }
                      else { callback (err, result); }
                    });
};

DataProxy.prototype.deleteFile= function(className, params, callback){
  if (config.debug) { console.debug('DataProxy.deleteFile', className, params);}
  this.service.ajax({url: utils.resourceUrl(dataUrl, className + '/' + params.id + '/file'), data: {field_name: params.field_name},
                    dataType: 'text', type: 'DELETE'}, function(err, result) {
                      if (err) { callback (err, null); }
                      else { callback (err, true); }
                    });
};


