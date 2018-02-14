'use strict';

/** JSHint inline rules (TODO: loopfunc will delete) */
/* jshint loopfunc: true */
/* globals MediaStream */

/**
 * QuickBlox JavaScript SDK
 * WebRTC Module (WebRTC peer connection model)
 */

/** Modules */
var config = require('../../qbConfig');
var Helpers = require('./qbWebRTCHelpers');

var transform = require('sdp-transform');

var RTCPeerConnection = window.RTCPeerConnection;
var RTCSessionDescription = window.RTCSessionDescription;
var RTCIceCandidate = window.RTCIceCandidate;

RTCPeerConnection.State = {
    NEW: 1,
    CONNECTING: 2,
    CHECKING: 3,
    CONNECTED: 4,
    DISCONNECTED: 5,
    FAILED: 6,
    CLOSED: 7,
    COMPLETED: 8
};

RTCPeerConnection.prototype._init = function(delegate, userID, sessionID, type) {
    Helpers.trace('RTCPeerConnection init. userID: ' + userID + ', sessionID: ' + sessionID + ', type: ' + type);

    this.delegate = delegate;

    this.sessionID = sessionID;
    this.userID = userID;
    this.type = type;
    this.remoteSDP = null;

    this.state = RTCPeerConnection.State.NEW;

    this.onicecandidate = this.onIceCandidateCallback.bind(this);
    this.onsignalingstatechange = this.onSignalingStateCallback.bind(this);
    this.oniceconnectionstatechange = this.onIceConnectionStateCallback.bind(this);

    if (Helpers.getVersionSafari() >= 11) {
        this.remoteStream = new MediaStream();
        this.ontrack = this.onAddRemoteMediaCallback.bind(this);
        this.onStatusClosedChecker = undefined;
    } else {
        this.remoteStream = null;
        this.onaddstream = this.onAddRemoteMediaCallback.bind(this);
    }

    /** We use this timer interval to dial a user - produce the call requests each N seconds. */
    this.dialingTimer = null;
    this.answerTimeInterval = 0;
    this.statsReportTimer = null;

    this.iceCandidates = [];
};

RTCPeerConnection.prototype.release = function(){
    this._clearDialingTimer();
    this._clearStatsReportTimer();

    if (this.connectionState !== 'closed') {
        this.close();
    }

    // TODO: 'closed' state doesn't fires on Safari 11 (do it manually)
    if (Helpers.getVersionSafari() >= 11) {
        this.onIceConnectionStateCallback();
    }
};

RTCPeerConnection.prototype.updateRemoteSDP = function(newSDP){
    if (!newSDP) {
        throw new Error("sdp string can't be empty.");
    } else {
        this.remoteSDP = newSDP;
    }
};

RTCPeerConnection.prototype.getRemoteSDP = function(){
    return this.remoteSDP;
};

RTCPeerConnection.prototype.setRemoteSessionDescription = function(type, remoteSessionDescription, callback) {
    var self = this,
        desc = new RTCSessionDescription({sdp: remoteSessionDescription, type: type}),
        ffVersion = Helpers.getVersionFirefox();
        
    if (ffVersion !== null && (ffVersion === 56 || ffVersion === 57) && !self.delegate.bandwidth) {
        desc.sdp = _modifySDPforFixIssueFFAndFreezes(desc.sdp);
    } else {
        desc.sdp = setMediaBitrate(desc.sdp, 'video', self.delegate.bandwidth);
    }
        
    function successCallback(desc) {
        callback(null);
    }

    function errorCallback(error) {
        callback(error);
    }

    self.setRemoteDescription(desc).then(successCallback, errorCallback);
};

RTCPeerConnection.prototype.addLocalStream = function(localStream){
    if (localStream) {
        this.addStream(localStream);
    } else {
        throw new Error("'RTCPeerConnection.addStream' error: stream is 'null'.");
    }
};

RTCPeerConnection.prototype.getAndSetLocalSessionDescription = function(callType, callback) {
    var self = this;

    self.state = RTCPeerConnection.State.CONNECTING;

    if (self.type === 'offer') {
        // Additional parameters for SDP Constraints
        // http://www.w3.org/TR/webrtc/#h-offer-answer-options

        self.createOffer().then(function(offer) {
            offer.sdp = setMediaBitrate(offer.sdp, 'video', self.delegate.bandwidth);
            successCallback(offer);
        }).catch(function(reason) {
            errorCallback(reason);
        });

    } else {
        self.createAnswer().then(function(answer) {
            answer.sdp = setMediaBitrate(answer.sdp, 'video', self.delegate.bandwidth);
            successCallback(answer);
        }).catch(function(reason) {
            errorCallback(reason);
        });
    }

    function successCallback(desc) {
        /**
         * It's to fixed issue
         * https://bugzilla.mozilla.org/show_bug.cgi?id=1377434
         * callType === 2 is audio only
         */
        var ffVersion = Helpers.getVersionFirefox();
        
        if (ffVersion !== null && ffVersion < 55 && callType === 2 && self.type === 'offer') {
            desc.sdp = _modifySDPforFixIssue(desc.sdp);
        }
        
        self.setLocalDescription(desc).then(function() {
            callback(null);
        }).catch(function(error) {
            errorCallback(error);
        });
    }

    function errorCallback(error) {
        callback(error);
    }
};

RTCPeerConnection.prototype.addCandidates = function(iceCandidates) {
    var candidate;

    for (var i = 0, len = iceCandidates.length; i < len; i++) {
        candidate = {
            sdpMLineIndex: iceCandidates[i].sdpMLineIndex,
            sdpMid: iceCandidates[i].sdpMid,
            candidate: iceCandidates[i].candidate
        };
        this.addIceCandidate(
            new RTCIceCandidate(candidate),
            function() {},
            function(error){
                Helpers.traceError("Error on 'addIceCandidate': " + error);
            }
        );
    }
};

RTCPeerConnection.prototype.toString = function sessionToString() {
    return 'sessionID: ' + this.sessionID + ', userID:  ' + this.userID + ', type: ' + this.type + ', state: ' + this.state;
};

/**
 * CALLBACKS
 */
RTCPeerConnection.prototype.onSignalingStateCallback = function() {
    if (this.signalingState === 'stable' && this.iceCandidates.length > 0){
        this.delegate.processIceCandidates(this, this.iceCandidates);
        this.iceCandidates.length = 0;
    }
};

RTCPeerConnection.prototype.onIceCandidateCallback = function(event) {
    var candidate = event.candidate;

    if (candidate) {
        /**
         * collecting internally the ice candidates
         * will send a bit later
         */
        var ICECandidate = {
            sdpMLineIndex: candidate.sdpMLineIndex,
            sdpMid: candidate.sdpMid,
            candidate: candidate.candidate
        };

        if (this.signalingState === 'stable') {
            this.delegate.processIceCandidates(this, [ICECandidate]);
        } else {
            this.iceCandidates.push(ICECandidate);
        }
    }
};

/** handler of remote media stream */
RTCPeerConnection.prototype.onAddRemoteMediaCallback = function(event) {
    var self = this;

    if (typeof self.delegate._onRemoteStreamListener === 'function') {
        if (event.type === 'addstream') {
            self.remoteStream = event.stream;
        } else {
            self.remoteStream.addTrack(event.track);
        }

        if (((self.delegate.callType == 1) && self.remoteStream.getVideoTracks().length) ||
            ((self.delegate.callType == 2) && self.remoteStream.getAudioTracks().length)) {
            this.delegate._onRemoteStreamListener(self.userID, self.remoteStream);
        }

        self._getStatsWrap();
    }
};

RTCPeerConnection.prototype.onIceConnectionStateCallback = function() {
    Helpers.trace("onIceConnectionStateCallback: " + this.iceConnectionState);
    var self = this;
    /**
     * read more about all states:
     * http://w3c.github.io/webrtc-pc/#idl-def-RTCIceConnectionState
     * 'disconnected' happens in a case when a user has killed an application (for example, on iOS/Android via task manager).
     * So we should notify our user about it.
     */
    if (typeof this.delegate._onSessionConnectionStateChangedListener === 'function'){
        var connectionState = null;

        if (Helpers.getVersionSafari() >= 11) {
            clearTimeout(this.onStatusClosedChecker);
        }

        switch (this.iceConnectionState) {
            case 'checking':
                this.state = RTCPeerConnection.State.CHECKING;
                connectionState = Helpers.SessionConnectionState.CONNECTING;
                break;

            case 'connected':
                this._clearWaitingReconnectTimer();
                this.state = RTCPeerConnection.State.CONNECTED;
                connectionState = Helpers.SessionConnectionState.CONNECTED;
                break;

            case 'completed':
                this._clearWaitingReconnectTimer();
                this.state = RTCPeerConnection.State.COMPLETED;
                connectionState = Helpers.SessionConnectionState.COMPLETED;
                break;

            case 'failed':
                this.state = RTCPeerConnection.State.FAILED;
                connectionState = Helpers.SessionConnectionState.FAILED;
                break;

            case 'disconnected':
                this._startWaitingReconnectTimer();
                this.state = RTCPeerConnection.State.DISCONNECTED;
                connectionState = Helpers.SessionConnectionState.DISCONNECTED;

                // repeat to call onIceConnectionStateCallback to get status "closed"
                if (Helpers.getVersionSafari() >= 11) {
                    this.onStatusClosedChecker = setTimeout(function() {
                        self.onIceConnectionStateCallback();
                    }, 500);
                }
                break;

            // TODO: this state doesn't fires on Safari 11
            case 'closed':
                this._clearWaitingReconnectTimer();
                this.state = RTCPeerConnection.State.CLOSED;
                connectionState = Helpers.SessionConnectionState.CLOSED;
                break;

            default:
                break;
        }

        if (connectionState) {
            self.delegate._onSessionConnectionStateChangedListener(this.userID, connectionState);
        }
    }
};

/**
 * PRIVATE
 */
RTCPeerConnection.prototype._clearStatsReportTimer = function(){
    if (this.statsReportTimer){
        clearInterval(this.statsReportTimer);
        this.statsReportTimer = null;
    }
};

RTCPeerConnection.prototype._getStatsWrap = function() {
    var self = this,
        localStream = self.getLocalStreams().length ? self.getLocalStreams()[0] : self.delegate.localStream,
        statsReportInterval,
        lastResult;

    if (config.webrtc && config.webrtc.statsReportTimeInterval) {
        if (isNaN(+config.webrtc.statsReportTimeInterval)) {
            Helpers.traceError('statsReportTimeInterval (' + config.webrtc.statsReportTimeInterval + ') must be integer.');
            return;
        }
        statsReportInterval = config.webrtc.statsReportTimeInterval * 1000;

        var _statsReportCallback = function() {
            _getStats(self, lastResult, function(results, lastResults) {
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

RTCPeerConnection.prototype._clearWaitingReconnectTimer = function() {
    if(this.waitingReconnectTimeoutCallback){
        Helpers.trace('_clearWaitingReconnectTimer');
        clearTimeout(this.waitingReconnectTimeoutCallback);
        this.waitingReconnectTimeoutCallback = null;
    }
};

RTCPeerConnection.prototype._startWaitingReconnectTimer = function() {
    var self = this,
        timeout = config.webrtc.disconnectTimeInterval * 1000,
        waitingReconnectTimeoutCallback = function() {
            Helpers.trace('waitingReconnectTimeoutCallback');

            clearTimeout(self.waitingReconnectTimeoutCallback);

            self.release();

            self.delegate._closeSessionIfAllConnectionsClosed();
        };

    Helpers.trace('_startWaitingReconnectTimer, timeout: ' + timeout);

    self.waitingReconnectTimeoutCallback = setTimeout(waitingReconnectTimeoutCallback, timeout);
};

RTCPeerConnection.prototype._clearDialingTimer = function(){
    if(this.dialingTimer){
        Helpers.trace('_clearDialingTimer');

        clearInterval(this.dialingTimer);
        this.dialingTimer = null;
        this.answerTimeInterval = 0;
    }
};

RTCPeerConnection.prototype._startDialingTimer = function(extension, withOnNotAnswerCallback){
    var self = this;
    var dialingTimeInterval = config.webrtc.dialingTimeInterval*1000;

    Helpers.trace('_startDialingTimer, dialingTimeInterval: ' + dialingTimeInterval);

    var _dialingCallback = function(extension, withOnNotAnswerCallback, skipIncrement){
        if(!skipIncrement){
            self.answerTimeInterval += config.webrtc.dialingTimeInterval*1000;
        }

        Helpers.trace('_dialingCallback, answerTimeInterval: ' + self.answerTimeInterval);

        if(self.answerTimeInterval >= config.webrtc.answerTimeInterval*1000){
            self._clearDialingTimer();

            if(withOnNotAnswerCallback){
                self.delegate.processOnNotAnswer(self);
            }
        }else{
            self.delegate.processCall(self, extension);
        }
    };

    self.dialingTimer = setInterval(_dialingCallback, dialingTimeInterval, extension, withOnNotAnswerCallback, false);

    // call for the 1st time
    _dialingCallback(extension, withOnNotAnswerCallback, true);
};

/**
 * PRIVATE
 */
function _getStats(peer, lastResults, successCallback, errorCallback) {
    var statistic = {
        'inbound_audio': null,
        'inbound_video': null,
        'outbound_audio': null,
        'outbound_video': null,
        'total_transport': null,
    };

    peer.getStats(null).then(function(results) {
        results.forEach(function(result) {
            var item = {};
            if (result.bytesSent && result.type === 'outbound-rtp') {
                item.bitrate = _getBitratePerSecond(result, lastResults, true);
                item.type = result.type;
                item.mediaType = result.mediaType;
                item.bytesSent = result.bytesSent;
                item.packetsSent = result.packetsSent;
                item.timestamp = result.timestamp;
                statistic['outbound_' + result.mediaType] = item;
            }
            if (result.bytesReceived && result.type === 'inbound-rtp') {
                item.bitrate = _getBitratePerSecond(result, lastResults, false);   
                item.type = result.type;
                item.mediaType = result.mediaType;
                item.bytesReceived = result.bytesReceived;
                item.packetsReceived = result.packetsReceived;
                item.timestamp = result.timestamp;
                statistic['inbound_' + result.mediaType] = item;
            }
            if (result.bytesSent && result.bytesReceived && result.type === 'transport') {
                item.bitrate_out = _getBitratePerSecond(result, lastResults, true);
                item.bitrate_in = _getBitratePerSecond(result, lastResults, false);    
                item.type = result.type;
                item.bytesSent = result.bytesSent;
                item.bytesReceived = result.bytesReceived;
                item.timestamp = result.timestamp;
                statistic['total_' + result.type] = item;
            }
        });
        successCallback(statistic, results);
    }, errorCallback);

    function _getBitratePerSecond(result, lastResults, isSent) {
        var lastResult = lastResults && lastResults.get(result.id),
            bit = 8,
            bitrate;

        if (!lastResult) {
            bitrate = 0;
        } else if (isSent) {
            bitrate = bit*(result.bytesSent-lastResult.bytesSent)/(result.timestamp-lastResult.timestamp);
        } else {
            bitrate = bit*(result.bytesReceived-lastResult.bytesReceived)/(result.timestamp-lastResult.timestamp);
        }
        return Math.round(bitrate);
    }
}

/**
 * It's functions to fixed issue
 * https://bugzilla.mozilla.org/show_bug.cgi?id=1377434
 */
function _modifySDPforFixIssue(sdp) {
    var parsedSDP = transform.parse(sdp);

    parsedSDP.groups = parsedSDP.groups ? parsedSDP.groups : [];
    parsedSDP.groups.push({
        mids: 'sdparta_0',
        type: 'BUNDLE'
    });

    return transform.write(parsedSDP);
}

/**
 * It's functions to fixed issue
 * https://blog.mozilla.org/webrtc/when-your-video-freezes/
 */
function _modifySDPforFixIssueFFAndFreezes(sdp) {
    return setMediaBitrate(sdp, 'video', 12288);
}

function setMediaBitrate(sdp, media, bitrate) {
    var lines = sdp.split('\n');
    var line = -1;
    var modifier = 'AS';

    for (var i = 0; i < lines.length; i++) {
        if (lines[i].indexOf("m="+media) === 0) {
            line = i;
            break;
        }
    }

    if (line === -1) {
        return sdp;
    }

    line++;

    while(lines[line].indexOf('i=') === 0 || lines[line].indexOf('c=') === 0) {
        line++;
    }

    if (lines[line].indexOf('b') === 0) {
        lines[line] = 'b='+modifier+':'+bitrate;
        return lines.join('\n');
    }

    var newLines = lines.slice(0, line);

    newLines.push('b='+modifier+':'+bitrate);
    newLines = newLines.concat(lines.slice(line, lines.length));
    
    return newLines.join('\n');
}

module.exports = RTCPeerConnection;
