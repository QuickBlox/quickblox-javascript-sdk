/*
 * QuickBlox JavaScript SDK
 *
 * WebRTC Module (WebRTC session model)
 *
 */


 /**
  * Creates a session
  * @param {number} An ID if the call's initiator
  * @param {array} An array with opponents
  * @param {enum} Type of a call
  */
function WebRTCSession(initiatorID, opponentsIDs, callType) {
  this.ID = generateUUID();
  this.state = this.state.NEW;
  //
  this.initiatorID = initiatorID;
  this.opponentsIDs = opponentsIDs;
  this.callType = callType;
  //
  this.peerConnections = {};
}

/**
 * Initiate a call
 * @param {array} A map with custom parameters
 */
WebRTCProxy.prototype.call = function(extension) {

}

/**
 * Accept a call
 * @param {array} A map with custom parameters
 */
WebRTCProxy.prototype.accept = function(extension) {

}

/**
 * Reject a call
 * @param {array} A map with custom parameters
 */
WebRTCProxy.prototype.reject = function(extension) {

}

/**
 * Stop a call
 * @param {array} A map with custom parameters
 */
WebRTCProxy.prototype.stop = function(extension) {

}

/**
 * Update a call
 * @param {array} A map with custom parameters
 */
WebRTCProxy.prototype.update = function(extension) {

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

WebRTCSession.prototype.toString = function sessionToString() {
  var ret = 'ID: ' + this.ID + ', initiatorID:  ' + this.initiatorID + ', opponentsIDs: ' +
    this.opponentsIDs + ', state: ' + this.state + ", callType: " + this.callType;
  return ret;
}

function generateUUID(){
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}

module.exports = WebRTCSession;
