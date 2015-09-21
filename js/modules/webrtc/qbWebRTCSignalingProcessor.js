/*
 * QuickBlox JavaScript SDK
 *
 * WebRTC Module (WebRTC signaling provider)
 *
 */

require('../../../lib/strophe/strophe.min');
var Helpers = require('./qbWebRTCHelpers'),

function WebRTCSignalingProcessor(service, delegate, connection) {
  this.service = service;
  this.delegate = delegate;
  this.connection = connection;

  this._onMessage = function(stanza) {
    var from = stanza.getAttribute('from'),
        extraParams = stanza.querySelector('extraParams'),
        delay = stanza.querySelector('delay'),
        userId = Helpers.getIdFromNode(from),
        extension = self._getExtension(extraParams);
    if (delay || extension.moduleIdentifier !== Helpers.getWebRTCModuleID()){
      return true;
    }

    var sessionId = extension.sessionID;
    var signalType = extension.signalType;

    // cleanup
    delete extension.moduleIdentifier;
    delete extension.sessionID;
    delete extension.signalType;

    switch (signalType) {
    case WebRTCSignaling.SignalingType.CALL:
      if (typeof self.delegate._onCallListener === 'function'){
        self.delegate._onCallListener(userId, sessionId, extension);
      }

      break;
    case WebRTCSignaling.SignalingType.ACCEPT:
      if (typeof self.delegate._onAcceptListener === 'function'){
        self.delegate._onAcceptListener(userId, sessionId, extension);
      }

      break;
    case WebRTCSignaling.SignalingType.REJECT:
      if (typeof self.delegate._onRejectListener === 'function'){
        self.delegate._onRejectListener(userId, sessionId, extension);
      }

      break;
    case WebRTCSignaling.SignalingType.STOP:
      if (typeof self.delegate._onStopListener === 'function'){
        self.delegate._onStopListener(userId, sessionId, extension);
      }

      break;
    case WebRTCSignaling.SignalingType.CANDIDATE:
      if (typeof self.delegate._onIceCandidatesListener === 'function'){
        self.delegate._onIceCandidatesListener(userId, sessionId, extension);
      }

      break;
    case WebRTCSignaling.SignalingType.PARAMETERS_CHANGED:
      if (typeof self.delegate._onUpdateListener === 'function'){
        self.delegate._onUpdateListener(userId, sessionId, extension);
      }

      break;
    }

    // we must return true to keep the handler alive
    // returning false would remove it after it finishes
    return true;
  };

  this._getExtension = function(extraParams) {
    if (!extraParams) {
      return null;
    }

    var extension = {}, iceCandidates = [], opponents = [],
        candidate, oponnent, items, childrenNodes;

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
    if (iceCandidates.length > 0){
      extension.iceCandidates = iceCandidates;
    }
    if (opponents.length > 0){
      extension.opponents = opponents;
    }


    return extension;
  };

}

WebRTCSignaling.SignalingType = {
   CALL: 'call',
   ACCEPT: 'accept',
   REJECT: 'reject',
   STOP: 'hangUp',
   CANDIDATE: 'iceCandidates',
   PARAMETERS_CHANGED: 'update'
};




WebRTCSignaling.prototype.sendCandidate = function(userId, iceCandidates, extension) {
  var extension = extension || {};
  extension[iceCandidates] = iceCandidates;

  this.sendMessage(userId, extension, WebRTCSignaling.SignalingType.CANDIDATE);
};

WebRTCSignaling.prototype.sendMessage = function(userId, extension, signalingType) {
  var extension = extension || {},
      self = this,
      msg, params;

  // basic parameters
  //
  extension.moduleIdentifier = WEBRTC_MODULE_ID;
  extension.signalType = signalingType;
  // extension.sessionID
  // extension.callType
  extension.platform = 'web';
  extension.callerID = Helpers.getIdFromNode(this.connection.jid);
  // extension.opponentsIDs;
  // extension.sdp

  params = {
    to: Helpers.getUserJid(userId, this.service.getSession().application_id),
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

  this.connection.send(msg);
};

// TODO: the magic
WebRTCSignaling.prototype._JStoXML = function(title, obj, msg) {
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
WebRTCSignaling.prototype._XMLtoJS = function(extension, title, obj) {
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

module.exports = WebRTCSignaling;
