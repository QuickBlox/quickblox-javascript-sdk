'use strict';

/* JSHint inline rules */
/* globals MediaStream, MediaRecorder, URL, Blob, navigator */

/**
 * Stream Record Module
 * Doc: https://w3c.github.io/mediacapture-record/MediaRecorder.html
 * Support: http://caniuse.com/#feat=mediarecorder (Firefox 47, Chrome 49, Opera 40)
 *
 * User's callbacks (listener-functions):
 * - onStartRecording
 * - onPauseRecording
 * - onStopRecording
 * - onErrorRecording
 *
 * @module Recorder
 *
 * @example
 * var options = {
 *     mimeType: 'video/mp4', // or set 'video' or 'audio' only
 *     audioBitsPerSecond : 256 * 8 * 1024,
 *     videoBitsPerSecond : 256 * 8 * 1024,
 *     bitsPerSecond: 256 * 8 * 1024,  // if this is provided, skip audioBitsPerSecond / videoBitsPerSecond
 *     callbacks: {
 *         onStartRecording: function startRecord() {
 *             console.log('Start recording...');
 *         },
 *         onErrorRecording: function errorRecord(error) {
 *             //...
 *         },
 *         onPauseRecording: function pauseRecord() {
 *             //...
 *         },
 *         onStopRecording: function stopRecord(blob) {
 *             //...
 *         },
 *         onResumeRecording: function resimeRecord() {
 *             //...
 *         }
 *     }
 * }
 * 
 * var recorder = new QB.Recorder(stream, options);
 * // start record
 * recorder.record();
 * 
 */
var utils = require('../../qbUtils');

function Recorder(mediaStream, opts) {
    var self = this;

    if(!Recorder.isAvailable()) {
        throw new Error('QBRecorder isn\'t avaible.');
    }

    var typeOfRecorded = 'video',
        clientMimeType = opts && opts.mimeType;

    var BITS_PER_SECOND = 256 * 8 * 1024;

    self._mediaStream = null;
    self._userCallbacks = opts && opts.callbacks ? opts.callbacks : null; 

    if(opts && opts.mimeType) {
        typeOfRecorded = opts.mimeType.toString().toLowerCase().indexOf('audio') === -1 ? 'video' : 'audio';
    }

    /* prepare self._mediaStream for record */
    if(typeOfRecorded === 'audio') {
        if(mediaStream.getVideoTracks().length && mediaStream.getAudioTracks().length) {
            var stream;

            if (!!navigator.mozGetUserMedia) {
                stream = new MediaStream();
                stream.addTrack(mediaStream.getAudioTracks()[0]);
            } else {
                stream = new MediaStream(mediaStream.getAudioTracks());
            }

            self._mediaStream = stream;
        }
    } else {
        self._mediaStream = mediaStream;
    }

    /* prepare setting for MediaRecorder */
    self.mediaRecorderOptions = {
        mimeType: Recorder.getSupportedMimeType(typeOfRecorded, clientMimeType),
        audioBitsPerSecond: opts && opts.audioBitsPerSecond ? opts.audioBitsPerSecond : BITS_PER_SECOND,
        videoBitsPerSecond : opts && opts.videoBitsPerSecond ? opts.videoBitsPerSecond : BITS_PER_SECOND,
        bitsPerSecond: opts && opts.bitsPerSecond ? opts.bitsPerSecond : BITS_PER_SECOND
    };

    this._mediaRecorder = null;
    self._recordedBlobs = [];
}

Recorder._isAvailable = !!(window && window.MediaRecorder);

Recorder.isAvailable = function(){
    return Recorder._isAvailable;
};

Recorder._mimeTypes = {
    audio: [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg'
    ],
    video: [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm;codecs=daala',
        'video/webm;codecs=h264',
        'video/webm',
        'video/mp4',
        'video/mpeg'
    ]
};

Recorder.getSupportedMimeType = function(type, clientMimeType) {
    var supportedMimeType;

    if(!type && type === '') {
        throw new Error('Set type of record is require.');
    }

    if(clientMimeType && MediaRecorder.isTypeSupported(clientMimeType)) {
        supportedMimeType = clientMimeType;
    } else {
        Recorder._mimeTypes[type].some(function(item) {
            if(MediaRecorder.isTypeSupported(item)) {
                supportedMimeType = item;
                return true;
            }

            return false;
        });
    }

    return supportedMimeType;
};

Recorder.prototype.getExtension = function() {
    var self = this;

    if(!self.mediaRecorderOptions) {
        throw new Error('Options isn\'t set');
    }

    var endTypeMedia = self.mediaRecorderOptions.mimeType.indexOf('/'),
        extension = self.mediaRecorderOptions.mimeType.substring(endTypeMedia + 1),
        startCodecsInfo = extension.indexOf(';');


    if(startCodecsInfo) {
        extension = extension.substring(0, startCodecsInfo);
    }

    return extension;
};

Recorder.prototype.start = function() {
    var self = this;

    if (self._mediaRecorder) {
        self._mediaRecorder = null;
    }

    try {
        self._mediaRecorder = new MediaRecorder(self._mediaStream, self.mediaRecorderOptions);
    } catch(e) {
        self._mediaRecorder = new MediaRecorder(self._mediaStream);
    }

    self._mediaRecorder.ondataavailable = function(e) {
        if (e.data && e.data.size > 0) {
           self._recordedBlobs.push(e.data);
        }
    };

    self._mediaRecorder.onerror = function(error) {
        if (error.name === 'InvalidState') {
            console.error('The MediaRecorder is not in a state in which the proposed operation is allowed to be executed.');
        } else if (error.name === 'OutOfMemory') {
            console.error('The UA has exhaused the available memory. User agents SHOULD provide as much additional information as possible in the message attribute.');
        } else if (error.name === 'IllegalStreamModification') {
            console.error('A modification to the stream has occurred that makes it impossible to continue recording. An example would be the addition of a Track while recording is occurring. User agents SHOULD provide as much additional information as possible in the message attribute.');
        } else if (error.name === 'OtherRecordingError') {
            console.error('Used for an fatal error other than those listed above. User agents SHOULD provide as much additional information as possible in the message attribute.');
        } else if (error.name === 'GenericError') {
            console.error('The UA cannot provide the codec or recording option that has been requested.', error);
        } else {
            console.error('MediaRecorder Error', error);
        }

        if(self._mediaRecorder.state !== 'inactive' && self._mediaRecorder.state !== 'stopped') {
            self._mediaRecorder.stop();
        }

        if(self._userCallbacks && typeof self._userCallbacks.onErrorRecording === 'function') {
            utils.safeCallbackCall(self._userCallbacks.onErrorRecording, error);
        }
    };

    self._mediaRecorder.onstop = function(e) {
        var blob = new Blob(self._recordedBlobs, {
            'type' : self.mediaRecorderOptions.mimeType
        });

        if(self._userCallbacks && typeof self._userCallbacks.onStopRecording === 'function') {
            utils.safeCallbackCall(self._userCallbacks.onStopRecording, blob);
        }
    };

    self._mediaRecorder.onpause = function() {
        if(self._userCallbacks && typeof self._userCallbacks.onPauseRecording === 'function') {
            utils.safeCallbackCall(self._userCallbacks.onPauseRecording);
        }
    };

    self._mediaRecorder.onresume = function() {
        if(self._userCallbacks && typeof self._userCallbacks.onResumeRecording === 'function') {
            utils.safeCallbackCall(self._userCallbacks.onResumeRecording);
        }
    };

    self._mediaRecorder.start(1000);

    if(self._userCallbacks && typeof self._userCallbacks.onStartRecording === 'function') {
        utils.safeCallbackCall(self._userCallbacks.onStartRecording);
    }
};

Recorder.prototype.stop = function() {
    if(this._mediaRecorder){
        this._mediaRecorder.stop();
    } else {
        console.warn('[Recorder stop]: MediaRecorder isn\'t created.');
    }
};

Recorder.prototype.pause = function() {
    var self = this;

    if(self._mediaRecorder && self._mediaRecorder.state === 'recording') {
        self._mediaRecorder.pause();

        // Firefox doesn't fire onpause event
        if(navigator.mozGetUserMedia) {
            if(self._userCallbacks && typeof self._userCallbacks.onPauseRecording === 'function') {
                utils.safeCallbackCall(self._userCallbacks.onPauseRecording);
            }
        }
    } else {
        console.warn('[Recorder pause]: MediaRecorder isn\'t created or has invalid state.');
    }
};

Recorder.prototype.resume = function() {
    var self = this;

    if(self._mediaRecorder && self._mediaRecorder.state === 'paused') {
        self._mediaRecorder.resume();

        // Firefox doesn't fire onpause event
        if(navigator.mozGetUserMedia) {
            if(self._userCallbacks && typeof self._userCallbacks.onResumeRecording === 'function') {
                utils.safeCallbackCall(self._userCallbacks.onResumeRecording);
            }
        }
    } else {
        console.warn('[Recorder resume]: MediaRecorder isn\'t created or has invalid state.');
    }
};

Recorder.prototype.download = function(blob, downloadFileName) {
    var self = this;

    var url = URL.createObjectURL(blob || self._recordedBlobs),
        a = document.createElement('a');

    a.style.display = 'none';
    a.href = url;
    a.download = (downloadFileName || Date.now()) + '.' + self.getExtension();

    /* Add link */
    document.body.appendChild(a);

    /* Start dowloading */
    a.click();
    
    /* Remove link */
    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 100);
};

module.exports = Recorder;
