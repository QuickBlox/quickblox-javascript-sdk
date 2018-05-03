(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("QB", [], factory);
	else if(typeof exports === 'object')
		exports["QB"] = factory();
	else
		root["QB"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/qbMain.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/node-libs-browser/mock/empty.js":
/*!******************************************************!*\
  !*** ./node_modules/node-libs-browser/mock/empty.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("\n\n//# sourceURL=webpack://QB/./node_modules/node-libs-browser/mock/empty.js?");

/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("var g;\n\n// This works in non-strict mode\ng = (function() {\n\treturn this;\n})();\n\ntry {\n\t// This works if eval is allowed (see CSP)\n\tg = g || Function(\"return this\")() || (1, eval)(\"this\");\n} catch (e) {\n\t// This works if the window reference is available\n\tif (typeof window === \"object\") g = window;\n}\n\n// g can still be undefined, but nothing to do about it...\n// We return undefined, instead of nothing here, so it's\n// easier to handle this case. if(!global) { ...}\n\nmodule.exports = g;\n\n\n//# sourceURL=webpack://QB/(webpack)/buildin/global.js?");

/***/ }),

/***/ "./src/qbConfig.js":
/*!*************************!*\
  !*** ./src/qbConfig.js ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar _typeof = typeof Symbol === \"function\" && typeof Symbol.iterator === \"symbol\" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === \"function\" && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj; };\n\n/**\n * QuickBlox JavaScript SDK\n *\n * Configuration Module\n *\n * NOTE:\n *  - config.webrtc.statsReportTimeInterval [integer, sec]:\n *  could add listener onCallStatsReport(session, userId, bytesReceived) if\n *  want to get stats (bytesReceived) about peer every X sec;\n */\n\nvar config = {\n  version: '2.11.0',\n  buildNumber: '1078',\n  creds: {\n    appId: '',\n    authKey: '',\n    authSecret: ''\n  },\n  endpoints: {\n    api: 'api.quickblox.com',\n    chat: 'chat.quickblox.com',\n    muc: 'muc.chat.quickblox.com'\n  },\n  hash: 'sha1',\n  streamManagement: {\n    enable: false\n  },\n  chatProtocol: {\n    bosh: 'https://chat.quickblox.com:5281',\n    websocket: 'wss://chat.quickblox.com:5291',\n    active: 2\n  },\n  webrtc: {\n    answerTimeInterval: 60,\n    dialingTimeInterval: 5,\n    disconnectTimeInterval: 30,\n    statsReportTimeInterval: false,\n    iceServers: [{\n      'url': 'stun:stun.l.google.com:19302'\n    }, {\n      'url': 'stun:turn.quickblox.com',\n      'username': 'quickblox',\n      'credential': 'baccb97ba2d92d71e26eb9886da5f1e0'\n    }, {\n      'url': 'turn:turn.quickblox.com:3478?transport=udp',\n      'username': 'quickblox',\n      'credential': 'baccb97ba2d92d71e26eb9886da5f1e0'\n    }, {\n      'url': 'turn:turn.quickblox.com:3478?transport=tcp',\n      'username': 'quickblox',\n      'credential': 'baccb97ba2d92d71e26eb9886da5f1e0'\n    }, {\n      'url': 'turn:turnsingapor.quickblox.com:3478?transport=udp',\n      'username': 'quickblox',\n      'credential': 'baccb97ba2d92d71e26eb9886da5f1e0'\n    }, {\n      'url': 'turn:turnsingapore.quickblox.com:3478?transport=tcp',\n      'username': 'quickblox',\n      'credential': 'baccb97ba2d92d71e26eb9886da5f1e0'\n    }, {\n      'url': 'turn:turnireland.quickblox.com:3478?transport=udp',\n      'username': 'quickblox',\n      'credential': 'baccb97ba2d92d71e26eb9886da5f1e0'\n    }, {\n      'url': 'turn:turnireland.quickblox.com:3478?transport=tcp',\n      'username': 'quickblox',\n      'credential': 'baccb97ba2d92d71e26eb9886da5f1e0'\n    }]\n  },\n  urls: {\n    session: 'session',\n    login: 'login',\n    users: 'users',\n    chat: 'chat',\n    blobs: 'blobs',\n    geodata: 'geodata',\n    pushtokens: 'push_tokens',\n    subscriptions: 'subscriptions',\n    events: 'events',\n    data: 'data',\n    addressbook: 'address_book',\n    addressbookRegistered: 'address_book/registered_users',\n    type: '.json'\n  },\n  on: {\n    sessionExpired: null\n  },\n  timeout: null,\n  debug: {\n    mode: 0,\n    file: null\n  },\n  addISOTime: false\n};\n\nconfig.set = function (options) {\n  if (_typeof(options.endpoints) === 'object' && options.endpoints.chat) {\n    config.endpoints.muc = 'muc.' + options.endpoints.chat;\n    config.chatProtocol.bosh = 'https://' + options.endpoints.chat + ':5281';\n    config.chatProtocol.websocket = 'wss://' + options.endpoints.chat + ':5291';\n  }\n\n  Object.keys(options).forEach(function (key) {\n    if (key !== 'set' && config.hasOwnProperty(key)) {\n      if (_typeof(options[key]) !== 'object') {\n        config[key] = options[key];\n      } else {\n        Object.keys(options[key]).forEach(function (nextkey) {\n          if (config[key].hasOwnProperty(nextkey)) {\n            config[key][nextkey] = options[key][nextkey];\n          }\n        });\n      }\n    }\n\n    // backward compatibility: for config.iceServers\n    if (key === 'iceServers') {\n      config.webrtc.iceServers = options[key];\n    }\n  });\n};\n\nexports.default = config;\n\n//# sourceURL=webpack://QB/./src/qbConfig.js?");

/***/ }),

/***/ "./src/qbMain.js":
/*!***********************!*\
  !*** ./src/qbMain.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar _qbConfig = __webpack_require__(/*! ./qbConfig */ \"./src/qbConfig.js\");\n\nvar _qbConfig2 = _interopRequireDefault(_qbConfig);\n\nvar _qbUtils = __webpack_require__(/*! ./qbUtils */ \"./src/qbUtils.js\");\n\nvar _qbUtils2 = _interopRequireDefault(_qbUtils);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\n/** include dependencies */\n// import Proxy from './qbProxy';\n// import Auth from './modules/qbAuth';\n// import Users from './modules/qbUsers';\n// import Content from './modules/qbContent';\n// import PushNotifications from './modules/qbPushNotifications';\n// import Data from './modules/qbData';\n// import AddressBook from './modules/qbAddressBook';\n// import Chat from './modules/chat/qbChat';\n// import DialogProxy from './modules/chat/qbDialog';\n// import MessageProxy from './modules/chat/qbMessage';\n\n// import WebRTCClient from './modules/webrtc/qbWebRTCClient';\n\n/**\n * QuickBlox JavaScript SDK\n * Main SDK Module\n */\nfunction QuickBlox() {}\n\nQuickBlox.prototype = {\n  /**\n   * Return current version of QuickBlox JavaScript SDK\n   * @memberof QB\n   * */\n  version: _qbConfig2.default.version,\n\n  /**\n   * Return current build number of QuickBlox JavaScript SDK\n   * @memberof QB\n   * */\n  buildNumber: _qbConfig2.default.buildNumber,\n\n  _getOS: _qbUtils2.default.getOS.bind(_qbUtils2.default)\n\n  /**\n   * @memberof QB\n   * @param {Number | String} appIdOrToken - Application ID (from your admin panel) or Session Token.\n   * @param {String | Number} authKeyOrAppId - Authorization key or Application ID. You need to set up Application ID if you use session token as appIdOrToken parameter.\n   * @param {String} authSecret - Authorization secret key (from your admin panel).\n   * @param {Object} configMap - Settings object for QuickBlox SDK.\n   */\n  // init: function(appIdOrToken, authKeyOrAppId, authSecret, configMap) {\n  //     if (configMap && typeof configMap === 'object') {\n  //         config.set(configMap);\n  //     }\n\n  //     this.service = new Proxy();\n  //     this.auth = new Auth(this.service);\n  //     this.users = new Users(this.service);\n  //     this.content = new Content(this.service);\n  //     this.pushnotifications = new PushNotifications(this.service);\n  //     this.data = new Data(this.service);\n  //     this.addressbook = new AddressBook(this.service);\n  //     this.chat = new Chat(this.service);\n  //     this.chat.dialog = new DialogProxy(this.service);\n  //     this.chat.message = new MessageProxy(this.service);\n\n  //     if (Utils.getEnv().browser) {\n  //         /** add WebRTC API if API is available */\n  //         if( Utils.isWebRTCAvailble() ) {\n  //             this.webrtc = new WebRTCClient(this.service, this.chat.connection);\n  //             this.chat.webrtcSignalingProcessor = this.webrtc.signalingProcessor;\n  //         } else {\n  //             this.webrtc = false;\n  //         }\n  //     } else {\n  //         this.webrtc = false;\n  //     }\n\n  //     // Initialization by outside token\n  //     if (typeof appIdOrToken === 'string' && (!authKeyOrAppId || typeof authKeyOrAppId === 'number') && !authSecret) {\n\n  //         if(typeof authKeyOrAppId === 'number'){\n  //             config.creds.appId = authKeyOrAppId;\n  //         }\n\n  //         this.service.setSession({ token: appIdOrToken });\n  //     } else {\n  //         config.creds.appId = appIdOrToken;\n  //         config.creds.authKey = authKeyOrAppId;\n  //         config.creds.authSecret = authSecret;\n  //     }\n  // },\n\n  /**\n   * Return current session\n   * @memberof QB\n   * @param {getSessionCallback} callback - The getSessionCallback function.\n   * */\n  // getSession: function(callback) {\n  //     /**\n  //      * This callback return session object.\n  //      * @callback getSessionCallback\n  //      * @param {Object} error - The error object\n  //      * @param {Object} session - Contains of session object\n  //      * */\n  //     this.auth.getSession(callback);\n  // },\n\n  /**\n   * Creat new session. {@link https://quickblox.com/developers/Javascript#Authorization More info}\n   * @memberof QB\n   * @param {String} appIdOrToken Should be applecationID or QBtoken.\n   * @param {createSessionCallback} callback -\n   * */\n  // createSession: function(params, callback) {\n  //     /**\n  //      * This callback return session object.\n  //      * @callback createSession\n  //      * @param {Object} error - The error object\n  //      * @param {Object} session - Contains of session object\n  //      * */\n  //     this.auth.createSession(params, callback);\n  // },\n\n  /**\n   * Destroy current session.  {@link https://quickblox.com/developers/Authentication_and_Authorization#API_Session_Destroy More info}\n   * @memberof QB\n   * @param {destroySessionCallback} callback - The destroySessionCallback function.\n   * */\n  // destroySession: function(callback) {\n  //     /**\n  //      * This callback returns error or empty string.\n  //      * @callback destroySessionCallback\n  //      * @param {Object | Null} error - The error object if got en error and null if success.\n  //      * @param {Null | String} result - String (\" \") if session was removed successfully.\n  //      * */\n  //     this.auth.destroySession(callback);\n  // },\n\n  /**\n   * Login to QuickBlox application. {@link https://quickblox.com/developers/Javascript#Authorization More info}\n   * @memberof QB\n   * @param {Object} params - Params object for login into the session.\n   * @param {loginCallback} callback - The loginCallback function.\n   * */\n  // login: function(params, callback) {\n  //     /**\n  //      * This callback return error or user Object.\n  //      * @callback loginCallback\n  //      * @param {Object | Null} error - The error object if got en error and null if success.\n  //      * @param {Null | Object} result - User data object if everything goes well and null on error.\n  //      * */\n  //     this.auth.login(params, callback);\n  // },\n\n  /**\n   * Remove user from current session, but doesn't destroy it.\n   * @memberof QB\n   * @param {logoutCallback} callback - The logoutCallback function.\n   * */\n  // logout: function(callback) {\n  //     /**\n  //      * This callback return error or user Object.\n  //      * @callback logoutCallback\n  //      * @param {Object | Null} error - The error object if got en error and null if success.\n  //      * @param {Null | String} result - String (\" \") if session was removed successfully.\n  //      * */\n  //     this.auth.logout(callback);\n  // }\n\n};\n\n/**\n * @namespace\n */\nvar QB = new QuickBlox();\n\nQB.QuickBlox = QuickBlox;\n\nexports.default = QB;\n\n//# sourceURL=webpack://QB/./src/qbMain.js?");

/***/ }),

/***/ "./src/qbUtils.js":
/*!************************!*\
  !*** ./src/qbUtils.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("/* WEBPACK VAR INJECTION */(function(global) {\n\nObject.defineProperty(exports, \"__esModule\", {\n    value: true\n});\n\nvar _typeof = typeof Symbol === \"function\" && typeof Symbol.iterator === \"symbol\" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === \"function\" && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj; };\n\nvar _qbConfig = __webpack_require__(/*! ./qbConfig */ \"./src/qbConfig.js\");\n\nvar _qbConfig2 = _interopRequireDefault(_qbConfig);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nvar unsupported = \"This function isn't supported outside of the browser (...yet)\";\n\nvar isBrowser = typeof window !== \"undefined\",\n    isNativeScript = (typeof global === \"undefined\" ? \"undefined\" : _typeof(global)) === 'object' && (global.android || global.NSObject);\n\nif (!isBrowser && !isNativeScript) {\n    var fs = __webpack_require__(/*! fs */ \"./node_modules/node-libs-browser/mock/empty.js\");\n    var os = __webpack_require__(/*! os */ \"./node_modules/node-libs-browser/mock/empty.js\");\n}\n\n// The object for type MongoDB.Bson.ObjectId\n// http://docs.mongodb.org/manual/reference/object-id/\nvar ObjectId = {\n    machine: Math.floor(Math.random() * 16777216).toString(16),\n    pid: Math.floor(Math.random() * 32767).toString(16),\n    increment: 0\n};\n\nvar Utils = {\n    /**\n     * [getEnv get a name of an execution environment]\n     * @return {object} return names of env. (node/browser)\n     */\n    getEnv: function getEnv() {\n        var isNativeScript = (typeof global === \"undefined\" ? \"undefined\" : _typeof(global)) === 'object' && (global.android || global.NSObject),\n            isNode = typeof window === 'undefined' && ( false ? undefined : _typeof(exports)) === 'object' && !isNativeScript,\n            isBrowser = typeof window !== 'undefined';\n\n        return {\n            'nativescript': isNativeScript,\n            'browser': isBrowser,\n            'node': isNode\n        };\n    },\n\n    _getOSInfoFromNodeJS: function _getOSInfoFromNodeJS() {\n        return os.platform();\n    },\n\n    _getOSInfoFromBrowser: function _getOSInfoFromBrowser() {\n        return window.navigator.userAgent;\n    },\n\n    _getOSInfoFromNativeScript: function _getOSInfoFromNativeScript() {\n        return (global && global.android ? 'Android' : 'iOS') + ' - NativeScript';\n    },\n\n    getOS: function getOS() {\n        var self = this;\n        var osName = 'An unknown OS';\n\n        var OS_LIST = [{\n            osName: 'Windows',\n            codeNames: ['Windows', 'win32']\n        }, {\n            osName: 'Linux',\n            codeNames: ['Linux', 'linux']\n        }, {\n            osName: 'macOS',\n            codeNames: ['Mac OS', 'darwin']\n        }];\n\n        var platformInfo;\n\n        if (self.getEnv().browser) {\n            platformInfo = self._getOSInfoFromBrowser();\n        } else if (self.getEnv().nativescript) {\n            platformInfo = self._getOSInfoFromNativeScript();\n        } else if (self.getEnv().node) {\n            platformInfo = self._getOSInfoFromNodeJS();\n        }\n\n        OS_LIST.forEach(function (osInfo) {\n            osInfo.codeNames.forEach(function (codeName) {\n                var index = platformInfo.indexOf(codeName);\n\n                if (index !== -1) {\n                    osName = osInfo.osName;\n                } else if (typeof platformInfo === 'string') {\n                    osName = platformInfo;\n                }\n            });\n        });\n\n        return osName;\n    },\n\n    safeCallbackCall: function safeCallbackCall() {\n        var listenerString = arguments[0].toString(),\n            listenerName = listenerString.split('(')[0].split(' ')[1],\n            argumentsCopy = [],\n            listenerCall;\n\n        for (var i = 0; i < arguments.length; i++) {\n            argumentsCopy.push(arguments[i]);\n        }\n\n        listenerCall = argumentsCopy.shift();\n\n        try {\n            listenerCall.apply(null, argumentsCopy);\n        } catch (err) {\n            if (listenerName === '') {\n                // eslint-disable-next-line\n                console.error('Error: ' + err);\n            } else {\n                // eslint-disable-next-line\n                console.error('Error in listener ' + listenerName + ': ' + err);\n            }\n        }\n    },\n\n    randomNonce: function randomNonce() {\n        return Math.floor(Math.random() * 10000);\n    },\n\n    unixTime: function unixTime() {\n        return Math.floor(Date.now() / 1000);\n    },\n\n    getUrl: function getUrl(base, id) {\n        var resource = id ? '/' + id : '';\n        return 'https://' + _qbConfig2.default.endpoints.api + '/' + base + resource + _qbConfig2.default.urls.type;\n    },\n\n    isArray: function isArray(arg) {\n        return Object.prototype.toString.call(arg) === '[object Array]';\n    },\n\n    isObject: function isObject(arg) {\n        return Object.prototype.toString.call(arg) === '[object Object]';\n    },\n\n    // Generating BSON ObjectId and converting it to a 24 character string representation\n    // Changed from https://github.com/justaprogrammer/ObjectId.js/blob/master/src/main/javascript/Objectid.js\n    getBsonObjectId: function getBsonObjectId() {\n        var timestamp = this.unixTime().toString(16),\n            increment = (ObjectId.increment++).toString(16);\n\n        if (increment > 0xffffff) ObjectId.increment = 0;\n\n        return '00000000'.substr(0, 8 - timestamp.length) + timestamp + '000000'.substr(0, 6 - ObjectId.machine.length) + ObjectId.machine + '0000'.substr(0, 4 - ObjectId.pid.length) + ObjectId.pid + '000000'.substr(0, 6 - increment.length) + increment;\n    },\n\n    injectISOTimes: function injectISOTimes(data) {\n        if (data.created_at) {\n            if (typeof data.created_at === 'number') data.iso_created_at = new Date(data.created_at * 1000).toISOString();\n            if (typeof data.updated_at === 'number') data.iso_updated_at = new Date(data.updated_at * 1000).toISOString();\n        } else if (data.items) {\n            for (var i = 0, len = data.items.length; i < len; ++i) {\n                if (typeof data.items[i].created_at === 'number') data.items[i].iso_created_at = new Date(data.items[i].created_at * 1000).toISOString();\n                if (typeof data.items[i].updated_at === 'number') data.items[i].iso_updated_at = new Date(data.items[i].updated_at * 1000).toISOString();\n            }\n        }\n        return data;\n    },\n\n    QBLog: function QBLog() {\n        if (this.loggers) {\n            for (var i = 0; i < this.loggers.length; ++i) {\n                this.loggers[i](arguments);\n            }\n\n            return;\n        }\n\n        var logger;\n\n        this.loggers = [];\n\n        var consoleLoggerFunction = function consoleLoggerFunction() {\n            var logger = function logger(args) {\n                // eslint-disable-next-line\n                console.log.apply(console, Array.prototype.slice.call(args));\n            };\n\n            return logger;\n        };\n\n        var fileLoggerFunction = function fileLoggerFunction() {\n            var logger = function logger(args) {\n                if (!fs) {\n                    throw unsupported;\n                } else {\n                    var data = [];\n\n                    for (var i = 0; i < args.length; i++) {\n                        data.push(JSON.stringify(args[i]));\n                    }\n\n                    data = data.join(' ');\n\n                    var toLog = '\\n' + new Date() + '. ' + data;\n\n                    fs.appendFile(_qbConfig2.default.debug.file, toLog, function (err) {\n                        if (err) {\n                            // eslint-disable-next-line\n                            return console.error('Error while writing log to file. Error: ' + err);\n                        }\n                    });\n                }\n            };\n\n            return logger;\n        };\n\n        // Build loggers\n        // format \"debug: { }\"\n\n        if (_typeof(_qbConfig2.default.debug) === 'object') {\n            if (typeof _qbConfig2.default.debug.mode === 'number') {\n                if (_qbConfig2.default.debug.mode == 1) {\n                    logger = consoleLoggerFunction();\n                    this.loggers.push(logger);\n                } else if (_qbConfig2.default.debug.mode == 2) {\n                    logger = fileLoggerFunction();\n                    this.loggers.push(logger);\n                }\n            } else if (_typeof(_qbConfig2.default.debug.mode) === 'object') {\n                var self = this;\n\n                _qbConfig2.default.debug.mode.forEach(function (mode) {\n                    if (mode === 1) {\n                        logger = consoleLoggerFunction();\n                        self.loggers.push(logger);\n                    } else if (mode === 2) {\n                        logger = fileLoggerFunction();\n                        self.loggers.push(logger);\n                    }\n                });\n            }\n\n            // format \"debug: true\"\n            // backward compatibility\n        } else if (typeof _qbConfig2.default.debug === 'boolean') {\n            if (_qbConfig2.default.debug) {\n                logger = consoleLoggerFunction();\n                this.loggers.push(logger);\n            }\n        }\n\n        if (this.loggers) {\n            for (var j = 0; j < this.loggers.length; ++j) {\n                this.loggers[j](arguments);\n            }\n        }\n    },\n\n    isWebRTCAvailble: function isWebRTCAvailble() {\n        /** Shims */\n        var RTCPeerConnection = window.RTCPeerConnection,\n            IceCandidate = window.RTCIceCandidate,\n            SessionDescription = window.RTCSessionDescription,\n            isAvaible = true;\n\n        if (!RTCPeerConnection || !IceCandidate || !SessionDescription) {\n            isAvaible = false;\n        }\n\n        return isAvaible;\n    },\n\n    getError: function getError(code, detail, moduleName) {\n        var errorMsg = {\n            code: code,\n            status: 'error',\n            detail: detail\n        };\n\n        switch (code) {\n            case 401:\n                errorMsg.message = 'Unauthorized';\n                break;\n\n            case 403:\n                errorMsg.message = 'Forbidden';\n                break;\n\n            case 408:\n                errorMsg.message = 'Request Timeout';\n                break;\n\n            case 422:\n                errorMsg.message = 'Unprocessable Entity';\n                break;\n\n            case 502:\n                errorMsg.message = 'Bad Gateway';\n                break;\n\n            default:\n                errorMsg.message = 'Unknown error';\n                break;\n        }\n\n        this.QBLog('[' + moduleName + ']', 'error: ', detail);\n\n        return errorMsg;\n    },\n\n    MergeArrayOfObjects: function MergeArrayOfObjects(arrayTo, arrayFrom) {\n        var merged = JSON.parse(JSON.stringify(arrayTo));\n\n        firstLevel: for (var i = 0; i < arrayFrom.length; i++) {\n            var newItem = arrayFrom[i];\n\n            for (var j = 0; j < merged.length; j++) {\n                if (newItem.user_id === merged[j].user_id) {\n                    merged[j] = newItem;\n                    continue firstLevel;\n                }\n            }\n            merged.push(newItem);\n        }\n        return merged;\n    }\n};\n\nexports.default = Utils;\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/webpack/buildin/global.js */ \"./node_modules/webpack/buildin/global.js\")))\n\n//# sourceURL=webpack://QB/./src/qbUtils.js?");

/***/ })

/******/ });
});