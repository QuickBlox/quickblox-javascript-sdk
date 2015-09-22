/*
 * QuickBlox JavaScript SDK
 *
 * WebRTC Module (WebRTC peer connection model)
 *
 */

// Modules
//
var config = require('../../qbConfig');

// Variable
//
// cross-browser polyfill
var RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
var RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;
var offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1
};


if (RTCPeerConnection) {

RTCPeerConnection.SessionConnectionState = {
  UNDEFINED: 0,
  CONNECTING: 1,
  CONNECTED: 2,
  FAILED: 3,
  DISCONNECTED: 4,
  CLOSED: 5
};

RTCPeerConnection.prototype.init = function(delegate, userID, sessionID, type, sessionDescription) {
  this.delegate = delegate;
  this.sessionID = sessionID;
  this.userID = userID;
  this.type = type;

  this.addStream(this.delegate.localStream);
  this.onicecandidate = this.onIceCandidateCallback;
  this.onaddstream = this.onAddRemoteStreamCallback;
  this.onsignalingstatechange = this.onSignalingStateCallback;
  this.oniceconnectionstatechange = this.onIceConnectionStateCallback;

  // We use this timer on a caller's side to notify him if an opponent doesn't answer the call.
  //
  this.answerTimeoutTimer;

  // // we use this timeout to fix next issue:
  // // "From Android/iOS make a call to Web and kill the Android/iOS app instantly. Web accept/reject popup will be still visible.
  // // We need a way to hide it if sach situation happened."
  // //
  // this.answerTimers = {};
  //
  // // We use this timer interval to dial a user - produce the call reqeusts each N seconds.
  // //
  // this.dialingTimerIntervals = {};

  if (this.type === 'answer') {
    var desc = new RTCSessionDescription({sdp: sessionDescription, type: 'offer'});
    this.setRemoteDescription(desc);
  }
};

RTCPeerConnection.prototype.getSessionDescription = function(callback) {
  var self = this;

  if (self.type === 'offer') {
    // Additional parameters for SDP Constraints
    // http://www.w3.org/TR/webrtc/#constraints
    // self.createOffer(successCallback, errorCallback, constraints)
    self.createOffer(successCallback, errorCallback);
  } else {
    self.createAnswer(successCallback, errorCallback);
  }

  function successCallback(desc) {
    self.setLocalDescription(desc, function() {
      callback(null, desc);
    }, errorCallback);
  }
  function errorCallback(error) {
    callback(error, null);
  }
};

RTCPeerConnection.prototype.onIceCandidateCallback = function(event) {
  var candidate = event.candidate;

  if (candidate) {
    trace("onICECandidate: " + JSON.stringify(candidate));

    this.iceCandidates = this.iceCandidates || [];
    this.iceCandidates.push({
      sdpMLineIndex: candidate.sdpMLineIndex,
      sdpMid: candidate.sdpMid,
      candidate: candidate.candidate
    });
  }
};

// handler of remote media stream
RTCPeerConnection.prototype.onAddRemoteStreamCallback = function(event) {
  if (typeof this.delegate._onRemoteStreamListener === 'function'){
    this.delegate._onRemoteStreamListener(this.userID, event.stream);
  }
};

RTCPeerConnection.prototype.addCandidates = function(iceCandidates) {
  var candidate;
  for (var i = 0, len = iceCandidates.length; i < len; i++) {
    candidate = {
      sdpMLineIndex: iceCandidates[i].sdpMLineIndex,
      sdpMid: iceCandidates[i].sdpMid,
      candidate: iceCandidates[i].candidate
    };
    this.addIceCandidate(new RTCIceCandidate(candidate));
  }
};

RTCPeerConnection.prototype.onSignalingStateCallback = function() {
  // send candidates
  if (this.signalingState === 'stable' && this.type === 'offer'){
    this.delegate._sendCandidate(this.opponentId, this.iceCandidates);
  }
};

RTCPeerConnection.prototype.onIceConnectionStateCallback = function() {
  trace("onIceConnectionStateCallback: " + this.iceConnectionState);

  var newIceConnectionState = this.iceConnectionState;

  // read more about all states:
  // http://w3c.github.io/webrtc-pc/#idl-def-RTCIceConnectionState
  //
  // 'disconnected' happens in a case when a user has killed an application (for example, on iOS/Android via task manager).
  // So we should notify our user about it.

  // notify user about state changes
  //
  if(typeof this.delegate._onSessionConnectionStateChangedListener === 'function'){
  	var connectionState = null;
  	if (newIceConnectionState === 'checking'){
        connectionState = RTCPeerConnection.SessionConnectionState.CONNECTING;
  	} else if (newIceConnectionState === 'connected'){
        connectionState = RTCPeerConnection.SessionConnectionState.CONNECTED;
  	} else if (newIceConnectionState === 'failed'){
        connectionState = RTCPeerConnection.SessionConnectionState.FAILED;
  	} else if (newIceConnectionState === 'disconnected'){
        connectionState = RTCPeerConnection.SessionConnectionState.DISCONNECTED;
  	} else if (newIceConnectionState === 'closed'){
        connectionState = RTCPeerConnection.SessionConnectionState.CLOSED;
  	}

  	if(connectionState != null){
      this.delegate._onSessionConnectionStateChangedListener(this.userID, connectionState);
    }
  }
};


//
/////////////////////////////////// Timers//////////////////////////////////////
//

RTCPeerConnection.prototype.clearAnswerTimer = function(sessionId){
	var answerTimer = this.answerTimers[sessionId];
  if(answerTimer){
    clearTimeout(answerTimer);
    delete this.answerTimers[sessionId];
  }
}

RTCPeerConnection.prototype.startAnswerTimer = function(sessionId, callback){
  var answerTimeInterval = config.webrtc.answerTimeInterval*1000;
  var answerTimer = setTimeout(callback, answerTimeInterval, sessionId);
  this.answerTimers[sessionId] = answerTimer;
}

RTCPeerConnection.prototype.clearDialingTimerInterval = function(sessionId){
  var dialingTimer = this.dialingTimerIntervals[sessionId];
  if(dialingTimer){
    clearInterval(dialingTimer);
    delete this.dialingTimerIntervals[sessionId];
  }
}

RTCPeerConnection.prototype.startDialingTimerInterval = function(sessionId, functionToRun){
  var dialingTimeInterval = config.webrtc.dialingTimeInterval*1000;
  var dialingTimerId = setInterval(functionToRun, dialingTimeInterval);
  this.dialingTimerIntervals[sessionId] = dialingTimerId;
}


//
/////////////////////////////////// Private ////////////////////////////////////
//

RTCPeerConnection.prototype._clearAnswerTimeoutTimer = function(){
  if(this.answerTimeoutTimer){
    clearTimeout(this.answerTimeoutTimer);
    this.answerTimeoutTimer = null;
  }
}

RTCPeerConnection.prototype._startAnswerTimeoutTimer = function(callback){
  console.log("Start 'answer timeout timer' for session " + this.ID);
  var answerTimeInterval = config.webrtc.answerTimeInterval*1000;
  this.answerTimeoutTimer = setTimeout(callback, answerTimeInterval);
}


RTCPeerConnection.prototype._answerTimeoutCallback = function (){
  console.log("Answer timeout callback for session " + this.ID);

  for (var key in this.peerConnections) {
    var peer = this.peerConnections[key];

    if(typeof this.onUserNotAnswerListener === 'function'){
      this.onUserNotAnswerListener(this, peer.userID);
    }

  }

  clearDialingTimerInterval(sessionId);

  clearSession(sessionId);
  self._close();


};

// RTCPeerConnection.prototype._answerTimeoutCallback = function (sessionId){
//   clearSession(sessionId);
//   self._close();
//
//   if(typeof self.onSessionConnectionStateChangedListener === 'function'){
//     self.onSessionConnectionStateChangedListener(self.SessionConnectionState.CLOSED, userId);
//   }
// };

}

module.exports = RTCPeerConnection;
