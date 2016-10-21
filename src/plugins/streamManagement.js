/**
 * QuickBlox JavaScript SDK
 * Chat Module (Chat Stream Management plugin)
 */

/** Modules */
var Utils = require('../qbUtils');

/*
* TODO
*
* 1. Add node.js Functionality
* 2. return in the same session on reconnect (configuraible)
*
* */


function StreamManagement(options) {

	this._NS = 'urn:xmpp:sm:3';

    this._isStreamManagementEnabled = false;

	// The last income server counter
	this._serverProcesssedStanzasCounter = null;

	// Counter of the incoming stanzas
	this._clientProcessedStanzasCounter = null;

	this._clientExpectStanzasCounter = null;

	// The client send stanza counter.
	this._clientSentStanzasCounter = null;

	this._timeInterval = 2000;

	this.sentMessageCallback = null;

	// connection
	this._c = null;

	// Original connection.send method
	this._originalSend = null;

	// In progress stanzas queue
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
	}
};

StreamManagement.prototype._timeoutCallback = function () {
    var self = this,
        now = Date.now(),
        updatedStanzasQueue = [];

    if(self._stanzasQueue.length){
        for(var i = 0; i < self._stanzasQueue.length; i++){
            if(self._stanzasQueue[i] && self._stanzasQueue[i].time < now){
				self._messageStatusCallback(self._stanzasQueue[i].message);
            } else {
                updatedStanzasQueue.push(self._stanzasQueue[i]);
            }
        }

        self._stanzasQueue = updatedStanzasQueue;
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
			self._isStreamManagementEnabled = true;
			self._clientExpectStanzasCounter = self._clientSentStanzasCounter+1;

			setInterval(this._timeoutCallback.bind(this), this._timeInterval);
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

	if (tagName !== 'enable' && tagName !== 'resume' && tagName !== 'a' && tagName !== 'r') {
		self._increaseSentStanzasCounter(stanza);
	}
};

StreamManagement.prototype._increaseSentStanzasCounter = function (stanza) {
	var self = this;

    self._clientSentStanzasCounter++;

    if(self._isStreamManagementEnabled){
        self._stanzasQueue.push({
            message: stanza,
            time: Date.now() + self._timeInterval
        });

        self._originalSend.call(self._c, $build('r', { xmlns: self._NS }));
    }
};

StreamManagement.prototype.getClientSentStanzasCounter = function(){
	return this._clientSentStanzasCounter;
};

StreamManagement.prototype._setSentStanzasCounter = function (count){
    this._serverProcesssedStanzasCounter = count;

	if (this._clientExpectStanzasCounter !== count){
		this._messageStatusCallback(this._stanzasQueue[0].message);
	} else {
		this._messageStatusCallback(null, this._stanzasQueue[0].message)
	}


	this._stanzasQueue.shift();
    this._clientExpectStanzasCounter++;
};

StreamManagement.prototype._messageStatusCallback = function(err, success){
	if(typeof this.sentMessageCallback === 'function') {
		this.sentMessageCallback(err, success);
	}
};

StreamManagement.prototype._increaseReceivedStanzasCounter = function(){
	if (this._isStreamManagementEnabled) {
		this._clientProcessedStanzasCounter++;
	}
};

module.exports = StreamManagement;