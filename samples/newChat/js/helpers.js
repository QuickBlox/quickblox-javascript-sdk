'use strict';

function Helpers(){}

Helpers.prototype.redirectToPage = function(page){
    window.location.hash = '#' + page;
};

Helpers.prototype.fillTemplate = function (name, options){
    var tpl = _.template(document.querySelector('#' + name).innerHTML);
    return tpl(options);
};

Helpers.prototype.clearView = function(view){
    var nodeList = view.childNodes;
    for(var i = nodeList.length; i > 0; i--){
        view.removeChild(nodeList[i-1]);
    }
};

Helpers.prototype.compileDialogParams = function(dialog){
    // last_message_date_sent comes in UNIX time.
    var date = new Date(dialog.last_message_date_sent ? dialog.last_message_date_sent * 1000 : dialog.updated_at),
        lastDate = date.getHours() + ':' + date.getMinutes();

    return {
        _id: dialog._id,
        name: dialog.name,
        type: dialog.type,
        last_message: dialog.last_message === '[attachment]' ? 'Attachment' : dialog.last_message,
        messages: [],
        attachment: dialog.last_message === '[attachment]',
        last_message_date_sent: lastDate,
        users: dialog.occupants_ids || [],
        jidOrUserId: dialog.xmpp_room_jid || dialog.jidOrUserId ||getRecipientUserId(dialog.occupants_ids),
        full: false,
        draft: {
            message: '',
            attachments: {}
        },
        joined: false
    };

    function getRecipientUserId(users){
        if(users.length === 2){
            return users.filter(function(user){
                if(user !== app.user.id){
                    return user;
                }
            })[0];
        }
    }

};

Helpers.prototype.fillMessagePrams = function(message){
    var self = this;

    if(message.attachments){
        var attachments = message.attachments;
        for(var i = 0; i < attachments.length; i++) {
            attachments[i].src = self.getSrcFromAttachmentId(attachments[i].id);
        }
    }

    if(message.message === '[attachment]'){
        message.message = '';
    }

    return message;
};

Helpers.prototype.getSrcFromAttachmentId = function(id) {
    return QB.content.publicUrl(id) + '.json?token=' + app.token;
};

Helpers.prototype.fillNewMessagePrams = function(userId, msg){
    var self = this,
        message = {
            _id: msg.id,
            attachments: [],
            created_at: +msg.extension.date_sent || Date.now(),
            date_sent: +msg.extension.date_sent  || Date.now(),
            delivered_ids: [],
            message: msg.body,
            read_ids: [],
            sender_id: userId,
            chat_dialog_id: msg.extension.dialog_id
        };

    if(msg.extension.attachments){
        var attachments = msg.extension.attachments;

        for(var i = 0; i < attachments.length; i++) {
            attachments[i].src = self.getSrcFromAttachmentId(attachments[i].id);
        }

        message.attachments = attachments;
    }

    if(message.message === '[attachment]'){
        message.message = '';
    }

    return message;
};

Helpers.prototype.toHtml = function(str){
    var tmp = document.createElement('div'),
        elements = [],
        nodes;

    tmp.innerHTML = str;
    nodes = tmp.childNodes;

    for(var i = 0; i < nodes.length; i++){
        if(nodes[i].nodeType === 1) elements.push(nodes[i]);
    }

    return elements;
};

Helpers.prototype.scrollTo = function (elem, position) {
    var self = this,
        elemHeight = elem.offsetHeight,
        elemScrollHeight = elem.scrollHeight;

    if(position === 'bottom'){
        if((elemScrollHeight - elemHeight) > 0) {
            elem.scrollTop = elemScrollHeight;
        }
    } else if (position === 'top'){
        elem.scrollTop = 0;
    } else if(+position) {
        elem.scrollTop = +position
    }
};

Helpers.prototype.clearCache = function(){
    if(messageModule._typingTime){
        messageModule.sendStopTypingStatus(dialogModule.dialogId);
    }
    
    messageModule._cache = {};
    messageModule.typingUsers = {};

    dialogModule._cache = {};
    dialogModule.dialogId = null;
    dialogModule.prevDialogId = null;

    app.user = null;
};

var helpers = new Helpers();
