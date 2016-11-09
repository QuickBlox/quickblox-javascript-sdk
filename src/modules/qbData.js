'use strict';

/*
 * QuickBlox JavaScript SDK
 *
 * Custom Objects module
 *
 */

var config = require('../qbConfig'),
    Utils = require('../qbUtils');

// For server-side applications through using npm package 'quickblox' you should include the following lines
var isBrowser = typeof window !== 'undefined';

function DataProxy(service){
  this.service = service;
}

DataProxy.prototype = {

  create: function(className, data, callback) {
    Utils.QBLog('[DataProxy]', 'create', className, data);

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
    Utils.QBLog('[DataProxy]', 'list', className, filters);

    this.service.ajax({url: Utils.getUrl(config.urls.data, className), data: filters}, function(err,result){
      if (err){ callback(err, null); }
      else { callback (err, result); }
    });
  },

  update: function(className, data, callback) {
    Utils.QBLog('[DataProxy]', 'update', className, data);

    this.service.ajax({url: Utils.getUrl(config.urls.data, className + '/' + data._id), data: data, type: 'PUT'}, function(err,result){
      if (err){ callback(err, null); }
      else { callback (err, result); }
    });
  },

  delete: function(className, id, callback) {
    Utils.QBLog('[DataProxy]', 'delete', className, id);

    this.service.ajax({url: Utils.getUrl(config.urls.data, className + '/' + id), type: 'DELETE', dataType: 'text'},
                      function(err,result){
                        if (err){ callback(err, null); }
                        else { callback (err, true); }
                      });
  },

  uploadFile: function(className, params, callback) {
    Utils.QBLog('[DataProxy]', 'uploadFile', className, params);

    var formData;

    if(isBrowser){
      formData = new FormData();
      formData.append('field_name', params.field_name);
      formData.append('file', params.file);
    }else{
      formData = {
        field_name: params.field_name,
        file: {
          data: params.file,
          name: params.name
        }
      };
    }

    this.service.ajax({url: Utils.getUrl(config.urls.data, className + '/' + params.id + '/file'),
                      data: formData,
                      contentType: false,
                      processData: false,
                      type:'POST',
                      isFileUpload: true}, function(err, result){
                        if (err) { callback(err, null);}
                        else { callback (err, result); }
                      });
  },

  downloadFile: function(className, params, callback) {
    Utils.QBLog('[DataProxy]', 'downloadFile', className, params);

    var result = Utils.getUrl(config.urls.data, className + '/' + params.id + '/file');
    result += '?field_name=' + params.field_name + '&token=' + this.service.getSession().token;
    callback(null, result);
  },

  fileUrl: function(className, params) {
    var result = Utils.getUrl(config.urls.data, className + '/' + params.id + '/file');
    result += '?field_name=' + params.field_name + '&token=' + this.service.getSession().token;
    return result;
  },

  deleteFile: function(className, params, callback) {
    Utils.QBLog('[DataProxy]', 'deleteFile', className, params);

    this.service.ajax({url: Utils.getUrl(config.urls.data, className + '/' + params.id + '/file'), data: {field_name: params.field_name},
                      dataType: 'text', type: 'DELETE'}, function(err, result) {
                        if (err) { callback (err, null); }
                        else { callback (err, true); }
                      });
  }

};

module.exports = DataProxy;
