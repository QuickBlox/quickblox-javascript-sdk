if (typeof define !== 'function') { var define = require('amdefine')(module) }

/*
 * QuickBlox JavaScript SDK
 *
 * Proxy Module
 *
 */

define(['config'],
function(config) {
  // For server-side applications through using npm package 'quickblox' you should include the following block
  /*var jsdom = require('jsdom');
  var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
  var jQuery = require('jquery/dist/jquery.min')(jsdom.jsdom().createWindow());
  jQuery.support.cors = true;
  jQuery.ajaxSettings.xhr = function() {
    return new XMLHttpRequest;
  };*/

  function ServiceProxy() {
    this.qbInst = {
      config: config,
      session: null
    };
    if (config.debug) { console.log("ServiceProxy", this.qbInst); }
  }

  ServiceProxy.prototype = {
    setSession: function(session) {
      this.qbInst.session = session;
    },

    getSession: function() {
      return this.qbInst.session;
    },

    ajax: function(params, callback) {
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

      jQuery.ajax( ajaxCall );
    }
  };

  return ServiceProxy;
});
