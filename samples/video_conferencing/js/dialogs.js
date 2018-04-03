var dialogs = {};

function onSystemMessageListener(message) {
    if (!message.delay) {
        switch (message.extension.notification_type) {
            case "1":
                // This is a notification about dialog creation
                getAndShowNewDialog(message.extension.dialog_id);
                break;
            case "2":
                // This is a notification about dialog update
                if (message.extension.video_chat) {
                    getAndUpdateDialog(message.extension.dialog_id, true);
                } else {
                    getAndUpdateDialog(message.extension.dialog_id);
                }
                break;
            case "3":
                // This is a notification when dialog's owner kicked you
                kicked(message.extension.dialog_id);
                break;
            default:
                break;
        }
    }
}

function retrieveChatDialogs() {
    QB.chat.dialog.list(null, function(err, resDialogs) {
        if (err) {
            console.error(err);
        } else {
            // repackage dialogs data and collect all occupants ids
            var occupantsIds = [];

            // hide login form
            $('#loginForm').modal('hide');

            if (resDialogs.items.length === 0) {
                // setup attachments button handler
                $("#load-img").change(function() {
                    var inputFile = $("input[type=file]")[0].files[0];

                    if (inputFile) {
                        $("#progress").show(0);
                    }

                    clickSendAttachments(inputFile);
                });

                return;
            }

            resDialogs.items.forEach(function(item, i, arr) {
                var dialogId = item._id;
                dialogs[dialogId] = item;

                // join room
                if (item.type != 3) {
                    QB.chat.muc.join(item.xmpp_room_jid, function() {
                        console.info('Joined dialog ' + dialogId);
                    });
                }

                item.occupants_ids.map(function(userId) {
                    occupantsIds.push(userId);
                });
            });

            // load dialogs' users
            updateDialogsUsersStorage(jQuery.unique(occupantsIds), function() {
                // show dialogs
                resDialogs.items.forEach(function(item, i, arr) {
                    showOrUpdateDialogInUI(item, false);
                });

                // and trigger the 1st dialog
                triggerDialog(resDialogs.items[0]._id);

                // setup attachments button handler
                $("#load-img").change(function() {
                    var inputFile = $("input[type=file]")[0].files[0];

                    if (inputFile) {
                        $("#progress").show(0);
                        $(".input-group-btn_change_load").addClass("visibility_hidden");
                    }

                    clickSendAttachments(inputFile);
                });
            });
        }
    });
}

function showOrUpdateDialogInUI(itemRes, updateHtml) {
    var dialogId = itemRes._id;
    var dialogName = itemRes.name;
    var dialogType = itemRes.type;
    var dialogLastMessage = itemRes.last_message;
    var dialogUnreadMessagesCount = itemRes.unread_messages_count;
    var dialogIcon = getDialogIcon(itemRes.type);

    if (dialogType == 3) {
        opponentId = QB.chat.helpers.getRecipientId(itemRes.occupants_ids, currentUser.id);
        opponentLogin = getUserLoginById(opponentId);
        dialogName = 'Dialog with ' + opponentLogin;
    }

    if (updateHtml === true) {
        var updatedDialogHtml = buildDialogHtml(dialogId, dialogUnreadMessagesCount, dialogIcon, dialogName, dialogLastMessage);
        $('#dialogs-list').prepend(updatedDialogHtml);
        $('.list-group-item.active .badge').text(0).hide(0);
    } else {
        var dialogHtml = buildDialogHtml(dialogId, dialogUnreadMessagesCount, dialogIcon, dialogName, dialogLastMessage);
        $('#dialogs-list').append(dialogHtml);
    }
}

// add photo to dialogs
function getDialogIcon(dialogType) {
    var groupPhoto = '<img src="images/ava-group.svg" width="30" height="30" class="round">',
        privatePhoto = '<img src="images/ava-single.svg" width="30" height="30" class="round">',
        defaultPhoto = '<span class="glyphicon glyphicon-eye-close"></span>',
        dialogIcon;

    switch (dialogType) {
        case 1:
            dialogIcon = groupPhoto;
            break;
        case 2:
            dialogIcon = groupPhoto;
            break;
        case 3:
            dialogIcon = privatePhoto;
            break;
        default:
            dialogIcon = defaultPhoto;
            break;
    }

    return dialogIcon;
}

// show unread message count and new last message
function updateDialogsList(dialogId, text) {
    var badgeCount = $('#' + dialogId + ' .badge').html();

    // update unread message count
    $('#' + dialogId + '.list-group-item.inactive .badge').text(parseInt(badgeCount) + 1).fadeIn(500);
    // update last message
    $('#' + dialogId + ' .list-group-item-text').text(text);
}

// Choose dialog
function triggerDialog(dialogId) {
    // deselect
    var kids = $('#dialogs-list').children(),
        $msgList = $('#messages-list');

    kids.removeClass('active').addClass('inactive');

    // select
    $('#' + dialogId).removeClass('inactive').addClass('active');
    $('.list-group-item.active .badge').text(0).delay(250).fadeOut(500);
    $msgList.html('');

    retrieveChatMessages(dialogs[dialogId], null);

    $msgList.scrollTop($msgList.prop('scrollHeight'));

    if (dialogs[dialogId].active_video_chat) {
        updateVideoAndAudioChatButton('join');
    } else {
        updateVideoAndAudioChatButton('start');
    }

}

//
function showUser(userLogin, userId) {
    var userHtml = buildUserHtml(userLogin, userId, false);
    $('#users_list').append(userHtml);
}

function clearUsers(){
  $('#users_list').empty();
}

// show modal window with users
function showNewDialogPopup() {
    $("#add_new_dialog").modal("show");
    $('#add_new_dialog .progress').hide();

    // get and show users
    retrieveUsersForDialogCreation(function(users) {
      if(users === null || users.length === 0){
        return;
      }

      clearUsers();

      $.each(users, function(index, item){
        if(this.user.id != currentUser.id){ // do not show current user
          showUser(this.user.full_name, this.user.id);
        }
      });
    });
}

// select users from users list
function clickToAdd(forFocus) {
    var $forFocus = $('#' + forFocus);

    if ($forFocus.hasClass("active")) {
        $forFocus.removeClass("active");
    } else {
        $forFocus.addClass("active");
    }
}

// create new dialog
function createNewDialog() {
    var usersIds = [],
        usersNames = [],
        dialogName,
        dialogOccupants,
        dialogType;

    $('#users_list .users_form.active').each(function(index) {
        usersIds[index] = $(this).attr('id');
        usersNames[index] = $(this).text();
    });

    $("#add_new_dialog").modal("hide");
    $('#add_new_dialog .progress').show();

    // if (usersIds.length > 1) {
        if (usersNames.indexOf(currentUser.full_name) > -1) {
            dialogName = usersNames.join(', ');
        } else {
            dialogName = currentUser.full_name + ', ' + usersNames.join(', ');
        }
        dialogOccupants = usersIds;
        dialogType = 2;
    // } else {
    //     dialogOccupants = usersIds;
    //     dialogType = 3;
    // }

    var params = {
        type: dialogType,
        occupants_ids: dialogOccupants,
        name: dialogName
    };

    // create a dialog
    //
    console.log("Creating a dialog with params: " + JSON.stringify(params));

    QB.chat.dialog.create(params, function(err, createdDialog) {
        if (err) {
            console.log(err);
        } else {
            console.log("Dialog " + createdDialog._id + " created with users: " + dialogOccupants);

            // save dialog to local storage
            var dialogId = createdDialog._id;
            dialogs[dialogId] = createdDialog;

            joinToNewDialogAndShow(createdDialog);

            notifyOccupants(createdDialog.occupants_ids, createdDialog._id, 1);

            if (!callIsInProgress) {
                currentDialog = createdDialog;
                triggerDialog(createdDialog._id);
            }

            $('a.users_form').removeClass('active');
        }
    });
}

//
function joinToNewDialogAndShow(itemDialog) {
    var dialogId = itemDialog._id,
        dialogName = itemDialog.name,
        dialogLastMessage = itemDialog.last_message,
        dialogUnreadMessagesCount = itemDialog.unread_messages_count,
        dialogIcon = getDialogIcon(itemDialog.type);

    // join if it's a group dialog
    if (itemDialog.type != 3) {
        QB.chat.muc.join(itemDialog.xmpp_room_jid, function() {
            console.log("Joined dialog: " + dialogId);
        });
        opponentLogin = null;
    } else {
        opponentId = QB.chat.helpers.getRecipientId(itemDialog.occupants_ids, currentUser.id);
        opponentLogin = getUserLoginById(opponentId);
        dialogName = chatName = 'Dialog with ' + opponentLogin;
    }

    // show it
    var dialogHtml = buildDialogHtml(dialogId, dialogUnreadMessagesCount, dialogIcon, dialogName, dialogLastMessage);
    $('#dialogs-list').prepend(dialogHtml);
}

//
function notifyOccupants(dialogOccupants, dialogId, notificationType, calleesArr) {
    dialogOccupants.forEach(function(itemOccupantId, i, arr) {
        if (itemOccupantId != currentUser.id) {
            var msg = {
                type: 'chat',
                extension: {
                    notification_type: notificationType,
                    dialog_id: dialogId
                }
            };

            if (calleesArr) {
                var isNewCallee = calleesArr.some(function(id) {
                    return id === itemOccupantId;
                });

                if (isNewCallee) {
                    msg.extension.video_chat = true;
                }
            }

            QB.chat.sendSystemMessage(itemOccupantId, msg);
        }
    });
}

//
function getAndShowNewDialog(newDialogId) {
    // get the dialog and users
    QB.chat.dialog.list({
        _id: newDialogId
    }, function(err, res) {
        if (err) {
            console.log(err);
        } else {
            var newDialog = res.items[0];

            // save dialog to local storage
            var dialogId = newDialog._id;
            dialogs[dialogId] = newDialog;

            // collect the occupants
            var occupantsIds = [];
            newDialog.occupants_ids.map(function(userId) {
                occupantsIds.push(userId);
            });
            updateDialogsUsersStorage(jQuery.unique(occupantsIds), function() {

            });
            console.info('DIALOG LIST newDialog', newDialog);
            joinToNewDialogAndShow(newDialog);
        }
    });
}

function getAndUpdateDialog(updatedDialogId, isVideoChat) {
    // get the dialog and users
    //

    var dialogAlreadyExist = dialogs[updatedDialogId] !== null;
    console.log("dialog " + updatedDialogId + " already exist: " + dialogAlreadyExist);

    QB.chat.dialog.list({
        _id: updatedDialogId
    }, function(err, res) {
        if (err) {
            console.log(err);
        } else {

            var updatedDialog = res.items[0];

            // update dialog in local storage
            var dialogId = updatedDialog._id,
                $dialogName = $('#' + dialogId + ' h4 span');

            dialogs[dialogId] = updatedDialog;

            // collect the occupants
            var occupantsIds = [];
            updatedDialog.occupants_ids.map(function(userId) {
                occupantsIds.push(userId);
            });

            updateDialogsUsersStorage(jQuery.unique(occupantsIds), function() {

            });

            if (dialogAlreadyExist && $dialogName.length) {
                // just update UI
                $dialogName.html('');
                $dialogName.append(updatedDialog.name);
            } else {
                joinToNewDialogAndShow(updatedDialog);

                if (isVideoChat) {
                    incomingCallFormOtherDialog(dialogId, updatedDialog.name);
                }
            }
        }
    });
}

// show modal window with dialog's info
function showDialogInfoPopup() {
    if (Object.keys(currentDialog).length !== 0) {
        $('#update_dialog').modal('show');
        $('#update_dialog .progress').hide();

        setupDialogInfoPopup(currentDialog, currentDialog.name);
    }
}

// show information about the occupants for current dialog
function setupDialogInfoPopup(currentDialog, name) {
    var occupantsIds = currentDialog.occupants_ids;

    console.log(occupantsIds);

    console.log("info");

    // clear old list
    $('#add_new_occupant').empty();
    // show name
    $('#dialog-name-input').val(name);

    $('#all_occupants').text('');

    if (occupantsIds.length > 0) {
        $('#all_occupants').append('<b>Occupants: </b>');

        // show occupants
        occupantsIds.forEach(function(uid, index) {
            var login = getUserLoginById(uid);

            $('#all_occupants').append("<span>" + login + "</span>");

            // owner - provide an ability to kick user, but do not show this button for himself
            if(currentDialog.user_id == currentUser.id && currentUser.id != uid && currentDialog.type != 3){
              $('#all_occupants').append("<a href='#' id='kick-user-" + uid + "'><span class='glyphicon glyphicon-remove-circle'></span></a>");
              $("#kick-user-" + uid).on('click', kickUser);
            }

            if (index + 1 != occupantsIds.length) {
                $('#all_occupants').append(", ");
            }
        });
    }

    var $elements = $('.new-info, .push, #push_usersList, #update_dialog_button');

    // show type
    //
    // private
    if (currentDialog.type == 3) {
        $('.dialog-type-info').text('').append('<b>Dialog type: </b>private chat');
        $elements.hide();
    // group
    } else {
        $('.dialog-type-info').text('').append('<b>Dialog type: </b>group chat');
        $elements.show();

        // get users to add to dialog
        fillUsersList();
    }
}

// for dialog update
function onDialogUpdate() {
    var pushOccupants = [],
        newDialogName = $('#dialog-name-input').val().trim(),
        toUpdate = {};

    $('#add_new_occupant .users_form.active').each(function(index) {
        pushOccupants[index] = $(this).attr('id').slice(0, -4);
    });

    if (currentDialog.name != newDialogName) {
        toUpdate.name = newDialogName;
    }

    if (pushOccupants.length > 0) {
        toUpdate.push_all = {
            occupants_ids: pushOccupants
        }
    }

    if (Object.keys(toUpdate).length == 0) {
        console.log("Nothing to update");
    } else {
        console.log("Updating the dialog with params: " + JSON.stringify(toUpdate));

        QB.chat.dialog.update(currentDialog._id, toUpdate, function(err, res) {
            if (err) {
                console.log(err);
                bootbox.alert("Error while updating chat dialog: " + JSON.stringify(err));

            } else {
                console.log("Dialog updated");

                var dialogId = res._id;
                dialogs[dialogId] = res;

                currentDialog = res;

                $('#' + res._id).remove();

                showOrUpdateDialogInUI(res, true);

                // notify new users about current video call

                if (callIsInProgress && pushOccupants.length) {
                    var newOccupants = pushOccupants.map(function(id) {
                        return Number(id);
                    });

                    notifyOccupants(res.occupants_ids, dialogId, 2, newOccupants);
                } else {
                    notifyOccupants(res.occupants_ids, dialogId, 2);
                }

                $('#' + res._id).removeClass('inactive').addClass('active');
            }
        });
    }

    $("#update_dialog").modal("hide");
    $('#dialog-name-input').val('');
    $('.users_form').removeClass("active");
}

// delete currend dialog
function onDialogDelete() {
    if (confirm('Are you sure you want remove the dialog?')) {
        QB.chat.dialog.delete(currentDialog._id, function(err, res) {
            if (err) {
                console.error(err);
            } else {
                console.info('Dialog removed');

                updateUIWhenDeletedDialog(currentDialog._id);
            }
        });

        $("#update_dialog").modal("hide");
        $('#update_dialog .progress').show();
    }
}

function updateUIWhenDeletedDialog(dialogId) {
    $('#' + dialogId).remove();
    delete dialogs[dialogId];

    if (currentDialog._id == dialogId) {
        if (Object.keys(dialogs).length > 0) {
            triggerDialog(dialogs[Object.keys(dialogs)[0]]._id);
        } else {
            $('#messages-list').empty();
        }
    }
}

function kickUser() {
    var userId = parseInt($(this).attr('id').replace("kick-user-", "")),
        toUpdate = {
            pull_all: {
                occupants_ids: [userId]
            }
        };

    console.log("Updating the dialog with params: " + JSON.stringify(toUpdate));

    QB.chat.dialog.update(currentDialog._id, toUpdate, function(err, res) {
        if (err) {
            console.log(err);
            bootbox.alert("Error while kicking user: " + JSON.stringify(err));
        } else {
            console.log("User is kicked");

            var dialogId = res._id;
            dialogs[dialogId] = res;

            currentDialog = res;

            // TODO: to replace this in future after SDK feature with kick users.
            notifyOccupants([userId], dialogId, 3);
        }

        $("#update_dialog").modal("hide");
        $('#dialog-name-input').val('');
        $('.users_form').removeClass("active");

    });
}

function kicked(dialogId) {
    console.log("You has been kicked from chat dialog: " + dialogId);
    bootbox.alert("You has been kicked from chat dialog '" + dialogs[dialogId].name + "'");

    updateUIWhenDeletedDialog(dialogId);

    // stop Video call if it's active now
    //
    if (dialogId == client.currentDialogId) { // client - refer to video/core.js
        console.log("Leaving video conf");
        clickJoinOrLeaveVideoChat();
    }
}

function fillUsersList(clear) {
    retrieveUsersForDialogUpdate(function(users){
        if(users === null || users.length === 0){
            return;
        }

        $.each(users, function(index, item){
            var userId = this.user.id,
                userLogin = this.user.full_name || 'Unknown user',
                occupantsIds = currentDialog.occupants_ids;

            var isOccupant = occupantsIds.some(function(id) {
                return id === userId;
            });

            if (!isOccupant) {
                var userHtml = buildUserHtml(userLogin, userId, true);
                $('#add_new_occupant').append(userHtml);
            }
        });
    });
}
