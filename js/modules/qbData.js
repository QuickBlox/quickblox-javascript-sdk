/*
 * QuickBlox JavaScript SDK
 *
 * Custom Objects module
 *
 */

var config = require('../qbConfig'),
    Utils = require('../qbUtils');

function DataProxy(service){
  this.service = service;
  if (config.debug) { console.log("LocationProxy", service); }
}

DataProxy.prototype = {

  create: function(className, data, callback) {
    if (config.debug) { console.log('DataProxy.create', className, data);}
    this.service.ajax({url: Utils.getUrl(config.urls.data, className), data: data, type: 'POST'}, function(err,res){
      if (err){ callback(err, null); }
      else { callback (err, res); }
    });
  },

  list: function(className, filters, callback) {
    // make filters an optional parameter
    if (typeof callback === 'undefined' && typeof filters === 'function') {
      callback = filters;
      filters = null;
    }
    if (config.debug) { console.log('DataProxy.list', className, filters);}
    this.service.ajax({url: Utils.getUrl(config.urls.data, className), data: filters}, function(err,result){
      if (err){ callback(err, null); }
      else { callback (err, result); }
    });
  },

  update: function(className, data, callback) {
    if (config.debug) { console.log('DataProxy.update', className, data);}
    this.service.ajax({url: Utils.getUrl(config.urls.data, className + '/' + data._id), data: data, type: 'PUT'}, function(err,result){
      if (err){ callback(err, null); }
      else { callback (err, result); }
    });
  },

  delete: function(className, id, callback) {
    if (config.debug) { console.log('DataProxy.delete', className, id);}
    this.service.ajax({url: Utils.getUrl(config.urls.data, className + '/' + id), type: 'DELETE', dataType: 'text'},
                      function(err,result){
                        if (err){ callback(err, null); }
                        else { callback (err, true); }
                      });
  },

  uploadFile: function(className, params, callback) {
    var formData;
    if (config.debug) { console.log('DataProxy.uploadFile', className, params);}
    formData = new FormData();
    formData.append('field_name', params.field_name);
    formData.append('file', params.file);
    this.service.ajax({url: Utils.getUrl(config.urls.data, className + '/' + params.id + '/file'), data: formData,
                      contentType: false, processData: false, type:'POST'}, function(err, result){
                        if (err) { callback(err, null);}
                        else { callback (err, result); }
                      });
  },

  updateFile: function(className, params, callback) {
    var formData;
    if (config.debug) { console.log('DataProxy.updateFile', className, params);}
    formData = new FormData();
    formData.append('field_name', params.field_name);
    formData.append('file', params.file);
    this.service.ajax({url: Utils.getUrl(config.urls.data, className + '/' + params.id + '/file'), data: formData,
                      contentType: false, processData: false, type: 'POST'}, function(err, result) {
                        if (err) { callback (err, null); }
                        else { callback (err, result); }
                      });
  },

  downloadFile: function(className, params, callback) {
    if (config.debug) { console.log('DataProxy.downloadFile', className, params); }
    var result = Utils.getUrl(config.urls.data, className + '/' + params.id + '/file');
    result += '?field_name=' + params.field_name + '&token=' + this.service.getSession().token;
    callback(null, result);
  },

  deleteFile: function(className, params, callback) {
    if (config.debug) { console.log('DataProxy.deleteFile', className, params);}
    this.service.ajax({url: Utils.getUrl(config.urls.data, className + '/' + params.id + '/file'), data: {field_name: params.field_name},
                      dataType: 'text', type: 'DELETE'}, function(err, result) {
                        if (err) { callback (err, null); }
                        else { callback (err, true); }
                      });
  }
  
};

module.exports = DataProxy;
