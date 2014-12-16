(function(window, document, navigator) {
  // cross-browser polyfill
  var RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
  var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
  var RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;
  var getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia).bind(navigator);
  var URL = window.URL || window.webkitURL;

  var PC_CONFIG = {
    'iceServers': [
      {
        'url': 'stun:stun.l.google.com:19302'
      },
      {
        'url': 'turn:192.158.29.39:3478?transport=udp',
        'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        'username': '28224511:1379330808'
      },
      {
        'url': 'turn:192.158.29.39:3478?transport=tcp',
        'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        'username': '28224511:1379330808'
      }
    ]
  };

  var peer;

  function WebRTC() {}

/* User Media Steam
--------------------------------------------------------------------------------- */

  // get local stream from user media interface (web-camera, microphone)
  WebRTC.prototype.getUserMedia = function(params, callback) {
    if (!getUserMedia) throw new Error('getUserMedia() is not supported in your browser');
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
    getUserMedia(
      params,

      function(stream) {
        self.localStream = stream;
        if (params.elemId)
          self.attachMediaStream(params.elemId, stream, params.options);
        callback(null, stream);
      },

      function(err) {
        callback(err, null);
      }
    );
  };

  WebRTC.prototype.attachMediaStream = function(id, stream, options) {
    var elem = document.getElementById(id);
    if (elem) {
      elem.src = URL.createObjectURL(stream);
      if (options && options.muted) elem.muted = true;
      if (options && options.mirror) {
        elem.style.webkitTransform = 'scaleX(-1)';
        elem.style.transform = 'scaleX(-1)';
      }
      elem.play();
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

/* Real-Time Communication
--------------------------------------------------------------------------------- */
  
  WebRTC.prototype.createPeer = function(params) {
    if (!RTCPeerConnection) throw new Error('RTCPeerConnection() is not supported in your browser');
    if (!this.localStream) throw new Error("You don't have an access to the local stream");
    
    // Additional parameters for RTCPeerConnection options
    // new RTCPeerConnection(PC_CONFIG, options)
    /**********************************************
     * DtlsSrtpKeyAgreement: true
     * RtpDataChannels: true
    **********************************************/
    peer = new RTCPeerConnection(PC_CONFIG);
    peer.init(this, params);
    console.log(peer);
  };

  WebRTC.prototype.call = function() {
    // Additional parameters for SDP Constraints
    // http://www.w3.org/TR/webrtc/#constraints
    // peer.createOffer(successCallback, errorCallback, constraints)
    peer.createOffer(peer.onGetDescriptionCallback, peer.onErrorDescriptionCallback);
  };

  WebRTC.prototype.accept = function() {
    peer.createAnswer(peer.onGetDescriptionCallback, peer.onErrorDescriptionCallback);
    // peer.createAnswer(peer.remoteDescription, peer.onGetDescriptionCallback);
  };

  WebRTC.prototype.reject = function() {

  };

  WebRTC.prototype.hangup = function() {
    this.localStream.stop();
    peer.close();
    peer = null;
  };

/* RTCPeerConnection extension
--------------------------------------------------------------------------------- */

  RTCPeerConnection.prototype.init = function(service, options) {
    console.log('[QBWebRTC]: Peer options', options);
    var desc;

    this.service = service;
    this.sessionId = options && options.sessionId || Date.now();
    this.peerType = options && options.peerType || 'offer';
    this.addStream(this.service.localStream);

    if (this.peerType === 'answer') {
      desc = new RTCSessionDescription(options.sdp);
      // this.setRemoteDescription(desc, successCallback, errorCallback);
      this.setRemoteDescription(desc);
    }

    this.onicecandidate = this.onIceCandidateCallback;
    this.onaddstream = this.onRemoteStreamCallback;

    this.oniceconnectionstatechange = function() {
      console.log(111, 'oniceconnectionstatechange START');
      console.log(peer.iceConnectionState);
      console.log(111, 'oniceconnectionstatechange END');
    };
    this.onsignalingstatechange = function() {
      console.log(222, 'onsignalingstatechange START');
      console.log(peer.iceGatheringState);
      console.log(peer.signalingState);
      console.log(222, 'onsignalingstatechange END');
    };
  };

  RTCPeerConnection.prototype.onGetDescriptionCallback = function(desc) {
    console.log(desc);
    // peer.setLocalDescription(desc, successCallback, errorCallback);
    peer.setLocalDescription(desc);
    // signalingChannel.send(JSON.stringify({'sdp': desc}));
  };

  RTCPeerConnection.prototype.onIceCandidateCallback = function(evt) {
    console.log(evt.candidate);
    // if (evt.candidate) {
    //   sendMessage({type: 'candidate',
    //     label: evt.candidate.sdpMLineIndex,
    //     id: evt.candidate.sdpMid,
    //     candidate: evt.candidate.candidate});
    // } else {
    //   console.log("End of candidates.");
    // }
    // signalingChannel.send(JSON.stringify({'candidate': evt.candidate}));
  };

  RTCPeerConnection.prototype.onRemoteStreamCallback = function(evt) {
    console.log('[QBWebRTC]: Remote stream', evt);
    if (typeof peer.service.onRemoteStreamListener === 'function')
      peer.service.onRemoteStreamListener(evt.stream);
  };

  // var candidate = new RTCIceCandidate({sdpMLineIndex:msg.label,
  //                                      candidate:msg.candidate});
  // peer.addIceCandidate(candidate);
  // peer.addIceCandidate(new RTCIceCandidate(signal.candidate));

  window.webrtc = new WebRTC;

})(this, document, navigator);
