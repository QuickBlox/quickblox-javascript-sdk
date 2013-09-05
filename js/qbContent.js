/*
 * QuickBlox JavaScript SDK
 *
 * Content module
 *
 * For an overview of this module and what it can be used for
 * see http://quickblox.com/modules/content
 *
 * The API itself is described at http://quickblox.com/developers/Content
 *
 */

// Browserify exports and dependencies
module.exports = ContentProxy;
var config = require('./qbConfig');
var utils = require('./qbUtils');

var contentUrl = config.urls.base + config.urls.content;
var taggedForUserUrl = contentUrl + '/tagged';

function contentIdUrl(id) {
  return contentUrl + '/' + id;
}

function ContentProxy(service) {
  this.service = service;
}

ContentProxy.prototype.create = function(params, callback){
 if (config.debug) { console.debug('ContentProxy.create', params);}
  this.service.ajax({url: contentUrl + config.urls.type, data: {blob:params}, type: 'POST'}, function(err,result){
    if (err){ callback(err, null); }
    else { callback (err, result.blob); }
  });
};

ContentProxy.prototype.list = function(params, callback){
  if (typeof params === 'function' && typeof callback ==='undefined') {
    callback = params;
    params = null;
  }
  this.service.ajax({url: contentUrl + config.urls.type}, function(err,result){
    if (err){ callback(err, null); }
    else { callback (err, result); }
  });
};

ContentProxy.prototype.delete = function(id, callback){
  this.service.ajax({url: contentIdUrl(id) + config.urls.type, type: 'DELETE'}, function(err, result) {
    if (err) { callback(err,null); }
    else { callback(null, result); }
  });
};

ContentProxy.prototype.upload = function(params, callback){
  this.service.ajax({url: params.url, data: params.data, contentType: false, processData: false, type: 'POST'}, function(err,result){
    if (err) { callback (err, null); }
    else { callback (null, err); }
  });
};

ContentProxy.prototype.taggedForCurrentUser = function(callback) {
  this.service.ajax({url: taggedForUserUrl + config.urls.type}, function(err, result) {
    if (err) { callback(err, null); }
    else { callback(null, result); }
  });
};

ContentProxy.prototype.markUploaded = function (params, callback) {
  this.service.ajax({url: contentIdUrl(id) + '/complete' + config.urls.type, type: 'PUT', data: {blob: {size: params.size}}}, function(err, res){
    if (err) { callback (err, null); }
    else { callback (null, res); }
  });
};

ContentProxy.prototype.getInfo = function (id, callback) {
  this.service.ajax({url: contentIdUrl(id) + config.urls.type}, function (err, res) {
    if (err) { callback (err, null); }
    else { callback (null, res); }
  });
};

ContentProxy.prototype.getFile = function (uid, callback) {
 this.service.ajax({url: contentIdUrl(id) + config.urls.type}, function (err, res) {
    if (err) { callback (err, null); }
    else { callback (null, res); }
  });
};

ContentProxy.prototype.getBlobObjectById = function (id, callback) {
 this.service.ajax({url: contentIdUrl(id) + '/getblobobjectbyid' + config.urls.type}, function (err, res) {
    if (err) { callback (err, null); }
    else { callback (null, res); }
  });
};

ContentProxy.prototype.update = function (params, callback) {
  var data = {};
  data.blob = {};
  if (typeof params.name !== 'undefined') { data.blob.name = params.name; }
  this.service.ajax({url: contentIdUrl(param.id), data: data}, function(err, res) {
    if (err) { callback (err, null); }
    else { callback (null, res); } 
  });
}

