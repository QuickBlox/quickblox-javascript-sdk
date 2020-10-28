/* eslint no-console: 2 */

'use strict';

var config = require('./qbConfig');

var unsupported = "This function isn't supported outside of the browser (...yet)";

var isNativeScript = typeof global === 'object' && (global.hasOwnProperty('android') || global.hasOwnProperty('NSObject')),
    isNode = typeof window === 'undefined' && typeof exports === 'object' && !isNativeScript,
    isBrowser = typeof window !== 'undefined';

if (isNode) {
    var fs = require('fs');
    var os = require('os');
}

// The object for type MongoDB.Bson.ObjectId
// http://docs.mongodb.org/manual/reference/object-id/
var ObjectId = {
    machine: Math.floor(Math.random() * 16777216).toString(16),
    pid: Math.floor(Math.random() * 32767).toString(16),
    increment: 0
};

var Utils = {
    /**
     * [getEnv get a name of an execution environment]
     * @return {object} return names of env. (node/browser)
     */
    getEnv: function() {
        return {
            'nativescript': isNativeScript,
            'browser': isBrowser,
            'node': isNode
        };
    },

    _getOSInfoFromNodeJS: function() {
        return os.platform();
    },

    _getOSInfoFromBrowser: function() {
        return window.navigator.userAgent;
    },

    _getOSInfoFromNativeScript: function() {
        return (global && global.hasOwnProperty('android') ? 'Android' : 'iOS') + ' - NativeScript';
    },

    getOS: function() {
        var self = this;
        var osName = 'An unknown OS';

        var OS_LIST = [
            {
                osName:'Windows',
                codeNames:['Windows', 'win32']
            },
            {
                osName:'Linux',
                codeNames:['Linux', 'linux']
            },
            {
                osName:'macOS',
                codeNames:['Mac OS', 'darwin']
            }
        ];

        var platformInfo;

        if (self.getEnv().browser) {
            platformInfo = self._getOSInfoFromBrowser();
        } else if (self.getEnv().node)  {
            platformInfo = self._getOSInfoFromNodeJS();
        } else if (self.getEnv().nativescript) {
            return self._getOSInfoFromNativeScript();
        }

        OS_LIST.forEach(function(osInfo) {
            osInfo.codeNames.forEach(function(codeName) {
                var index = platformInfo.indexOf(codeName);

                if (index !== -1) {
                    osName = osInfo.osName;
                }
            });
        });

        return osName;
    },

    safeCallbackCall: function() {
        var listenerString = arguments[0].toString(),
            listenerName = listenerString.split('(')[0].split(' ')[1],
            argumentsCopy = [], listenerCall;

        for (var i = 0; i < arguments.length; i++) {
            argumentsCopy.push(arguments[i]);
        }

        listenerCall = argumentsCopy.shift();

        try {
            listenerCall.apply(null, argumentsCopy);
        } catch (err) {
            if (listenerName === '') {
                console.error('Error: ' + err);
            }else{
                console.error('Error in listener ' + listenerName + ': ' + err);
            }
        }
    },

    randomNonce: function() {
        return Math.floor(Math.random() * 10000);
    },

    unixTime: function() {
        return Math.floor(Date.now() / 1000);
    },

    getUrl: function(base, id) {
        var resource = id ? '/' + id : '';
        return 'https://' + config.endpoints.api + '/' + base + resource + config.urls.type;
    },

    isArray: function(arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    },

    isObject: function(arg) {
        return Object.prototype.toString.call(arg) === '[object Object]';
    },

    // Generating BSON ObjectId and converting it to a 24 character string representation
    // Changed from https://github.com/justaprogrammer/ObjectId.js/blob/master/src/main/javascript/Objectid.js
    getBsonObjectId: function() {
        var timestamp = this.unixTime().toString(16),
            increment = (ObjectId.increment++).toString(16);

        if (increment > 0xffffff) ObjectId.increment = 0;

        return '00000000'.substr(0, 8 - timestamp.length) + timestamp +
            '000000'.substr(0, 6 - ObjectId.machine.length) + ObjectId.machine +
            '0000'.substr(0, 4 - ObjectId.pid.length) + ObjectId.pid +
            '000000'.substr(0, 6 - increment.length) + increment;
    },

    injectISOTimes: function(data) {
        if (data.created_at) {
            if (typeof data.created_at === 'number') data.iso_created_at = new Date(data.created_at * 1000).toISOString();
            if (typeof data.updated_at === 'number') data.iso_updated_at = new Date(data.updated_at * 1000).toISOString();
        }
        else if (data.items) {
            for (var i = 0, len = data.items.length; i < len; ++i) {
                if (typeof data.items[i].created_at === 'number') data.items[i].iso_created_at = new Date(data.items[i].created_at * 1000).toISOString();
                if (typeof data.items[i].updated_at === 'number') data.items[i].iso_updated_at = new Date(data.items[i].updated_at * 1000).toISOString();
            }
        }
        return data;
    },

    QBLog: function(){
        if (this.loggers) {
            for (var i=0; i<this.loggers.length; ++i) {
                this.loggers[i](arguments);
            }

            return;
        }

        var logger;

        this.loggers = [];

        var consoleLoggerFunction = function(){
            var logger = function(args){
                console.log.apply(console, Array.prototype.slice.call(args));
            };

            return logger;
        };

        var fileLoggerFunction = function(){
            var logger = function(args){
                if (!fs) {
                    throw unsupported;
                } else {
                    var data = [];

                    for (var i = 0; i < args.length; i++) {
                        data.push(JSON.stringify(args[i]));
                    }

                    data = data.join(' ');

                    var toLog = '\n' + new Date() + '. ' + data;

                    fs.appendFile(config.debug.file, toLog, function(err) {
                        if(err) {
                            return console.error('Error while writing log to file. Error: ' + err);
                        }
                    });
                }
            };

            return logger;
        };

        // Build loggers
        // format "debug: { }"

        if(typeof config.debug === 'object'){
            if(typeof config.debug.mode === 'number'){
                if(config.debug.mode == 1){
                    logger = consoleLoggerFunction();
                    this.loggers.push(logger);
                } else if(config.debug.mode == 2){
                    logger = fileLoggerFunction();
                    this.loggers.push(logger);
                }
            } else if(typeof config.debug.mode === 'object'){
                var self = this;

                config.debug.mode.forEach(function(mode) {
                    if(mode === 1){
                        logger = consoleLoggerFunction();
                        self.loggers.push(logger);
                    } else if (mode === 2){
                        logger = fileLoggerFunction();
                        self.loggers.push(logger);
                    }
                });
            }

            // format "debug: true"
            // backward compatibility
        }else if (typeof config.debug === 'boolean'){
            if(config.debug){
                logger = consoleLoggerFunction();
                this.loggers.push(logger);
            }
        }

        if(this.loggers){
            for(var j=0;j<this.loggers.length;++j){
                this.loggers[j](arguments);
            }
        }
    },

    isWebRTCAvailble: function() {
        /** Shims */
        var RTCPeerConnection = window.RTCPeerConnection,
            IceCandidate = window.RTCIceCandidate,
            SessionDescription = window.RTCSessionDescription,
            MediaDevices = window.navigator.mediaDevices;

        return Boolean(RTCPeerConnection) &&
            Boolean(IceCandidate) &&
            Boolean(SessionDescription) &&
            Boolean(MediaDevices);
    },

    getError: function(code, detail, moduleName) {
        var errorMsg = {
            code: code,
            status: 'error',
            detail: detail
        };

        switch(code){
            case 401:
                errorMsg.message = 'Unauthorized';
                break;

            case 403:
                errorMsg.message = 'Forbidden';
                break;

            case 408:
                errorMsg.message = 'Request Timeout';
                break;

            case 422:
                errorMsg.message = 'Unprocessable Entity';
                break;

            case 502:
                errorMsg.message = 'Bad Gateway';
                break;

            default:
                errorMsg.message = 'Unknown error';
                break;
        }

        this.QBLog('[' + moduleName + ']', 'Error:', detail);

        return errorMsg;
    },

    MergeArrayOfObjects: function (arrayTo, arrayFrom){
        var merged = JSON.parse(JSON.stringify(arrayTo));

        firstLevel: for(var i = 0; i < arrayFrom.length; i++){
            var newItem = arrayFrom[i];

            for(var j = 0; j < merged.length; j++){
                if(newItem.user_id === merged[j].user_id){
                    merged[j] = newItem;
                    continue firstLevel;
                }
            }
            merged.push(newItem);
        }
        return merged;
    }
};

module.exports = Utils;
