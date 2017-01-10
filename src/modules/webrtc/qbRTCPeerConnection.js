'use strict';

/** JSHint inline rules (TODO: loopfunc will delete) */
/* jshint loopfunc: true */

/**
 * QuickBlox JavaScript SDK
 * WebRTC Module (WebRTC peer connection model)
 */

/** Modules */
var config = require('../../qbConfig');
var Helpers = require('./qbWebRTCHelpers');

var RTCPeerConnection = window.RTCPeerConnection;
var RTCSessionDescription = window.RTCSessionDescription;
var RTCIceCandidate = window.RTCIceCandidate;
var offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1
};

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
  Helpers.trace('RTCPeerConnection init. userID: ' + userID + ', sessionID: ' + sessionID + ', type: ' + type);

  this.delegate = delegate;
  this.sessionID = sessionID;
  this.userID = userID;
  this.type = type;
  this.remoteSDP = null;

  this.state = RTCPeerConnection.State.NEW;

  this.onicecandidate = this.onIceCandidateCallback;
  this.onaddstream = this.onAddRemoteStreamCallback;
  this.onsignalingstatechange = this.onSignalingStateCallback;
  this.oniceconnectionstatechange = this.onIceConnectionStateCallback;

  /** We use this timer interval to dial a user - produce the call requests each N seconds. */
  this.dialingTimer = null;
  this.answerTimeInterval = 0;
  this.statsReportTimer = null;

  /** timer to detect network blips */
  this.reconnectTimer = 0;

  this.iceCandidates = [];
};

RTCPeerConnection.prototype.release = function(){
  this._clearDialingTimer();
  this._clearStatsReportTimer();

  if(this.signalingState !== 'closed'){
    this.close();
  }
};

RTCPeerConnection.prototype.updateRemoteSDP = function(newSDP){
  if(!newSDP){
    throw new Error("sdp string can't be empty.");
  } else {
    this.remoteSDP = newSDP;
  }
};

RTCPeerConnection.prototype.getRemoteSDP = function(){
  return this.remoteSDP;
};

RTCPeerConnection.prototype.setRemoteSessionDescription = function(type, remoteSessionDescription, callback){
  var desc = new RTCSessionDescription({sdp: remoteSessionDescription, type: type});

  function successCallback() {
    callback(null);
  }
  function errorCallback(error) {
    callback(error);
  }

  this.setRemoteDescription(desc, successCallback, errorCallback);
};

RTCPeerConnection.prototype.addLocalStream = function(localStream){
  if(localStream){
    this.addStream(localStream);
  } else {
    throw new Error("'RTCPeerConnection.addStream' error: stream is 'null'.");
  }
};

RTCPeerConnection.prototype.getAndSetLocalSessionDescription = function(callback) {
  var self = this;

  self.state = RTCPeerConnection.State.CONNECTING;

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

RTCPeerConnection.prototype.addCandidates = function(iceCandidates) {
  var candidate;

  for (var i = 0, len = iceCandidates.length; i < len; i++) {
    candidate = {
      sdpMLineIndex: iceCandidates[i].sdpMLineIndex,
      sdpMid: iceCandidates[i].sdpMid,
      candidate: iceCandidates[i].candidate
    };
    this.addIceCandidate(
      new RTCIceCandidate(candidate),
      function() {},
      function(error){
        Helpers.traceError("Error on 'addIceCandidate': " + error);
      }
    );
  }
};

RTCPeerConnection.prototype.toString = function sessionToString() {
  return 'sessionID: ' + this.sessionID + ', userID:  ' + this.userID + ', type: ' + this.type + ', state: ' + this.state;
};

/**
 * CALLBACKS
 */
RTCPeerConnection.prototype.onSignalingStateCallback = function() {
  if (this.signalingState === 'stable' && this.iceCandidates.length > 0){
    this.delegate.processIceCandidates(this, this.iceCandidates);
    this.iceCandidates.length = 0;
  }
};

RTCPeerConnection.prototype.onIceCandidateCallback = function(event) {
  var candidate = event.candidate;

  if (candidate) {
    /**
     * collecting internally the ice candidates
     * will send a bit later
     */
    var ICECandidate = {
      sdpMLineIndex: candidate.sdpMLineIndex,
      sdpMid: candidate.sdpMid,
      candidate: candidate.candidate
    };

    if(this.signalingState === 'stable'){
      this.delegate.processIceCandidates(this, [ICECandidate]);
    }else{
      this.iceCandidates.push(ICECandidate);
    }
  }
};

/** handler of remote media stream */
RTCPeerConnection.prototype.onAddRemoteStreamCallback = function(event) {
    var self = this;

    if (typeof this.delegate._onRemoteStreamListener === 'function'){
        this.delegate._onRemoteStreamListener(this.userID, event.stream);
    }
    self._getStatsWrap();
};

RTCPeerConnection.prototype.onIceConnectionStateCallback = function() {
  var newIceConnectionState = this.iceConnectionState;

  Helpers.trace("onIceConnectionStateCallback: " + this.iceConnectionState);

  /**
   * read more about all states:
   * http://w3c.github.io/webrtc-pc/#idl-def-RTCIceConnectionState
   * 'disconnected' happens in a case when a user has killed an application (for example, on iOS/Android via task manager).
   * So we should notify our user about it.
   */
  if(typeof this.delegate._onSessionConnectionStateChangedListener === 'function'){
  	var connectionState = null;

  	if (newIceConnectionState === 'checking'){
      this.state = RTCPeerConnection.State.CHECKING;
      connectionState = Helpers.SessionConnectionState.CONNECTING;
  	} else if (newIceConnectionState === 'connected'){
      this._clearWaitingReconnectTimer();
      this.state = RTCPeerConnection.State.CONNECTED;
      connectionState = Helpers.SessionConnectionState.CONNECTED;
  	} else if (newIceConnectionState === 'completed'){
      this._clearWaitingReconnectTimer();
      this.state = RTCPeerConnection.State.COMPLETED;
      connectionState = Helpers.SessionConnectionState.COMPLETED;
    } else if (newIceConnectionState === 'failed'){
      this.state = RTCPeerConnection.State.FAILED;
      connectionState = Helpers.SessionConnectionState.FAILED;
  	} else if (newIceConnectionState === 'disconnected'){
      this._startWaitingReconnectTimer();
      this.state = RTCPeerConnection.State.DISCONNECTED;
      connectionState = Helpers.SessionConnectionState.DISCONNECTED;
  	} else if (newIceConnectionState === 'closed') {
      this._clearWaitingReconnectTimer();
      this.state = RTCPeerConnection.State.CLOSED;
      connectionState = Helpers.SessionConnectionState.CLOSED;
  	}

  	if(connectionState){
      this.delegate._onSessionConnectionStateChangedListener(this.userID, connectionState);
    }
  }
};

/**
 * PRIVATE
 */
RTCPeerConnection.prototype._clearStatsReportTimer = function(){
   if(this.statsReportTimer){
     clearInterval(this.statsReportTimer);
     this.statsReportTimer = null;
   }
 };

RTCPeerConnection.prototype._getStatsWrap = function() {
    var self = this,
        selector = self.delegate.callType == 1 ? self.getLocalStreams()[0].getVideoTracks()[0] : self.getLocalStreams()[0].getAudioTracks()[0],
        statsReportInterval;

    if (config.webrtc && config.webrtc.statsReportTimeInterval) {
        if (isNaN(+config.webrtc.statsReportTimeInterval)) {
            Helpers.traceError('statsReportTimeInterval (' + config.webrtc.statsReportTimeInterval + ') must be integer.');
            return;
        }
        statsReportInterval = config.webrtc.statsReportTimeInterval * 1000;

        var _statsReportCallback = function() {
            _getStats(self, selector,
                function (results) {
                    self.delegate._onCallStatsReport(self.userID, results, null);
                },
                function errorLog(err) {
                    Helpers.traceError('_getStats error. ' + err.name + ': ' + err.message);
                    self.delegate._onCallStatsReport(self.userID, null, err);
                }
            );
        };

        Helpers.trace('Stats tracker has been started.');
        self.statsReportTimer = setInterval(_statsReportCallback, statsReportInterval);
    }
 };

RTCPeerConnection.prototype._clearWaitingReconnectTimer = function() {
  if(this.waitingReconnectTimeoutCallback){
    Helpers.trace('_clearWaitingReconnectTimer');
    clearTimeout(this.waitingReconnectTimeoutCallback);
    this.waitingReconnectTimeoutCallback = null;
  }
};

RTCPeerConnection.prototype._startWaitingReconnectTimer = function() {
  var self = this,
      timeout = config.webrtc.disconnectTimeInterval * 1000,
      waitingReconnectTimeoutCallback = function() {
        Helpers.trace('waitingReconnectTimeoutCallback');

        clearTimeout(self.waitingReconnectTimeoutCallback);

        self.release();

        self.delegate._closeSessionIfAllConnectionsClosed();
      };

  Helpers.trace('_startWaitingReconnectTimer, timeout: ' + timeout);

  self.waitingReconnectTimeoutCallback = setTimeout(waitingReconnectTimeoutCallback, timeout);
};

RTCPeerConnection.prototype._clearDialingTimer = function(){
  if(this.dialingTimer){
    Helpers.trace('_clearDialingTimer');

    clearInterval(this.dialingTimer);
    this.dialingTimer = null;
    this.answerTimeInterval = 0;
  }
};

RTCPeerConnection.prototype._startDialingTimer = function(extension, withOnNotAnswerCallback){
  var self = this;
  var dialingTimeInterval = config.webrtc.dialingTimeInterval*1000;

  Helpers.trace('_startDialingTimer, dialingTimeInterval: ' + dialingTimeInterval);

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

  self.dialingTimer = setInterval(_dialingCallback, dialingTimeInterval, extension, withOnNotAnswerCallback, false);

  // call for the 1st time
  _dialingCallback(extension, withOnNotAnswerCallback, true);
};

/**
 * PRIVATE
 */
function _getStats(peer, selector, successCallback, errorCallback) {
    peer.getStats(selector, function (res) {
        var items = [];
        res.forEach(function (result) {
            var item = {};
            item.id = result.id;
            item.type = result.type;
            item.timestamp = result.timestamp;
            items.push(item);
        });
        successCallback(items);
    }, errorCallback);
}

module.exports = RTCPeerConnection;
