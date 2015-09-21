/*
 * QuickBlox JavaScript SDK
 *
 * WebRTC Module (WebRTC client)
 *
 */

 /*
  * User's callbacks (listener-functions):
  * - onCallListener
  * - onAcceptCallListener
  * - onRejectCallListener
  * - onStopCallListener
  * - onUpdateCallListener
  * - onRemoteStreamListener
  * - onSessionConnectionStateChangedListener
  * - onUserNotAnswerListener
  */


 var WebRTCSession = require('./qbWebRTCSession');

 var connection;

 function WebRTCClient(connection) {
   var self = this;
   connection = conn;
 }

 /**
  * Call type
  */
 WebRTCClient.CallType = {
   VIDEO: 'video',
   AUDIO: 'accept'
 };

 /**
  * A map with all sessions the user had/have.
  * @type {Object.<string, Object>}
  */
 WebRTCClient.prototype.sessions = {};

 /**
  * Creates the new session.
  * @param {number} Initiator ID
  * @param {array} Opponents IDs
  * @param {enum} Call type
  */
 WebRTCClient.prototype.createNewSession = function(initiatorID, opponentsIDs, callType) {
   var newSession = new WebRTCSession(initiatorID, opponentsIDs, callType);
   return newSession;
 }

 /**
  * Deletes a session
  * @param {string} Session ID
  */
 WebRTCClient.prototype.clearSession = function(sessionId){
   delete WebRTCClient.sessions[sessionId];
 }


 /**
  * Checks is session active or not
  * @param {string} Session ID
  */
 WebRTCClient.prototype.isSessionActive = function(sessionId){
    var session = WebRTCClient.sessions[sessionId];
    return (session != null && session.state == WebRTCSession.State.ACTIVE);
 };

 /**
  * Checks is session rejected or not
  * @param {string} Session ID
  */
 WebRTCClient.prototype.isSessionRejected = function(sessionId){
    var session = WebRTCClient.sessions[sessionId];
    return (session != null && session.state == WebRTCSession.State.REJECTED);
 };

 /**
  * Checks is session hung up or not
  * @param {string} Session ID
  */
 WebRTCClient.prototype.isSessionHungUp = function(sessionId){
    var session = WebRTCClient.sessions[sessionId];
    return (session != null && session.state == WebRTCSession.State.HUNGUP);
 };


 module.exports = WebRTCClient;
