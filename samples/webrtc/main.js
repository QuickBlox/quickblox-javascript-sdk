var caller;
var callees = {};
var currentSession;

// volume meter variables
var METER_WIDTH = 100;
var METER_HEIGHT = 50;
var audioContext = null;
var meter = null;
var canvasContext = null;
var animationRequestID = null;


QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret, CONFIG);

$(document).ready(function() {
  buildUsers('.users-wrap.caller');

  // Choose user
  //
  $(document).on('click', '.choose-user button', function() {

    caller = {
      id: $(this).attr('id'),
      full_name: $(this).attr('data-name'),
      login: $(this).attr('data-login'),
      password: $(this).attr('data-password')
    };

    chooseRecipient(caller.id);
  });


  // Choose recipient
  //
  $(document).on('click', '.choose-recipient button', function() {
    var userID = $(this).attr('id');
    var userName = $(this).attr('data-name');

    if($(this).hasClass('active')){
      $(this).removeClass('active');

      delete callees[userID];
    }else{
      $(this).addClass('active');

      callees[userID] = userName;
    }

    var values = Object.keys(callees).map(function(v) { return callees[v]; });
    $('#calleesNames').text(values);
  });

  // Audio call
  //
  $('#audiocall').on('click', function() {
    if(Object.keys(callees).length == 0){
      alert('Please choose users to call');
      return;
    }

    $('#audiocall, #videocall, #screen_sharing').attr('disabled', 'disabled');

    var mediaParams = {
      audio: true,
      elemId: 'localVideo',
      options: { muted: true }
    };

    callWithParams(mediaParams, true);
  });

  // Video call
  //
  $('#videocall').on('click', function() {

    if(Object.keys(callees).length == 0){
      alert('Please choose users to call');
      return;
    }

    $('#audiocall, #videocall, #screen_sharing').attr('disabled', 'disabled');

    var mediaParams = {
      audio: true,
      video: true,
      // video: {
      //       mandatory: {
      //         maxWidth: 1280,
      //         maxHeight: 720,
      //         minWidth: 1280,
      //         minHeight: 720
      //       }
      // },
      elemId: 'localVideo',
      options: {
        muted: true,
        mirror: true
      }
    };

    callWithParams(mediaParams, false);
  });

  // Screen sharing
  //
  $('#screen_sharing').on('click', function() {
    if(Object.keys(callees).length == 0){
      alert('Please choose users to call');
      return;
    }

    $('#audiocall, #videocall, #screen_sharing').attr('disabled', 'disabled');

    callWithScreenSharing();
  });

  // Accept call
  //
  $('#accept').on('click', function() {

    $('#accept').attr('disabled', 'disabled');

    $('#incomingCall').modal('hide');
    $('#ringtoneSignal')[0].pause();

    var mediaParams = {
      audio: true,
      video: currentSession.callType === 1 ? true : false,
      // video: {
      //       mandatory: {
      //         maxWidth: 1280,
      //         maxHeight: 720,
      //         minWidth: 1280,
      //         minHeight: 720
      //       }
      // },
      elemId: 'localVideo',
      options: {
        muted: true,
        mirror: true
      }
    };

    currentSession.getUserMedia(mediaParams, function(err, stream) {

      if (err) {
        console.log(err);
        var deviceNotFoundError = 'Devices are not found';
        updateInfoMessage(deviceNotFoundError);

      } else {
        // create video elements for opponents
        //

        var opponents = [currentSession.initiatorID];
        currentSession.opponentsIDs.forEach(function(userID, i, arr) {
          if(userID != currentSession.currentUserID){
            opponents.push(userID);
          }
        });
        //
        opponents.forEach(function(userID, i, arr) {
          if(!checkVideoEl(userID)) {
            var videoEl = "<div class='remoteVideoWrap'><video class='remoteVideoClass' id='remoteVideo_" + userID + "'></video></div>";
            $(videoEl).appendTo('.remoteControls');

            var peerState = currentSession.connectionStateForUser(userID);
            if(peerState === QB.webrtc.PeerConnectionState.CLOSED){
              clearRemoteVideoView(userID);
            }
          }
        });

        setupVolumeMeter(stream);

        $('.btn_mediacall, #hangup').removeAttr('disabled');
        $('#audiocall, #videocall, #screen_sharing').attr('disabled', 'disabled');

        var extension = {};
        currentSession.accept(extension);
      }
    });
  });

  // Reject
  //
  $('#reject').on('click', function() {

    $('#reject').attr('disabled', 'disabled');

    $('#incomingCall').modal('hide');
    $('#ringtoneSignal')[0].pause();

    if (currentSession != null){
      var extension = {};
      currentSession.reject(extension);
      currentSession = null;
    }
  });


  // Hangup
  //
  $('#hangup').on('click', function() {
    if (currentSession != null){
      var extension = {};
      currentSession.stop(extension);
      currentSession = null;
    }
  });


  // Mute camera
  //
  $('.btn_camera_off').on('click', function() {
    var action = $(this).data('action');
    if (action === 'mute') {
      $(this).addClass('off').data('action', 'unmute');
      currentSession.mute('video');
    } else {
      $(this).removeClass('off').data('action', 'mute');
      currentSession.unmute('video');
    }
  });


  // Mute microphone
  //
  $('.btn_mic_off').on('click', function() {
    var action = $(this).data('action');
    if (action === 'mute') {
      $(this).addClass('off').data('action', 'unmute');
      currentSession.mute('audio');
    } else {
      $(this).removeClass('off').data('action', 'mute');
      currentSession.unmute('audio');
    }
  });

  $('#audiocall, #videocall, #screen_sharing').removeAttr('disabled');

});


//
// Callbacks
//

if (!QB.webrtc) {
  updateInfoMessage('Webrtc is not avaible');
} else {
  QB.webrtc.onCallListener = function(session, extension) {
    console.log("onCallListener. session: " + session + ". Extension: " + JSON.stringify(extension));
    var callType = extension.callType;

    currentSession = session;

    $('.incoming-callType').text(currentSession.callType === QB.webrtc.CallType.VIDEO ? 'Video' : 'Audio');

    $('.caller').text(currentSession.callerID);

    $('#ringtoneSignal')[0].play();

    $('#accept, #reject').removeAttr('disabled');
    $('#incomingCall').modal({
      backdrop: 'static',
      keyboard: false
    });
  };

  QB.webrtc.onAcceptCallListener = function(session, extension) {
    console.log("onAcceptCallListener. session: " + session + ". Extension: " + JSON.stringify(extension));

    $('#callingSignal')[0].pause();
    updateInfoMessage('User has accepted the call');
  };

  QB.webrtc.onRejectCallListener = function(session, extension) {
    console.log("onRejectCallListener. session: " + session + ". Extension: " + JSON.stringify(extension));


    // $('.btn_mediacall, #hangup').attr('disabled', 'disabled');
    // $('#audiocall, #videocall').removeAttr('disabled');
    // $('video').attr('src', '');
    // $('#callingSignal')[0].pause();
    // updateInfoMessage('User has rejected the call. Logged in as ' + caller.full_name);
  };

  QB.webrtc.onStopCallListener = function(session, extension) {
    console.log("onStopCallListener. session: " + session + ". Extension: " + JSON.stringify(extension));
  };

  QB.webrtc.onRemoteStreamListener = function(session, userID, stream) {
    var videoElementID = 'remoteVideo_' + userID;
    currentSession.attachMediaStream(videoElementID, stream);
  };

  QB.webrtc.onUserNotAnswerListener = function(session, userId) {
    console.log("onUserNotAnswerListener. userId: " + userId);
  };

  QB.webrtc.onSessionConnectionStateChangedListener = function(session, userID, connectionState) {
    console.log("onSessionConnectionStateChangedListener: " + connectionState + ", userID: " + userID);

    // possible values of 'connectionState':
    //
    // QB.webrtc.SessionConnectionState.UNDEFINED
    // QB.webrtc.SessionConnectionState.CONNECTING
    // QB.webrtc.SessionConnectionState.CONNECTED
    // QB.webrtc.SessionConnectionState.FAILED
    // QB.webrtc.SessionConnectionState.DISCONNECTED
    // QB.webrtc.SessionConnectionState.CLOSED

    if(connectionState === QB.webrtc.SessionConnectionState.CONNECTED || connectionState === QB.webrtc.SessionConnectionState.COMPLETED){
      showRemoteVideoView(userID);
    }

    if(connectionState === QB.webrtc.SessionConnectionState.DISCONNECTED){
      hideRemoteVideoView(userID);
    }

    if(connectionState === QB.webrtc.SessionConnectionState.CLOSED){
      clearRemoteVideoView(userID);
    }
  };

  QB.webrtc.onSessionCloseListener = function(session){
    console.log("onSessionCloseListener: " + session);
    updateUIOnHungUp();

    clearVolumeMeter();

    currentSession = null;
    localStream = null;

    $(".remoteVideoWrap").remove();
  };

  QB.webrtc.onUpdateCallListener = function(session, extension) {};
}
//
// Helpers
//

function callWithParams(mediaParams, isOnlyAudio){

  // create a session
  //
  currentSession = QB.webrtc.createNewSession(Object.keys(callees), isOnlyAudio ? QB.webrtc.CallType.AUDIO : QB.webrtc.CallType.VIDEO);

  // get local stream
  //
  currentSession.getUserMedia(mediaParams, function(err, stream) {
    if (err) {
      console.log("getUserMedia error: " + err);
      updateInfoMessage('Error: devices (camera or microphone) are not found');

    } else {
      setupVolumeMeter(stream);

      $('.btn_mediacall, #hangup').removeAttr('disabled');
      updateInfoMessage('Calling...');
      $('#callingSignal')[0].play();

      // create video elements for opponents
      //
      Object.keys(callees).forEach(function(userID, i, arr) {
        var videoEl = "<div class='remoteVideoWrap'><video class='remoteVideoClass' id='remoteVideo_" + userID + "'></video></div>";
        $(videoEl).appendTo('.remoteControls');
      });

      // start call
      //
      var extension = {
      };
      currentSession.call(extension);
    }
  });
}

function callWithScreenSharing(){

  // create a session
  //
  currentSession = QB.webrtc.createNewSession(Object.keys(callees), QB.webrtc.CallType.VIDEO);

  getScreenId(function (error, sourceId, screenConstraints) {
    console.log("sourceId: " + sourceId + ", screenConstraints: " + JSON.stringify(screenConstraints));

    if(error) {
      alert('getScreenId error ' + error + '.');
      return false;
    }

    screenConstraints["elemId"] = 'localVideo',

    // get local stream
    //
    currentSession.getUserMedia(screenConstraints, function(err, stream) {
      if (err) {
        console.log("getUserMedia error: " + err);
        updateInfoMessage('Error accessing the screen sharing feature');
      } else {
        $('.btn_mediacall, #hangup').removeAttr('disabled');
        updateInfoMessage('Calling...');
        $('#callingSignal')[0].play();

        // create video elements for opponents
        //
        Object.keys(callees).forEach(function(userID, i, arr) {
          var videoEl = "<div class='remoteVideoWrap'><video class='remoteVideoClass' id='remoteVideo_" + userID + "'></video></div>";
          $(videoEl).appendTo('.remoteControls');
        });

        // start call
        //
        var extension = {
        };
        currentSession.call(extension);
      }
    });
  });
}

function hideRemoteVideoView(userID) {
  var $video = $('#remoteVideo_' + userID);

  if(currentSession !== null && $video.length){
    $video.parents('.remoteVideoWrap').addClass('wait');
  }
}

function showRemoteVideoView(userID) {
  var $video = $('#remoteVideo_' + userID);

  if(currentSession !== null && $video.length){
    $video.parents('.remoteVideoWrap').removeClass('wait');
  }
}

function clearRemoteVideoView(userID){
  if(currentSession !== null){
    var videoElementID = 'remoteVideo_' + userID;
    currentSession.detachMediaStream(videoElementID);
    $("#"+videoElementID).css({"background":"none"});
  }
}

function updateUIOnHungUp(){
  // hide inciming popup if it's here
  $('#incomingCall').modal('hide');
  $('#ringtoneSignal')[0].pause();

  updateInfoMessage('Call is stopped. Logged in as ' + caller.full_name);

  $('.btn_mediacall, #hangup').attr('disabled', 'disabled');
  $('#audiocall, #videocall, #screen_sharing').removeAttr('disabled');
  $('video').attr('src', '');
  $('#callingSignal')[0].pause();
  $('#endCallSignal')[0].play();
}

function connectChat() {
  updateInfoMessage('Connecting to chat...');

  QB.chat.connect({
    jid: QB.chat.helpers.getUserJid(caller.id, QBApp.appId),
    password: caller.password

  }, function(err, res) {
    $('.connecting').addClass('hidden');
    $('.chat').removeClass('hidden');
    $('#callerName').text('You');

    updateInfoMessage('Logged in as ' + caller.full_name);
  })
}

function chooseRecipient(id) {
  $('.choose-user').addClass('hidden');
  $('.connecting').removeClass('hidden');
  updateInfoMessage('Creating a session...');
  buildUsers('.users-wrap.recipient', id);

  connectChat();
}

function buildUsers(el, excludeID) {
  for (var i = 0, len = QBUsers.length; i < len; ++i) {
    var user = QBUsers[i];
    if (excludeID != user.id) {
      var userBtn = $('<button>').attr({
        'class' : 'user',
        'id' : user.id,
        'data-login' : user.login,
        'data-password' : user.password,
        'data-name' : user.full_name
      });
      var imgWrap = $('<div>').addClass('icon-wrap').html( userIcon(user.colour) ).appendTo(userBtn);
      var userFullName = $('<div>').addClass('name').text(user.full_name).appendTo(userBtn);
      userBtn.appendTo(el);
    }
  }
}

function updateInfoMessage(msg){
  $('#infoMessage').text(msg);
}

function userIcon(hexColorCode) {
  return '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="30" height="30" viewBox="0 0 48 48"><path d="M24 30c0 0-16 0-22 14 0 0 10.020 4 22 4s22-4 22-4c-6-14-22-14-22-14zM24 28c6 0 10-6 10-16s-10-10-10-10-10 0-10 10 4 16 10 16z" fill="#' + (hexColorCode || '666') + '"></path></svg>';
}

function setupVolumeMeter(localStream){
  // grab our canvas
  var meterElement = document.getElementById("local-volume-meter");
  canvasContext = meterElement.getContext("2d");

  // monkeypatch Web Audio
  window.AudioContext = window.AudioContext || window.webkitAudioContext;

  // grab an audio context
  audioContext = new AudioContext();

  // Create an AudioNode from the stream.
  var mediaStreamSource = audioContext.createMediaStreamSource(localStream);

  // Create a new volume meter and connect it.
  meter = createAudioMeter(audioContext);
  mediaStreamSource.connect(meter);

  // kick off the visual updating
  drawLoop();
}

function drawLoop(time) {
  // clear the background
  if(canvasContext) {
    canvasContext.clearRect(0, 0, METER_WIDTH, METER_HEIGHT);

    // check if we're currently clipping
    if (meter.checkClipping()){
      canvasContext.fillStyle = "red";
    }else{
      canvasContext.fillStyle = "green";
    }

    // draw a bar based on the current volume
    canvasContext.fillRect(0, 0, meter.volume * METER_WIDTH * 1.4, METER_HEIGHT);

    // set up the next visual callback
    animationRequestID = window.requestAnimationFrame(drawLoop);
  }
}

function clearVolumeMeter() {
  if(animationRequestID != null){
    window.cancelAnimationFrame(animationRequestID);
  }
  animationRequestID = null;
  if(canvasContext != null){
   canvasContext.clearRect(0, 0, METER_WIDTH, METER_HEIGHT);
  }
  canvasContext = null;
  mediaStreamSource = null;
  meter = null;
}

function checkVideoEl(userID) {
  var videoEl = document.getElementById('remoteVideo_' + userID);
  return (videoEl !== null);
}
