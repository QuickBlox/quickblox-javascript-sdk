/**
 * QuickBlox JavaScript SDK
 * Chat Module (Chat Stream Management plugin)
 */

/** Modules */
var config = require('../qbConfig');
var Utils = require('../qbUtils');


/*
 *
 * */

function StreamManagement() {

	this._NS = 'urn:xmpp:sm:3';
	this._isStreamManagementEnabled = false;
	this._serverProcesssedStanzasCounter = null;
	this._clientProcessedStanzasCounter = null;
	this._requestResponseIntervalCount = 0;
	this._c = null;
	this._originalSend = null;

	this.sreamStorage = {
		// key - stanzaID.
		// vallue - message object.
	};
}


StreamManagement.prototype.enable = function (connection) {
	var self = this;

	self._c = connection;
	self._originalSend = self._c.send;
	self._updateSendMethod();

	var enableStanza,
		enableParams = {
			xmlns: self._NS,
			resume: false
		};

	self._addEnableHandlers();

	if (Utils.getEnv().browser) {
		enableStanza = $build('enable', enableParams);
		console.log('send enable stanza', enableStanza);
		self._originalSend.call(self._c, enableStanza);
	}
};

StreamManagement.prototype._addEnableHandlers = function () {
	var self = this;

	if (Utils.getEnv().browser) {
		self._c.addHandler(function (elem) {
			console.log('enable', elem.nodeTree.outerHTML);
		}, null, 'enable');
		self._c.addHandler(function (elem) {
			console.log('enabled', elem.nodeTree.outerHTML);
			self._isStreamManagementEnabled = true;
		}, null, 'enabled');
		self._c.addHandler(function (elem) {
			console.log('failed', elem.nodeTree.outerHTML);
		}, null, 'failed');
	}
};

StreamManagement.prototype._updateSendMethod = function () {
	var self = this;

	self._c.send = function (stanza) {
		if (Utils.getEnv().browser) {
			console.log('send updated', stanza);
			return self._originalSend.call(self._c, stanza);
		}
	};
};

StreamManagement.prototype._increaseSentStanzasCounter = function () {
	var self = this;
	self._clientProcessedStanzasCounter++;
	console.log('_increaseSentStanzasCounter   !!!!!!!', self._clientProcessedStanzasCounter);
};
module.exports = StreamManagement;