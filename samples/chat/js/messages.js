var currentDialog;
var opponentId;
var skipPage;
var cancelSkip = false;

// on message listener
function onMessage(userId, msg) {

  // This is a notification about dialog creation
  //
  if (msg.extension.notification_type == 1) {
    if (!msg.delay) {
      getAndShowNewDialog(msg.extension._id);
    }
  // Here we process regular messages
  //
  } else {
    // сheck if it's an attachment
    //
    var messageAttachmentFileId = null;
    if (msg.extension.hasOwnProperty("attachments")) {
      if(msg.extension.attachments.length > 0) {
        messageAttachmentFileId = msg.extension.attachments[0].id;

        skipPage = skipPage + 1;
      }
    }

    // check if it's a mesasges for current dialog
    //
    if (isMessageForCurrentDialog(userId, msg.dialog_id)){
      showMessage(userId, msg, messageAttachmentFileId);
      skipPage = skipPage + 1;
    }

    updateDialogsList(msg.dialog_id, msg.body);
  }
}

// submit form after press "ENTER"
function submit_handler(form) {
  return false;
}

//
function setupMsgScrollHandler() {
  var msgWindow = $('.col-md-8 .list-group.pre-scrollable');
  var msgList = $('#messages-list');

  msgList.scroll(function() {
    if (msgWindow.scrollTop() == msgWindow.height() - msgList.height()){
      if (cancelSkip != true) {
        skipPage = skipPage + 10;

        retrieveChatMessages(currentDialog.id);
      }
    }
  });
}

function retrieveChatMessages(dialogId){
  // Load messages history
  //
  $(".load-msg").show(0);

  var params = {chat_dialog_id: dialogId, sort_desc: 'date_sent', limit: 10, skip: skipPage};
  QB.chat.message.list(params, function(err, messages) {
    if (messages) {

      if(messages.items.length == 0) {
        $("#no-messages-label").removeClass('hide');
      } else {
        $("#no-messages-label").addClass('hide');

        if (messages.items.length < 10) {
          cancelSkip = true;
        }

        messages.items.forEach(function(item, i, arr) {
          var messageId = item._id;
          var messageText = item.message;
          var messageSenderId = item.sender_id;
          var messageDateSent = new Date(item.date_sent*1000);
          var messageAttachmentFileId = null;
          var messageSenderLogin = getUserLoginById(messageSenderId);

          if (item.hasOwnProperty("attachments")) {
            if(item.attachments.length > 0) {
              messageAttachmentFileId = item.attachments[0].id;
            }
          }

          var messageHtml = buildMessageHTML(messageText, messageSenderLogin, messageDateSent, messageAttachmentFileId, messageId);

          $('#messages-list').prepend(messageHtml);
        });
      }
    }

  });
  $(".load-msg").delay(100).fadeOut(500);
}


// sending messages after confirmation
function clickSendMessage() {
  var currentText = $('#message_text').val().trim();
  if (currentText.length == 0){
    return;
  }

  $('#message_text').val('').focus();

  sendMessage(currentText, null);
}

function clickSendAttachments(inputFile) {
  // upload image
  QB.content.createAndUpload({name: inputFile.name, file: inputFile, type:
        inputFile.type, size: inputFile.size, 'public': false}, function(err, response){
    if (err) {
      console.log(err);
    } else {
      $("#progress").fadeOut(400);
      var uploadedFile = response;

      sendMessage("[attachment]", uploadedFile.id);

      $("input[type=file]").val('');
    }
  });
}

// send text or attachment
function sendMessage(text, attachmentFileId) {
  var msg = {
    type: currentDialog.type == 3 ? 'chat' : 'groupchat',
    body: text,
    extension: {
      save_to_history: 1,
    },
    senderId: currentUser.id,
  };
  if(attachmentFileId != null){
    msg["extension"]["attachments"] = [{id: attachmentFileId, type: 'photo'}];
  }

  if (currentDialog.type == 3) {
    opponentId = QB.chat.helpers.getRecipientId(currentDialog.occupants_ids, currentUser.id);
    QB.chat.send(opponentId, msg);

    $('.list-group-item.active .list-group-item-text').text(msg.body);

    skipPage = skipPage + 1;

    if(attachmentFileId == null){
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

}

// show messages in UI
function showMessage(userId, msg, attachmentFileId) {
  // add a message to list
  var userLogin = getUserLoginById(userId);
  var messageHtml = buildMessageHTML(msg.body, userLogin, new Date(), attachmentFileId, msg.id);

  $('#messages-list').append(messageHtml);

  // scroll to bottom
  var mydiv = $('#messages-list');
  mydiv.scrollTop(mydiv.prop('scrollHeight'));
}

//
function setupOnMessageListener() {
  QB.chat.onMessageListener = onMessage;
}

// show typing status in chat or groupchat
function onMessageTyping(isTyping, userId, dialogId) {
  	showUserIsTypingView(isTyping, userId, dialogId);
}

// start timer after keypress event
var isTypingTimerId;
function setupIsTypingHandler() {
  QB.chat.onMessageTypingListener = onMessageTyping;

  $("#message_text").focus().keyup(function(){

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

// delete timer and send 'stop typing' status
function isTypingTimeoutCallback() {
	isTypingTimerId = undefined;
	sendStopTypinStatus();
}

// send 'is typing' status
function sendTypingStatus() {
	if (currentDialog.type == 3) {
	  QB.chat.sendIsTypingStatus(opponentId);
	} else {
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
	if(isMessageForCurrentDialog(userId, dialogId)){

	  if (!isTyping) {
	    $('#'+userId+'_typing').remove();
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
	if (dialogId == currentDialog._id || (dialogId == null && currentDialog.type == 3 && opponentId == userId)) {
		return true;
	}
	return false;
}
