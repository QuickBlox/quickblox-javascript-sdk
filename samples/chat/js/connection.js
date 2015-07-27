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
});
// connect to chat with logining
function connectChat(user) {
  $('#loginForm button').hide();
  $('#loginForm .progress').show();
  // Create session and connect to chat
  QB.createSession({login: user.login, password: user.pass}, function(err, res) {
    if (res) {
          token = res.token;
          user_id = res.id;
          uploadPages = 450;
          usersCount = 0;
          finished = false;
          dlg_type = '';
          dlg_users = '';
          users_ids = [];
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