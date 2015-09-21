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

WebRTCHelpers.MODULE_ID = "WebRTCVideoChat";

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

  getWebRTCModuleID: function(){
    return WebRTCHelpers.MODULE_ID;
  }

};

// Download Blob to local file system
Blob.prototype.download = function() {
  download(this, this.name, this.type);
};

module.exports = WebRTCHelpers;
