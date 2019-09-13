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
    this.ice = [];

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

    var self = this;

    this._clearDialingTimer();
    this._clearStatsReportTimer();

    if (this.connectionState !== 'closed') {

        var streams = {
            "LocalStreams" : self.getLocalStreams(),
            "RemoteStreams" : (self.getRemoteStreams())
                .concat([this.remoteStream])
                .concat([this.stream])
        };

        if(this.remoteStreams && this.remoteStreams.length>0) {
            streams.RemoteStreams = streams.RemoteStreams.concat(this.remoteStreams);
        }

        Object.keys(streams).forEach(function (key) {
            streams[key].forEach(function (stream,index,array) {
                if(stream && stream.getTracks) {
                    stream.getTracks().forEach(function (track) {
                        if (key === "RemoteStreams") {
                            track.stop();
                        }
                        if (self.removeTrack) {
                            var tmp = self.getSenders().find(function (sender) {
                                return sender.track == track;
                            });
                            if (tmp !== undefined) {
                                self.removeTrack(tmp);
                            }
                        }
                    });
                }
                if(self.removeStream && typeof stream === "object" && stream instanceof MediaStream){
                    self.removeStream(stream);
                }else {
                    array[index] = null;
                }
            });
        });

        this.close();
        if (navigator.userAgent.indexOf("Edge") > -1) {
            this.connectionState = 'closed';
            this.iceConnectionState = 'closed';
        }

    }

    // TODO: 'closed' state doesn't fires on Safari 11 and Edge (do it manually)
    if (Helpers.getVersionSafari() >= 11 || navigator.userAgent.indexOf("Edge") > -1) {
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
    var self = this;
    var ffVersion = Helpers.getVersionFirefox();

    var modifiedSDP;
    if (ffVersion !== null && (ffVersion === 56 || ffVersion === 57) && !self.delegate.bandwidth) {
        modifiedSDP = _modifySDPforFixIssueFFAndFreezes(remoteSessionDescription);
    } else {
        modifiedSDP = setMediaBitrate(remoteSessionDescription, 'video', self.delegate.bandwidth);
    }
    var sessionDescription = new RTCSessionDescription({sdp: modifiedSDP, type: type});
    function successCallback(sessionDescription) {
        if(self.ice.length>0) {
            self.addCandidates();
        }
        callback(null);
    }

    function errorCallback(error) {
        callback(error);
    }

    self.setRemoteDescription(sessionDescription).then(successCallback, errorCallback);
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

RTCPeerConnection.prototype._addIceCandidate = function(iceCandidates) {
    this.addIceCandidate(
        new RTCIceCandidate({
            sdpMLineIndex: iceCandidates.sdpMLineIndex,
            sdpMid: iceCandidates.sdpMid,
            candidate: iceCandidates.candidate
        }),
        function() {},
        function(error){
            Helpers.traceError("Error on 'addIceCandidate': " + error);
        }
    );
};

RTCPeerConnection.prototype.addCandidates = function(iceCandidates) {
    var self = this;

    if(iceCandidates && iceCandidates.length > 0){
        iceCandidates = iceCandidates.filter(iceCandidate => self.ice.indexOf(iceCandidate) === -1);
        self.ice = self.ice.concat(iceCandidates);
    }

    if(self.remoteDescription && self.remoteDescription.type){
        self.ice.forEach(function (tmp, i) {
            self._addIceCandidate(tmp);
            delete self.ice[i];
        });
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

    peer.getStats(null).then(function(results) {
        results.forEach(function(result) {
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
    if (!bitrate) {
        var modifiedSDP = sdp.replace(/b=AS:.*\r\n/, '').replace(/b=TIAS:.*\r\n/, '');
        return modifiedSDP;
    }

    var lines = sdp.split('\n'),
        line = -1,
        modifier = Helpers.getVersionFirefox() ? 'TIAS' : 'AS',
        amount = Helpers.getVersionFirefox() ? bitrate*1024 : bitrate;

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
        lines[line] = 'b='+modifier+':'+amount;
        return lines.join('\n');
    }

    var newLines = lines.slice(0, line);
    newLines.push('b='+modifier+':'+amount);
    newLines = newLines.concat(lines.slice(line, lines.length));

    return newLines.join('\n');
}

module.exports = RTCPeerConnection;
