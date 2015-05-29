
// Init QuickBlox application here
//
QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret);

var dialogs = {};
var currentDialog;

var currentUser;

$(document).ready(function() {

  $("#loginForm").modal("show");
  $('#loginForm .progress').hide();

  // User1 login action
  //
  $('#user1').click(function() {
    currentUser = QBUser1;
    connectChat(QBUser1);
  });

  // User2 login action
  //
  $('#user2').click(function() {
    currentUser = QBUser2;
    connectChat(QBUser2);
  });
});

function connectChat(user) {

  $('#loginForm button').hide();
  $('#loginForm .progress').show();

  // Create session and connect to chat
  //
  QB.createSession({login: user.login, password: user.pass}, function(err, res) {
    if (res) {
      var user_jid = QB.chat.helpers.getUserJid(user.id, QBApp.appId);
      QB.chat.connect({jid: user_jid, password: user.pass}, function(err, roster) {

        if (err) {
          console.log(err);
        } else {
          console.log(roster);

          QB.chat.onMessageListener = showMessage;

          // Load chat dialogs
          //
          QB.chat.dialog.list(null, function(err, res) {
            $("#loginForm").modal("hide");

            if (err) {

            } else {
              res.items.forEach(function(item, i, arr) {
                var dialogId = item._id;
                var dialogName = item.name;
                var dialogLastMessage = item.last_message;
                var dialogUnreadMessagesCount = item.unread_messages_count; 

                dialogs[dialogId] = item;

                var dialogHtml = '<a href="#" class="list-group-item" onclick="triggerDialog(this, ' + "'" + dialogId + "'" + ')">' + 
                    '<span class="badge">' + dialogUnreadMessagesCount + '</span>' + 
                    '<h4 class="list-group-item-heading">' + dialogLastMessage + '</h4>' + 
                    '<p class="list-group-item-text">' + dialogName + '</p>' + 
                    '</a>';

                $('#dialogs-list').append(dialogHtml);
              });
            }
          });
        }
      });
    }
  });
}

function triggerDialog(element, dialogId){
  console.log(element);

  // deselect
  var kids = $( "#dialogs-list" ).children();
  kids.removeClass("active");

  // select
  element.className = element.className + " active";

  currentDialog = dialogs[dialogId];

  // Load messages history
  //
  var params = {chat_dialog_id: dialogId, sort_desc: 'date_sent', limit: 100, skip: 0};
  QB.chat.message.list(params, function(err, messages) {
    $('#messages-list').html('');

    if (messages) {
      if(messages.items.length == 0){
        $("#no-messages-label").removeClass('hide');
      }else{
        $("#no-messages-label").addClass('hide');
        
        messages.items.forEach(function(item, i, arr) {
          var messageText = item.message;
          var messageSenderId = item.sender_id;
          var messageDateSent = new Date(item.date_sent*1000);

          var messageHtml = '<div class="list-group-item">' + 
                            '<time datetime="' + messageDateSent + '" class="pull-right">' + jQuery.timeago(messageDateSent) + '</time>' + 
                            '<h4 class="list-group-item-heading">' + 'Igor Khomenko' + '</h4>' + 
                            '<p class="list-group-item-text">' + 'Hey how are you doing?' + '</p>' + 
                            '</div>';

          $('#messages-list').append(messageHtml);
        });
      }
    }else{
    
    }
  });

}

function onSendMessage(){
  var currentText = $('#message_text').val().trim();
  $('#message_text').val('').focus();
 
  if (currentText.length == 0){
    return;
  }

  // send a message
  //
  var msg = {
    type: currentDialog.type == 3 ? 'chat' : 'groupchat',
    body: currentText,
    extension: {
      save_to_history: 1,
    }
  };
  //
  if(currentDialog.type == 3){
    console.log(currentDialog.occupants_ids);

    var userId;
    currentDialog.occupants_ids.forEach(function(item, i, arr) {
      if(item != currentUser.id){
        userId = item;
      }  
    });
    QB.chat.send(userId, msg);
  }else{
    QB.chat.send(currentDialog.xmpp_room_jid, msg);
  }
  

  //showMessage(null, msg);

}


// Show messages in UI
//
function showMessage(userId, msg) {

  var body = msg.body,
      time = msg.extension && msg.extension.time,
      messageDate = new Date(time * 1000);

  var message = "\n";
      message += (userId === null ? "Me" : "Opponent");
      message += " (" + messageDate.getHours() + ':' + (messageDate.getMinutes().toString().length === 1 ? '0'+messageDate.getMinutes() : messageDate.getMinutes()) + ':' + messageDate.getSeconds() + ")";
      message +=  ": ";
      message += body;

  var currentText = $('#feed').val();
  $('#feed').val(currentText + message); 
}

function getLocalTime() {
  return (new Date).toTimeString().split(' ')[0];
}
