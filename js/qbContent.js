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

function ContentProxy(service) {
  this.service = service;
}

ContentProxy.prototype.create= function(params, callback){
 if (config.debug) { console.debug('ContentProxy.create', params);}
  this.service.ajax({url: contentUrl + config.urls.type, data: {blob:params}, type: 'POST'}, function(err,result){
    if (err){ callback(err, null); }
    else { callback (err, result.blob); }
  });
};

ContentProxy.prototype.list= function(params, callback){
  if (typeof params === 'function' && typeof callback ==='undefined') {
    callback = params;
    params = null;
  }
  this.service.ajax({url: contentUrl + config.urls.type}, function(err,result){
    if (err){ callback(err, null); }
    else { callback (err, result); }
  });
};


