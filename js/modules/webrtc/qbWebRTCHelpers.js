/*
 * QuickBlox JavaScript SDK
 *
 * WebRTC Module (WebRTC helpers)
 *
 */

 var config = require('../../qbConfig');

function WebRTCHelpers() {

}

WebRTCHelpers.prototype = {
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
  }
};

module.exports = WebRTCHelpers;
