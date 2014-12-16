var params = {
  audio: true,
  video: true,
  elemId: 'localVideo',
  options: {
    muted: true,
    mirror: true
  }
};

webrtc.getUserMedia(params, function(stream, err) {
  if (stream) {
    console.log(stream);
    webrtc.createPeer();
  } else {
    console.log(err);
  }
});

webrtc.onRemoteStreamListener = function(stream) {
  console.log(stream);
  webrtc.attachMediaStream('remoteVideo', stream);
};

$('#snapshot').on('click', function() {
  var src = webrtc.snapshot('localVideo');
  $('body').append('<img src="'+src+'">');
});

$('#call').on('click', function() {
  webrtc.call();
});

// webrtc.filter('localVideo', 'blur(2px) sepia(1)');
