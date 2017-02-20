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

    console.group('onMessageListener');
        console.log('userId',userId);
        console.log('message',message);
    console.groupEnd();

    if(dialog){
        dialog.messages.unshift(msg);
        dialogModule.changeLastMessagePreview(msg.chat_dialog_id, msg);
    } else {
        dialogModule.loadDialogById(msg.chat_dialog_id, false);
    }

    if(dialogModule.dialogId === msg.chat_dialog_id){
        messageModule.renderMessage(msg, true);
        dialogModule.changeLastMessagePreview(msg.chat_dialog_id, msg);
    }
};

Listeners.prototype.onSentMessageCallback = function(){

};

Listeners.prototype.onMessageTypingListener = function(isTyping, userId, dialogId) {
    var currentDialogId = dialogModule.dialogId,
        dialog = dialogModule._cache[currentDialogId];

    console.group('onMessageTypingListener');
        console.log('isTyping',isTyping);
        console.log('userId',userId);
        console.log('dialogId',dialogId);
    console.groupEnd();

    if(((dialogId && currentDialogId === dialogId) || (!dialogId && dialog && dialog.jidOrUserId === userId)) && userId !== app.user.id) {
        messageModule.setTypingStatuses(isTyping, userId, dialogId || dialog._id);
    }
};

Listeners.prototype.onReadStatusListener = function(){

};

Listeners.prototype.onSystemMessageListener = function(message){
    // This is a notification about dialog creation
    console.group('onSystemMessageListener');
        console.log('message',message);
    console.groupEnd();
    if (message.extension && (message.extension.notification_type === '1' || message.extension.notification_type === 'creating_dialog')) {
        if(message.extension.dialog_id) {
            dialogModule.loadDialogById(message.extension.dialog_id, false);
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
