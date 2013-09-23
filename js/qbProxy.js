/*
 * QuickBlox JavaScript SDK
 *
 * Proxy module
 *
 */

// Browserify exports and dependencies
module.exports = ServiceProxy;
var config = require('./qbConfig');
var jQuery = require('../lib/jquery-1.10.2');

function ServiceProxy(qb){
  this.qbInst = qb;
  jQuery.support.cors = true;
  if (config.debug) { console.debug("ServiceProxy", qb); }
}

ServiceProxy.prototype.setSession= function(session){
  this.qbInst.session = session;
};

ServiceProxy.prototype.getSession = function(){
  return this.qbInst.session;
};

ServiceProxy.prototype.ajax = function(params, callback) {
  var _this = this;
  if (this.qbInst.session && this.qbInst.session.token){
    if (params.data) {
      if (params.data instanceof FormData) {
        params.data.append('token', this.qbInst.session.token);
      } else {
        params.data.token = this.qbInst.session.token;
      }
    } else { 
      params.data = {token: this.qbInst.session.token}; 
    }
  }
  if (config.debug) { console.debug('ServiceProxy',  params.type || 'GET', params); }
  var ajaxCall =   {
    url: params.url,
    type: params.type || 'GET',
    dataType: params.dataType || 'json',
    data: params.data,
    // Currently can't do this as it causes CORS issue (OPTIONS preflight check returns 404)
    beforeSend: function(jqXHR, settings){
      if (config.debug) {console.debug('ServiceProxy.ajax beforeSend', jqXHR, settings);}
      jqXHR.setRequestHeader('QuickBlox-REST-API-Version', '0.1.1');
    },
    success: function (data, status, jqHXR) {
      if (config.debug) {console.debug('ServiceProxy.ajax success', status,data);}
      callback(null,data);
    },
    error: function(jqHXR, status, error) {
      if (config.debug) {console.debug('ServiceProxy.ajax error', jqHXR, status, error);}
      var errorMsg = {status: status, message:error};
      if (jqHXR && jqHXR.responseText){ errorMsg.detail = jqHXR.responseText || jqHXR.responseXML; }
      if (config.debug) {console.debug("ServiceProxy.ajax error", error);}
      callback(errorMsg, null);
    }
  };
  // Optional - for example 'multipart/form-data' when sending a file.
  // Default is 'application/x-www-form-urlencoded; charset=UTF-8'
  if (typeof params.contentType === 'boolean' || typeof params.contentType === 'string') { ajaxCall.contentType = params.contentType; }
  if (typeof params.processData === 'boolean') { ajaxCall.processData = params.processData; }
  if (typeof params.crossDomain === 'boolean') { ajaxCall.crossDomain = params.crossDomain; }
  if (typeof params.async === 'boolean') { ajaxCall.async = params.async; }
  if (typeof params.cache === 'boolean') { ajaxCall.cache = params.cache; }
  if (typeof params.crossDomain === 'boolean') { ajaxCall.crossDomain = params.crossDomain; }
  jQuery.ajax( ajaxCall );
}
