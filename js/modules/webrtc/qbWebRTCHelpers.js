/*
 * QuickBlox JavaScript SDK
 *
 * WebRTC Module (WebRTC helpers)
 *
 */

function WebRTCHelpers() {

}

WebRTCHelpers.prototype = {
  getUserJid: function(id, appId) {
    return id + '-' + appId + '@' + config.endpoints.chat;
  },

  getIdFromNode: function(jid) {
    if (jid.indexOf('@') < 0) return null;
    return parseInt(jid.split('@')[0].split('-')[0]);
  }
};

module.exports = WebRTCHelpers;
