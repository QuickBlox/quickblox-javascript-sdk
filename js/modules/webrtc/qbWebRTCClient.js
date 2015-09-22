/*
 * QuickBlox JavaScript SDK
 *
 * WebRTC Module (WebRTC client)
 *
 */

 /*
  * User's callbacks (listener-functions):
  * - onCallListener(session, extension)
  * - onAcceptCallListener(session, extension)
  * - onRejectCallListener(session, extension)
  * - onStopCallListener(session, extension)
  * - onUpdateCallListener(session, extension)
  */

var WebRTCSession = require('./qbWebRTCSession');
var WebRTCSignalingProcessor = require('./qbWebRTCSignalingProcessor');
var Helpers = require('./qbWebRTCHelpers');

function WebRTCClient(service, connection) {
  if (WebRTCClient.__instance) {
		return WebRTCClient.__instance;
  } else if (this === window) {
    return new WebRTCClient();
  }

  WebRTCClient.__instance = this;

	// Initialise all properties here
  this.connection = connection;
  this.signalingProcessor = new WebRTCSignalingProcessor(service, this, connection);
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
 WebRTCClient.prototype.createNewSession = function(opponentsIDs, callType) {
   var newSession = new WebRTCSession(null, Helpers.getIdFromNode(this.connection.jid), opponentsIDs, callType);
   this.sessions[newSession.ID] = newSession;
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

   var session = WebRTCClient.sessions[sessionId];
   if(!session){
     session = new WebRTCSession(sessionID, extension.callerID, opponentsIDs, callType);
     this.sessions[session.ID] = session;
   }
   session.processOnCall(userID, extension);

   if (typeof this.onCallListener === 'function'){
     this.onCallListener(session, extension);
   }


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

   var session = WebRTCClient.sessions[sessionId];
   session.processOnAccept(userID, extension);

   if (typeof this.onAcceptCallListener === 'function'){
     this.onAcceptCallListener(session, extension);
   }

        //  clearDialingTimerInterval(sessionId);
        //  clearCallTimer(userId);
         //
        //  if (typeof peer === 'object')
        //    peer.onRemoteSessionCallback(extension.sdp, 'answer');
        //  delete extension.sdp;
 };

 WebRTCClient.prototype._onRejectListener = function(userID, sessionID, extension) {
   Helpers.trace("onReject. UserID:" + userID + ". SessionID: " + sessionID + ". Extension: " + JSON.stringify(extension));

   var session = WebRTCClient.sessions[sessionId];
   session.processOnReject(userID, extension);

   if (typeof this.onRejectListener === 'function'){
     this.onRejectListener(session, extension);
   }

  //  clearDialingTimerInterval(sessionId);
  //  clearCallTimer(userId);
   //
  //  self._close();
 };

 WebRTCClient.prototype._onStopListener = function(userID, sessionID, extension) {
   Helpers.trace("onStop. UserID:" + userID + ". SessionID: " + sessionID + ". Extension: " + JSON.stringify(extension));

   var session = WebRTCClient.sessions[sessionId];
   session.processOnStop(userID, extension);

   if (typeof this.onStopCallListener === 'function'){
     this.onStopCallListener(session, extension);
   }

  //  clearDialingTimerInterval(sessionId);
  //  clearCallTimer(userId);
   //
  //  clearSession(sessionId);
   //
  //  self._close();
}

WebRTCClient.prototype._onIceCandidatesListener = function(userID, sessionID, extension) {
  Helpers.trace("onIceCandidates. UserID:" + userID + ". SessionID: " + sessionID + ". Extension: " + JSON.stringify(extension));

  session.processOnIceCandidates(userID, extension);

  // if (typeof peer === 'object') {
  //   peer.addCandidates(extension.iceCandidates);
  //   if (peer.type === 'answer')
  //     self._sendCandidate(peer.opponentId, peer.iceCandidates);
  // }
}

WebRTCClient.prototype._onUpdateListener = function(userID, sessionID, extension) {
  Helpers.trace("onUpdate. UserID:" + userID + ". SessionID: " + sessionID + ". Extension: " + JSON.stringify(extension));

  var session = WebRTCClient.sessions[sessionId];
  session.processOnUpdate(userID, extension);

  if (typeof this.onUpdateCallListener === 'function'){
    this.onUpdateCallListener(session, extension);
  }
}


module.exports = WebRTCClient;
