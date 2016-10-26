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
	this.builder = null
	// Original connection.send method
	this._originalSend = null;

	// In progress stanzas queue
	this._stanzasQueue = [];
}


StreamManagement.prototype.enable = function (connection, client) {
	var self = this,
        stanza,
		enableParams = {
			xmlns: self._NS
		};

	self._c = connection;

	self._originalSend = this._c.send;
	self._c.send = this.send.bind(self);
	self._addEnableHandlers();

    if(Utils.getEnv().browser){
        stanza = $build('enable', enableParams)
    } else if (Utils.getEnv().node){
        self._nodeBuilder =  client.Stanza;
        stanza = chatUtils.createStanza(self._nodeBuilder, enableParams, 'enable');
    }

	self._c.send(stanza);
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
	} else if (Utils.getEnv().node){
		self._c.on('stanza', _incomingStanzaHandler.bind(self))
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
			var params = {
					xmlns: self._NS,
					h: self._clientProcessedStanzasCounter
				},
                stanza = Utils.getEnv().browser ? $build('a', params) :
                    chatUtils.createStanza(self._nodeBuilder, params, 'a');


			self._originalSend.call(self._c, stanza);
		}

		if(tagName === 'a'){
			var h = parseInt(chatUtils.getAttr(stanza, 'h'));

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
        var stanza = Utils.getEnv().browser ? $build('r', { xmlns: self._NS}) :
            chatUtils.createStanza(self._nodeBuilder, { xmlns: self._NS}, 'r');

        self._originalSend.call(self._c, stanza);
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
		} else if(Utils.getEnv().node) {
            resultXML = err || success
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