/*
 * QuickBlox JavaScript SDK
 *
 * WebRTC Module (WebRTC signaling processor)
 *
 */

require('../../../lib/strophe/strophe.min');
var Helpers = require('./qbWebRTCHelpers');
var SignalingConstants = require('./qbWebRTCSignalingConstants');

function WebRTCSignalingProvider(service, connection) {
  this.service = service;
  this.connection = connection;
}

WebRTCSignalingProvider.prototype.sendCandidate = function(userId, iceCandidates, extension) {
  var extension = extension || {};
  extension[iceCandidates] = iceCandidates;

  this.sendMessage(userId, extension, WebRTCSignaling.SignalingType.CANDIDATE);
};

WebRTCSignalingProvider.prototype.sendMessage = function(userId, extension, signalingType) {
  var extension = extension || {},
      self = this,
      msg, params;

  // basic parameters
  //
  extension.moduleIdentifier = SignalingConstants.MODULE_ID;
  extension.signalType = signalingType;
  // extension.sessionID
  // extension.callType
  extension.platform = 'web';
  // extension.callerID
  // extension.opponentsIDs
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
WebRTCSignalingProvider.prototype._JStoXML = function(title, obj, msg) {
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

module.exports = WebRTCSignalingProvider;
