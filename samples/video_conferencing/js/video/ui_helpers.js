function addFeedView(userId, isLocal) {
    var userLabel = isLocal ? "Local video" : users[userId].full_name ? users[userId].full_name : users[userId].login;
    var remoteId = isLocal ? "videolocal" : "videoremote" + userId;

    var feedView = '<div class="col-md-6">\
                      <div class="panel panel-default">\
                        <div class="panel-heading"><h3 class="panel-title">' + userLabel + '</h3></div>\
                        <div class="panel-body relative videoView" id=' + remoteId + '></div>\
                      </div>\
                    </div>';
    $('#videos div.row').append(feedView);
}

function feedViewIsAlreadyAdded(userId){
  var remoteId = "videoremote" + userId;

  return $('#'+remoteId).length > 0;
}

function removeFeedView(userId) {
    $('#videoremote' + userId).parent().parent().remove();
}

function updateVideoAndAudioChatButton(status) {
    var $callBtn = $('#call_btn');

    // Change state for video_chat_button
    switch (status) {
        case 'start':
            $callBtn.text("Start call")
                    .removeClass("btn-danger")
                    .addClass("btn-success");

            $callBtn.popover();
            $callBtn.attr('onclick', null);

            break;

        case 'join':
            $callBtn.text("Join call")
                    .removeClass("btn-danger")
                    .addClass("btn-success");

            $callBtn.popover('destroy');
            $callBtn.attr('onclick', "clickJoinOrLeaveVideoChat()");

            break;

        case 'leave':
            $callBtn.text("Leave call")
                    .removeClass("btn-success")
                    .addClass("btn-danger");

            $callBtn.popover('destroy');
            $callBtn.attr('onclick', "clickJoinOrLeaveVideoChat()");

            break;

        case 'end':
            $callBtn.text("End call")
                    .removeClass("btn-success")
                    .addClass("btn-danger");

            $callBtn.popover('destroy');
            $callBtn.attr('onclick', "clickJoinOrLeaveVideoChat()");

            break;

        default:
            break;
    }
}

function prepareLocalVideoUI() {
    $('#videolocal').empty();

    $('#videolocal').append('<video class="rounded centered" id="myvideo" width="100%" height="100%" autoplay muted="muted"/>');

    // Add a 'video full screen' button
    $('#videolocal').append('<button class="btn btn-default btn-xs" id="fullscreen" style="position: absolute; top: 0px; right: 0px; margin-top: 28px; margin-right: 20px; background-color: #ccc;"> <img src="images/icon-full-mode-on.png" /></button>');
    $('#fullscreen').click(toggleFullscreen);

    // Add a 'mute' button
    $('#videolocal').append('<button class="btn btn-warning btn-xs" id="mute" style="position: absolute; bottom: 0px; left: 0px; margin: 15px;">Mute</button>');
    $('#mute').click(toggleMute);
    // $('#mute').click(ICE_RESTART_LOCAL_TEST);
    //
    //icon-full-mode-on.png
}

function prepareRemoteVideoUI(userId) {
    if ($('#remotevideo' + userId).length === 0) {
        $('#videoremote' + userId).append('<video class="rounded centered relative" id="remotevideo' + userId + '" width="100%" height="100%" autoplay/>');
        hideRemoteVideo(userId);
    }
    if(!isAudioCallOnly){
      $('#videoremote' + userId).append(
          '<span class="label label-primary hide" id="curres' + userId + '" style="position: absolute; top: 17px; left: 10px; margin: 15px;"></span>' +
          '<span class="label label-info hide" id="curbitrate' + userId + '" style="position: absolute; bottom: 0px; right: 0px; margin: 15px;"></span>'
      );
    }
    //
    $('#videoremote' + userId).append('<meter max="1" value="0" id="audioStreamVolume' + userId + '" style="position: absolute; bottom: 10px; left: 0px; right: 0px; margin: 34px; color: #0f9d58; width: 65%;"></meter>');

    // Add a 'video full screen' button
    $('#videoremote' + userId).append('<button class="btn btn-default btn-xs" id="fullscreen_' + userId + '" style="position: absolute; top: 0px; right: 0px; margin-top: 28px; margin-right: 20px; background-color: #ccc;"> <img src="images/icon-full-mode-on.png" id="fullscreen_' + userId + '" /></button>');
    $('#fullscreen_' + userId).click(toggleRemoteFullscreen);

    // Add a 'mute' button
    $('#videoremote' + userId).append('<button class="btn btn-warning btn-xs" id="mute_' + userId + '" style="position: absolute; bottom: 0px; left: 0px; margin: 15px;">Mute</button>');
    $('#mute_' + userId).click(toggleRemoteMute);
    // $('#mute_' + userId).click(ICE_RESTART_REMOTE_TEST);
}

function publishingLocalVideoUI() {
    if(adapter.browserDetails.browser === "safari") {
      noWebCameraUI("Video rejected, no supported video codec");
    }else{
      //startSpiner("local");
      //hideLocalVideo();
    }
}

function readyLocalVideoUI(videoDevices){
    if(videoDevices.length > 1){
      $('#videolocal').append('<select id="switchVideoSource" style="position: absolute; bottom: 0px; right: 0px; margin: 15px; width: 90px;"></select>');
      for (var i=0; i!==videoDevices.length; ++i) {
        var option = $('<option>' + videoDevices[i].label + '</option>');
        option.val(videoDevices[i].deviceId);
        if(videoDevices[i].deviceId == client.currentMidiaDeviceId){
            option.prop('selected', true);
        }
        $('#switchVideoSource').append(option);
      }
      $('#switchVideoSource').on('change', switchVideoSource);
    }

    stopSpiner("local");
    showLocalVideo();
}

function showRemoteVideo(userId) {
    $('#remotevideo' + userId).show();
}

function hideRemoteVideo(userId) {
    $('#remotevideo' + userId).hide();
}

function showLocalVideo() {
  console.info("showLocalVideo");
    $('#myvideo').show();
}

function hideLocalVideo() {
  console.info("hideLocalVideo");
    $('#myvideo').hide();
}

function noWebCameraUI(errorMessage) {
    hideLocalVideo();

    $('#videolocal').append(
        '<div class="no-video-container">' +
        '<i class="fa fa-video-camera fa-5 no-video-icon" style="height: 100%;"></i>' +
        '<span class="no-video-text" style="font-size: 16px;">' + errorMessage ? errorMessage : 'No webcam available' + '</span>' +
        '</div>');
}

function noWebCameraForRemoteStreamUI(remoteUserId) {
    hideRemoteVideo(remoteUserId);
    $('#videoremote' + remoteUserId).append(
        '<div id="novideo' + remoteUserId + '" class="no-video-container">' +
        '<i class="fa fa-video-camera fa-5 no-video-icon" style="height: 100%;"></i>' +
        '<span class="no-video-text" style="font-size: 16px;">No remote video available</span>' +
        '</div>');
}

function removeNoWebCameraForRemoteStreamUI(remoteUserId){
   $('#novideo'+remoteUserId).remove();
   showRemoteVideo(remoteUserId);
}

var spiners = [];

function startSpiner(userId) {
    var spiner = spiners[userId];
    if (!spiner) {
        var target = document.getElementById(userId == "local" ? 'videolocal' : 'videoremote' + userId);
        var opts = {
            scale: 0.5,
            top: '60%'
        };
        spiners[userId] = new Spinner(opts).spin(target);
    } else {
        spiner.spin();
    }
}

function stopSpiner(userId) {
    var spiner = spiners[userId];
    if (spiner) {
        spiner.stop();
    }
    spiners[userId] = null;
}

function showСurres(width, height, userId) {
    $('#curres' + userId).removeClass('hide').text(width + 'x' + height).show();

    if (adapter.browserDetails.browser === "firefox") {
        // Firefox Stable has a bug: width and height are not immediately available after a playing
        setTimeout(function() {
            var width = $("#remotevideo" + userId).get(0).videoWidth;
            var height = $("#remotevideo" + userId).get(0).videoHeight;
            $('#curres' + userId).removeClass('hide').text(width + 'x' + height).show();
        }, 2000);
    }
}

function hideСurres(userId) {
    $('#curres' + userId).remove();
}

function updateCallState(params) {
    var type = params.type,
        userId = params.userId,
        dialogId = params.dialogId,
        isActiveDialog = params.active,
        dialog = dialogs[dialogId],
        dialogName = dialog && dialog.name || getUserLoginById(userId);

    if (userId !== currentUser.id && type) {
        switch (type) {
            case 'startCallAudio':
            case 'startCallVideo':
                isAudioCallOnly = (type === 'startCallAudio')

                if (dialog.type === 3) {
                    dialogName = 'Dialog with ' + dialogName;
                }
                // incoming call
                if (isActiveDialog) {
                    showIncomingCallPopup(dialogId, dialogName);
                } else {
                    incomingCallFormOtherDialog(dialogId, dialogName);
                }
                return;
            case 'stopCall':
            case 'dropCall':
                // end call
                if (isActiveDialog) {
                    cancelCurrentCall(dialogId);
                } else {
                    cancelOtherCall(dialogId);
                }

                if(type === 'dropCall'){
                  bootbox.alert("The call is stopped because initiator has lost Internet connection.");
                }

                return;
            default:
                return;
        }
    }

}

function incomingCallFormOtherDialog(dialogId, dialogName) {
    var infoStr = 'You was added to video chat in dialog "' + dialogName + '". Join it?',
        updateDelay = 500,
        accept = callIsInProgress ? (isInitiator ? 'End current call and join' :
                'Leave current call and join') : 'Accept';

    changeVideoChatStatus(dialogId, true);

    bootbox.confirm({
        message: infoStr,
        buttons: {
            confirm: {
                label: accept,
                className: 'btn-success'
            },
            cancel: {
                label: 'Reject',
                className: 'btn-danger'
            }
        },
        callback: function(ok) {
            autoClosePopups(true);

            if (ok) {
                if (callIsInProgress) {
                    // left current video call
                    clickJoinOrLeaveVideoChat();
                    updateDelay += 1000;
                }
                setTimeout(function () {
                    $('#' + dialogId).click();
                    updateVideoAndAudioChatButton('join');
                    clickJoinOrLeaveVideoChat();
                }, updateDelay);
            }
        }
    });

    autoClosePopups();
}

function showIncomingCallPopup(dialogId, dialogName) {
    var infoStr = 'You was added to call in chat dialog "' + dialogName + '". Join it?',
        accept = callIsInProgress ? (isInitiator ? 'End current call and join' :
                'Leave current call and join') : 'Accept';

    changeVideoChatStatus(dialogId, true);
    updateVideoAndAudioChatButton('join');

    bootbox.confirm({
        message: infoStr,
        buttons: {
            confirm: {
                label: accept,
                className: 'btn-success'
            },
            cancel: {
                label: 'Reject',
                className: 'btn-danger'
            }
        },
        callback: function(ok) {
            autoClosePopups(true);
            if (ok && !callIsInProgress) {
                clickJoinOrLeaveVideoChat();
            }
        }
    });

    autoClosePopups();
}

function cancelCurrentCall(dialogId) {
    changeVideoChatStatus(dialogId, false);

    if (callIsInProgress) {
        clickJoinOrLeaveVideoChat(true);
    } else if (dialogId === currentDialog._id) {
        updateVideoAndAudioChatButton('start');
    }

    if (modalTimerID) {
        bootbox.hideAll();
    }
}

function cancelOtherCall(dialogId) {
    changeVideoChatStatus(dialogId, false);

    if (modalTimerID) {
        bootbox.hideAll();
    }
}

// global variable for modal's timer
var modalTimerID;

// modal's timer
function autoClosePopups(clear) {
    if (clear) {
        clearTimeout(modalTimerID);
        modalTimerID = undefined;
    } else {
        modalTimerID = setTimeout(function() {
            bootbox.hideAll();
        }, 30000);
    }
}

function changeVideoChatStatus(dialogId, isActive) {
    var $dialog = $('#' + dialogId).find('.video_state');

    dialogs[dialogId].active_video_chat = isActive;

    if (isActive) {
        $dialog.show();
    } else {
        $dialog.hide();
    }
}
