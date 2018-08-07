var currentDialog;
var opponentId;

var dialogsMessages = [];

// submit form after press "ENTER"
function submit_handler(form) {
    return false;
}

function setupMsgScrollHandler() {
    var $msgWindow = $('.col-md-8 .list-group.pre-scrollable'),
        $msgList = $('#messages-list');

    $msgList.scroll(function() {
        if ($msgWindow.scrollTop() == $msgWindow.height() - $msgList.height()) {

            var dateSent = null;

            if (dialogsMessages.length > 0) {
                dateSent = dialogsMessages[0].date_sent;
            }

            retrieveChatMessages(currentDialog, dateSent);
        }
    });
}

// on message listener
//
function onMessage(userId, msg) {
    var dialogId = msg.dialog_id,
        isForCurrentDialog = isMessageForCurrentDialog(userId, dialogId);

    updateCallState({
        dialogId: dialogId,
        userId: userId,
        active: isForCurrentDialog,
        type: msg.extension.notification_type
    });

    if (!msg.body) return true;

    // check if it's a message for current dialog
    if (isMessageForCurrentDialog(userId, dialogId)) {
        dialogsMessages.push(msg);

        if (msg.markable === 1 && userId != currentUser.id) {
            sendReadStatus(userId, msg.id, dialogId);
        }

        // сheck if it's an attachment
        //
        var messageAttachmentFileId = null;

        if (msg.extension.hasOwnProperty("attachments")) {
            if (msg.extension.attachments.length > 0) {
                messageAttachmentFileId = msg.extension.attachments[0].id;
            }
        }

        showMessage(userId, msg, messageAttachmentFileId);
    }

    // Here we process the regular messages
    //
    updateDialogsList(dialogId, msg.body);

    if (userId != currentUser.id) {
        playSoundOnNewMessage();
    }
}

function sendReadStatus(userId, messageId, dialogId) {
    var params = {
        messageId: messageId,
        userId: userId,
        dialogId: dialogId
    };
    QB.chat.sendReadStatus(params);
}

function onDeliveredStatusListener(messageId) {
    showDeliveredСheckmark(messageId)
}

function onReadStatusListener(messageId) {
    showReadСheckmark(messageId)
}

function showDeliveredСheckmark(messageId) {
    $('#read_' + messageId).fadeOut(100);
    $('#delivered_' + messageId).fadeIn(200);
}

function showReadСheckmark(messageId) {
    $('#delivered_' + messageId).fadeOut(100);
    $('#read_' + messageId).fadeIn(200);
}

function retrieveChatMessages(dialog, beforeDateSent) {
    var $loadMsg = $(".load-msg"),
        params = {
            chat_dialog_id: dialog._id,
            sort_desc: 'date_sent',
            limit: 10
        };

    // Load messages history
    $loadMsg.show(0);

    // if we would like to load the previous history
    if (beforeDateSent !== null) {
        params.date_sent = {
            lt: beforeDateSent
        };
    } else {
        currentDialog = dialog;
        dialogsMessages = [];
    }

    QB.chat.message.list(params, function(err, messages) {
        if (messages) {
            if (messages.items.length === 0) {
                $("#no-messages-label").removeClass('hide');
            } else {
                $("#no-messages-label").addClass('hide');

                messages.items.forEach(function(item, i, arr) {

                    dialogsMessages.splice(0, 0, item);

                    var messageId = item._id,
                        messageText = item.message,
                        messageSenderId = item.sender_id,
                        messageDateSent = new Date(item.date_sent * 1000),
                        messageSenderLogin = getUserLoginById(messageSenderId),
                        $msgList = $('#messages-list');

                    // send read status
                    if (item.read_ids.indexOf(currentUser.id) === -1) {
                        sendReadStatus(messageSenderId, messageId, currentDialog._id);
                    }

                    var messageAttachmentFileId = null;
                    if (item.hasOwnProperty("attachments")) {
                        if (item.attachments.length > 0) {
                            messageAttachmentFileId = item.attachments[0].id;
                        }
                    }

                    var messageHtml = buildMessageHTML(messageText, messageSenderLogin, messageDateSent, messageAttachmentFileId, messageId);

                    $msgList.prepend(messageHtml);


                    // Show delivered statuses
                    if (item.read_ids.length > 1 && messageSenderId === currentUser.id) {
                        showReadСheckmark(messageId);
                    } else if (item.delivered_ids.length > 1 && messageSenderId === currentUser.id) {
                        showDeliveredСheckmark(messageId);
                    }

                    if (i > 5) {
                        $msgList.scrollTop($msgList.prop('scrollHeight'));
                    }
                });
            }
        } else {
            console.log(err);
        }
    });

    $loadMsg.delay(100).fadeOut(500);
}


// sending messages after confirmation
function clickSendMessage() {
    var currentText = $('#message_text').val().trim();

    if (!currentText.length) {
        return;
    }

    $('#message_text').val('').focus();

    sendMessage(currentText, null);
}

function clickSendAttachments(inputFile) {
    QB.content.createAndUpload({
        public: false,
        file: inputFile,
        name: inputFile.name,
        type: inputFile.type,
        size: inputFile.size
    }, function(err, response) {
        if (err) {
            console.error(err);
        } else {
            $("#progress").fadeOut(400, function() {
                $(".input-group-btn_change_load").removeClass("visibility_hidden");
            });

            sendMessage("[attachment]", response.uid);

            $("input[type=file]").val('');
        }
    });
}

// send text or attachment
function sendMessage(text, attachmentFileId) {
    var msg = {
        type: currentDialogType(),
        body: text,
        extension: {
            save_to_history: 1,
        },
        markable: 1
    };

    if (attachmentFileId !== null) {
        msg['extension']['attachments'] = [{
            id: attachmentFileId,
            type: 'photo'
        }];
    }

    if (currentDialog.type === 3) {
        opponentId = QB.chat.helpers.getRecipientId(currentDialog.occupants_ids, currentUser.id);

        QB.chat.send(opponentId, msg);

        $('.list-group-item.active .list-group-item-text').text(msg.body);

        if (attachmentFileId === null) {
            showMessage(currentUser.id, msg);
        } else {
            showMessage(currentUser.id, msg, attachmentFileId);
        }
    } else {
        QB.chat.send(currentDialog.xmpp_room_jid, msg);
    }

    // claer timer and send 'stop typing' status
    clearTimeout(isTypingTimerId);
    isTypingTimeoutCallback();

    dialogsMessages.push(msg);
}

// show messages in UI
function showMessage(userId, msg, attachmentFileId) {
    var userLogin = getUserLoginById(userId);
    var messageHtml = buildMessageHTML(msg.body, userLogin, new Date(), attachmentFileId, msg.id);

    $('#messages-list').append(messageHtml);

    // scroll to bottom
    var mydiv = $('#messages-list');
    mydiv.scrollTop(mydiv.prop('scrollHeight'));
}


// show typing status in chat or groupchat
function onMessageTyping(isTyping, userId, dialogId) {
    showUserIsTypingView(isTyping, userId, dialogId);
}

// start timer after keypress event
var isTypingTimerId;

function setupIsTypingHandler() {
    QB.chat.onMessageTypingListener = onMessageTyping;

    $("#message_text").focus().keyup(function() {

        if (typeof isTypingTimerId === 'undefined') {

            // send 'is typing' status
            sendTypingStatus();

            // start is typing timer
            isTypingTimerId = setTimeout(isTypingTimeoutCallback, 5000);
        } else {

            // start is typing timer again
            clearTimeout(isTypingTimerId);
            isTypingTimerId = setTimeout(isTypingTimeoutCallback, 5000);
        }
    });
}

function setupStreamManagementListeners() {
    QB.chat.onSentMessageCallback = function(messageLost, messageSent) {
        console.group('onSentMessageCallback');
        messageLost ? console.log('Message was lost', messageLost) : console.log('Message was sent successfully', messageSent)
        console.groupEnd();
    };
}

// delete timer and send 'stop typing' status
function isTypingTimeoutCallback() {
    isTypingTimerId = undefined;
    sendStopTypinStatus();
}

// send 'is typing' status
function sendTypingStatus() {
    if (currentDialog.type == 3) {
        QB.chat.sendIsTypingStatus(opponentId);
    } else if (currentDialog && currentDialog.xmpp_room_jid) {
        QB.chat.sendIsTypingStatus(currentDialog.xmpp_room_jid);
    }
}

// send 'stop typing' status
function sendStopTypinStatus() {
    if (currentDialog.type == 3) {
        QB.chat.sendIsStopTypingStatus(opponentId);
    } else {
        QB.chat.sendIsStopTypingStatus(currentDialog.xmpp_room_jid);
    }
}

// show or hide typing status to other users
function showUserIsTypingView(isTyping, userId, dialogId) {
    if (isMessageForCurrentDialog(userId, dialogId)) {

        if (!isTyping) {
            $('#' + userId + '_typing').remove();
        } else if (userId != currentUser.id) {
            var userLogin = getUserLoginById(userId);
            var typingUserHtml = buildTypingUserHtml(userId, userLogin);
            $('#messages-list').append(typingUserHtml);
        }

        // scroll to bottom
        var mydiv = $('#messages-list');
        mydiv.scrollTop(mydiv.prop('scrollHeight'));
    }
}

// filter for current dialog
function isMessageForCurrentDialog(userId, dialogId) {
    var result = false;
    if (dialogId == currentDialog._id || (dialogId === null && currentDialog.type == 3 && opponentId == userId)) {
        result = true;
    }
    return result;
}

function currentDialogType() {
    return currentDialog.type === 3 ? 'chat' : 'groupchat'
}

function playSoundOnNewMessage() {
    new Audio("data:audio/mp3;base64,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").play();
}
