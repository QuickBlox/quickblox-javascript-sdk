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


function Listeners() {
}

Listeners.prototype.onMessageListener = function (userId, message) {
    var msg = helpers.fillNewMessageParams(userId, message),
        dialog = dialogModule._cache[message.dialog_id];

    if (dialog) {
        dialog.messages.unshift(msg);

        dialogModule.changeLastMessagePreview(msg.chat_dialog_id, msg);

        var activeTab = document.querySelector('.j-sidebar__tab_link.active'),
            tabType = activeTab.dataset.type,
            dialogType = dialog.type === 1 ? "public" : "chat";

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
        dialogModule.getDialogById(msg.chat_dialog_id, function (dialog) {
            var type = dialog.type === 1 ? 'public' : 'chat',
                activeTab = document.querySelector('.j-sidebar__tab_link.active');

            if (activeTab && type === activeTab.dataset.type) {
                dialogModule.renderDialog(dialog, true);
            }
        });
    }

};


Listeners.prototype.onReconnectFailedListener = function() {
    alert('onReconnectFailedListener');
};

Listeners.prototype.onSentMessageCallback = function () {

};

Listeners.prototype.onMessageTypingListener = function (isTyping, userId, dialogId) {
    var currentDialogId = dialogModule.dialogId,
        dialog = dialogModule._cache[currentDialogId];

    if (((dialogId && currentDialogId === dialogId) || (!dialogId && dialog && dialog.jidOrUserId === userId)) && userId !== app.user.id) {
        messageModule.setTypingStatuses(isTyping, userId, dialogId || dialog._id);
    }
};

Listeners.prototype.onReadStatusListener = function () {

};

Listeners.prototype.onSystemMessageListener = function (message) {
    if (message.extension && (message.extension.notification_type === '1' || message.extension.notification_type === 'creating_dialog')) {
        if (message.extension.dialog_id) {
            dialogModule.getDialogById(message.extension.dialog_id, function (dialog) {
                var type = dialog.type === 1 ? 'public' : 'chat',
                    activeTab = document.querySelector('.j-sidebar__tab_link.active');

                if (activeTab && type === activeTab.dataset.type) {
                    dialogModule.renderDialog(dialog, true);
                }
            });
        }
        return false;
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

Listeners.prototype.setListeners = function () {
    QB.chat.onMessageListener = this.onMessageListener;
    QB.chat.onSystemMessageListener = this.onSystemMessageListener;
    QB.chat.onMessageTypingListener = this.onMessageTypingListener;

    QB.chat.onReconnectFailedListener = this.onReconnectFailedListener;
    // lost enternet connection.
    window.addEventListener('online', this.updateOnlineStatus);
    window.addEventListener('offline', this.updateOnlineStatus);
};

var listeners = new Listeners();
