/*
 * QuickBlox JavaScript SDK
 *
 * Proxy Module
 *
 */

// Browserify exports and dependencies
module.exports = ServiceProxy;
var config = require('./qbConfig');

// For server-side applications through using npm package 'quickblox' you should include the following line
var request = require('request');

function ServiceProxy() {
  this.qbInst = {
    config: config,
    session: null
  };
  if (config.debug) { console.log("ServiceProxy", this.qbInst); }
}

ServiceProxy.prototype.setSession = function(session) {
  this.qbInst.session = session;
};

ServiceProxy.prototype.getSession = function() {
  return this.qbInst.session;
};

ServiceProxy.prototype.ajax = function(params, callback) {
  if (config.debug) { console.log('ServiceProxy', params.type || 'GET', params); }
  var _this = this;
  var ajaxCall = {
    url: params.url,
    type: params.type || 'GET',
    dataType: params.dataType || 'json',
    data: params.data || ' ',
    beforeSend: function(jqXHR, settings) {
      if (config.debug) { console.log('ServiceProxy.ajax beforeSend', jqXHR, settings); }
      if (settings.url.indexOf('://' + config.endpoints.s3Bucket) === -1) {
        console.log('setting headers on request to ' + settings.url);
        if (_this.qbInst.session && _this.qbInst.session.token) {
          jqXHR.setRequestHeader('QB-Token', _this.qbInst.session.token);
        }
      }
    },
    headers: (((params.url.indexOf('://' + config.endpoints.s3Bucket) === -1)
                && (_this.qbInst.session && _this.qbInst.session.token)) ? { 'QB-Token' : _this.qbInst.session.token } : {}),
    success: function(data, status, jqHXR) {
      if (config.debug) { console.log('ServiceProxy.ajax success', data); }
      callback(null, data);
    },
    error: function(jqHXR, status, error) {
      if (config.debug) { console.log('ServiceProxy.ajax error', jqHXR.status, error, jqHXR.responseText); }
      var errorMsg = {
        code: jqHXR.status,
        status: status,
        message: error,
        detail: jqHXR.responseText
      };
      callback(errorMsg, null);
    }
  };
  
  // Optional - for example 'multipart/form-data' when sending a file.
  // Default is 'application/x-www-form-urlencoded; charset=UTF-8'
  if (typeof params.contentType === 'boolean' || typeof params.contentType === 'string') { ajaxCall.contentType = params.contentType; }
  if (typeof params.processData === 'boolean') { ajaxCall.processData = params.processData; }
  
  if(window && jQuery) {
    jQuery.ajax( ajaxCall );
  } else {
    request(ajaxCall, function(error, response, body) {
      if(!error) {
        ajaxCall.success(body);
      } else {
        ajaxCall.error(error, response.statusCode, body)
      }
    });
  }
};
