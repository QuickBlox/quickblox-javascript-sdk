// cross-browser polyfill
window.URL = window.URL || window.webkitURL;
navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia;

(function(global, document, navigator) {
  function WebRTC() {}

  // get local stream from user media interface (web-camera, microphone)
  WebRTC.prototype.getUserMedia = function(params, callback) {
    if (!navigator.getUserMedia) throw new Error('getUserMedia() is not supported in your browser');
    var self = this;
    
    // Additional parameters for Media Constraints
    // http://tools.ietf.org/html/draft-alvestrand-constraints-resolution-00
    /**********************************************
     * googEchoCancellation: true
     * googAutoGainControl: true
     * googNoiseSuppression: true
     * googHighpassFilter: true
     * minWidth: 640
     * minHeight: 480
     * maxWidth: 1280
     * maxHeight: 720
     * minFrameRate: 60
     * maxAspectRatio: 1.333
    **********************************************/
    navigator.getUserMedia(
      params,

      function(stream) {
        self.localStream = stream;
        if (params.elemId)
          self.attachMediaStream(params.elemId, stream, params.options);
        callback(stream, null);
      },

      function(err) {
        callback(null, err);
      }
    );
  };

  // attach media stream to audio/video element
  WebRTC.prototype.attachMediaStream = function(id, stream, options) {
    var elem = document.getElementById(id);
    if (elem) {
      elem.src = global.URL.createObjectURL(stream);
      if (options && options.muted) elem.muted = true;
      if (options && options.mirror) {
        elem.style.webkitTransform = 'scaleX(-1)';
        elem.style.transform = 'scaleX(-1)';
      }
      elem.play();
    }
  };

  // take a screenshot from video stream
  WebRTC.prototype.snapshot = function(id) {
    var video = document.getElementById(id),
        canvas = document.createElement('canvas'),
        context = canvas.getContext('2d');
    
    if (video) {
      canvas.width = video.clientWidth;
      canvas.height = video.clientHeight;
      if (video.style.transform === 'scaleX(-1)') {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }
      context.drawImage(video, 0, 0, video.clientWidth, video.clientHeight);

      return canvas.toDataURL('image/png');
    }
  };

  // add CSS filters to video stream
  // http://css-tricks.com/almanac/properties/f/filter/
  WebRTC.prototype.filter = function(id, filters) {
    var video = document.getElementById(id);
    if (video) {
      video.style.webkitFilter = filters;
      video.style.filter = filters;
    }
  };

  global.webrtc = new WebRTC;

})(this, document, navigator);
