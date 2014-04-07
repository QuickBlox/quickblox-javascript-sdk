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
	
	getIDFromNode: function(jid) {
		return parseInt(Strophe.getNodeFromJid(jid).split('-')[0]);
	},
	
	getIDFromResource: function(jid) {
		var resource = Strophe.getResourceFromJid(jid);
		return parseInt(resource) || resource;
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
	},
	
	addTypingMessage: function(obj, nick) {
		obj.text(obj.text().split(' ...')[0].concat(', ').concat(nick).concat(' ...'));
	},
	
	removeTypingMessage: function(obj, nick) {
		obj.text(obj.text().replace(', ' + nick, '').replace(nick + ', ', '').replace(nick + ' ...', ''));
		if (obj.text().length == 0) obj.remove();
	},
	
	getLinkOnFile: function(uid) {
		return config.amazon + uid;
	}
};

module.exports = QBChatHelpers;
