/*
 * QuickBlox JavaScript SDK
 *
 * WebRTC Module (WebRTC helpers)
 *
 */

 var config = require('../../qbConfig');
 var download = require('../../../lib/download/download.min');

function WebRTCHelpers() {

}

WebRTCHelpers = {
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

  traceError: function(text) {
    if (config.debug) {
      console.error('[QBWebRTC]:', text);
    }
  },

  getLocalTime: function() {
    var arr = (new Date).toString().split(' ');
    return arr.slice(1,5).join('-');
  },

  // Convert Data URI to Blob
  dataURItoBlob: function(dataURI, contentType) {
    var arr = [],
        binary = window.atob(dataURI.split(',')[1]);

    for (var i = 0, len = binary.length; i < len; i++) {
      arr.push(binary.charCodeAt(i));
    }

    return new Blob([new Uint8Array(arr)], {type: contentType});
  }
};

WebRTCHelpers.SessionConnectionState = {
  UNDEFINED: 0,
  CONNECTING: 1,
  CONNECTED: 2,
  FAILED: 3,
  DISCONNECTED: 4,
  CLOSED: 5
};

WebRTCHelpers.CallType = {
  VIDEO: 1,
  AUDIO: 2
};

// Download Blob to local file system
Blob.prototype.download = function() {
  download(this, this.name, this.type);
};

module.exports = WebRTCHelpers;
