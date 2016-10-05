var utils = require('../qbUtils');
var config = require('../qbConfig');

var ERR_UNKNOWN_INTERFACE = 'Unknown interface. SDK support browser / node env.';

var MARKERS = {
    CLIENT: 'jabber:client',
    CHAT: 'urn:xmpp:chat-markers:0',
    STATES: 'http://jabber.org/protocol/chatstates',
    MARKERS: 'urn:xmpp:chat-markers:0',
    CARBONS: 'urn:xmpp:carbons:2',
    ROSTER: 'jabber:iq:roster',
    MUC: 'http://jabber.org/protocol/muc',
    PRIVACY: 'jabber:iq:privacy'
};

var qbChatHelpers = {
    MARKERS: MARKERS,
    getMyselfJid: function(conn) {
        if(utils.getEnv().browser) {
            return conn.jid;
        } else if(utils.getEnv().node) {
            return nClient.jid.user + '@' + nClient.jid._domain + '/' + nClient.jid._resource;
        }
    },
    /**
     * @param {params} this object may contains Jid or Id property
     * @return {string} jid of user
     */
    buildUserJid: function(params) {
        var jid;

        if ('userId' in params) {
            jid = params.userId + '-' + config.creds.appId + '@' + config.endpoints.chat;

            if ('resource' in params) {
                jid = userJid + "/" + params.resource;
            }
        } else if ('jid' in params) {
            jid = params.jid;
        }

        return jid;
    },
    createStanza: function(builder, params, type) {
        var stanza;

        if(utils.getEnv().browser) {
            stanza = builder(params);
        } else if(utils.getEnv().node) {
            stanza = new builder(type ? type : 'message', params);
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
    _JStoXML: function(title, obj, msg) {
        var self = this;

        msg.c(title);

        Object.keys(obj).forEach(function(field) {
            if (typeof obj[field] === 'object') {
                self._JStoXML(field, obj[field], msg);
            } else {
                msg.c(field).t(obj[field]).up();
            }
        });

        msg.up();
    },
    _XMLtoJS: function(extension, title, obj) {
        var self = this;

        extension[title] = {};

        for (var i = 0, len = obj.childNodes.length; i < len; i++) {
            if (obj.childNodes[i].childNodes.length > 1) {
                extension[title] = self._XMLtoJS(extension[title], obj.childNodes[i].tagName, obj.childNodes[i]);
            } else {
                extension[title][obj.childNodes[i].tagName] = obj.childNodes[i].textContent;
            }
        }
        return extension;
    },
    filledExtraParams: function(stanza, extension, isSystemMsg) {
        var helper = this;

        Object.keys(extension).forEach(function(field) {
            if (field === 'attachments') {
                extension[field].forEach(function(attach) {
                    stanza.c('attachment', attach).up();
                });
            } else if (typeof extension[field] === 'object') {
                helper._JStoXML(field, extension[field], stanza);
            } else {
                if(utils.getEnv().browser) {
                    stanza.c(field).t(extension[field]).up();
                } else if(utils.getEnv().node) {
                stanza.getChild('extraParams')
                    .c(field).t(extension[field]).up();
                }
            }
        });

        stanza.up();

        return stanza;
    },
    parseExtraParams: function(extraParams) {
        if(!extraParams){
            return null;
        }

        var extension = {};
        var dialogId;

        var attachments = [];

        if (utils.getEnv().browser) {
            for (var i = 0, len = extraParams.childNodes.length; i < len; i++) {
                // parse attachments
                if (extraParams.childNodes[i].tagName === 'attachment') {
                    var attach = {};
                    var attributes = extraParams.childNodes[i].attributes;

                    for (var j = 0, len2 = attributes.length; j < len2; j++) {
                        if (attributes[j].name === 'size'){
                            attach[attributes[j].name] = parseInt(attributes[j].value);
                        } else {
                            attach[attributes[j].name] = attributes[j].value;
                        }
                    }

                    attachments.push(attach);

                    // parse 'dialog_id'
                } else if (extraParams.childNodes[i].tagName === 'dialog_id') {
                    dialogId = extraParams.childNodes[i].textContent;
                    extension['dialog_id'] = dialogId;

                    // parse other user's custom parameters
                } else {
                    if (extraParams.childNodes[i].childNodes.length > 1) {
                        // Firefox issue with 4K XML node limit:
                        // http://www.coderholic.com/firefox-4k-xml-node-limit/
                        var nodeTextContentSize = extraParams.childNodes[i].textContent.length;
                        if (nodeTextContentSize > 4096) {
                            var wholeNodeContent = "";
                            for(var j=0; j<extraParams.childNodes[i].childNodes.length; ++j){
                                wholeNodeContent += extraParams.childNodes[i].childNodes[j].textContent;
                            }
                            extension[extraParams.childNodes[i].tagName] = wholeNodeContent;
                        } else {
                            extension = chatUtils._XMLtoJS(extension, extraParams.childNodes[i].tagName, extraParams.childNodes[i]);
                        }
                    } else {
                        extension[extraParams.childNodes[i].tagName] = extraParams.childNodes[i].textContent;
                    }
                }
            }

            if (attachments.length > 0) {
                extension.attachments = attachments;
            }
        } else if(utils.getEnv().node) {
            for (var i = 0, len = extraParams.children.length; i < len; i++) {
                if(extraParams.children[i].name === 'dialog_id') {
                    dialogId = extraParams.getChildText('dialog_id');
                    extension['dialog_id'] = dialogId;
                }

                if(extraParams.children[i].children.length === 1) {
                    var child = extraParams.children[i];

                    extension[child.name] = child.children[0];
                }
            }
        }

        if(extension.moduleIdentifier) {
            delete extension.moduleIdentifier;
        }

        return {
            extension: extension,
            dialogId: dialogId
        };
    },
    getUniqueId: function(suffix) {
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : r & 0x3 | 0x8;
            return v.toString(16);
        });
        if (typeof(suffix) == 'string' || typeof(suffix) == 'number') {
            return uuid + ':' + suffix;
        } else {
            return uuid + '';
        }
    },
    getErrorFromXMLNode: function(stanzaError) {
        var errorElement = stanzaError.getElementsByTagName('error')[0];
        var errorCode = parseInt(errorElement.getAttribute('code'));
        var errorText = errorElement.getElementsByTagName('text')[0].textContent;

        return utils.getError(errorCode, errorText);
    },
    getLocalTime: function() {
        return (new Date()).toTimeString().split(' ')[0];
    }
};

module.exports = qbChatHelpers;
