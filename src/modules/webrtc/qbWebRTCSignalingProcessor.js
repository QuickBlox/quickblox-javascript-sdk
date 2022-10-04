'use strict';

/**
 * QuickBlox JavaScript SDK
 * WebRTC Module (WebRTC signaling provider)
 */

require('strophe.js');

var SignalingConstants = require('./qbWebRTCSignalingConstants');

function WebRTCSignalingProcessor(service, delegate) {
    var self = this;

    self.service = service;
    self.delegate = delegate;

    this._onMessage = function(from, extraParams, delay, userId) {

        var extension = self._getExtension(extraParams),
            sessionId = extension.sessionID,
            signalType = extension.signalType;

        /** cleanup */
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
    };

    /**
     * Convert XML into JS object
     * @param {Element} extraParams 
     * @returns {Object}
     */
    this._getExtension = function(extraParams) {
        if (!extraParams) {
            return {};
        }

        var extension = {},
            iceCandidates = [],
            opponents = [];

        extraParams.childNodes.forEach(function (childNode) {
            if (childNode.nodeName === 'iceCandidates') {
                /** iceCandidates */
                childNode.childNodes.forEach(function (candidateNode) {
                    var candidate = {};
                    candidateNode.childNodes.forEach(function (node) {
                        candidate[node.nodeName] = node.textContent;
                    });
                    iceCandidates.push(candidate);
                });

            } else if (childNode.nodeName === 'opponentsIDs') {
                /** opponentsIDs */
                childNode.childNodes.forEach(function (opponentNode) {
                    var opponentId = opponentNode.textContent;
                    opponents.push(parseInt(opponentId));
                });
            } else {
                if (childNode.childNodes.length > 1) {
                    extension = self._XMLtoJS(
                        extension,
                        childNode.nodeName,
                        childNode
                    );
                } else {
                    if (childNode.nodeName === 'userInfo') {
                        extension = self._XMLtoJS(
                            extension,
                            childNode.nodeName,
                            childNode
                        );
                    } else {
                        extension[childNode.nodeName] = childNode.textContent;
                    }
                }
            }
        });

        if (iceCandidates.length > 0) {
            extension.iceCandidates = iceCandidates;
        }
        if (opponents.length > 0) {
            extension.opponentsIDs = opponents;
        }

        return extension;
    };

    /**
     * 
     * @param {Object} extension 
     * @param {string} title 
     * @param {Element} element 
     * @returns {Object}
     */
    this._XMLtoJS = function(extension, title, element) {
        var self = this;
        extension[title] = {};

        element.childNodes.forEach(function (childNode) {
            if (childNode.childNodes.length > 1) {
                extension[title] = self._XMLtoJS(
                    extension[title],
                    childNode.nodeName,
                    childNode
                );
            } else {
                extension[title][childNode.nodeName] = childNode.textContent;
            }
        });
        return extension;
    };
}

module.exports = WebRTCSignalingProcessor;
