
$('#ready_to_delete').hide();
//
function setupUsersScrollHandler(){
  // uploading users scroll event
  $('.list-group.pre-scrollable.for-scroll').scroll(function() {
    if  ($('.list-group.pre-scrollable.for-scroll').scrollTop() == $('#users_list').height() - $('.list-group.pre-scrollable.for-scroll').height()){

      // get and show users
      retrieveUsersForDialogCreation(function(users) {
        $.each(users, function(index, item){
          showUsers(this.user.login, this.user.id);
        });
      });
    }
  });
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

  // get and show users
  retrieveUsersForDialogCreation(function(users) {
    $.each(users, function(index, item){
      showUsers(this.user.login, this.user.id);
    });
  });

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
  var usersIds = [];
  var usersNames = [];

  $('.users_form.active').each(function(index) {
    usersIds[index] = $(this).attr('id');
    usersNames[index] = $(this).text();
  });

  $("#add_new_dialog").modal("hide");
  $('#add_new_dialog .progress').show();

  var dialogName;
  var dialogOccupants;
  var dialogType;

  if (usersIds.length > 1) {
    dialogName = currentUser.login+', '+usersNames.join(', ');
    dialogOccupants = usersIds.join(',');
    dialogType = 2;
  } else {
    dialogOccupants = usersIds.join(',');
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
      console.log("Dialog created with users: " + dialogOccupants);

      joinToNewDialogAndShow(createdDialog);

      notifyOccupants(createdDialog.occupants_ids, createdDialog._id);

      triggerDialog($('#dialogs-list').children()[0], createdDialog._id);

      $('a.users_form').removeClass('active');
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
       console.log("Joined dialog: " + dialogId);
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
          _id: newDialogId
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

// show modal window with dialog's info
function showDialogInfoPopup() {
  $("#update_dialog").modal("show");
  $('#update_dialog .progress').hide();

  // shwo current dialog's occupants
  showDialogOccupants(currentDialog.occupants_ids);

  // get users to add to dialog
  retrieveUsersForDialogUpdate(function(users){
    $.each(users, function(index, item){
      var userHtml = buildUserHtml(this.user.login, this.user.id);
      $('#add_new_occupant').append(userHtml);
    });
  });

  setupScrollHandlerForNewOccupants();

  if (currentDialog.type == 3) {
    $('.dialog-type-info').text('').append('<b>Dialog type: </b>privat chat');
    $('.new-info').hide();
    $('.push').hide();
    $('#push_usersList').hide();
    $('#leave-dialog').hide();
    $('#update-dialog').hide();
  } else {
    $('.dialog-type-info').text('').append('<b>Dialog type: </b>group chat');
    $('.new-info').show();
    $('.push').show();
    $('#push_usersList').show();
    $('#leave-dialog').show();
    $('#update-dialog').show();
  }
}

// show information about the occupants for current dialog
function showDialogOccupants(users) {
  var logins = [];

  users.forEach(function(item, index) {
    login = getUserById(item);
    logins[index] = login;
  });
    $('#all_occupants').text('');
    $('#all_occupants').append('<b>Occupants: </b>'+logins.join(', '));
}


function setupScrollHandlerForNewOccupants() {
  // uploading users scroll event
  $('#push_usersList').scroll(function() {
    if  ($('#push_usersList').scrollTop() == $('#add_new_occupant').height() - $('#push_usersList').height()){

      retrieveUsersForDialogUpdate(function(users){
        $.each(users, function(index, item){
          var userHtml = buildUserHtml(this.user.login, this.user.id);
          $('#add_new_occupant').append(userHtml);
        });
      });

    }
  });
}

// for dialog update
function onDialogUpdate() {
  var pushOccupants  = [];

  $('.users_form.active').each(function(index) {
    pushOccupants[index] = $(this).attr('id');
  });

  var dialogPhoto = $('#set-new-photo').val().trim();
  var dialogName  = $('#rename-dialog').val().trim();

  var toUpdate;
  if (currentDialog.type == 3) {
    toUpdate = {photo: dialogPhoto};
  } else {
    toUpdate = {
      photo:    dialogPhoto,
      name:     dialogName,
      push_all: {occupants_ids: pushOccupants}
    };
  }

  QB.chat.dialog.update(currentDialog._id, toUpdate, function(err, res) {
    if (err) {
      console.log(err);
    } else {
      console.log("Dialog updated");

      $('#'+res._id).remove();

      pastDialogUI(res, true);
      $('#'+res._id).removeClass('inactive').addClass('active');
    }
  });

  $("#update_dialog").modal("hide");
  $('#set-new-photo').val('');
  $('#rename-dialog').val('');
  $('.users_form').removeClass("active");
}

// delete currend dialog
function onDialogDelete() {
  if (confirm("Are you sure you want remove the dialog?")) {
    QB.chat.dialog.delete(currentDialog._id, function(err, res) {
      if (err) {
        console.log(err);
      } else {
        console.log("Dialog removed");
        $('#'+currentDialog._id).remove();
      }
    });

    $("#update_dialog").modal("hide");
    $('#update_dialog .progress').show();
  }
}
