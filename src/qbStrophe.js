'use strict';
/** JSHint inline rules */
/* globals Strophe */

/**
 * QuickBlox JavaScript SDK
 * Strophe Connection Object
 */

require('strophe.js');

var config = require('./qbConfig');
var chatPRTCL = config.chatProtocol;
var Utils = require('./qbUtils');

function Connection(onLogListenerCallback) {
    var protocol = chatPRTCL.active === 1 ? chatPRTCL.bosh : chatPRTCL.websocket;
    var conn = new Strophe.Connection(protocol);
    var onLogListener = config.debug ? onLogListenerCallback  : null;
    var safeCallbackCall = function(message, data) {
        onLogListener =  config.debug ? onLogListenerCallback  : null;
        if (onLogListener && typeof onLogListener === 'function') {
            var id = data && data.id? data.id : '';
            var innerHTML = data && data.innerHTML? data.innerHTML : '';
            var outerHTML = data && data.outerHTML? data.outerHTML : '';
            Utils.safeCallbackCall(onLogListener,
                '[QBChat][QBStrophe]' +  message + ' id:'+id+' innerHTML: '+innerHTML+' outerHTML: '+outerHTML+JSON.stringify(data));
        }
    };

    if (chatPRTCL.active === 1) {
        conn.xmlInput = function(data) {
            if (data.childNodes[0]) {
                for (var i = 0, len = data.childNodes.length; i < len; i++) {
                    Utils.QBLog('[QBChat]', 'RECV:', data.childNodes[i]);
                    safeCallbackCall('RECV:', data.childNodes[i]);
                }
            }
        };
        conn.xmlOutput = function(data) {
            if (data.childNodes[0]) {
                for (var i = 0, len = data.childNodes.length; i < len; i++) {
                    Utils.QBLog('[QBChat]', 'SENT:', data.childNodes[i]);
                    safeCallbackCall('SENT', data.childNodes[i]);
                }
            }
        };
    } else {
        conn.xmlInput = function(data) {
            Utils.QBLog('[QBChat]', 'RECV:', data);
            safeCallbackCall('RECV:', data);

            try {
                let parser = new DOMParser();
                let xmlDoc = parser.parseFromString(data, 'text/xml');
                let errorElem = xmlDoc.getElementsByTagName('error');
                if (errorElem.length > 0) {
                    let conditionElem = errorElem[0].getElementsByTagName('condition');
                    if (conditionElem.length > 0) {
                        let disconnectCondition = conditionElem[0].textContent;
                        console.log('Disconnect condition:', disconnectCondition);
                        safeCallbackCall('DISCONNECTED CONDITION:', disconnectCondition);
                    }
                }
            } catch (e) {
                console.error('Error parsing XML input:', e);
            }
        };
        conn.xmlOutput = function(data) {
            Utils.QBLog('[QBChat]', 'SENT:', data);
            safeCallbackCall('SENT', data);
        };
    }
    return conn;
}

module.exports = Connection;
