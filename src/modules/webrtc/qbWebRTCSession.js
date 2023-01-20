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
 * - onReconnectListener(session, userId, state)
 */

/**
 * @namespace QB.webrtc.WebRTCSession
 */

/**
 * @typedef {Object} MediaParams
 * @property {boolean | MediaTrackConstraints} [params.audio]
 * @property {boolean | MediaTrackConstraints} [params.video]
 * @property {string} [params.elemId] - Id of HTMLVideoElement.
 * @property {Object} [params.options]
 * @property {boolean} [params.options.muted]
 * @property {boolean} [params.options.mirror]
 */

var config = require('../../qbConfig');
var qbRTCPeerConnection = require('./qbRTCPeerConnection');
var Utils = require('../../qbUtils');
var Helpers = require('./qbWebRTCHelpers');
var SignalingConstants = require('./qbWebRTCSignalingConstants');

var ICE_TIMEOUT = 5000; // 5 seconds

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

var ReconnectionState = {
    RECONNECTING: 'reconnecting',
    RECONNECTED: 'reconnected',
    FAILED: 'failed'
};


/**
 * QuickBlox WebRTC session.
 * @param {Object} params
 * @param {1|2} params.callType - Type of a call 
 * 1 - VIDEO  
 * 2 - AUDIO  
 * @param {Array<number>} params.opIDs - An array with opponents.
 * @param {number} params.currentUserID - Current user ID.
 * @param {number} params.initiatorID - Call initiator ID.
 * @param {string} [params.sessionID] - Session identifier (optional).
 * @param {number} [params.bandwidth] - Bandwidth limit.
 */
function WebRTCSession(params) {
    this.ID = params.sessionID ? params.sessionID : generateUUID();
    this.state = WebRTCSession.State.NEW;

    this.initiatorID = parseInt(params.initiatorID);
    this.opponentsIDs = params.opIDs;
    this.callType = parseInt(params.callType);
    /*** @type {{[userId: number]: qbRTCPeerConnection}} */
    this.peerConnections = {};
    /*** @type {MediaParams} */
    this.mediaParams = null;
    /*** @type {{[userID: number]: number | undefined}} */
    this.iceConnectTimers = {};
    /*** @type {{[userID: number]: number | undefined}} */
    this.reconnectTimers = {};

    this.signalingProvider = params.signalingProvider;

    this.currentUserID = params.currentUserID;

    this.bandwidth = params.bandwidth;

    /***
     * We use this timeout to fix next issue:
     * "From Android/iOS make a call to Web and kill the Android/iOS app instantly. Web accept/reject popup will be still visible.
     * We need a way to hide it if sach situation happened."
     */
    this.answerTimer = null;

    this.startCallTime = 0;
    this.acceptCallTime = 0;
    /*** @type {MediaStream | undefined} */
    this.localStream = undefined;
}

/**
 * Get the user media stream({@link https://docs.quickblox.com/docs/js-video-calling#access-local-media-stream read more}).
 * @function getUserMedia
 * @memberof QB.webrtc.WebRTCSession
 * @param {MediaParams} params - Media stream constraints and additional options.
 * @param {Function} callback - Callback to get a result of the function.
 */
WebRTCSession.prototype.getUserMedia = function (params, callback) {
    if (!navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia() is not supported in your browser');
    }

    var self = this;
    var mediaConstraints = {
        audio: params.audio || false,
        video: params.video || false
    };

    function successCallback(stream) {
        self.localStream = stream;
        self.mediaParams = Object.assign({}, params);

        if (params.elemId) {
            self.attachMediaStream(params.elemId, stream, params.options);
        }

        if (callback && typeof callback === 'function') {
            callback(undefined, stream);
        }
    }

    navigator
        .mediaDevices
        .getUserMedia(mediaConstraints)
        .then(successCallback)
        .catch(callback);
};

/**
 * Get the state of connection.
 * @function connectionStateForUser
 * @memberof QB.webrtc.WebRTCSession
 * @param {number} userID
 */
WebRTCSession.prototype.connectionStateForUser = function (userID) {
    var peerConnection = this.peerConnections[userID];
    return peerConnection ? peerConnection.state : undefined;
};

/**
 * Attach media stream to audio/video element({@link https://docs.quickblox.com/docs/js-video-calling#attach-local-media-stream read more}).
 * @function attachMediaStream
 * @memberof QB.webrtc.WebRTCSession
 * @param {string} elementId - The Id of an ellement to attach a stream.
 * @param {MediaStream} stream - The stream to attach.
 * @param {Object} [options] - The additional options.
 * @param {boolean} [options.muted] - Whether video element should be muted.
 * @param {boolean} [options.mirror] - Whether video should be "mirrored".
 */
WebRTCSession.prototype.attachMediaStream = function (elementId, stream, options) {
    var elem = document.getElementById(elementId);

    if (elem) {
        if (elem instanceof HTMLMediaElement) {
            if ('srcObject' in elem) {
                elem.srcObject = stream;
            } else {
                elem.src = window.URL.createObjectURL(stream);
            }

            if (options && options.muted) {
                elem.muted = true;
            }

            if (options && options.mirror) {
                elem.style.transform = 'scaleX(-1)';
            }

            if (!elem.autoplay) {
                elem.onloadedmetadata = function () {
                    elem.play();
                };
            }
        } else {
            throw new Error('Cannot attach media stream to element with id "' + elementId + '" because it is not of type HTMLMediaElement');
        }
    } else {
        throw new Error('Unable to attach media stream, cannot find element by Id "' + elementId + '"');
    }
};

/**
 * Detach media stream from audio/video element.
 * @function detachMediaStream
 * @memberof QB.webrtc.WebRTCSession
 * @param {string} elementId - The Id of an element to detach a stream.
 */
WebRTCSession.prototype.detachMediaStream = function (elementId) {
    var elem = document.getElementById(elementId);

    if (elem && elem instanceof HTMLMediaElement) {
        elem.pause();

        if (elem.srcObject && typeof elem.srcObject === 'object') {
            elem.srcObject.getTracks().forEach(function (track) {
                track.stop();
                track.enabled = false;
            });
            elem.srcObject = null;
        } else {
            elem.src = '';
        }

        elem.removeAttribute("src");
        elem.removeAttribute("srcObject");
    }
};

/**
 * Switch media tracks in audio/video HTML's element and replace its in peers({@link https://docs.quickblox.com/docs/js-video-calling-advanced#switch-camera read more}).
 * @function switchMediaTracks
 * @memberof QB.webrtc.WebRTCSession
 * @param {Object} deviceIds - An object with deviceIds of plugged devices.
 * @param {string} [deviceIds.audio] - The deviceId, it can be gotten from QB.webrtc.getMediaDevices('audioinput').
 * @param {string} [deviceIds.video] - The deviceId, it can be gotten from QB.webrtc.getMediaDevices('videoinput').
 * @param {Function} callback - The callback to get a result of the function.
 */
WebRTCSession.prototype.switchMediaTracks = function (deviceIds, callback) {
    if (!navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia() is not supported in your browser');
    }

    var self = this;

    if (deviceIds && deviceIds.audio) {
        this.mediaParams.audio.deviceId = deviceIds.audio;
    }

    if (deviceIds && deviceIds.video) {
        this.mediaParams.video.deviceId = deviceIds.video;
    }

    this.localStream.getTracks().forEach(function (track) {
        track.stop();
    });

    navigator.mediaDevices.getUserMedia({
        audio: self.mediaParams.audio || false,
        video: self.mediaParams.video || false
    }).then(function (stream) {
        self._replaceTracks(stream);
        callback(null, stream);
    }).catch(function (error) {
        callback(error, null);
    });
};

WebRTCSession.prototype._replaceTracks = function (stream) {
    var localStream = this.localStream;
    var elemId = this.mediaParams.elemId;
    var ops = this.mediaParams.options;
    var currentStreamTracks = localStream.getTracks();
    var newStreamTracks = stream.getTracks();

    this.detachMediaStream(elemId);

    newStreamTracks.forEach(function (newTrack) {
        const currentTrack = currentStreamTracks.find(function (track) {
            return track.kind === newTrack.kind;
        });
        if (currentTrack) {
            currentTrack.stop();
            localStream.removeTrack(currentTrack);
            localStream.addTrack(newTrack);
        }
    });

    if (elemId) {
        this.attachMediaStream(elemId, stream, ops);
    }

    /*** @param {RTCPeerConnection} peer */
    function _replaceTracksForPeer(peer) {
        return Promise.all(peer.getSenders().map(function (sender) {
            return sender.replaceTrack(newStreamTracks.find(function (track) {
                return track.kind === sender.track.kind;
            }));
        }));
    }

    return Promise.all(Object
        .values(this.peerConnections)
        .map(function (peerConnection) { return peerConnection._pc; })
        .map(_replaceTracksForPeer)
    );
};

/**
 * Initiate a call({@link https://docs.quickblox.com/docs/js-video-calling#make-a-call read more}).
 * @function call
 * @memberof QB.webrtc.WebRTCSession
 * @param {Object} [extension] - A map with a custom parametrs .
 * @param {Function} [callback]
 */
WebRTCSession.prototype.call = function (extension, callback) {
    var self = this,
        ext = _prepareExtension(extension);

    Helpers.trace('Call, extension: ' + JSON.stringify(ext.userInfo));

    self.state = WebRTCSession.State.ACTIVE;

    // First this check if we connected to the signalling channel
    // to make sure that opponents will receive `call` signal
    self._reconnectToChat(function () {
        if (self.state === WebRTCSession.State.ACTIVE) {
            // create a peer connection for each opponent
            self.opponentsIDs.forEach(function (userID) {
                self._callInternal(userID, ext);
            });
        }
    });

    if (typeof callback === 'function') {
        callback(null);
    }
};

WebRTCSession.prototype._callInternal = function (userID, extension) {
    var self = this;
    var peer = this._createPeer(userID, this.currentUserID < userID);
    this.peerConnections[userID] = peer;
    peer.addLocalStream(self.localStream);
    peer.setLocalSessionDescription({ type: 'offer' }, function (error) {
        if (error) {
            Helpers.trace("setLocalSessionDescription error: " + error);
        } else {
            Helpers.trace("setLocalSessionDescription success");
            /** let's send call requests to user */
            peer._startDialingTimer(extension);
        }
    });
};

/**
 * Accept a call({@link https://docs.quickblox.com/docs/js-video-calling#accept-a-call read more}).
 * @function accept
 * @memberof QB.webrtc.WebRTCSession
 * @param {Object} extension - A map with custom parameters.
 */
WebRTCSession.prototype.accept = function (extension) {
    var self = this,
        ext = _prepareExtension(extension);

    Helpers.trace('Accept, extension: ' + JSON.stringify(ext.userInfo));

    if (self.state === WebRTCSession.State.ACTIVE) {
        Helpers.traceError("Can't accept, the session is already active, return.");
        return;
    }

    if (self.state === WebRTCSession.State.CLOSED) {
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
    if (oppIDs.length > 0) {
        var offerTime = (self.acceptCallTime - self.startCallTime) / 1000;
        self._startWaitingOfferOrAnswerTimer(offerTime);

        /**
         * here we have to decide to which users the user should call.
         * We have a rule: If a userID1 > userID2 then a userID1 should call to userID2.
         */
        oppIDs.forEach(function (opID, i, arr) {
            if (self.currentUserID > opID) {
                /** call to the user */
                self._callInternal(opID, {}, true);
            }
        });
    }
};

WebRTCSession.prototype._acceptInternal = function (userID, extension) {
    var self = this;

    /** create a peer connection */
    var peerConnection = this.peerConnections[userID];

    if (peerConnection) {
        var remoteSDP = peerConnection.getRemoteSDP();
        peerConnection.addLocalStream(self.localStream);
        peerConnection.setRemoteSessionDescription(remoteSDP, function (error) {
            if (error) {
                Helpers.traceError("'setRemoteSessionDescription' error: " + error);
            } else {
                Helpers.trace("'setRemoteSessionDescription' success");
                peerConnection.setLocalSessionDescription({ type: 'answer' }, function (err) {
                    if (err) {
                        Helpers.trace("setLocalSessionDescription error: " + err);
                    } else {
                        Helpers.trace("'setLocalSessionDescription' success");
                        extension.sessionID = self.ID;
                        extension.callType = self.callType;
                        extension.callerID = self.initiatorID;
                        extension.opponentsIDs = self.opponentsIDs;
                        if (peerConnection._pc.localDescription) {
                            extension.sdp = peerConnection
                                ._pc
                                .localDescription
                                .toJSON()
                                .sdp;
                        }

                        self.signalingProvider.sendMessage(
                            userID,
                            extension,
                            SignalingConstants.SignalingType.ACCEPT
                        );
                    }
                });
            }
        });
    } else {
        Helpers.traceError(
            "Can't accept the call, peer connection for userID " +
            userID + " was not found"
        );
    }
};

/**
 * Reject a call({@link https://docs.quickblox.com/docs/js-video-calling#reject-a-call read more}).
 * @function reject
 * @memberof QB.webrtc.WebRTCSession
 * @param {Object} extension - A map with custom parameters.
 */
WebRTCSession.prototype.reject = function (extension) {
    var self = this,
        ext = _prepareExtension(extension);

    Helpers.trace('Reject, extension: ' + JSON.stringify(ext.userInfo));

    self.state = WebRTCSession.State.REJECTED;

    self._clearAnswerTimer();

    ext.sessionID = self.ID;
    ext.callType = self.callType;
    ext.callerID = self.initiatorID;
    ext.opponentsIDs = self.opponentsIDs;

    Object.keys(self.peerConnections).forEach(function (key) {
        var peerConnection = self.peerConnections[key];
        self.signalingProvider.sendMessage(
            peerConnection.userID,
            ext,
            SignalingConstants.SignalingType.REJECT
        );
    });

    self._close();
};

/**
 * Stop a call({@link https://docs.quickblox.com/docs/js-video-calling#end-a-call read more}).
 * @function stop
 * @memberof QB.webrtc.WebRTCSession
 * @param {Object} extension - A map with custom parameters.
 */
WebRTCSession.prototype.stop = function (extension) {
    var self = this,
        ext = _prepareExtension(extension);

    Helpers.trace('Stop, extension: ' + JSON.stringify(ext.userInfo));

    self.state = WebRTCSession.State.HUNGUP;

    if (self.answerTimer) {
        self._clearAnswerTimer();
    }

    ext.sessionID = self.ID;
    ext.callType = self.callType;
    ext.callerID = self.initiatorID;
    ext.opponentsIDs = self.opponentsIDs;

    Object.keys(self.peerConnections).forEach(function (key) {
        var peerConnection = self.peerConnections[key];
        self.signalingProvider.sendMessage(
            peerConnection.userID,
            ext,
            SignalingConstants.SignalingType.STOP
        );
    });

    self._close();
};

/**
 * Close connection with a user.
 * @function closeConnection
 * @memberof QB.webrtc.WebRTCSession
 * @param  {Number} userId - Id of a user.
 */
WebRTCSession.prototype.closeConnection = function (userId) {
    var self = this,
        peer = this.peerConnections[userId];

    if (!peer) {
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
 * Update a call.
 * @function update
 * @memberof QB.webrtc.WebRTCSession
 * @param {Object} extension - A map with custom parameters.
 * @param {number} [userID]
 */
WebRTCSession.prototype.update = function (extension, userID) {
    var self = this,
        ext = typeof extension === 'object' ? extension : {};

    Helpers.trace('Update, extension: ' + JSON.stringify(extension));

    if (extension === null) {
        Helpers.trace("extension is null, no parameters to update");
        return;
    }

    ext.sessionID = this.ID;
    ext.callType = this.callType;
    ext.callerID = this.initiatorID;
    ext.opponentsIDs = this.opponentsIDs;

    if (userID) {
        self.signalingProvider.sendMessage(
            userID,
            ext,
            SignalingConstants.SignalingType.PARAMETERS_CHANGED
        );
    } else {
        for (var key in self.peerConnections) {
            var peer = self.peerConnections[key];
            self.signalingProvider.sendMessage(
                peer.userID,
                ext,
                SignalingConstants.SignalingType.PARAMETERS_CHANGED
            );
        }
    }
};

/**
 * Mutes the stream({@link https://docs.quickblox.com/docs/js-video-calling-advanced#mute-audio read more}).
 * @function mute
 * @memberof QB.webrtc.WebRTCSession
 * @param {string} type - 'audio' or 'video'
 */
WebRTCSession.prototype.mute = function (type) {
    this._muteStream(0, type);
};

/**
 * Unmutes the stream({@link https://docs.quickblox.com/docs/js-video-calling-advanced#mute-audio read more}).
 * @function unmute
 * @memberof QB.webrtc.WebRTCSession
 * @param {string} type - 'audio' or 'video'
 */
WebRTCSession.prototype.unmute = function (type) {
    this._muteStream(1, type);
};

/**
 * DELEGATES (rtc client)
 */
WebRTCSession.prototype.processOnCall = function (callerID, extension) {
    var self = this,
        opponentsIds = self._uniqueOpponentsIDs();

    opponentsIds.forEach(function (opponentID) {
        var peer = self.peerConnections[opponentID];

        if (!peer) {
            /** create peer connections for each opponent */
            peer = self._createPeer(
                opponentID,
                self.currentUserID < opponentID
            );
            self.peerConnections[opponentID] = peer;
            if (opponentID == callerID) {
                self._startAnswerTimer();
            }
        }
        if (opponentID == callerID) {
            peer.setRemoteSDP(new window.RTCSessionDescription({
                sdp: extension.sdp,
                type: 'offer'
            }));

            /** The group call logic starts here */
            if (callerID != self.initiatorID &&
                self.state === WebRTCSession.State.ACTIVE) {
                self._acceptInternal(callerID, {});
            }
        }
    });
};

WebRTCSession.prototype.processOnAccept = function (userID, extension) {
    var self = this;
    var peerConnection = this.peerConnections[userID];

    if (peerConnection) {
        peerConnection._clearDialingTimer();
        if (peerConnection._pc.signalingState !== 'stable') {
            var remoteSessionDescription = new window.RTCSessionDescription({
                sdp: extension.sdp,
                type: 'answer'
            });
            peerConnection.setRemoteSDP(remoteSessionDescription);
            peerConnection.setRemoteSessionDescription(remoteSessionDescription, function (error) {
                if (error) {
                    Helpers.traceError("'setRemoteSessionDescription' error: " + error);
                } else {
                    Helpers.trace("'setRemoteSessionDescription' success");
                    if (self.state !== WebRTCSession.State.ACTIVE) {
                        self.state = WebRTCSession.State.ACTIVE;
                    }
                }
            });
        } else {
            Helpers.traceError("Ignore 'onAccept', PeerConnection is already in 'stable' state");
        }
    } else {
        Helpers.traceError(
            "Ignore 'OnAccept': peer connection for user with Id " +
            userID + " was not found"
        );
    }
};

WebRTCSession.prototype.processOnReject = function (userID, extension) {
    var peerConnection = this.peerConnections[userID];

    this._clearWaitingOfferOrAnswerTimer();

    if (peerConnection) {
        peerConnection.release();
    } else {
        Helpers.traceError("Ignore 'OnReject', there is no information about peer connection by some reason.");
    }

    this._closeSessionIfAllConnectionsClosed();
};

WebRTCSession.prototype.processOnStop = function (userID, extension) {
    var self = this;

    this._clearAnswerTimer();

    var peerConnection = self.peerConnections[userID];
    if (peerConnection) {
        peerConnection.release();
        if (peerConnection._reconnecting) {
            peerConnection._reconnecting = false;
        }
        this._stopReconnectTimer(userID);
    } else {
        Helpers.traceError("Ignore 'OnStop', there is no information about peer connection by some reason.");
    }

    this._closeSessionIfAllConnectionsClosed();
};

WebRTCSession.prototype.processOnIceCandidates = function (userID, extension) {
    var peerConnection = this.peerConnections[userID];

    if (peerConnection) {
        peerConnection.addCandidates(extension.iceCandidates);
    } else {
        Helpers.traceError("Ignore 'OnIceCandidates', there is no information about peer connection by some reason.");
    }
};

WebRTCSession.prototype.processOnUpdate = function (userID, extension) {
    var SRD = extension.sessionDescription;
    var reason = extension.reason;
    var sessionIsActive = this.state === WebRTCSession.State.ACTIVE;
    if (sessionIsActive && reason && reason === 'reconnect') {
        var peer = this.peerConnections[userID];
        if (peer) {
            if (SRD) {
                if (SRD.type === 'offer') {
                    this._processReconnectOffer(userID, SRD);
                } else {
                    this._processReconnectAnswer(userID, SRD);
                }
            }
        } else {
            Helpers.traceError(
                "Ignore 'OnUpdate': peer connection for user with Id " +
                userID + " was not found"
            );
        }
    }
};

/**
 * @param {number} userID 
 * @param {RTCSessionDescriptionInit} SRD 
 */
WebRTCSession.prototype._processReconnectOffer = function (userID, SRD) {
    var self = this;
    if (this.peerConnections[userID].polite) {
        this._reconnect(this.peerConnections[userID]);
        var peer = this.peerConnections[userID];
        var offerId = SRD.offerId;
        var remoteDescription = new window.RTCSessionDescription({
            sdp: SRD.sdp,
            type: SRD.type
        });

        peer.setRemoteSDP(remoteDescription);
        peer.setRemoteSessionDescription(remoteDescription, function (e) {
            if (e) {
                Helpers.traceError('"setRemoteSessionDescription" error:' + e.message);
            } else {
                peer.setLocalSessionDescription({ type: 'answer' }, function () {
                    var description = peer._pc.localDescription.toJSON();
                    var ext = {
                        reason: 'reconnect',
                        sessionDescription: {
                            offerId: offerId,
                            sdp: description.sdp,
                            type: description.type
                        }
                    };
                    self.update(ext, userID);
                });
            }
        });
    } else {
        this._reconnect(this.peerConnections[userID], true);
    }
};

/**
 * @param {number} userID
 * @param {RTCSessionDescriptionInit} SRD
 */
WebRTCSession.prototype._processReconnectAnswer = function (userID, SRD) {
    var peer = this.peerConnections[userID];
    var offerId = SRD.offerId;
    if (peer && peer.offerId && offerId && peer.offerId === offerId) {
        var remoteDescription = new window.RTCSessionDescription({
            sdp: SRD.sdp,
            type: SRD.type
        });
        peer.setRemoteSDP(remoteDescription);
        peer.setRemoteSessionDescription(remoteDescription, function (e) {
            if (e) {
                Helpers.traceError('"setRemoteSessionDescription" error:' + e.message);
            }
        });
    }
};

/**
 * Send "call" signal to the opponent
 * @param {qbRTCPeerConnection} peerConnection
 * @param {Object} ext
 */
WebRTCSession.prototype.processCall = function (peerConnection, ext) {
    var extension = ext || {};
    if (!peerConnection._pc.localDescription) return;
    extension.sessionID = this.ID;
    extension.callType = this.callType;
    extension.callerID = this.initiatorID;
    extension.opponentsIDs = this.opponentsIDs;
    extension.sdp = peerConnection._pc.localDescription.sdp;

    //TODO: set bandwidth to the userInfo object
    extension.userInfo = ext && ext.userInfo ? ext.userInfo : {};
    extension.userInfo.bandwidth = this.bandwidth;

    this.signalingProvider.sendMessage(
        peerConnection.userID,
        extension,
        SignalingConstants.SignalingType.CALL
    );
};

WebRTCSession.prototype.processIceCandidates = function (peerConnection, iceCandidates) {
    var extension = {};

    extension.sessionID = this.ID;
    extension.callType = this.callType;
    extension.callerID = this.initiatorID;
    extension.opponentsIDs = this.opponentsIDs;

    this.signalingProvider.sendCandidate(peerConnection.userID, iceCandidates, extension);
};

WebRTCSession.prototype.processOnNotAnswer = function (peerConnection) {
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
WebRTCSession.prototype._onRemoteStreamListener = function (userID, stream) {
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
WebRTCSession.prototype._onCallStatsReport = function (userId, stats, error) {
    if (typeof this.onCallStatsReport === 'function') {
        Utils.safeCallbackCall(this.onCallStatsReport, this, userId, stats, error);
    }
};

WebRTCSession.prototype._onSessionConnectionStateChangedListener = function (userID, connectionState) {
    var StateClosed = Helpers.SessionConnectionState.CLOSED;
    var peer = this.peerConnections[userID];
    if (typeof this.onSessionConnectionStateChangedListener === 'function') {
        Utils.safeCallbackCall(
            this.onSessionConnectionStateChangedListener,
            this,
            userID,
            connectionState
        );
    }
    if (connectionState === StateClosed && peer) {
        peer._pc.onicecandidate = null;
        peer._pc.onsignalingstatechange = null;
        peer._pc.ontrack = null;
        peer._pc.oniceconnectionstatechange = null;
        delete this.peerConnections[userID];
    }
};

/**
 * Private
 * @param {number} userId
 * @param {boolean} polite
 * @returns {qbRTCPeerConnection}
 */
WebRTCSession.prototype._createPeer = function (userId, polite) {
    if (!window.RTCPeerConnection) {
        throw new Error('_createPeer error: RTCPeerConnection is not supported in your browser');
    }

    this.startCallTime = new Date();

    var pcConfig = {
        iceServers: config.webrtc.iceServers,
    };

    Helpers.trace("_createPeer configuration: " + JSON.stringify(pcConfig));

    var peer = new qbRTCPeerConnection(pcConfig);
    peer._init(this, userId, this.ID, polite);

    return peer;
};

WebRTCSession.prototype._startReconnectTimer = function (userID) {
    var self = this;
    var delay = config.webrtc.disconnectTimeInterval * 1000;
    var peer = this.peerConnections[userID];

    peer._reconnecting = true;

    var reconnectTimeoutCallback = function () {
        Helpers.trace('disconnectTimeInterval reached for userID ' + userID);

        self._stopReconnectTimer(userID);

        self.peerConnections[userID].release();
        self._onSessionConnectionStateChangedListener(
            userID,
            Helpers.SessionConnectionState.CLOSED
        );

        self._closeSessionIfAllConnectionsClosed();
    };

    if (typeof this.onReconnectListener === 'function') {
        Utils.safeCallbackCall(
            this.onReconnectListener,
            this,
            userID,
            ReconnectionState.RECONNECTING
        );
    }

    Helpers.trace(
        '_startReconnectTimer for userID:' + userID + ', timeout: ' + delay
    );

    var iceConnectTimeoutCallback = function () {
        Helpers.trace('iceConnectTimeout reached for user ' + userID);
        if (self.iceConnectTimers[userID]) {
            clearTimeout(self.iceConnectTimers[userID]);
            self.iceConnectTimers[userID] = undefined;
            if (!self.reconnectTimers[userID]) {
                /** If connection won't be recovered - close session */
                self.reconnectTimers[userID] = setTimeout(
                    reconnectTimeoutCallback,
                    delay - ICE_TIMEOUT
                );
                self._reconnectToChat(function () {
                    if (self.state === WebRTCSession.State.ACTIVE &&
                        self.reconnectTimers[userID]) {
                        // only if session is active
                        self._reconnect(peer, true);
                    }
                });
            }
        }
    };

    if (!this.iceConnectTimers[userID]) {
        /**
         * Wait a bit before reconnecting. If network has not been changed -
         * ICE candidates are still valid and connection may recover shortly
         */
        this.iceConnectTimers[userID] = setTimeout(
            iceConnectTimeoutCallback,
            ICE_TIMEOUT
        );
    }
};


WebRTCSession.prototype._stopReconnectTimer = function (userID) {
    var peer = this.peerConnections[userID];
    if (this.iceConnectTimers[userID]) {
        clearTimeout(this.iceConnectTimers[userID]);
        this.iceConnectTimers[userID] = undefined;
    }
    if (this.reconnectTimers[userID]) {
        Helpers.trace('_stopReconnectTimer for userID: ' + userID);
        clearTimeout(this.reconnectTimers[userID]);
        this.reconnectTimers[userID] = undefined;
    }
    if (peer && peer._reconnecting) {
        peer._reconnecting = false;
        if (typeof this.onReconnectListener === 'function') {
            var state = peer._pc.iceConnectionState;
            Utils.safeCallbackCall(
                this.onReconnectListener,
                this,
                userID,
                state === 'connected' ?
                    ReconnectionState.RECONNECTED :
                    ReconnectionState.FAILED
            );
        }
    }
};

/**
 * Ping server until pong received, then call the `callback`
 * @param {Function} callback
 */
WebRTCSession.prototype._reconnectToChat = function (callback) {
    var self = this;
    var signalingProvider = this.signalingProvider;
    var reconnectToChat = function () {
        var _onReconnectListener = signalingProvider.chat.onReconnectListener;
        signalingProvider.chat.onReconnectListener = function () {
            if (typeof _onReconnectListener === 'function') {
                _onReconnectListener();
            }
            signalingProvider.chat.onReconnectListener = _onReconnectListener;
            callback();
        };
        signalingProvider.chat.reconnect();
    };
    if (signalingProvider && signalingProvider.chat) {
        try {
            /**
             * Ping chat server to make sure that chat connection
             * has been established
             */
            signalingProvider.chat.ping(function (e) {
                if (self.state !== WebRTCSession.State.CLOSED) {
                    if (e) {
                        // If not - reconnect to chat
                        reconnectToChat();
                    } else {
                        // If chat connected - call `callback`
                        callback();
                    }
                }
            });
        } catch (e) {
            if (self.state !== WebRTCSession.State.CLOSED) {
                /** Catch `ChatNotConnected` error and reconnect to chat */
                reconnectToChat();
            }
        }
    }
};

/**
 * @param {qbRTCPeerConnection} peerConnection
 * @param {boolean} [negotiate]
 * @returns {void}
 */
WebRTCSession.prototype._reconnect = function (peerConnection, negotiate) {
    if (!peerConnection || !peerConnection.userID) {
        return;
    }
    var userId = peerConnection.userID;
    var polite = peerConnection.polite;
    var _reconnecting = peerConnection._reconnecting;

    peerConnection.release();

    var pcConfig = {
        iceServers: config.webrtc.iceServers,
    };

    Helpers.trace("_reconnect peer configuration: " + JSON.stringify(pcConfig));

    var peer = new qbRTCPeerConnection(pcConfig);
    this.peerConnections[userId] = peer;
    peer._init(this, userId, this.ID, polite);
    peer._reconnecting = _reconnecting;
    peer.addLocalStream(this.localStream);
    if (negotiate) {
        peer.offerId = generateUUID();
        peer.negotiate();
    }
};

/** close peer connection and local stream */
WebRTCSession.prototype._close = function () {
    Helpers.trace('_close');

    for (var key in this.peerConnections) {
        var peer = this.peerConnections[key];
        this._stopReconnectTimer(peer.userID);

        try {
            peer.release();
        } catch (e) {
            console.warn('Peer close error:', e);
        }
    }

    this._closeLocalMediaStream();
    if (typeof this._detectSilentAudioTaskCleanup === 'function') {
        this._detectSilentAudioTaskCleanup();
        this._detectSilentAudioTaskCleanup = undefined;
    }
    if (typeof this._detectSilentVideoTaskCleanup === 'function') {
        this._detectSilentVideoTaskCleanup();
        this._detectSilentVideoTaskCleanup = undefined;
    }

    this.state = WebRTCSession.State.CLOSED;

    if (typeof this.onSessionCloseListener === 'function') {
        Utils.safeCallbackCall(this.onSessionCloseListener, this);
    }
};

WebRTCSession.prototype._closeSessionIfAllConnectionsClosed = function () {
    var isAllConnectionsClosed = Object
        .values(this.peerConnections)
        .every(function (peer) {
            return peer.state === qbRTCPeerConnection.State.CLOSED;
        });

    Helpers.trace("All peer connections closed: " + isAllConnectionsClosed);

    if (isAllConnectionsClosed) {
        this._closeLocalMediaStream();

        if (typeof this.onSessionCloseListener === 'function') {
            this.onSessionCloseListener(this);
        }

        this.state = WebRTCSession.State.CLOSED;
    }
};

WebRTCSession.prototype._closeLocalMediaStream = function () {
    if (this.localStream) {
        this.localStream.getTracks().forEach(function (track) {
            track.stop();
            track.enabled = false;
        });
        this.localStream = null;
    }
};

WebRTCSession.prototype._muteStream = function (bool, type) {
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

WebRTCSession.prototype._clearAnswerTimer = function () {
    if (this.answerTimer) {
        Helpers.trace("_clearAnswerTimer");
        clearTimeout(this.answerTimer);
        this.answerTimer = null;
    }
};

WebRTCSession.prototype._startAnswerTimer = function () {
    Helpers.trace("_startAnswerTimer");

    var self = this;
    var answerTimeoutCallback = function () {
        Helpers.trace("_answerTimeoutCallback");

        if (typeof self.onSessionCloseListener === 'function') {
            self._close();
        }

        self.answerTimer = null;
    };

    var answerTimeInterval = config.webrtc.answerTimeInterval * 1000;
    this.answerTimer = setTimeout(answerTimeoutCallback, answerTimeInterval);
};

WebRTCSession.prototype._clearWaitingOfferOrAnswerTimer = function () {
    if (this.waitingOfferOrAnswerTimer) {
        Helpers.trace("_clearWaitingOfferOrAnswerTimer");
        clearTimeout(this.waitingOfferOrAnswerTimer);
        this.waitingOfferOrAnswerTimer = null;
    }
};

WebRTCSession.prototype._startWaitingOfferOrAnswerTimer = function (time) {
    var self = this,
        timeout = (config.webrtc.answerTimeInterval - time) < 0 ? 1 : config.webrtc.answerTimeInterval - time,
        waitingOfferOrAnswerTimeoutCallback = function () {
            Helpers.trace("waitingOfferOrAnswerTimeoutCallback");

            if (Object.keys(self.peerConnections).length > 0) {
                Object.keys(self.peerConnections).forEach(function (key) {
                    var peerConnection = self.peerConnections[key];
                    if (peerConnection.state === qbRTCPeerConnection.State.CONNECTING || peerConnection.state === qbRTCPeerConnection.State.NEW) {
                        self.processOnNotAnswer(peerConnection);
                    }
                });
            }

            self.waitingOfferOrAnswerTimer = null;
        };

    Helpers.trace("_startWaitingOfferOrAnswerTimer, timeout: " + timeout);

    this.waitingOfferOrAnswerTimer = setTimeout(waitingOfferOrAnswerTimeoutCallback, timeout * 1000);
};

WebRTCSession.prototype._uniqueOpponentsIDs = function () {
    var self = this;
    var opponents = [];

    if (this.initiatorID !== this.currentUserID) {
        opponents.push(this.initiatorID);
    }

    this.opponentsIDs.forEach(function (userID, i, arr) {
        if (userID != self.currentUserID) {
            opponents.push(parseInt(userID));
        }
    });

    return opponents;
};

WebRTCSession.prototype._uniqueOpponentsIDsWithoutInitiator = function () {
    var self = this;
    var opponents = [];

    this.opponentsIDs.forEach(function (userID, i, arr) {
        if (userID != self.currentUserID) {
            opponents.push(parseInt(userID));
        }
    });

    return opponents;
};

WebRTCSession.prototype.toString = function sessionToString() {
    return 'ID: ' + this.ID + ', initiatorID:  ' + this.initiatorID + ', opponentsIDs: ' + this.opponentsIDs + ', state: ' + this.state + ', callType: ' + this.callType;
};

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
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
        if (({}).toString.call(extension) === '[object Object]') {
            ext.userInfo = extension;
            ext = JSON.parse(JSON.stringify(ext).replace(/null/g, "\"\""));
        } else {
            throw new Error('Invalid type of "extension" object.');
        }
    } catch (err) {
        Helpers.traceWarning(err.message);
    }

    return ext;
}

module.exports = WebRTCSession;
