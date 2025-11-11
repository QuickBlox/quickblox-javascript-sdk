'use strict';

/*
 * QuickBlox JavaScript SDK
 *
 * Main SDK Module
 *
 */
var config = require('./qbConfig');
var Utils = require('./qbUtils');
// const MessageProxy = require("./modules/chat/qbMessage");
// const Chat = require("./modules/chat/qbChat");
// const DialogProxy = require("./modules/chat/qbDialog");
// const WebRTCClient = require("./modules/webrtc/qbWebRTCClient");
// const PushNotifications = require("./modules/qbPushNotifications");

// Actual QuickBlox API starts here
function QuickBlox() {}

QuickBlox.prototype = {
    /**
     * Return current version of QuickBlox JavaScript SDK
     * @memberof QB
     * */
    version: config.version,

    /**
     * Return current build number of QuickBlox JavaScript SDK
     * @memberof QB
     * */
    buildNumber: config.buildNumber,

    _getOS: Utils.getOS.bind(Utils),

    /**
     * @memberof QB
     * Initialize QuickBlox SDK({@link https://docs.quickblox.com/docs/js-setup#initialize-quickblox-sdk read more})
     * @param {Number | String} appIdOrToken - Application ID (from your admin panel) or Session Token.
     * @param {String | Number} authKeyOrAppId - Authorization key or Application ID. You need to set up Application ID if you use session token as appIdOrToken parameter.
     * @param {String} authSecret - Authorization secret key (from your admin panel).
     * @param {Object} configMap - Settings object for QuickBlox SDK.
     */
    init: function(appIdOrToken, authKeyOrAppId, authSecret, accountKey, configMap) {
        console.log('current platform: ', Utils.getEnv());
        if (typeof accountKey === 'string' && accountKey.length) {
            if (configMap && typeof configMap === 'object') {
                config.set(configMap);
            }
            config.creds.accountKey = accountKey;
        } else {
            console.warn('Parameter "accountKey" is missing. This will lead to error in next major release');
            console.warn('NOTE: Account migration will not work without "accountKey"');
            if (typeof accountKey === 'object') {
                config.set(accountKey);
            }
        }

        var SHARED_API_ENDPOINT = "api.quickblox.com";
        var SHARED_CHAT_ENDPOINT = "chat.quickblox.com";

        /** include dependencies */
        var Proxy = require('./qbProxy'),
            Auth = require('./modules/qbAuth'),
            Users = require('./modules/qbUsers'),
            Content = require('./modules/qbContent'),
            PushNotifications = require('./modules/qbPushNotifications'),
            Data = require('./modules/qbData'),
            AddressBook = require('./modules/qbAddressBook'),
            Chat = require('./modules/chat/qbChat'),
            DialogProxy = require('./modules/chat/qbDialog'),
            MessageProxy = require('./modules/chat/qbMessage'),
            AIProxy = require('./modules/qbAI');

        this.service = new Proxy();
        this.auth = new Auth(this.service);
        this.users = new Users(this.service);
        this.content = new Content(this.service);
        this.pushnotifications = new PushNotifications(this.service);
        this.data = new Data(this.service);
        this.addressbook = new AddressBook(this.service);
        this.chat = new Chat(this.service);
        this.chat.dialog = new DialogProxy(this.service);
        this.chat.message = new MessageProxy(this.service);
        this.ai = new AIProxy(this.service);

        if (Utils.getEnv().browser) {
            /** add adapter.js*/
            require('webrtc-adapter');

            /** add WebRTC API if API is avaible */
            if( Utils.isWebRTCAvailble() ) {
                var WebRTCClient = require('./modules/webrtc/qbWebRTCClient');
                this.webrtc = new WebRTCClient(this.service, this.chat);
            } else {
                this.webrtc = false;
            }
        } else {
            this.webrtc = false;
        }
        this._initReady = Promise.resolve();
        var initBlockOnSettings = (typeof config.initBlockOnSettings === 'boolean') ? config.initBlockOnSettings : true;
        var initBlockDurationMs = (typeof config.initBlockDurationMs === 'number') ? config.initBlockDurationMs : 3000;


        // Initialization by outside token
        if (typeof appIdOrToken === 'string' && (!authKeyOrAppId || typeof authKeyOrAppId === 'number') && !authSecret) {

            if(typeof authKeyOrAppId === 'number'){
                config.creds.appId = authKeyOrAppId;
            }

            this.service.setSession({ token: appIdOrToken });
        } else {
            config.creds.appId = appIdOrToken;
            config.creds.authKey = authKeyOrAppId;
            config.creds.authSecret = authSecret;
        }

        var shouldGetSettings = config.creds.accountKey && (
            !config.endpoints.api ||
            config.endpoints.api === SHARED_API_ENDPOINT ||
            !config.endpoints.chat ||
            config.endpoints.chat === SHARED_CHAT_ENDPOINT
        );
        if (shouldGetSettings) {
            var accountSettingsUrl = [
                'https://', SHARED_API_ENDPOINT, '/',
                config.urls.account,
                config.urls.type
            ].join('');

            // generic function to capture (extract) listeners
            var preserveListeners = function (obj) {
                var map = {};
                if (!obj) return map;
                Object.keys(obj).forEach(function (k) {
                    if (/^on[A-Z]/.test(k) && typeof obj[k] === 'function') {
                        map[k] = obj[k];
                    }
                });
                return map;
            };

            // restore
            var reassignListeners = function (target, map) {
                if (!target || !map) return;
                Object.keys(map).forEach(function (k) {
                    target[k] = map[k];
                });
            };

            // account settings
            var self = this;
            //
            this._initReady = new Promise(function(resolve) {
                self.service.ajax({ url: accountSettingsUrl }, function (err, response) {
                    // resolve in any case (so legacy clients won’t hang)
                    if (!err && typeof response === 'object') {
                        // 1) apply endpoints
                        var update = {
                            endpoints: {
                                api:  response.api_endpoint.replace(/^https?:\/\//, ''),
                                chat: response.chat_endpoint
                            }
                        };
                        config.set(update);

                        // 2) preserve ALL previously assigned listeners (dynamically)
                        var savedChatListeners   = preserveListeners(self.chat);
                        var savedWebRTCListeners = preserveListeners(self.webrtc);

                        // 3) re-create dependent components for the new endpoints
                        self.pushnotifications = new PushNotifications(self.service);
                        self.chat = new Chat(self.service);
                        self.chat.dialog = new DialogProxy(self.service);
                        self.chat.message = new MessageProxy(self.service);

                        if (Utils.getEnv().browser) {
                            require('webrtc-adapter');
                            if (Utils.isWebRTCAvailble()) {
                                var WebRTCClient = require('./modules/webrtc/qbWebRTCClient');
                                self.webrtc = new WebRTCClient(self.service, self.chat);
                            } else {
                                self.webrtc = false;
                            }
                        } else {
                            self.webrtc = false;
                        }

                        // 4) reattach listeners to the new instances
                        reassignListeners(self.chat,   savedChatListeners);
                        reassignListeners(self.webrtc, savedWebRTCListeners);
                    }

                    resolve(); // init completed (with or without migration)
                });
            });
            //
            // previous version with callback
            // this.service.ajax({
            //     url: accountSettingsUrl
            // }, function (err, response) {
            //     if (!err && typeof response === 'object') {
            //         var update = {
            //             endpoints: {
            //                 api: response.api_endpoint.replace(/^https?:\/\//, ''),
            //                 chat: response.chat_endpoint
            //             }
            //         };
            //         config.set(update);
            //         //
            //         self.pushnotifications = new PushNotifications(self.service);
            //         self.chat = new Chat(self.service);
            //         self.chat.dialog = new DialogProxy(self.service);
            //         self.chat.message = new MessageProxy(self.service);
            //         //
            //         if (Utils.getEnv().browser) {
            //             /** add adapter.js*/
            //             require('webrtc-adapter');
            //
            //             /** add WebRTC API if API is avaible */
            //             if( Utils.isWebRTCAvailble() ) {
            //                 var WebRTCClient = require('./modules/webrtc/qbWebRTCClient');
            //                 self.webrtc = new WebRTCClient(self.service, self.chat);
            //             } else {
            //                 self.webrtc = false;
            //             }
            //         } else {
            //             self.webrtc = false;
            //         }
            //         //
            //     }
            // });
            //
        }
        //
        // --- artificial sync delay to increase the chance account_settings completes before legacy code continues
        // enabled only when shouldGetSettings && config.initBlockOnSettings !== false
        if (shouldGetSettings && initBlockOnSettings) {
            try {
                var __qb_init_block_until__ = Date.now() + initBlockDurationMs;
                while (Date.now() < __qb_init_block_until__) {
                    // intentional busy-wait (do not remove)
                }
            } catch (_) { /* never throw from here */ }
        }
        //

    },

    /**
     * Wait until SDK async initialization finishes (if any).
     * It resolves after internal tasks like fetching `account_settings`,
     * rebinding endpoints, and re-instantiating dependent modules are completed.
     * If no async work was scheduled during `QB.init(...)`, it resolves immediately.
     *
     * @memberof QB
     * @returns {Promise<void>} A promise that resolves when initialization is complete.
     *
     * @example
     * QB.init(appId, authKey, authSecret, accountKey, config);
     * QB.ready().then(function () {
     *   // Safe point: endpoints are updated, chat/webrtc are re-created, listeners preserved.
     *   QB.startSession({ login: 'john', password: 'secret' }, function (err, res) {
     *     if (!err) {
     *       QB.chat.connect({ userId: res.user.id, password: res.session.token }, function(){});
     *     }
     *   });
     * });
     */
    ready: function() {
        return this._initReady || Promise.resolve();
    },

    /**
     * Init QuickBlox SDK with User Account data to start session with token({@link https://docs.quickblox.com/docs/js-setup#initialize-quickblox-sdk-without-authorization-key-and-secret read more}).
     * @memberof QB
     * @param {Number} appId - Application ID (from your admin panel).
     * @param {String | Number} accountKey - Account key (from your admin panel).
     * @param {Object} configMap - Settings object for QuickBlox SDK.
     */
    initWithAppId: function(appId, accountKey, configMap) {
        //добавить проверку типа параметров
        if (typeof appId !== 'number') {
            throw new Error('Type of appId must be a number');
        }
        if (appId === '' || appId === undefined || appId === null ||
            accountKey === '' || accountKey === undefined || accountKey === null) {
            throw new Error('Cannot init QuickBlox without app credentials (app ID, auth key)');
        } else {
            this.init('', appId, null, accountKey, configMap);
        }
    },

    /**
     * Return current session({@link https://docs.quickblox.com/docs/js-authentication#get-session read more}).
     * @memberof QB
     * @param {getSessionCallback} callback - The getSessionCallback function.
     * */
    getSession: function(callback) {
        /**
         * This callback return session object..
         * @callback getSessionCallback
         * @param {Object} error - The error object.
         * @param {Object} session - Contains of session object.
         * */
        this.auth.getSession(callback);
    },

    /**
     * Set up user session token to current session and return it({@link https://docs.quickblox.com/docs/js-authentication#set-existing-session read more}).
     * @memberof QB
     * @param {String} token - A User Session Token.
     * @param {getSessionCallback} callback - The getSessionCallback function.
     * @callback getSessionCallback
     * @param {Object} error - The error object.
     * @param {Object} session - Contains of session object.
     * */
    startSessionWithToken: function(token, callback) {
        if (token === undefined) throw new Error('Cannot start session with undefined token');
        else if (token === '') throw new Error('Cannot start session with empty string token');
        else if (token === null) throw new Error('Cannot start session with null value token');
        else if (typeof callback !== 'function') throw new Error('Cannot start session without callback function');
        else {
            try {
                this.service.setSession({token: token});
            } catch (err) {
                callback(err, null);
            }
            if (typeof callback === 'function') {
                try{
                    this.auth.getSession(callback);
                    // TODO: pay attention on it, if we decide to remove application_id from QB.init:
                    // artan 06-09-2022
                    // should set  value application_id from session model into config.creds.appId
                }
                catch(er){
                    callback(er, null);
                }
            }
        }
    },

    /**
     * Create new session({@link https://docs.quickblox.com/docs/js-authentication#create-session read more}).
     * @memberof QB
     * @param {String} appIdOrToken Should be applecationID or QBtoken.
     * @param {createSessionCallback} callback
     * */
    createSession: function(params, callback) {
        /**
         * This callback return session object.
         * @callback createSession
         * @param {Object} error - The error object.
         * @param {Object} session - Contains of session object.
         * */
        this.auth.createSession(params, callback);
    },

    /**
     * Destroy current session({@link https://docs.quickblox.com/docs/js-authentication#destroy-session-token read more}).
     * @memberof QB
     * @param {destroySessionCallback} callback - The destroySessionCallback function.
     * */
    destroySession: function(callback) {
        /**
         * This callback returns error or empty string.
         * @callback destroySessionCallback
         * @param {Object | Null} error - The error object if got en error and null if success.
         * @param {Null | String} result - String (" ") if session was removed successfully.
         * */
        this.auth.destroySession(callback);
    },

    /**
     * Login to QuickBlox application({@link https://docs.quickblox.com/docs/js-authentication#log-in-user read more}).
     * @memberof QB
     * @param {Object} params - Params object for login into the session.
     * @param {loginCallback} callback - The loginCallback function.
     * */
    login: function(params, callback) {
        /**
         * This callback return error or user Object.
         * @callback loginCallback
         * @param {Object | Null} error - The error object if got en error and null if success.
         * @param {Null | Object} result - User data object if everything goes well and null on error.
         * */
        this.auth.login(params, callback);
    },

    /**
     * Remove user from current session, but doesn't destroy it({@link https://docs.quickblox.com/docs/js-authentication#log-out-user read more}).
     * @memberof QB
     * @param {logoutCallback} callback - The logoutCallback function.
     * */
    logout: function(callback) {
        /**
         * This callback return error or user Object.
         * @callback logoutCallback
         * @param {Object | Null} error - The error object if got en error and null if success.
         * @param {Null | String} result - String (" ") if session was removed successfully.
         * */
        this.auth.logout(callback);
    }

};

/**
 * @namespace
 */
var QB = new QuickBlox();

QB.QuickBlox = QuickBlox;

module.exports = QB;
