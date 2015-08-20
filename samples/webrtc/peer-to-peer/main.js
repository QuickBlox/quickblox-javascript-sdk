var mediaParams, caller, callee;

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

    QB.webrtc.getUserMedia(mediaParams, function(err, stream) {
      if (err) {
        console.log(err);
        var deviceNotFoundError = 'Devices are not found';
        updateInfoMessage(deviceNotFoundError);

        QB.webrtc.reject(callee.id, {'reason': deviceNotFoundError});
      } else {
        $('.btn_mediacall, #hangup').removeAttr('disabled');
        $('#audiocall, #videocall').attr('disabled', 'disabled');

        QB.webrtc.accept(callee.id);
      }
    });
  });


  // Reject
  //
  $('#reject').on('click', function() {
    $('#incomingCall').modal('hide');
    $('#ringtoneSignal')[0].pause();

    if (typeof callee != 'undefined'){
      QB.webrtc.reject(callee.id);
    }
  });


  // Hangup
  //
  $('#hangup').on('click', function() {
    if (typeof callee != 'undefined'){
      QB.webrtc.stop(callee.id);
    }
  });


  // Mute camera
  //
  $('.btn_camera_off').on('click', function() {
    var action = $(this).data('action');
    if (action === 'mute') {
      $(this).addClass('off').data('action', 'unmute');
      QB.webrtc.mute('video');
    } else {
      $(this).removeClass('off').data('action', 'mute');
      QB.webrtc.unmute('video');
    }
  });


  // Mute microphone
  //
  $('.btn_mic_off').on('click', function() {
    var action = $(this).data('action');
    if (action === 'mute') {
      $(this).addClass('off').data('action', 'unmute');
      QB.webrtc.mute('audio');
    } else {
      $(this).removeClass('off').data('action', 'mute');
      QB.webrtc.unmute('audio');
    }
  });
});


//
// Callbacks
//

QB.webrtc.onSessionStateChangedListener = function(newState, userId) {
  console.log("onSessionStateChangedListener: " + newState + ", userId: " + userId);

  // possible values of 'newState':
  //
  // QB.webrtc.SessionState.UNDEFINED
  // QB.webrtc.SessionState.CONNECTING
  // QB.webrtc.SessionState.CONNECTED
  // QB.webrtc.SessionState.FAILED
  // QB.webrtc.SessionState.DISCONNECTED
  // QB.webrtc.SessionState.CLOSED

  if(newState === QB.webrtc.SessionState.DISCONNECTED){
    if (typeof callee != 'undefined'){
      QB.webrtc.stop(callee.id);
    }
    hungUp();
  }else if(newState === QB.webrtc.SessionState.CLOSED){
    hungUp();
  }
};

QB.webrtc.onCallListener = function(userId, extension) {
  console.log("onCallListener. userId: " + userId + ". Extension: " + JSON.stringify(extension));

  mediaParams = {
    audio: true,
    video: extension.callType === 'video' ? true : false,
    elemId: 'localVideo',
    options: {
      muted: true,
      mirror: true
    }
  };

  $('.incoming-callType').text(extension.callType === 'video' ? 'Video' : 'Audio');
  
  // save a callee
  callee = {
    id: extension.callerID,
    full_name: "User with id " + extension.callerID,
    login: "",
    password: "" 
  };

  $('.caller').text(callee.full_name);

  $('#ringtoneSignal')[0].play();

  $('#incomingCall').modal({
    backdrop: 'static',
    keyboard: false
  });
};

QB.webrtc.onAcceptCallListener = function(userId, extension) {
  console.log("onAcceptCallListener. userId: " + userId + ". Extension: " + JSON.stringify(extension));

  $('#callingSignal')[0].pause();
  updateInfoMessage(callee.full_name + ' has accepted this call');
};

QB.webrtc.onRejectCallListener = function(userId, extension) {
  console.log("onRejectCallListener. userId: " + userId + ". Extension: " + JSON.stringify(extension));

  $('.btn_mediacall, #hangup').attr('disabled', 'disabled');
  $('#audiocall, #videocall').removeAttr('disabled');
  $('video').attr('src', '');
  $('#callingSignal')[0].pause();
  updateInfoMessage(callee.full_name + ' has rejected the call. Logged in as ' + caller.full_name);
};

QB.webrtc.onStopCallListener = function(userId, extension) {
  console.log("onStopCallListener. userId: " + userId + ". Extension: " + JSON.stringify(extension));

  hungUp();
};

QB.webrtc.onRemoteStreamListener = function(stream) {
  QB.webrtc.attachMediaStream('remoteVideo', stream);
};

QB.webrtc.onUserNotAnswerListener = function(userId) {
  console.log("onUserNotAnswerListener. userId: " + userId);
};


//
// Helpers
//

function callWithParams(mediaParams, isOnlyAudio){
  QB.webrtc.getUserMedia(mediaParams, function(err, stream) {
    if (err) {
      console.log(err);
      updateInfoMessage('Error: devices (camera or microphone) are not found');
    } else {
      $('.btn_mediacall, #hangup').removeAttr('disabled');
      $('#audiocall, #videocall').attr('disabled', 'disabled');
      updateInfoMessage('Calling...');
      $('#callingSignal')[0].play();
      //
      QB.webrtc.call(callee.id, isOnlyAudio ? 'audio' : 'video', {});
    }
  });
}

function hungUp(){
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
