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
var WebRTCSignalingProvider = require('./qbWebRTCSignalingProvider');
var Helpers = require('./qbWebRTCHelpers');

// this.session = WebRTCSession;

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
  this.signalingProvider = new WebRTCSignalingProvider(service, connection);

  this.SessionConnectionState = Helpers.SessionConnectionState;
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
   var newSession = this._createAndStoreSession(null, Helpers.getIdFromNode(this.connection.jid), opponentsIDs, callType);
   return newSession;
 }

  WebRTCClient.prototype._createAndStoreSession = function(sessionID, callerID, opponentsIDs, callType) {
    var newSession = new WebRTCSession(sessionID, callerID, opponentsIDs, callType, this.signalingProvider)

    // set callbacks
    newSession.onUserNotAnswerListener = this.onUserNotAnswerListener;
    newSession.onRemoteStreamListener = this.onRemoteStreamListener;
    newSession.onSessionConnectionStateChangedListener = this.onSessionConnectionStateChangedListener;
    newSession.onSessionCloseListener = this.onSessionCloseListener;

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
   var session = this.sessions[sessionID];
   if(!session){
     session = this._createAndStoreSession(sessionID, extension.callerID, extension.opponentsIDs, extension.callType);
     
     session.processOnCall(userID, extension);

     this._cleanupExtension(extension);

     Helpers.trace("onCall. UserID:" + userID + ". SessionID: " + sessionID + ". Extension: " + JSON.stringify(extension));

     if (typeof this.onCallListener === 'function'){
       this.onCallListener(session, extension);
     }
   }
 };

 WebRTCClient.prototype._onAcceptListener = function(userID, sessionID, extension) {
   var session = this.sessions[sessionID];
   session.processOnAccept(userID, extension);

   this._cleanupExtension(extension);

   Helpers.trace("onAccept. UserID:" + userID + ". SessionID: " + sessionID + ". Extension: " + JSON.stringify(extension));

   if (typeof this.onAcceptCallListener === 'function'){
     this.onAcceptCallListener(session, extension);
   }
 };

 WebRTCClient.prototype._onRejectListener = function(userID, sessionID, extension) {
   var session = this.sessions[sessionID];
   session.processOnReject(userID, extension);

   this._cleanupExtension(extension);

   Helpers.trace("onReject. UserID:" + userID + ". SessionID: " + sessionID + ". Extension: " + JSON.stringify(extension));

   if (typeof this.onRejectCallListener === 'function'){
     this.onRejectCallListener(session, extension);
   }
 };

 WebRTCClient.prototype._onStopListener = function(userID, sessionID, extension) {
   var session = this.sessions[sessionID];
   session.processOnStop(userID, extension);

   this._cleanupExtension(extension);

   Helpers.trace("onStop. UserID:" + userID + ". SessionID: " + sessionID + ". Extension: " + JSON.stringify(extension));

   if (typeof this.onStopCallListener === 'function'){
     this.onStopCallListener(session, extension);
   }
}

WebRTCClient.prototype._onIceCandidatesListener = function(userID, sessionID, extension) {
  Helpers.trace("onIceCandidates. UserID:" + userID + ". SessionID: " + sessionID + ". Extension: " + JSON.stringify(extension));

  session.processOnIceCandidates(userID, extension);
}

WebRTCClient.prototype._onUpdateListener = function(userID, sessionID, extension) {
  Helpers.trace("onUpdate. UserID:" + userID + ". SessionID: " + sessionID + ". Extension: " + JSON.stringify(extension));

  var session = WebRTCClient.sessions[sessionId];
  session.processOnUpdate(userID, extension);

  if (typeof this.onUpdateCallListener === 'function'){
    this.onUpdateCallListener(session, extension);
  }
}

WebRTCClient.prototype._cleanupExtension = function(extension){
  delete extension.platform;
  delete extension.sdp;
  delete extension.opponentsIDs;
  delete extension.callerID;
  delete extension.callType;
}

module.exports = WebRTCClient;
