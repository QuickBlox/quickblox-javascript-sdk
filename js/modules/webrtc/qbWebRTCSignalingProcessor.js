/*
 * QuickBlox JavaScript SDK
 *
 * WebRTC Module (WebRTC signaling provider)
 *
 */

require('../../../lib/strophe/strophe.min');
var Helpers = require('./qbWebRTCHelpers');
var SignalingConstants = require('./qbWebRTCSignalingConstants');

function WebRTCSignalingProcessor(service, delegate, connection) {
  this.service = service;
  this.delegate = delegate;
  this.connection = connection;

  var self = this;

  this._onMessage = function(stanza) {

    var from = stanza.getAttribute('from');
    var extraParams = stanza.querySelector('extraParams');
    var delay = stanza.querySelector('delay');
    var userId = Helpers.getIdFromNode(from);
    var extension = self._getExtension(extraParams);

    if (delay || extension.moduleIdentifier !== SignalingConstants.MODULE_ID){
      return true;
    }

    var sessionId = extension.sessionID;
    var signalType = extension.signalType;

    // cleanup
    delete extension.moduleIdentifier;
    delete extension.sessionID;
    delete extension.signalType;

    switch (signalType) {
    case SignalingConstants.SignalingType.CALL:
      if (typeof self.delegate._onCallListener === 'function'){
        self.delegate._onCallListener(userId, sessionId, extension);
      }

      break;
    case SignalingConstants.SignalingType.ACCEPT:
      if (typeof self.delegate._onAcceptListener === 'function'){
        self.delegate._onAcceptListener(userId, sessionId, extension);
      }

      break;
    case SignalingConstants.SignalingType.REJECT:
      if (typeof self.delegate._onRejectListener === 'function'){
        self.delegate._onRejectListener(userId, sessionId, extension);
      }

      break;
    case SignalingConstants.SignalingType.STOP:
      if (typeof self.delegate._onStopListener === 'function'){
        self.delegate._onStopListener(userId, sessionId, extension);
      }

      break;
    case SignalingConstants.SignalingType.CANDIDATE:
      if (typeof self.delegate._onIceCandidatesListener === 'function'){
        self.delegate._onIceCandidatesListener(userId, sessionId, extension);
      }

      break;
    case SignalingConstants.SignalingType.PARAMETERS_CHANGED:
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
        candidate, opponent, items, childrenNodes;

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
          opponent = items[j].textContent;
          opponents.push(parseInt(opponent));
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
      extension.opponentsIDs = opponents;
    }


    return extension;
  };

  // TODO: the magic
  this._XMLtoJS = function(extension, title, obj) {
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
  }

}

module.exports = WebRTCSignalingProcessor;
