/*
 * QuickBlox JavaScript SDK
 *
 * WebRTC Module (WebRTC session model)
 *
 */

 /*
  * User's callbacks (listener-functions):
  * - onUserNotAnswerListener(session, userID)
  * - onRemoteStreamListener(session, userID, stream)
  * - onSessionConnectionStateChangedListener(session, userID, connectionState)
  * - onSessionCloseListener(session)
  */


// Modules
//
var config = require('../../qbConfig');
var RTCPeerConnection = require('./qbRTCPeerConnection');
var Utils = require('../../qbUtils');
var Helpers = require('./qbWebRTCHelpers');
var SignalingConstants = require('./qbWebRTCSignalingConstants');


/**
 * State of a session
 */
WebRTCSession.State = {
  NEW: 1,
  ACTIVE: 2,
  HUNGUP: 3,
  REJECTED: 4,
  CLOSED: 5
};


/**
 * Creates a session
 * @param {number} An ID if the call's initiator
 * @param {array} An array with opponents
 * @param {enum} Type of a call
 */
function WebRTCSession(sessionID, initiatorID, opIDs, callType, signalingProvider, currentUserID) {
  this.ID = (sessionID == null ? generateUUID() : sessionID);
  this.state = WebRTCSession.State.NEW;
  //
  this.initiatorID = parseInt(initiatorID);
  this.opponentsIDs = opIDs;
  this.callType = parseInt(callType);
  //
  this.peerConnections = {};

  this.localStream = null;

  this.signalingProvider = signalingProvider;

  this.currentUserID = currentUserID;

  // we use this timeout to fix next issue:
  // "From Android/iOS make a call to Web and kill the Android/iOS app instantly. Web accept/reject popup will be still visible.
  // We need a way to hide it if sach situation happened."
  //
  this.answerTimer = null;
}

/**
 * Gete the user media stream
 * @param {map} A map media stream constrains
 * @param {function} A callback to get a result of the function
 */
WebRTCSession.prototype.getUserMedia = function(params, callback) {
  var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
  if (!getUserMedia) {
    throw new Error('getUserMedia() is not supported in your browser');
  }
  getUserMedia = getUserMedia.bind(navigator);

  var self = this;

  // Additional parameters for Media Constraints
  // http://tools.ietf.org/html/draft-alvestrand-constraints-resolution-00
  /**********************************************
   * googEchoCancellation: true
   * googAutoGainControl: true
   * googNoiseSuppression: true
   * googHighpassFilter: true
   * minWidth: 640
   * minHeight: 480
   * maxWidth: 1280
   * maxHeight: 720
   * minFrameRate: 60
   * maxAspectRatio: 1.333
  **********************************************/
  getUserMedia(
    {
      audio: params.audio || false,
      video: params.video || false

    },function(stream) {
      // save local stream
      self.localStream = stream;

      if (params.elemId){
        self.attachMediaStream(params.elemId, stream, params.options);
      }
      callback(null, stream);

    },function(err) {
      callback(err, null);
    }
  );
};

/**
 * Attach media stream to audio/video element
 * @param {string} The Id of an ellement to attach a stream
 * @param {Object} The steram to attach
 * @param {map} The additional options
 */
WebRTCSession.prototype.attachMediaStream = function(id, stream, options) {
  var elem = document.getElementById(id);
  if (elem) {
    var URL = window.URL || window.webkitURL;
    elem.src = URL.createObjectURL(stream);
    if (options && options.muted) elem.muted = true;
    if (options && options.mirror) {
      elem.style.webkitTransform = 'scaleX(-1)';
      elem.style.transform = 'scaleX(-1)';
    }
    elem.play();
  }
};

/**
 * Gets the state of connection
 * @param {number} The User Id
 */
WebRTCSession.prototype.connectionStateForUser = function(userID){
  var peerConnection = this.peerConnections[userID];
  if(peerConnection){
    return peerConnection.state;
  }
  return null;
}

/**
 * Detach media stream from audio/video element
 * @param {string} The Id of an ellement to detach a stream
 */
WebRTCSession.prototype.detachMediaStream = function(id){
  var elem = document.getElementById(id);
  if (elem) {
    elem.pause();
    elem.src = "";
  }
}

/**
 * Initiate a call
 * @param {array} A map with custom parameters
 */
WebRTCSession.prototype.call = function(extension) {
  var self = this,
      ext = _prepareExtension(extension);

  Helpers.trace('Call, extension: ' + JSON.stringify(ext));

  self.state = WebRTCSession.State.ACTIVE;

  // create a peer connection for each opponent
  self.opponentsIDs.forEach(function(userID, i, arr) {
    self._callInternal(userID, ext);
  });
};

WebRTCSession.prototype._callInternal = function(userID, extension) {

  var peer = this._createPeer(userID, 'offer');
  peer.addLocalStream(this.localStream);
  this.peerConnections[userID] = peer;

  peer.getAndSetLocalSessionDescription(function(err) {
    if (err) {
      Helpers.trace("getAndSetLocalSessionDescription error: " + err);
    } else {
      Helpers.trace("getAndSetLocalSessionDescription success");
      // let's send call requests to user
      //
      peer._startDialingTimer(extension);
    }
  });
}

/**
 * Accept a call
 * @param {array} A map with custom parameters
 */
WebRTCSession.prototype.accept = function(extension) {
  var self = this,
      ext = _prepareExtension(extension);

  Helpers.trace('Accept, extension: ' + JSON.stringify(ext));

  self.state = WebRTCSession.State.ACTIVE;

  self._clearAnswerTimer();

  self._acceptInternal(self.initiatorID, ext);

  // The group call logic starts here
  var oppIDs = self._uniqueOpponentsIDsWithoutInitiator();

  if(oppIDs.length > 0){
    // here we have to decide to which users the user should call.
    // We have a rule: If a userID1 > userID2 then a userID1 should call to userID2.
    //
    oppIDs.forEach(function(opID, i, arr) {
      if(self.currentUserID > opID){
        // call to the user
        self._callInternal(opID, {});
      }
    });
  }
};

WebRTCSession.prototype._acceptInternal = function(userID, extension) {
  var self = this;

  // create a peer connection
  //
  var peerConnection = this.peerConnections[userID];
  if(peerConnection){
    peerConnection.addLocalStream(this.localStream);

    peerConnection.setRemoteSessionDescription('offer', peerConnection.sdp, function(error){
      if(error){
        Helpers.traceError("'setRemoteSessionDescription' error: " + error);
      }else{
        Helpers.trace("'setRemoteSessionDescription' success");

        peerConnection.getAndSetLocalSessionDescription(function(err) {
          if (err) {
            Helpers.trace("getAndSetLocalSessionDescription error: " + err);
          } else {

            extension["sessionID"] = self.ID;
            extension["callType"] = self.callType;
            extension["callerID"] = self.initiatorID;
            extension["opponentsIDs"] = self.opponentsIDs;
            extension["sdp"] = peerConnection.localDescription.sdp;

            self.signalingProvider.sendMessage(userID, extension, SignalingConstants.SignalingType.ACCEPT);
          }
        });
      }
    });
  }else{
    Helpers.traceError("Can't accept the call, there is no information about peer connection by some reason.");
  }
};

/**
 * Reject a call
 * @param {array} A map with custom parameters
 */
WebRTCSession.prototype.reject = function(extension) {
  var self = this,
      ext = _prepareExtension(extension);

  Helpers.trace('Reject, extension: ' + JSON.stringify(ext));

  self.state = WebRTCSession.State.REJECTED;

  self._clearAnswerTimer();

  ext["sessionID"] = self.ID;
  ext["callType"] = self.callType;
  ext["callerID"] = self.initiatorID;
  ext["opponentsIDs"] = self.opponentsIDs;

  var peersLen = Object.keys(self.peerConnections).length;
  if(peersLen > 0){
    for (var key in self.peerConnections) {
      var peerConnection = self.peerConnections[key];
      self.signalingProvider.sendMessage(peerConnection.userID, ext, SignalingConstants.SignalingType.REJECT);
    }
  }

  self._close();
};

/**
 * Stop a call
 * @param {array} A map with custom parameters
 */
WebRTCSession.prototype.stop = function(extension) {
  var self = this,
      ext = _prepareExtension(extension);

  Helpers.trace('Stop, extension: ' + JSON.stringify(ext));

  self.state = WebRTCSession.State.HUNGUP;

  self._clearAnswerTimer();

  ext["sessionID"] = self.ID;
  ext["callType"] = self.callType;
  ext["callerID"] = self.initiatorID;
  ext["opponentsIDs"] = self.opponentsIDs;

  var peersLen = Object.keys(self.peerConnections).length;
  if(peersLen > 0){
    for (var key in self.peerConnections) {
      var peerConnection = self.peerConnections[key];
      self.signalingProvider.sendMessage(peerConnection.userID, ext, SignalingConstants.SignalingType.STOP);
    }
  }

  self._close();
};

/**
 * Update a call
 * @param {array} A map with custom parameters
 */
WebRTCSession.prototype.update = function(extension) {
  var self = this,
      ext = {};

  Helpers.trace('Update, extension: ' + JSON.stringify(extension));

  if(extension == null){
    Helpers.trace("extension is null, no parameters to update");
    return;
  }

  ext = _prepareExtension(extension);

  for (var key in self.peerConnections) {
    var peerConnection = self.peerConnections[key];

    self.signalingProvider.sendMessage(peerConnection.userID, ext, SignalingConstants.SignalingType.PARAMETERS_CHANGED);
  }
}


/**
 * Mutes the stream
 * @param {string} what to mute: 'audio' or 'video'
 */
WebRTCSession.prototype.mute = function(type) {
  this._muteStream(0, type);
};

/**
 * Unmutes the stream
 * @param {string} what to unmute: 'audio' or 'video'
 */
WebRTCSession.prototype.unmute = function(type) {
  this._muteStream(1, type);
};

/**
 * Creates a snapshot
 * @param {string} Id of element to make a shapshot from
 */
WebRTCSession.snapshot = function(id) {
  var video = document.getElementById(id),
      canvas = document.createElement('canvas'),
      context = canvas.getContext('2d'),
      dataURL, blob;

  if (video) {
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;
    if (video.style.transform === 'scaleX(-1)') {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }
    context.drawImage(video, 0, 0, video.clientWidth, video.clientHeight);
    dataURL = canvas.toDataURL();

    blob = Helpers.dataURItoBlob(dataURL, 'image/png');
    blob.name = 'snapshot_' + getLocalTime() + '.png';
    blob.url = dataURL;

    return blob;
  }
};

/**
 * Adds the CSS filters to video stream http://css-tricks.com/almanac/properties/f/filter/
 * @param {string} Id of element to apply filters to
 * @param {string} Filters string
 */
WebRTCSession.filter = function(id, filters) {
  var video = document.getElementById(id);
  if (video) {
    video.style.webkitFilter = filters;
    video.style.filter = filters;
  }
};


//
///////////////////////// Delegates (rtc client)  /////////////////////////
//

WebRTCSession.prototype.processOnCall = function(callerID, extension) {
  var self = this;

  var oppIDs = this._uniqueOpponentsIDs();
  oppIDs.forEach(function(opID, i, arr) {

    var peerConnection = self.peerConnections[opID];
    if(peerConnection){

      if(opID == callerID){
        peerConnection.updateSDP(extension.sdp);
      }

      // The group call logic starts here
      if(callerID != self.initiatorID && self.state === WebRTCSession.State.ACTIVE){
        self._acceptInternal(callerID, {});
      }

    }else{

      // create peer connections for each opponent
      var peerConnection;
      if(opID != callerID && self.currentUserID > opID){
        peerConnection = self._createPeer(opID, 'offer');
      }else{
        peerConnection = self._createPeer(opID, 'answer');
      }
      self.peerConnections[opID] = peerConnection;

      if(opID == callerID){
        peerConnection.updateSDP(extension.sdp);
        self._startAnswerTimer();
      }
    }
  });
}

WebRTCSession.prototype.processOnAccept = function(userID, extension) {
  var peerConnection = this.peerConnections[userID];
  if(peerConnection){
    peerConnection._clearDialingTimer();
    peerConnection.setRemoteSessionDescription('answer', extension.sdp, function(error){
      if(error){
        Helpers.traceError("'setRemoteSessionDescription' error: " + error);
      }else{
        Helpers.trace("'setRemoteSessionDescription' success");
      }
    });
  }else{
    Helpers.traceError("Ignore 'OnAccept', there is no information about peer connection by some reason.");
  }
}

WebRTCSession.prototype.processOnReject = function(userID, extension) {
  var peerConnection = this.peerConnections[userID];
  if(peerConnection){
    peerConnection._clearDialingTimer();
    peerConnection.release();
  }else{
    Helpers.traceError("Ignore 'OnReject', there is no information about peer connection by some reason.");
  }
  this._closeSessionIfAllConnectionsClosed();
}

WebRTCSession.prototype.processOnStop = function(userID, extension) {
  var self = this;

  /**
   * Check whether there is an active call
   * If answerTimer === null it's means that we have active call
   */
  if(self.answerTimer === null ) {
    self.peerConnections[userID]._clearDialingTimer();
    self.peerConnections[userID].release();
  } else {
    /* No one doesn't take a call */
    if( Object.keys(self.peerConnections).length ) {
      Object.keys(self.peerConnections).forEach(function(key) {
        self.peerConnections[key]._clearDialingTimer();
        self.peerConnections[key].release();
      });
    } else {
      Helpers.traceError("Ignore 'OnStop', there is no information about peer connection by some reason.");
    }
  }

  this._closeSessionIfAllConnectionsClosed();
}

WebRTCSession.prototype.processOnIceCandidates = function(userID, extension) {
  var peerConnection = this.peerConnections[userID];
  if(peerConnection){
    peerConnection.addCandidates(extension.iceCandidates);
  }else{
    Helpers.traceError("Ignore 'OnIceCandidates', there is no information about peer connection by some reason.");
  }
}

WebRTCSession.prototype.processOnUpdate = function(userID, extension) {

}


//
///////////
//


WebRTCSession.prototype.processCall = function(peerConnection, extension) {
  var extension = extension || {};

  extension["sessionID"] = this.ID;
  extension["callType"] = this.callType;
  extension["callerID"] = this.initiatorID;
  extension["opponentsIDs"] = this.opponentsIDs;
  extension["sdp"] = peerConnection.localDescription.sdp;

  this.signalingProvider.sendMessage(peerConnection.userID, extension, SignalingConstants.SignalingType.CALL);
}

WebRTCSession.prototype.processIceCandidates = function(peerConnection, iceCandidates) {
  var extension = {};
  extension["sessionID"] = this.ID;
  extension["callType"] = this.callType;
  extension["callerID"] = this.initiatorID;
  extension["opponentsIDs"] = this.opponentsIDs;

  this.signalingProvider.sendCandidate(peerConnection.userID, iceCandidates, extension);
}

WebRTCSession.prototype.processOnNotAnswer = function(peerConnection) {
  Helpers.trace("Answer timeout callback for session " + this.ID + " for user " + peerConnection.userID);

  peerConnection.release();

  if(typeof this.onUserNotAnswerListener === 'function'){
    this.onUserNotAnswerListener(this, peerConnection.userID);
  }

  this._closeSessionIfAllConnectionsClosed();
}


//
///////////////////////// Delegates (peer connection)  /////////////////////////
//


WebRTCSession.prototype._onRemoteStreamListener = function(userID, stream) {
  if (typeof this.onRemoteStreamListener === 'function'){
    this.onRemoteStreamListener(this, userID, stream);
  }
};

WebRTCSession.prototype._onSessionConnectionStateChangedListener = function(userID, connectionState) {

  if (typeof this.onSessionConnectionStateChangedListener === 'function'){
    this.onSessionConnectionStateChangedListener(this, userID, connectionState);
  }

  if (connectionState === Helpers.SessionConnectionState.CLOSED){
    //peer = null;
  }
}

//
//////////////////////////////////// Private ///////////////////////////////////
//


WebRTCSession.prototype._createPeer = function(userID, peerConnectionType) {
  Helpers.trace("_createPeer");

  if (!RTCPeerConnection) throw new Error('RTCPeerConnection() is not supported in your browser');

  // Additional parameters for RTCPeerConnection options
  // new RTCPeerConnection(pcConfig, options)
  /**********************************************
   * DtlsSrtpKeyAgreement: true
   * RtpDataChannels: true
  **********************************************/
  var pcConfig = {
    iceServers: config.webrtc.iceServers
  };

  var peer = new RTCPeerConnection(pcConfig);
  peer.init(this, userID, this.ID, peerConnectionType);

  return peer;
};

// close peer connection and local stream
WebRTCSession.prototype._close = function() {
  Helpers.trace("_close");

  for (var key in this.peerConnections) {
    var peer = this.peerConnections[key];
    peer.release();
  }

  this._closeLocalMediaStream();

  this.state = WebRTCSession.State.CLOSED;

  if(typeof this.onSessionCloseListener === 'function'){
    this.onSessionCloseListener(this);
  }
};

WebRTCSession.prototype._closeSessionIfAllConnectionsClosed = function (){
  // check if all connections are closed
  //
  var isAllConnectionsClosed = true;

  for (var key in this.peerConnections) {
    var peerCon = this.peerConnections[key];

    if(peerCon.signalingState !== 'closed'){
      isAllConnectionsClosed = false;
      break;
    }
  }

  Helpers.trace("All peer connections closed: " + isAllConnectionsClosed);

  if(isAllConnectionsClosed){
    this._closeLocalMediaStream();

    if(typeof this.onSessionCloseListener === 'function'){
      this.onSessionCloseListener(this);
    }

    this.state = WebRTCSession.State.CLOSED;
  }
}

WebRTCSession.prototype._closeLocalMediaStream = function(){
  // https://developers.google.com/web/updates/2015/07/mediastream-deprecations?hl=en
  if (this.localStream) {
    this.localStream.getAudioTracks().forEach(function (audioTrack) {
      audioTrack.stop();
    });
    this.localStream.getVideoTracks().forEach(function (videoTrack) {
      videoTrack.stop();
    });
    this.localStream = null;
  }
}

WebRTCSession.prototype._muteStream = function(bool, type) {
  if (type === 'audio' && this.localStream.getAudioTracks().length > 0) {
    this.localStream.getAudioTracks().forEach(function (track) {
      track.enabled = !!bool;
    });
    return;
  }

  if (type === 'video' && this.localStream.getVideoTracks().length > 0) {
    this.localStream.getVideoTracks().forEach(function (track) {
      track.enabled = !!bool;
    });
    return;
  }
};

WebRTCSession.prototype._clearAnswerTimer = function(){
  Helpers.trace("_clearAnswerTimer");

  if(this.answerTimer){
    clearTimeout(this.answerTimer);
    this.answerTimer = null;
  }
}

WebRTCSession.prototype._startAnswerTimer = function(){
  Helpers.trace("_startAnswerTimer");

  var self = this;
  var answerTimeoutCallback = function (){
    Helpers.trace("_answerTimeoutCallback");

    if(typeof self.onSessionCloseListener === 'function'){
      self.onSessionCloseListener(self);
    }

    self.answerTimer = null;
  };

  var answerTimeInterval = config.webrtc.answerTimeInterval*1000;
  this.answerTimer = setTimeout(answerTimeoutCallback, answerTimeInterval);
}

WebRTCSession.prototype._uniqueOpponentsIDs = function(){
  var self = this;
  var opponents = [];
  if(this.initiatorID !== this.currentUserID){
    opponents.push(this.initiatorID);
  }
  this.opponentsIDs.forEach(function(userID, i, arr) {
    if(userID != self.currentUserID){
      opponents.push(parseInt(userID));
    }
  });
  return opponents;
}

WebRTCSession.prototype._uniqueOpponentsIDsWithoutInitiator = function(){
  var self = this;
  var opponents = [];
  this.opponentsIDs.forEach(function(userID, i, arr) {
    if(userID != self.currentUserID){
      opponents.push(parseInt(userID));
    }
  });
  return opponents;
}

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

/**
 * private _prepareExtension - replace property null to empty string
 * return object with property or empty if extension didn't set
 */
function _prepareExtension(extension) {
  try {
    return JSON.parse( JSON.stringify(extension).replace(/null/g, "\"\"") );
  } catch (err) {
    return {};
  }
}

module.exports = WebRTCSession;
