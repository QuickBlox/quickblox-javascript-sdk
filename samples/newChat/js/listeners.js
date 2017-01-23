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


function Listeners(){};

Listeners.prototype.onMessageListener = function(userId, message){
    var msg = helpers.fillNewMessagePrams(userId, message);

    cache.setDilog(message.dialog_id, null, msg, msg.message);



    if(app.dialogId === msg.chat_dialog_id){
        app.renderMessage(msg, true);
        app.changeLastMessagePreview(msg.chat_dialog_id, msg);
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

    QB.chat.onMessageListener = this.onMessageListener
    console.log('set QB listeners');
};

var listeners = new Listeners();
