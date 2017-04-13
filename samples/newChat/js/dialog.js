'use strict';

function Dialog() {
    this._cache = {};
    
    this.dialogId = null;
    this.prevDialogId = null;

    // elements
    this.sidebar = null;
    this.content = null;
    this.dialogTitle = null;
    this.dialogsListContainer = null;
    this.messagesContainer = null;
    this.editLink = null;
    this.quitLink = null;
    this.attachmentsPreviewContainer = null;
    this.limit = appConfig.dilogsPerRequers || 30;
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
            container.removeEventListener('scroll', loadMoreDialogs);
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
            filter['type[in]'] = [CONSTANTS.DIALOG_TYPES.CHAT, CONSTANTS.DIALOG_TYPES.GROUPCHAT].toString();
        } else {
            filter.type = CONSTANTS.DIALOG_TYPES.PUBLICCHAT;
        }

        QB.chat.dialog.list(filter, function (err, resDialogs) {
            if (err) {
                reject(err);
            }

            var dialogs = resDialogs.items.map(function (dialog) {
                dialog.color = _.random(1, 10);
                return dialog;
            });

            var peerToPearDialogs = dialogs.filter(function (dialog) {
                if (dialog.type === CONSTANTS.DIALOG_TYPES.CHAT) {
                    return true
                }
            }).map(function (dialog) {
                return {
                    full_name: dialog.name,
                    id: dialog.occupants_ids.filter(function (id) {
                        if (id !== app.user.id) return id;
                    })[0],
                    color: dialog.color
                }
            });

            _.each(peerToPearDialogs, function (user) {
                userModule.addToCache(user);
            });

            _.each(dialogs, function (dialog) {
                if (!self._cache[dialog._id]) {
                    self._cache[dialog._id] = helpers.compileDialogParams(dialog);
                }

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

    if (elem) {
        self.replaceDialogLink(elem);
        return elem;
    }

    if (dialog.type !== CONSTANTS.DIALOG_TYPES.CHAT && !dialog.joined) {
        self.joinToDialog(id);
    }

    var template = helpers.fillTemplate('tpl_userConversations', {dialog: dialog});
    elem = helpers.toHtml(template)[0];

    elem.addEventListener('click', function (e) {
        self.sidebar.classList.remove('active');

        if (!app.checkInternetConnection()) {
            return false;
        }

        if (elem.classList.contains('selected') && document.forms.send_message) return false;

        var selectedDialog = document.querySelector('.dialog__item.selected'),
            dialogElem = e.currentTarget;

        if (selectedDialog) {
            selectedDialog.classList.remove('selected');
        }

        elem.classList.add('selected');

        self.prevDialogId = self.dialogId;
        self.dialogId = dialogElem.id;

        self._cache[self.dialogId].unread_messages_count = 0;

        var unreadCounter = dialogElem.querySelector('.j-dialog_unread_counter');

        unreadCounter.classList.add('hidden');
        unreadCounter.innerText = '';
    });

    if (!setAsFirst) {
        self.dialogsListContainer.appendChild(elem);
    } else {
        self.dialogsListContainer.insertBefore(elem, self.dialogsListContainer.firstElementChild);
    }
    return elem;
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
        jidOrUserId = self._cache[id].jidOrUserId;

    QB.chat.muc.join(jidOrUserId, function (resultStanza) {
        var joined = true;
        for (var i = 0; i < resultStanza.childNodes.length; i++) {
            var elItem = resultStanza.childNodes.item(i);
            if (elItem.tagName === 'error') {
                joined = false;
            }
        }
        self._cache[id].joined = joined;
    });
};

Dialog.prototype.renderMessages = function (dialogId) {
    var self = this,
        dialog = self._cache[dialogId];

    document.querySelector('.j-sidebar__create_dialog').classList.remove('active');

    if (!self.checkCachedUsersInDialog(dialogId)) return false;

    if (!document.forms.send_message) {
        helpers.clearView(this.content);
        self.content.innerHTML = helpers.fillTemplate('tpl_conversationContainer', {title: dialog.name, _id: dialog._id});
        self.messagesContainer = document.querySelector('.j-messages');
        self.attachmentsPreviewContainer = self.content.querySelector('.j-attachments_preview');
        self.dialogTitle = document.querySelector('.j-dialog__title');
        self.editLink = document.querySelector('.j-add_to_dialog');
        self.quitLink = document.querySelector('.j-quit_fom_dialog_link');
        document.querySelector('.j-open_sidebar').addEventListener('click', function (e) {
            self.sidebar.classList.add('active');
        }.bind(self));

        self.quitLink.addEventListener('click', function(e){
           e.preventDefault();
            alert('quit from dialog:', self.dialogId);
        });

        messageModule.init();
    } else {
        if (self.prevDialogId) {
            messageModule.sendStopTypingStatus(self.prevDialogId);
        }

        self.dialogTitle.innerText = dialog.name;
        self.editLink.href = '#!/dialog/' + self.dialogId + '/edit';
        console.log(self.editLink.attributes.href);
        console.log(self.editLink);
        helpers.clearView(self.messagesContainer);
        helpers.clearView(self.attachmentsPreviewContainer);
        document.forms.send_message.attach_file.value = null;
    }

    messageModule.setLoadMoreMessagesListener();

    document.forms.send_message.message_feald.value = dialog.draft.message || '';

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
};

Dialog.prototype.changeLastMessagePreview = function (dialogId, msg) {
    var self = this,
        dialog = document.getElementById(dialogId),
        message = msg.message;

    if (message.indexOf('\n') !== -1) {
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
            var id = createdDialog._id;
            if (params.type !== CONSTANTS.DIALOG_TYPES.CHAT) {
                var occupants = createdDialog.occupants_ids,
                    message_body = (app.user.name || app.user.login) + ' created new dialog with: ';

                _.each(occupants, function (occupantId) {
                    message_body += (userModule._cache[occupantId].name || userModule._cache[occupantId].login);
                });

                var msg = {
                    type: 'groupchat',
                    body: message_body,
                    extension: {
                        notification_type: 1,
                        dialog_id: createdDialog._id,
                        room_name: createdDialog.name,
                        room_updated_date: Math.floor(Date.now() / 1000),
                        type: createdDialog.type,
                        current_occupant_ids: occupants.join(','),
                        date_sent: Math.floor(Date.now() / 1000)
                    }
                };

                for (var i = 0; i < occupants.length; i++) {
                    if (occupants[i] != app.user.id) {
                        QB.chat.sendSystemMessage(occupants[i], msg);
                    }
                }
            }

            /* Check dialog in cache */
            if (!self._cache[id]) {
                self._cache[id] = helpers.compileDialogParams(createdDialog);
            }

            /* Check active tab [chat / public] */
            var type = params.type === CONSTANTS.DIALOG_TYPES.PUBLICCHAT ? 'public' : 'chat',
                activeTab = document.querySelector('.j-sidebar__tab_link.active');

            if (activeTab && type !== activeTab.dataset.type) {
                var tab = document.querySelector('.j-sidebar__tab_link[data-type="chat"]');
                app.loadChatList(tab, function () {
                    self.renderDialog(self._cache[id], true).click();
                });
            } else {
                self.renderDialog(self._cache[id], true).click();
            }
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
        dialog = self._cache[updates.id];

    console.log()

    if(updates.title && dialog.type !== CONSTANTS.DIALOG_TYPES.CHAT){
        console.log('update title in ');
    } else if (updates.userList) {
        console.log(dialog);
        console.log('update users');
    } else {
        // can't change dialog name in a privat chat (type 3).
        return false;
    }

    function _getNewUsers(){

    }
};

var dialogModule = new Dialog();
