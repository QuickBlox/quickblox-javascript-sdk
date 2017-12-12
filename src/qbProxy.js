'use strict';

var config = require('./qbConfig');
var Utils = require('./qbUtils');

var versionNum = config.version;

/**
 * For server-side applications through using npm package 'quickblox'
 * you should include the following lines
 */
var isBrowser = typeof window !== 'undefined';

if (!isBrowser) {
    var request = require('request');
}

var ajax = require('./plugins/jquery.ajax').ajax;

function ServiceProxy() {
  this.qbInst = {
    config: config,
    session: null
  };

  this.reqCount = 0;
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

        var _this = this,
            qbRequest,
            requestCallback,
            isJSONRequest;

        ++this.reqCount;

        // Logger
        //
        var clonedData;
        if(params.data && params.data.file){
          clonedData = JSON.parse(JSON.stringify(params.data));
          clonedData.file = "...";
        }else{
          clonedData = params.data;
        }
        Utils.QBLog('[Request][' + this.reqCount + ']', (params.type || 'GET') + ' ' + params.url, clonedData ? clonedData : "");
        //
        //

        var retry = function(session) {
            if(!!session) {
                _this.setSession(session);
                _this.ajax(params, callback);
            }
        };

        var ajaxCall = {
            url: params.url,
            type: params.type || 'GET',
            dataType: params.dataType || 'json',
            data: params.data || ' ',
            timeout: config.timeout,
            contentType: params.contentType || 'application/x-www-form-urlencoded; charset=UTF-8',
            beforeSend: function(jqXHR, settings) {
                if (settings.url.indexOf('s3.amazonaws.com') === -1) {
                    if (_this.qbInst.session && _this.qbInst.session.token) {
                        jqXHR.setRequestHeader('QB-Token', _this.qbInst.session.token);
                        jqXHR.setRequestHeader('QB-SDK', 'JS ' + versionNum + ' - Client');
                    }
                }
            },
            success: function(data, status, jqHXR) {
                Utils.QBLog('[Response][' + _this.reqCount + ']', (data && data !== " ") ? data : 'empty body');

                if (params.url.indexOf(config.urls.session) === -1) {
                    _this.handleResponse(null, data, callback, retry);
                } else {
                    callback(null, data);
                }
            },
            error: function(jqHXR, status, error) {
                Utils.QBLog('[Response][' + _this.reqCount + ']', 'error', jqHXR.status, error, jqHXR.responseText);

                var errorMsg = {
                    code: jqHXR.status,
                    status: status,
                    message: error,
                    detail: jqHXR.responseText
                };
                if (params.url.indexOf(config.urls.session) === -1) {
                    _this.handleResponse(errorMsg, null, callback, retry);
                } else {
                    callback(errorMsg, null);
                }
            }
        };

        if(!isBrowser) {
            isJSONRequest = ajaxCall.dataType === 'json';

            var makingQBRequest = params.url.indexOf('s3.amazonaws.com') === -1 && _this.qbInst && _this.qbInst.session && _this.qbInst.session.token || false;

            qbRequest = {
                url: ajaxCall.url,
                method: ajaxCall.type,
                timeout: config.timeout,
                json: (isJSONRequest && !params.isFileUpload) ? ajaxCall.data : null,
                headers: makingQBRequest ? { 'QB-Token' : _this.qbInst.session.token, 'QB-SDK': 'JS ' + versionNum + ' - Server' } : null
            };

            requestCallback = function(error, response, body) {
                var statusCode = response && (response.status || response.statusCode);

                if(error || statusCode !== 200 && statusCode !== 201 && statusCode !== 202) {
                    var errorMsg;

                    try {
                        errorMsg = {
                          code: response && statusCode || error && error.code,
                          status: response && response.headers && response.headers.status || 'error',
                          message: body || error && error.errno,
                          detail: body && body.errors || error && error.syscall
                        };
                    } catch(e) {
                        errorMsg = error;
                    }

                    Utils.QBLog('[Response][' + _this.reqCount + ']', 'error', statusCode, body || error || body.errors);

                    if (qbRequest.url.indexOf(config.urls.session) === -1) {
                        _this.handleResponse(errorMsg, null, callback, retry);
                    } else {
                        callback(errorMsg, null);
                    }
                } else {
                  Utils.QBLog('[Response][' + _this.reqCount + ']', (body && body !== " ") ? body : 'empty body');

                  if (qbRequest.url.indexOf(config.urls.session) === -1) {
                      _this.handleResponse(null, body, callback, retry);
                  } else {
                      callback(null, body);
                  }
                }
            };
        }

        // Optional - for example 'multipart/form-data' when sending a file.
        // Default is 'application/x-www-form-urlencoded; charset=UTF-8'
        if (typeof params.contentType === 'boolean' || typeof params.contentType === 'string') {
            ajaxCall.contentType = params.contentType;
        }

        if (typeof params.processData === 'boolean') {
            ajaxCall.processData = params.processData;
        }

        // link: https://github.com/request/request#multipartform-data-multipart-form-uploads
        if(isBrowser) {

            if(params.isNeedStringify) {
                ajaxCall.data = JSON.stringify(ajaxCall.data);
            }

            ajax( ajaxCall );
        } else {
            var r = request(qbRequest, requestCallback),
                form;

            if(!isJSONRequest){
                form = r.form();

                Object.keys(ajaxCall.data).forEach(function(item,i,arr){
                    form.append(item, ajaxCall.data[item]);
                });
            } else if(params.isFileUpload) {
                form = r.form();

                Object.keys(ajaxCall.data).forEach(function(item,i,arr){
                    if(item === "file"){
                        form.append(item, ajaxCall.data[item].data, {filename: ajaxCall.data[item].name});
                    } else {
                        form.append(item, ajaxCall.data[item]);
                    }
                });
            }
        }
    }
};

module.exports = ServiceProxy;
