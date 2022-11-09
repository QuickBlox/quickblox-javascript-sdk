var callIsInProgress = false;

var isInitiator = false;

var client;

var isAudioCallOnly = false;

var userVideoinputDevices;

function initialise() {
  console.info("Video conference server endpoint: ", MULTIPARTY_SERVER);

  var config = {
    server: MULTIPARTY_SERVER,
    debug: true,
    iceServers: [{
      urls: "turn:turn.quickblox.com:3478",
      username: "quickblox",
      credential: "baccb97ba2d92d71e26eb9886da5f1e0"
    }]
  };
  client = new QBVideoConferencingClient(config);
  console.log('QB version: ', QB.version, '  ', QB.buildNumber);
  console.log('Videoconference client is : ', client);
  // for Mic level feature only
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  window.audioContext = new AudioContext();
}

function createPluginHandlers(userId) {
  return {
    consentDialog: function (on) {
      console.info('Consent dialog should be ' + (on ? 'on' : 'off'));
    },
    mediaState: function (media, receiving) {
      console.info(
        (userId ? 'REMOTE ' : 'LOCAL ') +
        'MediaState (' + userId + '):  ' +
        (receiving ? 'started' : 'stopped') +
        ' receiving our ' + media
      );

      if (!userId) {
        // Trying to fix 'ICE failed' error.
        // If it's happened - then close current session.
        if (media == "audio") {
          if (receiving) {
            stopICEFailedTimer(media);
          } else {
            runICEFailedTimer(media);
          }
        }
      }
    },
    webrtcState: function (on, reason) {
      console.info(
        (userId ? 'REMOTE ' : 'LOCAL ') +
        'WebRTC PeerConnection is ' +
        (on ? 'up' : 'down' + ' now') +
        (reason ? ' (reason: ' + reason + ')' : '') +
        ' (userId: ' + userId + ')'
      );
      if (on && !userId) {
        QBVideoConferencingClient
          .listVideoInputDevices()
          .then(function (videoinputDevices) {
            userVideoinputDevices = videoinputDevices;
            readyLocalVideoUI(videoinputDevices);
          });
      }
    },
    slowLink: function (uplink, nacks) {
      console.warn(
        (userId ? 'REMOTE ' : 'LOCAL ') +
        'slowLink detected (userId' + userId + '):' +
        'uplink: ' + uplink + '. nacks: ' + nacks
      );
      if (!userId) {
        toastr.warning("slow link detected");
      }
    },
    iceState: function (state) {
      console.info(
        (userId ? 'REMOTE ' : '') + 'iceState (' + userId + '): ' + state
      );

      if (['disconnected', 'checking'].includes(state)) {
        playSoundOnNewMessage()
        if (userId) {
          startSpiner(userId);
          hideRemoteVideo(userId);
        } else {
          startSpiner('local');
          hideLocalVideo();
        }
      } else if (state === 'connected') {
        playSoundOnNewMessage()
        if (userId) {
          stopSpiner(userId);
          showRemoteVideo(userId);
        } else {
          stopSpiner('local');
          showLocalVideo();
        }
      } else if (state === 'failed') {
        playSoundOnNewMessage()

        console.error(
          'Peer connection has failed because of ICE failed.' +
          ' User ID: ' + userId
        );
        console.info('Trying ICE restart...');

        // perform ICE restart
        client
          .iceRestart(userId)
          .then(function () {
            console.info("iceRestart success");
          })
          .catch(function (error) {
            console.warn("iceRestart error: " + JSON.stringify(error));
          });
      }
    },
    detached: function () {
      console.info(
        'The plugin handle has been detached' +
        (userId ? ' (userId: ' + userId + ')' : '')
      );
    },
    cleanup: function () {
      console.info("Got a cleanup notification (user " + userId + ")");
      if (userId) {
        stopSpiner(userId);
        hideСurres(userId);
      }

      hideAudioStreamVolume(userId, $('#audioStreamVolume' + userId));
    }
  }
}

async function attachPlugin(isRemote, userId) {
  try {
    var plugin = await client.attachVideoConferencingPlugin(isRemote, userId);
    var handlers = createPluginHandlers(userId);
    plugin.addListener(plugin.events.CONSENT_DIALOG, handlers.consentDialog);
    plugin.addListener(plugin.events.MEDIA_STATE, handlers.mediaState);
    plugin.addListener(plugin.events.WEBRTC_STATE, handlers.webrtcState);
    plugin.addListener(plugin.events.SLOW_LINK, handlers.slowLink);
    plugin.addListener(plugin.events.ICE_STATE, handlers.iceState);
    plugin.addListener(plugin.events.DETACHED, handlers.detached);
    plugin.addListener(plugin.events.CLEANUP, handlers.cleanup);

    return plugin;
  } catch (error) {
    console.error("Error in creating plugin: ", error);
    bootbox.alert(error["error"]);
  }
}

function initEventsListeners() {
  client.on(client.events.PARTICIPANT_JOINED, function (participant) {
    console.info('Participant joined: ', participant);
    if (users[participant.id]) {
      attachPlugin(true, participant.id);
    } else {
      updateDialogsUsersStorage([participant.id], function () {
        attachPlugin(true, participant.id);
      });
    }
  });

  client.on(client.events.PARTICIPANT_LEFT, function (userId) {
    console.info("Participant left: ", userId);
    // clean UI
    var $bitrateNode = $('#curbitrate' + userId);
    client.hideBitrate(userId, $bitrateNode.get(0));
    $bitrateNode.remove();
    removeFeedView(userId);
  });

  client.on(client.events.LOCAL_STREAM, function (stream) {
    console.info("Got a local stream");
    if ($('#myvideo').length === 0) {
      // Preapre local video UI and attach a video stream
      prepareLocalVideoUI();
    }
    QBVideoConferencingClient.attachMediaStream($('#myvideo').get(0), stream);
    // Handle 'No webcam' case.
    //
    // var videoTracks = stream.getVideoTracks();
    // if(videoTracks === null || videoTracks === undefined || videoTracks.length === 0) {
    //   noWebCameraUI()
    // }
  });

  client.on(client.events.REMOTE_STREAM, function (stream, userId) {
    var videoTracks = stream.getVideoTracks();
    var audioTracks = stream.getAudioTracks();

    console.info(
      'Got a remote stream for user ' + userId +
      '. audioTracks: ' + audioTracks.length +
      '. videoTracks: ' + videoTracks.length
    );

    // do not add stream if it's already here
    if (feedViewIsAlreadyAdded(userId)) {
      console.info("but it's already added, so skipping.");

      // Been here already: let's see if anything changed
      if (videoTracks && videoTracks.length > 0) {
        removeNoWebCameraForRemoteStreamUI(userId);
      }

      return;
    }

    // show remote feed
    addFeedView(userId, false);

    startSpiner(userId);

    prepareRemoteVideoUI(userId);

    // Show the video, hide the spinner and show the resolution when we get a playing event
    $('#remotevideo' + userId).bind('playing', function () {
      stopSpiner(userId);

      console.info('remotevideo' + userId + ' started playing.');
      showRemoteVideo(userId);

      showСurres(this.videoWidth, this.videoHeight, userId);
    });

    QBVideoConferencingClient.attachMediaStream(
      $('#remotevideo' + userId).get(0),
      stream
    );

    // Handle 'No camera available for remote stream' case
    if (!videoTracks || videoTracks.length === 0) {
      noWebCameraForRemoteStreamUI(userId);
    }

    // show 'bitrate'
    $('#curbitrate' + userId).removeClass('hide').show();
    client.showBitrate(userId, $('#curbitrate' + userId).get(0));

    // // show Mic level
    showAudioStreamVolume(userId, stream, $('#audioStreamVolume' + userId));
  });

  client.on(client.events.ERROR, function (error) {
    console.error('Received error: ', error);
  });

  client.on(client.events.SESSION_DESTROYED, function () {
    console.log('Session destroyed, removing all handlers');

    Object.values(client.events).map(function (eventName) {
      client.removeAllListeners(eventName);
    });
  });
}

function clearEventsListeners() {
  client.removeAllListeners("participantjoined");
  client.removeAllListeners("participantleft");
  client.removeAllListeners("localstream");
  client.removeAllListeners("remotestream");
}

function clickAudio() {
  isAudioCallOnly = true;
  clickJoinOrLeaveConference();
}

function clickVideo() {
  console.log('call clickVideo....');
  isAudioCallOnly = false;
  clickJoinOrLeaveConference();
}


function destroySession () {
  return client
    .destroySession()
    .then(function () {
      clearEventsListeners();

      $('.videoconf_ids').text(null);

      if (isInitiator) {
        if (isStopByBadNetwork) {
          notifyAboutCallState('dropCall');
        } else {
          notifyAboutCallState('stopCall');
        }
        changeVideoChatStatus(currentDialog._id, false);
      }

      sendCallPresence(isInitiator
        ? 'Has finished conference'
        : 'Has left conference'
      );
      updateVideoAndAudioChatButton(isInitiator ? 'start' : 'join');
      isInitiator = false;

      // update UI
      $("#video_chat_col").hide("slow", function () {
        $("#chat_history_col").show("fast", function () {
          setTimeout(function () {
            $('#call_btn').prop('disabled', null);
          }, 1000);

          callIsInProgress = false;
        });
      });
    })
    .catch(function (error) {
      console.warn('Error in "destroySession": ', error);
    });
};

// show modal window with video chat
async function clickJoinOrLeaveConference() {
  if (!client) {
    initialise();
  }

  $('#videos div.row').empty();

  // Stop
  if (callIsInProgress) {
    $('#call_btn').prop('disabled', 'disabled');

    stopAllICEFailedTimers();
    try {
      await client.leave()
      await client.detachVideoConferencingPlugin()
      console.info("Success detachVideoConferencingPlugin");
      await destroySession();
    } catch (error) {
      console.warn('Error: ', error);
      destroySession();
    }
  // Start
  } else {
    if (!currentDialog) {
      bootbox.alert("Please create a chat dialog first");
      return;
    }

    $('#call_btn').prop('disabled', "disabled");
    try {
      callIsInProgress = true;
      // Init Video engine
      await client.createSession()
      initEventsListeners();
      await attachPlugin(false, null);

      $("#chat_history_col").hide();
      $("#video_chat_col").show();

      // show local video feed
      addFeedView(currentUser.id, true);
      // join video chat
      var joinParams = {
        display: currentUser.full_name,
        onlyAudio: isAudioCallOnly,
        roomId: currentDialog._id,
        userId: currentUser.id
      };

      await client.join(joinParams)
      console.log("JOINED " + client.currentRoomId + " dialog");

      await actionsForTheInitiator();

      $('.videoconf_ids').text(
        'SID: ' + client.sessionId + '. PID: ' + client.pluginId
      );

      if (isInitiator) {
        changeVideoChatStatus(currentDialog._id, true);
      }

      sendCallPresence(isInitiator ? 'Started call' : 'Joined call');
      updateVideoAndAudioChatButton(isInitiator ? 'end' : 'leave');

      setTimeout(function () {
        $('#call_btn').prop('disabled', null);
      }, 1000);

    } catch (error) {
      console.error('Error: ', error);

      $('#call_btn').prop('disabled', null);

      bootbox.alert('Error: ', error);
      // if (error == "Lost connection to the gateway (is it down?)") {

      // } else if (error == "Error connecting to the Janus WebSockets server: Is the gateway down?") {
      //   if (callIsInProgress) {
      //     clickJoinOrLeaveConference();
      //   }
      //   bootbox.alert("Lost connection to the server. Please check your Internet connection and restart the app.");
      // }
    }
  }
}

function toggleMute() {
  var muted = client.toggleAudioMute();
  $('#mute').html(muted ? "Unmute" : "Mute");
  console.info("Now is muted=" + muted);
}

function toggleFullscreen() {
  var mediaScreen = document.getElementById("myvideo");
  enableFullScreen(mediaScreen);
}

function toggleRemoteMute(event) {
  var userId = parseInt(event.target.id.replace("mute_", ""));
  var muted = client.toggleRemoteAudioMute(userId);
  $("#" + event.target.id).html(muted ? "Unmute" : "Mute");
  console.info("Now remote is muted=" + muted);
}

function toggleRemoteFullscreen(event) {
  console.log(event);
  console.log(event.target.id);
  var userId = parseInt(event.target.id.replace("fullscreen_", ""));
  console.log(userId);
  var mediaScreen = document.getElementById("remotevideo" + userId);
  console.log(mediaScreen)
  enableFullScreen(mediaScreen);
}

function actionsForTheInitiator() {
  return client
    .listOnlineParticipants(currentDialog._id)
    .then(function (participants) {
      console.log("listOnlineParticipants, participants: ", participants);
      if (!participants) {
        notifyAboutCallState('startCall' + (isAudioCallOnly ? "Audio" : "Video"));
        isInitiator = true;
      }
    })
    .catch(function (error) {
      console.error("Can't got list of online participants:", error);
    });
}

// type === 'startCallAudio', 'startCallVideo' - notify participants about new call
// type === 'stopCall' - notify participants about end call
// type === 'dropCall' - notify participants about end call because of bad network
function notifyAboutCallState(type) {
  var self = this;
  var messageTo;

  if (currentDialog.type === 3) {
    messageTo = QB.chat.helpers.getRecipientId(currentDialog.occupants_ids, currentUser.id);
  } else {
    messageTo = currentDialog.xmpp_room_jid;
  }

  QB.chat.send(messageTo, {
    type: currentDialogType(),
    extension: {
      notification_type: type,
      dialog_id: currentDialog._id
    }
  });
}

function sendCallPresence(text) {
  try {
    sendMessage(text, null);
  } catch (err) {
    console.error("Error in 'sendMessage': ", err);
  }
}

function switchVideoSource(event) {
  switchVideoDevice(event.target.value);
}

function switchVideoDevice(deviceId) {
  client.switchVideoInput(deviceId, {
    error: function (error) {
      console.error("Can't switch video source, error: ", error);
    },
    success: function () {
      console.info("switchVideoDevice SUCCESS");
    }
  });
}

////////////////////////////////////////////////////////////////////////////////

var audioStreamVolumeTimers = [];
var audioStreamVolumeMeters = [];
//
function showAudioStreamVolume(userId, stream, element) {
  audioStreamVolumeMeters[userId] = window.soundMeter = new SoundMeter(window.audioContext);
  audioStreamVolumeMeters[userId].connectToSource(stream, function (e) {
    if (e) {
      alert(e);
      return;
    }
    audioStreamVolumeTimers[userId] = setInterval(function () {
      element.attr("value", audioStreamVolumeMeters[userId].instant.toFixed(2));
    }, 200);
  });
}

function hideAudioStreamVolume(userId, element) {
  var meter = audioStreamVolumeMeters[userId];
  if (meter) {
    meter.stop();
    audioStreamVolumeMeters[userId] = null;
  }

  var meterTimer = audioStreamVolumeTimers[userId];
  if (meterTimer) {
    clearInterval(meterTimer);
    audioStreamVolumeTimers[userId] = null;
  }

  element.attr("value", null);
}

////////////////////////////////////////////////////////////////////////////////

var iceFailedTimers = [];

function runICEFailedTimer(medium) {
  console.info("Ran 'ICE failed' timer for 5 seconds.");
  iceFailedTimers[medium] = setInterval(function () {
    console.info("Closing session because of 'ICE failed'..");
    clickJoinOrLeaveConference();

    bootbox.alert("The connectivity is gone because of heavy data loss. Please rejoin the call.");
  }, 5000);
}

function stopICEFailedTimer(medium) {
  if (iceFailedTimers[medium]) {
    clearInterval(iceFailedTimers[medium]);
    iceFailedTimers[medium] = null;
  }
  console.info("Stopped 'ICE failed' timer");
}

function stopAllICEFailedTimers() {
  Object.keys(iceFailedTimers).forEach(function (key) {
    clearInterval(iceFailedTimers[key]);
  });
  iceFailedTimers = [];
}

function enableFullScreen(mediaScreen) {
  if (mediaScreen.requestFullscreen) {
    if (document.fullScreenElement) {
      document.cancelFullScreen();
    } else {
      mediaScreen.requestFullscreen();
    }
  } else if (mediaScreen.mozRequestFullScreen) {
    if (document.mozFullScreenElement) {
      document.mozCancelFullScreen();
    } else {
      mediaScreen.mozRequestFullScreen();
    }
  } else if (mediaScreen.webkitRequestFullscreen) {
    if (document.webkitFullscreenElement) {
      document.webkitCancelFullScreen();
    } else {
      mediaScreen.webkitRequestFullscreen();
    }
  }
}
