var utils = require('../qbUtils');

var ERR_UNKNOWN_INTERFACE = 'Unknown interface. SDK support browser / node env.';

var MARKERS = {
    CLIENT: 'jabber:client',
    CHAT: 'urn:xmpp:chat-markers:0'
};

var qbChatHelpers = {
    MARKERS: MARKERS,
    createStanzaMessage: function(builder, params) {
        var stanza;

        if(utils.getEnv().browser) {
            stanza = builder(params);
        } else if(utils.getEnv().node) {
            stanza = new builder('message', params);
        }

        return stanza;
    },
    getAttr: function(el, attrName) {
        var attr;

        if(typeof el.getAttribute === 'function') {
            attr = el.getAttribute(attrName);
        } else if(el.attrs) {
            attr = el.attrs[attrName];
        } else {
            throw ERR_UNKNOWN_INTERFACE;
        }

        return attr ? attr : null;
    },
    getElement: function(stanza, elName) {
        var el;

        if(typeof stanza.querySelector === 'function') {
            el = stanza.querySelector(elName);
        } else if(typeof stanza.getChild === 'function'){
            el = stanza.getChild(elName);
        } else {
            throw ERR_UNKNOWN_INTERFACE;
        }

        return el ? el : null;
    },
    getElementText: function(stanza, elName) {
        var el,
            txt;

        if(typeof stanza.querySelector === 'function') {
            el = stanza.querySelector(elName);
            txt = el ? el.textContent : null;
        } else if(typeof stanza.getChildText === 'function') {
            txt = stanza.getChildText(elName);
        } else {
            throw ERR_UNKNOWN_INTERFACE;
        }

        return txt ? txt : null;
    },
};

module.exports = qbChatHelpers;
