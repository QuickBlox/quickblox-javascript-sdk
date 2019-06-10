'use strict';

function Message() {
    this.container = null;
    this.attachmentPreviewContainer = null;
    this.typingTimeout = appConfig.typingTimeout || 3;
    this.limit = appConfig.messagesPerRequest || 50;

    this.dialogTitle = null;
    this._typingTimer = null;
    this._typingTime = null;
    this.typingUsers = {};
}

Message.prototype.init = function () {
    var self = this;
    self.container = document.querySelector('.j-messages');
    self.attachmentPreviewContainer = document.querySelector('.j-attachments_preview');
    self.dialogTitle = document.querySelector('.j-content__title');

    document.forms.send_message.addEventListener('submit', function (e) {
        e.preventDefault();
        self.submitSendMessage(dialogModule.dialogId);
        document.forms.send_message.message_feald.focus();
    });

    document.forms.send_message.attach_file.addEventListener('change', self.prepareToUpload.bind(self));
    document.forms.send_message.message_feald.addEventListener('input', self.typingMessage.bind(self));
    document.forms.send_message.message_feald.addEventListener('input', self.checkMessageSymbolsCount.bind(self));
    document.forms.send_message.message_feald.addEventListener('keydown', function (e) {
        var key = e.keyCode;

        if (key === 13) {
            if (!e.ctrlKey && !e.shiftKey && !e.metaKey) {
                e.preventDefault();
                self.submitSendMessage(dialogModule.dialogId);
            }
        }
    });
};

Message.prototype.typingMessage = function (e) {
    var self = this,
        dialogId = dialogModule.dialogId;

    self._typingTime = Date.now();

    if (!self._typingTimer) {
        self.sendIsTypingStatus(dialogId);

        self._typingTimer = setInterval(function () {
            if ((Date.now() - self._typingTime) / 1000 >= self.typingTimeout) {
                self.sendStopTypingStatus(dialogId);
            }
        }, 500);
    }

    dialogModule._cache[dialogId].draft.message = e.currentTarget.value
};

Message.prototype.checkMessageSymbolsCount = function() {
    var messageText = document.forms.send_message.message_feald.value,
        sylmbolsCount = messageText.length;
    if(sylmbolsCount > 1000) {
        document.forms.send_message.message_feald.value = messageText.slice(0, 1000);
    }
};

Message.prototype.sendIsTypingStatus = function (dialogId) {
    var self = this,
        dialog = dialogModule._cache[dialogId];

    QB.chat.sendIsTypingStatus(dialog.jidOrUserId);
};

Message.prototype.sendStopTypingStatus = function (dialogId) {
    var self = this,
        dialog = dialogModule._cache[dialogId];

    QB.chat.sendIsStopTypingStatus(dialog.jidOrUserId);

    clearInterval(self._typingTimer);
    self._typingTimer = null;
    self._typingTime = null;
};

Message.prototype.submitSendMessage = function (dialogId) {
    if (!app.checkInternetConnection()) {
        return false;
    }

    var self = this,
        dialog = dialogModule._cache[dialogId],
        attachments = dialog.draft.attachments,
        sendMessageForm = document.forms.send_message,
        msg = {
            type: dialog.type === 3 ? 'chat' : 'groupchat',
            body: sendMessageForm.message_feald ? sendMessageForm.message_feald.value.trim() : '',
            extension: {
                save_to_history: 1,
                dialog_id: dialogId
            },
            markable: 1
        };

    if (Object.keys(attachments).length) {
        msg.extension.attachments = [];

        for (var attach in attachments) {
            msg.extension.attachments.push({id: attach, type: CONSTANTS.ATTACHMENT.TYPE});
        }

        msg.body = CONSTANTS.ATTACHMENT.BODY;
        dialog.draft.attachments = {};
    } else if (dialogModule.dialogId === dialogId && sendMessageForm) {
        var dialogElem = document.getElementById(dialogId);

        dialogModule.replaceDialogLink(dialogElem);
        document.forms.send_message.message_feald.value = '';
        dialog.draft.message = null;
    }

    // Don't send empty message
    if (!msg.body) return false;

    self.sendMessage(dialogId, msg);
};

Message.prototype.setLoadMoreMessagesListener = function () {
    var self = this;

    self.container.classList.remove('full');

    if (!self.container.dataset.load) {
        self.container.dataset.load = 'true';
        self.container.addEventListener('scroll', function loadMoreMessages(e) {
            var elem = e.currentTarget,
                dialog = dialogModule._cache[dialogModule.dialogId];

            if (!dialog.full) {
                if (elem.scrollTop < 150 && !elem.classList.contains('loading')) {
                    self.getMessages(dialogModule.dialogId);
                }
            } else {
                elem.removeEventListener('scroll', loadMoreMessages);
                delete self.container.dataset.load;
            }
        });
    }
};

Message.prototype.sendMessage = function(dialogId, msg){
    var self = this,
        message = JSON.parse(JSON.stringify(msg)),
        dialog = dialogModule._cache[dialogId],
        jidOrUserId = dialog.jidOrUserId;

    message.id = QB.chat.send(jidOrUserId, msg);
    message.extension.dialog_id = dialogId;

    var newMessage = helpers.fillNewMessageParams(app.user.id, message);

    dialogModule._cache[dialogId].messages.unshift(newMessage);

    if (dialogModule.dialogId === dialogId) {
        self.renderMessage(newMessage, true);
    }

    dialogModule.changeLastMessagePreview(dialogId, newMessage);
};

Message.prototype.getMessages = function (dialogId) {
    if(!navigator.onLine) return false;

    var self = this,
        params = {
            chat_dialog_id: dialogId,
            sort_desc: 'date_sent',
            limit: self.limit,
            skip: dialogModule._cache[dialogId].messages.length,
            mark_as_read: 0
        };

    self.container.classList.add('loading');

    QB.chat.message.list(params, function (err, messages) {
        if (messages) {
            var dialog = dialogModule._cache[dialogId];
            dialog.messages = dialog.messages.concat(messages.items);
            
            if (messages.items.length < self.limit) {
                dialog.full = true;
            }
            if (dialogModule.dialogId !== dialogId) return false;

            if (dialogModule._cache[dialogId].type === 1) {
                self.checkUsersInPublicDialogMessages(messages.items, params.skip);
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

Message.prototype.checkUsersInPublicDialogMessages = function (items, skip) {
    var self = this,
        messages = [].concat(items),
        userList = [];

    for (var i = 0; i < messages.length; i++) {
        var id = messages[i].sender_id;

        if (userList.indexOf(id) === -1) {
            userList.push(id);
        }
    }

    if (!userList.length) return false;
    userModule.getUsersByIds(userList).then(function(){
        for (var i = 0; i < messages.length; i++) {
            var message = helpers.fillMessagePrams(messages[i]);
            self.renderMessage(message, false);
        }

        if (!skip) {
            helpers.scrollTo(self.container, 'bottom');
        }
    }).catch(function(error){
        console.error(error);
    });
};

Message.prototype.sendDeliveredStatus = function(messageId, userId, dialogId){
    var params = {
        messageId: messageId,
        userId: userId,
        dialogId: dialogId
    };

    QB.chat.sendDeliveredStatus(params);

};

Message.prototype.sendReadStatus = function(messageId, userId, dialogId){
    var params = {
        messageId: messageId,
        userId: userId,
        dialogId: dialogId
    };

    if (document.visibilityState === 'visible') {
        QB.chat.sendReadStatus(params);
    }

};

Message.prototype.renderMessage = function (message, setAsFirst) {
    var self = this,
        sender = userModule._cache[message.sender_id],
        dialogId = message.chat_dialog_id,
        messagesHtml,
        messageText;

    if(!message.selfReaded){
        self.sendReadStatus(message._id, message.sender_id, dialogId);
        message.selfReaded = true;
        dialogModule.decreaseUnreadCounter(dialogId);
    }

    if(message.notification_type || (message.extension && message.extension.notification_type)) {
        messageText = message.message ? helpers.escapeHTML(message.message) : helpers.escapeHTML(message.body);

        messagesHtml = helpers.fillTemplate('tpl_notificationMessage', {
            id: message._id,
            text: messageText,
            date_sent: message.date_sent
        });
    } else {
        messageText = message.message ? helpers.fillMessageBody(message.message || '') : helpers.fillMessageBody(message.body || '');

        messagesHtml = helpers.fillTemplate('tpl_message', {
            message: {
                status: message.status,
                id: message._id,
                sender_id: message.sender_id,
                message: messageText,
                attachments: message.attachments,
                date_sent: message.date_sent
            },
            sender: sender});
    }

    var elem = helpers.toHtml(messagesHtml)[0];

    if (!sender) {
        userModule.getUsersByIds([message.sender_id], function (err) {
            if (!err) {
                sender = userModule._cache[message.sender_id];

                var userIcon = elem.querySelector('.message__avatar'),
                    userName = elem.querySelector('.message__sender_name');

                userIcon.classList.remove('m-user__img_not_loaded');
                userIcon.classList.add('m-user__img_' + sender.color);
                userName.innerText = sender.name;
            }
        });
    }

    if (message.attachments.length) {
        var images = elem.querySelectorAll('.message_attachment');

        for (var i = 0; i < images.length; i++) {
            images[i].addEventListener('load', function (e) {
                var img = e.target,
                    imgPos = self.container.offsetHeight + self.container.scrollTop - img.offsetTop,
                    scrollHeight = self.container.scrollTop + img.offsetHeight;

                img.classList.add('loaded');

                if (imgPos >= 0) {
                    self.container.scrollTop = scrollHeight + 5;
                }
            });
            images[i].addEventListener('error', function (e) {
                var img = e.target,
                    errorMessageTpl = helpers.fillTemplate('tpl_attachmentLoadError'),
                    errorElem = helpers.toHtml(errorMessageTpl)[0];

                img.parentElement.replaceChild(errorElem, img);
            });
        }
    }

    if (setAsFirst) {
        var scrollPosition = self.container.scrollHeight - (self.container.offsetHeight + self.container.scrollTop),
            typingElem = document.querySelector('.j-istyping');

        if (typingElem) {
            self.container.insertBefore(elem, typingElem);
        } else {
            self.container.appendChild(elem);
        }

        if (scrollPosition < 50) {
            helpers.scrollTo(self.container, 'bottom');
        }
    } else {
        var containerHeightBeforeAppend = self.container.scrollHeight - self.container.scrollTop;

        self.container.insertBefore(elem, self.container.firstElementChild);

        var containerHeightAfterAppend = self.container.scrollHeight - self.container.scrollTop;

        if (containerHeightBeforeAppend !== containerHeightAfterAppend) {
            self.container.scrollTop += containerHeightAfterAppend - containerHeightBeforeAppend;
        }
    }

    var currentDialog = dialogModule._cache[dialogId],
        date = new Date(message.created_at),
        month = date.toLocaleString('en-us', { month: 'long' }),
        template = helpers.fillTemplate('tpl_date_message', {'month':month, 'date':date}),
        elemDate = helpers.toHtml(template)[0],
        tmpElem = document.querySelector('#'+month+'-'+date.getDate());

    currentDialog.tplDateMessage = currentDialog.tplDateMessage?currentDialog.tplDateMessage:{};

    if(!currentDialog.tplDateMessage[month+'/'+ date.getDate()] ||
        parseInt(currentDialog.tplDateMessage[month+'/'+ date.getDate()].replace(/:/, '')) >
        parseInt(message.date_sent.replace(/:/, ''))
    ){
        if(tmpElem){
            tmpElem.remove();
        }
        currentDialog.tplDateMessage[month+'/'+ date.getDate()] = message.date_sent;
        self.container.insertBefore(elemDate,elem);
    }

};

Message.prototype.prepareToUpload = function (e) {
    if (!app.checkInternetConnection()) {
        return false;
    }

    var self = this,
        files = e.currentTarget.files,
        dialogId = dialogModule.dialogId;

    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        self.uploadFilesAndGetIds(file, dialogId);
    }

    e.currentTarget.value = null;
};

Message.prototype.uploadFilesAndGetIds = function (file, dialogId) {
    if (file.size >= CONSTANTS.ATTACHMENT.MAXSIZE) {
        return alert(CONSTANTS.ATTACHMENT.MAXSIZEMESSAGE);
    }

    var self = this,
        preview = self.addImagePreview(file);

    QB.content.createAndUpload({
        public: false,
        file: file,
        name: file.name,
        type: file.type,
        size: file.size
    }, function (err, response) {
        if (err) {
            preview.remove();
            console.error(err);
            alert('ERROR: ' + err.detail);
        } else {
            preview.remove();

            dialogModule._cache[dialogId].draft.attachments[response.uid] = helpers.getSrcFromAttachmentId(response.uid);

            self.submitSendMessage(dialogId);
        }
    });
};

Message.prototype.addImagePreview = function (file) {
    var self = this,
        data = {
            id: 'isLoading',
            src: URL.createObjectURL(file)
        },
        template = helpers.fillTemplate('tpl_attachmentPreview', data),
        wrapper = helpers.toHtml(template)[0];

    self.attachmentPreviewContainer.appendChild(wrapper);

    return wrapper;
};

Message.prototype.setTypingStatuses = function (isTyping, userId, dialogId) {
    var self = this;

    if (!self.typingUsers[dialogId]) {
        self.typingUsers[dialogId] = [];
    }

    if (isTyping) {
        self.typingUsers[dialogId].push(userId);
    } else {
        var list = self.typingUsers[dialogId];

        self.typingUsers[dialogId] = list.filter(function (id) {
            return id !== userId;
        });
    }
    
    self.renderTypingUsers(dialogId)
};

Message.prototype.renderTypingUsers = function (dialogId) {
    var self = this,
        userList = self.typingUsers[dialogId],
        typingElem = document.querySelector('.j-istyping'),
        users = userList.map(function (user) {
            if (userModule._cache[user]) {
                return userModule._cache[user]
            } else {
                userModule.getUsersByIds([user], function (err) {
                    if (err) return false;

                    var className = 'm-typing_' + user,
                        userElem = document.querySelector('.' + className);

                    if (!userElem || !userModule._cache[user]) return false;

                    userElem.classList.remove(className, 'm-typing_uncnown');
                    userElem.classList.add('m-user__img_' + userModule._cache[user].color);
                });
                return user;
            }
        });

    if (typingElem) {
        self.container.removeChild(typingElem);
    }

    if (users.length) {
        var tpl = helpers.fillTemplate('tpl_message__typing', {users: users}),
            elem = helpers.toHtml(tpl)[0],
            scrollPosition = self.container.scrollHeight - (self.container.offsetHeight + self.container.scrollTop);

        self.container.appendChild(elem);

        if (scrollPosition < 50) {
            helpers.scrollTo(self.container, 'bottom');
        }
    }
};

Message.prototype.setMessageStatus = function(data) {
    var dialogId = data.dialogId,
        status = data.status,
        messageId = data._id,
        dialog = dialogModule._cache[dialogId];

    // Dialog with this ID was not founded in the cache
    if(dialog === undefined) return;

    var message = dialog.messages.find(function(message){
        if(message._id === messageId) return true;
    });

    // if the message was not fined in cache or it was notification message, DO NOTHING
    if(message === undefined || message.notification_type !== undefined) return;

    // if the same status is coming DO NOTHING
    if (message.status === status) return;

    message.status = status;

    if(dialogId === dialogModule.dialogId){
        var messageElem = document.getElementById(messageId);

        if(messageElem !== undefined){
            var statusElem = messageElem.querySelector('.j-message__status');

            statusElem.innerText = status;
        }
    }
};

var messageModule = new Message();
