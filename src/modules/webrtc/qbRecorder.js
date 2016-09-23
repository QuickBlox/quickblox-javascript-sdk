/*
 * QuickBlox JavaScript SDK
 *
 * Stream Record Module
 *
 * @module Recorder
 */

function Recorder() {

	/**
	 * @constructs Recorder
	 *
	 * This constructor contains of:
	 *
	 * _recordedBlobs;
	 * _mediaRecorder;
	 * onStopRecording;
	 * onStartRecording;
	 * isRecording;
	 */

	this._recordedBlobs = [];
	this._mediaRecorder;
	this.onStopRecording;
	this.onStartRecording;
	this.isRecording = false;
};

/*
 * User's callbacks (listener-functions):
 * - onStartRecording
 * - onStopRecording
 */


/**
 * @function start().
 * Start recording function
 * @param stream {object} The MediaStream that will be recorded. <br />
 * @param options {object} Is optional parameter.
 * can contain of: mimeType, audioBitsPerSecond, videoBitsPerSecond, bitsPerSecond. <br />
 * @param time {number} Is optional parameter.
 * This parameter takes a value of milliseconds, and represents the length of media capture to return in each Blob. <br />
 */
Recorder.prototype.start = function(stream, options, time){
	var self = this;

	self._recordedBlobs = [];

	// set options object
	var _options = options;
	_options.mimeType = options.mimeType || 'video/webm;codecs=vp9';

	if (!MediaRecorder.isTypeSupported(_options.mimeType)) {
		_options.mimeType = 'video/webm;codecs=vp8';

		if (!MediaRecorder.isTypeSupported(_options.mimeType)) {
			_options.mimeType =  'video/webm';

			if (!MediaRecorder.isTypeSupported(options.mimeType)) {
				_options.mimeType = '';
			}
		}
	}
	try {
		self._mediaRecorder = new MediaRecorder(stream, _options, time);
	} catch (e) {
		alert('Exception while creating MediaRecorder: '
			+ e + '. mimeType: ' + _options.mimeType);
		return;
	}

	// set on onStopRecording callback. Can be run only if 
	if(typeof self.onStopRecording === 'function'){
		self._mediaRecorder.onstop = self.onStopRecording;
	}

	self._mediaRecorder.ondataavailable = function (event) {
		if (event.data && event.data.size > 0) {
			self._recordedBlobs.push(event.data);
		}
	};

	if(typeof self.onStartRecording === 'function'){
		self.onStartRecording();
	}
	// Set timeslice.
	self._mediaRecorder.start(time || 10);
	self.isRecording = true;
};

/**
 * @function stop().
 * Stop recording function.
 * This function called without parameters.
 */

Recorder.prototype.stop = function(){
	if(this._mediaRecorder){
		this._mediaRecorder.stop();
		this.isRecording = false;
		this._mediaRecorder = null;
	}

};

/**
 * @function download().
 * You can call this function for downloading recorded file.
 * @param name {string} Is optional. Will change the default recorded file name.
 * the default name is the current date in miliseconds (Date.now()).
 */

Recorder.prototype.download = function(name){
	var self = this,
		blob = new Blob(self._recordedBlobs, {type: 'video/webm'}),
		url = window.URL.createObjectURL(blob),
		a = document.createElement('a');

	a.style.display = 'none';
	a.href = url;
	a.download = (name || Date.now()) + '.webm';
	document.body.appendChild(a);
	a.click();
	setTimeout(function() {
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	}, 100);
};

module.exports = Recorder;