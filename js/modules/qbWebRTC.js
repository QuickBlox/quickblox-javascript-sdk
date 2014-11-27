if (typeof define !== 'function') { var define = require('amdefine')(module) }
/*
 * QuickBlox JavaScript SDK
 *
 * WebRTC Module
 *
 */

define(['qbConfig', 'strophe', 'webRTCAdapter'],
function(config, Strophe) {

  /*
   * User's callbacks (listener-functions):
   * - onCallListener
   * - onAcceptCallListener
   * - onRejectCallListener
   * - onStopCallListener
   */

  // onCallCallback: params.onCallCallback || null,
  // onAcceptCallback: params.onAcceptCallback || null,
  // onRejectCallback: params.onRejectCallback || null,
  // onStopCallback: params.onStopCallback || null,
  // onInnerAcceptCallback: null,
  // onCandidateCallback: null

  var connection;

  var QBSignalingType = {
    CALL: 'qbvideochat_call',
    ACCEPT: 'qbvideochat_acceptCall',
    REJECT: 'qbvideochat_rejectCall',
    STOP: 'qbvideochat_stopCall',
    CANDIDATE: 'qbvideochat_candidate',
    PARAMETERS_CHANGED: 'qbvideochat_callParametersChanged'
  };

  function traceS(text) {
    console.log('[QBWebRTC]:', text);
  }

  function WebRTCProxy(service, conn) {
    var self = this;
    connection = conn;
    this.service = service;

    // set WebRTC callbacks
    connection.addHandler(self._onMessage, null, 'message', 'headline');

    this._onMessage = function(msg) {
      var author, qbID;
      var extraParams, extension = {};
      
      author = $(msg).attr('from');
      qbID = QBChatHelpers.getIDFromNode(author);
      
      extraParams = $(msg).find('extraParams')[0];
      $(extraParams.childNodes).each(function() {
        extension[$(this).context.tagName] = $(this).context.textContent;
      });
      
      switch (extension.videochat_signaling_type) {
      case QBSignalingType.CALL:
        traceS('onCall from ' + qbID);
        self._callbacks.onCallCallback(qbID, extension);
        break;
      case QBSignalingType.ACCEPT:
        traceS('onAccept from ' + qbID);
        self._callbacks.onAcceptCallback(qbID, extension);
        self._callbacks.onInnerAcceptCallback(extension.sdp);
        break;
      case QBSignalingType.REJECT:
        traceS('onReject from ' + qbID);
        self._callbacks.onRejectCallback(qbID, extension);
        break;
      case QBSignalingType.STOP:
        traceS('onStop from ' + qbID);
        self._callbacks.onStopCallback(qbID, extension);
        break;
      case QBSignalingType.CANDIDATE:
        self._callbacks.onCandidateCallback({
          sdpMLineIndex: extension.sdpMLineIndex,
          candidate: extension.candidate,
          sdpMid: extension.sdpMid
        });
        break;
      case QBSignalingType.PARAMETERS_CHANGED:
        break;
      }
      
      return true;
    };
  }

  WebRTCProxy.prototype = {
    init: function() {

    },

    call: function(opponentID, sessionDescription, sessionID, extraParams) {
      traceS('call to ' + opponentID);
      extraParams = extraParams || {};
      
      extraParams.videochat_signaling_type = QBSignalingType.CALL;
      extraParams.sessionID = sessionID;
      extraParams.sdp = sessionDescription;
      extraParams.platform = 'web';
      extraParams.device_orientation = 'portrait';
      
      this._sendMessage(opponentID, extraParams);
    },

    _sendMessage: function(opponentID, extraParams) {
      var reply, params;
      
      params = {
        to: QBChatHelpers.getJID(opponentID),
        from: chatService._connection.jid,
        type: 'headline'
      };
      
      reply = $msg(params).c('extraParams', {
        xmlns: Strophe.NS.CLIENT
      });
      
      $(Object.keys(extraParams)).each(function() {
        reply.c(this).t(extraParams[this]).up();
      });
      
      chatService._connection.send(reply);
      }
  };

  return WebRTCProxy;

});
