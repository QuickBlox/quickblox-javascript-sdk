window.URL = window.URL || window.webkitURL;
navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia;

var webrtc = (function(window, document, navigator) {
  function WebRTC() {}

  // get local stream from user media interface (web-camera, microphone)
  WebRTC.prototype.getUserMedia = function(params, callback) {
    if (!navigator.getUserMedia) throw new Error('getUserMedia is not supported for your browser');
    var self = this;
    
    navigator.getUserMedia(
      params,

      function(stream) {
        self.localStream = stream;
        if (params.localElement)
          self.attachMediaStream(params.localElement, stream);
        callback(stream, null);
      },

      function(err) {
        callback(null, err);
      }
    );
  };

  // attach media stream to audio/video element
  WebRTC.prototype.attachMediaStream = function(id, stream) {
    var elem = document.getElementById(id);
    if (elem) elem.src = window.URL.createObjectURL(stream);
  };

  return new WebRTC;
})(this, document, navigator);
