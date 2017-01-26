'use strict';

function Dialog() {
    this.dialogsListContainer = null;

    this.user = null;

    this.message = new Message();
    this.message.dialog = this;
    
    this.dialogId = null;
    this.prevDialogId = null;
    this.content = null;
}

Dialog.prototype.loadDialogs = function(type) {
    var self = this,
        filter = {};

    this.content = document.querySelector('.j-content');

    if(type === 'chat'){
        filter['type[in]'] = '2,3';
    } else {
        filter.type = 1;
    }

    helpers.clearView(self.dialogsListContainer);

    QB.chat.dialog.list(filter, function(err, resDialogs){
        if(err){
            console.error(err);
            return;
        }

        var dialogs = resDialogs.items;
        // add info about users to cache.
        var pearToPearDialogs = dialogs.filter(function(dialog){
            if(dialog.type === 3) {
                return true
            }
        }).map(function(dialog){
            return {
                name: dialog.name,
                id: dialog.occupants_ids.filter(function(id){
                    if(id !== self.user.id) return id;
                })[0],
                color: _.random(1, 10)
            }
        });

        cache.setUser(pearToPearDialogs);

        _.each(dialogs, function(dialog){
            self.buildDialog(dialog);
        });

        if(self.dialogId){
            var dialog = document.getElementById(self.dialogId);
            if(dialog) dialog.classList.add('selected');
        }
    });
};

Dialog.prototype.buildDialog = function(dialog, setAsFirst) {
    var self = this,
        compiledDialogParams = helpers.compileDialogParams(dialog);

    cache.setDialog(dialog._id, compiledDialogParams);

    var template = helpers.fillTemplate('tpl_userConversations', {dialog: compiledDialogParams}),
        elem = helpers.toHtml(template)[0];

    elem.addEventListener('click', function(e){
        if(elem.classList.contains('selected') && document.forms.send_message) return false;

        var selectedDialog = document.querySelector('.dialog__item.selected');

        if(selectedDialog){
            selectedDialog.classList.remove('selected');
        }

        elem.classList.add('selected');
        self.prevDialogId = self.dialogId;
        self.dialogId = e.currentTarget.id;
        self.renderDialog(e.currentTarget.id);
    });

    if(!setAsFirst) {
        self.dialogsListContainer.appendChild(elem);
    } else {
        self.dialogsListContainer.insertBefore(elem, self.dialogsListContainer.firstElementChild);
    }
};

Dialog.prototype.renderDialog = function(id){
    var self = this,
        dialog = cache.getDialog(id);

    if(!cache.checkCachedUsersInDialog(id)) return false;

    document.querySelector('.j-sidebar__create_dilalog').classList.remove('active');

    if(!document.forms.send_message){
        helpers.clearView(this.content);
        this.content.innerHTML = helpers.fillTemplate('tpl_conversationContainer', {title: dialog.name});
        self.message.init();
    } else {
        var draft = document.forms.send_message.message_feald.value;

        if(self.prevDialogId) cache.setDialog(self.prevDialogId, null, null, draft);

        helpers.clearView(self.messagesContainer);
    }

    document.forms.send_message.message_feald.value = dialog.draft;

    if(dialog && dialog.messages.length){
        for(var i = 0; i < dialog.messages.length; i++){
            self.renderMessage(dialog.messages[i], false);
        }
        self.scrollTo('messages', 'bottom');
    }

    self.message.getMessages({
        chat_dialog_id: self.dialogId,
        sort_desc: 'date_sent',
        limit: self.messagesLimit,
        skip: dialog.messages.length
    });
};

Dialog.prototype.changeLastMessagePreview = function(dialogId, msg){
    var dialog = document.getElementById(dialogId);

    dialog.querySelector('.j-dialog__last_message ').innerText = msg.message;
};
