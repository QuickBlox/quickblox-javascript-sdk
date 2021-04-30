'use strict';

function Dialog() {
    this._cache = {};

    this.selectedDialogIds = [];
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

    this._getDialogs = function (args) {
        var self = this,
            filter = args ? args : {
                limit: self.limit,
                skip: app.modal.querySelectorAll('.j-group_chat__dialog_list .user__item').length,
                sort_desc: "updated_at"
            };

        return new Promise(function (resolve, reject) {
            if (!app.checkInternetConnection()) {
                reject(new Error('no internet connection'));
            }

            QB.chat.dialog.list(filter, function (err, resDialogs) {
                if (err) {
                    reject(err);
                }
                resolve(resDialogs.items);
            });
        });
    };

    this.getDialogs = function (args, renderUsers) {
        var self = this;
        var usersListEl = self.userListConteiner;
        usersListEl && usersListEl.classList.add('loading');
        return new Promise(function (resolve, reject) {
            self._getDialogs.call(self, args)
                .then(function (dialogs) {
                    if (renderUsers !== false) {
                        dialogs.forEach(function (dialog) {
                            if (self._cache[dialog._id] === undefined) {
                                self._cache[dialog._id] = helpers.compileDialogParams(dialog);
                            }
                            if (args !== undefined && args.selected !== undefined) {
                                self.buildDialogItem(Object.assign({selected: args.selected, isLastMessage:args.isLastMessage}, self._cache[dialog._id]));
                            } else {
                                self.buildDialogItem(self._cache[dialog._id]);
                            }
                        });
                    }
                    usersListEl && usersListEl.classList.remove('loading');
                    resolve(dialogs);
                })
                .catch(function (err) {
                    usersListEl && usersListEl.classList.remove('loading');
                    reject(err);
                });
        })
    };

    this.setListeners();

}

Dialog.prototype.init = function () {
    var self = this;

    self.sidebar = document.querySelector('.j-sidebar');
    self.dialogsListContainer = document.querySelector('.j-sidebar__dilog_list');
    self.content = document.querySelector('.j-content');

    self.dialogsListContainer.addEventListener('scroll', function loadMoreDialogs(e, method = 'loadDialogs', params = null) {
        var container = self.dialogsListContainer,
            position = container.scrollHeight - (container.scrollTop + container.offsetHeight);

        if (container.classList.contains('full')) {
            return false;
        }

        if (position <= 50 && !container.classList.contains('loading')) {
            self[method](params);
        }
    });
};

Dialog.prototype.loadDialogs = function (f, ) {
    var self = this,
        filter = f ? f : {
            limit: self.limit,
            skip: self.dialogsListContainer.querySelectorAll('.j-dialog__item').length,
            sort_desc: "updated_at"
        };

    return new Promise(function (resolve, reject) {
        if (!app.checkInternetConnection()) {
            reject(new Error('no internet connection'));
        }

        self.dialogsListContainer.classList.add('loading');

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

    if (!self._cache[id]) {
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

    var nameIcon = dialog.name.match(/, .*?./);
    nameIcon = dialog.name[0] + (nameIcon !== null ? nameIcon[0][2] : '');

    var template = helpers.fillTemplate('tpl_userConversations', {dialog: dialog, name: nameIcon});
    elem = helpers.toHtml(template)[0];


    if(self.dialogsListContainer.firstElementChild) {
        console.log(self.dialogsListContainer.firstElementChild.id);
    }

    if (!setAsFirst) {
        self.dialogsListContainer.appendChild(elem);
    } else {
        self.dialogsListContainer.insertBefore(elem, self.dialogsListContainer.firstElementChild);
    }

    elem.addEventListener('click', function (e) {
        if (e.currentTarget.classList.contains('selected') && app.sidebar.classList.contains('active')) {
            app.sidebar.classList.remove('active');
        }
    });

    return elem;
};

Dialog.prototype.selectCurrentDialog = function (dialogId) {
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

Dialog.prototype.decreaseUnreadCounter = function (dialogId) {
    var self = this,
        dialog = self._cache[dialogId];

    // Can't decrease unexist dialog or dialog without unread messages.
    if (dialog === undefined || dialog.unread_messages_count <= 0) return;

    dialog.unread_messages_count--;

    var dialogElem = document.getElementById(dialogId),
        unreadCounter = dialogElem.querySelector('.j-dialog_unread_counter');

    unreadCounter.innerText = dialog.unread_messages_count;

    if (dialog.unread_messages_count === 0) {
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
        jidOrUserId = ((typeof self._cache[id].jidOrUserId == "number") ? String(self._cache[id].jidOrUserId) : self._cache[id].jidOrUserId);

    return new Promise(function (resolve, reject) {
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

    if (!document.forms.send_message) {
        helpers.clearView(this.content);
        self.content.innerHTML = helpers.fillTemplate('tpl_conversationContainer', {
            title: dialog.name,
            _id: dialog._id,
            type: dialog.type
        });
        self.messagesContainer = document.querySelector('.j-messages');
        self.attachmentsPreviewContainer = self.content.querySelector('.j-attachments_preview');
        self.dialogTitle = document.querySelector('.j-dialog__title');
        self.editLink = document.querySelector('.j-add_to_dialog');
        self.quitLink = document.querySelector('.j-quit_fom_dialog_link');

        messageModule.init();
    } else {
        if (self.prevDialogId) {
            messageModule.sendStopTypingStatus(self.prevDialogId);
        }

        self.dialogTitle.innerText = dialog.name;

        if (dialog.type === CONSTANTS.DIALOG_TYPES.CHAT || dialog.type === CONSTANTS.DIALOG_TYPES.GROUPCHAT) {
            if (dialog && dialog.messages.length) {
                for (var i = 0; i < dialog.messages.length; i++) {
                    if (!dialog.messages[i].selfReaded) {
                        messageModule.sendReadStatus(dialog.messages[i]._id, dialog.messages[i].sender_id, dialogId);
                        dialog.messages[i].selfReaded = true;
                        dialogModule.decreaseUnreadCounter(dialogId);
                    }
                }
            }
        }

        self.editLink.href = '#!/dialog/' + self.dialogId + '/edit';
        self.quitLink.dataset.dialog = dialogId;

        if (dialog.type === CONSTANTS.DIALOG_TYPES.GROUPCHAT) {
            self.editLink.classList.remove('hidden');
        } else {
            self.editLink.classList.add('hidden');
        }

        if (dialog.type === CONSTANTS.DIALOG_TYPES.PUBLICCHAT) {
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

    self.checkCachedUsersInDialog(dialogId).then(function () {
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

Dialog.prototype.sendForwardedMessage = function (message) {

    if (!app.checkInternetConnection()) {
        return false;
    }

    var sender = userModule._cache[message.sender_id];

    this.selectedDialogIds.forEach(function (dialogId) {
        var
            dialog = dialogModule._cache[dialogId],
            msg = {
                type: dialog.type === 3 ? 'chat' : 'groupchat',
                body: message.message || CONSTANTS.ATTACHMENT.BODY,
                extension: {
                    save_to_history: 1,
                    dialog_id: dialogId,
                    attachments: message.attachments,
                    origin_sender_name: sender.name
                },
                markable: 1
            };
        messageModule.sendMessage(dialogId, msg);
    });

    this.selectedDialogIds = [];
    modal.substrate.click();

};

Dialog.prototype.beforeCreateDialog = function () {

    var occupants_ids = userModule.selectedUserIds,
        type = occupants_ids.length > 1 ? 2 : 3,
        name = document.forms.create_dialog.dialog_name.value;

    document.forms.create_dialog.dialog_name.focus();

    document.querySelector('.j-create_dialog_btn').setAttribute('disabled', true);

    this.params = {
        type: type,
        occupants_ids: occupants_ids.join(',')
    };

    if (type !== 3) {
        this.params.name = name;
    }else{
        this.createDialog();
        return false;
    }

    var
        createDialog = document.querySelector('.j-create_dialog'),
        chatFilter = document.querySelector('.group_chat__filter'),
        link = document.querySelector('.j-create_dialog_link'),
        userList = document.querySelector('.group_chat__user_list'),
        back = document.querySelector('.j-create_dialog .j-back_to_dialog'),
        form = document.querySelector('.j-create_dialog_form');

    if (chatFilter.classList.contains('active')) {
        createDialog.classList.remove('step1');
        createDialog.classList.remove('step2');
        createDialog.classList.add('step2');
        back.classList.remove('back_to_dashboard');
        back.classList.add('back_to_create');
        chatFilter.classList.remove('active');
        userList.classList.remove('active');
        form.classList.add('active');
        link.classList.remove('active');
    } else {
        createDialog.classList.remove('step1');
        createDialog.classList.remove('step2');
        createDialog.classList.add('step1');
        back.classList.remove('back_to_create');
        back.classList.add('back_to_dashboard');
        chatFilter.classList.add('active');
        userList.classList.add('active');
        form.classList.remove('active');
        link.classList.add('active');
    }

};

Dialog.prototype.createDialog = function () {

    var
        self = this,
        occupants_ids = userModule.selectedUserIds,
        type = occupants_ids.length > 1 ? 2 : 3,
        name = document.forms.create_dialog.dialog_name.value,
        params = this.params;

    if (type !== 3 && name) {
        params.name = this.params.name =  name;
    }

    if (!app.checkInternetConnection()) {
        return false;
    }

    this.params.name = name;

    QB.chat.dialog.create(params, function (err, createdDialog) {
        if (err) {
            console.error(err);
        } else {

            var
                id = createdDialog._id,
                occupants = createdDialog.occupants_ids,
                typeChat = (createdDialog.type === CONSTANTS.DIALOG_TYPES.GROUPCHAT) ? ' the group' : '',
                message_body = (app.user.name || app.user.login) + ' created'+typeChat+' chat "'+createdDialog.name+'"',
                systemMessage = {
                    extension: {
                        notification_type: 1,
                        dialog_id: createdDialog._id
                    }
                },
                notificationMessage = {
                    type: 'groupchat',
                    body: message_body,
                    extension: {
                        save_to_history: 1,
                        dialog_id: createdDialog._id,
                        notification_type: 1
                        //date_sent: Date.now()
                    }
                },
                newOccupantsIds = occupants.filter(function (item) {
                    return item != app.user.id
                });

            /* Check dialog in cache */
            if (!self._cache[id]) {
                self._cache[id] = helpers.compileDialogParams(createdDialog);
            }

            (new Promise(function (resolve) {
                if (createdDialog.type === CONSTANTS.DIALOG_TYPES.CHAT) {
                    resolve();
                }
                self.joinToDialog(id).then(function () {
                    if (createdDialog.type === CONSTANTS.DIALOG_TYPES.GROUPCHAT) {
                        messageModule.sendMessage(id, notificationMessage);
                    }
                    resolve();
                });
            })).then(function () {
                for (var i = 0; i < newOccupantsIds.length; i++) {
                    QB.chat.sendSystemMessage(newOccupantsIds[i], systemMessage);
                }
                /* Check active tab [chat / public] */
                var type = params.type === CONSTANTS.DIALOG_TYPES.PUBLICCHAT ? 'public' : 'chat',
                    activeTab = document.querySelector('.j-sidebar__tab_link.active');
                if (activeTab && type !== activeTab.dataset.type) {
                    app.loadChatList().then(function () {
                        self.renderDialog(self._cache[id], true);
                    }).catch(function (error) {
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
    return new Promise(function (resolve, reject) {
        if (!app.checkInternetConnection()) {
            return false;
        }
        QB.chat.dialog.list({"_id": id}, function (err, res) {
            if (err) {
                console.error(err);
                reject(err);
            }

            var dialog = res.items[0];

            if (dialog) {
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

    return new Promise(function (resolve, reject) {
        for (var i = 0; i < userList.length; i++) {
            if (!userModule._cache[userList[i]]) {
                unsetUsers.push(userList[i]);
            }
        }
        if (unsetUsers.length) {
            userModule.getUsersByIds(unsetUsers).then(function () {
                resolve();
            }).catch(function (error) {
                reject(error);
            });
        } else {
            resolve();
        }
    });
};

Dialog.prototype.beforeUpdateDialog = function () {
    var
        chatFilter = document.querySelector('.group_chat__filter'),
        userList = document.querySelector('.j-update_chat__user_list'),
        occupantsList = document.querySelector('.j-occupants_chat__user_list'),
        form = document.querySelector('.j-update_dialog_form'),
        link = document.querySelector('.j-update_dialog_link'),
        title = document.querySelector('.group_chat__title'),
        members = document.querySelector('.j-update_dialog h5'),
        selectedUserIds = document.querySelector('.selectedUserIds'),
        back = document.querySelector('.j-back_to_dialog');

    if (chatFilter.classList.contains('active')) {
        chatFilter.classList.remove('active');
        userList.classList.remove('active');
        occupantsList.classList.add('active');
        members.classList.add('active');
        form.classList.remove('active');
        link.classList.add('active');
        back.classList.remove('active');
        selectedUserIds.classList.remove('active');
        title.innerHTML = (this._cache[this.dialogId].type === 3) ? 'Chat' : (this._cache[this.dialogId].type === 2) ? 'Group chat' : 'Public chat';
    } else {
        chatFilter.classList.add('active');
        userList.classList.add('active');
        occupantsList.classList.remove('active');
        members.classList.remove('active');
        form.classList.add('active');
        link.classList.remove('active');
        back.classList.add('active');
        selectedUserIds.classList.add('active');
        title.innerHTML = 'Add occupants';
        modal.watch();
    }
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

    if (dialog.type !== CONSTANTS.DIALOG_TYPES.GROUPCHAT) return false;

    if (updates.title) {
        if (updates.title !== dialog.name) {
            toUpdateParams.name = updates.title;
            updatedMsg.extension.dialog_name = updates.title;
            updatedMsg.body = app.user.name + ' changed the conversation name to "' + updates.title + '".';
        }
    }else if (updates.delete) {

        toUpdateParams.pull_all = {
            occupants_ids: [app.user.id]
        };

    }else if (updates.userList) {
        newUsers = updates.userList.filter(function (occupantId) {
            return dialog.users.indexOf(occupantId) === -1;
        });

        if (newUsers.length) {
            toUpdateParams.push_all = {
                occupants_ids: newUsers
            };

            var usernames = newUsers.map(function (userId) {
                return userModule._cache[userId].name || userId;
            });

            self._cache[dialogId].users = self._cache[dialogId].users.concat(newUsers);

            updatedMsg.body = app.user.name + ' added ' + usernames.join(', ');
            updatedMsg.extension.new_occupants_ids = newUsers.join(',');
        } else {
            router.navigate('/dialog/' + dialogId);
            return false;
        }
    }

    return new Promise(function (resolve, reject) {
        QB.chat.dialog.update(dialogId, toUpdateParams, function (err, dialog) {
            if (err) {
                console.error(err);
                reject(err);
            } else {

                if (!updates.delete) {
                    var msg = {
                        extension: {
                            notification_type: 2,
                            dialog_id: dialog._id,
                            new_occupants_ids: newUsers.toString()
                        }
                    };
                    _.each(dialog.occupants_ids, function (user) {
                        QB.chat.sendSystemMessage(+user, msg);
                    });
                    messageModule.sendMessage(dialogId, updatedMsg);
                    if (updates.title) {
                        self.updateDialogUi(dialogId, updates.title);
                    }
                    router.navigate('/dialog/' + dialog._id);
                }

                resolve(dialog);
            }
        });
    });



};

Dialog.prototype.updateDialogUi = function (dialogId, name) {
    var self = this,
        cachedDialog = self._cache[dialogId],
        dialogElem = document.getElementById(dialogId);

    cachedDialog.name = name;
    dialogElem.querySelector('.dialog__name').innerText = name;

    if (self.dialogId === dialogId) {
        self.dialogTitle.innerText = name;
    }
};

Dialog.prototype.quitFromTheDialog = async function (dialogId) {

    var self = this,
        dialog = self._cache[dialogId];

    return new Promise(function (resolve, reject) {
        switch (dialog.type) {
            case CONSTANTS.DIALOG_TYPES.PUBLICCHAT:
                alert('you can\'t remove this dialog');
                break;
            case CONSTANTS.DIALOG_TYPES.CHAT:
            case CONSTANTS.DIALOG_TYPES.GROUPCHAT:

                if (CONSTANTS.DIALOG_TYPES.GROUPCHAT === dialog.type) {
                    // remove user from current  group dialog;
                    var msg = {
                        type: 'groupchat',
                        body: app.user.name + ' has left',
                        extension: {
                            save_to_history: 1,
                            dialog_id: dialog._id,
                            notification_type: 3,
                            dialog_updated_at: Date.now() / 1000
                        },
                        markable: 1
                    };

                    messageModule.sendMessage(dialogId, msg);

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

                    dialogModule.updateDialog({
                        id: dialogId,
                        delete: true
                    }).then(function () {
                        _removedilogFromCacheAndUi();
                        resolve()
                    })

                } else {
                    QB.chat.dialog.delete([dialogId], function (err) {
                        if (err) {
                            console.error(err);
                        } else {
                            _removedilogFromCacheAndUi();
                            resolve()
                        }
                    });
                }
                break;
        }

        function _removedilogFromCacheAndUi() {
            delete self._cache[dialogId];
            delete dialogModule.selectedDialogIds[dialogId];
            var dialogElem = document.getElementById(dialogId);
            if(dialogElem !== null) {
                dialogElem.parentNode.removeChild(dialogElem);
            }
            if(dialogId === self.dialogId) {
                self.dialogId = null;
            }
        }

    });

};

Dialog.prototype.sortedByLastMessage = function (dialogId) {
    var self = this,
        elem = document.getElementById(dialogId);
    if (elem) {
        self.dialogsListContainer.insertBefore(elem, self.dialogsListContainer.firstElementChild);
    }
};

Dialog.prototype.initGettingDialogs = function (userListConteiner, userListFilter, params) {
    var
        self = this,
        elements = {
            userListConteiner: {
                selector: '.j-group_chat__user_list',
                element: userListConteiner
            },
            userListFilter: {
                selector: '.input-group-search input',
                element: userListFilter
            }
        };

    Object.keys(elements).forEach(function (key) {
        if (elements[key].element) {
            if (elements[key] instanceof HTMLElement) {
                self[key] = elements[key].element;
            } else {
                if (typeof elements[key].element === 'string') {
                    elements[key].selector = elements[key].element;
                }
                self[key] = document.querySelector(elements[key].selector);
            }
        } else {
            self[key] = document.querySelector(elements[key].selector);
        }
    });

    self.userListConteiner &&
    self.userListConteiner.addEventListener('scroll', this.scrollHandler);

    self.userListFilter &&
    self.userListFilter.addEventListener('input', self.filter);

    return this.getDialogs(params);
};

Dialog.prototype.buildDialogItem = function (user) {
    var self = this,
        userItem = JSON.parse(JSON.stringify(user));

    if (user.selected !== undefined) {
        userItem.selected = user.selected;
        user.event = {click: false};
    }

    if(user.isLastMessage === undefined) user.isLastMessage = true;
    userItem.isLastMessage = user.isLastMessage;

    var userTpl = helpers.fillTemplate('tpl_dialogItem', {user: userItem}),
        elem = helpers.toHtml(userTpl)[0];

    elem.addEventListener('click', function () {

        if (elem.classList.contains('disabled')) return;
        var index = self.selectedDialogIds.indexOf(elem.id);

        if (elem.classList.contains('selected')) {
            elem.classList.remove('selected');
            elem.querySelector('input').checked = false;
            elem.querySelector('input').removeAttribute("checked");
        } else {
            elem.classList.add('selected');
            elem.querySelector('input').setAttribute("checked", "checked");
            elem.querySelector('input').checked = true;
        }

        if (index > -1) {
            self.selectedDialogIds.splice(index, 1);
        } else {
            self.selectedDialogIds.push(elem.id);
        }

        if(document.querySelector('#selectedDialogIds')) {
            document.querySelector('#selectedDialogIds').innerHTML = self.selectedDialogIds.length === 1 ?
                self.selectedDialogIds.length + ' chat selected' :
                self.selectedDialogIds.length + ' chats selected';
        }

        if (document.forms.create_dialog) {
            document.forms.create_dialog.create_dialog_submit.disabled = !self.selectedDialogIds.length;
        }
        if (document.forms.delete_dialog) {
            document.forms.delete_dialog.create_dialog_submit.disabled = !self.selectedDialogIds.length;
        }
        if (document.forms.forward_dialog) {
            document.forms.forward_dialog.create_dialog_submit.disabled = !self.selectedDialogIds.length;
        }
        return false;

    });

    self.userListConteiner.appendChild(elem);
};

Dialog.prototype.setListeners = function () {

    helpers._(document).on("input", ".dialog_name", function (_event, _element) {
        var dialogName = _element.value.trim();
        document.forms.create_dialog.dialog_name.isValid = 20 >= dialogName.length && dialogName.length >=3;
        if(document.forms.create_dialog.dialog_name.isValid){
            _element.nextElementSibling.classList.remove('filled');
            document.querySelector('.j-create_dialog_btn').removeAttribute('disabled');
        }else{
            _element.nextElementSibling.classList.add('filled');
            document.querySelector('.j-create_dialog_btn').setAttribute('disabled', true);
        }
    });

};

var dialogModule = new Dialog();
