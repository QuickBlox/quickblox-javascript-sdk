var uploadPages     = 0;
    usersCount      = 0;
    users_ids       = [];
    users_names     = [];
    finished        = false;
    pushUploadPages = 0;
    pushUsersCount  = 0;
    push_occupants  = [];
    selectedMsg     = undefined;

//
function setupUsersScrollHandler(){
  // uploading users scroll event
  $('.list-group.pre-scrollable.for-scroll').scroll(function() {
    if  ($('.list-group.pre-scrollable.for-scroll').scrollTop() == $('#users_list').height() - $('.list-group.pre-scrollable.for-scroll').height()){
      retrieveUsers();
    }
  });
}

//
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
        console.log(result);
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

//
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
    dialogOccupants = users_ids.join(',');
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
  QB.chat.dialog.create(params, function(err, createdDialog) {
    if (err) {
      console.log(err);
    } else {
      var newUsers = {};

      params = {filter: {field: 'id', param: 'in', value: createdDialog.occupants_ids}};
      QB.users.listUsers(params, function(err, result){
        if (result) {
          result.items.forEach(function(item, i, arr) {
            newUsers[item.user.id] = item.user;
          });
          console.log(newUsers);
          users = $.extend(users, newUsers);
          console.log(users);
        }

        joinToNewDialogAndShow(createdDialog);

        notifyOccupants(createdDialog.occupants_ids, createdDialog._id);

        triggerDialog($('#dialogs-list').children()[0], createdDialog._id);

        users_ids = [];
        $('a.users_form').removeClass('active');
      });
    }
  });
}

//
function joinToNewDialogAndShow(itemDialog) {
  var dialogId = itemDialog._id;
  var dialogName = itemDialog.name;
  var dialogLastMessage = itemDialog.last_message;
  var dialogUnreadMessagesCount = itemDialog.unread_messages_count;
  var dialogIcon = getDialogIcon(itemDialog.type, itemDialog.photo);
      
  // save dialog to local storage 
  dialogs[dialogId] = itemDialog;

  // join if it's a group dialog
  if (itemDialog.type != 3) {
    QB.chat.muc.join(itemDialog.xmpp_room_jid, function() {
       console.log("Joined dialog " + dialogId);
    });
    opponentLogin = null;
  } else {
    opponentId = QB.chat.helpers.getRecipientId(itemDialog.occupants_ids, currentUser.id);
    opponentLogin = getUserById(opponentId);
    dialogName = chatName = 'Dialog with ' + opponentLogin;
  }

  // show it
  var dialogHtml = buildDialogHtml(dialogId, dialogUnreadMessagesCount, dialogIcon, dialogName, dialogLastMessage);
  $('#dialogs-list').prepend(dialogHtml);
}

//
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

//
function getAndShowNewDialog(newDialogId) {
  QB.chat.dialog.list({_id: newDialogId}, function(err, res) {
    if (err) {
      console.log(err);
    } else {
      joinToNewDialogAndShow(res.items[0])
    }
  });
}

// show modal window with users
function showUpdateDialogPopup() {
  $("#update_dialog").modal("show");
  $('#update_dialog .progress').hide();

  retrievePushUsers();

  forPushOccupantsScrollHandler();

  if (currentDialog.type == 3) {
    $('.dialog-type-info').text('').append('Dialog type: privat chat');
    $('#rename-dialog').hide();
    $('.push').hide();
    $('#push_usersList').hide();
    $('#leave-dialog').hide();
  } else {
    $('.dialog-type-info').text('').append('Dialog type: group chat');
    $('#rename-dialog').show();
    $('.push').show();
    $('#push_usersList').show();
    $('#leave-dialog').show();
  }
}

function forPushOccupantsScrollHandler() {
  // uploading users scroll event
  $('#push_usersList').scroll(function() {
    if  ($('#push_usersList').scrollTop() == $('#add_new_occupant').height() - $('#push_usersList').height()){
      retrievePushUsers();
    }
  });
}

function retrievePushUsers() {
  if (!finished) {

    pushUploadPages = pushUploadPages + 1;

    // Load users, 10 per request
    QB.users.listUsers({page: pushUploadPages, per_page: '10'}, function(err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
        $.each(result.items, function(index, item){
          var userHtml = buildUserHtml(this.user.login, this.user.id);
          $('#add_new_occupant').append(userHtml);
        });       

        var totalEntries    = result.total_entries;
            entries         = result.items.length;
            pushUsersCount  = pushUsersCount + entries;

        if (pushUsersCount >= totalEntries) {
          finished = true;
        }
      }
    });
  }
} 

function onDialogUdate(iLeave) {
  $('.users_form.active').each(function(index) {
    push_occupants[index] = $(this).attr('id');
  });

  if (iLeave == true) {
    $('#'+currentDialog._id).remove();
    var toUpdate = {pull_all: {occupants_ids: [currentUser.id]}};
    console.log(toUpdate);
  } else {
    var dialogPhoto = $('#set-new-photo').val().trim();
    var dialogName  = $('#rename-dialog').val().trim();
    var toUpdate    = {
      photo:    $('#set-new-photo').val('') ? dialogPhoto : currentDialog.photo,
      name:     $('#rename-dialog').val('') ? dialogName : currentDialog.name,
      push_all: {occupants_ids: [push_occupants]}
    };
    console.log(toUpdate);
  }

  console.log(dialogPhoto);
  console.log(dialogName);
  console.log(push_occupants);

  QB.chat.dialog.update(currentDialog._id, toUpdate, function(err, res) {
    if (err) {
      console.log(err);
    } else {
      console.log(res);

      $('#'+res._id).remove();

      if (!iLeave) {
        var dialogIcon = getDialogIcon (res.type, res.photo);
        var updatedDialogHtml = buildDialogHtml(res._id, res.unread_messages_count, dialogIcon, res.name, res.last_message);
        $('#dialogs-list').prepend(updatedDialogHtml);
      }  
    }
  });

  $("#update_dialog").modal("hide");
  $('#update_dialog .progress').show();

    dialogPhoto = '';
    dialogName = '';
    push_occupants = [];

  console.log(dialogPhoto);
  console.log(dialogName);
  console.log(push_occupants);
}

function onDeleteDialog() {
  QB.chat.dialog.delete(currentDialog._id, function(err, res) {
    if (err) {
      console.log(err);
    } else {
      console.log(res);
      $('#'+currentDialog._id).remove();
    }
  });

  $("#update_dialog").modal("hide");
  $('#update_dialog .progress').show();
}

// select message from messages list
function clickToAddMsg(messageId) {
  console.log(messageId);
  if ($('#'+messageId).hasClass("active")) {
    $('#'+messageId).removeClass("active");
  } else {
    $('#'+messageId).addClass("active");
  }
  console.log($('.list-group-item.active').attr('id'));
}

function deleteFocusMessage() {
  if ('.list-group-item.active') {
    selectedMsg = $('.list-group-item.active').attr('id');
  }

  QB.chat.message.delete(selectedMsg, function(err, res) {
    if (err) {
      console.log(err);
    } else {
      console.log(res);
      $('#'+messageId).remove();
    }
  }); 
}