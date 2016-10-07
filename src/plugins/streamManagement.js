/**
 * QuickBlox JavaScript SDK
 * Chat Module (Chat Stream Management plugin)
 */

/** Modules */
var Utils = require('../qbUtils');

function StreamManagement() {

	this._NS = 'urn:xmpp:sm:3';
	this._isStreamManagementEnabling = false;
	this._isStreamManagementEnabled = false;
	this._serverProcesssedStanzasCounter = null;
	this._clientProcessedStanzasCounter = null;
	this._clientSentStanzasCounter = null;
	// this._requestResponseIntervalCount = 0;
	this._c = null;
	this._originalSend = null;

	this._messageQue = [];

	var t = {
		stanza: '',
		expect: ''
	};
	//set timer for current message. (setStatusTimer).
	// MessageSentFailListener on statusTimer timeout.
}


StreamManagement.prototype.enable = function (connection) {
	var self = this,
		enableParams = {
			xmlns: self._NS
		};

	this._c = connection;

	this._originalSend = this._c.send;
	this._c.send = this.send.bind(this);
	this._addEnableHandlers();

	if (Utils.getEnv().browser) {
		this._c.send($build('enable', enableParams));
		this._isStreamManagementEnabling = true;
	}
};

StreamManagement.prototype._addEnableHandlers = function () {
	var self = this;

	if (Utils.getEnv().browser) {
		// self._c.addHandler(onEnable, null, 'enable');
		// self._c.addHandler(onEnabled, null, 'enabled');
		// self._c.addHandler(onFailed, null, 'failed');
		self._c.addHandler(_incomingStanzaHandler.bind(self));
	}

	function _incomingStanzaHandler (stanza){
		var tagName = stanza.tagName || stanza.nodeTree.tagName;
		console.log('income', stanza)
		if(tagName === 'enabled'){
			this._isStreamManagementEnabled = true;
		}

		if(tagName === 'iq' || tagName === 'presence' || tagName === 'message'){
			self._increaseReceivedStanzasCounter();
		}

		if(tagName === 'r'){

		}

		if(tagName === 'a'){
			var h;

			if(Utils.getEnv().browser){
				h = parseInt(stanza.getAttribute('h'));
			}
			this._setSentStanzasCounter(h);
		}
		return true;
	}
};

StreamManagement.prototype.send = function (stanza) {
	var self = this,
		tagName = stanza.tagName || stanza.nodeTree.tagName,
		type = typeof stanza.getAttribute === 'function' ? stanza.getAttribute('type') :
			stanza.nodeTree.attributes.type ? stanza.nodeTree.attributes.type.value : null;

	self._originalSend.call(self._c, stanza);

	if (tagName === 'message' || tagName === 'presence' || tagName === 'iq') {
		// this._messageQue.push(stanza);
		self._increaseSentStanzasCounter();
	}
};

StreamManagement.prototype._increaseSentStanzasCounter = function () {
	var self = this;

	if(self._isStreamManagementEnabling){
		self._clientSentStanzasCounter++;
		console.info('_increaseSentStanzasCounter', self._clientSentStanzasCounter);

	}

	if(self._isStreamManagementEnabled){
		if (Utils.getEnv().browser) {
			self.send($build('r', {xmlns: self._NS}));
		}
	}
};

StreamManagement.prototype.getClientSentStanzasCounter = function(){
	return this._clientSentStanzasCounter;
};

StreamManagement.prototype._setSentStanzasCounter = function (count){
	this._serverProcesssedStanzasCounter = count;

	if (this._clientSentStanzasCounter !== this._serverProcesssedStanzasCounter) {
		console.error('Stream Management stanzas counter mismatch. Client value: ' + this._clientSentStanzasCounter + ' - Server value: ' + this._serverProcesssedStanzasCounter);
	} else {
		console.info('counters are same. Client value: ' + this._clientSentStanzasCounter + ' - Server value: ' + this._serverProcesssedStanzasCounter)
	}
};

StreamManagement.prototype._increaseReceivedStanzasCounter = function(){
	if (this._isStreamManagementEnabled) {
		this._clientProcessedStanzasCounter++;
	}
};

module.exports = StreamManagement;