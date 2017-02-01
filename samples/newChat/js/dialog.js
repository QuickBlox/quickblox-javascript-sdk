'use strict';

function Dialog() {
    this._cache = {};
    this.user = null;
    this.dialogId = null;
    this.prevDialogId = null;

    this.content = null;
    this.dialogsListContainer = null;
    this.messagesContainer = null;
    this.attachmentsPreviewContainer = null;
    this.limit = appConfig.dilogsPerRequers || 30;
}

Dialog.prototype.init = function(){
    var self = this;

    self.dialogsListContainer = document.querySelector('.j-sidebar__dilog_list');
    self.content = document.querySelector('.j-content');

    self.dialogsListContainer.addEventListener('scroll', function loadMoreDialogs(e){
        var container = self.dialogsListContainer,
            position = container.scrollHeight - (container.scrollTop + container.offsetHeight);
        
        if(position <= 50 && !container.classList.contains('loading')) {
            console.log('need to load');
            var type = document.querySelector('.j-sidebar__tab_link.active').dataset.type;
            console.log(type);
            self.loadDialogs(type);
        }
    });
};

Dialog.prototype.loadDialogs = function(type) {
    var self = this,
        filter = {
            limit: self.limit,
            skip: self.dialogsListContainer.querySelectorAll('.j-dialog__item').length
        };

    self.dialogsListContainer.classList.add('loading');

    if(type === 'chat'){
        filter['type[in]'] = '2,3';
    } else {
        filter.type = 1;
    }

    QB.chat.dialog.list(filter, function(err, resDialogs){
        if(err){
            console.error(err);
            return;
        }

        var dialogs = resDialogs.items;
        
        var pearToPearDialogs = dialogs.filter(function(dialog){
            if(dialog.type === 3) {
                return true
            }
        }).map(function(dialog){
            return {
                name: dialog.name,
                id: dialog.occupants_ids.filter(function(id){
                    if(id !== app.user.id) return id;
                })[0],
                color: _.random(1, 10)
            }
        });

        _.each(pearToPearDialogs, function(user){
            if(!userModule._cache[user.id]){
                userModule._cache[user.id] = user;
            }

        });

        _.each(dialogs, function(dialog){
            self.buildDialog(dialog);
        });

        if(self.dialogId){
            var dialog = document.getElementById(self.dialogId);
            if(dialog) dialog.classList.add('selected');
        }

        self.dialogsListContainer.classList.remove('loading');
    });
};

Dialog.prototype.buildDialog = function(dialog, setAsFirst) {
    var self = this,
        compiledDialogParams = helpers.compileDialogParams(dialog);
    
    if(!self._cache[dialog._id]){
        self._cache[dialog._id] = compiledDialogParams;
    }

    if(dialog.type === 2 && !dialog.joined) {
        self.joinToDialog(dialog._id);
    }

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

Dialog.prototype.joinToDialog = function(id){

    var self = this,
        jidOrUserId = self._cache[id].jidOrUserId;

    QB.chat.muc.join(jidOrUserId, function(resultStanza) {
        var joined = true;
        for (var i = 0; i < resultStanza.childNodes.length; i++) {
            var elItem = resultStanza.childNodes.item(i);
            if (elItem.tagName === 'error'){
                joined = false;
            }
        }
        self._cache[id].joined = joined;
    });
};

Dialog.prototype.renderDialog = function(id){
    var self = this,
        dialog = self._cache[id];

    if(!self.checkCachedUsersInDialog(id)) return false;

    document.querySelector('.j-sidebar__create_dilalog').classList.remove('active');

    if(!document.forms.send_message){
        helpers.clearView(this.content);
        self.content.innerHTML = helpers.fillTemplate('tpl_conversationContainer', {title: dialog.name});
        self.messagesContainer = document.querySelector('.j-messages');
        self.attachmentsPreviewContainer = self.content.querySelector('.j-attachments_preview');

        messageModule.init();
    } else {
        var draft = document.forms.send_message.message_feald.value;

        if(self.prevDialogId){
            self._cache[self.prevDialogId].draft.message = draft;

            if(messageModule.attachmentIds.length){
                self._cache[self.prevDialogId].draft.attacnments = messageModule.attachmentIds;
            }
        }

        messageModule.attachmentIds = dialog.draft.attachments;

        helpers.clearView(self.messagesContainer);
    }

    document.forms.send_message.message_feald.value = dialog.draft.message;
    if(dialog.draft.attachments.length){
        var attachments = dialog.draft.attachments;


        for(var j = 0; j < attachments.length; j++){
            var img = document.createElement('img');

            img.classList.add('attachment_preview__item');
            img.src = helpers.getSrcFromAttachmentId(attachments[j]);

            self.attachmentsPreviewContainer.append(img);
        }
    }

    if(dialog && dialog.messages.length){
        for(var i = 0; i < dialog.messages.length; i++){
            messageModule.renderMessage(dialog.messages[i], false);
        }
        
        helpers.scrollTo(self.messagesContainer, 'bottom');
        
        if(dialog.messages.length < messageModule.limit){
            messageModule.getMessages(self.dialogId);
        } else if (!dialog.full){
            messageModule.initLoadMoreMessages();
        }

    } else {
        messageModule.getMessages(self.dialogId);
    }
};

Dialog.prototype.checkCachedUsersInDialog = function(id){
    var self = this,
        userList = self._cache[id].users,
        unsetUsers = [];

    for(var i = 0; i < userList.length; i++){
        if(!userModule._cache[userList[i]]){
            unsetUsers.push(userList[i]);
        }
    }

    if(unsetUsers.length) {
        userModule.getUsersByIds(unsetUsers, function(){
            self.renderDialog(id);
        });
    }

    return !unsetUsers.length;
};

Dialog.prototype.changeLastMessagePreview = function(dialogId, msg){
    var self = this,
        dialog = document.getElementById(dialogId);

    self._cache[dialogId].last_message = msg.message;

    if(dialog){
        dialog.querySelector('.j-dialog__last_message ').innerText = msg.message;
    }
};


Dialog.prototype.createDialog = function(params) {
    var self = this;

    QB.chat.dialog.create(params, function(err, createdDialog) {
        if (err) {
            console.log(err);
        } else {
            var occupants = createdDialog.occupants_ids,
                msg = {
                type: 'chat',
                extension: {
                    notification_type: 1,
                    dialog_id: createdDialog._id,
                    dialog_name: createdDialog.name,
                    dialog_type: createdDialog.type,
                    occupants_ids: occupants.join(', ')
                }
            };

            for(var i = 0; i < occupants.length; i++){
                if (occupants[i] != app.user.id) {
                    QB.chat.sendSystemMessage(occupants[i], msg);
                }
            }

            self.loadDialogById(createdDialog._id, true);
        }
    });
};


Dialog.prototype.loadDialogById = function(id, renderMessages) {
    var self = this;

    QB.chat.dialog.list({_id: id}, function(err, res){
        var dialog = res.items[0],
            compiledDialogParams = helpers.compileDialogParams(dialog);


        if(dialog){
            var type = dialog.type === 1 ? 'public' : 'chat',
                activeTab = document.querySelector('.j-sidebar__tab_link.active');

            if(activeTab && type === activeTab.dataset.type){
                var conversatinLink = document.getElementById(dialog._id);

                if(!conversatinLink){
                    self._cache[dialog._id] = compiledDialogParams;

                    self.buildDialog(compiledDialogParams, true);

                } else {
                    self.dialogsListContainer.insertBefore(conversatinLink, self.dialogsListContainer.firstElementChild);
                }

                if(renderMessages && conversatinLink) {
                    self.dialogId = dialog._id;
                    conversatinLink.click();
                }
            }
        }
    });
};

var dialogModule = new Dialog();
