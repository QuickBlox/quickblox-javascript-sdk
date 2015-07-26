// Init QuickBlox application here
QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret, config);

var dialogs = {};
var users = {};

var currentDialog;
var currentUser;

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
//
function connectChat(user) {
  $('#loginForm button').hide();
  $('#loginForm .progress').show();
  // Create session and connect to chat
  QB.createSession({login: user.login, password: user.pass}, function(err, res) {
    if (res) {
          token = res.token;
          user_id = res.id;
          uploadPages = 0;
          usersCount = 0;
          finished = false;
      QB.chat.connect({userId: user.id, password: user.pass}, function(err, roster) {
        if (err) {
          console.log(err);
        } else {
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

                      var dialogHtml = buildDialogHtml(dialogId, dialogUnreadMessagesCount, dialogIcon, dialogName, dialogLastMessage);
                    
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
                    inputFile = '';
                });
                // uploading users scroll event
                $('.list-group.pre-scrollable.for-scroll').scroll(function() {
                  if  ($('.list-group.pre-scrollable.for-scroll').scrollTop() == $('#users_list').height() - $('.list-group.pre-scrollable.for-scroll').height()){
                    retrieveUsers();
                  }
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
    } else {
    
    }
  });
}
//
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
    getRecipientId(currentDialog.occupants_ids, currentUser.id);
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
}
//
function onMessage(userId, msg){
  var messageAttachmentFileId = null;
    if (msg.extension.hasOwnProperty("attachments")) {
      if(msg.extension.attachments.length > 0) {
        messageAttachmentFileId = msg.extension.attachments[0].id;
      }
    }

  showMessage(userId, msg, messageAttachmentFileId);

  newLastMessage(msg.extension.dialog_id, msg.body);

  newUnreadMessage(msg.extension.dialog_id);
}
//
function newLastMessage(DialogId, text){
  $('#'+DialogId+' .list-group-item-text').text(text);
}
//
function newUnreadMessage(DialogId) {
  badgeCount = $('#'+DialogId+' .badge').html();
  $('#'+DialogId+'.list-group-item.inactive .badge').text(parseInt(badgeCount)+1).fadeIn(500); 
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
//
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
//
function buildDialogHtml(dialogId, dialogUnreadMessagesCount, dialogIcon, dialogName, dialogLastMessage) {
  var UnreadMessagesCountShow = '<span class="badge">'+dialogUnreadMessagesCount+'</span>';
      UnreadMessagesCountHide = '<span class="badge" style="display: none;">'+dialogUnreadMessagesCount+'</span>';

  var dialogHtml = '<a href="#" class="list-group-item" id='+'"'+dialogId+'"'+' onclick="triggerDialog(this, '+"'"+dialogId+"'"+')">'+ 
                   (dialogUnreadMessagesCount == 0 ? UnreadMessagesCountHide : UnreadMessagesCountShow)+'<h4 class="list-group-item-heading">'+
                   dialogIcon+'&nbsp;&nbsp;&nbsp;'+dialogName+'</h4>'+'<p class="list-group-item-text last-message">'+
                   (dialogLastMessage === null ?  "" : dialogLastMessage)+'</p>'+'</a>';
  return dialogHtml;
} 
// get oponent ID
function getRecipientId(occupantsIds, currentUserId){
  occupantsIds.forEach(function(item, i, arr) {
    if(item != currentUserId){
      userId = item;
    }  
  });
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
// show modal window with users
function createNewDialog() {
  $("#add_new_dialog").modal("show");
  $('#add_new_dialog .progress').hide();

  retrieveUsers();
}
// show users list
function showUsers(userLogin, userId) {
  var userHtml = "<a href='#' id='"+userId+"' class='users_form col-md-12 col-sm-12 col-xs-12' onclick='clickToAdd()'>"+userLogin+"</a>";
    $('#users_list').append(userHtml);
}
// show users list
function retrieveUsers() {
  if (finished != true) {
    $("#load-users").show(0);
    uploadPages = uploadPages + 1;

    QB.users.listUsers({page: uploadPages, per_page: '10'}, function(err, result) {
      if (err) {
        console.log(err);
      } else {
        $.each(result.items, function(index, item){
          console.log(this.user.id);
          showUsers(this.user.login, this.user.id);
        });

        console.log(result);
        $("#load-users").delay(100).fadeOut(500);

        var totalEntries = result.total_entries;
        entries = result.items.length;
        usersCount = usersCount + entries;

        if (usersCount >= totalEntries) {
          finished = true;
        }
      }
    });
  }
}
// select users from users list
function clickToAdd() {
  $('a.users_form:focus').addClass('active');
  var dlg_type = 1;
      dlg_users = 0;
      dlg_name = '';
      ids = [];
      
  $(".users_form.active").each(function(index) {
    ids[index] = $(this).attr('id');
    if (ids.length < 1) {
      dlg_type = 1;
      dlg_users = null;
      dlg_name = 'PABLIC CHAT';
    } if (ids.length > 1) {
      $('#dlg_name').fadeIn(500);
      dlg_users = ids.join(',');
      dlg_type = 2;
      dlg_name = 'GROUP CHAT';
    } else {
      $('#dlg_name').fadeOut(500);
      dlg_users = ids.join(',');
      dlg_type = 3;
      dlg_name = '';
    }
    console.log(dlg_users);
  });

    $("#add-dialog").click(function(event){
      event.preventDefault();
      addNewDialog(dlg_type, dlg_users);
    });
}
// create new dialog
function addNewDialog(dlg_type, dlg_users) {
  $("#add_new_dialog").modal("hide");
  $('#add_new_dialog .progress').show();

  var dlg_params = {
    type: dlg_type,
    occupants_ids: dlg_users,
    name: $('#dlg_name').val().trim()
  };
  console.log(dlg_params);
  QB.chat.dialog.create(dlg_params, function(err, res) {
    if (err) {
      console.log(err);
    } else {
      console.log(res);
      whatTypeChat (res.type, res.occupants_ids, res.user_id, res.photo);
        if (res.name == null) {
          dialogName = chatName;
        }
      var dialogHtml = buildDialogHtml(res._id, 0, dialogIcon, dialogName, res.last_message);
      $('#dialogs-list').prepend(dialogHtml);

    }
  });

  $('#dlg_name').hide(0);
  $('a.users_form:focus').removeClass('active');
}
