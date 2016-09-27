/*
 * QuickBlox JavaScript SDK
 *
 * Stream Record Module
 *
 * User's callbacks (listener-functions):
 * - onStartRecording
 * - onStopRecording
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

	var self = this;
	this._mediaRecorder = null;
	this.onStopRecording = null;
	this.onStartRecording = null;
	this._downloadName = null;
	this.isRecording = false;
	this._worker = null;

	if(window.Worker){
		var blob = new Blob([
			this.workerScriptContent.toString().slice(12, -1)
		], { type: "text/javascript" });


		this._worker = new Worker(window.URL.createObjectURL(blob));
		this._worker.onmessage = function(message){
			var data = message.data;

			self[data.cmd](data.params);
		}
	}
}

/*
 * @function workerScriptContent
 *
 * The body of this function contains listeners and helper functions for worker.
 *
 * After creating worker can post messages. It should be an object with 2 keys:
 * cmd - helper function name;
 * params - helper function arguments;
 *
 * */
Recorder.prototype.workerScriptContent = function(){
	var _recordedBlobs = [],
		recorder = {};
	// set on onStopRecording callback. Can be run only if

	onmessage = function(e) {
		var data = e.data;

		recorder[data.cmd](data.params);
	};

	recorder.push = function(blob){
		_recordedBlobs.push(blob);
	};

	recorder.download = function(){
		postMessage({
			cmd: '_workerDownload',
			params: new Blob(_recordedBlobs, {type: 'video/webm'})
		});
	}
};

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

	if(!window.W){
		throw new Error('Your browser isn\'t supported MediaRecorder. You can\'t record stream.');
		return;
	} else if(!window.Worker){
		throw new Error('Your browser isn\'t supported Worker. You can\'t record stream.');
		return;
	}

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

	self._mediaRecorder = new MediaRecorder(stream, _options, time);

	// set on onStopRecording callback.
	if(typeof self.onStopRecording === 'function'){
		self._mediaRecorder.onstop = self.onStopRecording;
	}

	self._mediaRecorder.ondataavailable = function (event) {
		if (event.data && event.data.size > 0) {
			self._worker.postMessage({
				cmd:'push',
				params: event.data
			});
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
	this._downloadName = name;
	this._worker.postMessage({
		cmd: 'download'
	});
};

Recorder.prototype._workerDownload = function(blob){
	var url = window.URL.createObjectURL(blob),
		a = document.createElement('a');

	a.style.display = 'none';
	a.href = url;
	a.download = (this._downloadName || Date.now()) + '.webm';

	document.body.appendChild(a);
	a.click();
	setTimeout(function() {
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	}, 100);
};

module.exports = Recorder;