var uploadPages = 455;
    users_ids   = [];
    users_names = [];
    finished    = false;
    usersCount = 0;

function setupUsersScrollHandler(){
  // uploading users scroll event
  $('.list-group.pre-scrollable.for-scroll').scroll(function() {
    if  ($('.list-group.pre-scrollable.for-scroll').scrollTop() == $('#users_list').height() - $('.list-group.pre-scrollable.for-scroll').height()){
      retrieveUsers();
    }
  });
}

function retrieveUsers() {
  if (!finished) {

    $("#load-users").show(0);
    uploadPages = uploadPages + 1;

    // Load users, 10 per request
    //
    QB.users.listUsers({page: uploadPages, per_page: '10'}, function(err, result) {
      if (err) {
        console.log(err);
      } else {
        $.each(result.items, function(index, item){
          showUsers(this.user.login, this.user.id);
        });

        $("#load-users").delay(100).fadeOut(500);

        var totalEntries = result.total_entries;
            entries      = result.items.length;
            usersCount   = usersCount + entries;

        if (usersCount >= totalEntries) {
          finished = true;
        }
      }
    });
  }
}

function showUsers(userLogin, userId) {
  var userHtml = buildUserHtml(userLogin, userId);
  $('#users_list').append(userHtml);
}

// show modal window with users
function showNewDialogPopup() {
  $("#add_new_dialog").modal("show");
  $('#add_new_dialog .progress').hide();

  retrieveUsers();

  setupUsersScrollHandler();
}

// select users from users list
function clickToAdd(forFocus) {
  if ($('#'+forFocus).hasClass("active")) {
    $('#'+forFocus).removeClass("active");
  } else {
    $('#'+forFocus).addClass("active");
  }
}

// create new dialog
function createNewDialog() {
  $('.users_form.active').each(function(index) {
    users_ids[index] = $(this).attr('id');
    users_names[index] = $(this).text();
  });

  $("#add_new_dialog").modal("hide");
  $('#add_new_dialog .progress').show();

  var dialogName;
  var dialogOccupants;
  var dialogType;

  if (users_ids.length > 1) {
    dialogName = currentUser.login+', '+users_names.join(', ');
    dialogOccupants = currentUser.id+','+users_ids.join(',');
    dialogType = 2;
  } else {
    dialogOccupants = users_ids.join(',');
    dialogType = 3;
  }

  var params = {
    type: dialogType,
    occupants_ids: dialogOccupants,
    name: dialogName
  };

  // create a dialog
  //
  QB.chat.dialog.create(params, function(err, res) {
    if (err) {
      console.log(err);
    } else {
      console.log(res);
      var dialogId = res._id;
      var dialogName = res.name;
      var dialogLastMessage = res.last_message;
      var dialogUnreadMessagesCount = res.unread_messages_count;
          dialogs[dialogId] = res;

      var dialogIcon = getDialogIcon(res.type, res.photo);

      notifyOccupants(res.occupants_ids, res._id);

      if (dialogId.type != 3) {
        QB.chat.muc.join(res.xmpp_room_jid, function() {
           console.log("Joined dialog " + dialogId);
        });
        opponentId = null;
      } else {
        opponentId = QB.chat.helpers.getRecipientId(res.occupants_ids, currentUser.id);
        dialogName = chatName = 'Dialog with ' + opponentId;
      }

      showDialogInTheList(dialogId, dialogUnreadMessagesCount, dialogIcon, dialogName, dialogLastMessage);

      triggerDialog($('#dialogs-list').children()[0], res._id);

      users_ids = [];
      $('a.users_form').removeClass('active');
    }
  });
}

// add new dialog to the list 
//
function showDialogInTheList(dialogId, dialogUnreadMessagesCount, dialogIcon, dialogName, dialogLastMessage) {
  var dialogHtml = buildDialogHtml(dialogId, dialogUnreadMessagesCount, dialogIcon, dialogName, dialogLastMessage);
  $('#dialogs-list').prepend(dialogHtml);
}

function notifyOccupants(dialogOccupants, newDialogId) {
  dialogOccupants.forEach(function(itemOccupanId, i, arr) {
    if (itemOccupanId != currentUser.id) {
    
      var msg = {
        type: 'chat',
        extension: {
          notification_type: 1,
          _id: newDialogId,
        }, 
      };

      QB.chat.send(itemOccupanId, msg);
    }
  });
}

function getAndShowNewDialog(newDialogId) {
  QB.chat.dialog.list({_id: newDialogId}, function(err, res) {
    if (err) {
      console.log(err);
    } else {
      console.log(res.items[0]);
      var newItem = res.items[0];
      var dialogId = newItem._id;
      var dialogName = newItem.name;
      var dialogLastMessage = newItem.last_message;
      var dialogUnreadMessagesCount = newItem.unread_messages_count;
          dialogs[dialogId] = newItem;

      var dialogIcon = getDialogIcon(newItem.type, newItem.photo);

      if (newItem.type != 3) {
        QB.chat.muc.join(newItem.xmpp_room_jid, function() {
           console.log("Joined dialog " + newDialogId);
        });
        opponentId = null;
      } else {
        opponentId = QB.chat.helpers.getRecipientId(newItem.occupants_ids, currentUser.id);
        dialogName = chatName = 'Dialog with ' + opponentId;
      }

        showDialogInTheList(dialogId, dialogUnreadMessagesCount, dialogIcon, dialogName, dialogLastMessage);
    }
  });
}