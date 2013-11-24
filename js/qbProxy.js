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
  jQuery.ajaxSetup({
    accepts: {
      binary: "text/plain; charset=x-user-defined"
    },
    contents: {
    },
    converters: {
      "text binary": true // Nothing to convert
    }
  });
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
  //if (this.qbInst.session && this.qbInst.session.token){
    //if (params.data) {
      //if (params.data instanceof FormData) {
        //params.data.append('token', this.qbInst.session.token);
      //} else {
        //params.data.token = this.qbInst.session.token;
      //}
    //} else { 
      //params.data = {token: this.qbInst.session.token}; 
    //}
  //}
  if (config.debug) { console.debug('ServiceProxy',  params.type || 'GET', params); }
  var ajaxCall =   {
    url: params.url,
    type: params.type || 'GET',
    dataType: params.dataType || 'json',
    data: params.data,
    beforeSend: function(jqXHR, settings){
      if (config.debug) {console.debug('ServiceProxy.ajax beforeSend', jqXHR, settings);}
      if (settings.url.indexOf('://qbprod.s3.amazonaws.com') === -1) {
        console.debug('setting headers on request to ' + settings.url);
        jqXHR.setRequestHeader('QuickBlox-REST-API-Version', '0.1.1');
        if (_this.qbInst.session && _this.qbInst.session.token) {
          jqXHR.setRequestHeader('QB-Token', _this.qbInst.session.token);
        }
      }
    },
    success: function (data, status, jqHXR) {
      if (config.debug) {console.debug('ServiceProxy.ajax success', status, data);}
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
  if (typeof params.mimeType === 'string') { ajaxCall.mimeType = params.mimeType; }
  jQuery.ajax( ajaxCall );
}
