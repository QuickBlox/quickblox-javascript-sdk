// submit form after press "ENTER"
function submit_handler(form) {
  return false;
}

//
function whatTypeChat (itemType, occupantsIds, itemId, itemPhoto) {
  var withPhoto    = '<img src="http://api.quickblox.com/blobs/'+itemPhoto+'/download.xml?token='+token+'" width="30" height="30" class="round">';
      withoutPhoto = '<img src="images/ava-group.svg" width="30" height="30" class="round">';
      privatPhoto  = '<img src="images/ava-single.svg" width="30" height="30" class="round">';
      defaultPhoto = '<span class="glyphicon glyphicon-eye-close"></span>'
  switch (itemType) {
    case 1:
      dialogIcon = itemPhoto ? withPhoto : withoutPhoto;
      break;
    case 2:
      dialogIcon = itemPhoto ? withPhoto : withoutPhoto;
      break;
    case 3:
      getRecipientId(occupantsIds, itemId);
      chatName = 'Dialog with ' + userId;
      dialogIcon = privatPhoto;
      break;
    default:
      dialogIcon = defaultPhoto;
      break;
  }
}

// Choose dialog
function triggerDialog(element, dialogId){
  // deselect
  var kids = $( "#dialogs-list" ).children();
  kids.removeClass("active").addClass("inactive");
  // select
  $('#'+dialogId).removeClass("inactive").addClass("active");

  $('.list-group-item.active .badge').text(0).delay(250).fadeOut(500);
  currentDialog = dialogs[dialogId];
  // join in room
  if (currentDialog.type != 3) {
    QB.chat.muc.join(currentDialog.xmpp_room_jid, function() {
    });
  }
  // Load messages history
  var params = {chat_dialog_id: dialogId, sort_asc: 'date_sent', limit: 100, skip: 0};
  QB.chat.message.list(params, function(err, messages) {
    $('#messages-list').html('');
    if (messages) {
      if(messages.items.length == 0){
        $("#no-messages-label").removeClass('hide');
      } else {
        $("#no-messages-label").addClass('hide');

        messages.items.forEach(function(item, i, arr) {
          var messageText = item.message;
          var messageSenderId = item.sender_id;
          var messageDateSent = new Date(item.date_sent*1000);
          var messageAttachmentFileId = null;
          if (item.hasOwnProperty("attachments")) {
            if(item.attachments.length > 0) {
              messageAttachmentFileId = item.attachments[0].id;
            }
          }
          var messageHtml = buildMessageHTML(messageText, messageSenderId, messageDateSent, messageAttachmentFileId);

          $('#messages-list').append(messageHtml);

          var mydiv = $('#messages-list');
              mydiv.scrollTop(mydiv.prop('scrollHeight'));
        });
      }
    }  
  });
}

// on message listener
function onMessage(userId, msg){

  var messageAttachmentFileId = null;
    if (msg.extension.hasOwnProperty("attachments")) {
      if(msg.extension.attachments.length > 0) {
        messageAttachmentFileId = msg.extension.attachments[0].id;
      }
    }

	if(isMessageForCurrentDialog(userId, msg.dialog_id)){
     showMessage(userId, msg, messageAttachmentFileId);
  }

  notifiesNew(msg.dialog_id, msg.body);
}

// build html for messages
function buildMessageHTML(messageText, messageSenderId, messageDateSent, attachmentFileId){
  var messageAttach;
    if(attachmentFileId){
      messageAttach = "<img src='http://api.quickblox.com/blobs/"+attachmentFileId+"/download.xml?token="+token+"' alt='attachment' class='attachments img-responsive' />"
    }

  var messageHtml = '<div class="list-group-item">'+'<time datetime="'+messageDateSent+'" class="pull-right">'+jQuery.timeago(messageDateSent)+
                    '</time>'+'<h4 class="list-group-item-heading">'+messageSenderId+'</h4>'+'<p class="list-group-item-text">'+
                    (messageAttach ? messageAttach : messageText)+'</p>'+'</div>';
  return messageHtml;
}

// build html for dialogs
function buildDialogHtml(dialogId, dialogUnreadMessagesCount, dialogIcon, dialogName, dialogLastMessage) {
  var UnreadMessagesCountShow = '<span class="badge">'+dialogUnreadMessagesCount+'</span>';
      UnreadMessagesCountHide = '<span class="badge" style="display: none;">'+dialogUnreadMessagesCount+'</span>';

  var dialogHtml = '<a href="#" class="list-group-item" id='+'"'+dialogId+'"'+' onclick="triggerDialog(this, '+"'"+dialogId+"'"+')">'+ 
                   (dialogUnreadMessagesCount == 0 ? UnreadMessagesCountHide : UnreadMessagesCountShow)+'<h4 class="list-group-item-heading">'+
                   dialogIcon+'&nbsp;&nbsp;&nbsp;'+dialogName+'</h4>'+'<p class="list-group-item-text last-message">'+
                   (dialogLastMessage === null ?  "" : dialogLastMessage)+'</p>'+'</a>';
  return dialogHtml;
}

// sending messages after confirmation
function clickSendMessage(){

  var currentText = $('#message_text').val().trim();
  $('#message_text').val('').focus();
  if (currentText.length == 0){
    return;
  }
  sendMessage(currentText, null);
}

// add attachment to QB content
function clickSendAttachments(inputFile) {
  // upload image
  QB.content.createAndUpload({name: inputFile.name, file: inputFile, type: inputFile.type, size: inputFile.size, 'public': false}, function(err, response){
    if (err) {
      console.log(err);
    } else {
      $("#progress").fadeOut(400);
      var uploadedFile = response;

      sendMessage("[attachment]", uploadedFile.id);
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
    QB.chat.send(userId, msg);
    $('.list-group-item.active .list-group-item-text').text(msg.body);
      if(attachmentFileId == null){
        showMessage(currentUser.id, msg);
      } else {
        showMessage(currentUser.id, msg, attachmentFileId);
      }
  } else {
    QB.chat.send(currentDialog.xmpp_room_jid, msg);
  }
  
  clearTimeout(isTypingTimerId);
  isTypingTimeoutCallback();
}

// build html for typing status
function buildTypingUserHtml(userId) {
  var typingUserHtml = '<div id="'+userId+'_typing" class="list-group-item typing">'+'<time class="pull-right">writing now</time>'+'<h4 class="list-group-item-heading">'+
                       userId+'</h4>'+'<p class="list-group-item-text"> . . . </p>'+'</div>';

  return typingUserHtml;
}

// show unread message count and new last message
function notifiesNew(DialogId, text){ 
  // unread message count
  badgeCount = $('#'+DialogId+' .badge').html();
  $('#'+DialogId+'.list-group-item.inactive .badge').text(parseInt(badgeCount)+1).fadeIn(500);
  // last message
  $('#'+DialogId+' .list-group-item-text').text(text);
}

// Show messages in UI
function showMessage(userId, msg, attachmentFileId) {
  // add a message to list
  var messageHtml = buildMessageHTML(msg.body, userId, new Date(), attachmentFileId);

  $('#messages-list').append(messageHtml);

  // scroll to bottom
  var mydiv = $('#messages-list');
  mydiv.scrollTop(mydiv.prop('scrollHeight'));
}

// get companion ID
function getRecipientId(occupantsIds, currentUserId){
	var recipientId = null;
  occupantsIds.forEach(function(item, i, arr) {
    if(item != currentUserId){
      userId = item;
      recipientId = item;
    }  
  });
  return recipientId;
}

function onMessageTyping(isTyping, userId, dialogId) {
  	showUserIsTypingView(isTyping, userId, dialogId);
}

var isTypingTimerId;
function setupIsTypingHandler() {
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

function isTypingTimeoutCallback() {
	isTypingTimerId = undefined;
	sendStopTypinStatus();
}

function sendTypingStatus() {  		
	// send 'is typing' status
	if (currentDialog.type == 3) {
	  QB.chat.sendIsTypingStatus(userId);
	} else {
	  QB.chat.sendIsTypingStatus(currentDialog.xmpp_room_jid);
	}
}

function sendStopTypinStatus() {
	// send 'stop typing' status
	if (currentDialog.type == 3) {
		QB.chat.sendIsStopTypingStatus(userId);
	} else {
		QB.chat.sendIsStopTypingStatus(currentDialog.xmpp_room_jid);
}

function showUserIsTypingView(isTyping, userId, dialogId) {
	if(isMessageForCurrentDialog(userId, dialogId)){

		console.log("typing for this dialog");

	  if (!isTyping) {
	    $('#'+userId+'_typing').remove();
	  } else if (userId != currentUser.id) {
	    var typingUserHtml = buildTypingUserHtml(userId);
	    $('#messages-list').append(typingUserHtml);
	  }

	  // scroll to bottom
	  var mydiv = $('#messages-list');
	  mydiv.scrollTop(mydiv.prop('scrollHeight'));
	}
}

function isMessageForCurrentDialog(userId, dialogId){
		if (dialogId == currentDialog._id || (dialogId == null && currentDialog.type == 3 && getRecipientId(currentDialog.occupants_ids, currentUser.id) == userId)) {
			return true;
		} else {
			return false;
		}
}