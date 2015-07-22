
// Init QuickBlox application here
QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret, config);

var dialogs = {};
var users = {};

var currentDialog;
var currentUser;

var token;

$(document).ready(function() {

  $("#loginForm").modal("show");
  $('#loginForm .progress').hide();
  // User1 login action
  $('#user1').click(function() {
    currentUser = QBUser1;
    connectChat(QBUser1);
  });
  // User2 login action
  $('#user2').click(function() {
    currentUser = QBUser2;
    connectChat(QBUser2);
  });
  // User3 login action
  $('#user3').click(function() {
    currentUser = QBUser3;
    connectChat(QBUser3);
  });
  // User4 login action
  $('#user4').click(function() {
    currentUser = QBUser4;
    connectChat(QBUser4);
  });
});

function connectChat(user) {

  $('#loginForm button').hide();
  $('#loginForm .progress').show();

  // Create session and connect to chat
  QB.createSession({login: user.login, password: user.pass}, function(err, res) {
    if (res) {
          token = res.token;
          user_id = res.id;
      QB.chat.connect({userId: user.id, password: user.pass}, function(err, roster) {
        if (err) {
          console.log(err);
        } else {
          console.log(roster);

          QB.chat.onMessageListener = onMessage;
          // Load chat dialogs
          QB.chat.dialog.list(null, function(err, resDialogs) {
            if (err) {
              console.log(err);
            } else {
              var occupantsIds = [];  
              // repackage dialogs data
              resDialogs.items.forEach(function(item, i, arr) {
                var dialogId = item._id;
                dialogs[dialogId] = item;
                // collect all occupants ids
                item.occupants_ids.map(function(userId) {
                  occupantsIds.push(userId);
                });
              });
              // Load all dialogs' users
              var params = {filter: { field: 'id', param: 'in', value: jQuery.unique(occupantsIds) }};
              QB.users.listUsers(params, function(err, result){
                if (result) {
                  result.items.forEach(function(item, i, arr) {
                    users[item.user.id] = item.user;
                  });
                  // show dialogs
                  resDialogs.items.forEach(function(item, i, arr) {
                    var dialogId = item._id;
                    var dialogName = item.name;
                    var dialogLastMessage = item.last_message;
                    var dialogUnreadMessagesCount = item.unread_messages_count;

                    whatTypeChat(item.type, item.occupants_ids, user.id, item.photo);
                      if (dialogName == null) {
                        dialogName = chatName;
                      }

	                  var dialogHtml = '<a href="#" class="list-group-item" onclick="triggerDialog(this, ' + "'" + dialogId + "'" + ')">' + 
	                    (dialogUnreadMessagesCount == 0 ? "" : ('<span class="badge">' + dialogUnreadMessagesCount + '</span>')) + 
	                    '<h4 class="list-group-item-heading">' + dialogIcon + '&nbsp;&nbsp;&nbsp;' + dialogName + '</h4>' + 
	                    '<p class="list-group-item-text">' + (dialogLastMessage === null ?  "" : dialogLastMessage) + '</p>' + 
	                    '</a>';

	                  	$('#dialogs-list').append(dialogHtml);
                  });
                  // trigger 1st dialog
                  triggerDialog($('#dialogs-list').children()[0], resDialogs.items[0]._id);
                } else {
                  
                }

                $("#loginForm").modal("hide");

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
      });
    }
  });
}
// Choose dialog
function triggerDialog(element, dialogId){
  // deselect
  var kids = $( "#dialogs-list" ).children();
  kids.removeClass("active");
  // select
  element.className = element.className + " active";

  currentDialog = dialogs[dialogId];
  // join in room
  if (currentDialog.type != 3) {
    QB.chat.muc.join(currentDialog.xmpp_room_jid, function() {
    	console.log('join to: ' + currentDialog.xmpp_room_jid);
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
        });
      }
    } else {
    
    }
  });
}

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
  		inputFile = null;
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
    getRecipientId(currentDialog.occupants_ids, currentUser.id);
    QB.chat.send(userId, msg);
      if(attachmentFileId == null){
        showMessage(currentUser.id, msg);
      } else {
			  showMessage(currentUser.id, msg, attachmentFileId);
      }
  } else {
    QB.chat.send(currentDialog.xmpp_room_jid, msg);
    	console.log(currentDialog.xmpp_room_jid);
  }
}

function onMessage(userId, msg){
	var messageAttachmentFileId = null;
		if (msg.extension.hasOwnProperty("attachments")) {
			if(msg.extension.attachments.length > 0) {
				messageAttachmentFileId = msg.extension.attachments[0].id;
			}
		}
	showMessage(userId, msg, messageAttachmentFileId);
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

function buildMessageHTML(messageText, messageSenderId, messageDateSent, attachmentFileId){
	var messageAttach;
  if(attachmentFileId){
	  messageAttach = "<img src='http://api.quickblox.com/blobs/"+attachmentFileId+"/download.xml?token="+token+"' alt='attachment' class='attachments img-responsive' />"
  }

  var messageHtml = '<div class="list-group-item">' + 
                    '<time datetime="' + messageDateSent + '" class="pull-right">' + jQuery.timeago(messageDateSent) + '</time>' + 
                    '<h4 class="list-group-item-heading">' + messageSenderId + '</h4>' + 
                    '<p class="list-group-item-text">' + (messageAttach ? messageAttach : messageText) + '</p>' + 
                    '</div>';
  return messageHtml;
}

function getRecipientId(occupantsIds, currentUserId){
  occupantsIds.forEach(function(item, i, arr) {
    if(item != currentUserId){
      userId = item;
    }  
  });
}

function whatTypeChat (itemType, occupantsIds, itemId, itemPhoto) {
  var withPhoto    = '<img src="http://api.quickblox.com/blobs/'+itemPhoto+'/download.xml?token='+token+'" width="30" height="30" class="round">';
      withoutPhoto = '<img src="https://qm.quickblox.com/images/ava-group.svg" width="30" height="30" class="round">';
      privatPhoto  = '<img src="https://qm.quickblox.com/images/ava-single.svg" width="30" height="30" class="round">';
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