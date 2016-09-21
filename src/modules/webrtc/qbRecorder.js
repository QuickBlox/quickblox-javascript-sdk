/*
 * QuickBlox JavaScript SDK
 *
 * Stream Record Module
 *
 */


function Recorder() {
	this.recorder;
	this._recordedBlobs = [];
	this._mediaRecorder;
	this.onStopRecording;
	this.isRecording = false;
};

Recorder.prototype.start = function(stream, options, time){
	var self = this;

	self._recordedBlobs = [];

	// set options object
	var _options = {mimeType: options.mimeType || 'video/webm;codecs=vp9'};

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
		self._mediaRecorder = new MediaRecorder(stream, _options);
	} catch (e) {
		alert('Exception while creating MediaRecorder: '
			+ e + '. mimeType: ' + _options.mimeType);
		return;
	}

	if(typeof self.onStopRecording === 'function'){
		self._mediaRecorder.onstop = self.onStopRecording;
	}

	self._mediaRecorder.ondataavailable = function (event) {
		if (event.data && event.data.size > 0) {
			self._recordedBlobs.push(event.data);
		}
	};

	self._mediaRecorder.start(10);
	self.isRecording = true;
};

Recorder.prototype.stop = function(){
	this._mediaRecorder.stop();
	this.isRecording = false;
};

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