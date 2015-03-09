var mediaParams, caller, callee;

QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret);

$(document).ready(function() {
  
  appendUsers('.users-wrap.caller');
  
  $(document).on('click', '.choose-user button', function() {
    caller = {
      id: $(this).attr('id'),
      full_name: $(this).attr('data-name'),
      login: $(this).attr('data-login'),
      password: $(this).attr('data-password') };
    chooseRecipient(caller.id);
  });
  
  $(document).on('click', '.choose-recipient button', function() {
    console.log('executed');
    callee = {
      id: $(this).attr('id'),
      full_name: $(this).attr('data-name'),
      login: $(this).attr('data-login'),
      password: $(this).attr('data-password') };
    createSession();
  });
  
  $('#loginUser').on('change', function() {
    var index = $(this).val();
    $('#opponentUser option').each(function() {
      $(this).prop('disabled', false);
    });
    $('#opponentUser option[value="' + index + '"]').attr('disabled', 'disabled');
    console.log(index === $('#opponentUser').val())
    if (index === $('#opponentUser').val()) {
      $('#opponentUser').val('null');
    }
  });

  $('#audiocall').on('click', function() {
    mediaParams = {
      audio: true,
      elemId: 'localVideo',
      options: { muted: true }
    };
    QB.webrtc.getUserMedia(mediaParams, function(err, stream) {
      if (err) {
        console.log(err);
        $('#infoMessage').text('Devices are not found');
      } else {
        $('.btn_mediacall, #hangup').removeAttr('disabled');
        $('#audiocall, #videocall').attr('disabled', 'disabled');
        $('#infoMessage').text('Calling...');
        $('#callingSignal')[0].play();
        QB.webrtc.call(callee.id, 'audio');
      }
    });
  });

  $('#videocall').on('click', function() {
    mediaParams = {
      audio: true,
      video: true,
      elemId: 'localVideo',
      options: {
        muted: true,
        mirror: true
      }
    };
    QB.webrtc.getUserMedia(mediaParams, function(err, stream) {
      if (err) {
        console.log(err);
        $('#infoMessage').text('Devices are not found');
      } else {
        $('.btn_mediacall, #hangup').removeAttr('disabled');
        $('#audiocall, #videocall').attr('disabled', 'disabled');
        $('#infoMessage').text('Calling...');
        $('#callingSignal')[0].play();
        QB.webrtc.call(callee.id, 'video', {user: {fullname: "asdas", age: 1213}});
      }
    });
  });

  $('#accept').on('click', function() {
    $('#incomingCall').modal('hide');
    $('#ringtoneSignal')[0].pause();
    QB.webrtc.getUserMedia(mediaParams, function(err, stream) {
      if (err) {
        console.log(err);
        $('#infoMessage').text('Devices are not found');
        QB.webrtc.reject(callee.id);
      } else {
        $('.btn_mediacall, #hangup').removeAttr('disabled');
        $('#audiocall, #videocall').attr('disabled', 'disabled');
        QB.webrtc.accept(callee.id);
      }
    });
  });

  $('#reject').on('click', function() {
    $('#incomingCall').modal('hide');
    $('#ringtoneSignal')[0].pause();
    QB.webrtc.reject(callee.id);
  });

  $('#hangup').on('click', function() {
    $('.btn_mediacall, #hangup').attr('disabled', 'disabled');
    $('#audiocall, #videocall').removeAttr('disabled');
    $('video').attr('src', '');
    $('#callingSignal')[0].pause();
    $('#endCallSignal')[0].play();
    QB.webrtc.stop(callee.id, 'manually');
  });

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

QB.webrtc.onCallListener = function(id, extension) {
  console.log(extension);
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
  $('.caller').text(callee.full_name);
  $('#ringtoneSignal')[0].play();

  $('#incomingCall').modal({
    backdrop: 'static',
    keyboard: false
  });
};

QB.webrtc.onAcceptCallListener = function(id, extension) {
  console.log(extension);
  $('#callingSignal')[0].pause();
  $('#infoMessage').text(callee.full_name + ' has accepted this call');
};

QB.webrtc.onRejectCallListener = function(id, extension) {
  console.log(extension);
  $('.btn_mediacall, #hangup').attr('disabled', 'disabled');
  $('#audiocall, #videocall').removeAttr('disabled');
  $('video').attr('src', '');
  $('#callingSignal')[0].pause();
  $('#infoMessage').text(callee.full_name + ' has rejected this call');
};

QB.webrtc.onStopCallListener = function(id, extension) {
  console.log(extension);
  $('#infoMessage').text('Call was stopped');
  $('.btn_mediacall, #hangup').attr('disabled', 'disabled');
  $('#audiocall, #videocall').removeAttr('disabled');
  $('video').attr('src', '');
  $('#endCallSignal')[0].play();
};

QB.webrtc.onRemoteStreamListener = function(stream) {
  QB.webrtc.attachMediaStream('remoteVideo', stream);
};

function createSession() {
  $('.choose-recipient').addClass('hidden');
  $('.connecting').removeClass('hidden');
  $('#infoMessage').text('Creating QB session...');
  QB.createSession(caller, function(err, res) {
    if (res) {
      connectChat();
    }
  });
}

function connectChat() {
  $('#infoMessage').text('Connecting to chat...');
  QB.chat.connect({
    jid: QB.chat.helpers.getUserJid(caller.id, QBApp.appId),
    password: caller.password
  }, function(err, res) {
    $('.connecting').addClass('hidden');
    $('.chat').removeClass('hidden');
    $('#callerName').text(caller.full_name);
    $('#calleeName').text(callee.full_name);
    $('#infoMessage').text('Make a call to your opponent');
  })
}


// Alex

function chooseRecipient(id) {
  $('.choose-user').addClass('hidden');
  $('.choose-recipient').removeClass('hidden');
  appendUsers('.users-wrap.recipient', id);
  $('.choose-recipient').removeClass('hidden');
}

function appendUsers(el, excludeID) {
  for (var i = 0, len = QBUsers.length; i < len; ++i) {
    var user = QBUsers[i];
    var userBtn = $('<button>').attr({
      'class' : 'user',
      'id' : user.id,
      'data-login' : user.login,
      'data-password' : user.password,
      'data-name' : user.full_name
    });
    if (excludeID == user.id) userBtn.prop('disabled', true);
    var imgWrap = $('<div>').addClass('icon-wrap').html( userIcon(user.colour) ).appendTo(userBtn);
    var userFullName = $('<div>').addClass('name').text(user.full_name).appendTo(userBtn);
    userBtn.appendTo(el);
  }
  
}

function userIcon(hexColorCode) {
  return '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="30" height="30" viewBox="0 0 48 48"><path d="M24 30c0 0-16 0-22 14 0 0 10.020 4 22 4s22-4 22-4c-6-14-22-14-22-14zM24 28c6 0 10-6 10-16s-10-10-10-10-10 0-10 10 4 16 10 16z" fill="#' + (hexColorCode || '666') + '"></path></svg>';
}
