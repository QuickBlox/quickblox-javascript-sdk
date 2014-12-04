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
  } else {
    console.log(err);
  }
});

$('#photo').on('click', function() {
  var src = webrtc.takePhoto('localVideo');
  $('body').append('<img src="'+src+'">');
});
