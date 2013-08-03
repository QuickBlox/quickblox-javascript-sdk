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

ServiceProxy.prototype.ajax = function(params, callback) {
  var _this = this;
  if (this.session && this.session.token){
    if (params.data) {params.data.token = this.session.token;}
    else { params.data = {token:this.session.token}; }
  }
  if (this.config.debug) { console.debug('ServiceProxy.ajax calling',params.url, params); }
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
      if (_this.config.debug) {console.debug("ServiceProxy.ajax", status,data);}
      callback(null,data);
    },
    error: function(jqHXR, status, error) {
      if (_this.config.debug) {console.debug(status, error);}
      callback({status:status, message:error}, null);
    }
  });
}

