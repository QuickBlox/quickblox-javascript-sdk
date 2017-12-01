'use strict';

var config = require('./qbConfig');
var Utils = require('./qbUtils');

/**
 * For server-side applications through using npm package 'quickblox'
 * you should include the following lines
 */
var isBrowser = typeof window !== 'undefined',
    isNativeScript = !!(global && (global.android || global.ios));

var qbFetch, qbFormData;

if (isBrowser || isNativeScript) {
    qbFetch = fetch;
    qbFormData = FormData;
} else {
    qbFetch = require('node-fetch');
    qbFormData = require('form-data');
}

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

        if (error && typeof config.on.sessionExpired === 'function' && (error.message === 'Unauthorized' || error.status === '401 Unauthorized')) {
            config.on.sessionExpired(function() {
                next(error,response);
            }, retry);
        } else {
            if (error) {
                next(error, null);
            } else {
                if (config.addISOTime) {
                    response = Utils.injectISOTimes(response);
                }

                next(null, response);
            }
        }
    },

    startLogger: function(params) {
        var clonedData;

        ++this.reqCount;

        if (params.data && params.data.file) {
            clonedData = JSON.parse(JSON.stringify(params.data));
            clonedData.file = "...";
        } else {
            clonedData = params.data;
        }

        Utils.QBLog('[Request][' + this.reqCount + ']', (params.type || 'GET') + ' ' + params.url, clonedData ? clonedData : "");
    },

    ajax: function(params, callback) {
        this.startLogger(params);

        var self = this,
            qbSessioToken = self.qbInst && self.qbInst.session && self.qbInst.session.token,
            isQBRequest = params.url.indexOf('s3.amazonaws.com') === -1,
            isGetOrHeadType = !params.type || params.type === 'HEAD',
            isMultipartFormData = params.contentType === false,
            qbDataType = params.dataType || 'json',
            qbRequestBody = _getBodyRequest(),
            qbUrl = params.url,
            qbRequest = {},
            qbResponse;

        qbRequest.method = params.type || 'GET';

        if (isGetOrHeadType) {
            qbUrl += '?' + qbRequestBody;
        } else {
            qbRequest.body = qbRequestBody;
        }

        if (!isMultipartFormData) {
            qbRequest.headers = {
                'Content-Type': params.contentType || 'application/x-www-form-urlencoded; charset=UTF-8'
            };
        }

        if (isQBRequest && qbSessioToken) {
            qbRequest.headers['QB-Token'] = qbSessioToken;
            qbRequest.headers['QB-SDK'] = 'JS ' + config.version + ' - Server';
        }

        if (config.timeout) {
            qbRequest.timeout = config.timeout;
        }

        qbFetch(qbUrl, qbRequest)
            .then(function(response) {
                qbResponse = response.clone();

                if (qbDataType === 'text') {
                    return response.text();
                } else {
                    return response.json();
                }
            })
            .then(function(body) {
                console.warn("BODY:", body);

                _requestCallback(null, qbResponse, body);
            });
            // .catch(function(error) {
            //     _requestCallback(error);
            // });

        /*
         * Private functions
         * Only for ServiceProxy.ajax() method closure
         */
        function _getBodyRequest() {
            var qbData;

            if (params.isNeedStringify) {
                qbData = JSON.stringify(params.data);
            } else {
                var message = params.data;

                qbData = Object.keys(message).map(function(val) {
                    if (typeof message[val] === 'object') {
                        return Object.keys(message[val]).map(function(val1) {
                            return val + '[' + val1 + ']=' + message[val][val1];
                        }).sort().join('&');
                    } else {
                        return val + '=' + message[val];
                    }
                }).sort().join('&');
            }

            if (isMultipartFormData) {
                qbData = new qbFormData();

                Object.keys(params.data).forEach(function(item) {
                    qbData.append(item, params.data[item]);
                });
            }

            if (params.isFileUpload) {
                qbData = new qbFormData();

                Object.keys(params.data).forEach(function(item) {
                    if (item === "file") {
                        qbData.append(item, params.data[item].data, {filename: params.data[item].name});
                    } else {
                        qbData.append(item, params.data[item]);
                    }
                });
            }

            return qbData;
        }

        function _requestCallback(error, response, body) {
            var statusCode = response && (response.status || response.statusCode);

            if (error || (statusCode !== 200 && statusCode !== 201 && statusCode !== 202)) {
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

                Utils.QBLog('[Response][' + self.reqCount + ']', 'error', statusCode, body || error || body.errors);

                if (params.url.indexOf(config.urls.session) === -1) {
                    self.handleResponse(errorMsg, null, callback, retry);
                } else {
                    callback(errorMsg, null);
                }
            } else {
                Utils.QBLog('[Response][' + self.reqCount + ']', (body && body !== " ") ? body : 'empty body');

                if (params.url.indexOf(config.urls.session) === -1) {
                    self.handleResponse(null, body, callback, retry);
                } else {
                    callback(null, body);
                }
            }
        }

        function retry(session) {
            if (!!session) {
                self.setSession(session);
                self.ajax(params, callback);
            }
        }
    }
};

module.exports = ServiceProxy;
