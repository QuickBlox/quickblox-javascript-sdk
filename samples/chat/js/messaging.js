var currentDialog;
var dialogs = {};
var users = {};
var opponentId;
var skipPage = 0;
		cancelSkip = false;


// submit form after press "ENTER"
function submit_handler(form) {
  return false;
}

function retrieveChatDialogs() {

    // get the chat dialogs list
    //
    QB.chat.dialog.list(null, function(err, resDialogs) {
      if (err) {
        console.log(err);
      } else {

        // repackage dialogs data and collect all occupants ids
        //
        var occupantsIds = [];
        resDialogs.items.forEach(function(item, i, arr) {
          var dialogId = item._id;
          dialogs[dialogId] = item;

          // join room
          if (item.type != 3) {
            QB.chat.muc.join(item.xmpp_room_jid, function() {
               console.log("Joined dialog " + dialogId);
            });
            opponentId = null;
          } else {
            opponentId = QB.chat.helpers.getRecipientId(item.occupants_ids, currentUser.id);
          }

          item.occupants_ids.map(function(userId) {
            occupantsIds.push(userId);
          });
        });

        // load dialogs' users
        //
        var params = {filter: { field: 'id', param: 'in', value: jQuery.unique(occupantsIds) }};
        QB.users.listUsers(params, function(err, result){
          if (result) {

            // repackage users data
            //
            result.items.forEach(function(item, i, arr) {
              users[item.user.id] = item.user;
            });

            // show dialogs
            //
            resDialogs.items.forEach(function(item, i, arr) {
              var                  dialogId = item._id;
              var                dialogName = item.name;
              var                dialogType = item.type;
              var         dialogLastMessage = item.last_message;
              var dialogUnreadMessagesCount = item.unread_messages_count;

              var dialogIcon = getDialogIcon(item.type, item.photo);

              if (dialogType == 3) {
                opponentId    = QB.chat.helpers.getRecipientId(item.occupants_ids, currentUser.id);
                opponentLogin = getUserById(opponentId);
                dialogName    = 'Dialog with ' + opponentLogin;
              } else if (dialogName == null){
                dialogName = "group chat";
              }

              var dialogHtml = buildDialogHtml(dialogId, dialogUnreadMessagesCount, dialogIcon, dialogName, dialogLastMessage);
              $('#dialogs-list').append(dialogHtml);
            });

            //  and trigger the 1st dialog
            //
            triggerDialog($('#dialogs-list').children()[0], resDialogs.items[0]._id);
          }

          // hide login form
          $("#loginForm").modal("hide");

          // setup attachments button handler
          //
          $("#load-img").change(function(){
            var inputFile = $("input[type=file]")[0].files[0];
            if (inputFile) {
              $("#progress").show(0);
            }
            clickSendAttachments(inputFile);
          });
        });
      }
    });
}

// Choose dialog
function triggerDialog(element, dialogId){
  skipPage = 0;
  setupMsgScrollHandler(dialogId);
  // deselect
  var kids = $( "#dialogs-list" ).children();
  kids.removeClass("active").addClass("inactive");

  // select
  $('#'+dialogId).removeClass("inactive").addClass("active");

  $('.list-group-item.active .badge').text(0).delay(250).fadeOut(500);
  currentDialog = dialogs[dialogId];

  $('#messages-list').html('');
  skipPage = 0;
  // load chat history
  //
  retrieveChatMessages(dialogId);
}

//
function setupMsgScrollHandler(dialogId){
  var msgWindow = $('.col-md-8 .list-group.pre-scrollable');
      msgList = $('#messages-list');
  // uploading users scroll event
  msgList.scroll(function() {
    if  (msgWindow.scrollTop() == msgWindow.height() - msgList.height()){
    	skipPage = skipPage + 10;
      retrieveChatMessages(dialogId, skipPage);
    }
  });
}

function retrieveChatMessages(dialogId, skipPage){
  // Load messages history
  //
  $(".load-msg").show(0);

  var params = {chat_dialog_id: dialogId, sort_desc: 'date_sent', limit: 10, skip: skipPage,};
  QB.chat.message.list(params, function(err, messages) {
    if (messages) {
    	console.log(messages);
      if(messages.items.length == 0){
        $("#no-messages-label").removeClass('hide');
      } else {
        $("#no-messages-label").addClass('hide');

        messages.items.forEach(function(item, i, arr) {
        	var messageId = item._id;
          var messageText = item.message;
          var messageSenderId = item.sender_id;
          var messageDateSent = new Date(item.date_sent*1000);
          var messageAttachmentFileId = null;
		      var messageSenderLogin = getUserById(messageSenderId);
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
    if (skipPage == 0) {
      var mydiv = $('#messages-list');
      mydiv.scrollTop(mydiv.prop('scrollHeight'));
    }
  });
    $(".load-msg").delay(100).fadeOut(500);
	console.log(skipPage);
}

// on message listener
function onMessage(userId, msg) {

  // This is a notification about dialog creation
  //
  if (msg.extension.notification_type == 1) {
    getAndShowNewDialog(msg.extension._id);

  // Here we process regular messages
  //
  }else{
    // сheck if it's an attachment
    //
    var messageAttachmentFileId = null;
    if (msg.extension.hasOwnProperty("attachments")) {
      if(msg.extension.attachments.length > 0) {
        messageAttachmentFileId = msg.extension.attachments[0].id;
      }
    }

    // check if it's a mesasges for current dialog
    //
    if(isMessageForCurrentDialog(userId, msg.dialog_id)){
       showMessage(userId, msg, messageAttachmentFileId);
    }

    updateDialogsList(msg.dialog_id, msg.body);
  }
}

// sending messages after confirmation
function clickSendMessage() {
  var currentText = $('#message_text').val().trim();
  $('#message_text').val('').focus();
  if (currentText.length == 0){
    return;
  }
  sendMessage(currentText, null);
}

function clickSendAttachments(inputFile) {
  // upload image
  QB.content.createAndUpload({name: inputFile.name, file: inputFile, type: inputFile.type, size: inputFile.size, 'public': false}, function(err, response){
    if (err) {
      console.log(err);
    } else {
      $("#progress").fadeOut(400);
      var uploadedFile = response;

      sendMessage("[attachment]", uploadedFile.id);

      inputFile = '';
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

// add photo to dialogs
function getDialogIcon (dialogType, dialogPhoto) {
  var withPhoto    = '<img src="http://api.quickblox.com/blobs/'+dialogPhoto+'/download.xml?token='+token+'" width="30" height="30" class="round">';
  var withoutPhoto = '<img src="images/ava-group.svg" width="30" height="30" class="round">';
  var privatPhoto  = '<img src="images/ava-single.svg" width="30" height="30" class="round">';
  var defaultPhoto = '<span class="glyphicon glyphicon-eye-close"></span>'
  
  var dialogIcon;
  switch (dialogType) {
    case 1:
      dialogIcon = dialogPhoto ? withPhoto : withoutPhoto;
      break;
    case 2:
      dialogIcon = dialogPhoto ? withPhoto : withoutPhoto;
      break;
    case 3:
    	dialogIcon = dialogPhoto ? withPhoto : privatPhoto;
      break;
    default:
      dialogIcon = defaultPhoto;
      break;
  }
  return dialogIcon;
}

// show unread message count and new last message
function updateDialogsList(DialogId, text){

  // update unread message count
  badgeCount = $('#'+DialogId+' .badge').html();
  $('#'+DialogId+'.list-group-item.inactive .badge').text(parseInt(badgeCount)+1).fadeIn(500);

  // update last message
  $('#'+DialogId+' .list-group-item-text').text(text);
}

// show messages in UI
function showMessage(userId, msg, attachmentFileId) {
  // add a message to list
  var userLogin = getUserById(userId);
  var messageHtml = buildMessageHTML(msg.body, userLogin, new Date(), attachmentFileId, msg.id);

  $('#messages-list').append(messageHtml);

  // scroll to bottom
  var mydiv = $('#messages-list');
  mydiv.scrollTop(mydiv.prop('scrollHeight'));
  $("#no-messages-label").addClass('hide');
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
	  	var userLogin = getUserById(userId);
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
	} else {
		return false;
	}
}

function getUserById(byId) {
	var userLogin;
	if (users[byId]) {
		userLogin = users[byId].login;
		return userLogin;
	}
}