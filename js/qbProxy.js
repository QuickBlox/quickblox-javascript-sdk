/*
 * QuickBlox JavaScript SDK
 *
 * Proxy module
 *
 */

// Browserify exports and dependencies
module.exports = ServiceProxy;
var jQuery = require('../lib/jquery-1.10.2');

function ServiceProxy(qb){
  this.config = qb.config;
  this.session = qb.session;
  this.urls = qb.urls;
  if (this.config.debug) { console.debug("ServiceProxy", qb); }
}

var p = ServiceProxy.prototype;

p.ajax = function(params, callback) {
  var _this = this;
  jQuery.ajax({
    url: params.url,
    async: params.async || true,
    type: params.type || 'GET',
    cache: params.cache || false,
    crossDomain: params.crossDomain || true,
    data: params.data,
    // Currently can't do this as it causes CORS issue
    // beforeSend: function(jqXHR, settings){
    //jqXHR.setRequestHeader('QuickBlox-REST-API-Version', '0.1.1');
    success: function (data, status, jqHXR) {
      if (_this.config.debug) {console.debug(status,data);}
      callback(null,data);
    },
    error: function(jqHXR, status, error) {
      if (_this.config.debug) {console.debug(status, error);}
      callback({status:status, message:error}, null);
    }
  });
}

