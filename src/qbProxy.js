'use strict';

var config = require('./qbConfig');
var Utils = require('./qbUtils');
var SessionManager = require('./qbSessionManagement');

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
    var self = this;

    self.qbInst = {
        config: config,
        session: null
    };
}

ServiceProxy.prototype = {
    _enableSessionManagment: function(params) {
        this.sessionManager = new SessionManager(params);
    },
    setSession: function(session) {
        this.qbInst.session = session;
    },
    getSession: function() {
        return this.qbInst.session;
    },
    handleResponse: function(error, response, next, retry) {
        var self = this;

        var sessionError = {
            status: '401 Unauthorized',
            message: 'Unauthorized'
        };

        if(config.sessionManagement.enable) {
             if (error) {
                next(error, null);
            } else {
                if (config.addISOTime) response = Utils.injectISOTimes(response);
                next(null, response);
            }

            if(!error) {
                self.sessionManager.lastRequest = {};

                if(config.addISOTime) {
                    response = Utils.injectISOTimes(response);
                }

                next(null, response);
            } else {
                if(error.message === sessionError.message || error.status === sessionError.status) {
                    self.sessionManager.reestablishSession().then(function() {
                        var lr = self.sessionManager.lastRequest;

                        self.ajax(lr.params, lr.cb, lr.isNeededUpdateSession);
                    }).catch(function(jqXHR, textStatus) {
                        self.sessionManager.onerror(jqXHR, textStatus);
                    });
                } else {
                    next(error, null);
                }
            }
        } else {
            if(error && typeof config.on.sessionExpired === 'function' && (error.message === 'Unauthorized' || error.status === '401 Unauthorized')) {
                config.on.sessionExpired(function(){
                    next(error,response);
                }, retry);
            } else {
                if (error) {
                    next(error, null);
                } else {
                    if (config.addISOTime) response = Utils.injectISOTimes(response);
                    next(null, response);
                }
            }
        }
    },
    ajax: function(params, callback) {
        var self = this;

        if(config.sessionManagement.enable) {
            if(self.sessionManager.isSessionCreated) {
                self._ajax(params, callback);
            } else {
                self.sessionManager.createSession().then(function() {
                    self._ajax(params, callback);
                }).catch(function(err) {
                    self.sessionManager.onerror(err);
                })
            }
        } else {
            self._ajax(params, callback);
        }
    },
    _ajax: function(params, callback) {
        Utils.QBLog('[ServiceProxy]', 'Request: ', params.type || 'GET', {data: JSON.stringify(clonedParams)});

        var _this = this,
            clonedParams,
            qbRequest,
            requestCallback,
            isJSONRequest;

        if(params.data && params.data.file){
            clonedParams = JSON.parse(JSON.stringify(params));
            clonedParams.data.file = "...";
        } else {
            clonedParams = params;
        }

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
            beforeSend: function(jqXHR, settings) {
                 if (settings.url.indexOf('s3.amazonaws.com') === -1) {
                    if (_this.qbInst.session && _this.qbInst.session.token) {
                        jqXHR.setRequestHeader('QB-Token', _this.qbInst.session.token);
                        jqXHR.setRequestHeader('QB-SDK', 'JS ' + versionNum + ' - Client');
                    }

                    // save last request
                    if(config.sessionManagement.enable) {
                        _this.sessionManager.lastRequest = {
                            params: params,
                            cb: callback
                        };

                        if(!_this.sessionManager.session) {
                            jqXHR.abort();

                            _this.sessionManager.create().then(function() {
                                var lastReq = _this.sessionManager.lastRequest;

                                _this.ajax(lastReq.params, lastReq.callback); 
                            }).catch(function(err) {
                                throw Error(err);
                            })
                        } else {
                            jqXHR.setRequestHeader('QB-Token', _this.sessionManager.session.token);
                            jqXHR.setRequestHeader('QB-SDK', 'JS ' + versionNum + ' - Client');
                        }

                        // if (settings.url.indexOf(config.urls.session) !== -1) {
                        //     if(params.type === 'POST') {
                        //         if(params.data.password) {
                        //             _this.sessionManager.user = params.data;
                        //         } else {
                        //             _this.sessionManager.appCreds = params.data;
                        //         }
                        //     }
                        // }
                    }
                }
            },
            success: function(data, status, jqHXR) {
                Utils.QBLog('[ServiceProxy]', 'Response: ', {data: JSON.stringify(data)});

                if(config.sessionManagement.enable) {
                    _this.sessionManager.lastRequest = null;

                    if(params.url.indexOf(config.urls.session) !== -1) {
                        if(params.type === 'POST') {
                            if(params.data.user) {
                                _this.sessionManager.user = params.data.user;
                            } else {
                                _this.sessionManager.appCreds = params.data;
                            }
                        }
                        console.log('SEND SESSION POST', _this.sessionManager);
                    }
                }

                

                if (params.url.indexOf(config.urls.session) === -1) {
                    _this.handleResponse(null, data, callback, retry);
                } else {
                    callback(null, data);
                }
            },
            error: function(jqHXR, status, error) {
                Utils.QBLog('[ServiceProxy]', 'ajax error', jqHXR.status, error, jqHXR);

                var errorMsg = {
                    code: jqHXR.status,
                    status: status,
                    message: error,
                    detail: jqHXR.responseText
                };

                if ( (params.url.indexOf(config.urls.session) === -1) || (params.url.indexOf(config.urls.session) !== -1 && params.type == 'DELETE') ) {
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

                    if (qbRequest.url.indexOf(config.urls.session) === -1) {
                        _this.handleResponse(errorMsg, null, callback, retry);
                    } else {
                        callback(errorMsg, null);
                    }
                } else {
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
