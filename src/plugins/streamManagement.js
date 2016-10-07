/**
 * QuickBlox JavaScript SDK
 * Chat Module (Chat Stream Management plugin)
 */

/** Modules */
var Utils = require('../qbUtils');

/*
* TODO
* 1. Add node.js Functionality
* 2. Send messages again after error
* 3. Add error callback
* 4. Add success callback
* 5.
* */


function StreamManagement() {

	this._NS = 'urn:xmpp:sm:3';
	this._streamManagementEnabling = false;
	this._isStreamManagementEnabled = false;
	// The last income server counter
	this._serverProcesssedStanzasCounter = null;
	// Counter of the incoming stanzas
	this._clientProcessedStanzasCounter = null;
	// The client send stanza counter.
	this._clientSentStanzasCounter = null;
	this._expectedStanzaCounter = null;
	this._requestResponseIntervalCount = 0;
	this.requestResponseInterval = 5;

	// connection
	this._c = null;

	// Original connection.send method
	this._originalSend = null;

	// In progress stanzas йueue
	this._stanzasQueue = [];
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
		this._streamManagementEnabling = true;
	}
};

StreamManagement.prototype._addEnableHandlers = function () {
	var self = this;

	if (Utils.getEnv().browser) {
		self._c.addHandler(_incomingStanzaHandler.bind(self));
	}

	function _incomingStanzaHandler (stanza){
		/*
		* Getting incoming stanza tagName
		* */

		var tagName = stanza.tagName || stanza.nodeTree.tagName;

		if(tagName === 'enabled'){
			this._isStreamManagementEnabled = true;
		}

		if(tagName === 'iq' || tagName === 'presence' || tagName === 'message'){
			self._increaseReceivedStanzasCounter();
		}

		if(tagName === 'r'){
			console.log('r income');
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
		self._increaseSentStanzasCounter(stanza);
	}
};

StreamManagement.prototype._increaseSentStanzasCounter = function (stanza) {
	var self = this;

	if(self._streamManagementEnabling){
		self._clientSentStanzasCounter++;
		self._requestResponseIntervalCount++;
		self._stanzasQueue.push(stanza);

		console.info('_increaseSentStanzasCounter', self._clientSentStanzasCounter);

		if(self._isStreamManagementEnabled){
			if (self._requestResponseIntervalCount === self.requestResponseInterval) {
				self._requestResponseIntervalCount = 0;
				self._expectedStanzaCounter = self._clientSentStanzasCounter;

				this._originalSend.call(this._c, $build('r', { xmlns: this._NS }));
			}
		}
	}
};

StreamManagement.prototype.getClientSentStanzasCounter = function(){
	return this._clientSentStanzasCounter;
};

StreamManagement.prototype._setSentStanzasCounter = function (count){
	this._serverProcesssedStanzasCounter = count;

	if (this._expectedStanzaCounter !== this._serverProcesssedStanzasCounter) {
		// TO DO:
		// add ERROR stanzas listener.

		console.error('Stream Management stanzas counter mismatch. Client value: ' + this._expectedStanzaCounter + ' - Server value: ' + this._serverProcesssedStanzasCounter);
	} else {
		// add SUCCESS stanzas listener.
		this._stanzasQueue.length = 0;
		console.info('Counters are same. Client value: ' + this._expectedStanzaCounter + ' - Server value: ' + this._serverProcesssedStanzasCounter)
	}
};

StreamManagement.prototype._increaseReceivedStanzasCounter = function(){
	if (this._isStreamManagementEnabled) {
		this._clientProcessedStanzasCounter++;
	}
};

module.exports = StreamManagement;