'use strict';

function Message() {
    this.container = null;
    this.dialog = null;
    this.limit = appConfig.messagesPerRequers || 50;
}

Message.prototype.init = function(){
    var self = this;
    self.container = document.querySelector('.j-messages');
    document.forms.send_message.addEventListener('submit', self.sendMessage.bind(self));
};

Message.prototype.sendMessage = function(e) {
    e.preventDefault();

    var self = this,
        dialogId = self.dialog.dialogId,
        dialog = cache.getDialog(dialogId),

        msg = {
            type: dialog.type === 3 ? 'chat' : 'groupchat',
            body: document.forms.send_message.message_feald.value,
            extension: {
                save_to_history: 1,
            }
        },

        messageId = QB.chat.send(dialog.jidOrUserId, msg);

    document.forms.send_message.message_feald.value = '';

    msg.id = messageId;
    msg.extension.dialog_id = dialogId;

    var message = helpers.fillNewMessagePrams(app.user.id, msg),
        scrollPosition = self.container.scrollHeight - (self.container.offsetHeight + self.container.scrollTop);

    cache.setDialog(dialogId, null, message);

    if(dialog.type === 3) {
        self.renderMessage(message, true);
    }

    if(scrollPosition < 10) {
        helpers.scrollTo(self.container, 'bottom');
    }
};

Message.prototype.getMessages = function(params) {
    var self = this;

    QB.chat.message.list(params, function(err, messages) {
        if (!err) {
            cache.setDialog(params.chat_dialog_id, null, messages.items, null);

            if (self.dialog.dialogId !== params.chat_dialog_id) return false;

            for (var i = 0; i < messages.items.length; i++) {
                var message = helpers.fillMessagePrams(messages.items[i]);
                self.renderMessage(message, false);
            }

            self.initLoadMoreMessages();

            if (!params.skip) {
                helpers.scrollTo(self.container, 'bottom');
            }
        } else {
            console.error(err);
        }
    });
};

Message.prototype.renderMessage = function(message, setAsFirst){
    var self = this,
        sender = cache.getUser(message.sender_id),
        messagesHtml = helpers.fillTemplate('tpl_message', {message: message, sender: sender}),
        elem = helpers.toHtml(messagesHtml)[0];

    if(message.attachments.length){
        var images = elem.querySelectorAll('.message_attachment');
        for(var i = 0; i < images.length; i++){
            images[i].addEventListener('load', function(e){
                var img = e.target,
                    imgPos = self.container.offsetHeight + self.container.scrollTop - img.offsetTop,
                    scrollHeight = self.container.scrollTop + img.offsetHeight;

                img.classList.add('loaded');

                if(imgPos > 0) self.container.scrollTop = scrollHeight;
            });
        }
    }
    if(setAsFirst) {
        self.container.appendChild(elem);
    } else {
        self.container.insertBefore(elem, self.container.firstElementChild);
    }
};

Message.prototype.initLoadMoreMessages = function(){
    var self = this,
        loadBtn = self.container.querySelector('.j-load_more__btn'),
        dialogId = self.dialog.dialogId;
    if(!cache.getDialog(dialogId).full){
        if (!loadBtn) {
            var tpl = helpers.fillTemplate('tpl_loadMore'),
                btnWrap = helpers.toHtml(tpl)[0],
                btn = btnWrap.firstElementChild;

            btn.addEventListener('click', function(){
                btn.innerText = 'Loading...';

                self.getMessages({
                    chat_dialog_id: dialogId,
                    sort_desc: 'date_sent',
                    limit: self.limit,
                    skip: cache.getDialog(dialogId).messages.length
                });
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

