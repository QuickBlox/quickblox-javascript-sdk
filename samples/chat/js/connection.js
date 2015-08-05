// Init QuickBlox application here
QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret, config);

var jid_uid;
var currentDialog;
var currentUser;
    dialogs = {};
    users = {};

$(document).ready(function() {

  $("#loginForm").modal("show");
  $('#loginForm .progress').hide();
  
  // User1 login action
  //
  $('#user1').click(function() {
    currentUser = QBUser1;
    connectToChat(QBUser1);
  });
  
  // User2 login action
  //
  $('#user2').click(function() {
    currentUser = QBUser2;
    connectToChat(QBUser2);
  });
});


function connectToChat(user) {
  $('#loginForm button').hide();
  $('#loginForm .progress').show();

  // Create session and connect to chat
  //
  QB.createSession({login: user.login, password: user.pass}, function(err, res) {
    if (res) {
      // save session token
      token = res.token;

      QB.chat.connect({userId: user.id, password: user.pass}, function(err, roster) {
        if (err) {
          console.log(err);
        } else {
          
          // Set message and isTyping listeners
          //
          QB.chat.onMessageListener = onMessage;
          QB.chat.onMessageTypingListener = onMessageTyping;

          // setup 'isTyping' events handler
          //
          setupIsTypingHandler();

          // Load chat dialogs
          //
          retrieveChatDialogs();
        }
      });
    }
  });

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
              inputFile = '';
            });
          });
        }
      });
  }
}