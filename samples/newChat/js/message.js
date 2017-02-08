'use strict';

function Message() {
    this.container = null;
    this.attachment_previews = null;
    this.dialog = null;
    this.limit = appConfig.messagesPerRequest || 50;
    this.attachmentIds = [];
    this.dialogTitle = null;
    this._typingTimer = null;
    this._typingTime = null;
    this.typingUsers = {};
}

Message.prototype.init = function(){
    var self = this;

    self.container = document.querySelector('.j-messages');
    self.attachment_previews = document.querySelector('.j-attachments_preview');
    self.dialogTitle = document.querySelector('.j-content__title');
    document.forms.send_message.addEventListener('submit', self.sendMessage.bind(self));
    document.forms.send_message.attach_file.addEventListener('change', self.prepareToUpload.bind(self));
    document.forms.send_message.message_feald.addEventListener('input', self.typingStatusesListeners.bind(self));
};

Message.prototype.typingStatusesListeners = function(){
    var self = this,
        dialogId = dialogModule.dialogId;

    self._typingTime = Date.now();

    if(!self._typingTimer){
        self.sendIsTypingStatus(dialogId);

        self._typingTimer = setInterval(function(){
            if((Date.now() - self._typingTime) / 1000 >= 3){
                self.sendStopTypingStatus(dialogId);
            }
        }, 500);
    }

};

Message.prototype.sendIsTypingStatus = function(dialogId){
    var self = this,
        dialog = dialogModule._cache[dialogId];

    QB.chat.sendIsTypingStatus(dialog.jidOrUserId);
    console.log('start typing', dialog.jidOrUserId);
};

Message.prototype.sendStopTypingStatus = function(dialogId){
    var self = this,
        dialog = dialogModule._cache[dialogId];

    QB.chat.sendIsStopTypingStatus(dialog.jidOrUserId);

    clearInterval(self._typingTimer);
    self._typingTimer = null;
    self._typingTime = null;

    console.log('Stop typing', dialog.jidOrUserId);
};

Message.prototype.sendMessage = function(e) {
    e.preventDefault();
    var self = this,
        dialogId = dialogModule.dialogId,
        dialog = dialogModule._cache[dialogId],
        msg = {
            type: dialog.type === 3 ? 'chat' : 'groupchat',
            body: document.forms.send_message.message_feald.value.trim(),
            extension: {
                save_to_history: 1
            },
            markable: 1
        };


    if(self.attachmentIds.length){
        msg.extension.attachments = [];
        for(var i = 0; i < self.attachmentIds.length; i++){
            var attachment = {id: self.attachmentIds[i], type: 'photo'};
            msg.extension.attachments.push({id: self.attachmentIds[i], type: 'photo'});
        }

        if(!msg.body) msg.body = '[attachment]';
    }

    // Don't send empty message
    if(!msg.body) return false;

    var messageId = QB.chat.send(dialog.jidOrUserId, msg);

    document.forms.send_message.message_feald.value = '';

    self.attachmentIds = [];
    helpers.clearView(self.attachment_previews);

    msg.id = messageId;
    msg.extension.dialog_id = dialogId;

    var message = helpers.fillNewMessagePrams(app.user.id, msg);

    dialogModule._cache[dialogId].messages.unshift(message);

    if(dialog.type === 3) {
        self.renderMessage(message, true);
    }
    dialogModule.changeLastMessagePreview(dialogId, message);
};

Message.prototype.setLoadMoreMessagesListener = function(){
    var self = this;

    self.container.classList.remove('full');

    if(!self.container.dataset.load){
        self.container.dataset.load = 'true';
        self.container.addEventListener('scroll', function loadMoreMessages(e){
            var elem = e.currentTarget,
                dialog = dialogModule._cache[dialogModule.dialogId];

            if(!dialog.full){
                if(elem.scrollTop < 150 && !elem.classList.contains('loading')) {
                    self.getMessages(dialogModule.dialogId);
                }
            } else {
                elem.removeEventListener('scroll', loadMoreMessages);
                delete self.container.dataset.load;
            }
        });
    }
};

Message.prototype.getMessages = function(dialogId) {
    var self = this,
        params = {
            chat_dialog_id: dialogId,
            sort_desc: 'date_sent',
            limit: self.limit,
            skip: dialogModule._cache[dialogId].messages.length
        };

    self.container.classList.add('loading');

    QB.chat.message.list(params, function(err, messages) {
        if (!err) {
            var dialog = dialogModule._cache[dialogId];

            dialog.messages = dialog.messages.concat(messages.items);

            if(messages.items.length < self.limit){
                dialog.full = true;
            }

            if (dialogModule.dialogId !== dialogId) return false;

            if(dialogModule._cache[dialogId].type === 1){
                self.checkUsersInPublickDialogMessages(messages.items, params.skip);
            } else {
                for (var i = 0; i < messages.items.length; i++) {
                    var message = helpers.fillMessagePrams(messages.items[i]);
                    self.renderMessage(message, false);
                }

                if (!params.skip) {
                    helpers.scrollTo(self.container, 'bottom');
                }
            }
        } else {
            console.error(err);
        }
        self.container.classList.remove('loading');
    });
};

Message.prototype.checkUsersInPublickDialogMessages = function(items, skip) {
    var self = this,
        messages = [].concat(items),
        userList = [];

    for(var i = 0; i < messages.length; i++){
        var id = messages[i].sender_id;

        if(userList.indexOf(id) ===  -1) {
            userList.push(id);
        }
    }

    userModule.getUsersByIds(userList, function(err){
        if(err){
            console.log(err);
            return false;
        }

        for(var i = 0; i < messages.length; i++){
            var message = helpers.fillMessagePrams(messages[i]);
            self.renderMessage(message, false);
        }

        if (!skip) {
            helpers.scrollTo(self.container, 'bottom');
        }
    });
};

Message.prototype.renderMessage = function(message, setAsFirst){
    var self = this,
        sender = userModule._cache[message.sender_id];
    var messagesHtml = helpers.fillTemplate('tpl_message', {message: message, sender: sender}),
        elem = helpers.toHtml(messagesHtml)[0];

    if(message.attachments.length){
        var images = elem.querySelectorAll('.message_attachment');
        for(var i = 0; i < images.length; i++){
            images[i].addEventListener('load', function(e){
                var img = e.target,
                    imgPos = self.container.offsetHeight + self.container.scrollTop - img.offsetTop,
                    scrollHeight = self.container.scrollTop + img.offsetHeight;

                img.classList.add('loaded');

                if(imgPos >= 0) {
                    self.container.scrollTop = scrollHeight + 5;
                }
            });
            images[i].addEventListener('error', function(e){
                var img = e.target,
                    errorMessageTpl = helpers.fillTemplate('tpl_attachmentLoadError'),
                    errorElem = helpers.toHtml(errorMessageTpl)[0];

                img.parentElement.replaceChild(errorElem, img);
            });
        }
    }
    if(setAsFirst) {
        var scrollPosition = self.container.scrollHeight - (self.container.offsetHeight + self.container.scrollTop);

        self.container.appendChild(elem);

        if(scrollPosition < 50){
            helpers.scrollTo(self.container, 'bottom');
        }
    } else {
        self.container.insertBefore(elem, self.container.firstElementChild);
    }
};

Message.prototype.prepareToUpload = function (e){
    var self = this,
        files = e.currentTarget.files;

    for(var i = 0; i < files.length; i++){
        var file = files[i];
        self.UploadFilesAndGetIds(file);
    };
};

Message.prototype.UploadFilesAndGetIds = function(file){
    var self = this,
        preview = self.addImagePreview(file);

    QB.content.createAndUpload({
        public: false,
        file: file,
        name: file.name,
        type: file.type,
        size: file.size
    }, function(err, response){
        if(err) {
            preview.classList.remove('m-blink');
            preview.classList.add('m-error');
        } else {
            self.attachmentIds.push(response.uid);
            preview.dataset.id = response.uid;
            preview.classList.remove('m-blink');
        }
    });

    self.attachment_previews.appendChild(preview);
};

Message.prototype.addImagePreview = function(file){
    var img = document.createElement('img');

    img.classList.add('attachment_preview__item', 'm-blink');
    img.src = URL.createObjectURL(file);

    return img;
};

Message.prototype.setTypingStatuses = function(isTyping, userId, dialogId){
    var self = this;

    if(!self.typingUsers[dialogId]){
        self.typingUsers[dialogId] = [];
    }


    if(isTyping) {
        self.typingUsers[dialogId].push(userId);
        self.renderTypingUsers(dialogId)
    } else {
        var list = self.typingUsers[dialogId];
        self.typingUsers[dialogId] = list.filter(function(id){
            return id !== userId;
        });
    }
};

Message.prototype.renderTypingUsers = function(dialogId){
    var self = this,
        userList = self.typingUsers[dialogId],
        users = userList.map(function(user){
            if(userModule._cache[user]){
                return userModule._cache[user]
            }
        });


    if(users.length){
        var tpl = helpers.fillTemplate('tpl_message__typing', {users: users}),
            elem = helpers.toHtml(tpl)[0];

        console.log(elem);

        self.container.append(elem);
    }

};

var messageModule = new Message();
