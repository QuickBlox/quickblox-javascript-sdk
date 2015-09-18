/*
 * QuickBlox JavaScript SDK
 *
 * WebRTC Module (WebRTC sessions part)
 *
 */

function WebRTCSessionProxy() {
  var self = this;
}

/**
 * A map with all sessions the user had/have.
 * @type {Object.<string, Object>}
 */
WebRTCSessionProxy.prototype.sessions = {};

/**
 * Checks is session active or not
 * @param {string} Session ID
 */
WebRTCSessionProxy.prototype.isSessionActive = function(sessionId){
   var session = this.sessions[sessionId];
   return (session != null && session.state == this.state.ACTIVE);
};

/**
 * Checks is session rejected or not
 * @param {string} Session ID
 */
WebRTCSessionProxy.prototype.isSessionRejected = function(sessionId){
   var session = this.sessions[sessionId];
   return (session != null && session.state == this.state.REJECTED);
};

/**
 * Checks is session hung up or not
 * @param {string} Session ID
 */
WebRTCSessionProxy.prototype.isSessionHungUp = function(sessionId){
   var session = this.sessions[sessionId];
   return (session != null && session.state == this.state.HUNGUP);
};
