'use strict';

function Message() {
    this.container = null;
    this.attachmentPreviewContainer = null;

    this.dialog = null;
    this.limit = appConfig.messagesPerRequest || 50;
    this.dialogTitle = null;
    this._typingTimer = null;
    this._typingTime = null;
    this.typingUsers = {};
}

Message.prototype.init = function(){
    var self = this;

    self.container = document.querySelector('.j-messages');
    self.attachmentPreviewContainer = document.querySelector('.j-attachments_preview');
    self.dialogTitle = document.querySelector('.j-content__title');

    document.forms.send_message.addEventListener('submit', self.sendMessage.bind(self));
    document.forms.send_message.attach_file.addEventListener('change', self.prepareToUpload.bind(self));
    document.forms.send_message.message_feald.addEventListener('input', self.typingMessage.bind(self));
};

Message.prototype.typingMessage = function(e){
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

    dialogModule._cache[dialogId].draft.message = e.currentTarget.value
};

Message.prototype.sendIsTypingStatus = function(dialogId){
    var self = this,
        dialog = dialogModule._cache[dialogId];

    QB.chat.sendIsTypingStatus(dialog.jidOrUserId);
};

Message.prototype.sendStopTypingStatus = function(dialogId){
    var self = this,
        dialog = dialogModule._cache[dialogId];

    QB.chat.sendIsStopTypingStatus(dialog.jidOrUserId);

    clearInterval(self._typingTimer);
    self._typingTimer = null;
    self._typingTime = null;
};

Message.prototype.sendMessage = function(e) {
    e.preventDefault();
    var self = this,
        dialogId = dialogModule.dialogId,
        dialog = dialogModule._cache[dialogId],
        attachments = dialog.draft.attachments,
        msg = {
            type: dialog.type === 3 ? 'chat' : 'groupchat',
            body: document.forms.send_message.message_feald.value.trim(),
            extension: {
                save_to_history: 1
            },
            markable: 1
        };

    if(Object.keys(attachments).length){
        msg.extension.attachments = [];

        for (var attach in attachments) {
            msg.extension.attachments.push({id: attach, type: 'photo'});
        }

        if(!msg.body) msg.body = '[attachment]';
    }

    // Don't send empty message
    if(!msg.body) return false;

    document.forms.send_message.message_feald.value = '';
    dialog.draft.message = null;

    var messageId = QB.chat.send(dialog.jidOrUserId, msg);
    dialog.draft.attachments = {};
    helpers.clearView(self.attachmentPreviewContainer);

    msg.id = messageId;
    msg.extension.dialog_id = dialogId;

    var message = helpers.fillNewMessagePrams(app.user.id, msg);

    if(dialog.type === 3) {
        dialogModule._cache[dialogId].messages.unshift(message);
        self.renderMessage(message, true);
    }

    dialogModule.changeLastMessagePreview(dialogId, message);
    document.forms.send_message.attach_file.value = null
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
            console.error(err);
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
        var scrollPosition = self.container.scrollHeight - (self.container.offsetHeight + self.container.scrollTop),
            typingElem = document.querySelector('.j-istyping');

        if(typingElem) {
            self.container.insertBefore(elem, typingElem);
        } else {
            self.container.appendChild(elem);
        }

        if(scrollPosition < 50){
            helpers.scrollTo(self.container, 'bottom');
        }
    } else {
        self.container.insertBefore(elem, self.container.firstElementChild);
    }
};

Message.prototype.prepareToUpload = function (e){
    var self = this,
        files = e.currentTarget.files,
        dialogId = dialogModule.dialogId;

    for(var i = 0; i < files.length; i++){
        var file = files[i];
        self.UploadFilesAndGetIds(file, dialogId);
    };
};

Message.prototype.UploadFilesAndGetIds = function(file, dialogId){
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
            preview.classList.remove('m-loading');
            preview.classList.add('m-error');
        } else {
            console.info('attachment response');
            console.log(response);
            preview.id = response.uid;
            preview.classList.remove('m-loading');

            dialogModule._cache[dialogId].draft.attachments[response.uid] = helpers.getSrcFromAttachmentId(response.uid);
        }
    });
};

Message.prototype.addImagePreview = function(file, imgData){
    var self = this,
        data;

    if(file){
        data = {
            id: 'isLoading',
            src: URL.createObjectURL(file)
        }
    } else {
        data = imgData;
    }

    var template = helpers.fillTemplate('tpl_attachmentPreview', data),
        wrapper = helpers.toHtml(template)[0],
        imgage = wrapper.firstElementChild;

    self.attachmentPreviewContainer.append(wrapper);

    if(!file) {
        imgage.addEventListener('load', function(e){
            var img = e.target,
                wrapper = img.parentElement;

            wrapper.classList.remove('m-loading');
        });

        imgage.addEventListener('error', function(e){
            var img = e.target,
                wrapper = img.parentElement;

            wrapper.classList.remove('m-loading');
            wrapper.classList.add('m-error');
        });
    } else {
        return wrapper
    }
};

Message.prototype.setTypingStatuses = function(isTyping, userId, dialogId){
    var self = this;

    if(!self.typingUsers[dialogId]){
        self.typingUsers[dialogId] = [];
    }


    if(isTyping) {
        self.typingUsers[dialogId].push(userId);

    } else {
        var list = self.typingUsers[dialogId];

        self.typingUsers[dialogId] = list.filter(function(id){
            return id !== userId;
        });
    }
    
    self.renderTypingUsers(dialogId)
};

Message.prototype.renderTypingUsers = function(dialogId){
    var self = this,
        userList = self.typingUsers[dialogId],
        typingElem = document.querySelector('.j-istyping'),
        users = userList.map(function(user){
            if(userModule._cache[user]){
                return userModule._cache[user]
            }
        });

    if(typingElem){
        self.container.removeChild(typingElem);
    }

    if(users.length){
        var tpl = helpers.fillTemplate('tpl_message__typing', {users: users}),
            elem = helpers.toHtml(tpl)[0];

        var scrollPosition = self.container.scrollHeight - (self.container.offsetHeight + self.container.scrollTop);

        self.container.append(elem);

        if(scrollPosition < 50){
            helpers.scrollTo(self.container, 'bottom');
        }
    }
};

var messageModule = new Message();
