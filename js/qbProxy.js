/*
 * QuickBlox JavaScript SDK
 *
 * Proxy Module
 *
 */

var config = require('./qbConfig');
var Utils = require('./qbUtils');

var versionNum = config.version;

// For server-side applications through using npm package 'quickblox' you should include the following lines
var isBrowser = typeof window !== 'undefined';
if (!isBrowser) {
  var request = require('request');
}

var ajax = isBrowser && window.jQuery && window.jQuery.ajax || isBrowser && window.Zepto && window.Zepto.ajax;
if (isBrowser && !ajax) {
  throw new Error('Quickblox requires jQuery or Zepto');
}

function ServiceProxy() {
  this.qbInst = {
    config: config,
    session: null
  };
}

ServiceProxy.prototype = {

  setSession: function(session) {
    this.qbInst.session = session;
  },

  getSession: function() {
    return this.qbInst.session;
  },

  handleResponse: function(error, response, next, retry) {
    // can add middleware here...
    var _this = this;
    if(error && typeof config.on.sessionExpired === 'function' && (error.message === 'Unauthorized' || error.status === '401 Unauthorized')) {
      config.on.sessionExpired(function(){next(error,response);}, retry);
    } else {
      if (error) {
        next(error, null);
      } else {
        if (config.addISOTime) response = Utils.injectISOTimes(response);
        next(null, response);
      }
    }
  },

  ajax: function(params, callback) {

    var clonedParams;
    if(params.data && params.data.file){
      clonedParams = JSON.parse(JSON.stringify(params));
      clonedParams.data.file = "...";
    }else{
      clonedParams = params;
    }
    Utils.QBLog('[ServiceProxy]', "Request: ", params.type || 'GET', {data: JSON.stringify(clonedParams)});

    var _this = this,
        retry = function(session) { if(!!session) _this.setSession(session); _this.ajax(params, callback); };

    var ajaxCall = {
      url: params.url,
      type: params.type || 'GET',
      dataType: params.dataType || 'json',
      data: params.data || ' ',
      timeout: config.timeout,
      beforeSend: function(jqXHR, settings) {

        if (settings.url.indexOf('s3.amazonaws.com') === -1) {
          if (_this.qbInst.session && _this.qbInst.session.token) {
            jqXHR.setRequestHeader('QB-Token', _this.qbInst.session.token);
            jqXHR.setRequestHeader('QB-SDK', 'JS ' + versionNum + ' - Client');
          }
        }
      },
      success: function(data, status, jqHXR) {
        Utils.QBLog('[ServiceProxy]', 'Response: ', {data: JSON.stringify(data)});

        if (params.url.indexOf(config.urls.session) === -1) _this.handleResponse(null, data, callback, retry);
        else callback(null, data);
      },
      error: function(jqHXR, status, error) {
        Utils.QBLog('[ServiceProxy]', 'ajax error', jqHXR.status, error, jqHXR.responseText);

        var errorMsg = {
          code: jqHXR.status,
          status: status,
          message: error,
          detail: jqHXR.responseText
        };
        if (params.url.indexOf(config.urls.session) === -1) _this.handleResponse(errorMsg, null, callback, retry);
        else callback(errorMsg, null);
      }
    };

    if(!isBrowser) {

      var isJSONRequest = ajaxCall.dataType === 'json',
        makingQBRequest = params.url.indexOf('s3.amazonaws.com') === -1 &&
                          _this.qbInst &&
                          _this.qbInst.session &&
                          _this.qbInst.session.token ||
                          false;

      var qbRequest = {
        url: ajaxCall.url,
        method: ajaxCall.type,
        timeout: config.timeout,
        json: isJSONRequest ? ajaxCall.data : null,
        headers: makingQBRequest ? { 'QB-Token' : _this.qbInst.session.token, 'QB-SDK': 'JS ' + versionNum + ' - Server' } : null
      };

      var requestCallback = function(error, response, body) {
        if(error || response.statusCode !== 200 && response.statusCode !== 201 && response.statusCode !== 202) {
          var errorMsg;
          try {
            errorMsg = {
              code: response && response.statusCode || error && error.code,
              status: response && response.headers && response.headers.status || 'error',
              message: body || error && error.errno,
              detail: body && body.errors || error && error.syscall
            };
          } catch(e) {
            errorMsg = error;
          }
          if (qbRequest.url.indexOf(config.urls.session) === -1) _this.handleResponse(errorMsg, null, callback, retry);
          else callback(errorMsg, null);
        } else {
          if (qbRequest.url.indexOf(config.urls.session) === -1) _this.handleResponse(null, body, callback, retry);
          else callback(null, body);
        }
      };

    }

    // Optional - for example 'multipart/form-data' when sending a file.
    // Default is 'application/x-www-form-urlencoded; charset=UTF-8'
    if (typeof params.contentType === 'boolean' || typeof params.contentType === 'string') { ajaxCall.contentType = params.contentType; }
    if (typeof params.processData === 'boolean') { ajaxCall.processData = params.processData; }

    // link: https://github.com/request/request#multipartform-data-multipart-form-uploads
    if(isBrowser) {
      ajax( ajaxCall );
    } else {
      var r = request(qbRequest, requestCallback);
      if(!isJSONRequest){
       var form = r.form();
       Object.keys(ajaxCall.data).forEach(function(item,i,ar){
         form.append(item, ajaxCall.data[item]);
       });
      }
    }
  }

};

module.exports = ServiceProxy;
