'use strict';

/**
 * QuickBlox JavaScript SDK
 * WebRTC Module (WebRTC session model)
 */

/**
 * User's callbacks (listener-functions):
 * - onUserNotAnswerListener(session, userID)
 * - onRemoteStreamListener(session, userID, stream)
 * - onSessionConnectionStateChangedListener(session, userID, connectionState)
 * - onSessionCloseListener(session)
 * - onCallStatsReport(session, userId, stats, error)
 */

var config = require('../../qbConfig');
var RTCPeerConnection = require('./qbRTCPeerConnection');
var Utils = require('../../qbUtils');
var Helpers = require('./qbWebRTCHelpers');
var SignalingConstants = require('./qbWebRTCSignalingConstants');

/**
 * State of a session
 */
WebRTCSession.State = {
    NEW: 1,
    ACTIVE: 2,
    HUNGUP: 3,
    REJECTED: 4,
    CLOSED: 5
};


/**
 * Creates a session
 * @param {number} An ID if the call's initiator
 * @param {array} An array with opponents
 * @param {enum} Type of a call
 */
function WebRTCSession(params) {
    this.ID = params.sessionID ? params.sessionID : generateUUID();
    this.state = WebRTCSession.State.NEW;

    this.initiatorID = parseInt(params.initiatorID);
    this.opponentsIDs = params.opIDs;
    this.callType = parseInt(params.callType);

    this.peerConnections = {};

    this.localStream = null;

    this.mediaParams = null;

    this.signalingProvider = params.signalingProvider;

    this.currentUserID = params.currentUserID;

    this.bandwidth = params.bandwidth;

    /**
     * We use this timeout to fix next issue:
     * "From Android/iOS make a call to Web and kill the Android/iOS app instantly. Web accept/reject popup will be still visible.
     * We need a way to hide it if sach situation happened."
     */
    this.answerTimer = null;

    this.startCallTime = 0;
    this.acceptCallTime = 0;
}

/**
 * Get the user media stream
 * @param {map} A map media stream constrains
 * @param {function} A callback to get a result of the function
 */
WebRTCSession.prototype.getUserMedia = function(params, callback) {
    if(!navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia() is not supported in your browser');
    }

    var self = this;

    /**
     * Additional parameters for Media Constraints
     * http://tools.ietf.org/html/draft-alvestrand-constraints-resolution-00
     *
     * googEchoCancellation: true
     * googAutoGainControl: true
     * googNoiseSuppression: true
     * googHighpassFilter: true
     * minWidth: 640
     * minHeight: 480
     * maxWidth: 1280
     * maxHeight: 720
     * minFrameRate: 60
     * maxAspectRatio: 1.333
     */

    navigator.mediaDevices.getUserMedia({
        audio: params.audio || false,
        video: params.video || false
    }).then(function(stream) {
        self.localStream = stream;
        self.mediaParams = params;

        if (params.elemId) {
            self.attachMediaStream(params.elemId, stream, params.options);
        }

        callback(null, stream);
    }).catch(function(err) {
        callback(err, null);
    });
};

/**
 * Get the state of connection
 * @param {number} The User Id
 */
WebRTCSession.prototype.connectionStateForUser = function(userID) {
    var peerConnection = this.peerConnections[userID];

    if (peerConnection) {
        return peerConnection.state;
    }

    return null;
};

/**
 * Attach media stream to audio/video element
 * @param {string} The Id of an ellement to attach a stream
 * @param {object} The steram to attach
 * @param {object} The additional options
 */
WebRTCSession.prototype.attachMediaStream = function(id, stream, options) {
    var elem = document.getElementById(id);

    if (elem) {
        if (typeof elem.srcObject === 'object') {
            elem.srcObject = stream;
        } else {
            elem.src = window.URL.createObjectURL(stream);
        }

        if (options && options.muted) {
            elem.muted = true;
        }

        if (options && options.mirror) {
            elem.style.webkitTransform = 'scaleX(-1)';
            elem.style.transform = 'scaleX(-1)';
        }

        elem.onloadedmetadata = function(e) {
            elem.play();
        };
    } else {
        throw new Error('Unable to attach media stream, element ' + id  + ' is undefined');
    }
};

/**
 * Detach media stream from audio/video element
 * @param {string} The Id of an element to detach a stream
 */
WebRTCSession.prototype.detachMediaStream = function(id) {
    var elem = document.getElementById(id);

    if (elem) {
        elem.pause();

        if (elem.srcObject && typeof elem.srcObject === 'object') {
            elem.srcObject.getTracks().forEach(
                function(track){
                    track.stop();
                    track.enabled = false;
                }
            );
            elem.srcObject = null;
        } else {
            elem.src = '';
        }

        elem.removeAttribute("src");
        elem.removeAttribute("srcObject");
    }
};

/**
 * Switch media tracks in audio/video HTML's element and replace its in peers.
 * @param {object} deviceIds - the object with deviceIds of plugged devices
 * @param {string} [deviceIds.audio] - the deviceId, it can be gotten from QB.webrtc.getMediaDevices('audioinput')
 * @param {string} [deviceIds.video] - the deviceId, it can be gotten from QB.webrtc.getMediaDevices('videoinput')
 * @param {switchMediaTracksCallback} callback - the callback to get a result of the function
 *
 * @example
 * var switchMediaTracksBtn = document.getElementById('confirmSwitchMediaTracks');
 *
 * var webRTCSession = QB.webrtc.createNewSession(params);
 *
 * QB.webrtc.getMediaDevices('videoinput').then(function(devices) {
 *     var selectVideoInput = document.createElement('select'),
 *         selectVideoInput.id = 'videoInput',
 *         someDocumentElement.appendChild(selectVideoInput);
 * 
 *     if (devices.length > 1) {
 *         for (var i = 0; i !== devices.length; ++i) {
 *             var device = devices[i],
 *                 option = document.createElement('option');
 * 
 *             if (device.kind === 'videoinput') {
 *                 option.value = device.deviceId;
 *                 option.text = device.label;
 *                 selectVideoInput.appendChild(option);
 *             }
 *         }
 *     }
 * }).catch(function(error) {
 *     console.error(error);
 * });
 *
 * QB.webrtc.getMediaDevices('audioinput').then(function(devices) {
 *     var selectAudioInput = document.createElement('select'),
 *         selectAudioInput.id = 'audioInput',
 *         someDocumentElement.appendChild(selectAudioInput);
 * 
 *     if (devices.length > 1) {
 *         for (var i = 0; i !== devices.length; ++i) {
 *             var device = devices[i],
 *                 option = document.createElement('option');
 * 
 *             if (device.kind === 'audioinput') {
 *                 option.value = device.deviceId;
 *                 option.text = device.label;
 *                 selectAudioInput.appendChild(option);
 *             }
 *         }
 *     }
 * }).catch(function(error) {
 *     console.error(error);
 * });
 *
 * switchMediaTracksBtn.onclick = function(event) {
 *     var audioDeviceId = document.getElementById('audioInput').value || undefined,
 *         videoDeviceId = document.getElementById('videoInput').value || undefined,
 *         deviceIds = {
 *             audio: audioDeviceId,
 *             video: videoDeviceId,
 *         };
 * 
 *     var callback = function(error, stream) {
 *             if (err) {
 *                 console.error(error);
 *             } else {
 *                 console.log(stream);
 *             }
 *          };
 * 
 *     // Switch media tracks in audio/video HTML's element (the local stream)
 *     // replace media tracks in peers (will change media tracks for each user in WebRTC session)
 *     webRTCSession.switchMediaTracks(deviceIds, callback);
 * }
 */
WebRTCSession.prototype.switchMediaTracks = function(deviceIds, callback) {
    /**
     * Callback for webRTCSession.switchMediaTracks(deviceIds, callback)
     * @callback switchMediaTracksCallback
     * @param {object} error - The error object
     * @param {object} stream - The stream from new media device
     */

    if(!navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia() is not supported in your browser');
    }

    var self = this,
        localStream = this.localStream;

    if (deviceIds && deviceIds.audio) {
        self.mediaParams.audio.deviceId = deviceIds.audio;
    }

    if (deviceIds && deviceIds.video) {
        self.mediaParams.video.deviceId = deviceIds.video;
    }

    localStream.getTracks().forEach(function(track) {
        track.stop();
    });

    navigator.mediaDevices.getUserMedia({
        audio: self.mediaParams.audio || false,
        video: self.mediaParams.video || false
    }).then(function(stream) {
        self._replaceTracks(stream);
        callback(null, stream);
    }).catch(function(error) {
        callback(error, null);
    });
};

WebRTCSession.prototype._replaceTracks = function(stream) {
    var peers = this.peerConnections,
        localStream = this.localStream,
        elemId = this.mediaParams.elemId,
        ops = this.mediaParams.options,
        newStreamTracks = stream.getTracks();

    this.detachMediaStream(elemId);

    newStreamTracks.forEach(function(track) {
        localStream.addTrack(track);
    });

    this.attachMediaStream(elemId, stream, ops);

    for (var userId in peers) {
        _replaceTracksForPeer(peers[userId]);
    }

    function _replaceTracksForPeer(peer) {
        peer.getSenders().map(function(sender) {
            sender.replaceTrack(newStreamTracks.find(function(track) {
                return track.kind === sender.track.kind;
            }));
        });
    }
};

/**
 * [Initiate a call]
 * @param  {object}   extension [custom parametrs]
 * @param  {Function} callback
 */
WebRTCSession.prototype.call = function(extension, callback) {
    var self = this,
        ext = _prepareExtension(extension);

    Helpers.trace('Call, extension: ' + JSON.stringify(ext.userInfo));

    self.state = WebRTCSession.State.ACTIVE;

    // create a peer connection for each opponent
    self.opponentsIDs.forEach(function(userID, i, arr) {
        self._callInternal(userID, ext, true);
    });

    if (typeof callback === 'function') {
        callback(null);
    }
};

WebRTCSession.prototype._callInternal = function(userID, extension, withOnNotAnswerCallback) {
    var self = this;
    var peer = self._createPeer(userID, 'offer');

    var safariVersion = Helpers.getVersionSafari();

    if (safariVersion && safariVersion >= 11) {
        self.localStream.getTracks().forEach(function(track) {
            peer.addTrack(track, self.localStream);
        });
    } else {
        peer.addLocalStream(self.localStream);
    }

    this.peerConnections[userID] = peer;

    peer.getAndSetLocalSessionDescription(this.callType, function(err) {
        if (err) {
            Helpers.trace("getAndSessionDescription error: " + err);
        } else {
            Helpers.trace("getAndSessionDescription success");
            /** let's send call requests to user */
            peer._startDialingTimer(extension, withOnNotAnswerCallback);
        }
    });
};

/**
 * Accept a call
 * @param {array} A map with custom parameters
 */
WebRTCSession.prototype.accept = function(extension) {
    var self = this,
        ext = _prepareExtension(extension);

    Helpers.trace('Accept, extension: ' + JSON.stringify(ext.userInfo));

    if(self.state === WebRTCSession.State.ACTIVE) {
        Helpers.traceError("Can't accept, the session is already active, return.");
        return;
    }

    if(self.state === WebRTCSession.State.CLOSED) {
        Helpers.traceError("Can't accept, the session is already closed, return.");
        self.stop({});
        return;
    }

    self.state = WebRTCSession.State.ACTIVE;

    self.acceptCallTime = new Date();

    self._clearAnswerTimer();

    self._acceptInternal(self.initiatorID, ext);

    /** The group call logic starts here */
    var oppIDs = self._uniqueOpponentsIDsWithoutInitiator();

    /** in a case of group video chat */
    if(oppIDs.length > 0){
        var offerTime = (self.acceptCallTime - self.startCallTime) / 1000;
        self._startWaitingOfferOrAnswerTimer(offerTime);

        /**
         * here we have to decide to which users the user should call.
         * We have a rule: If a userID1 > userID2 then a userID1 should call to userID2.
         */
        oppIDs.forEach(function(opID, i, arr) {
            if(self.currentUserID > opID){
                /** call to the user */
                self._callInternal(opID, {}, true);
            }
        });
    }
};

WebRTCSession.prototype._acceptInternal = function(userID, extension) {
    var self = this;

    /** create a peer connection */
    var peerConnection = this.peerConnections[userID];

    if (peerConnection) {
        var safariVersion = Helpers.getVersionSafari();

        if (safariVersion && safariVersion >= 11) {
            self.localStream.getTracks().forEach(function(track) {
                peerConnection.addTrack(track, self.localStream);
            });
        } else {
            peerConnection.addLocalStream(self.localStream);
        }

        peerConnection.setRemoteSessionDescription('offer', peerConnection.getRemoteSDP(), function(error){
            if(error){
                Helpers.traceError("'setRemoteSessionDescription' error: " + error);
            }else{
                Helpers.trace("'setRemoteSessionDescription' success");

                peerConnection.getAndSetLocalSessionDescription(self.callType, function(err) {
                    if (err) {
                        Helpers.trace("getAndSetLocalSessionDescription error: " + err);
                    } else {

                        extension.sessionID = self.ID;
                        extension.callType = self.callType;
                        extension.callerID = self.initiatorID;
                        extension.opponentsIDs = self.opponentsIDs;
                        extension.sdp = peerConnection.localDescription.sdp;

                        self.signalingProvider.sendMessage(userID, extension, SignalingConstants.SignalingType.ACCEPT);
                    }
                });
            }
        });
    }else{
        Helpers.traceError("Can't accept the call, there is no information about peer connection by some reason.");
    }
};

/**
 * Reject a call
 * @param {array} A map with custom parameters
 */
WebRTCSession.prototype.reject = function(extension) {
    var self = this,
        ext = _prepareExtension(extension);
    var peersLen = Object.keys(self.peerConnections).length;

    Helpers.trace('Reject, extension: ' + JSON.stringify(ext.userInfo));

    self.state = WebRTCSession.State.REJECTED;

    self._clearAnswerTimer();

    ext.sessionID = self.ID;
    ext.callType = self.callType;
    ext.callerID = self.initiatorID;
    ext.opponentsIDs = self.opponentsIDs;

    if(peersLen > 0){
        for (var key in self.peerConnections) {
            var peerConnection = self.peerConnections[key];
            self.signalingProvider.sendMessage(peerConnection.userID, ext, SignalingConstants.SignalingType.REJECT);
        }
    }

    self._close();
};

/**
 * Stop a call
 * @param {array} A map with custom parameters
 */
WebRTCSession.prototype.stop = function(extension) {
    var self = this,
        ext = _prepareExtension(extension),
        peersLen = Object.keys(self.peerConnections).length;

    Helpers.trace('Stop, extension: ' + JSON.stringify(ext.userInfo));

    self.state = WebRTCSession.State.HUNGUP;

    if(self.answerTimer) {
        self._clearAnswerTimer();
    }

    ext.sessionID = self.ID;
    ext.callType = self.callType;
    ext.callerID = self.initiatorID;
    ext.opponentsIDs = self.opponentsIDs;

    if(peersLen > 0){
        for (var key in self.peerConnections) {
            var peerConnection = self.peerConnections[key];

            self.signalingProvider.sendMessage(peerConnection.userID, ext, SignalingConstants.SignalingType.STOP);
        }
    }

    self._close();
};

/**
 * [function close connection with user]
 * @param  {Number} userId [id of user]
 */
WebRTCSession.prototype.closeConnection = function(userId) {
    var self = this,
        peer = this.peerConnections[userId];

    if(!peer) {
        Helpers.traceWarn('Not found connection with user (' + userId + ')');
        return false;
    }

    try {
        peer.release();
    } catch (e) {
        Helpers.traceError(e);
    } finally {
        self._closeSessionIfAllConnectionsClosed();
    }
};


/**
 * Update a call
 * @param {array} A map with custom parameters
 */
WebRTCSession.prototype.update = function(extension) {
    var self = this,
        ext = {};

    Helpers.trace('Update, extension: ' + JSON.stringify(extension));

    if(extension === null){
        Helpers.trace("extension is null, no parameters to update");
        return;
    }

    ext = _prepareExtension(extension);
    ext.sessionID = this.ID;

    for (var key in self.peerConnections) {
        var peerConnection = self.peerConnections[key];

        self.signalingProvider.sendMessage(peerConnection.userID, ext, SignalingConstants.SignalingType.PARAMETERS_CHANGED);
    }
};

/**
 * Mutes the stream
 * @param {string} what to mute: 'audio' or 'video'
 */
WebRTCSession.prototype.mute = function(type) {
    this._muteStream(0, type);
};

/**
 * Unmutes the stream
 * @param {string} what to unmute: 'audio' or 'video'
 */
WebRTCSession.prototype.unmute = function(type) {
    this._muteStream(1, type);
};

/**
 * DELEGATES (rtc client)
 */
WebRTCSession.prototype.processOnCall = function(callerID, extension) {
    var self = this,
        oppIDs = self._uniqueOpponentsIDs();

    oppIDs.forEach(function(opID, i, arr) {
        var pConn = self.peerConnections[opID];

        if(pConn){
            if(opID == callerID){
                pConn.updateRemoteSDP(extension.sdp);

                /** The group call logic starts here */
                if(callerID != self.initiatorID && self.state === WebRTCSession.State.ACTIVE){
                    self._acceptInternal(callerID, {});
                }
            }
        } else {
            /** create peer connections for each opponent */
            var peerConnection;
            if(opID != callerID && self.currentUserID > opID){
                peerConnection = self._createPeer(opID, 'offer');
            }else{
                peerConnection = self._createPeer(opID, 'answer');
            }

            self.peerConnections[opID] = peerConnection;

            if(opID == callerID){
                peerConnection.updateRemoteSDP(extension.sdp);
                self._startAnswerTimer();
            }
        }
    });
};

WebRTCSession.prototype.processOnAccept = function(userID, extension) {
    var peerConnection = this.peerConnections[userID];

    if(peerConnection){
        peerConnection._clearDialingTimer();

        peerConnection.setRemoteSessionDescription('answer', extension.sdp, function(error){
            if(error){
                Helpers.traceError("'setRemoteSessionDescription' error: " + error);
            }else{
                Helpers.trace("'setRemoteSessionDescription' success");
            }
        });
    }else{
        Helpers.traceError("Ignore 'OnAccept', there is no information about peer connection by some reason.");
    }
};

WebRTCSession.prototype.processOnReject = function(userID, extension) {
    var peerConnection = this.peerConnections[userID];

    this._clearWaitingOfferOrAnswerTimer();

    if(peerConnection){
        peerConnection.release();
    }else{
        Helpers.traceError("Ignore 'OnReject', there is no information about peer connection by some reason.");
    }

    this._closeSessionIfAllConnectionsClosed();
};

WebRTCSession.prototype.processOnStop = function(userID, extension) {
    var self = this;

    this._clearAnswerTimer();

    var pc = self.peerConnections[userID];
    if (pc) {
        pc.release();
    } else {
        Helpers.traceError("Ignore 'OnStop', there is no information about peer connection by some reason.");
    }

    this._closeSessionIfAllConnectionsClosed();
};

WebRTCSession.prototype.processOnIceCandidates = function(userID, extension) {
    var peerConnection = this.peerConnections[userID];

    if(peerConnection){
        peerConnection.addCandidates(extension.iceCandidates);
    }else{
        Helpers.traceError("Ignore 'OnIceCandidates', there is no information about peer connection by some reason.");
    }
};

WebRTCSession.prototype.processCall = function(peerConnection, ext) {
    var extension = ext || {};

    extension.sessionID = this.ID;
    extension.callType = this.callType;
    extension.callerID = this.initiatorID;
    extension.opponentsIDs = this.opponentsIDs;
    extension.sdp = peerConnection.localDescription.sdp;

    //TODO: set bandwidth to the userInfo object
    extension.userInfo = ext.userInfo || {};
    extension.userInfo.bandwidth = this.bandwidth;

    this.signalingProvider.sendMessage(peerConnection.userID, extension, SignalingConstants.SignalingType.CALL);
};

WebRTCSession.prototype.processIceCandidates = function(peerConnection, iceCandidates) {
    var extension = {};

    extension.sessionID = this.ID;
    extension.callType = this.callType;
    extension.callerID = this.initiatorID;
    extension.opponentsIDs = this.opponentsIDs;

    this.signalingProvider.sendCandidate(peerConnection.userID, iceCandidates, extension);
};

WebRTCSession.prototype.processOnNotAnswer = function(peerConnection) {
    Helpers.trace("Answer timeout callback for session " + this.ID + " for user " + peerConnection.userID);

    this._clearWaitingOfferOrAnswerTimer();

    peerConnection.release();

    if (typeof this.onUserNotAnswerListener === 'function') {
        Utils.safeCallbackCall(this.onUserNotAnswerListener, this, peerConnection.userID);
    }

    this._closeSessionIfAllConnectionsClosed();
};

/**
 * DELEGATES (peer connection)
 */
WebRTCSession.prototype._onRemoteStreamListener = function(userID, stream) {
    if (typeof this.onRemoteStreamListener === 'function') {
        Utils.safeCallbackCall(this.onRemoteStreamListener, this, userID, stream);
    }
};

/**
 * [_onCallStatsReport return statistics about the peer]
 * @param  {number} userId [id of user (callee)]
 * @param  {array} stats  [array of statistics]
 *
 * Fire onCallStatsReport callbacks with parameters(userId, stats, error).
 * If stats will be invalid callback return null and error
 */
WebRTCSession.prototype._onCallStatsReport = function(userId, stats, error) {
    if (typeof this.onCallStatsReport === 'function') {
        Utils.safeCallbackCall(this.onCallStatsReport, this, userId, stats, error);
    }
};

WebRTCSession.prototype._onSessionConnectionStateChangedListener = function(userID, connectionState) {
    if (typeof this.onSessionConnectionStateChangedListener === 'function') {
        Utils.safeCallbackCall(this.onSessionConnectionStateChangedListener, this, userID, connectionState);
        if(Helpers.SessionConnectionState.CLOSED === connectionState && this.peerConnections[userID]) {
            this.peerConnections[userID].onicecandidate = null;
            this.peerConnections[userID].onsignalingstatechange = null;
            this.peerConnections[userID].ontrack = null;
            this.peerConnections[userID].oniceconnectionstatechange = null;
            this.peerConnections[userID]._clearWaitingReconnectTimer();
            delete this.peerConnections[userID];
        }
    }
};

/**
 * Private
 */
WebRTCSession.prototype._createPeer = function(userID, peerConnectionType) {
    if (!RTCPeerConnection) throw new Error('_createPeer error: RTCPeerConnection() is not supported in your browser');

    this.startCallTime = new Date();

    /**
     * Additional parameters for RTCPeerConnection options
     * new RTCPeerConnection(pcConfig, options)
     *
     * DtlsSrtpKeyAgreement: true
     * RtpDataChannels: true
     */

    var pcConfig = {
        iceServers: config.webrtc.iceServers,
        offerExtmapAllowMixed: false
    };

    Helpers.trace("_createPeer, iceServers: " + JSON.stringify(pcConfig));

    var peer = new RTCPeerConnection(pcConfig);
    peer._init(this, userID, this.ID, peerConnectionType);

    return peer;
};

/** close peer connection and local stream */
WebRTCSession.prototype._close = function() {
    Helpers.trace('_close');

    for (var key in this.peerConnections) {
        var peer = this.peerConnections[key];

        try {
            peer.release();
        } catch (e) {
            console.warn('Peer close error:', e);
        }
    }

    this._closeLocalMediaStream();

    this.state = WebRTCSession.State.CLOSED;

    if (typeof this.onSessionCloseListener === 'function') {
        Utils.safeCallbackCall(this.onSessionCloseListener, this);
    }
};

WebRTCSession.prototype._closeSessionIfAllConnectionsClosed = function() {
    var isAllConnectionsClosed = true;

    for (var key in this.peerConnections) {
        var peerCon = this.peerConnections[key],
            peerState;

        try {
            /*
            TODO:
            Uses RTCPeerConnection.signalingState instead RTCPeerConnection.iceConnectionState,
            because state 'closed' comes after few time from Safari, but signaling state comes instantly
            */
            peerState = peerCon.iceConnectionState === 'closed' ? 'closed' : peerCon.signalingState;
        } catch(err) {
            Helpers.traceError(err);
            // need to set peerState to 'closed' on error. FF will crashed without this part.
            peerState = 'closed';
        }

        if (peerState !== 'closed') {
            isAllConnectionsClosed = false;
            break;
        }
    }

    Helpers.trace("All peer connections closed: " + isAllConnectionsClosed);

    if (isAllConnectionsClosed) {
        this._closeLocalMediaStream();

        if (typeof this.onSessionCloseListener === 'function') {
            this.onSessionCloseListener(this);
        }

        this.state = WebRTCSession.State.CLOSED;
    }
};

WebRTCSession.prototype._closeLocalMediaStream = function(){
    /**
     * https://developers.google.com/web/updates/2015/07/mediastream-deprecations?hl=en
     */
    if (this.localStream) {
        this.localStream.getAudioTracks().forEach(function (audioTrack) {
            audioTrack.stop();
            audioTrack.enabled = false;
        });

        this.localStream.getVideoTracks().forEach(function (videoTrack) {
            videoTrack.stop();
            videoTrack.enabled = false;
        });

        this.localStream = null;
    }
};

WebRTCSession.prototype._muteStream = function(bool, type) {
    if (type === 'audio' && this.localStream.getAudioTracks().length > 0) {
        this.localStream.getAudioTracks().forEach(function (track) {
            track.enabled = !!bool;
        });
        return;
    }

    if (type === 'video' && this.localStream.getVideoTracks().length > 0) {
        this.localStream.getVideoTracks().forEach(function (track) {
            track.enabled = !!bool;
        });
        return;
    }
};

WebRTCSession.prototype._clearAnswerTimer = function(){
    if(this.answerTimer){
        Helpers.trace("_clearAnswerTimer");
        clearTimeout(this.answerTimer);
        this.answerTimer = null;
    }
};

WebRTCSession.prototype._startAnswerTimer = function(){
    Helpers.trace("_startAnswerTimer");

    var self = this;
    var answerTimeoutCallback = function (){
        Helpers.trace("_answerTimeoutCallback");

        if (typeof self.onSessionCloseListener === 'function') {
            self._close();
        }

        self.answerTimer = null;
    };

    var answerTimeInterval = config.webrtc.answerTimeInterval*1000;
    this.answerTimer = setTimeout(answerTimeoutCallback, answerTimeInterval);
};

WebRTCSession.prototype._clearWaitingOfferOrAnswerTimer = function() {
    if(this.waitingOfferOrAnswerTimer){
        Helpers.trace("_clearWaitingOfferOrAnswerTimer");
        clearTimeout(this.waitingOfferOrAnswerTimer);
        this.waitingOfferOrAnswerTimer = null;
    }
};

WebRTCSession.prototype._startWaitingOfferOrAnswerTimer = function(time) {
    var self = this,
        timeout = (config.webrtc.answerTimeInterval - time) < 0 ? 1 : config.webrtc.answerTimeInterval - time,
        waitingOfferOrAnswerTimeoutCallback = function() {
            Helpers.trace("waitingOfferOrAnswerTimeoutCallback");

            if(Object.keys(self.peerConnections).length > 0) {
                Object.keys(self.peerConnections).forEach(function(key) {
                    var peerConnection = self.peerConnections[key];
                    if (peerConnection.state === RTCPeerConnection.State.CONNECTING || peerConnection.state === RTCPeerConnection.State.NEW) {
                        self.processOnNotAnswer(peerConnection);
                    }
                });
            }

            self.waitingOfferOrAnswerTimer = null;
        };

    Helpers.trace("_startWaitingOfferOrAnswerTimer, timeout: " + timeout);

    this.waitingOfferOrAnswerTimer = setTimeout(waitingOfferOrAnswerTimeoutCallback, timeout*1000);
};

WebRTCSession.prototype._uniqueOpponentsIDs = function(){
    var self = this;
    var opponents = [];

    if(this.initiatorID !== this.currentUserID){
        opponents.push(this.initiatorID);
    }

    this.opponentsIDs.forEach(function(userID, i, arr) {
        if(userID != self.currentUserID){
            opponents.push(parseInt(userID));
        }
    });

    return opponents;
};

WebRTCSession.prototype._uniqueOpponentsIDsWithoutInitiator = function(){
    var self = this;
    var opponents = [];

    this.opponentsIDs.forEach(function(userID, i, arr) {
        if(userID != self.currentUserID){
            opponents.push(parseInt(userID));
        }
    });

    return opponents;
};

WebRTCSession.prototype.toString = function sessionToString() {
    return 'ID: ' + this.ID + ', initiatorID:  ' + this.initiatorID + ', opponentsIDs: ' + this.opponentsIDs + ', state: ' + this.state + ', callType: ' + this.callType;
};

function generateUUID(){
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}

/**
 * private _prepareExtension - replace property null to empty string
 * return object with property or empty if extension didn't set
 */
function _prepareExtension(extension) {
    var ext = {};

    try {
        if ( ({}).toString.call(extension) === '[object Object]' ) {
            ext.userInfo = extension;
            ext = JSON.parse( JSON.stringify(ext).replace(/null/g, "\"\"") );
        } else {
            throw new Error('Invalid type of "extension" object.');
        }
    } catch (err) {
        Helpers.traceWarning(err.message);
    }

    return ext;
}

module.exports = WebRTCSession;
