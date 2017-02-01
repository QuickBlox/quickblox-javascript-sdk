'use strict';

function Message() {
    this.container = null;
    this.attachment_previews = null;
    this.dialog = null;
    this.limit = appConfig.messagesPerRequest || 50;
    this.attachmentIds = [];
    this.dialogTitle = null;
}

Message.prototype.init = function(){
    var self = this;

    self.container = document.querySelector('.j-messages');
    self.attachment_previews = document.querySelector('.j-attachments_preview');
    self.dialogTitle = document.querySelector('.j-content__title');
    document.forms.send_message.addEventListener('submit', self.sendMessage.bind(self));
    document.forms.send_message.attach_file.addEventListener('change', self.prepareToUpload.bind(self));
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

Message.prototype.getMessages = function(dialigId) {
    var self = this,
        params = {
            chat_dialog_id: dialigId,
            sort_desc: 'date_sent',
            limit: self.limit,
            skip: dialogModule._cache[dialigId].messages.length
        };

    QB.chat.message.list(params, function(err, messages) {
        if (!err) {
            var dialog = dialogModule._cache[dialigId];

            dialog.messages = dialog.messages.concat(messages.items);

            if(messages.items.length < self.limit){
                dialog.full = true;
            }

            if (dialogModule.dialogId !== dialigId) return false;

            if(dialogModule._cache[dialigId].type === 1){
                self.checkUsersInPublickDialogMessages(messages.items, params.skip);
            } else {
                for (var i = 0; i < messages.items.length; i++) {
                    var message = helpers.fillMessagePrams(messages.items[i]);
                    self.renderMessage(message, false);
                }

                self.initLoadMoreMessages();

                if (!params.skip) {
                    helpers.scrollTo(self.container, 'bottom');
                }
            }
        } else {
            console.error(err);
        }
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

        self.initLoadMoreMessages();

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

Message.prototype.initLoadMoreMessages = function(){
    var self = this,
        loadBtn = self.container.querySelector('.j-load_more__btn'),
        dialogId = dialogModule.dialogId;

    if(!dialogModule._cache[dialogId].full){
        if (!loadBtn) {
            var tpl = helpers.fillTemplate('tpl_loadMore'),
                btnWrap = helpers.toHtml(tpl)[0],
                btn = btnWrap.firstElementChild;

            btn.addEventListener('click', function(){
                btn.innerText = 'Loading...';
                self.getMessages(dialogId);
            });

            self.container.insertBefore(btnWrap, self.container.firstElementChild);
        } else {
            loadBtn.innerText = 'Load more';
            self.container.insertBefore(loadBtn.parentElement, self.container.firstElementChild);
        }
    } else {
        if (loadBtn) {
            self.container.removeChild(loadBtn.parentElement);
        }
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

Message.prototype.addImagePreview = function(file, count){
    var img = document.createElement('img');

    img.classList.add('attachment_preview__item', 'm-blink');
    img.src = URL.createObjectURL(file);

    return img;
};

var messageModule = new Message();
