'use strict';

function Helpers() {
}

Helpers.prototype.fillTemplate = function (name, options) {
    var tpl = _.template(document.querySelector('#' + name).innerHTML);
    return tpl(options);
};

Helpers.prototype.clearView = function (view) {
    var nodeList = view.childNodes;
    for (var i = nodeList.length; i > 0; i--) {
        view.removeChild(nodeList[i - 1]);
    }
};


Helpers.prototype.checkIsMessageReadedByMe = function(message){
    var readIds = message.read_ids,
        isReaded = readIds.some(function(id){
            return id === app.user.id;
        });

    return isReaded;
};

Helpers.prototype.checkIsMessageReadedByOccupants = function(message){
    var readIds = message.read_ids,
        isReaded = readIds.some(function(id){
            return id !== app.user.id;
        });

    return isReaded;
};

Helpers.prototype.checkIsMessageDeliveredToMe = function(message){
    var deliveredIds = message.delivered_ids,
        isDelivered = deliveredIds.some(function(id){
            return id === app.user.id;
        });

    return isDelivered;
};

Helpers.prototype.checkIsMessageDeliveredToOccupants = function(message){
    var deliveredIds = message.delivered_ids,
        isDelivered = deliveredIds.some(function(id){
            return id !== app.user.id;
        });

    return isDelivered;
};

Helpers.prototype.compileDialogParams = function (dialog) {
    var self = this;

    if(dialog.type === CONSTANTS.DIALOG_TYPES.CHAT){
        var user = {
            full_name: dialog.name,
            id: dialog.occupants_ids.filter(function (id) {
                if (id !== app.user.id) return id;
            })[0],
            color: dialog.color || _.random(1, 10)
        };

        userModule.addToCache(user);
    }

    return {
        _id: dialog._id,
        name: dialog.name,
        type: dialog.type,
        color: dialog.color || getDialogColor() || _.random(1, 10),
        last_message: dialog.last_message === CONSTANTS.ATTACHMENT.BODY ? 'Attachment' : dialog.last_message,
        messages: [],
        attachment: dialog.last_message === CONSTANTS.ATTACHMENT.BODY,
        // last_message_date_sent comes in UNIX time.
        last_message_date_sent: self.getTime(dialog.last_message_date_sent ? dialog.last_message_date_sent * 1000 : dialog.updated_at),
        users: dialog.occupants_ids || [],
        jidOrUserId: dialog.xmpp_room_jid || dialog.jidOrUserId || getRecipientUserId(dialog.occupants_ids),
        unread_messages_count: dialog.unread_messages_count,
        full: false,
        draft: {
            message: '',
            attachments: {}
        },
        joined: false
    };

    function getRecipientUserId(users) {
        if (users.length === 2) {
            return users.filter(function (user) {
                if (user !== app.user.id) {
                    return user;
                }
            })[0];
        }
    }

    function getDialogColor(){
        if(dialog.type === 3){
            var occupants = dialog.occupants_ids;
            for(var i = 0; i < occupants.length; i++){
                if(occupants[i] !== app.user.id){
                    return userModule._cache[occupants[i]].color;
                }
            }
        }
    }
};

Helpers.prototype.getTime = function (time) {
    var date = new Date(time),
        hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours(),
        minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();

    return hours + ':' + minutes;
};

Helpers.prototype.fillMessagePrams = function (message) {
    var self = this,
        selfDelevered = self.checkIsMessageDeliveredToMe(message),
        selfReaded = self.checkIsMessageReadedByMe(message);

    // date_sent comes in UNIX time.
    message.date_sent = self.getTime(message.date_sent * 1000);

    if (message.attachments) {
        var attachments = message.attachments;
        for (var i = 0; i < attachments.length; i++) {
            attachments[i].src = self.getSrcFromAttachmentId(attachments[i].id);
        }
    }

    if (message.message === CONSTANTS.ATTACHMENT.BODY) {
        message.message = '';
    }

    if(!selfDelevered){
        messageModule.sendDeliveredStatus(message._id, message.sender_id, message.chat_dialog_id);
    }

    message.selfReaded = selfReaded;

    message.status = self.getMessageStatus(message);

    return message;
};

Helpers.prototype.getMessageStatus = function(message){
    if(message.sender_id !== app.user.id){
        return undefined;
    }

    var self = this,
        deleveredToOcuupants = self.checkIsMessageDeliveredToOccupants(message),
        readedByOcuupants = self.checkIsMessageReadedByOccupants(message),
        status = !deleveredToOcuupants ? 'sent' :
            readedByOcuupants ? 'read' : 'delivered';


    return status;
};

Helpers.prototype.fillMessageBody = function (str) {
    var self = this,
        url,
        URL_REGEXP = /https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s\^\'\"\<\>\(\)]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s\^\'\"\<\>\(\)]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s\^\'\"\<\>\(\)]{2,}|www\.[a-zA-Z0-9]\.[^\s\^\'\"\<\>\(\)]{2,}/g;

    str = self.escapeHTML(str);

    // parser of paragraphs
    str = str.replace(/\n/g, '<br>');
    // parser of links
    str = str.replace(URL_REGEXP, function(match) {
        url = (/^[a-z]+:/i).test(match) ? match : 'https://' + match;

        return '<a href="' + self.escapeHTML(url) + '" target="_blank">' + self.escapeHTML(match) + '</a>';
    });

    return str;
};

Helpers.prototype.escapeHTML = function (str) {
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

Helpers.prototype.getSrcFromAttachmentId = function (id) {
    return QB.content.publicUrl(id) + '.json?token=' + app.token;
};

Helpers.prototype.fillNewMessageParams = function (userId, msg) {
    var self = this,
        message = {
            _id: msg.id,
            attachments: [],
            created_at: +msg.extension.date_sent || Date.now(),
            date_sent: self.getTime(+msg.extension.date_sent * 1000 || Date.now()),
            delivered_ids: [userId],
            message: msg.body,
            read_ids: [userId],
            sender_id: userId,
            chat_dialog_id: msg.extension.dialog_id,
            selfReaded: userId === app.user.id,
            read: 0
        };

    if (msg.extension.attachments) {
        var attachments = msg.extension.attachments;

        for (var i = 0; i < attachments.length; i++) {
            attachments[i].src = self.getSrcFromAttachmentId(attachments[i].id);
        }

        message.attachments = attachments;
    }

    if (message.message === CONSTANTS.ATTACHMENT.BODY) {
        message.message = '';
    }

    if(msg.extension.notification_type) {
        message.notification_type = msg.extension.notification_type;
    }

    if(msg.extension.new_occupants_ids){
        message.new_occupants_ids = msg.extension.new_occupants_ids;
    }

    message.status = (userId !== app.user.id) ? self.getMessageStatus(message) : undefined;

    return message;
};

Helpers.prototype.toHtml = function (str) {
    var tmp = document.createElement('div'),
        elements = [],
        nodes;

    tmp.innerHTML = str;
    nodes = tmp.childNodes;

    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].nodeType === 1) elements.push(nodes[i]);
    }

    return elements;
};

Helpers.prototype.scrollTo = function (elem, position) {
    var self = this,
        elemHeight = elem.offsetHeight,
        elemScrollHeight = elem.scrollHeight;

    if (position === 'bottom') {
        if ((elemScrollHeight - elemHeight) > 0) {
            elem.scrollTop = elemScrollHeight;
        }
    } else if (position === 'top') {
        elem.scrollTop = 0;
    } else if (+position) {
        elem.scrollTop = +position
    }
};

Helpers.prototype.clearCache = function () {
    if (messageModule._typingTime) {
        messageModule.sendStopTypingStatus(dialogModule.dialogId);
    }
    
    messageModule._cache = {};
    messageModule.typingUsers = {};

    dialogModule._cache = {};
    dialogModule.dialogId = null;
    dialogModule.prevDialogId = null;

    userModule._cache = {};
    app.user = null;
};

Helpers.prototype.getUui = function(){
    var navigator_info = window.navigator;
    var screen_info = window.screen;
    var uid = 'chat' + navigator_info.mimeTypes.length;

    uid += navigator_info.userAgent.replace(/\D+/g, '');
    uid += navigator_info.plugins.length;
    uid += screen_info.height || '';
    uid += screen_info.width || '';
    uid += screen_info.pixelDepth || '';

    return uid;
};

var helpers = new Helpers();
