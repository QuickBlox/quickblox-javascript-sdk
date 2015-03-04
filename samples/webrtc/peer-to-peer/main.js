var mediaParams, caller, callee;

QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret);

$(document).ready(function() {
  $('.loginForm .btn').on('click', function() {
    var callerIndex = $('#loginUser').val();
    var calleeIndex = $('#opponentUser').val();

    if (callerIndex === calleeIndex) return alert('Please choose your opponent!');
    createSession(QBUsers[callerIndex], QBUsers[calleeIndex]);
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

function createSession(newCaller, newCallee) {
  $('.login').addClass('hidden');
  $('.connecting').removeClass('hidden');
  $('#infoMessage').text('Creating QB session...');
  QB.createSession(newCaller, function(err, res) {
    if (res) {
      caller = newCaller;
      callee = newCallee;
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
