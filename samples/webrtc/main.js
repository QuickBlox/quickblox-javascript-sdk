var caller;
var callees = {};
var currentSession;

// volume meter variables
var METER_WIDTH = 100;
var METER_HEIGHT = 50;
var audioContext = null;
var meter = null;
var canvasContext = null;
var animationRequestID = null


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

  // Accept call
  //
  $('#accept').on('click', function() {
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
        var videoEl = "<video id='remoteVideo_" + currentSession.initiatorID + "'></video>";
        $(videoEl).appendTo('.remoteControls');

        setupVolumeMeter(stream);

        $('.btn_mediacall, #hangup').removeAttr('disabled');
        $('#audiocall, #videocall').attr('disabled', 'disabled');

        var extension = {};
        currentSession.accept(extension);
      }
    });
  });


  // Reject
  //
  $('#reject').on('click', function() {
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
});


//
// Callbacks
//


QB.webrtc.onCallListener = function(session, extension) {
  console.log("onCallListener. session: " + session + ". Extension: " + JSON.stringify(extension));
  var callType = extension.callType;

  currentSession = session;

  $('.incoming-callType').text(currentSession.callType === QB.webrtc.CallType.VIDEO ? 'Video' : 'Audio');

  $('.caller').text(currentSession.callerID);

  $('#ringtoneSignal')[0].play();

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

  // updateUIOnHungUp();
};

QB.webrtc.onRemoteStreamListener = function(session, userID, stream) {
  console.log("onRemoteStreamListener: " + stream);

  var videoElementID = 'remoteVideo_' + userID;
  currentSession.attachMediaStream(videoElementID, stream);
};

QB.webrtc.onUserNotAnswerListener = function(session, userId) {
  console.log("onUserNotAnswerListener. userId: " + userId);
};

QB.webrtc.onSessionConnectionStateChangedListener = function(session, userID, connectionState) {
  console.log("onSessionConnectionStateChangedListener: " + connectionState + ", userID: " + userID);

  // possible values of 'connectionState':
  // RTCPeerConnection.SessionConnectionState
  // QB.webrtc.SessionConnectionState.UNDEFINED
  // QB.webrtc.SessionConnectionState.CONNECTING
  // QB.webrtc.SessionConnectionState.CONNECTED
  // QB.webrtc.SessionConnectionState.FAILED
  // QB.webrtc.SessionConnectionState.DISCONNECTED
  // QB.webrtc.SessionConnectionState.CLOSED
  //
  // if(connectionState === QB.webrtc.SessionConnectionState.DISCONNECTED){
  //   if (typeof callee != 'undefined'){
  //     QB.webrtc.stop(callee.id);
  //   }
  //   updateUIOnHungUp();
  // }else if(connectionState === QB.webrtc.SessionConnectionState.CLOSED){
  //   updateUIOnHungUp();
  // }
};

QB.webrtc.onSessionCloseListener = function(session){
  console.log("onSessionCloseListener: " + session);
  updateUIOnHungUp();

  clearVolumeMeter();

  currentSession = null;
  localStream = null;
}

QB.webrtc.onUpdateCallListener = function(session, extension) {

}

//
// Helpers
//

function callWithParams(mediaParams, isOnlyAudio){

  // create a session
  //
  currentSession = QB.webrtc.createNewSession(Object.keys(callees), isOnlyAudio ? QB.webrtc.CallType.AUDIO : QB.webrtc.CallType.VIDEO);
  console.log("Session: " + currentSession);

  // get local stream
  //
  currentSession.getUserMedia(mediaParams, function(err, stream) {
    if (err) {
      console.log(err);
      updateInfoMessage('Error: devices (camera or microphone) are not found');

    } else {
      setupVolumeMeter(stream);

      $('.btn_mediacall, #hangup').removeAttr('disabled');
      $('#audiocall, #videocall').attr('disabled', 'disabled');
      updateInfoMessage('Calling...');
      $('#callingSignal')[0].play();

      // create video elements for opponents
      //
      Object.keys(callees).forEach(function(userID, i, arr) {
        var videoEl = "<video id='remoteVideo_" + userID + "'></video>";
        $(videoEl).appendTo('.remoteControls');
      });

      // start call
      //
      var extension = {};
      currentSession.call(extension);
    }
  });
}

function updateUIOnHungUp(){
  // hide inciming popup if it's here
  $('#incomingCall').modal('hide');
  $('#ringtoneSignal')[0].pause();

  updateInfoMessage('Call is stopped. Logged in as ' + caller.full_name);

  $('.btn_mediacall, #hangup').attr('disabled', 'disabled');
  $('#audiocall, #videocall').removeAttr('disabled');
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
