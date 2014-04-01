/* 
 * QuickBlox JavaScript SDK / XMPP Chat plugin
 *
 * Chat helpers methods
 *
 */

// Browserify dependencies
require('../libs/strophe');
var config = require('./config');

var QBChatHelpers = {
	getJID: function(id) {
		return id + "-" + QB.session.application_id + "@" + config.server;
	},
	
	getNickFromNode: function(jid) {
		return Strophe.getNodeFromJid(jid).split('-')[0];
	},
	
	getNickFromResource: function(jid) {
		return Strophe.getResourceFromJid(jid);
	},
	
	parser: function(str) {
		var URL_REGEXP = /\b((?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/gi;
		str = escapeHTML(str);
		
		return str.replace(URL_REGEXP, function(match) {
			url = (/^[a-z]+:/i).test(match) ? match : 'http://' + match;
			url_text = match;
			return '<a href="' + escapeHTML(url) + '" target="_blank">' + escapeHTML(url_text) + '</a>';
		});
		
		function escapeHTML(s) {
			return s.replace(/</g, "&lt;").replace(/>/g, "&gt;");
		}
	}
};

module.exports = QBChatHelpers;
