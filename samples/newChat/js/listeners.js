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
    // This is a notification about dialog creation

    if (message.extension && message.extension.notification_type === '1') {
        if(message.extension._id) {
            app.loadDialogById(message.extension._id);
        }
        return false;
    }

    var msg = helpers.fillNewMessagePrams(userId, message);

    cache.setDialog(message.dialog_id, null, msg);

    if(app.dialogId === msg.chat_dialog_id){
        app.renderMessage(msg, true);
        app.changeLastMessagePreview(msg.chat_dialog_id, msg);
        app.scrollTo('messages', 'bottom');
    } else if (cache.getDialog(msg.chat_dialog_id)){
        app.changeLastMessagePreview(msg.chat_dialog_id, msg);
    } else {
        console.log('create new dialog');
    }
};

Listeners.prototype.onSentMessageCallback = function(){

};

Listeners.prototype.onMessageTypingListener = function(){

};

Listeners.prototype.onReadStatusListener = function(){

};

Listeners.prototype.setListeners = function(){
    QB.chat.onMessageListener = this.onMessageListener;
};

var listeners = new Listeners();
