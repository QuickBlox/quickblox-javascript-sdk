var callIsInProgress = false;

var isInitiator = false;

var client;

var isAudioCallOnly = false;

var userVideoinputDevices;

function initialise(){
  console.info("Video conference server endpoint: ", MULTIPARTY_SERVER);

    var config = {
        server: MULTIPARTY_SERVER,
        iceServers: [{urls: "stun:stun.l.google.com:19302"},
                     {urls: "turn:turn.quickblox.com:3478?transport=udp", username: "quickblox", credential: "baccb97ba2d92d71e26eb9886da5f1e0"},
                     {urls: "turn:turn.quickblox.com:3478?transport=tcp", username: "quickblox", credential: "baccb97ba2d92d71e26eb9886da5f1e0"}],
        video: {quality: VIDEO_RESOLUTION}
    };
    client = new QBVideoConferencingClient(config);

    // for Mic level feature only
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.audioContext = new AudioContext();
}

function initEventsListeners() {
    client.on("participantjoined", function(userId, userDisplayName) {
        console.info("On participantjoined: ", userId);

        client.attachVideoConferencingPlugin(true, userId, {
            success: function() {

            },
            error: function(error) {
                console.error("Error in 'attachVideoConferencingPlugin': ", error);

                // #define VIDEOROOM_ERROR_NO_SUCH_FEED		428
                //
                if (error["error_code"] != 428) {
                    // NO_SUCH_FEED can happen when a user joins room and quickly leaves it,
                    // so other user tries to subscribe to no exist feed
                    console.error("error: ", error["error"]);
                    bootbox.alert(error["error"]);
                }
            },
            webrtcState: function(on) {
                console.info("REMOTE WebRTC PeerConnection is " + (on ? "up" : "down") + " now (" + userId + ")");
            },
            mediaState: function(medium, on) {
                console.info("REMOTE MediaState (" + userId + "):  " + (on ? "started" : "stopped") + " receiving our " + medium);
            },
            slowLink: function(uplink, nacks) {
                console.warn("REMOTE slowLink detected (" + userId + "): uplink: " + uplink + ". nacks: " + nacks);
            },
            iceState: function(iceConnectionState){
                console.warn("REMOTE iceState (" + userId + "): " + iceConnectionState);

                if(iceConnectionState == "disconnected" || iceConnectionState == "checking"){
                  playSoundOnNewMessage()

                  startSpiner(userId);
                  hideRemoteVideo(userId);
                }else if (iceConnectionState == "connected"){
                  playSoundOnNewMessage()

                  stopSpiner(userId);
                  showRemoteVideo(userId);
                }else if (iceConnectionState == "failed"){
                  playSoundOnNewMessage()

                  console.error("Remote peer connection has failed because of ICE failed. User ID: " + userId);
                  console.info("Trying Remote ICE restart...");

                  // perform ICE restart
                  //
                  client.iceRestart(userId, {
                    success: function() {
                      // console.info("iceRestart success");
                    },
                    error: function(error) {
                      console.warn("iceRestart error: " + JSON.stringify(error));
                    }
                  });
                }
            },
            oncleanup: function() {
                console.info("Got a cleanup notification (user " + userId + ")");

                stopSpiner(userId);
                hideСurres(userId);

                client.hideBitrate(userId, $('#curbitrate' + userId));
                $('#curbitrate' + userId).remove();

                hideAudioStreamVolume(userId, $('#audioStreamVolume' + userId));
            }
        });

    });

    client.on("participantleft", function(userId, userDisplayName) {
        console.info("On participantleft: ", userId);

        // clean UI
        removeFeedView(userId);
    });

    client.on("localstream", function(stream) {
        console.info("Got a local stream");

        if($('#myvideo').length === 0) {
            // Preapre local video UI and attach a video stream
            prepareLocalVideoUI();
        }
        QBVideoConferencingClient.attachMediaStream($('#myvideo').get(0), stream);
        publishingLocalVideoUI();

        // Handle 'No webcam' case.
        //
        // var videoTracks = stream.getVideoTracks();
        // if(videoTracks === null || videoTracks === undefined || videoTracks.length === 0) {
        //   noWebCameraUI()
        // }
    });

    client.on("remotestream", function(stream, userId) {
        var videoTracks = stream.getVideoTracks();
        var audioTracks = stream.getAudioTracks();

        console.info("On remotestream for " + userId + ". audioTracks: " +
            audioTracks.length + ". videoTracks: " + videoTracks.length);

        // do not add stream if it's already here
        if(feedViewIsAlreadyAdded(userId)){
          console.info("but it's already added, so skipping.");

          // Been here already: let's see if anything changed
          if(videoTracks && videoTracks.length > 0) {
            removeNoWebCameraForRemoteStreamUI(userId);
          }

          return;
        }

        // show remote feed
        addFeedView(userId, false);

        startSpiner(userId);

        prepareRemoteVideoUI(userId);

        // Show the video, hide the spinner and show the resolution when we get a playing event
        $("#remotevideo" + userId).bind("playing", function() {
            stopSpiner(userId);

            console.info("remotevideo" + userId + " started playing.");
            showRemoteVideo(userId);

            showСurres(this.videoWidth, this.videoHeight, userId);
        });

        QBVideoConferencingClient.attachMediaStream($('#remotevideo' + userId).get(0), stream);

        // Handle 'No camera available for remote stream' case
        if(!videoTracks || videoTracks.length === 0) {
          noWebCameraForRemoteStreamUI(userId);
        }

        // show 'bitrate'
        $('#curbitrate' + userId).removeClass('hide').show();
        client.showBitrate(userId, $('#curbitrate' + userId));

        // // show Mic level
        showAudioStreamVolume(userId, stream, $('#audioStreamVolume' + userId));
    });
}

function clearEventsListeners() {
    client.removeAllListeners("participantjoined");
    client.removeAllListeners("participantleft");
    client.removeAllListeners("localstream");
    client.removeAllListeners("remotestream");
}

function clickAudio(){
  isAudioCallOnly = true;
  clickJoinOrLeaveVideoChat();
}

function clickVideo(){
  isAudioCallOnly = false;
  clickJoinOrLeaveVideoChat();
}

// show modal window with video chat
function clickJoinOrLeaveVideoChat(isStopByInitiator, isStopByBadNetwork) {
    if(!client){
      initialise();
    }

    var messageText,
        btnState;

    $('#videos div.row').empty();

    // Stop
    if (callIsInProgress) {
        $('#call_btn').prop('disabled', "disabled");

        stopAllICEFailedTimers();

        client.leave({
            success: function() {

                var next = function(){
                  client.destroySession({
                      success: function() {
                          clearEventsListeners();

                          $('.videoconf_ids').text(null);

                          if (isInitiator) {
                              if(isStopByBadNetwork){
                                notifyAboutCallState('dropCall');
                              }else{
                                notifyAboutCallState('stopCall');
                              }
                              messageText = 'Has finished video chat';
                              btnState = 'start';
                              isInitiator = false;

                              changeVideoChatStatus(currentDialog._id, false);
                          } else {
                              messageText = 'Has left video chat';
                              btnState = isStopByInitiator ? 'start' : 'join';
                          }

                          sendCallPresence(messageText);
                          updateVideoAndAudioChatButton(btnState);

                          // update UI
                          $("#video_chat_col").hide("slow", function() {
                              $("#chat_history_col").show("fast", function() {
                                  setTimeout(function() {
                                      $('#call_btn').prop('disabled', null);
                                  }, 1000);

                                  callIsInProgress = false;
                              });
                          });
                      },
                      error: function(error) {
                          console.warn("Error in 'destroySession': ", error);
                      }
                  });
                };

                client.detachVideoConferencingPlugin({
                    success: function() {
                        console.warn("Success detachVideoConferencingPlugin");
                        next();
                    },
                    error: function(error) {
                        console.warn("Error in 'detachVideoConferencingPlugin': ", error);
                        next();
                    }
                });

            }
        });


    // Start
    } else {
        if(!currentDialog){
          bootbox.alert("Please create a chat dialog first");
          return;
        }

        $('#call_btn').prop('disabled', "disabled");

        // Init Video engine
        //
        client.createSession({
            success: function() {

                initEventsListeners();

                // If this is Safari, let's avoid video
                if(adapter.browserDetails.browser === "safari") {
                    toastr.warning("Our video stream has been rejected because Safari does not support VP8 code. Viewers won't see us, only listen.");
                }

                client.attachVideoConferencingPlugin(false, null, {
                    success: function() {

                        actionsForTheInitiator();

                        $('.videoconf_ids').text("SID: " + client.getSessionId() + ". PID: " + client.getPluginId());

                        $("#chat_history_col").hide("slow", function() {
                            $("#video_chat_col").show("fast", function() {

                                // show local video feed
                                addFeedView(currentUser.id, true);

                                // join video chat
                                var roomIdToJoin = currentDialog._id;

                                client.join(roomIdToJoin, currentUser.id, isAudioCallOnly, {
                                    success: function() {
                                        console.log("JOINED " + client.currentDialogId + " dialog");

                                        if (isInitiator) {
                                            messageText = 'Started call';
                                            btnState = 'end';

                                            changeVideoChatStatus(currentDialog._id, true);
                                        } else {
                                            messageText = 'Joined call';
                                            btnState = 'leave';
                                        }

                                        sendCallPresence(messageText);
                                        updateVideoAndAudioChatButton(btnState);

                                        setTimeout(function() {
                                            $('#call_btn').prop('disabled', null);
                                        }, 1000);

                                        callIsInProgress = true;

                                        //
                                        // // TEMP
                                        // setTimeout(function() {
                                        //   clickJoinOrLeaveVideoChat(false, true);
                                        //
                                        //   bootbox.alert("TEST: The connectivity is gone because of heavy data loss. Please rejoin the call.");
                                        // }, 15000);
                                    },
                                    error: function(error) {
                                        bootbox.alert("Can't join video chat. Please check your Internet connection");
                                    }
                                });

                            });
                        });

                    },
                    error: function(error) {
                        console.error("Error in 'attachVideoConferencingPlugin': ", error);

                        // #define VIDEOROOM_ERROR_ID_EXISTS			436
                        // #define VIDEOROOM_ERROR_UNAUTHORIZED		433
                        // #define 'User ID xxx already exists'		400
                        //
                        if (error["error_code"] == 433 || error["error_code"] == 436 || error["error_code"] == 400) {
                            clickJoinOrLeaveVideoChat();
                        }

                        bootbox.alert("Error attaching plugin... " + (error["error"] || error));
                    },
                    webrtcState: function(on) {
                        console.info("LOCAL WebRTC PeerConnection is " + (on ? "up" : "down") + " now");

                        if(on){
                          QBVideoConferencingClient.listVideoinputDevices(function(videoinputDevices){
                            userVideoinputDevices = videoinputDevices;
                            readyLocalVideoUI(videoinputDevices);
                          });
                        }
                    },
                    consentDialog: function(on) {
                        console.info("Consent dialog should be " + (on ? "on" : "off") + " now");
                    },
                    mediaState: function(medium, on) {
                        console.info("LOCAL MediaState (own):  " + (on ? "started" : "stopped") + " receiving our " + medium);

                        // Trying to fix 'ICE failed' error.
                        // If it's happened - then close current session.
                        if(!on){
                          if(medium == "audio"){
                            runICEFailedTimer(medium);
                          }
                        }else{
                          if(medium == "audio"){
                            stopICEFailedTimer(medium);
                          }
                        }
                    },
                    slowLink: function(uplink, nacks) {
                      console.warn("LOCAL slowLink detected. uplink: " + uplink + ". nacks: " + nacks);
                      toastr.warning("slow link detected");
                    },
                    iceState: function(iceConnectionState){
                      console.warn("LOCAL iceState: " + iceConnectionState);

                      if(iceConnectionState == "disconnected" || iceConnectionState == "checking"){
                        playSoundOnNewMessage()

                        startSpiner("local");
                        hideLocalVideo();
                      }else if (iceConnectionState == "connected"){
                        playSoundOnNewMessage()

                        stopSpiner("local");
                        showLocalVideo();
                      }else if (iceConnectionState == "failed"){
                        playSoundOnNewMessage()

                        console.error("Local peer connection has failed because of ICE failed.");
                        console.info("Trying Local ICE restart...");

                        // perform ICE restart
                        //
                        client.iceRestart({
                          success: function() {
                            // console.info("iceRestart success");
                          },
                          error: function(error) {
                            console.warn("iceRestart error: " + JSON.stringify(error));
                          }
                        });
                      }
                    },
                    oncleanup: function() {

                    }
                });

            },

            error: function(error) {
                console.error("Error in 'createSession': ", error);

                $('#call_btn').prop('disabled', null);

                if(error == "Lost connection to the gateway (is it down?)"){

                }else if(error == "Error connecting to the Janus WebSockets server: Is the gateway down?"){
                  if (callIsInProgress) {
                      clickJoinOrLeaveVideoChat();
                  }
                  bootbox.alert("Lost connection to the server. Please check your Internet connection and restart the app.");
                }
            },

            destroyed: function() {
                console.info("Session is destroyed");
            },

            timeoutSessionCallback: function() {
                console.warn("timeoutSessionCallback CALL!!!!");
                bootbox.alert("Server session timeout (because of bad Internet connection). Please check your Internet connection and restart the app");
                clickJoinOrLeaveVideoChat(false, true);
            }
        });

    }
}

function toggleMute() {
    var muted = client.toggleAudioMute();
    $('#mute').html(muted ? "Unmute" : "Mute");
    console.info("Now is muted=" + muted);
}

function toggleFullscreen(){
  var mediaScreen = document.getElementById("myvideo");
  enableFullScreen(mediaScreen);
}

function toggleRemoteMute(event) {
    var userId = parseInt(event.target.id.replace("mute_", ""));
    var muted = client.toggleRemoteAudioMute(userId);
    $("#" + event.target.id).html(muted ? "Unmute" : "Mute");
    console.info("Now remote is muted=" + muted);
}

function toggleRemoteFullscreen(event){
  console.log(event);
  console.log(event.target.id);
    var userId = parseInt(event.target.id.replace("fullscreen_", ""));
    console.log(userId);
    var mediaScreen = document.getElementById("remotevideo"+userId);
    console.log(mediaScreen)
    enableFullScreen(mediaScreen);
}

function actionsForTheInitiator() {
    client.listOnlineParticipants(currentDialog._id, {
        success: function(participants){
            console.log("listOnlineParticipants, participants: ", participants);
            if (!participants) {
                notifyAboutCallState('startCall' + (isAudioCallOnly ? "Audio" : "Video"));
                isInitiator = true;
            }
        },
        error: function(error){
            console.error("Can't got list of online participants:", error);
        }
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

function switchVideoSource(event){
  switchVideoDevice(event.target.value);
}

function switchVideoDevice(deviceId){
  client.switchVideoinput(deviceId, {
    error: function(error) {
      console.error("Can't switch video source, error: ", error);
    },
    success: function() {
      console.info("switchVideoDevice SUCCESS");
    }
  });
}

////////////////////////////////////////////////////////////////////////////////

var audioStreamVolumeTimers = [];
var audioStreamVolumeMeters = [];
//
function showAudioStreamVolume(userId, stream, element){
  audioStreamVolumeMeters[userId] = window.soundMeter = new SoundMeter(window.audioContext);
  audioStreamVolumeMeters[userId].connectToSource(stream, function(e) {
    if (e) {
      alert(e);
      return;
    }
    audioStreamVolumeTimers[userId] = setInterval(function() {
      element.attr("value", audioStreamVolumeMeters[userId].instant.toFixed(2));
    }, 200);
  });
}

function hideAudioStreamVolume(userId, element){
  var meter = audioStreamVolumeMeters[userId];
  if(meter){
    meter.stop();
    audioStreamVolumeMeters[userId] = null;
  }

  var meterTimer = audioStreamVolumeTimers[userId];
  if(meterTimer){
    clearInterval(meterTimer);
    audioStreamVolumeTimers[userId] = null;
  }

  element.attr("value", null);
}

////////////////////////////////////////////////////////////////////////////////

var iceFailedTimers = [];

function runICEFailedTimer(medium){
  console.info("Ran 'ICE failed' timer for 5 seconds.");
  iceFailedTimers[medium] = setInterval(function() {
    console.info("Closing session because of 'ICE failed'..");
    clickJoinOrLeaveVideoChat(false, true);

    bootbox.alert("The connectivity is gone because of heavy data loss. Please rejoin the call.");
  }, 5000);
}

function stopICEFailedTimer(medium){
  if(iceFailedTimers[medium]){
    clearInterval(iceFailedTimers[medium]);
    iceFailedTimers[medium] = null;
  }
  console.info("Stopped 'ICE failed' timer");
}

function stopAllICEFailedTimers(){
  Object.keys(iceFailedTimers).forEach(function (key) {
      clearInterval(iceFailedTimers[key]);
  });
  iceFailedTimers = [];
}

function enableFullScreen(mediaScreen){
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

// function ICE_RESTART_LOCAL_TEST(){
//   // perform ICE restart
//   //
//   client.iceRestart({
//     success: function() {
//       console.info("iceRestart success");
//     },
//     error: function(error) {
//       console.warn("iceRestart error: " + JSON.stringify(error));
//     }
//   });
// }
//
// function ICE_RESTART_REMOTE_TEST(){
//   client.iceRestart(39207834, {
//     success: function() {
//       console.info("iceRestart success");
//     },
//     error: function(error) {
//       console.warn("iceRestart error: " + JSON.stringify(error));
//     }
//   });
// }
