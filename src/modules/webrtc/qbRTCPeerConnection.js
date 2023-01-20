'use strict';

/**
 * QuickBlox JavaScript SDK
 * WebRTC Module (WebRTC peer connection model)
 */

/** Modules */
var config = require('../../qbConfig');
var Helpers = require('./qbWebRTCHelpers');

/**
 * @namespace QB.webrtc.RTCPeerConnection
 */

/**
 * @function qbRTCPeerConnection
 * @memberOf QB.webrtc.RTCPeerConnection
 * @param {RTCConfiguration} [config]
 */
var qbRTCPeerConnection = function qbRTCPeerConnection(config) {
    this._pc = new window.RTCPeerConnection(config);
    this.remoteStream = undefined;
    this.preferredCodec = 'VP8';
};

qbRTCPeerConnection.State = {
    NEW: 1,
    CONNECTING: 2,
    CHECKING: 3,
    CONNECTED: 4,
    DISCONNECTED: 5,
    FAILED: 6,
    CLOSED: 7,
    COMPLETED: 8
};

qbRTCPeerConnection.prototype._init = function (delegate, userID, sessionID, polite) {
    Helpers.trace('RTCPeerConnection init.',
        'userID: ', userID,
        ', sessionID: ', sessionID,
        ', polite: ', polite
    );

    this.delegate = delegate;
    this.localIceCandidates = [];
    this.remoteIceCandidates = [];
    /** @type {RTCSessionDescriptionInit|undefined} */
    this.remoteSDP = undefined;
    this.sessionID = sessionID;
    this.polite = polite;
    this.userID = userID;
    this._reconnecting = false;

    this.state = qbRTCPeerConnection.State.NEW;

    this._pc.onicecandidate = this.onIceCandidateCallback.bind(this);
    this._pc.onsignalingstatechange = this.onSignalingStateCallback.bind(this);
    this._pc.oniceconnectionstatechange = this.onIceConnectionStateCallback.bind(this);
    this._pc.ontrack = this.onTrackCallback.bind(this);

    /**
     * We use this timer to dial a user -
     * produce the call requests each N seconds.
     */
    this.dialingTimer = null;
    /** We use this timer to wait for answer from callee */
    this.answerTimeInterval = 0;
    this.statsReportTimer = null;

};

qbRTCPeerConnection.prototype.release = function () {
    this._clearDialingTimer();
    this._clearStatsReportTimer();

    this._pc.close();
    this.state = qbRTCPeerConnection.State.CLOSED;

    this._pc.onicecandidate = null;
    this._pc.onsignalingstatechange = null;
    this._pc.oniceconnectionstatechange = null;
    this._pc.ontrack = null;
    if (navigator.userAgent.includes("Edge")) {
        this.connectionState = 'closed';
        this.iceConnectionState = 'closed';
    }
};

qbRTCPeerConnection.prototype.negotiate = function () {
    var self = this;
    return this.setLocalSessionDescription({
        type: 'offer',
        options: { iceRestart: true }
    }, function (error) {
        if (error) {
            return Helpers.traceError("Error in 'negotiate': " + error);
        }
        var description = self._pc.localDescription.toJSON();
        self.delegate.update({
            reason: 'reconnect',
            sessionDescription: {
                offerId: self.offerId,
                sdp: description.sdp,
                type: description.type
            }
        }, self.userID);
    });
};

/**
 * Save remote SDP for future use.
 * @function setRemoteSDP
 * @memberOf QB.webrtc.RTCPeerConnection
 * @param {RTCSessionDescriptionInit} newSDP 
 */
qbRTCPeerConnection.prototype.setRemoteSDP = function (newSDP) {
    if (!newSDP) {
        throw new Error("sdp string can't be empty.");
    } else {
        this.remoteSDP = newSDP;
    }
};

/**
 * Returns SDP if it was set previously.
 * @function getRemoteSDP
 * @memberOf QB.webrtc.RTCPeerConnection
 * @returns {RTCSessionDescriptionInit|undefined}
 */
qbRTCPeerConnection.prototype.getRemoteSDP = function () {
    return this.remoteSDP;
};

/**
 * Create offer or answer SDP and set as local description.
 * @function setLocalSessionDescription
 * @memberOf QB.webrtc.RTCPeerConnection
 * @param {Object} params
 * @param {'answer'|'offer'} params.type 
 * @param {RTCOfferOptions} [params.options] 
 * @param {Function} callback 
 */
qbRTCPeerConnection.prototype.setLocalSessionDescription = function (params, callback) {
    var self = this;

    self.state = qbRTCPeerConnection.State.CONNECTING;

    var supportsSetCodecPreferences = window.RTCRtpTransceiver &&
      'setCodecPreferences' in window.RTCRtpTransceiver.prototype &&
      Boolean(Helpers.getVersionSafari());

    if (supportsSetCodecPreferences) {
        self._pc.getTransceivers().forEach(function (transceiver) {
            var kind = transceiver.sender.track.kind;
            var sendCodecs = window.RTCRtpSender.getCapabilities(kind).codecs;
            var recvCodecs = window.RTCRtpReceiver.getCapabilities(kind).codecs;
            if (kind === 'video') {
                var preferredCodecSendIndex = sendCodecs.findIndex(function(codec) {
                    return codec
                        .mimeType
                        .toLowerCase()
                        .includes(self.preferredCodec.toLowerCase());
                    });
                if (preferredCodecSendIndex !== -1) {
                    var arrayWithPreferredSendCodec = sendCodecs.splice(
                        preferredCodecSendIndex,
                        1
                    );
                    sendCodecs.unshift(arrayWithPreferredSendCodec[0]);
                }
                var preferredCodecRecvIndex = recvCodecs.findIndex(function(codec) {
                    return codec
                        .mimeType
                        .toLowerCase()
                        .includes(self.preferredCodec.toLowerCase());
                    });
                if (preferredCodecRecvIndex !== -1) {
                    var arrayWithPreferredRecvCodec = recvCodecs.splice(
                        preferredCodecRecvIndex,
                        1
                    );
                    recvCodecs.unshift(arrayWithPreferredRecvCodec[0]);
                }
                transceiver.setCodecPreferences(sendCodecs.concat(recvCodecs));
            }
        });
    }

    /** 
     * @param {RTCSessionDescriptionInit} description 
     */
    function successCallback(description) {
        var modifiedDescription = _removeExtmapMixedFromSDP(description);
        modifiedDescription.sdp = setPreferredCodec(
            modifiedDescription.sdp,
            'video',
            self.preferredCodec
        );
        if (self.delegate.bandwidth) {
            modifiedDescription.sdp = setMediaBitrate(
                modifiedDescription.sdp,
                'video',
                self.delegate.bandwidth
            );
        }
        self._pc.setLocalDescription(modifiedDescription)
            .then(function () {
                callback(null);
            }).
            catch(function (error) {
                Helpers.traceError(
                    "Error in 'setLocalSessionDescription': " + error
                );
                callback(error);
            });
    }

    if (params.type === 'answer') {
        this._pc.createAnswer(params.options)
            .then(successCallback)
            .catch(callback);
    } else {
        this._pc.createOffer(params.options)
            .then(successCallback)
            .catch(callback);
    }
};

/**
 * Set remote session description.
 * @function setRemoteSessionDescription
 * @memberOf QB.webrtc.RTCPeerConnection
 * @param {RTCSessionDescriptionInit} description 
 * @param {Function} callback 
 * @returns {void}
 */
qbRTCPeerConnection.prototype.setRemoteSessionDescription = function (
    description,
    callback
) {
    var modifiedSDP = this.delegate.bandwidth ? {
        type: description.type,
        sdp: setMediaBitrate(description.sdp, 'video', this.delegate.bandwidth)
    } : description;

    this._pc.setRemoteDescription(modifiedSDP)
        .then(function () { callback(); })
        .catch(function (error) {
            Helpers.traceError(
                "Error in 'setRemoteSessionDescription': " + error
            );
            callback(error);
        });
};

/**
 * Add local stream.
 * @function addLocalStream
 * @memberOf QB.webrtc.RTCPeerConnection
 * @param {MediaStream} stream
 */
qbRTCPeerConnection.prototype.addLocalStream = function (stream) {
    if (!stream) {
        throw new Error("'qbRTCPeerConnection.addLocalStream' error: stream is not defined");
    }
    var self = this;
    stream.getTracks().forEach(function (track) {
        self._pc.addTrack(track, stream);
    });
};

/**
 * Add ice candidate.
 * @function _addIceCandidate
 * @memberOf QB.webrtc.RTCPeerConnection
 * @param {RTCIceCandidateInit} iceCandidate 
 * @returns {Promise<void>}
 */
qbRTCPeerConnection.prototype._addIceCandidate = function (iceCandidate) {
    return this._pc.addIceCandidate(iceCandidate).catch(function (error) {
        Helpers.traceError("Error on 'addIceCandidate': " + error);
    });
};

/**
 * Add ice candidates.
 * @function addCandidates
 * @memberOf QB.webrtc.RTCPeerConnection
 * @param {Array<RTCIceCandidateInit>} iceCandidates 
 */
qbRTCPeerConnection.prototype.addCandidates = function (iceCandidates) {
    var self = this;

    iceCandidates.forEach(function (candidate) {
        self.remoteIceCandidates.push(candidate);
    });

    if (this._pc.remoteDescription) {
        self.remoteIceCandidates.forEach(function (candidate) {
            self._addIceCandidate(candidate);
        });
    }
};

qbRTCPeerConnection.prototype.toString = function sessionToString() {
    return (
        'sessionID: ' + this.sessionID +
        ', userID:  ' + this.userID +
        ', state: ' + this.state
    );
};

/**
 * CALLBACKS
 */
qbRTCPeerConnection.prototype.onSignalingStateCallback = function () {
    if (this._pc.signalingState === 'stable' && this.localIceCandidates.length > 0) {
        this.delegate.processIceCandidates(this, this.localIceCandidates);
        while (this.localIceCandidates.length) {
            this.localIceCandidates.pop();
        }
    }
};

/**
 * @param {RTCPeerConnectionIceEvent} event 
 */
qbRTCPeerConnection.prototype.onIceCandidateCallback = function (event) {
    if (event.candidate) {
        var candidate = {
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex
        };
        if (this._pc.signalingState === 'stable') {
            this.delegate.processIceCandidates(this, [candidate]);
        } else {
            // collecting internally the ice candidates
            // will send a bit later
            this.localIceCandidates.push(candidate);
        }
    }
};

/**
 * Handler of remote media track event
 * @param {RTCTrackEvent} event
 */
qbRTCPeerConnection.prototype.onTrackCallback = function (event) {
    this.remoteStream = event.streams[0];
    if (typeof this.delegate._onRemoteStreamListener === 'function' &&
        ['connected', 'completed'].includes(this._pc.iceConnectionState)) {
        this.delegate._onRemoteStreamListener(this.userID, this.remoteStream);
    }
    this._getStatsWrap();
};

qbRTCPeerConnection.prototype.onIceConnectionStateCallback = function () {
    Helpers.trace("onIceConnectionStateCallback: " + this._pc.iceConnectionState);
    var connectionState = null;

    switch (this._pc.iceConnectionState) {
        case 'checking':
            this.state = qbRTCPeerConnection.State.CHECKING;
            connectionState = Helpers.SessionConnectionState.CONNECTING;
            break;

        case 'connected':
            if (this._reconnecting) {
                this.delegate._stopReconnectTimer(this.userID);
            }
            this.state = qbRTCPeerConnection.State.CONNECTED;
            connectionState = Helpers.SessionConnectionState.CONNECTED;
            break;

        case 'completed':
            if (this._reconnecting) {
                this.delegate._stopReconnectTimer(this.userID);
            }
            this.state = qbRTCPeerConnection.State.COMPLETED;
            connectionState = Helpers.SessionConnectionState.COMPLETED;
            break;

        case 'failed':
            this.delegate._startReconnectTimer(this.userID);
            this.state = qbRTCPeerConnection.State.FAILED;
            connectionState = Helpers.SessionConnectionState.FAILED;
            break;

        case 'disconnected':
            this.delegate._startReconnectTimer(this.userID);
            this.state = qbRTCPeerConnection.State.DISCONNECTED;
            connectionState = Helpers.SessionConnectionState.DISCONNECTED;
            break;

        // TODO: this state doesn't fires on Safari 11
        case 'closed':
            this.delegate._stopReconnectTimer(this.userID);
            this.state = qbRTCPeerConnection.State.CLOSED;
            connectionState = Helpers.SessionConnectionState.CLOSED;
            break;

        default:
            break;
    }

    if (typeof this.delegate
        ._onSessionConnectionStateChangedListener === 'function' &&
        connectionState) {
        this.delegate._onSessionConnectionStateChangedListener(
            this.userID,
            connectionState
        );
    }

    if (this._pc.iceConnectionState === 'connected' &&
        typeof this.delegate._onRemoteStreamListener === 'function') {
        this.delegate._onRemoteStreamListener(this.userID, this.remoteStream);
    }
};

/**
 * PRIVATE
 */
qbRTCPeerConnection.prototype._clearStatsReportTimer = function () {
    if (this.statsReportTimer) {
        clearInterval(this.statsReportTimer);
        this.statsReportTimer = null;
    }
};

qbRTCPeerConnection.prototype._getStatsWrap = function () {
    var self = this,
        statsReportInterval,
        lastResult;

    if (config.webrtc && config.webrtc.statsReportTimeInterval && !self.statsReportTimer) {
        if (isNaN(+config.webrtc.statsReportTimeInterval)) {
            Helpers.traceError('statsReportTimeInterval (' + config.webrtc.statsReportTimeInterval + ') must be integer.');
            return;
        }
        statsReportInterval = config.webrtc.statsReportTimeInterval * 1000;

        var _statsReportCallback = function () {
            _getStats(self._pc, lastResult, function (results, lastResults) {
                lastResult = lastResults;
                self.delegate._onCallStatsReport(self.userID, results, null);
            }, function errorLog(err) {
                Helpers.traceError('_getStats error. ' + err.name + ': ' + err.message);
                self.delegate._onCallStatsReport(self.userID, null, err);
            });
        };

        Helpers.trace('Stats tracker has been started.');
        self.statsReportTimer = setInterval(_statsReportCallback, statsReportInterval);
    }
};

qbRTCPeerConnection.prototype._clearDialingTimer = function () {
    if (this.dialingTimer) {
        Helpers.trace('_clearDialingTimer');

        clearInterval(this.dialingTimer);
        this.dialingTimer = null;
        this.answerTimeInterval = 0;
    }
};

qbRTCPeerConnection.prototype._startDialingTimer = function (extension) {
    var self = this;
    var dialingTimeInterval = config.webrtc.dialingTimeInterval * 1000;

    Helpers.trace('_startDialingTimer, dialingTimeInterval: ' + dialingTimeInterval);

    var _dialingCallback = function (extension, skipIncrement) {
        if (!skipIncrement) {
            self.answerTimeInterval += dialingTimeInterval;
        }

        Helpers.trace('_dialingCallback, answerTimeInterval: ' + self.answerTimeInterval);

        if (self.answerTimeInterval >= config.webrtc.answerTimeInterval * 1000) {
            self._clearDialingTimer();
            self.delegate.processOnNotAnswer(self);
        } else {
            self.delegate.processCall(self, extension);
        }
    };

    self.dialingTimer = setInterval(
        _dialingCallback,
        dialingTimeInterval,
        extension,
        false
    );

    // call for the 1st time
    _dialingCallback(extension, true);
};

/**
 * PRIVATE
 */
function _getStats(peer, lastResults, successCallback, errorCallback) {
    var statistic = {
        'local': {
            'audio': {},
            'video': {},
            'candidate': {}
        },
        'remote': {
            'audio': {},
            'video': {},
            'candidate': {}
        }
    };

    if (Helpers.getVersionFirefox()) {
        var localStream = peer.getLocalStreams().length ? peer.getLocalStreams()[0] : peer.delegate.localStream,
            localVideoSettings = localStream.getVideoTracks().length ? localStream.getVideoTracks()[0].getSettings() : null;

        statistic.local.video.frameHeight = localVideoSettings && localVideoSettings.height;
        statistic.local.video.frameWidth = localVideoSettings && localVideoSettings.width;
    }

    peer.getStats(null).then(function (results) {
        results.forEach(function (result) {
            var item;

            if (result.bytesReceived && result.type === 'inbound-rtp') {
                item = statistic.remote[result.mediaType];
                item.bitrate = _getBitratePerSecond(result, lastResults, false);
                item.bytesReceived = result.bytesReceived;
                item.packetsReceived = result.packetsReceived;
                item.timestamp = result.timestamp;
                if (result.mediaType === 'video' && result.framerateMean) {
                    item.framesPerSecond = Math.round(result.framerateMean * 10) / 10;
                }
            } else if (result.bytesSent && result.type === 'outbound-rtp') {
                item = statistic.local[result.mediaType];
                item.bitrate = _getBitratePerSecond(result, lastResults, true);
                item.bytesSent = result.bytesSent;
                item.packetsSent = result.packetsSent;
                item.timestamp = result.timestamp;
                if (result.mediaType === 'video' && result.framerateMean) {
                    item.framesPerSecond = Math.round(result.framerateMean * 10) / 10;
                }
            } else if (result.type === 'local-candidate') {
                item = statistic.local.candidate;
                if (result.candidateType === 'host' && result.mozLocalTransport === 'udp' && result.transport === 'udp') {
                    item.protocol = result.transport;
                    item.ip = result.ipAddress;
                    item.port = result.portNumber;
                } else if (!Helpers.getVersionFirefox()) {
                    item.protocol = result.protocol;
                    item.ip = result.ip;
                    item.port = result.port;
                }
            } else if (result.type === 'remote-candidate') {
                item = statistic.remote.candidate;
                item.protocol = result.protocol || result.transport;
                item.ip = result.ip || result.ipAddress;
                item.port = result.port || result.portNumber;
            } else if (result.type === 'track' && result.kind === 'video' && !Helpers.getVersionFirefox()) {
                if (result.remoteSource) {
                    item = statistic.remote.video;
                    item.frameHeight = result.frameHeight;
                    item.frameWidth = result.frameWidth;
                    item.framesPerSecond = _getFramesPerSecond(result, lastResults, false);
                } else {
                    item = statistic.local.video;
                    item.frameHeight = result.frameHeight;
                    item.frameWidth = result.frameWidth;
                    item.framesPerSecond = _getFramesPerSecond(result, lastResults, true);
                }
            }
        });
        successCallback(statistic, results);
    }, errorCallback);

    function _getBitratePerSecond(result, lastResults, isLocal) {
        var lastResult = lastResults && lastResults.get(result.id),
            seconds = lastResult ? ((result.timestamp - lastResult.timestamp) / 1000) : 5,
            kilo = 1024,
            bit = 8,
            bitrate;

        if (!lastResult) {
            bitrate = 0;
        } else if (isLocal) {
            bitrate = bit * (result.bytesSent - lastResult.bytesSent) / (kilo * seconds);
        } else {
            bitrate = bit * (result.bytesReceived - lastResult.bytesReceived) / (kilo * seconds);
        }

        return Math.round(bitrate);
    }

    function _getFramesPerSecond(result, lastResults, isLocal) {
        var lastResult = lastResults && lastResults.get(result.id),
            seconds = lastResult ? ((result.timestamp - lastResult.timestamp) / 1000) : 5,
            framesPerSecond;

        if (!lastResult) {
            framesPerSecond = 0;
        } else if (isLocal) {
            framesPerSecond = (result.framesSent - lastResult.framesSent) / seconds;
        } else {
            framesPerSecond = (result.framesReceived - lastResult.framesReceived) / seconds;
        }

        return Math.round(framesPerSecond * 10) / 10;
    }
}

// Find the line in sdpLines[startLine...endLine - 1] that starts with |prefix|
// and, if specified, contains |substr| (case-insensitive search).
function findLineInRange(
  sdpLines,
  startLine,
  endLine,
  prefix,
  substr,
  direction
) {
  if (direction === undefined) {
    direction = 'asc';
  }

  direction = direction || 'asc';

  if (direction === 'asc') {
    // Search beginning to end
    var realEndLine = endLine !== -1 ? endLine : sdpLines.length;
    for (var i = startLine; i < realEndLine; ++i) {
      if (sdpLines[i].indexOf(prefix) === 0) {
        if (!substr ||
            sdpLines[i].toLowerCase().indexOf(substr.toLowerCase()) !== -1) {
          return i;
        }
      }
    }
  } else {
    // Search end to beginning
    var realStartLine = startLine !== -1 ? startLine : sdpLines.length-1;
    for (var j = realStartLine; j >= 0; --j) {
      if (sdpLines[j].indexOf(prefix) === 0) {
        if (!substr ||
            sdpLines[j].toLowerCase().indexOf(substr.toLowerCase()) !== -1) {
          return j;
        }
      }
    }
  }
  return null;
}

/**
 * Gets the codec payload type from an a=rtpmap:X line.
 * @param {string} sdpLine
 * @returns {string|null}
 */
function getCodecPayloadTypeFromLine(sdpLine) {
  var pattern = new RegExp('a=rtpmap:(\\d+) [a-zA-Z0-9-]+\\/\\d+');
  var result = sdpLine.match(pattern);
  return (result && result.length === 2) ? result[1] : null;
}

/**
 * Returns a new m= line with the specified codec as the first one.
 * @param {string} mLine
 * @param {string} payload
 * @returns {string}
 */
function setDefaultCodec(mLine, payload) {
  var elements = mLine.split(' ');

  // Just copy the first three parameters; codec order starts on fourth.
  var newLine = elements.slice(0, 3);

  // Put target payload first and copy in the rest.
  newLine.push(payload);
  for (var i = 3; i < elements.length; i++) {
    if (elements[i] !== payload) {
      newLine.push(elements[i]);
    }
  }
  return newLine.join(' ');
}

/**
 * Mangles SDP to put preferred codec at the beginning
 * @param {string} sdp
 * @param {'audio'|'video'} type
 * @param {string} codec VP9, VP8, H264, opus etc.
 * @returns {string}
 */
function setPreferredCodec(sdp, type, codec) {
    if (!codec) {
      return sdp;
    }

    var sdpLines = sdp.split('\r\n');

    // Search for m line.
    var mLineIndex = findLineInRange(sdpLines, 0, -1, 'm=', type);
    if (mLineIndex === null) {
      return sdp;
    }
  
    // If the codec is available, set it as the default in m line.
    var payload = null;
    // Iterate through rtpmap enumerations to find all matching codec entries
    for (var i = sdpLines.length-1; i >= 0 ; --i) {
      // Finds first match in rtpmap
      var index = findLineInRange(sdpLines, i, 0, 'a=rtpmap', codec, 'desc');
      if (index !== null) {
        // Skip all of the entries between i and index match
        i = index;
        payload = getCodecPayloadTypeFromLine(sdpLines[index]);
        if (payload) {
          // Move codec to top
          sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], payload);
        }
      } else {
        // No match means we can break the loop
        break;
      }
    }

    sdp = sdpLines.join('\r\n');
    return sdp;
}

/**
 * This is to fix error on legacy WebRTC implementations
 * @param {RTCSessionDescriptionInit} description
 */
function _removeExtmapMixedFromSDP(description) {
    if (description &&
        description.sdp &&
        description.sdp.indexOf('\na=extmap-allow-mixed') !== -1) {
        description.sdp = description.sdp
            .split('\n')
            .filter(function (line) {
                return line.trim() !== 'a=extmap-allow-mixed';
            })
            .join('\n');
    }
    return description;
}

/**
 * @param {string} sdp 
 * @param {'audio'|'video'} media 
 * @param {number} [bitrate] 
 * @returns {string}
 */
function setMediaBitrate(sdp, media, bitrate) {
    if (!bitrate) {
        return sdp
            .replace(/b=AS:.*\r\n/, '')
            .replace(/b=TIAS:.*\r\n/, '');
    }

    var lines = sdp.split('\n'),
        line = -1,
        modifier = Helpers.getVersionFirefox() ? 'TIAS' : 'AS',
        amount = Helpers.getVersionFirefox() ? bitrate * 1024 : bitrate;

    for (var i = 0; i < lines.length; i++) {
        if (lines[i].indexOf("m=" + media) === 0) {
            line = i;
            break;
        }
    }

    if (line === -1) {
        return sdp;
    }

    line++;

    while (lines[line].indexOf('i=') === 0 || lines[line].indexOf('c=') === 0) {
        line++;
    }

    if (lines[line].indexOf('b') === 0) {
        lines[line] = 'b=' + modifier + ':' + amount;
        return lines.join('\n');
    }

    var newLines = lines.slice(0, line);
    newLines.push('b=' + modifier + ':' + amount);
    newLines = newLines.concat(lines.slice(line, lines.length));

    return newLines.join('\n');
}

module.exports = qbRTCPeerConnection;
