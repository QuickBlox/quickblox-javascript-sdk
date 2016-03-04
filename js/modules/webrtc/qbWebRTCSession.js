/**
 * QuickBlox JavaScript SDK
 * WebRTC Module (WebRTC session model)
 */

/**
 * User's callbacks (listener-functions):
 * - onUserNotAnswerListener(session, userID)
 * - onRemoteStreamListener(session, userID, stream)
 * - onSessionConnectionStateChangedListener(session, userID, connectionState)
 * - onSessionCloseListener(session)
 * - onCallStatsReport(session, userId, stats)
 */

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
  this.ID = sessionID ? sessionID : generateUUID();
  this.state = WebRTCSession.State.NEW;

  this.initiatorID = parseInt(initiatorID);
  this.opponentsIDs = opIDs;
  this.callType = parseInt(callType);

  this.peerConnections = {};

  this.localStream = null;

  this.signalingProvider = signalingProvider;

  this.currentUserID = currentUserID;

  /**
   * we use this timeout to fix next issue:
   * "From Android/iOS make a call to Web and kill the Android/iOS app instantly. Web accept/reject popup will be still visible.
   * We need a way to hide it if sach situation happened."
   */
  this.answerTimer = null;

  this.startCallTime = 0;
  this.acceptCallTime = 0;
}

/**
 * Get the user media stream
 * @param {map} A map media stream constrains
 * @param {function} A callback to get a result of the function
 */
WebRTCSession.prototype.getUserMedia = function(params, callback) {
  var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  if(!getUserMedia) {
    throw new Error('getUserMedia() is not supported in your browser');
  }

  getUserMedia = getUserMedia.bind(navigator);

  var self = this;

  /**
   * Additional parameters for Media Constraints
   * http://tools.ietf.org/html/draft-alvestrand-constraints-resolution-00
   *
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
   */

  getUserMedia(
    {
      audio: params.audio || false,
      video: params.video || false

    },function(stream) {
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
 * @param {object} The steram to attach
 * @param {object} The additional options
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
  } else {
    throw new Error('Unable to attach media stream, element ' + id  + ' is undefined');
  }
};

/**
 * Get the state of connection
 * @param {number} The User Id
 */
WebRTCSession.prototype.connectionStateForUser = function(userID){
  var peerConnection = this.peerConnections[userID];

  if(peerConnection){
    return peerConnection.state;
  }

  return null;
};

/**
 * Detach media stream from audio/video element
 * @param {string} The Id of an element to detach a stream
 */
WebRTCSession.prototype.detachMediaStream = function(id){
  var elem = document.getElementById(id);

  if (elem) {
    elem.pause();
    elem.src = "";
  }
};

/**
 * [Initiate a call]
 * @param  {object}   extension [custom parametrs]
 * @param  {Function} callback
 */
WebRTCSession.prototype.call = function(extension, callback) {
  var self = this,
      ext = _prepareExtension(extension),
      isOnlineline = window.navigator.onLine,
      error = null;

  Helpers.trace('Call, extension: ' + JSON.stringify(ext));

  if(isOnlineline) {
    self.state = WebRTCSession.State.ACTIVE;

    // create a peer connection for each opponent
    self.opponentsIDs.forEach(function(userID, i, arr) {
      self._callInternal(userID, ext, true);
    });
  } else {
    self.state = WebRTCSession.State.CLOSED;
    error = Utils.getError(408, 'Call.ERROR - ERR_INTERNET_DISCONNECTED');
  }

  if (typeof callback === 'function') {
    callback(error);
  }
};

WebRTCSession.prototype._callInternal = function(userID, extension, withOnNotAnswerCallback) {
  var peer = this._createPeer(userID, 'offer');

  peer.addLocalStream(this.localStream);
  this.peerConnections[userID] = peer;

  peer.getAndSetLocalSessionDescription(function(err) {
    if (err) {
      Helpers.trace("getAndSetLocalSessionDescription error: " + err);
    } else {
      Helpers.trace("getAndSetLocalSessionDescription success");
      /** let's send call requests to user */
      peer._startDialingTimer(extension, withOnNotAnswerCallback);
    }
  });
};

/**
 * Accept a call
 * @param {array} A map with custom parameters
 */
WebRTCSession.prototype.accept = function(extension) {
  var self = this,
      ext = _prepareExtension(extension);

  Helpers.trace('Accept, extension: ' + JSON.stringify(ext));

  if(self.state === WebRTCSession.State.ACTIVE) {
    Helpers.traceError("Can't accept, the session is already active, return.");
    return;
  }

  if(self.state === WebRTCSession.State.CLOSED) {
    Helpers.traceError("Can't accept, the session is already closed, return.");
    self.stop({});
    return;
  }

  self.state = WebRTCSession.State.ACTIVE;

  self.acceptCallTime = new Date();

  self._clearAnswerTimer();

  self._acceptInternal(self.initiatorID, ext);

  /** The group call logic starts here */
  var oppIDs = self._uniqueOpponentsIDsWithoutInitiator();

  /** in a case of group video chat */
  if(oppIDs.length > 0){

    var offerTime = (self.acceptCallTime - self.startCallTime) / 1000;
    self._startWaitingOfferOrAnswerTimer(offerTime);

    /**
     * here we have to decide to which users the user should call.
     * We have a rule: If a userID1 > userID2 then a userID1 should call to userID2.
     */
    oppIDs.forEach(function(opID, i, arr) {
      if(self.currentUserID > opID){
        /** call to the user */
        self._callInternal(opID, {}, true);
      }
    });
  }
};

WebRTCSession.prototype._acceptInternal = function(userID, extension) {
  var self = this;

  /** create a peer connection */
  var peerConnection = this.peerConnections[userID];

  if(peerConnection){
    peerConnection.addLocalStream(this.localStream);

    peerConnection.setRemoteSessionDescription('offer', peerConnection.getRemoteSDP(), function(error){
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
  var peersLen = Object.keys(self.peerConnections).length;

  Helpers.trace('Reject, extension: ' + JSON.stringify(ext));

  self.state = WebRTCSession.State.REJECTED;

  self._clearAnswerTimer();

  ext["sessionID"] = self.ID;
  ext["callType"] = self.callType;
  ext["callerID"] = self.initiatorID;
  ext["opponentsIDs"] = self.opponentsIDs;

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
  var peersLen = Object.keys(self.peerConnections).length;

  Helpers.trace('Stop, extension: ' + JSON.stringify(ext));

  self.state = WebRTCSession.State.HUNGUP;

  self._clearAnswerTimer();

  ext["sessionID"] = self.ID;
  ext["callType"] = self.callType;
  ext["callerID"] = self.initiatorID;
  ext["opponentsIDs"] = self.opponentsIDs;

  if(peersLen > 0){
    for (var key in self.peerConnections) {
      var peerConnection = self.peerConnections[key];
      self.signalingProvider.sendMessage(peerConnection.userID, ext, SignalingConstants.SignalingType.STOP);
    }
  }

  self._close();
};

/**
 * [function close connection with user]
 * @param  {[type]} userId [id of user]
 */
WebRTCSession.prototype.closeConnection = function(userId) {
  var self = this,
    peer = this.peerConnections[userId];

  if(peer) {
    peer.release();

    self._closeSessionIfAllConnectionsClosed();
  } else {
    Helpers.traceWarn('Not found connection with user (' + userId + ')');
  }
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
  ext.sessionID = this.ID;

  for (var key in self.peerConnections) {
    var peerConnection = self.peerConnections[key];

    self.signalingProvider.sendMessage(peerConnection.userID, ext, SignalingConstants.SignalingType.PARAMETERS_CHANGED);
  }
};

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

/**
 * DELEGATES (rtc client)
 */
WebRTCSession.prototype.processOnCall = function(callerID, extension) {
  var self = this,
      oppIDs = self._uniqueOpponentsIDs();

  oppIDs.forEach(function(opID, i, arr) {
    var pConn = self.peerConnections[opID];

    if(pConn){
      if(opID == callerID){
        pConn.updateRemoteSDP(extension.sdp);

        /** The group call logic starts here */
        if(callerID != self.initiatorID && self.state === WebRTCSession.State.ACTIVE){
          self._acceptInternal(callerID, {});
        }
      }
    } else {
      /** create peer connections for each opponent */
      var peerConnection;
      if(opID != callerID && self.currentUserID > opID){
        peerConnection = self._createPeer(opID, 'offer');
      }else{
        peerConnection = self._createPeer(opID, 'answer');
      }

      self.peerConnections[opID] = peerConnection;

      if(opID == callerID){
        peerConnection.updateRemoteSDP(extension.sdp);
        self._startAnswerTimer();
      }
    }
  });
};

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
};

WebRTCSession.prototype.processOnReject = function(userID, extension) {
  var peerConnection = this.peerConnections[userID];

  this._clearWaitingOfferOrAnswerTimer();

  if(peerConnection){
    peerConnection.release();
  }else{
    Helpers.traceError("Ignore 'OnReject', there is no information about peer connection by some reason.");
  }

  this._closeSessionIfAllConnectionsClosed();
};

WebRTCSession.prototype.processOnStop = function(userID, extension) {
  var self = this;

  this._clearAnswerTimer();

  /** drop the call if the initiator did it */
  if (userID === self.initiatorID) {
    if( Object.keys(self.peerConnections).length ) {
      Object.keys(self.peerConnections).forEach(function(key) {
        self.peerConnections[key].release();
      });
    } else {
      Helpers.traceError("Ignore 'OnStop', there is no information about peer connections by some reason.");
    }
  } else {
    var pc = self.peerConnections[userID];
    if(pc){
      pc.release();
    }else{
      Helpers.traceError("Ignore 'OnStop', there is no information about peer connection by some reason.");
    }
  }

  this._closeSessionIfAllConnectionsClosed();
};

WebRTCSession.prototype.processOnIceCandidates = function(userID, extension) {
  var peerConnection = this.peerConnections[userID];

  if(peerConnection){
    peerConnection.addCandidates(extension.iceCandidates);
  }else{
    Helpers.traceError("Ignore 'OnIceCandidates', there is no information about peer connection by some reason.");
  }
};

WebRTCSession.prototype.processCall = function(peerConnection, extension) {
  var extension = extension || {};

  extension["sessionID"] = this.ID;
  extension["callType"] = this.callType;
  extension["callerID"] = this.initiatorID;
  extension["opponentsIDs"] = this.opponentsIDs;
  extension["sdp"] = peerConnection.localDescription.sdp;

  this.signalingProvider.sendMessage(peerConnection.userID, extension, SignalingConstants.SignalingType.CALL);
};

WebRTCSession.prototype.processIceCandidates = function(peerConnection, iceCandidates) {
  var extension = {};
  extension["sessionID"] = this.ID;
  extension["callType"] = this.callType;
  extension["callerID"] = this.initiatorID;
  extension["opponentsIDs"] = this.opponentsIDs;

  this.signalingProvider.sendCandidate(peerConnection.userID, iceCandidates, extension);
};

WebRTCSession.prototype.processOnNotAnswer = function(peerConnection) {
  Helpers.trace("Answer timeout callback for session " + this.ID + " for user " + peerConnection.userID);

  this._clearWaitingOfferOrAnswerTimer();

  peerConnection.release();

  if(typeof this.onUserNotAnswerListener === 'function'){
    Utils.safeCallbackCall(this.onUserNotAnswerListener, this, peerConnection.userID);
  }

  this._closeSessionIfAllConnectionsClosed();
};

/**
 * DELEGATES (peer connection)
 */
WebRTCSession.prototype._onRemoteStreamListener = function(userID, stream) {
  if (typeof this.onRemoteStreamListener === 'function'){
    Utils.safeCallbackCall(this.onRemoteStreamListener, this, userID, stream);
  }
};

WebRTCSession.prototype._onCallStatsReport = function(userId, stats) {
  if (typeof this.onCallStatsReport === 'function'){
    Utils.safeCallbackCall(this.onCallStatsReport, this, userId, stats);
  }
};

WebRTCSession.prototype._onSessionConnectionStateChangedListener = function(userID, connectionState) {
  var self = this;

  if (typeof self.onSessionConnectionStateChangedListener === 'function'){
      Utils.safeCallbackCall(self.onSessionConnectionStateChangedListener, self, userID, connectionState);
  }
};

/**
 * Private
 */
WebRTCSession.prototype._createPeer = function(userID, peerConnectionType) {
  if (!RTCPeerConnection) throw new Error('_createPeer error: RTCPeerConnection() is not supported in your browser');

  this.startCallTime = new Date();

  /**
   * Additional parameters for RTCPeerConnection options
   * new RTCPeerConnection(pcConfig, options)
   *
   * DtlsSrtpKeyAgreement: true
   * RtpDataChannels: true
   */
  var pcConfig = {
    iceServers: _prepareIceServers(config.webrtc.iceServers)
  };

  Helpers.trace("_createPeer, iceServers: " + JSON.stringify(pcConfig));

  var peer = new RTCPeerConnection(pcConfig);
  peer.init(this, userID, this.ID, peerConnectionType);

  return peer;
};

/** close peer connection and local stream */
WebRTCSession.prototype._close = function() {
  Helpers.trace("_close");

  for (var key in this.peerConnections) {
    var peer = this.peerConnections[key];
    peer.release();
  }

  this._closeLocalMediaStream();

  this.state = WebRTCSession.State.CLOSED;

  if(typeof this.onSessionCloseListener === 'function'){
    Utils.safeCallbackCall(this.onSessionCloseListener, this);
  }
};

WebRTCSession.prototype._closeSessionIfAllConnectionsClosed = function (){
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
};

WebRTCSession.prototype._closeLocalMediaStream = function(){
  /**
   * https://developers.google.com/web/updates/2015/07/mediastream-deprecations?hl=en
   */
  if (this.localStream) {
    this.localStream.getAudioTracks().forEach(function (audioTrack) {
      audioTrack.stop();
    });

    this.localStream.getVideoTracks().forEach(function (videoTrack) {
      videoTrack.stop();
    });

    this.localStream = null;
  }
};

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
  if(this.answerTimer){
    Helpers.trace("_clearAnswerTimer");
    clearTimeout(this.answerTimer);
    this.answerTimer = null;
  }
};

WebRTCSession.prototype._startAnswerTimer = function(){
  Helpers.trace("_startAnswerTimer");

  var self = this;
  var answerTimeoutCallback = function (){
    Helpers.trace("_answerTimeoutCallback");

    if(typeof self.onSessionCloseListener === 'function'){
      self._close();
    }

    self.answerTimer = null;
  };

  var answerTimeInterval = config.webrtc.answerTimeInterval*1000;
  this.answerTimer = setTimeout(answerTimeoutCallback, answerTimeInterval);
};

WebRTCSession.prototype._clearWaitingOfferOrAnswerTimer = function() {
  if(this.waitingOfferOrAnswerTimer){
    Helpers.trace("_clearWaitingOfferOrAnswerTimer");
    clearTimeout(this.waitingOfferOrAnswerTimer);
    this.waitingOfferOrAnswerTimer = null;
  }
};

WebRTCSession.prototype._startWaitingOfferOrAnswerTimer = function(time) {
  var self = this,
      timeout = (config.webrtc.answerTimeInterval - time) < 0 ? 1 : config.webrtc.answerTimeInterval - time,
      waitingOfferOrAnswerTimeoutCallback = function() {
        Helpers.trace("waitingOfferOrAnswerTimeoutCallback");

        if(Object.keys(self.peerConnections).length > 0) {
          Object.keys(self.peerConnections).forEach(function(key) {
            var peerConnection = self.peerConnections[key];
            if(peerConnection.state === RTCPeerConnection.State.CONNECTING || peerConnection.state === RTCPeerConnection.State.NEW) {
              self.processOnNotAnswer(peerConnection);
            }
          });
        }

        self.waitingOfferOrAnswerTimer = null;
      };

  Helpers.trace("_startWaitingOfferOrAnswerTimer, timeout: " + timeout);

  this.waitingOfferOrAnswerTimer = setTimeout(waitingOfferOrAnswerTimeoutCallback, timeout*1000);
};

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
};

WebRTCSession.prototype._uniqueOpponentsIDsWithoutInitiator = function(){
  var self = this;
  var opponents = [];

  this.opponentsIDs.forEach(function(userID, i, arr) {
    if(userID != self.currentUserID){
      opponents.push(parseInt(userID));
    }
  });

  return opponents;
};

WebRTCSession.prototype.toString = function sessionToString() {
  return 'ID: ' + this.ID + ', initiatorID:  ' + this.initiatorID + ', opponentsIDs: ' + this.opponentsIDs + ', state: ' + this.state + ", callType: " + this.callType;
};

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

function _prepareIceServers(iceServers) {
  var  iceServersCopy = JSON.parse(JSON.stringify(iceServers));

  Object.keys(iceServersCopy).forEach(function(c, i, a) {
    if(iceServersCopy[i].hasOwnProperty('url')) {
      iceServersCopy[i].urls = iceServersCopy[i].url;
    } else {
      iceServersCopy[i].url = iceServersCopy[i].urls;
    }
  });

  return iceServersCopy;
}

module.exports = WebRTCSession;
