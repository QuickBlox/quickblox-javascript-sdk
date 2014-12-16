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
var caller, opponent;

$(document).ready(function() {
  QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret);

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
    var params = {
      audio: true,
      video: true,
      elemId: 'localVideo',
      options: {
        muted: true,
        mirror: true
      }
    };

    QB.webrtc.getUserMedia(params, function(err, stream) {
      if (err) {
        console.log(err);
      } else {
        console.log(stream);
        QB.webrtc.createPeer();
        console.log(1111111111111);
        QB.webrtc.call();
      }
    });    
  });  

  // webrtc.onRemoteStreamListener = function(stream) {
  //   console.log(stream);
  //   webrtc.attachMediaStream('remoteVideo', stream);
  // };
});

function connectChat() {
  QB.chat.connect({
    jid: QB.chat.helpers.getUserJid(caller.id, QBApp.appId),
    password: caller.password
  }, function(err, res) {
    
  })
}

// $('#snapshot').on('click', function() {
//   var src = webrtc.snapshot('localVideo');
//   $('body').append('<img src="'+src+'">');
// });
  
// webrtc.filter('localVideo', 'blur(2px) sepia(1)');
