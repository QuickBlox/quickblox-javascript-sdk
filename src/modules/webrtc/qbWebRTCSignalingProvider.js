'use strict';

/** JSHint inline rules */
/* globals Strophe, $msg */

/**
 * QuickBlox JavaScript SDK
 * WebRTC Module (WebRTC signaling processor)
 */

require('strophe.js');

var Helpers = require('./qbWebRTCHelpers');
var SignalingConstants = require('./qbWebRTCSignalingConstants');
var Utils = require('../../qbUtils');
var config = require('../../qbConfig');

function WebRTCSignalingProvider(service, chat) {
    this.service = service;
    this.chat = chat;
}

WebRTCSignalingProvider.prototype.sendCandidate = function (userId, iceCandidates, ext) {
    var extension = ext || {};
    extension.iceCandidates = iceCandidates;

    this.sendMessage(userId, extension, SignalingConstants.SignalingType.CANDIDATE);
};

WebRTCSignalingProvider.prototype.sendMessage = function (userId, ext, signalingType) {
    var extension = ext || {},
        self = this;

    /** basic parameters */
    extension.moduleIdentifier = SignalingConstants.MODULE_ID;
    extension.signalType = signalingType;
    /** extension.sessionID */
    /** extension.callType */
    extension.platform = 'web';
    /** extension.callerID */
    /** extension.opponentsIDs */
    /** extension.sdp */

    if (extension.userInfo && !Object.keys(extension.userInfo).length) {
        delete extension.userInfo;
    }

    var params = {
        to: Helpers.getUserJid(userId, config.creds.appId),
        type: 'headline',
        id: Utils.getBsonObjectId()
    };

    var msg = $msg(params).c('extraParams', {
        xmlns: Strophe.NS.CLIENT
    });

    Object.keys(extension).forEach(function (field) {
        if (field === 'iceCandidates') {
            /** iceCandidates */
            msg.c('iceCandidates');
            extension[field].forEach(function (candidate) {
                msg.c('iceCandidate');
                Object.keys(candidate).forEach(function (key) {
                    msg.c(key).t(candidate[key]).up();
                });
                msg.up();
            });
            msg.up();
        } else if (field === 'opponentsIDs') {
            /** opponentsIDs */
            msg.c('opponentsIDs');
            extension[field].forEach(function (opponentId) {
                msg.c('opponentID').t(opponentId).up();
            });
            msg.up();
        } else if (typeof extension[field] === 'object') {
            self._JStoXML(field, extension[field], msg);
        } else {
            msg.c(field).t(extension[field]).up();
        }
    });

    this.chat.connection.send(msg);
};

/**
 * 
 * @param {string} title 
 * @param {Object} obj 
 * @param {Strophe.Builder} msg 
 */
WebRTCSignalingProvider.prototype._JStoXML = function (title, obj, msg) {
    var self = this;
    msg.c(title);
    Object.keys(obj).forEach(function (field) {
        if (typeof obj[field] === 'object')
            self._JStoXML(field, obj[field], msg);
        else
            msg.c(field).t(obj[field]).up();
    });
    msg.up();
};

module.exports = WebRTCSignalingProvider;
