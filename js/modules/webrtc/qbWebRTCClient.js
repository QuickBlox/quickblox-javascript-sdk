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
var WebRTCSignaling = require('./qbWebRTCSignaling');
var Helpers = require('./qbWebRTCHelpers');

function WebRTCClient(service, connection) {
  if (WebRTCClient.__instance) {
		return WebRTCClient.__instance;
  } else if (this === window) {
    return new WebRTCClient();
  }

  WebRTCClient.__instance = this;

	// Initialise all properties here
  this.signaling = new WebRTCSignaling(service, this, connection);
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


 //
 /////////////////////////// Delegate (signaling) //////////////////////////////
 //

 WebRTCClient.prototype._onCallListener = function(userID, sessionID, extension) {
   Helpers.trace("onCall. UserID:" + userID + ". SessionID: " + sessionID + ". Extension: " + extension);

  //  if (this.sessions[sessionID]) {
  //    trace('skip onCallListener, a user already got it');
  //    return true;
  //  }

  // // run caller availability timer and run again for this user
  // clearAnswerTimer(sessionId);
  // if(peer == null){
  //   startAnswerTimer(sessionId, self._answerTimeoutCallback);
  // }


  //  if (typeof this.onRemoteStreamListener === 'function'){
  //    this.onRemoteStreamListener(this, userID, stream);
  //  }
 };

 WebRTCClient.prototype._onAcceptListener = function(userID, sessionID, extension) {
   Helpers.trace("onAccept. UserID:" + userID + ". SessionID: " + sessionID + ". Extension: " + JSON.stringify(extension));


        //  clearDialingTimerInterval(sessionId);
        //  clearCallTimer(userId);
         //
        //  if (typeof peer === 'object')
        //    peer.onRemoteSessionCallback(extension.sdp, 'answer');
        //  delete extension.sdp;
 };

 WebRTCClient.prototype._onRejectListener = function(userID, sessionID, extension) {
   Helpers.trace("onReject. UserID:" + userID + ". SessionID: " + sessionID + ". Extension: " + JSON.stringify(extension));

  //  clearDialingTimerInterval(sessionId);
  //  clearCallTimer(userId);
   //
  //  self._close();
 };

 WebRTCClient.prototype._onStopListener = function(userID, sessionID, extension) {
   Helpers.trace("onStop. UserID:" + userID + ". SessionID: " + sessionID + ". Extension: " + JSON.stringify(extension));

  //  clearDialingTimerInterval(sessionId);
  //  clearCallTimer(userId);
   //
  //  clearSession(sessionId);
   //
  //  self._close();
}

WebRTCClient.prototype._onIceCandidatesListener = function(userID, sessionID, extension) {
  Helpers.trace("onIceCandidates. UserID:" + userID + ". SessionID: " + sessionID + ". Extension: " + JSON.stringify(extension));

  // if (typeof peer === 'object') {
  //   peer.addCandidates(extension.iceCandidates);
  //   if (peer.type === 'answer')
  //     self._sendCandidate(peer.opponentId, peer.iceCandidates);
  // }
}

WebRTCClient.prototype._onUpdateListener = function(userID, sessionID, extension) {
  Helpers.trace("onUpdate. UserID:" + userID + ". SessionID: " + sessionID + ". Extension: " + JSON.stringify(extension));

}


 module.exports = WebRTCClient;
