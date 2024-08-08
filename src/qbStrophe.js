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

function Connection(onLogListener) {
  var protocol = chatPRTCL.active === 1 ? chatPRTCL.bosh : chatPRTCL.websocket;
  var conn = new Strophe.Connection(protocol);

  if (chatPRTCL.active === 1) {
    conn.xmlInput = function(data) {
      if (data.childNodes[0]) {
        for (var i = 0, len = data.childNodes.length; i < len; i++) {
          Utils.QBLog('[QBChat]', 'RECV:', data.childNodes[i]);
        }
      }
    };
    conn.xmlOutput = function(data) {
      if (data.childNodes[0]) {
        for (var i = 0, len = data.childNodes.length; i < len; i++) {
          Utils.QBLog('[QBChat]', 'SENT:', data.childNodes[i]);
        }
      }
    };
  } else {
    conn.xmlInput = function(data) {
      Utils.QBLog('[QBChat]', 'RECV:', data);
        //
        try {
            let parser = new DOMParser();
            let xmlDoc = parser.parseFromString(data, 'text/xml');

            let errorElem = xmlDoc.getElementsByTagName('error');
            if (errorElem.length > 0) {
                let conditionElem = errorElem[0].getElementsByTagName('condition');
                if (conditionElem.length > 0) {
                    let disconnectCondition = conditionElem[0].textContent;
                    console.log('Disconnect condition:', disconnectCondition);
                    if (onLogListener && typeof onLogListener === 'function') {
                        Utils.safeCallbackCall(onLogListener,
                            '[QBChat][QBStrophe]' +  'DISCONNECTED CONDITION: ' + disconnectCondition);
                    }
                }
            }
        } catch (e) {
            console.error('Error parsing XML input:', e);
        }
        //
    };
    conn.xmlOutput = function(data) {
      Utils.QBLog('[QBChat]', 'SENT:', data);
    };
  }

  return conn;
}

module.exports = Connection;
