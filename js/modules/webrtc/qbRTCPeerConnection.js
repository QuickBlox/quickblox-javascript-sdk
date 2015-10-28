/*
 * QuickBlox JavaScript SDK
 *
 * WebRTC Module (WebRTC peer connection model)
 *
 */

// Modules
//
var config = require('../../qbConfig');
var Helpers = require('./qbWebRTCHelpers');

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

// unused for now
RTCPeerConnection.State = {
  NEW: 1,
  CONNECTING: 2,
  CHECKING: 3,
  CONNECTED: 4,
  DISCONNECTED: 5,
  FAILED: 6,
  CLOSED: 7,
  COMPLETED: 8
};

RTCPeerConnection.prototype.init = function(delegate, userID, sessionID, type) {
  Helpers.trace("RTCPeerConnection init. userID: " + userID + ", sessionID: " + sessionID + ", type: " + type);

  this.delegate = delegate;
  this.sessionID = sessionID;
  this.userID = userID;
  this.type = type;
  this.sdp = null;

  this.state = RTCPeerConnection.State.NEW;

  this.onicecandidate = this.onIceCandidateCallback;
  this.onaddstream = this.onAddRemoteStreamCallback;
  this.onsignalingstatechange = this.onSignalingStateCallback;
  this.oniceconnectionstatechange = this.onIceConnectionStateCallback;

  // We use this timer interval to dial a user - produce the call requests each N seconds.
  //
  this.dialingTimer = null;
  this.answerTimeInterval = 0;
  this.reconnectTimer = 0;

  this.iceCandidates = [];
};

RTCPeerConnection.prototype.release = function(){
  this._clearDialingTimer();
  if(this.signalingState !== 'closed'){
    this.close();
  }
}

RTCPeerConnection.prototype.setRemoteSessionDescription = function(type, remoteSessionDescription, callback){
  var desc = new RTCSessionDescription({sdp: remoteSessionDescription, type: type});

  function successCallback() {
    callback(null);
  }
  function errorCallback(error) {
    callback(error);
  }

  this.setRemoteDescription(desc, successCallback, errorCallback);
}

RTCPeerConnection.prototype.addLocalStream = function(localStream){
  if(localStream == null){
    throw new Error("'RTCPeerConnection.addStream' error: stream is 'null'.");
  }
  this.addStream(localStream);
}

RTCPeerConnection.prototype.getAndSetLocalSessionDescription = function(callback) {
  var self = this;

  this.state = RTCPeerConnection.State.CONNECTING;

  if (self.type === 'offer') {
    // Additional parameters for SDP Constraints
    // http://www.w3.org/TR/webrtc/#h-offer-answer-options
    // self.createOffer(successCallback, errorCallback, constraints)
    self.createOffer(successCallback, errorCallback);
  } else {
    self.createAnswer(successCallback, errorCallback);
  }

  function successCallback(desc) {
    self.setLocalDescription(desc, function() {
      callback(null);
    }, errorCallback);
  }
  function errorCallback(error) {
    callback(error);
  }
};

RTCPeerConnection.prototype.updateSDP = function(newSDP){
  this.sdp = newSDP;
}

RTCPeerConnection.prototype.addCandidates = function(iceCandidates) {
  var candidate;
  for (var i = 0, len = iceCandidates.length; i < len; i++) {
    candidate = {
      sdpMLineIndex: iceCandidates[i].sdpMLineIndex,
      sdpMid: iceCandidates[i].sdpMid,
      candidate: iceCandidates[i].candidate
    };
    this.addIceCandidate(new RTCIceCandidate(candidate),
      function() {

      }, function(error){
        Helpers.traceError("Error on 'addIceCandidate': " + error);
      });
  }
};

RTCPeerConnection.prototype.toString = function sessionToString() {
  var ret = 'sessionID: ' + this.sessionID + ', userID:  ' + this.userID + ', type: ' +
    this.type + ', state: ' + this.state;
  return ret;
}

//
////////////////////////////////// Callbacks ///////////////////////////////////
//


RTCPeerConnection.prototype.onSignalingStateCallback = function() {
  // send candidates
  //
  if (this.signalingState === 'stable' && this.iceCandidates.length > 0){
    this.delegate.processIceCandidates(this, this.iceCandidates);
    this.iceCandidates.length = 0;
  }
};

RTCPeerConnection.prototype.onIceCandidateCallback = function(event) {
  var candidate = event.candidate;

  if (candidate) {
    // collecting internally the ice candidates
    // will send a bit later
    //
    var ICECandidate = {
      sdpMLineIndex: candidate.sdpMLineIndex,
      sdpMid: candidate.sdpMid,
      candidate: candidate.candidate
    };

    if(this.signalingState === 'stable'){
      this.delegate.processIceCandidates(this, [ICECandidate])
    }else{
      this.iceCandidates.push(ICECandidate);
    }
  }
};

// handler of remote media stream
RTCPeerConnection.prototype.onAddRemoteStreamCallback = function(event) {
  if (typeof this.delegate._onRemoteStreamListener === 'function'){
    this.delegate._onRemoteStreamListener(this.userID, event.stream);
  }
};

RTCPeerConnection.prototype.onIceConnectionStateCallback = function() {
  Helpers.trace("onIceConnectionStateCallback: " + this.iceConnectionState);

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
        this.state = RTCPeerConnection.State.CHECKING;
        connectionState = Helpers.SessionConnectionState.CONNECTING;
  	} else if (newIceConnectionState === 'connected'){
        this.state = RTCPeerConnection.State.CONNECTED;
        connectionState = Helpers.SessionConnectionState.CONNECTED;
  	} else if (newIceConnectionState === 'completed'){
      this.state = RTCPeerConnection.State.COMPLETED;
      connectionState = Helpers.SessionConnectionState.COMPLETED;
    } else if (newIceConnectionState === 'failed'){
        this.state = RTCPeerConnection.State.FAILED;
        connectionState = Helpers.SessionConnectionState.FAILED;
  	} else if (newIceConnectionState === 'disconnected'){
        this.state = RTCPeerConnection.State.DISCONNECTED;
        connectionState = Helpers.SessionConnectionState.DISCONNECTED;
  	} else if (newIceConnectionState === 'closed'){
        this.state = RTCPeerConnection.State.CLOSED;
        connectionState = Helpers.SessionConnectionState.CLOSED;
  	}

  	if(connectionState != null){
      this.delegate._onSessionConnectionStateChangedListener(this.userID, connectionState);
    }
  }
};

RTCPeerConnection.prototype.clearWaitingReconnectTimer = function() {
  if(this.waitingReconnectTimeoutCallback){
    Helpers.trace('_clearWaitingReconnectTimer');
    clearTimeout(this.waitingReconnectTimeoutCallback);
    this.waitingReconnectTimeoutCallback = null;
  }
};

RTCPeerConnection.prototype.startWaitingReconnectTimer = function() {
  var self = this,
      timeout = config.webrtc.disconnectTimeInterval * 1000,
      waitingReconnectTimeoutCallback = function() {
        Helpers.trace('waitingReconnectTimeoutCallback');

        clearTimeout(self.waitingReconnectTimeoutCallback);

        self._clearDialingTimer();
        self.release();

        self.delegate._closeSessionIfAllConnectionsClosed();
      };

  Helpers.trace('_startWaitingReconnectTimer, timeout: ' + timeout);

  this.waitingReconnectTimeoutCallback = setTimeout(waitingReconnectTimeoutCallback, timeout);
};

//
/////////////////////////////////// Private ////////////////////////////////////
//


RTCPeerConnection.prototype._clearDialingTimer = function(){
  if(this.dialingTimer){
    Helpers.trace('_clearDialingTimer');

    clearInterval(this.dialingTimer);
    this.dialingTimer = null;
    this.answerTimeInterval = 0;
  }
};

RTCPeerConnection.prototype._startDialingTimer = function(extension, withOnNotAnswerCallback){
  var dialingTimeInterval = config.webrtc.dialingTimeInterval*1000;

  Helpers.trace('_startDialingTimer, dialingTimeInterval: ' + dialingTimeInterval);

  var self = this;

  var _dialingCallback = function(extension, withOnNotAnswerCallback, skipIncrement){
    if(!skipIncrement){
      self.answerTimeInterval += config.webrtc.dialingTimeInterval*1000;
    }

    Helpers.trace('_dialingCallback, answerTimeInterval: ' + self.answerTimeInterval);

    if(self.answerTimeInterval >= config.webrtc.answerTimeInterval*1000){
      self._clearDialingTimer();

      if(withOnNotAnswerCallback){
        self.delegate.processOnNotAnswer(self);
      }
    }else{
      self.delegate.processCall(self, extension);
    }
  };

  this.dialingTimer = setInterval(_dialingCallback, dialingTimeInterval, extension, withOnNotAnswerCallback, false);

  // call for the 1st time
  _dialingCallback(extension, withOnNotAnswerCallback, true);
};

module.exports = RTCPeerConnection;