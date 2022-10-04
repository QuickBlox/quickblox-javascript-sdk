'use strict';

/**
 * QuickBlox JavaScript SDK
 * WebRTC Module (WebRTC helpers)
 */

var config = require('../../qbConfig');

var WebRTCHelpers = {
    getUserJid: function(id, appId) {
        return id + '-' + appId + '@' + config.endpoints.chat;
    },

    getIdFromNode: function(jid) {
        if (jid.indexOf('@') < 0) return null;
        return parseInt(jid.split('@')[0].split('-')[0]);
    },

    trace: function(text) {
        if (config.debug) {
            console.log('[QBWebRTC]:', text);
        }
    },

    traceWarning: function(text) {
        if (config.debug) {
            console.warn('[QBWebRTC]:', text);
        }
    },

    traceError: function(text) {
        if (config.debug) {
            console.error('[QBWebRTC]:', text);
        }
    },

    getLocalTime: function() {
        var arr = new Date().toString().split(' ');
        return arr.slice(1,5).join('-');
    },

    isIOS: function() {
        if (!window || !window.navigator || !window.navigator.userAgent) {
            return false;
        }
        var ua = window.navigator.userAgent;
        return Boolean(ua.match(/iP(ad|hone)/i));
    },

    isIOSSafari: function() {
        if (!window || !window.navigator || !window.navigator.userAgent) {
            return false;
        }
        var ua = window.navigator.userAgent;
        var iOS = Boolean(ua.match(/iP(ad|hone)/i));
        var isWebkit = Boolean(ua.match(/WebKit/i));
        var isChrome = Boolean(ua.match(/CriOS/i));
        return iOS && isWebkit && !isChrome;
    },

    isIOSChrome: function() {
        if (!window || !window.navigator || !window.navigator.userAgent) {
            return false;
        }
        var ua = window.navigator.userAgent;
        var iOS = Boolean(ua.match(/iP(ad|hone)/i));
        var isWebkit = Boolean(ua.match(/WebKit/i));
        var isChrome = Boolean(ua.match(/CriOS/i));
        return iOS && !isWebkit && isChrome;
    },

    getVersionFirefox: function() {
        var ua = navigator ? navigator.userAgent : false;
        var version;

        if (ua) {
            var ffInfo = ua.match(/(?:firefox)[ \/](\d+)/i) || [];
            version = ffInfo[1] ? + ffInfo[1] : null;
        }

        return version;
    },

    getVersionSafari: function() {
        var ua = navigator ? navigator.userAgent : false;
        var version;

        if (ua) {
            var sInfo = ua.match(/(?:safari)[ \/](\d+)/i) || [];

            if (sInfo.length) {
                var sVer = ua.match(/(?:version)[ \/](\d+)/i) || [];

                if (sVer) {
                    version = sVer[1] ? + sVer[1] : null;
                } else {
                    version = null;
                }
            } else {
                version = null;
            }
        }

        return version;
    },

    /**
     * Return a Promise that  resolves after `timeout` milliseconds.
     * @param {number} [timeout=0]
     * @returns {Promise<void>}
     */
    delay: function(timeout) {
        timeout = typeof timeout === 'number' && timeout > 0 ? timeout : 0;
        return new Promise(function (resolve) {
            setTimeout(resolve, timeout);
        });
    },

    /**
     * [SessionConnectionState]
     * @enum {number}
     */
    SessionConnectionState: {
        UNDEFINED: 0,
        CONNECTING: 1,
        CONNECTED: 2,
        FAILED: 3,
        DISCONNECTED: 4,
        CLOSED: 5,
        COMPLETED: 6
    },

    /**
     * [CallType]
     * @enum {number}
     */
    CallType: {
        VIDEO: 1,
        AUDIO: 2
    },
};

module.exports = WebRTCHelpers;
