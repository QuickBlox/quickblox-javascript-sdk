/*
 * QuickBlox JavaScript SDK
 *
 * Proxy Module
 *
 */

// Browserify exports and dependencies
module.exports = ServiceProxy;
var isBrowser = typeof window !== "undefined" && window.jQuery;

var config = require('./qbConfig');

// For server-side applications through using npm package 'quickblox' you should include the following line
if(!isBrowser) var request = require('request');

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
    timeout: config.timeout || null,
    beforeSend: function(jqXHR, settings) {
      if (config.debug) { console.log('ServiceProxy.ajax beforeSend', jqXHR, settings); }
      if (settings.url.indexOf('://' + config.endpoints.s3Bucket) === -1) {
        console.log('setting headers on request to ' + settings.url);
        if (_this.qbInst.session && _this.qbInst.session.token) {
          jqXHR.setRequestHeader('QB-Token', _this.qbInst.session.token);
        }
      }
    },
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
  
  if(!isBrowser) {
    
    var isJSONRequest = ajaxCall.dataType === 'json';
      makingQBRequest = params.url.indexOf('://' + config.endpoints.s3Bucket) === -1 && 
                        _this.qbInst && 
                        _this.qbInst.session && 
                        _this.qbInst.session.token ||
                        false;
    
    var qbRequest = {
      url: ajaxCall.url,
      method: ajaxCall.type,
      json: isJSONRequest ? ajaxCall.data : null,
      form: !isJSONRequest ? ajaxCall.data : null,
      headers: makingQBRequest ? { 'QB-Token' : _this.qbInst.session.token } : null
    };
        
    var requestCallback = function(error, response, body) {
      if(error || response.statusCode > 300  || body.toString().indexOf("DOCTYPE") !== -1) {
        try {
          var errorMsg = {
            code: response && response.statusCode || error.code,
            status: response && response.headers.status || 'error',
            message: body || error.errno,
            detail: body && body.errors || error.syscall
          };
        } catch(e) {
          var errorMsg = error;
        }
        callback(errorMsg, null);
      } else {
        callback(null, body);
      }
    };

  }
  
  // Optional - for example 'multipart/form-data' when sending a file.
  // Default is 'application/x-www-form-urlencoded; charset=UTF-8'
  if (typeof params.contentType === 'boolean' || typeof params.contentType === 'string') { ajaxCall.contentType = params.contentType; }
  if (typeof params.processData === 'boolean') { ajaxCall.processData = params.processData; }
  
  if(isBrowser) {
    jQuery.ajax( ajaxCall );
  } else {
    request(qbRequest, requestCallback);
  }
};
