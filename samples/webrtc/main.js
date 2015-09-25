var mediaParams, caller, callee;
var currentSession;

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
    $('.choose-recipient button').removeClass('active');
    $(this).addClass('active');

    callee = {
      id: $(this).attr('id'),
      full_name: $(this).attr('data-name'),
      login: $(this).attr('data-login'),
      password: $(this).attr('data-password')
    };

    $('#calleeName').text(callee.full_name);
  });

  // Audio call
  //
  $('#audiocall').on('click', function() {
    if(callee == null){
      alert('Please choose a user to call');
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
    if(callee == null){
      alert('Please choose a user to call');
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

    mediaParams = {
      audio: true,
      video: currentSession.callType === 'video' ? true : false,
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
      currentSession.stop(extension);
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

  currentSession = session;

  $('.incoming-callType').text(currentSession.callType === 'video' ? 'Video' : 'Audio');

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
  updateInfoMessage('User has accepted this call');
};

QB.webrtc.onRejectCallListener = function(session, extension) {
  console.log("onRejectCallListener. session: " + session + ". Extension: " + JSON.stringify(extension));

  $('.btn_mediacall, #hangup').attr('disabled', 'disabled');
  $('#audiocall, #videocall').removeAttr('disabled');
  $('video').attr('src', '');
  $('#callingSignal')[0].pause();
  updateInfoMessage('User has rejected the call. Logged in as ' + caller.full_name);
};

QB.webrtc.onStopCallListener = function(session, extension) {
  console.log("onStopCallListener. session: " + session + ". Extension: " + JSON.stringify(extension));

  updateUIOnHungUp();
};

QB.webrtc.onRemoteStreamListener = function(session, userID, stream) {
  QB.webrtc.attachMediaStream('remoteVideo', stream);
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

  currentSession = null;
}

QB.webrtc.onUpdateCallListener = function(session, extension) {

}

//
// Helpers
//

function callWithParams(mediaParams, isOnlyAudio){

  // create a session
  //
  currentSession = QB.webrtc.createNewSession([callee.id], isOnlyAudio ? 2 : 1);
  console.log("Session: " + currentSession);

  // get local stream
  //
  currentSession.getUserMedia(mediaParams, function(err, stream) {
    if (err) {
      console.log(err);
      updateInfoMessage('Error: devices (camera or microphone) are not found');

    } else {
      $('.btn_mediacall, #hangup').removeAttr('disabled');
      $('#audiocall, #videocall').attr('disabled', 'disabled');
      updateInfoMessage('Calling...');
      $('#callingSignal')[0].play();


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

function createSession() {
  QB.createSession(caller, function(err, res) {
    if (res) {
      connectChat();
    }
  });
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
  createSession();
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
