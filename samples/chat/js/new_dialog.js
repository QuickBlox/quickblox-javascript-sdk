var uploadPages = 0;
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
  var userHtml = "<a href='#' id='"+userId+"' class='col-md-12 col-sm-12 col-xs-12 users_form' onclick='clickToAdd("+userId+")'>"+userLogin+"</a>";
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

  var dialogName = $('#dlg_name').val().trim();
  var dialogOccupants;
  var dialogType;

  if (users_ids.length > 1) {
    dialogName = (dialogName == '' ? users_names.join(', ') : $('#dlg_name').val().trim());
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
  QB.chat.dialog.create(params, function(err, res) {
    if (err) {
      console.log(err);
    } else {

      if (dialogName == '') {
        dialogName = chatName = 'Dialog with ' + dialogOccupants;
      }

      whatTypeChat (res.type, res.occupants_ids, res.user_id, res.photo);

      // add new dialog to the list 
      //
      var dialogHtml = buildDialogHtml(res._id, 0, dialogIcon, dialogName, res.last_message);
      $('#dialogs-list').prepend(dialogHtml);

      var dialogId = res._id;
      dialogs[dialogId] = res;

      triggerDialog($('#dialogs-list').children()[0], res._id);

      $('#dlg_name').val('');
      $('#dlg_name').hide(0);
      users_ids = [];
      $('a.users_form').removeClass('active');
    }
  });
}