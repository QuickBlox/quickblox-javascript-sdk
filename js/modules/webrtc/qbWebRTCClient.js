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
var RTCPeerConnection = require('./qbRTCPeerConnection');

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
  this.CallType = Helpers.CallType;
  this.PeerConnectionState = RTCPeerConnection.State;

  this.sessions = {};
}

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
  var opponentsIdNASessions = getOpponentsIdNASessions(this.sessions),
      isIdentifyOpponents = isOpponentsEqual(opponentsIdNASessions, opponentsIDs);

  if(!isIdentifyOpponents) {
    return this._createAndStoreSession(null, Helpers.getIdFromNode(this.connection.jid), opponentsIDs, callType);
  } else {
    throw new Error("Can't create a session with the same opponentsIDs. There is a session already in NEW or ACTIVE state.");
  }
}

WebRTCClient.prototype._createAndStoreSession = function(sessionID, callerID, opponentsIDs, callType) {
  var newSession = new WebRTCSession(sessionID, callerID, opponentsIDs, callType, this.signalingProvider, Helpers.getIdFromNode(this.connection.jid))

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
 * Check all session and find session with status 'NEW'
 * @param {object} sessions
 * @returns {boolean} is active call exist
 */
WebRTCClient.prototype.isExistNewSession = function(sessions){
  var self = this,
      ans = false;

  if(Object.keys(sessions).length > 0) {
    for(var i in sessions) {
      if( self.isSessionNew(sessions[i].ID) ) {
        ans = true; break;
      }
    }
  }

  return ans;
};

/**
 * Checks is session new or not
 * @param {string} Session ID
 */
WebRTCClient.prototype.isSessionNew = function(sessionId){
   var session = this.sessions[sessionId];
   return (session != null && session.state == WebRTCSession.State.NEW);
};

/**
* Check all session and find session with status 'ACTIVE'
* @param {object} sessions
* @returns {boolean} is active call exist
*/
WebRTCClient.prototype.isExistActiveSession = function(sessions){
 var self = this,
     ans = false;

 if(Object.keys(sessions).length > 0) {
   for(var i in sessions) {
     if( self.isSessionActive(sessions[i].ID) ) {
       ans = true; break;
     }
   }
 }

 return ans;
};

 /**
  * Checks is session active or not
  * @param {string} Session ID
  */
 WebRTCClient.prototype.isSessionActive = function(sessionId){
    var session = this.sessions[sessionId];
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
   Helpers.trace("onCall. UserID:" + userID + ". SessionID: " + sessionID);

   var session = this.sessions[sessionID];
   if(!session){
     session = this._createAndStoreSession(sessionID, extension.callerID, extension.opponentsIDs, extension.callType);

     var extensionClone = JSON.parse(JSON.stringify(extension));
     this._cleanupExtension(extensionClone);

     if (typeof this.onCallListener === 'function'){
       this.onCallListener(session, extensionClone);
     }
   }
   session.processOnCall(userID, extension);
 };

 WebRTCClient.prototype._onAcceptListener = function(userID, sessionID, extension) {
   Helpers.trace("onAccept. UserID:" + userID + ". SessionID: " + sessionID);

   var session = this.sessions[sessionID];
   if(session){
     var extensionClone = JSON.parse(JSON.stringify(extension));
     this._cleanupExtension(extensionClone);

     if (typeof this.onAcceptCallListener === 'function'){
       this.onAcceptCallListener(session, extensionClone);
     }

     session.processOnAccept(userID, extension);
   }else{
     Helpers.traceError("Ignore 'onAccept', there is no information about session " + sessionID + " by some reason.");
   }
 };

 WebRTCClient.prototype._onRejectListener = function(userID, sessionID, extension) {
   Helpers.trace("onReject. UserID:" + userID + ". SessionID: " + sessionID);

   var session = this.sessions[sessionID];

   if(session){
     var extensionClone = JSON.parse(JSON.stringify(extension));
     this._cleanupExtension(extensionClone);

     if (typeof this.onRejectCallListener === 'function'){
       this.onRejectCallListener(session, extensionClone);
     }

     session.processOnReject(userID, extension);
   }else{
     Helpers.traceError("Ignore 'onReject', there is no information about session " + sessionID + " by some reason.");
   }
 };

 WebRTCClient.prototype._onStopListener = function(userID, sessionID, extension) {
   Helpers.trace("onStop. UserID:" + userID + ". SessionID: " + sessionID);

   var session = this.sessions[sessionID];
   if(session){
     var extensionClone = JSON.parse(JSON.stringify(extension));
     this._cleanupExtension(extensionClone);

     if (typeof this.onStopCallListener === 'function'){
       this.onStopCallListener(session, extensionClone);
     }

     session.processOnStop(userID, extension);
   }else{
     Helpers.traceError("Ignore 'onStop', there is no information about session " + sessionID + " by some reason.")
   }
}

WebRTCClient.prototype._onIceCandidatesListener = function(userID, sessionID, extension) {
  Helpers.trace("onIceCandidates. UserID:" + userID + ". SessionID: " + sessionID + ". ICE candidates count: " + extension.iceCandidates.length);

  var session = this.sessions[sessionID];
  if(session){
    session.processOnIceCandidates(userID, extension);
  }else{
    Helpers.traceError("Ignore 'OnIceCandidates', there is no information about session " + sessionID + " by some reason.");
  }
}

WebRTCClient.prototype._onUpdateListener = function(userID, sessionID, extension) {
  Helpers.trace("onUpdate. UserID:" + userID + ". SessionID: " + sessionID + ". Extension: " + JSON.stringify(extension));

  var session = WebRTCClient.sessions[sessionId];

  if (typeof this.onUpdateCallListener === 'function'){
    this.onUpdateCallListener(session, extension);
  }

  session.processOnUpdate(userID, extension);
}

WebRTCClient.prototype._cleanupExtension = function(extension){
  delete extension.platform;
  delete extension.sdp;
  delete extension.opponentsIDs;
  delete extension.callerID;
  delete extension.callType;
}

module.exports = WebRTCClient;

/**
  * PRIVATE FUNCTIONS
  */

function isOpponentsEqual(exOpponents, currentOpponents) {
  var ans = false,
      cOpponents = currentOpponents.sort();

    if(exOpponents.length) {
      exOpponents.forEach(function(i) {
        var array = i.sort();

        ans = (array.length == cOpponents.length) && array.every(function(el, index) {
          return el === cOpponents[index];
        });
      });
  }

  return ans;
};

function getOpponentsIdNASessions(sessions) {
  var opponents = [];

  if(Object.keys(sessions).length > 0) {
    Object.keys(sessions).forEach(function(key, i, arr) {
      var session = sessions[key];
      if(session.state === WebRTCSession.State.NEW || session.state === WebRTCSession.State.ACTIVE) {
        opponents.push(session.opponentsIDs);
      }
    });
  }

  return opponents;
}
