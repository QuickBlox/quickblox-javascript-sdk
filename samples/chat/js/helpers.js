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

Helpers.prototype.renderLastMessages = async function () {

    var messages = await messageModule._getMessages({
        chat_dialog_id: dialogModule.dialogId,
        sort_desc: 'date_sent',
        limit: messageModule.limit,
        mark_as_read: 0
    });

    var dialog = dialogModule._cache[dialogModule.dialogId];

    var lastDate = dialog.messages[0] ? new Date(dialog.messages[0].created_at).getTime() : undefined;

    if(messages.items.length>0) {
        messages.items = messages.items.filter(mes => lastDate < new Date(mes.created_at).getTime());
        dialog.messages = messages.items.concat(dialog.messages);
    }else{
        return;
    }

    if(dialog.messages.length>0) {
        messages.items.forEach(function (item) {
            helpers.copyUiKitFields(item, item);
        });
        var userIds = helpers.collectSenderIds(dialog.messages);
        await userModule.getUsersByIds(userIds)

        messages.items = messages.items.reverse();

        for (var i = 0; i < messages.items.length; i++) {
            var message = helpers.fillMessagePrams(messages.items[i]);
            messageModule.renderMessage(message, true);
        }

        helpers.scrollTo(dialogModule.messagesContainer, 'bottom');

    }

};


Helpers.prototype.renderDashboard = async function () {

    var dialogs = await dialogModule._getDialogs({
        limit: 50,
        skip: 0,
        sort_desc: "updated_at"
    });

    dialogs = dialogs.reverse();

    // Detect left group dialogs
    var leavedDialogs = helpers.extractLeavedDialogs(
        userModule._cache[app.user.id] && userModule._cache[app.user.id].custom_data
    );

    _.each(dialogs, function (dialog) {

        var tplDateMessage = {};

        if (dialogModule._cache[dialog._id]) {
            dialog.color = dialogModule._cache[dialog._id].color || _.random(1, 10);
            dialog.messages = dialogModule._cache[dialog._id].messages || [];
            tplDateMessage = dialogModule._cache[dialog._id].tplDateMessage || {};
        }

        dialogModule._cache[dialog._id] = helpers.compileDialogParams(dialog);
        dialogModule._cache[dialog._id].tplDateMessage = tplDateMessage;

        // Restore left flag for previously left group dialogs
        if (leavedDialogs[dialog._id] && dialog.type === CONSTANTS.DIALOG_TYPES.GROUPCHAT) {
            dialogModule._cache[dialog._id].left = true;
        }

        var elem = document.getElementById(dialog._id);
        if(elem) {
            elem.parentNode.removeChild(elem);
        }
        dialogModule.renderDialog(dialogModule._cache[dialog._id], true);
    });

    if (dialogModule.dialogId !== null) {

        var dialogElem = document.getElementById(dialogModule.dialogId);
        if (dialogElem){
            dialogElem.classList.remove('selected');
            dialogElem.classList.add('selected');
        }

        await helpers.renderLastMessages();

    }

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

    var lastMessagePreview = self.getDialogLastMessagePreview(dialog.last_message);

    return {
        _id: dialog._id,
        name: dialog.name,
        type: dialog.type,
        color: dialog.color || getDialogColor() || _.random(1, 10),
        last_message: lastMessagePreview || dialog.last_message,
        messages: dialog.messages || [],
        attachment: lastMessagePreview === 'Attachment',
        // last_message_date_sent comes in UNIX time.
        last_message_date_sent: dialog.last_message_date_sent ? dialog.last_message_date_sent * 1000 : dialog.updated_at,
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

Helpers.prototype.getDialogLastMessageTime = function (time) {
    var
        today = new Date(),
        date = new Date(time),
        day = !isNaN(date.getDate())?date.getDate():'',
        month = !isNaN(date.getDate())?date.toJSON().slice(0,10).split('-').reverse()[1]:'',
        year = !isNaN(date.getDate())?date.getFullYear().toString():'',
        hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours(),
        minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();


    var currentYear = false;
    if (today.getFullYear().toString() === year ) {
        currentYear = true;
        month = date.toLocaleString('en-us', { month: 'short' });
    }

    year = year.substr(-2) || '';

    var yesterday  = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (today.toDateString() === date.toDateString()) {
        return hours + ':' + minutes;
    } else if(yesterday.toDateString() === date.toDateString()){
        return 'Yesterday';
    } else {

        if(currentYear){
            return day + '&nbsp;' + month;
        }else {
            return day + '.' + month + '.' + year;
        }
    }
};

Helpers.prototype.getTime = function (time) {
    var date = new Date(time),
        hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours(),
        minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();

    return hours + ':' + minutes;
};

Helpers.prototype.debounce =  function(func, wait, immediate) {
    var timeout;
    return () => {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

Helpers.prototype.__ = function() {
    this.context  = [];
    var self = this;
    this.selector = function( _elem, _sel ){
        return _elem.querySelectorAll( _sel );
    };
    this.on = function( _event, _element, _function ){
        this.context = self.selector( document, _element );
        document.addEventListener( _event, function(e){
            var elem = e.target;
            while ( elem != null ) {
                if( "#"+elem.id == _element || self.isClass( elem, _element ) || self.elemEqal( elem ) ){
                    _function( e, elem );
                }
                elem = elem.parentElement;
            }
        }, false );
    };

    this.isClass = function( _elem, _class ){
        var names = _elem.className.trim().split(" ");
        for( this.it = 0; this.it < names.length; this.it++ ){
            names[this.it] = "."+names[this.it];
        }
        return names.indexOf( _class ) != -1 ? true : false;
    };

    this.elemEqal = function( _elem ){
        var flg = false;
        for( this.it = 0; this.it < this.context.length;  this.it++ ){
            if( this.context[this.it] === _elem && !flg ){
                flg = true;
            }
        }
        return flg;
    };

};

Helpers.prototype._ = function ( _sel_string ) {
    return new this.__( _sel_string );
};

Helpers.prototype.fillMessagePrams = function (message) {
    var self = this;

    message.attachments = message.attachments || [];
    message.read_ids = message.read_ids || [];
    message.delivered_ids = message.delivered_ids || [];
    self.copyUiKitFields(message, message);

    var selfDelevered = self.checkIsMessageDeliveredToMe(message),
        selfReaded = self.checkIsMessageReadedByMe(message);

    // date_sent comes in UNIX time.
    message.date_sent = self.getTime(message.date_sent * 1000);

    for (var i = 0; i < message.attachments.length; i++) {
        message.attachments[i].src = self.getAttachmentSrc(message.attachments[i]);
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

    if (str == null) {
        str = '';
    }
    str = String(str);
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
    if (str == null) {
        return '';
    }

    return String(str).replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

Helpers.prototype.getSrcFromAttachmentId = function (id) {
    return QB.content.publicUrl(id) + '.json?token=' + app.token;
};

Helpers.prototype.getMessageBody = function (message) {
    if (!message) {
        return '';
    }

    if (message.message != null && message.message !== '') {
        return String(message.message);
    }

    if (message.body != null && message.body !== '') {
        return String(message.body);
    }

    return '';
};

Helpers.prototype.parseUiKitOriginalMessages = function (raw, depth) {
    var self = this,
        maxDepth = CONSTANTS.UI_KIT.MAX_ORIGINAL_DEPTH,
        parsed = [];

    depth = depth || 0;

    if (depth >= maxDepth || raw == null || raw === '') {
        return [];
    }

    if (Array.isArray(raw)) {
        parsed = raw;
    } else if (typeof raw === 'string') {
        try {
            parsed = JSON.parse(raw);
        } catch (e) {
            return [];
        }
    } else {
        return [];
    }

    if (!Array.isArray(parsed)) {
        return [];
    }

    return parsed.filter(function (item) {
        return item && typeof item === 'object';
    }).map(function (item) {
        item.original_messages = self.parseUiKitOriginalMessages(
            item.qb_original_messages || item.original_messages,
            depth + 1
        );
        item.attachments = item.attachments || [];

        return item;
    });
};

Helpers.prototype.isUiKitMediaBody = function (str) {
    if (!str) {
        return false;
    }

    str = String(str);

    return str.indexOf(CONSTANTS.UI_KIT.MEDIA_PREFIX) !== -1 ||
        str.indexOf(CONSTANTS.UI_KIT.ATTACHMENT_PREFIX) !== -1;
};

Helpers.prototype.isUiKitForwardOrReply = function (message) {
    var action = message && message.qb_message_action,
        originals = message && message.original_messages,
        body = this.getMessageBody(message);

    if (action === 'forward' || action === 'reply') {
        return true;
    }

    if (originals && originals.length) {
        return true;
    }

    return body.indexOf(CONSTANTS.UI_KIT.FORWARD_PREFIX) !== -1 ||
        body.indexOf(CONSTANTS.UI_KIT.REPLY_PREFIX) !== -1;
};

Helpers.prototype.parseUiKitMediaBody = function (str) {
    if (!this.isUiKitMediaBody(str)) {
        return null;
    }

    var parts = String(str).split('|');

    if (parts.length < 3) {
        return null;
    }

    return {
        name: parts[1] || '',
        uid: parts[2] || '',
        mime: parts[3] || ''
    };
};

Helpers.prototype.getAttachmentUid = function (attachment) {
    if (!attachment) {
        return '';
    }

    return String(attachment.uid || attachment.id || '');
};

Helpers.prototype.getAttachmentSrc = function (attachment) {
    var uid = this.getAttachmentUid(attachment);

    if (!uid) {
        return '';
    }

    return this.getSrcFromAttachmentId(uid);
};

Helpers.prototype.isImageAttachment = function (attachment) {
    var type = attachment && attachment.type != null ? String(attachment.type).toLowerCase() : '',
        contentType = attachment && (attachment['content-type'] || attachment.contentType),
        name = attachment && attachment.name != null ? String(attachment.name) : '',
        mime;

    contentType = contentType != null ? String(contentType).toLowerCase() : '';
    mime = contentType || type;

    if (/\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name)) {
        return true;
    }

    if (mime.indexOf('image/') === 0) {
        return true;
    }

    if (contentType && contentType.indexOf('image/') !== 0) {
        return false;
    }

    if (type === 'image' && name && /\.[a-z0-9]{2,5}$/i.test(name)) {
        return false;
    }

    if (type === 'image' || !mime) {
        return true;
    }

    return false;
};

Helpers.prototype.sanitizeUiKitServiceBody = function (str) {
    var ui = CONSTANTS.UI_KIT;

    if (str == null) {
        return '';
    }

    str = String(str).trim();

    if (!str) {
        return '';
    }

    if (str === ui.FORWARD_PREFIX || str === ui.REPLY_PREFIX) {
        return '';
    }

    if (this.isUiKitMediaBody(str)) {
        return '';
    }

    if (str.indexOf(ui.FORWARD_PREFIX) !== -1) {
        str = str.split(ui.FORWARD_PREFIX).join('').trim();
    }

    if (str.indexOf(ui.REPLY_PREFIX) !== -1) {
        str = str.split(ui.REPLY_PREFIX).join('').trim();
    }

    return str;
};

Helpers.prototype.normalizeAttachments = function (attachments) {
    var self = this,
        result = [];

    if (!attachments || !attachments.length) {
        return result;
    }

    for (var i = 0; i < attachments.length; i++) {
        var attachment = attachments[i],
            uid = self.getAttachmentUid(attachment);

        if (!uid) {
            continue;
        }

        result.push({
            id: uid,
            uid: uid,
            name: self.escapeHTML(attachment.name || 'File'),
            type: attachment.type || '',
            src: attachment.src || self.getAttachmentSrc(attachment),
            isImage: self.isImageAttachment(attachment)
        });
    }

    return result;
};

Helpers.prototype.attachmentsFromMediaBody = function (str) {
    var media = this.parseUiKitMediaBody(str);

    if (!media) {
        return [];
    }

    if (media.uid) {
        return this.normalizeAttachments([{
            uid: media.uid,
            name: media.name,
            type: media.mime
        }]);
    }

    return [{
        id: '',
        uid: '',
        name: this.escapeHTML(media.name || 'File'),
        type: media.mime || '',
        src: '',
        isImage: false
    }];
};

Helpers.prototype.copyUiKitFields = function (message, source) {
    source = source || {};
    message.attachments = message.attachments || [];

    if (source.qb_message_action) {
        message.qb_message_action = source.qb_message_action;
    }

    if (source.origin_sender_name) {
        message.origin_sender_name = source.origin_sender_name;
    } else if (message.origin_sender_name == null) {
        message.origin_sender_name = false;
    }

    message.original_messages = this.parseUiKitOriginalMessages(
        source.qb_original_messages || message.qb_original_messages || message.original_messages
    );

    return message;
};

Helpers.prototype.collectSenderIds = function (messages) {
    var ids = [];

    function add(id) {
        id = Number(id);

        if (!id || ids.indexOf(id) !== -1) {
            return;
        }

        ids.push(id);
    }

    function walk(list) {
        if (!list || !list.length) {
            return;
        }

        for (var i = 0; i < list.length; i++) {
            if (!list[i]) {
                continue;
            }

            add(list[i].sender_id);
            walk(list[i].original_messages);
        }
    }

    walk(messages);

    return ids;
};

Helpers.prototype.getCachedUserName = function (userId) {
    var user = userModule._cache[userId];

    if (!user) {
        return '';
    }

    return user.name || user.full_name || '';
};

Helpers.prototype.buildQuoteViewModel = function (original) {
    var self = this,
        senderId = original && original.sender_id,
        senderName = self.getCachedUserName(senderId) ||
            original.origin_sender_name ||
            (senderId ? 'User ' + senderId : 'Unknown user'),
        body = self.getMessageBody(original),
        attachments = self.normalizeAttachments(original && original.attachments),
        text = self.sanitizeUiKitServiceBody(body);

    if (!attachments.length) {
        attachments = self.attachmentsFromMediaBody(body);
    }

    if (!attachments.length && self.isUiKitMediaBody(body)) {
        attachments = [{
            id: '',
            uid: '',
            name: self.escapeHTML('File'),
            type: '',
            src: '',
            isImage: false
        }];
    }

    return {
        sender_id: senderId || '',
        sender_name: self.escapeHTML(senderName),
        messageHtml: text ? self.fillMessageBody(text) : '',
        attachments: attachments
    };
};

Helpers.prototype.collectQuoteViewModels = function (originals, quotes) {
    if (!originals || !originals.length) {
        return quotes;
    }

    for (var i = 0; i < originals.length; i++) {
        quotes.push(this.buildQuoteViewModel(originals[i]));

        if (originals[i].original_messages && originals[i].original_messages.length) {
            this.collectQuoteViewModels(originals[i].original_messages, quotes);
        }
    }

    return quotes;
};

Helpers.prototype.buildMessageViewModel = function (message) {
    var self = this,
        body = self.getMessageBody(message),
        quote = [],
        attachments = self.normalizeAttachments(message.attachments),
        displayText = self.sanitizeUiKitServiceBody(body),
        banner = '';

    if (!attachments.length) {
        attachments = self.attachmentsFromMediaBody(body);
    }

    if (!attachments.length && self.isUiKitMediaBody(body)) {
        attachments = [{
            id: '',
            uid: '',
            name: self.escapeHTML('File'),
            type: '',
            src: '',
            isImage: false
        }];
    }

    if (self.isUiKitForwardOrReply(message)) {
        var isReply = message.qb_message_action === 'reply' ||
            body.indexOf(CONSTANTS.UI_KIT.REPLY_PREFIX) !== -1,
            quoteName,
            originName;

        self.collectQuoteViewModels(message.original_messages, quote);
        quoteName = quote[0] && quote[0].sender_name;
        originName = message.origin_sender_name ? self.escapeHTML(message.origin_sender_name) : '';

        if (isReply) {
            banner = quoteName ? 'Replied to ' + quoteName :
                (originName ? 'Replied to ' + originName : 'Replied message');
        } else {
            banner = originName ? 'Forwarded from ' + originName :
                (quoteName ? 'Forwarded from ' + quoteName : 'Forwarded message');
        }
    } else if (message.origin_sender_name) {
        banner = 'Forwarded from ' + self.escapeHTML(message.origin_sender_name);
    }

    return {
        status: message.status,
        id: message._id,
        sender_id: message.sender_id,
        date_sent: message.date_sent,
        banner: banner,
        quote: quote,
        message: displayText ? self.fillMessageBody(displayText) : '',
        attachments: attachments
    };
};

Helpers.prototype.getDialogLastMessagePreview = function (text) {
    if (text == null || text === '') {
        return '';
    }

    text = String(text);

    if (text.indexOf(CONSTANTS.UI_KIT.FORWARD_PREFIX) !== -1) {
        return 'Forwarded message';
    }

    if (text.indexOf(CONSTANTS.UI_KIT.REPLY_PREFIX) !== -1) {
        return 'Replied message';
    }

    if (this.isUiKitMediaBody(text) || text === CONSTANTS.ATTACHMENT.BODY) {
        return 'Attachment';
    }

    return text;
};

Helpers.prototype.fillNewMessageParams = function (userId, msg) {
    var self = this,
        message = {
            _id: msg.id,
            attachments: [],
            created_at: +msg.extension.date_sent * 1000 || Date.now(),
            date_sent: self.getTime(+msg.extension.date_sent * 1000 || Date.now()),
            delivered_ids: [userId],
            message: msg.body,
            read_ids: [userId],
            sender_id: userId,
            chat_dialog_id: msg.extension.dialog_id,
            selfReaded: userId === app.user.id,
            read: 0,
            origin_sender_name: msg.extension.origin_sender_name || false
        };

    if (msg.extension.attachments) {
        var attachments = msg.extension.attachments;

        for (var i = 0; i < attachments.length; i++) {
            attachments[i].src = self.getAttachmentSrc(attachments[i]);
        }

        message.attachments = attachments;
    }

    self.copyUiKitFields(message, msg.extension || {});

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

Helpers.prototype.tryParseJSON = function (value, fallback) {
    if (value == null) return (fallback !== undefined ? fallback : {});
    if (typeof value === 'object') return value;
    if (typeof value === 'string') {
        try { return JSON.parse(value); } catch (_) { return (fallback !== undefined ? fallback : {}); }
    }
    return (fallback !== undefined ? fallback : {});
};

Helpers.prototype.extractLeavedDialogs = function (rawCustomData) {
    var user_custom_data = this.tryParseJSON(rawCustomData, {});
    var rawLeaved = user_custom_data && (user_custom_data.leaved_dialogs || user_custom_data["leaved_dialogs"]);
    return this.tryParseJSON(rawLeaved, {}); // если строка-JSON — распарсит, если объект — вернёт как есть
};


var helpers = new Helpers();
