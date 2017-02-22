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


function Listeners(){}

Listeners.prototype.onMessageListener = function(userId, message){
    var msg = helpers.fillNewMessagePrams(userId, message),
        dialog = dialogModule._cache[message.dialog_id];

    if(dialog){
        dialog.messages.unshift(msg);
        dialogModule.renderDialog(dialog, true);
        dialogModule.changeLastMessagePreview(msg.chat_dialog_id, msg);
    } else {
        dialogModule.getDialogById(msg.chat_dialog_id, function(dialog){
            var type = dialog.type === 1 ? 'public' : 'chat',
                activeTab = document.querySelector('.j-sidebar__tab_link.active');

            if(activeTab && type === activeTab.dataset.type){
                dialogModule.renderDialog(dialog, true);
            }
        });
    }

    if(dialogModule.dialogId === msg.chat_dialog_id){
        messageModule.renderMessage(msg, true);
    }
};

Listeners.prototype.onSentMessageCallback = function(){

};

Listeners.prototype.onMessageTypingListener = function(isTyping, userId, dialogId) {
    var currentDialogId = dialogModule.dialogId,
        dialog = dialogModule._cache[currentDialogId];

    if(((dialogId && currentDialogId === dialogId) || (!dialogId && dialog && dialog.jidOrUserId === userId)) && userId !== app.user.id) {
        messageModule.setTypingStatuses(isTyping, userId, dialogId || dialog._id);
    }
};

Listeners.prototype.onReadStatusListener = function(){

};

Listeners.prototype.onSystemMessageListener = function(message){
    if (message.extension && (message.extension.notification_type === '1' || message.extension.notification_type === 'creating_dialog')) {
        if(message.extension.dialog_id) {
            dialogModule.getDialogById(message.extension.dialog_id, false, false);
        }
        return false;
    }
};

Listeners.prototype.setListeners = function(){
    QB.chat.onMessageListener = this.onMessageListener;
    QB.chat.onSystemMessageListener = this.onSystemMessageListener;
    QB.chat.onMessageTypingListener = this.onMessageTypingListener;
};

var listeners = new Listeners();
