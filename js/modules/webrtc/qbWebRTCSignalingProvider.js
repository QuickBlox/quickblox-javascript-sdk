/*
 * QuickBlox JavaScript SDK
 *
 * WebRTC Module (WebRTC signaling processor)
 *
 */

var Helpers = require('./qbWebRTCHelpers'),

var WEBRTC_MODULE_ID = 'WebRTCVideoChat';

function WebRTCSignalingProvider(service, delegate, connection) {
  this.service = service;
  this.delegate = delegate;
  this.connection = connection;
}
