/**
 * QuickBlox JavaScript SDK
 * Chat Module (Chat Stream Management plugin)
 */

/** Modules */
var Utils = require('../qbUtils'),
	chatUtils = require('../modules/qbChatHelpers');

function StreamManagement(options) {

	this._NS = 'urn:xmpp:sm:3';

    this._isStreamManagementEnabled = false;

	// Counter of the incoming stanzas
	this._clientProcessedStanzasCounter = null;

	this._clientExpectStanzasCounter = null;

	// The client send stanza counter.
	this._clientSentStanzasCounter = null;

	this._timeInterval = 2000;

	this.sentMessageCallback = null;
    if(Utils.getEnv().browser){
		this._parser = new DOMParser();
	} else if(Utils.getEnv().node){
		this._parser = require('xml2js').parseString;
	}
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

/*
 * TODO
 *
 * 1. Add node.js Functionality
 * 2. return in the same session on reconnect (configuraible)
 *
 if(Utils.getEnv().node){
 const
 }
 * */

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
	} else if (Utils.getEnv().browser){
		console.log('add handlers node');
	}

	function _incomingStanzaHandler (stanza){
		/*
		* Getting incoming stanza tagName
		* */

		var tagName = stanza.name || stanza.tagName || stanza.nodeTree.tagName;

		if(tagName === 'enabled'){
			self._isStreamManagementEnabled = true;
			self._clientExpectStanzasCounter = self._clientSentStanzasCounter+1;

			setInterval(this._timeoutCallback.bind(this), this._timeInterval);
		}

		if(chatUtils.getAttr(stanza, 'xmlns') !== self._NS){
			self._increaseReceivedStanzasCounter();
		}

		if(tagName === 'r'){
			self._originalSend.call(self._c, $build('a', { xmlns: self._NS, h: self._clientProcessedStanzasCounter}));
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
		tagName = stanza.name || stanza.tagName || stanza.nodeTree.tagName,
		type = chatUtils.getAttr(stanza, 'type');

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

        self._originalSend.call(self._c, $build('r', { xmlns: self._NS, id: self._clientSentStanzasCounter}));
    }
};

StreamManagement.prototype.getClientSentStanzasCounter = function(){
	return this._clientSentStanzasCounter;
};

StreamManagement.prototype._setSentStanzasCounter = function (count){
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

		var stanza = err || success,
			resultXML;
		if(Utils.getEnv().browser){
			resultXML = stanza.nodeTree ? this._parser.parseFromString(stanza.nodeTree.outerHTML, "application/xml").childNodes[0] : stanza;
		}

		if (err) {
			this.sentMessageCallback(resultXML);
        } else {
			this.sentMessageCallback(null, resultXML);
		}
	}
};

StreamManagement.prototype._increaseReceivedStanzasCounter = function(){
	this._clientProcessedStanzasCounter++;
};

module.exports = StreamManagement;