'use strict';

/**
 * QuickBlox JavaScript SDK
 * WebRTC Module (WebRTC signaling constants)
 */

function WebRTCSignalingConstants() {}

WebRTCSignalingConstants.MODULE_ID = "WebRTCVideoChat";

WebRTCSignalingConstants.SignalingType = {
    CALL: 'call',
    ACCEPT: 'accept',
    REJECT: 'reject',
    STOP: 'hangUp',
    CANDIDATE: 'iceCandidates',
    PARAMETERS_CHANGED: 'update'
};

module.exports = WebRTCSignalingConstants;
