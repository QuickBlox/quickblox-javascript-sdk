var params = {
  audio: true,
  video: true,
  elemId: 'localVideo',
  // options: {
  //   muted: true,
  //   mirror: true
  // }
};

webrtc.getUserMedia(params, function(stream, err) {
  if (stream) {
    console.log(stream);
  } else {
    console.log(err);
  }
});

$('#snapshot').on('click', function() {
  var src = webrtc.snapshot('localVideo');
  $('body').append('<img src="'+src+'">');
});

// webrtc.filter('localVideo', 'blur(2px) sepia(1)');
