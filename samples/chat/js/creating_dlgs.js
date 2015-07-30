var uploadPages = 0;
    dlg_type    = '';
    dlg_users   = '';
    users_ids   = [];
    users_names = [];
    finished    = false;
    usersCount = 0;

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
            entries      = result.items.length;
            usersCount   = usersCount + entries;

        if (usersCount >= totalEntries) {
          finished = true;
        }
      }
    });
  }
}
// show users list
function showUsers(userLogin, userId) {
  var userHtml = "<a href='#' id='"+userId+"' class='col-md-12 col-sm-12 col-xs-12 users_form' onclick='clickToAdd("+userId+")'>"+userLogin+"</a>";
    $('#users_list').append(userHtml);
}
// show modal window with users
function createNewDialog() {
  $("#add_new_dialog").modal("show");
  $('#add_new_dialog .progress').hide();

  retrieveUsers();
}
// select users from users list
function clickToAdd(forFocus) {
  if ($('#'+forFocus).hasClass("active")) {
    $('#'+forFocus).removeClass("active");
    console.log(forFocus);
  } else {
    $('#'+forFocus).addClass("active");
    console.log(forFocus);
  }
}
// create new dialog
function addNewDialog() {
  $('.users_form.active').each(function(index) {
    users_ids[index] = $(this).attr('id');
    users_names[index] = $(this).text();
    console.log(users_ids.join(', '));
  });

  $("#add_new_dialog").modal("hide");
  $('#add_new_dialog .progress').show();

  var dlg_name = $('#dlg_name').val().trim();
  
  if (users_ids.length == 0) {
    dlg_name = 'QB public chat';
    dlg_type = 1;
  } if (users_ids.length > 1) {
    dlg_name = (dlg_name == '' ? users_names.join(', ') : $('#dlg_name').val().trim());
    dlg_users = users_ids.join(',');
    dlg_type = 2;
  } else {
    dlg_users = users_ids.join(',');
    dlg_type = 3;
  }

  var dlg_params = {
    type: dlg_type,
    occupants_ids: dlg_users,
    name: dlg_name
  };

  console.log(dlg_params);
  QB.chat.dialog.create(dlg_params, function(err, res) {
    if (err) {
      console.log(err);
    } else {
      console.log(res);

      if (dlg_name == '') {
        dlg_name = chatName = 'Dialog with ' + dlg_users;
      }
      whatTypeChat (res.type, res.occupants_ids, res.user_id, res.photo);
      var dialogHtml = buildDialogHtml(res._id, 0, dialogIcon, dlg_name, res.last_message);
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