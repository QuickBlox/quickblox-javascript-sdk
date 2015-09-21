/*
 * QuickBlox JavaScript SDK
 *
 * WebRTC Module
 *
 */

/*
 * User's callbacks (listener-functions):
 * - onCallListener
 * - onAcceptCallListener
 * - onRejectCallListener
 * - onStopCallListener
 * - onUpdateCallListener
 * - onRemoteStreamListener
 * - onSessionConnectionStateChangedListener
 * - onUserNotAnswerListener
 */


require('../../../lib/strophe/strophe.min');
var download = require('../../../lib/download/download.min');
var URL = window.URL || window.webkitURL;

var RTCSession = require('./qbWebRTCSession'),

var signalingType = {
  CALL: 'call',
  ACCEPT: 'accept',
  REJECT: 'reject',
  STOP: 'hangUp',
  CANDIDATE: 'iceCandidates',
  PARAMETERS_CHANGED: 'update'
};

var offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1
};

var WEBRTC_MODULE_ID = 'WebRTCVideoChat';

var connection;

var peer;

/**
 * A map with all sessions the user had/have.
 * @type {Object.<string, Object>}
 * Fields:
 *  - ID -> string
 *  - initiatorID -> number
 *  - opponentsIDs -> array of numbers
 *  - callType -> enum
 *  - peerConnections -> map of objects
 */
var sessions = {};

// we use this timeout to fix next issue:
// "From Android/iOS make a call to Web and kill the Android/iOS app instantly. Web accept/reject popup will be still visible.
// We need a way to hide it if sach situation happened."
//
var answerTimers = {};

// We use this timer interval to dial a user - produce the call reqeusts each N seconds.
//
var dialingTimerIntervals = {};

// We use this timer on a caller's side to notify him if the opponent doesn't respond.
//
var callTimers = {};


/* WebRTC module: Core
--------------------------------------------------------------------------------- */
function WebRTCProxy(service, conn) {
  var self = this;
  connection = conn;

  this.service = service;
  this.helpers = new Helpers;
  this.session =

  this._onMessage = function(stanza) {
    var from = stanza.getAttribute('from'),
        extraParams = stanza.querySelector('extraParams'),
        delay = stanza.querySelector('delay'),
        userId = self.helpers.getIdFromNode(from),
        extension = self._getExtension(extraParams);

    var sessionId = extension.sessionID;

    if (delay || extension.moduleIdentifier !== WEBRTC_MODULE_ID) return true;

    // clean for users
    delete extension.moduleIdentifier;

    switch (extension.signalType) {
    case signalingType.CALL:
      trace('onCall from ' + userId);

      if (sessions[sessionId]) {
      	trace('skip onCallListener, a user already got it');
      	return true;
      }

      // run caller availability timer and run again for this user
      clearAnswerTimer(sessionId);
      if(peer == null){
        startAnswerTimer(sessionId, self._answerTimeoutCallback);
      }
      //

      sessions[sessionId] = {
        sdp: extension.sdp
      };

      extension.callType = extension.callType === '1' ? 'video' : 'audio';
      delete extension.sdp;

      if (typeof self.onCallListener === 'function'){
        self.onCallListener(userId, extension);
      }

      break;
    case signalingType.ACCEPT:
      trace('onAccept from ' + sessionId);

      clearDialingTimerInterval(sessionId);
      clearCallTimer(userId);

      if (typeof peer === 'object')
        peer.onRemoteSessionCallback(extension.sdp, 'answer');
      delete extension.sdp;
      if (typeof self.onAcceptCallListener === 'function')
        self.onAcceptCallListener(userId, extension);
      break;
    case signalingType.REJECT:
      trace('onReject from ' + sessionId);

      clearDialingTimerInterval(sessionId);
      clearCallTimer(userId);

      self._close();
      if (typeof self.onRejectCallListener === 'function')
        self.onRejectCallListener(userId, extension);
      break;
    case signalingType.STOP:
      trace('onStop from ' + sessionId);

      clearDialingTimerInterval(sessionId);
      clearCallTimer(userId);

      clearSession(sessionId);

      self._close();
      if (typeof self.onStopCallListener === 'function')
        self.onStopCallListener(userId, extension);
      break;
    case signalingType.CANDIDATE:
      if (typeof peer === 'object') {
        peer.addCandidates(extension.iceCandidates);
        if (peer.type === 'answer')
          self._sendCandidate(peer.opponentId, peer.iceCandidates);
      }
      break;
    case signalingType.PARAMETERS_CHANGED:
      trace('onUpdateCall from ' + userId);
      if (typeof self.onUpdateCallListener === 'function')
        self.onUpdateCallListener(userId, extension);
      break;
    }

    // we must return true to keep the handler alive
    // returning false would remove it after it finishes
    return true;
  };

  this._getExtension = function(extraParams) {
    var extension = {}, iceCandidates = [], opponents = [],
        candidate, oponnent, items, childrenNodes;

    if (extraParams) {
      for (var i = 0, len = extraParams.childNodes.length; i < len; i++) {
        if (extraParams.childNodes[i].tagName === 'iceCandidates') {

          // iceCandidates
          items = extraParams.childNodes[i].childNodes;

          for (var j = 0, len2 = items.length; j < len2; j++) {
            candidate = {};
            childrenNodes = items[j].childNodes;
            for (var k = 0, len3 = childrenNodes.length; k < len3; k++) {
              candidate[childrenNodes[k].tagName] = childrenNodes[k].textContent;
            }
            iceCandidates.push(candidate);
          }

        } else if (extraParams.childNodes[i].tagName === 'opponentsIDs') {

          // opponentsIDs
          items = extraParams.childNodes[i].childNodes;
          for (var j = 0, len2 = items.length; j < len2; j++) {
            oponnent = items[j].textContent;
            opponents.push(oponnent);
          }

        } else {
          if (extraParams.childNodes[i].childNodes.length > 1) {

            extension = self._XMLtoJS(extension, extraParams.childNodes[i].tagName, extraParams.childNodes[i]);

          } else {

            extension[extraParams.childNodes[i].tagName] = extraParams.childNodes[i].textContent;

          }
        }
      }
      if (iceCandidates.length > 0)
        extension.iceCandidates = iceCandidates;
      if (opponents.length > 0)
        extension.opponents = opponents;
    }

    return extension;
  };

  this._answerTimeoutCallback = function (sessionId){
  	clearSession(sessionId);
    self._close();

    if(typeof self.onSessionConnectionStateChangedListener === 'function'){
      self.onSessionConnectionStateChangedListener(self.SessionConnectionState.CLOSED, userId);
    }
  };

  this._callTimeoutCallback = function (sessionId){
    trace("sessionId: " + sessionId + " not asnwer");

    clearDialingTimerInterval(sessionId);

    clearSession(sessionId);
    self._close();

    if(typeof self.onUserNotAnswerListener === 'function'){
      self.onUserNotAnswerListener(sessionId);
    }
  };
}



WebRTCProxy.prototype._sendCandidate = function(userId, iceCandidates) {
  var extension = {
    iceCandidates: iceCandidates
  };
  this._sendMessage(userId, extension, 'CANDIDATE');
};

WebRTCProxy.prototype._sendMessage = function(userId, extension, type, callType, opponentsIDs) {
  var extension = extension || {},
      self = this,
      msg, params;

  extension.moduleIdentifier = WEBRTC_MODULE_ID;
  extension.signalType = signalingType[type];
  extension.sessionID = peer && peer.sessionID || extension.sessionID;

  if (callType) {
    extension.callType = callType === 'video' ? '1' : '2';
  }

  if (type === 'CALL' || type === 'ACCEPT') {
    extension.sdp = peer.localDescription.sdp;
    extension.platform = 'web';
  }

  if (type === 'CALL') {
    extension.callerID = this.helpers.getIdFromNode(connection.jid);
    extension.opponentsIDs = opponentsIDs;
  }

  params = {
    from: connection.jid,
    to: this.helpers.getUserJid(userId, this.service.getSession().application_id),
    type: 'headline',
    id: Utils.getBsonObjectId()
  };

  msg = $msg(params).c('extraParams', {
    xmlns: Strophe.NS.CLIENT
  });

  Object.keys(extension).forEach(function(field) {
    if (field === 'iceCandidates') {

      // iceCandidates
      msg = msg.c('iceCandidates');
      extension[field].forEach(function(candidate) {
        msg = msg.c('iceCandidate');
        Object.keys(candidate).forEach(function(key) {
          msg.c(key).t(candidate[key]).up();
        });
        msg.up();
      });
      msg.up();

    } else if (field === 'opponentsIDs') {

      // opponentsIDs
      msg = msg.c('opponentsIDs');
      extension[field].forEach(function(opponentId) {
        msg = msg.c('opponentID').t(opponentId).up();
      });
      msg.up();

    } else if (typeof extension[field] === 'object') {

      self._JStoXML(field, extension[field], msg);

    } else {
      msg.c(field).t(extension[field]).up();
    }
  });

  connection.send(msg);
};

// TODO: the magic
WebRTCProxy.prototype._JStoXML = function(title, obj, msg) {
  var self = this;
  msg.c(title);
  Object.keys(obj).forEach(function(field) {
    if (typeof obj[field] === 'object')
      self._JStoXML(field, obj[field], msg);
    else
      msg.c(field).t(obj[field]).up();
  });
  msg.up();
};

// TODO: the magic
WebRTCProxy.prototype._XMLtoJS = function(extension, title, obj) {
  var self = this;
  extension[title] = {};
  for (var i = 0, len = obj.childNodes.length; i < len; i++) {
    if (obj.childNodes[i].childNodes.length > 1) {
      extension[title] = self._XMLtoJS(extension[title], obj.childNodes[i].tagName, obj.childNodes[i]);
    } else {
      extension[title][obj.childNodes[i].tagName] = obj.childNodes[i].textContent;
    }
  }
  return extension;
};


WebRTCProxy.prototype.snapshot = function(id) {
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

    blob = dataURItoBlob(dataURL, 'image/png');
    blob.name = 'snapshot_' + getLocalTime() + '.png';
    blob.url = dataURL;

    return blob;
  }
};

// add CSS filters to video stream
// http://css-tricks.com/almanac/properties/f/filter/
WebRTCProxy.prototype.filter = function(id, filters) {
  var video = document.getElementById(id);
  if (video) {
    video.style.webkitFilter = filters;
    video.style.filter = filters;
  }
};




////////////////////////////// Session part ////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Creates the new session.
 * @param {number} Initiator ID
 * @param {array} Opponents IDs
 * @param {enum} Call type
 */
WebRTCProxy.prototype.createNewSession = function(initiatorID, opponentsIDs, callType) {
  var newSession = new WebRTCSession(initiatorID, opponentsIDs, callType);
  return newSession;
}

/**
 * A map with all sessions the user had/have.
 * @type {Object.<string, Object>}
 */
WebRTCProxy.prototype.sessions = {};

/**
 * Checks is session active or not
 * @param {string} Session ID
 */
WebRTCProxy.prototype.isSessionActive = function(sessionId){
   var session = this.sessions[sessionId];
   return (session != null && session.state == this.state.ACTIVE);
};


/**
 * Checks is session rejected or not
 * @param {string} Session ID
 */
WebRTCProxy.prototype.isSessionRejected = function(sessionId){
   var session = this.sessions[sessionId];
   return (session != null && session.state == this.state.REJECTED);
};

/**
 * Checks is session hung up or not
 * @param {string} Session ID
 */
WebRTCProxy.prototype.isSessionHungUp = function(sessionId){
   var session = this.sessions[sessionId];
   return (session != null && session.state == this.state.HUNGUP);
};



WebRTCProxy.prototype.SessionConnectionState = {
  UNDEFINED: 0,
  CONNECTING: 1,
  CONNECTED: 2,
  FAILED: 3,
  DISCONNECTED: 4,
  CLOSED: 5
};

WebRTCProxy.prototype.CallType = {
  VIDEO: 'video',
  AUDIO: 'accept'
};





/* Helpers
---------------------------------------------------------------------- */


module.exports = WebRTCProxy;



/* Private
---------------------------------------------------------------------- */
function trace(text) {
  if (config.debug) {
    console.log('[QBWebRTC]:', text);
  }
}

function getLocalTime() {
  var arr = (new Date).toString().split(' ');
  return arr.slice(1,5).join('-');
}

function clearSession(sessionId){
  delete sessions[sessionId];
}


////////////////////////////////////////////////////////////////////////

function clearAnswerTimer(sessionId){
	var answerTimer = answerTimers[sessionId];
  if(answerTimer){
    clearTimeout(answerTimer);
    delete answerTimers[sessionId];
  }
}

function startAnswerTimer(sessionId, callback){
  var answerTimeInterval = config.webrtc.answerTimeInterval*1000;
  var answerTimer = setTimeout(callback, answerTimeInterval, sessionId);
  answerTimers[sessionId] = answerTimer;
}

function clearDialingTimerInterval(sessionId){
  var dialingTimer = dialingTimerIntervals[sessionId];
  if(dialingTimer){
    clearInterval(dialingTimer);
    delete dialingTimerIntervals[sessionId];
  }
}

function startDialingTimerInterval(sessionId, functionToRun){
  var dialingTimeInterval = config.webrtc.dialingTimeInterval*1000;
  var dialingTimerId = setInterval(functionToRun, dialingTimeInterval);
  dialingTimerIntervals[sessionId] = dialingTimerId;
}

function clearCallTimer(sessionId){
  var callTimer = callTimers[sessionId];
  if(callTimer){
    clearTimeout(callTimer);
    delete callTimers[sessionId];
  }
}

function startCallTimer(sessionId, callback){
  var answerTimeInterval = config.webrtc.answerTimeInterval*1000;
  trace("startCallTimer, answerTimeInterval: " + answerTimeInterval);
  var callTimer = setTimeout(callback, answerTimeInterval, sessionId);
  callTimers[sessionId] = callTimer;
}

////////////////////////////////////////////////////////////////////////


// Convert Data URI to Blob
function dataURItoBlob(dataURI, contentType) {
  var arr = [],
      binary = window.atob(dataURI.split(',')[1]);

  for (var i = 0, len = binary.length; i < len; i++) {
    arr.push(binary.charCodeAt(i));
  }

  return new Blob([new Uint8Array(arr)], {type: contentType});
}

// Download Blob to local file system
Blob.prototype.download = function() {
  download(this, this.name, this.type);
};
