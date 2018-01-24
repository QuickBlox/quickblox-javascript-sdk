'use strict';

/**
 * Full user's callbacks (listener-functions) list:
 * - onMessageListener
 * - onMessageErrorListener (messageId, error)
 * - onSentMessageCallback(messageLost, messageSent)
 * - onMessageTypingListener
 * - onDeliveredStatusListener (messageId, dialogId, userId);
 * - onReadStatusListener (messageId, dialogId, userId);
 * - onSystemMessageListener (message)
 * - onContactListListener (userId, type)
 * - onSubscribeListener (userId)
 * - onConfirmSubscribeListener (userId)
 * - onRejectSubscribeListener (userId)
 * - onDisconnectedListener
 * - onReconnectListener
 */


function Listeners() {};

Listeners.prototype.onMessageListener = function (userId, message) {
    if(userId === app.user.id) return false;

    var self = this,
        msg = helpers.fillNewMessageParams(userId, message),
        dialog = dialogModule._cache[message.dialog_id];

    if(message.markable){
        messageModule.sendDeliveredStatus(msg._id, userId, msg.chat_dialog_id);
    }

    if (dialog) {
        dialog.messages.unshift(msg);
        dialogModule.changeLastMessagePreview(msg.chat_dialog_id, msg);

        if(message.extension.notification_type){
            return self.onNotificationMessage(userId, message);
        }

        var activeTab = document.querySelector('.j-sidebar__tab_link.active'),
            tabType = activeTab.dataset.type,
            dialogType = dialog.type === 1 ? 'public' : 'chat';

        if(tabType === dialogType){
            dialogModule.renderDialog(dialog, true);

            if (dialogModule.dialogId === msg.chat_dialog_id) {
                messageModule.renderMessage(msg, true);
            } else {
                dialog.unread_messages_count += 1;
                var dialogElem = document.getElementById(msg.chat_dialog_id),
                    counter = dialogElem.querySelector('.j-dialog_unread_counter');

                counter.classList.remove('hidden');
                counter.innerText = dialog.unread_messages_count;
            }
        }
    } else {
        dialogModule.getDialogById(msg.chat_dialog_id).then(function(dialog){
            dialogModule._cache[dialog._id] = helpers.compileDialogParams(dialog);

            var type = dialog.type === 1 ? 'public' : 'chat',
                activeTab = document.querySelector('.j-sidebar__tab_link.active'),
                cachedDialog = dialogModule._cache[dialog._id];
            if (activeTab && type === activeTab.dataset.type) {
                dialogModule.renderDialog(cachedDialog, true);
            }
        }).catch(function(e){
            console.error(e);
        });
    }
};

Listeners.prototype.onNotificationMessage = function(userId, message){
    var self = this,
        msg = helpers.fillNewMessageParams(userId, message),
        dialog = dialogModule._cache[message.dialog_id],
        extension = message.extension,
        dialogId = message.dialog_id,
        occupantsIdsAdded = extension.occupants_ids_added && extension.occupants_ids_added.split(',');

    if(extension.notification_type === CONSTANTS.NOTIFICATION_TYPES.UPDATE_DIALOG){
        if (extension.occupants_ids_removed) {
            dialogModule._cache[dialogId].users = dialogModule._cache[dialogId].users.filter(function(user){
                return user !== userId;
            });
        } else if(extension.occupants_ids_added) {
            _.each(occupantsIdsAdded, function(userId) {
                if (dialog.users.indexOf(+userId) === -1) {
                    dialog.users.push(+userId);
                }
            });
        } else if(extension.dialog_name){
            dialog.name = extension.dialog_name;
            dialogModule.updateDialogUi(dialogId, extension.dialog_name);
        }
    }

    var activeTab = document.querySelector('.j-sidebar__tab_link.active'),
        tabType = activeTab.dataset.type,
        dialogType = dialog.type === 1 ? 'public' : 'chat';

    if(tabType === dialogType){
        dialogModule.renderDialog(dialog, true);

        if (dialogModule.dialogId === msg.chat_dialog_id) {
            messageModule.renderMessage(msg, true);
        } else {
            dialog.unread_messages_count += 1;
            var dialogElem = document.getElementById(msg.chat_dialog_id),
                counter = dialogElem.querySelector('.j-dialog_unread_counter');

            counter.classList.remove('hidden');
            counter.innerText = dialog.unread_messages_count;
        }
    }
};

Listeners.prototype.onReconnectFailedListener = function() {
    alert('onReconnectFailedListener');
};

Listeners.prototype.onMessageTypingListener = function (isTyping, userId, dialogId) {
    var currentDialogId = dialogModule.dialogId,
        dialog = dialogModule._cache[currentDialogId];

    if (((dialogId && currentDialogId === dialogId) || (!dialogId && dialog && dialog.jidOrUserId === userId)) && userId !== app.user.id) {
        messageModule.setTypingStatuses(isTyping, userId, dialogId || dialog._id);
    }
};

Listeners.prototype.onSystemMessageListener = function (message) {
    var dialog = dialogModule._cache[message.dialog_id || message.extension.dialog_id];

    if (message.extension && message.extension.notification_type === CONSTANTS.NOTIFICATION_TYPES.NEW_DIALOG) {
        if (message.extension.dialog_id) {
            dialogModule.getDialogById(message.extension.dialog_id).then(function (dialog) {
                dialogModule._cache[dialog._id] = helpers.compileDialogParams(dialog);
                var type = dialog.type === 1 ? 'public' : 'chat',
                    activeTab = document.querySelector('.j-sidebar__tab_link.active');

                if (activeTab && type === activeTab.dataset.type) {
                    dialogModule.renderDialog(dialogModule._cache[dialog._id], true);
                }
            }).catch(function(error){
                console.error(error);
            });
        }
        return false;
    } else if(message.extension && message.extension.notification_type === CONSTANTS.NOTIFICATION_TYPES.UPDATE_DIALOG) {
        if(!dialog){
            dialogModule.getDialogById(message.extension.dialog_id).then(function (dialog) {
                dialogModule._cache[dialog._id] = helpers.compileDialogParams(dialog);
                var type = dialog.type === 1 ? 'public' : 'chat',
                    activeTab = document.querySelector('.j-sidebar__tab_link.active');

                if (activeTab && type === activeTab.dataset.type) {
                    dialogModule.renderDialog(dialogModule._cache[dialog._id], true);
                }
            }).catch(function(error){
                console.error(error);
            });
        }
    }
};

Listeners.prototype.updateOnlineStatus = function (e) {
    if (!navigator.onLine) {
        app.noInternetMessage();
    } else {
        var notifications = document.querySelector('.j-notifications');

        helpers.clearView(notifications);
        notifications.classList.add('hidden');
    }

};

Listeners.prototype.onSentMessageCallback = function (messageLost, messageSent) {
    var message = messageSent || messageLost,
        data = {
            _id: message.id,
            dialogId: message.extension.dialog_id
        };

    if (messageLost) {
        // message was not sent to the chat.
        data.status = 'not sent';
    } else {
        // message was sent to the chat but not delivered to che opponent.
        data.status = 'not delivered yet';
    }

    messageModule.setMessageStatus(data);
};


Listeners.prototype.onReadStatusListener = function (messageId, dialogId, userId) {
    var data = {
        _id: messageId,
        dialogId: dialogId,
        userId: userId,
        status: 'seen'
    };

    messageModule.setMessageStatus(data);
};

Listeners.prototype.onDeliveredStatusListener = function (messageId, dialogId, userId) {
    var data = {
        _id: messageId,
        dialogId: dialogId,
        userId: userId,
        status: 'delivered'
    };

    messageModule.setMessageStatus(data);
};

Listeners.prototype.setListeners = function () {
    QB.chat.onMessageListener = this.onMessageListener.bind(this);
    QB.chat.onSystemMessageListener = this.onSystemMessageListener;
    QB.chat.onMessageTypingListener = this.onMessageTypingListener;
    QB.chat.onReconnectFailedListener = this.onReconnectFailedListener;

    // messaage status listeners
    QB.chat.onSentMessageCallback = this.onSentMessageCallback.bind(this);
    QB.chat.onDeliveredStatusListener = this.onDeliveredStatusListener.bind(this);
    QB.chat.onReadStatusListener = this.onReadStatusListener.bind(this);

    // lost enternet connection.
    window.addEventListener('online', this.updateOnlineStatus);
    window.addEventListener('offline', this.updateOnlineStatus);
};

var listeners = new Listeners();
