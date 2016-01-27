/**
 * QuickBlox JavaScript SDK
 * WebRTC Module (WebRTC client)
 */

/*
 * User's callbacks (listener-functions):
 * - onCallListener(session, extension)
 * - onAcceptCallListener(session, userID, extension)
 * - onRejectCallListener(session, userID, extension)
 * - onStopCallListener(session, userID, extension)
 * - onUpdateCallListener(session, userID, extension)
 */

var WebRTCSession = require('./qbWebRTCSession');
var WebRTCSignalingProcessor = require('./qbWebRTCSignalingProcessor');
var WebRTCSignalingProvider = require('./qbWebRTCSignalingProvider');
var Helpers = require('./qbWebRTCHelpers');
var RTCPeerConnection = require('./qbRTCPeerConnection');
var SignalingConstants = require('./qbWebRTCSignalingConstants');
var Utils = require('../../qbUtils');

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
 * @param  {array} opponentsIDs Opponents IDs
 * @param  {number} ct          Call type
 * @param  {number} cID         Initiator ID
 */
WebRTCClient.prototype.createNewSession = function(opponentsIDs, ct, cID) {
  var opponentsIdNASessions = getOpponentsIdNASessions(this.sessions),
      callerID = cID || Helpers.getIdFromNode(this.connection.jid),
      isIdentifyOpponents = false,
      callType = ct || 2;

  if( !opponentsIDs ) {
    throw new Error('Can\'t create a session without the opponentsIDs.');
  }

  isIdentifyOpponents = isOpponentsEqual(opponentsIdNASessions, opponentsIDs);

  if( !isIdentifyOpponents ) {
    return this._createAndStoreSession(null, callerID, opponentsIDs, callType);
  } else {
    throw new Error('Can\'t create a session with the same opponentsIDs. There is a session already in NEW or ACTIVE state.');
  }
};

WebRTCClient.prototype._createAndStoreSession = function(sessionID, callerID, opponentsIDs, callType) {
  var newSession = new WebRTCSession(sessionID, callerID, opponentsIDs, callType, this.signalingProvider, Helpers.getIdFromNode(this.connection.jid));

  /** set callbacks */
  newSession.onUserNotAnswerListener = this.onUserNotAnswerListener;
  newSession.onRemoteStreamListener = this.onRemoteStreamListener;
  newSession.onSessionConnectionStateChangedListener = this.onSessionConnectionStateChangedListener;
  newSession.onSessionCloseListener = this.onSessionCloseListener;

  this.sessions[newSession.ID] = newSession;
  return newSession;
};

/**
 * Deletes a session
 * @param {string} Session ID
 */
WebRTCClient.prototype.clearSession = function(sessionId){
  delete WebRTCClient.sessions[sessionId];
};

/**
 * Check all session and find session with status 'NEW' or 'ACTIVE' which ID != provided
 * @param {string} session ID
 * @returns {boolean} if active or new session exist
 */
WebRTCClient.prototype.isExistNewOrActiveSessionExceptSessionID = function(sessionID){
  var self = this;
  var exist = false;

  if(Object.keys(self.sessions).length > 0) {
    Object.keys(self.sessions).forEach(function(key, i, arr) {
      var session = self.sessions[key];
      if(session.state === WebRTCSession.State.NEW || session.state === WebRTCSession.State.ACTIVE) {
        if(session.ID !== sessionID){
          exist = true;
          // break; // break doesn't work in 'forEach', need to find another way
        }
      }
    });
  }

  return exist;
};

/**
 * DELEGATE (signaling)
 */
WebRTCClient.prototype._onCallListener = function(userID, sessionID, extension) {
  Helpers.trace("onCall. UserID:" + userID + ". SessionID: " + sessionID);

  if(this.isExistNewOrActiveSessionExceptSessionID(sessionID)) {
    Helpers.trace('User with id ' + userID + ' is busy at the moment.');

    delete extension.sdp;
    delete extension.platform;
    extension.sessionID = sessionID;

    this.signalingProvider.sendMessage(userID, extension, SignalingConstants.SignalingType.REJECT);
  } else {
    var session = this.sessions[sessionID];

    if(!session){
      session = this._createAndStoreSession(sessionID, extension.callerID, extension.opponentsIDs, extension.callType);

      var extensionClone = JSON.parse(JSON.stringify(extension));
      this._cleanupExtension(extensionClone);

      if (typeof this.onCallListener === 'function'){
        Utils.safeCallbackCall(this.onCallListener, session, extensionClone);
      }
    }

    session.processOnCall(userID, extension);
  }
};

WebRTCClient.prototype._onAcceptListener = function(userID, sessionID, extension) {
  var session = this.sessions[sessionID];

  Helpers.trace("onAccept. UserID:" + userID + ". SessionID: " + sessionID);

  if(session){
    if(session.state === WebRTCSession.State.ACTIVE ) {
      var extensionClone = JSON.parse(JSON.stringify(extension));
      this._cleanupExtension(extensionClone);

      if (typeof this.onAcceptCallListener === 'function'){
        Utils.safeCallbackCall(this.onAcceptCallListener,session, userID, extensionClone);
      }

      session.processOnAccept(userID, extension);
    } else {
      Helpers.traceWarning("Ignore 'onAccept', the session( " + sessionID + " ) has invalid state.");
    }
  }else{
    Helpers.traceError("Ignore 'onAccept', there is no information about session " + sessionID + " by some reason.");
  }
};

WebRTCClient.prototype._onRejectListener = function(userID, sessionID, extension) {
  var that = this,
    session = that.sessions[sessionID];

  Helpers.trace("onReject. UserID:" + userID + ". SessionID: " + sessionID);

  if(session){
    var extensionClone = JSON.parse(JSON.stringify(extension));
    that._cleanupExtension(extensionClone);

    if (typeof this.onRejectCallListener === 'function'){
      Utils.safeCallbackCall(that.onRejectCallListener, session, userID, extensionClone);
    }

    session.processOnReject(userID, extension);
  }else{
    Helpers.traceError("Ignore 'onReject', there is no information about session " + sessionID + " by some reason.");
  }
};

WebRTCClient.prototype._onStopListener = function(userID, sessionID, extension) {
  Helpers.trace("onStop. UserID:" + userID + ". SessionID: " + sessionID);

  var session = this.sessions[sessionID],
      extensionClone = JSON.parse(JSON.stringify(extension));

  if( session && (session.state === WebRTCSession.State.ACTIVE || session.state === WebRTCSession.State.NEW)){
    this._cleanupExtension(extensionClone);

    if (typeof this.onStopCallListener === 'function'){
      Utils.safeCallbackCall(this.onStopCallListener, session, userID, extensionClone);
    }

    session.processOnStop(userID, extension);
  }else{
    Helpers.traceError("Ignore 'onStop', there is no information about session " + sessionID + " by some reason.");
  }
};

WebRTCClient.prototype._onIceCandidatesListener = function(userID, sessionID, extension) {
  var session = this.sessions[sessionID];

  Helpers.trace("onIceCandidates. UserID:" + userID + ". SessionID: " + sessionID + ". ICE candidates count: " + extension.iceCandidates.length);

  if(session){
    if(session.state === WebRTCSession.State.ACTIVE) {
      session.processOnIceCandidates(userID, extension);
    } else {
      Helpers.traceWarning('Ignore \'OnIceCandidates\', the session ( ' + sessionID + ' ) has invalid state.');
    }
  }else{
    Helpers.traceError("Ignore 'OnIceCandidates', there is no information about session " + sessionID + " by some reason.");
  }
};

WebRTCClient.prototype._onUpdateListener = function(userID, sessionID, extension) {
  var session = this.sessions[sessionID];

  Helpers.trace("onUpdate. UserID:" + userID + ". SessionID: " + sessionID + ". Extension: " + JSON.stringify(extension));

  if (typeof this.onUpdateCallListener === 'function'){
    Utils.safeCallbackCall(this.onUpdateCallListener, session, userID, extension);
  }
};

WebRTCClient.prototype._cleanupExtension = function(extension){
  delete extension.platform;
  delete extension.sdp;
  delete extension.opponentsIDs;
  delete extension.callerID;
  delete extension.callType;
};

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
}

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
