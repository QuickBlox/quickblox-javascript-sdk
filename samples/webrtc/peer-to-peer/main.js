var QBApp = {
  appId: 9068,
  authKey: 'jxceTebX-Tdjczq',
  authSecret: '7CgdO4zTd8rLUDM'
};
var QBUser1 = {
  id: 1018619,
  login: 'Bob',
  password: '123123123'
};
var QBUser2 = {
  id: 1018620,
  login: 'Sam',
  password: '123123123'
};

var caller,
    opponent,
    peerParams;

QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret);

$(document).ready(function() {

  var mediaParams = {
    audio: true,
    video: true,
    elemId: 'localVideo',
    options: {
      muted: true,
      mirror: true
    }
  };

  $('#loginUser1').on('click', function() {
    QB.createSession(QBUser1, function(err, res) {
      if (res) {
        caller = QBUser1;
        opponent = QBUser2;
        connectChat();
      }
    });
  });

  $('#loginUser2').on('click', function() {
    QB.createSession(QBUser2, function(err, res) {
      if (res) {
        caller = QBUser2;
        opponent = QBUser1;
        connectChat();
      }
    });
  });

  $('#call').on('click', function() {
    QB.webrtc.getUserMedia(mediaParams, function(err, stream) {
      if (err) {
        console.log(err);
      } else {
        // console.log(stream);
        QB.webrtc.createPeer();
        QB.webrtc.call(opponent.id, 'video');
      }
    });
  });

  $('#accept').on('click', function() {
    QB.webrtc.getUserMedia(mediaParams, function(err, stream) {
      if (err) {
        console.log(err);
      } else {
        // console.log(stream);
        QB.webrtc.createPeer({
          sessionID: peerParams.sessionID,
          description: peerParams.sdp
        });
        QB.webrtc.accept(opponent.id);
      }
    });
  });

  $('#reject').on('click', function() {
    QB.webrtc.reject(opponent.id, {
      sessionID: peerParams.sessionID
    });
  });

  $('#hangup').on('click', function() {
    QB.webrtc.stop(opponent.id, 'manually');
    QB.webrtc.hangup();
  });

  $('#mute').on('click', function() {
    // QB.webrtc.mute('audio');
    QB.webrtc.mute('video');
  });

  $('#unmute').on('click', function() {
    // QB.webrtc.unmute('audio');
    QB.webrtc.unmute('video');
  });

});

function connectChat() {
  QB.chat.connect({
    jid: QB.chat.helpers.getUserJid(caller.id, QBApp.appId),
    password: caller.password
  }, function(err, res) {
    
  })
}

QB.webrtc.onCallListener = function(id, extension) {
  console.log(extension);
  peerParams = extension;
};

QB.webrtc.onAcceptCallListener = function(id, extension) {
  console.log(extension);
};

QB.webrtc.onRejectCallListener = function(id, extension) {
  console.log(extension);
  QB.webrtc.hangup();
};

QB.webrtc.onStopCallListener = function(id, extension) {
  console.log(extension);
  QB.webrtc.hangup();
};

QB.webrtc.onRemoteStreamListener = function(stream) {
  // console.log(stream);
  QB.webrtc.attachMediaStream('remoteVideo', stream);
};

$('#snapshot').on('click', function() {
  var blob = QB.webrtc.snapshot('localVideo');
  $('body').append('<img src="'+blob.url+'">');
  blob.download();
});
  
// QB.webrtc.filter('localVideo', 'blur(2px) sepia(1)');
