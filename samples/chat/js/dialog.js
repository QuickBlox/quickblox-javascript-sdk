'use strict';

function Dialog() {
    this._cache = {};
    
    this.dialogId = null;
    this.prevDialogId = null;
    this.limit = appConfig.dilogsPerRequers || 30;

    // elements
    this.sidebar = null;
    this.content = null;
    this.dialogTitle = null;
    this.dialogsListContainer = null;
    this.messagesContainer = null;
    this.editLink = null;
    this.quitLink = null;
    this.attachmentsPreviewContainer = null;
}

Dialog.prototype.init = function () {
    var self = this;

    self.sidebar = document.querySelector('.j-sidebar');
    self.dialogsListContainer = document.querySelector('.j-sidebar__dilog_list');
    self.content = document.querySelector('.j-content');

    self.dialogsListContainer.addEventListener('scroll', function loadMoreDialogs() {
        var container = self.dialogsListContainer,
            position = container.scrollHeight - (container.scrollTop + container.offsetHeight);

        if (container.classList.contains('full')) {
            return false;
        }

        if (position <= 50 && !container.classList.contains('loading')) {
            var type = document.querySelector('.j-sidebar__tab_link.active').dataset.type;
            self.loadDialogs(type);
        }
    });
};

Dialog.prototype.loadDialogs = function (type) {
    var self = this,
        filter = {
            limit: self.limit,
            skip: self.dialogsListContainer.querySelectorAll('.j-dialog__item').length,
            sort_desc: "updated_at"
        };

    return new Promise(function(resolve, reject){
        if (!app.checkInternetConnection()) {
            reject(new Error('no internet connection'));
        }

        self.dialogsListContainer.classList.add('loading');

        if (type === 'chat') {
            filter['type[in]'] = [CONSTANTS.DIALOG_TYPES.CHAT, CONSTANTS.DIALOG_TYPES.GROUPCHAT].join(',');
        } else {
            filter.type = CONSTANTS.DIALOG_TYPES.PUBLICCHAT;
        }

        QB.chat.dialog.list(filter, function (err, resDialogs) {
            if (err) {
                reject(err);
            }

            var dialogs = resDialogs.items;

            _.each(dialogs, function (dialog) {
                self._cache[dialog._id] = helpers.compileDialogParams(dialog);
                self.renderDialog(self._cache[dialog._id]);
            });

            if (self.dialogId) {
                var dialogElem = document.getElementById(self.dialogId);
                if (dialogElem) dialogElem.classList.add('selected');
            }

            if (dialogs.length < self.limit) {
                self.dialogsListContainer.classList.add('full');
            }
            self.dialogsListContainer.classList.remove('loading');

            resolve();
        });
    });
};

Dialog.prototype.renderDialog = function (dialog, setAsFirst) {
    var self = this,
        id = dialog._id,
        elem = document.getElementById(id);

    if(!self._cache[id]){
        self._cache[id] = helpers.compileDialogParams(dialog);
        dialog = self._cache[id];
    }

    if (elem) {
        self.replaceDialogLink(elem);
        return elem;
    }

    if (dialog.type !== CONSTANTS.DIALOG_TYPES.CHAT && !dialog.joined) {
        self.joinToDialog(id);
    }

    var template = helpers.fillTemplate('tpl_userConversations', {dialog: dialog});
    elem = helpers.toHtml(template)[0];

    if (!setAsFirst) {
        self.dialogsListContainer.appendChild(elem);
    } else {
        self.dialogsListContainer.insertBefore(elem, self.dialogsListContainer.firstElementChild);
    }

    elem.addEventListener('click', function(e){
        if(e.currentTarget.classList.contains('selected') && app.sidebar.classList.contains('active')){
            app.sidebar.classList.remove('active');
        }
    });

    return elem;
};

Dialog.prototype.selectCurrentDialog = function(dialogId){
    var self = this,
        dialogElem = document.getElementById(dialogId);

    self.sidebar.classList.remove('active');

    if (!app.checkInternetConnection()) {
        return false;
    }

    if (dialogElem.classList.contains('selected') && document.forms.send_message) return false;

    var selectedDialog = document.querySelector('.dialog__item.selected');

    if (selectedDialog) {
        selectedDialog.classList.remove('selected');
    }

    dialogElem.classList.add('selected');
};

Dialog.prototype.decreaseUnreadCounter = function(dialogId){
    var self = this,
        dialog = self._cache[dialogId];

    // Can't decrease unexist dialog or dialog without unread messages.
    if(dialog === undefined || dialog.unread_messages_count <= 0) return;

    dialog.unread_messages_count--;

    var dialogElem = document.getElementById(dialogId),
        unreadCounter = dialogElem.querySelector('.j-dialog_unread_counter');

    unreadCounter.innerText = dialog.unread_messages_count;

    if(dialog.unread_messages_count === 0) {
        unreadCounter.classList.add('hidden');
        unreadCounter.innerText = '';
    }
};

Dialog.prototype.replaceDialogLink = function (elem) {
    var self = this,
        elemsCollection = self.dialogsListContainer.children,
        elemPosition;

    for (var i = 0; i < elemsCollection.length; i++) {
        if (elemsCollection[i] === elem) {
            elemPosition = i;
            break;
        }
    }

    if (elemPosition >= 5) {
        self.dialogsListContainer.replaceChild(elem, self.dialogsListContainer.firstElementChild);
    }
};

Dialog.prototype.joinToDialog = function (id) {
    var self = this,
        jidOrUserId = ((typeof self._cache[id].jidOrUserId == "number")?String(self._cache[id].jidOrUserId):self._cache[id].jidOrUserId);

    return new Promise(function (resolve, reject){
        QB.chat.muc.join(jidOrUserId, function (resultStanza) {

            for (var i = 0; i < resultStanza.childNodes.length; i++) {
                var elItem = resultStanza.childNodes.item(i);
                if (elItem.tagName === 'error') {
                    self._cache[id].joined = false;
                    return reject();
                }
            }

            self._cache[id].joined = true;
            resolve();
        });
    });
};

Dialog.prototype.renderMessages = function (dialogId) {
    var self = this,
        dialog = self._cache[dialogId];
    dialog.tplDateMessage = {};
    document.querySelector('.j-sidebar__create_dialog').classList.remove('active');

    if (!document.forms.send_message) {
        helpers.clearView(this.content);
        self.content.innerHTML = helpers.fillTemplate('tpl_conversationContainer', {title: dialog.name, _id: dialog._id, type: dialog.type});
        self.messagesContainer = document.querySelector('.j-messages');
        self.attachmentsPreviewContainer = self.content.querySelector('.j-attachments_preview');
        self.dialogTitle = document.querySelector('.j-dialog__title');
        self.editLink = document.querySelector('.j-add_to_dialog');
        self.quitLink = document.querySelector('.j-quit_fom_dialog_link');
        
        document.querySelector('.j-open_sidebar').addEventListener('click', function (e) {
            self.sidebar.classList.add('active');
        }.bind(self));

        messageModule.init();

        self.quitLink.addEventListener('click', function(e) {
            e.preventDefault();
            if(dialog.type === CONSTANTS.DIALOG_TYPES.PUBLICCHAT) return;
            self.quitFromTheDialog(this.dataset.dialog);
        });
    } else {
        if (self.prevDialogId) {
            messageModule.sendStopTypingStatus(self.prevDialogId);
        }

        self.dialogTitle.innerText = dialog.name;

        if(dialog.type === CONSTANTS.DIALOG_TYPES.CHAT || dialog.type === CONSTANTS.DIALOG_TYPES.GROUPCHAT) {
            if (dialog && dialog.messages.length) {
                for (var i = 0; i < dialog.messages.length; i++) {
                    if(!dialog.messages[i].selfReaded) {
                        messageModule.sendReadStatus(dialog.messages[i]._id, dialog.messages[i].sender_id, dialogId);
                        dialog.messages[i].selfReaded = true;
                        dialogModule.decreaseUnreadCounter(dialogId);
                    }
                }
            }
        }

        self.editLink.href = '#!/dialog/' + self.dialogId + '/edit';
        self.quitLink.dataset.dialog = dialogId;

        if(dialog.type === CONSTANTS.DIALOG_TYPES.GROUPCHAT){
            self.editLink.classList.remove('hidden');
        } else {
            self.editLink.classList.add('hidden');
        }

        if(dialog.type === CONSTANTS.DIALOG_TYPES.PUBLICCHAT){
            self.quitLink.classList.add('hidden');
        } else {
            self.quitLink.classList.remove('hidden');
        }

        helpers.clearView(self.messagesContainer);
        helpers.clearView(self.attachmentsPreviewContainer);
        document.forms.send_message.attach_file.value = null;
    }

    messageModule.setLoadMoreMessagesListener();

    document.forms.send_message.message_feald.value = dialog.draft.message || '';

    self.checkCachedUsersInDialog(dialogId).then(function(){
        if (dialog && dialog.messages.length) {
            for (var i = 0; i < dialog.messages.length; i++) {
                messageModule.renderMessage(dialog.messages[i], false);
            }

            helpers.scrollTo(self.messagesContainer, 'bottom');

            if (dialog.messages.length < messageModule.limit) {
                messageModule.getMessages(self.dialogId);
            }
        } else {
            messageModule.getMessages(self.dialogId);
        }
    });
};

Dialog.prototype.changeLastMessagePreview = function (dialogId, msg) {
    var self = this,
        dialog = document.getElementById(dialogId),
        message = msg.message;

    if (message && message.indexOf('\n') !== -1) {
        message = message.slice(0, message.indexOf('\n'));
    }

    self._cache[dialogId].last_message = message;
    self._cache[dialogId].last_message_date_sent = msg.date_sent;

    if (dialog) {
        var messagePreview = dialog.querySelector('.j-dialog__last_message ');

        if (msg.message) {
            messagePreview.classList.remove('attachment');
            messagePreview.innerText = message;
        } else {
            messagePreview.classList.add('attachment');
            messagePreview.innerText = 'Attachment';
        }

        dialog.querySelector('.j-dialog__last_message_date').innerText = msg.date_sent;
        dialogModule.sortedByLastMessage(dialogId);
    }
};

Dialog.prototype.createDialog = function (params) {
    if (!app.checkInternetConnection()) {
        return false;
    }
    var self = this;
    QB.chat.dialog.create(params, function (err, createdDialog) {
        if (err) {
            console.error(err);
        } else {
            var occupants_names = [],
                id = createdDialog._id,
                occupants = createdDialog.occupants_ids,
                message_body = (app.user.name || app.user.login) + ' created new dialog with: ';

            _.each(occupants, function (occupantId) {
                var occupant_name = userModule._cache[occupantId].name || userModule._cache[occupantId].login;

                occupants_names.push(occupant_name);
            });

            message_body += occupants_names.join(', ');

            var systemMessage = {
                extension: {
                    notification_type: 1,
                    dialog_id: createdDialog._id
                }
            };

            var notificationMessage = {
                type: 'groupchat',
                body: message_body,
                extension: {
                    save_to_history: 1,
                    dialog_id: createdDialog._id,
                    notification_type: 1,
                    date_sent: Date.now()
                }
            };

            var newOccupantsIds = occupants.filter(function(item){
                return item != app.user.id
            });

            /* Check dialog in cache */
            if (!self._cache[id]) {
                self._cache[id] = helpers.compileDialogParams(createdDialog);
            }

            (new Promise(function (resolve){
                if(createdDialog.type===CONSTANTS.DIALOG_TYPES.CHAT){
                    resolve();
                }
                self.joinToDialog(id).then(function(){
                    if(createdDialog.type === CONSTANTS.DIALOG_TYPES.GROUPCHAT){
                        messageModule.sendMessage(id, notificationMessage);
                    }
                    resolve();
                });
            })).then(function(){
                for (var i = 0; i < newOccupantsIds.length; i++) {
                    QB.chat.sendSystemMessage(newOccupantsIds[i], systemMessage);
                }
                /* Check active tab [chat / public] */
                var type = params.type === CONSTANTS.DIALOG_TYPES.PUBLICCHAT ? 'public' : 'chat',
                    activeTab = document.querySelector('.j-sidebar__tab_link.active');
                if (activeTab && type !== activeTab.dataset.type) {
                    var tab = document.querySelector('.j-sidebar__tab_link[data-type="chat"]');
                    app.loadChatList(tab).then(function () {
                        self.renderDialog(self._cache[id], true);
                    }).catch(function(error){
                        console.error(error);
                    });
                } else {
                    self.renderDialog(self._cache[id], true);
                    router.navigate('/dialog/' + id);
                }
            });
        }
    });
};

Dialog.prototype.getDialogById = function (id) {
    return new Promise(function(resolve, reject){
        if (!app.checkInternetConnection()) {
            return false;
        }
        QB.chat.dialog.list({"_id": id}, function (err, res) {
            if (err) {
                console.error(err);
                reject(err);
            }

            var dialog = res.items[0];

            if(dialog) {
                resolve(dialog);
            } else {
                reject(new Error('can\'t find dialog with this id: ' + id));
            }
        });
    });
};

Dialog.prototype.checkCachedUsersInDialog = function (dialogId) {
    var self = this,
        userList = self._cache[dialogId].users,
        unsetUsers = [];

    return new Promise(function  (resolve, reject) {
        for (var i = 0; i < userList.length; i++) {
            if (!userModule._cache[userList[i]]) {
                unsetUsers.push(userList[i]);
            }
        }
        if (unsetUsers.length) {
            userModule.getUsersByIds(unsetUsers).then(function(){
                resolve();
            }).catch(function(error){
                reject(error);
            });
        } else {
            resolve();
        }
    });
};

Dialog.prototype.updateDialog = function (updates) {
    var self = this,
        dialogId = updates.id,
        dialog = self._cache[dialogId],
        toUpdateParams = {},
        newUsers,
        updatedMsg = {
            type: 'groupchat',
            body: '',
            extension: {
                save_to_history: 1,
                dialog_id: dialog._id,
                notification_type: 2,
                dialog_updated_at: Date.now() / 1000
            },
            markable: 1
        };

    if(dialog.type !== CONSTANTS.DIALOG_TYPES.GROUPCHAT) return false;

    if(updates.title){
        if(updates.title !== dialog.name){
            toUpdateParams.name = updates.title;
            updatedMsg.extension.dialog_name = updates.title;
            updatedMsg.body = app.user.name + ' changed the conversation name to "' + updates.title + '".';
        }
    }

    if (updates.userList) {
        newUsers =  _getNewUsers();

        if(newUsers.length){
            toUpdateParams.push_all = {
                occupants_ids: newUsers
            };

            var usernames = newUsers.map(function(userId){
                return userModule._cache[userId].name || userId;
            });

            self._cache[dialogId].users = self._cache[dialogId].users.concat(newUsers);

            updatedMsg.body = app.user.name + ' adds ' + usernames.join(', ') + ' to the conversation.';
            updatedMsg.extension.new_occupants_ids = newUsers.join(',');
        } else {
            router.navigate('/dialog/' + dialogId);
            return false;
        }
    }

    _sendUpdateStanza().then(function(dialog){
        if(newUsers){
            _notifyNewUsers(newUsers);
        }

        var msg = {
            extension: {
                notification_type: 2,
                dialog_id: dialog._id,
                new_occupants_ids: newUsers.toString()
            }
        };

        _.each(dialog.occupants_ids, function(user){
            QB.chat.sendSystemMessage(+user, msg);
        });


        messageModule.sendMessage(dialogId, updatedMsg);

        if(updates.title){
            self.updateDialogUi(dialogId, updates.title);
        }

        router.navigate('/dialog/' + dialog._id);
    }).catch(function(error){
        console.error(error);
    });

    function _getNewUsers(){
        return updates.userList.filter(function(occupantId){
            return dialog.users.indexOf(occupantId) === -1;
        });
    }

    function _sendUpdateStanza (){
        return new Promise (function(resolve, reject){
            QB.chat.dialog.update(dialogId, toUpdateParams, function(err, dialog) {
                if (err) {
                    reject(err);
                } else {
                    resolve(dialog);
                }
            });
        });
    }

    function _notifyNewUsers (users) {
        var msg = {
            extension: {
                notification_type: 2,
                dialog_id: dialog._id,
                new_occupants_ids: users.toString()
            }
        };

        _.each(users, function(user){
            QB.chat.sendSystemMessage(+user, msg);
        });
    }
};

Dialog.prototype.updateDialogUi = function(dialogId, name){
    var self = this,
        cachedDialog = self._cache[dialogId],
        dialogElem = document.getElementById(dialogId);

    cachedDialog.name = name;
    dialogElem.querySelector('.dialog__name').innerText = name;

    if(self.dialogId === dialogId){
        self.dialogTitle.innerText = name;
    }
};

Dialog.prototype.quitFromTheDialog = function(dialogId){
    var self = this,
        dialog = self._cache[dialogId];

    switch (dialog.type){
        case CONSTANTS.DIALOG_TYPES.PUBLICCHAT:
            alert('you can\'t remove this dialog');
            break;
        case CONSTANTS.DIALOG_TYPES.CHAT:
        case CONSTANTS.DIALOG_TYPES.GROUPCHAT:

            if(CONSTANTS.DIALOG_TYPES.GROUPCHAT===dialog.type){
                // remove user from current  group dialog;
                _notuyfyUsers();

                var systemMessage = {
                    extension: {
                        notification_type: 3,
                        dialog_id: dialog._id
                    }
                };

                for (var i = 0; i < dialog.users.length; i++) {
                    if (dialog.users[i] === app.user.id) {
                        continue;
                    }
                    QB.chat.sendSystemMessage(dialog.users[i], systemMessage);
                }

            }

            QB.chat.dialog.delete([dialogId], function(err) {
                if (err) {
                    console.error(err);
                } else {
                    _removedilogFromCacheAndUi();
                    router.navigate('/dashboard');
                }
            });
            break;
    }

    function _removedilogFromCacheAndUi(){
        delete self._cache[dialogId];
        var dialogElem = document.getElementById(dialogId);
        dialogElem.parentNode.removeChild(dialogElem);
        self.dialogId = null;
    }

    function _notuyfyUsers(){
        var msg = {
            type: 'groupchat',
            body:  app.user.name + ' left the chat.',
            extension: {
                save_to_history: 1,
                dialog_id: dialog._id,
                notification_type: 3,
                dialog_updated_at: Date.now() / 1000
            },
            markable: 1
        };

        messageModule.sendMessage(dialogId, msg);
    }

};

Dialog.prototype.sortedByLastMessage = function(dialogId){
    var self = this,
        elem = document.getElementById(dialogId);
        if(elem) {
            self.dialogsListContainer.insertBefore(elem, self.dialogsListContainer.firstElementChild);
        }
};


var dialogModule = new Dialog();
