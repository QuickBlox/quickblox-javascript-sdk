/*
 * QuickBlox JavaScript SDK
 *
 * WebRTC Module (WebRTC session model)
 *
 */

function WebRTCSession(id) {
  this.ID = id;
  this.initiatorID = 0;
  this.opponentsIDs = [];
  this.callType = null;
  this.peerConnections = {};
  this.state = null;
}

/**
 * State of a session
 */
WebRTCSession.prototype.state = {
  NEW: 'new',
  ACTIVE: 'active',
  HUNGUP: 'hungup',
  REJECTED: 'rejected'
};
