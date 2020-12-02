(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.QB = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function(e,r){"object"==typeof exports?module.exports=exports=r():"function"==typeof define&&define.amd?define([],r):e.CryptoJS=r()})(this,function(){var e=e||function(e,r){var t={},i=t.lib={},n=i.Base=function(){function e(){}return{extend:function(r){e.prototype=this;var t=new e;return r&&t.mixIn(r),t.hasOwnProperty("init")||(t.init=function(){t.$super.init.apply(this,arguments)}),t.init.prototype=t,t.$super=this,t},create:function(){var e=this.extend();return e.init.apply(e,arguments),e},init:function(){},mixIn:function(e){for(var r in e)e.hasOwnProperty(r)&&(this[r]=e[r]);e.hasOwnProperty("toString")&&(this.toString=e.toString)},clone:function(){return this.init.prototype.extend(this)}}}(),o=i.WordArray=n.extend({init:function(e,t){e=this.words=e||[],this.sigBytes=t!=r?t:4*e.length},toString:function(e){return(e||s).stringify(this)},concat:function(e){var r=this.words,t=e.words,i=this.sigBytes,n=e.sigBytes;if(this.clamp(),i%4)for(var o=0;n>o;o++){var c=255&t[o>>>2]>>>24-8*(o%4);r[i+o>>>2]|=c<<24-8*((i+o)%4)}else if(t.length>65535)for(var o=0;n>o;o+=4)r[i+o>>>2]=t[o>>>2];else r.push.apply(r,t);return this.sigBytes+=n,this},clamp:function(){var r=this.words,t=this.sigBytes;r[t>>>2]&=4294967295<<32-8*(t%4),r.length=e.ceil(t/4)},clone:function(){var e=n.clone.call(this);return e.words=this.words.slice(0),e},random:function(r){for(var t=[],i=0;r>i;i+=4)t.push(0|4294967296*e.random());return new o.init(t,r)}}),c=t.enc={},s=c.Hex={stringify:function(e){for(var r=e.words,t=e.sigBytes,i=[],n=0;t>n;n++){var o=255&r[n>>>2]>>>24-8*(n%4);i.push((o>>>4).toString(16)),i.push((15&o).toString(16))}return i.join("")},parse:function(e){for(var r=e.length,t=[],i=0;r>i;i+=2)t[i>>>3]|=parseInt(e.substr(i,2),16)<<24-4*(i%8);return new o.init(t,r/2)}},u=c.Latin1={stringify:function(e){for(var r=e.words,t=e.sigBytes,i=[],n=0;t>n;n++){var o=255&r[n>>>2]>>>24-8*(n%4);i.push(String.fromCharCode(o))}return i.join("")},parse:function(e){for(var r=e.length,t=[],i=0;r>i;i++)t[i>>>2]|=(255&e.charCodeAt(i))<<24-8*(i%4);return new o.init(t,r)}},f=c.Utf8={stringify:function(e){try{return decodeURIComponent(escape(u.stringify(e)))}catch(r){throw Error("Malformed UTF-8 data")}},parse:function(e){return u.parse(unescape(encodeURIComponent(e)))}},a=i.BufferedBlockAlgorithm=n.extend({reset:function(){this._data=new o.init,this._nDataBytes=0},_append:function(e){"string"==typeof e&&(e=f.parse(e)),this._data.concat(e),this._nDataBytes+=e.sigBytes},_process:function(r){var t=this._data,i=t.words,n=t.sigBytes,c=this.blockSize,s=4*c,u=n/s;u=r?e.ceil(u):e.max((0|u)-this._minBufferSize,0);var f=u*c,a=e.min(4*f,n);if(f){for(var p=0;f>p;p+=c)this._doProcessBlock(i,p);var d=i.splice(0,f);t.sigBytes-=a}return new o.init(d,a)},clone:function(){var e=n.clone.call(this);return e._data=this._data.clone(),e},_minBufferSize:0});i.Hasher=a.extend({cfg:n.extend(),init:function(e){this.cfg=this.cfg.extend(e),this.reset()},reset:function(){a.reset.call(this),this._doReset()},update:function(e){return this._append(e),this._process(),this},finalize:function(e){e&&this._append(e);var r=this._doFinalize();return r},blockSize:16,_createHelper:function(e){return function(r,t){return new e.init(t).finalize(r)}},_createHmacHelper:function(e){return function(r,t){return new p.HMAC.init(e,t).finalize(r)}}});var p=t.algo={};return t}(Math);return e});
},{}],2:[function(require,module,exports){
(function(e,r){"object"==typeof exports?module.exports=exports=r(require("./core"),require("./sha1"),require("./hmac")):"function"==typeof define&&define.amd?define(["./core","./sha1","./hmac"],r):r(e.CryptoJS)})(this,function(e){return e.HmacSHA1});
},{"./core":1,"./hmac":4,"./sha1":5}],3:[function(require,module,exports){
(function(e,r){"object"==typeof exports?module.exports=exports=r(require("./core"),require("./sha256"),require("./hmac")):"function"==typeof define&&define.amd?define(["./core","./sha256","./hmac"],r):r(e.CryptoJS)})(this,function(e){return e.HmacSHA256});
},{"./core":1,"./hmac":4,"./sha256":6}],4:[function(require,module,exports){
(function(e,r){"object"==typeof exports?module.exports=exports=r(require("./core")):"function"==typeof define&&define.amd?define(["./core"],r):r(e.CryptoJS)})(this,function(e){(function(){var r=e,t=r.lib,n=t.Base,i=r.enc,o=i.Utf8,s=r.algo;s.HMAC=n.extend({init:function(e,r){e=this._hasher=new e.init,"string"==typeof r&&(r=o.parse(r));var t=e.blockSize,n=4*t;r.sigBytes>n&&(r=e.finalize(r)),r.clamp();for(var i=this._oKey=r.clone(),s=this._iKey=r.clone(),a=i.words,c=s.words,f=0;t>f;f++)a[f]^=1549556828,c[f]^=909522486;i.sigBytes=s.sigBytes=n,this.reset()},reset:function(){var e=this._hasher;e.reset(),e.update(this._iKey)},update:function(e){return this._hasher.update(e),this},finalize:function(e){var r=this._hasher,t=r.finalize(e);r.reset();var n=r.finalize(this._oKey.clone().concat(t));return n}})})()});
},{"./core":1}],5:[function(require,module,exports){
(function(e,r){"object"==typeof exports?module.exports=exports=r(require("./core")):"function"==typeof define&&define.amd?define(["./core"],r):r(e.CryptoJS)})(this,function(e){return function(){var r=e,t=r.lib,n=t.WordArray,i=t.Hasher,o=r.algo,s=[],c=o.SHA1=i.extend({_doReset:function(){this._hash=new n.init([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(e,r){for(var t=this._hash.words,n=t[0],i=t[1],o=t[2],c=t[3],a=t[4],f=0;80>f;f++){if(16>f)s[f]=0|e[r+f];else{var u=s[f-3]^s[f-8]^s[f-14]^s[f-16];s[f]=u<<1|u>>>31}var d=(n<<5|n>>>27)+a+s[f];d+=20>f?(i&o|~i&c)+1518500249:40>f?(i^o^c)+1859775393:60>f?(i&o|i&c|o&c)-1894007588:(i^o^c)-899497514,a=c,c=o,o=i<<30|i>>>2,i=n,n=d}t[0]=0|t[0]+n,t[1]=0|t[1]+i,t[2]=0|t[2]+o,t[3]=0|t[3]+c,t[4]=0|t[4]+a},_doFinalize:function(){var e=this._data,r=e.words,t=8*this._nDataBytes,n=8*e.sigBytes;return r[n>>>5]|=128<<24-n%32,r[(n+64>>>9<<4)+14]=Math.floor(t/4294967296),r[(n+64>>>9<<4)+15]=t,e.sigBytes=4*r.length,this._process(),this._hash},clone:function(){var e=i.clone.call(this);return e._hash=this._hash.clone(),e}});r.SHA1=i._createHelper(c),r.HmacSHA1=i._createHmacHelper(c)}(),e.SHA1});
},{"./core":1}],6:[function(require,module,exports){
(function(e,r){"object"==typeof exports?module.exports=exports=r(require("./core")):"function"==typeof define&&define.amd?define(["./core"],r):r(e.CryptoJS)})(this,function(e){return function(r){var t=e,n=t.lib,i=n.WordArray,o=n.Hasher,s=t.algo,c=[],a=[];(function(){function e(e){for(var t=r.sqrt(e),n=2;t>=n;n++)if(!(e%n))return!1;return!0}function t(e){return 0|4294967296*(e-(0|e))}for(var n=2,i=0;64>i;)e(n)&&(8>i&&(c[i]=t(r.pow(n,.5))),a[i]=t(r.pow(n,1/3)),i++),n++})();var f=[],u=s.SHA256=o.extend({_doReset:function(){this._hash=new i.init(c.slice(0))},_doProcessBlock:function(e,r){for(var t=this._hash.words,n=t[0],i=t[1],o=t[2],s=t[3],c=t[4],u=t[5],d=t[6],p=t[7],h=0;64>h;h++){if(16>h)f[h]=0|e[r+h];else{var y=f[h-15],l=(y<<25|y>>>7)^(y<<14|y>>>18)^y>>>3,m=f[h-2],x=(m<<15|m>>>17)^(m<<13|m>>>19)^m>>>10;f[h]=l+f[h-7]+x+f[h-16]}var v=c&u^~c&d,q=n&i^n&o^i&o,g=(n<<30|n>>>2)^(n<<19|n>>>13)^(n<<10|n>>>22),_=(c<<26|c>>>6)^(c<<21|c>>>11)^(c<<7|c>>>25),b=p+_+v+a[h]+f[h],S=g+q;p=d,d=u,u=c,c=0|s+b,s=o,o=i,i=n,n=0|b+S}t[0]=0|t[0]+n,t[1]=0|t[1]+i,t[2]=0|t[2]+o,t[3]=0|t[3]+s,t[4]=0|t[4]+c,t[5]=0|t[5]+u,t[6]=0|t[6]+d,t[7]=0|t[7]+p},_doFinalize:function(){var e=this._data,t=e.words,n=8*this._nDataBytes,i=8*e.sigBytes;return t[i>>>5]|=128<<24-i%32,t[(i+64>>>9<<4)+14]=r.floor(n/4294967296),t[(i+64>>>9<<4)+15]=n,e.sigBytes=4*t.length,this._process(),this._hash},clone:function(){var e=o.clone.call(this);return e._hash=this._hash.clone(),e}});t.SHA256=o._createHelper(u),t.HmacSHA256=o._createHmacHelper(u)}(Math),e.SHA256});
},{"./core":1}],7:[function(require,module,exports){
/*
 *  Copyright (c) 2017 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var SDPUtils = require('sdp');

function fixStatsType(stat) {
  return {
    inboundrtp: 'inbound-rtp',
    outboundrtp: 'outbound-rtp',
    candidatepair: 'candidate-pair',
    localcandidate: 'local-candidate',
    remotecandidate: 'remote-candidate'
  }[stat.type] || stat.type;
}

function writeMediaSection(transceiver, caps, type, stream, dtlsRole) {
  var sdp = SDPUtils.writeRtpDescription(transceiver.kind, caps);

  // Map ICE parameters (ufrag, pwd) to SDP.
  sdp += SDPUtils.writeIceParameters(
      transceiver.iceGatherer.getLocalParameters());

  // Map DTLS parameters to SDP.
  sdp += SDPUtils.writeDtlsParameters(
      transceiver.dtlsTransport.getLocalParameters(),
      type === 'offer' ? 'actpass' : dtlsRole || 'active');

  sdp += 'a=mid:' + transceiver.mid + '\r\n';

  if (transceiver.rtpSender && transceiver.rtpReceiver) {
    sdp += 'a=sendrecv\r\n';
  } else if (transceiver.rtpSender) {
    sdp += 'a=sendonly\r\n';
  } else if (transceiver.rtpReceiver) {
    sdp += 'a=recvonly\r\n';
  } else {
    sdp += 'a=inactive\r\n';
  }

  if (transceiver.rtpSender) {
    var trackId = transceiver.rtpSender._initialTrackId ||
        transceiver.rtpSender.track.id;
    transceiver.rtpSender._initialTrackId = trackId;
    // spec.
    var msid = 'msid:' + (stream ? stream.id : '-') + ' ' +
        trackId + '\r\n';
    sdp += 'a=' + msid;
    // for Chrome. Legacy should no longer be required.
    sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
        ' ' + msid;

    // RTX
    if (transceiver.sendEncodingParameters[0].rtx) {
      sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
          ' ' + msid;
      sdp += 'a=ssrc-group:FID ' +
          transceiver.sendEncodingParameters[0].ssrc + ' ' +
          transceiver.sendEncodingParameters[0].rtx.ssrc +
          '\r\n';
    }
  }
  // FIXME: this should be written by writeRtpDescription.
  sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
      ' cname:' + SDPUtils.localCName + '\r\n';
  if (transceiver.rtpSender && transceiver.sendEncodingParameters[0].rtx) {
    sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
        ' cname:' + SDPUtils.localCName + '\r\n';
  }
  return sdp;
}

// Edge does not like
// 1) stun: filtered after 14393 unless ?transport=udp is present
// 2) turn: that does not have all of turn:host:port?transport=udp
// 3) turn: with ipv6 addresses
// 4) turn: occurring muliple times
function filterIceServers(iceServers, edgeVersion) {
  var hasTurn = false;
  iceServers = JSON.parse(JSON.stringify(iceServers));
  return iceServers.filter(function(server) {
    if (server && (server.urls || server.url)) {
      var urls = server.urls || server.url;
      if (server.url && !server.urls) {
        console.warn('RTCIceServer.url is deprecated! Use urls instead.');
      }
      var isString = typeof urls === 'string';
      if (isString) {
        urls = [urls];
      }
      urls = urls.filter(function(url) {
        var validTurn = url.indexOf('turn:') === 0 &&
            url.indexOf('transport=udp') !== -1 &&
            url.indexOf('turn:[') === -1 &&
            !hasTurn;

        if (validTurn) {
          hasTurn = true;
          return true;
        }
        return url.indexOf('stun:') === 0 && edgeVersion >= 14393 &&
            url.indexOf('?transport=udp') === -1;
      });

      delete server.url;
      server.urls = isString ? urls[0] : urls;
      return !!urls.length;
    }
  });
}

// Determines the intersection of local and remote capabilities.
function getCommonCapabilities(localCapabilities, remoteCapabilities) {
  var commonCapabilities = {
    codecs: [],
    headerExtensions: [],
    fecMechanisms: []
  };

  var findCodecByPayloadType = function(pt, codecs) {
    pt = parseInt(pt, 10);
    for (var i = 0; i < codecs.length; i++) {
      if (codecs[i].payloadType === pt ||
          codecs[i].preferredPayloadType === pt) {
        return codecs[i];
      }
    }
  };

  var rtxCapabilityMatches = function(lRtx, rRtx, lCodecs, rCodecs) {
    var lCodec = findCodecByPayloadType(lRtx.parameters.apt, lCodecs);
    var rCodec = findCodecByPayloadType(rRtx.parameters.apt, rCodecs);
    return lCodec && rCodec &&
        lCodec.name.toLowerCase() === rCodec.name.toLowerCase();
  };

  localCapabilities.codecs.forEach(function(lCodec) {
    for (var i = 0; i < remoteCapabilities.codecs.length; i++) {
      var rCodec = remoteCapabilities.codecs[i];
      if (lCodec.name.toLowerCase() === rCodec.name.toLowerCase() &&
          lCodec.clockRate === rCodec.clockRate) {
        if (lCodec.name.toLowerCase() === 'rtx' &&
            lCodec.parameters && rCodec.parameters.apt) {
          // for RTX we need to find the local rtx that has a apt
          // which points to the same local codec as the remote one.
          if (!rtxCapabilityMatches(lCodec, rCodec,
              localCapabilities.codecs, remoteCapabilities.codecs)) {
            continue;
          }
        }
        rCodec = JSON.parse(JSON.stringify(rCodec)); // deepcopy
        // number of channels is the highest common number of channels
        rCodec.numChannels = Math.min(lCodec.numChannels,
            rCodec.numChannels);
        // push rCodec so we reply with offerer payload type
        commonCapabilities.codecs.push(rCodec);

        // determine common feedback mechanisms
        rCodec.rtcpFeedback = rCodec.rtcpFeedback.filter(function(fb) {
          for (var j = 0; j < lCodec.rtcpFeedback.length; j++) {
            if (lCodec.rtcpFeedback[j].type === fb.type &&
                lCodec.rtcpFeedback[j].parameter === fb.parameter) {
              return true;
            }
          }
          return false;
        });
        // FIXME: also need to determine .parameters
        //  see https://github.com/openpeer/ortc/issues/569
        break;
      }
    }
  });

  localCapabilities.headerExtensions.forEach(function(lHeaderExtension) {
    for (var i = 0; i < remoteCapabilities.headerExtensions.length;
         i++) {
      var rHeaderExtension = remoteCapabilities.headerExtensions[i];
      if (lHeaderExtension.uri === rHeaderExtension.uri) {
        commonCapabilities.headerExtensions.push(rHeaderExtension);
        break;
      }
    }
  });

  // FIXME: fecMechanisms
  return commonCapabilities;
}

// is action=setLocalDescription with type allowed in signalingState
function isActionAllowedInSignalingState(action, type, signalingState) {
  return {
    offer: {
      setLocalDescription: ['stable', 'have-local-offer'],
      setRemoteDescription: ['stable', 'have-remote-offer']
    },
    answer: {
      setLocalDescription: ['have-remote-offer', 'have-local-pranswer'],
      setRemoteDescription: ['have-local-offer', 'have-remote-pranswer']
    }
  }[type][action].indexOf(signalingState) !== -1;
}

function maybeAddCandidate(iceTransport, candidate) {
  // Edge's internal representation adds some fields therefore
  // not all fieldѕ are taken into account.
  var alreadyAdded = iceTransport.getRemoteCandidates()
      .find(function(remoteCandidate) {
        return candidate.foundation === remoteCandidate.foundation &&
            candidate.ip === remoteCandidate.ip &&
            candidate.port === remoteCandidate.port &&
            candidate.priority === remoteCandidate.priority &&
            candidate.protocol === remoteCandidate.protocol &&
            candidate.type === remoteCandidate.type;
      });
  if (!alreadyAdded) {
    iceTransport.addRemoteCandidate(candidate);
  }
  return !alreadyAdded;
}


function makeError(name, description) {
  var e = new Error(description);
  e.name = name;
  // legacy error codes from https://heycam.github.io/webidl/#idl-DOMException-error-names
  e.code = {
    NotSupportedError: 9,
    InvalidStateError: 11,
    InvalidAccessError: 15,
    TypeError: undefined,
    OperationError: undefined
  }[name];
  return e;
}

module.exports = function(window, edgeVersion) {
  // https://w3c.github.io/mediacapture-main/#mediastream
  // Helper function to add the track to the stream and
  // dispatch the event ourselves.
  function addTrackToStreamAndFireEvent(track, stream) {
    stream.addTrack(track);
    stream.dispatchEvent(new window.MediaStreamTrackEvent('addtrack',
        {track: track}));
  }

  function removeTrackFromStreamAndFireEvent(track, stream) {
    stream.removeTrack(track);
    stream.dispatchEvent(new window.MediaStreamTrackEvent('removetrack',
        {track: track}));
  }

  function fireAddTrack(pc, track, receiver, streams) {
    var trackEvent = new Event('track');
    trackEvent.track = track;
    trackEvent.receiver = receiver;
    trackEvent.transceiver = {receiver: receiver};
    trackEvent.streams = streams;
    window.setTimeout(function() {
      pc._dispatchEvent('track', trackEvent);
    });
  }

  var RTCPeerConnection = function(config) {
    var pc = this;

    var _eventTarget = document.createDocumentFragment();
    ['addEventListener', 'removeEventListener', 'dispatchEvent']
        .forEach(function(method) {
          pc[method] = _eventTarget[method].bind(_eventTarget);
        });

    this.canTrickleIceCandidates = null;

    this.needNegotiation = false;

    this.localStreams = [];
    this.remoteStreams = [];

    this._localDescription = null;
    this._remoteDescription = null;

    this.signalingState = 'stable';
    this.iceConnectionState = 'new';
    this.connectionState = 'new';
    this.iceGatheringState = 'new';

    config = JSON.parse(JSON.stringify(config || {}));

    this.usingBundle = config.bundlePolicy === 'max-bundle';
    if (config.rtcpMuxPolicy === 'negotiate') {
      throw(makeError('NotSupportedError',
          'rtcpMuxPolicy \'negotiate\' is not supported'));
    } else if (!config.rtcpMuxPolicy) {
      config.rtcpMuxPolicy = 'require';
    }

    switch (config.iceTransportPolicy) {
      case 'all':
      case 'relay':
        break;
      default:
        config.iceTransportPolicy = 'all';
        break;
    }

    switch (config.bundlePolicy) {
      case 'balanced':
      case 'max-compat':
      case 'max-bundle':
        break;
      default:
        config.bundlePolicy = 'balanced';
        break;
    }

    config.iceServers = filterIceServers(config.iceServers || [], edgeVersion);

    this._iceGatherers = [];
    if (config.iceCandidatePoolSize) {
      for (var i = config.iceCandidatePoolSize; i > 0; i--) {
        this._iceGatherers.push(new window.RTCIceGatherer({
          iceServers: config.iceServers,
          gatherPolicy: config.iceTransportPolicy
        }));
      }
    } else {
      config.iceCandidatePoolSize = 0;
    }

    this._config = config;

    // per-track iceGathers, iceTransports, dtlsTransports, rtpSenders, ...
    // everything that is needed to describe a SDP m-line.
    this.transceivers = [];

    this._sdpSessionId = SDPUtils.generateSessionId();
    this._sdpSessionVersion = 0;

    this._dtlsRole = undefined; // role for a=setup to use in answers.

    this._isClosed = false;
  };

  Object.defineProperty(RTCPeerConnection.prototype, 'localDescription', {
    configurable: true,
    get: function() {
      return this._localDescription;
    }
  });
  Object.defineProperty(RTCPeerConnection.prototype, 'remoteDescription', {
    configurable: true,
    get: function() {
      return this._remoteDescription;
    }
  });

  // set up event handlers on prototype
  RTCPeerConnection.prototype.onicecandidate = null;
  RTCPeerConnection.prototype.onaddstream = null;
  RTCPeerConnection.prototype.ontrack = null;
  RTCPeerConnection.prototype.onremovestream = null;
  RTCPeerConnection.prototype.onsignalingstatechange = null;
  RTCPeerConnection.prototype.oniceconnectionstatechange = null;
  RTCPeerConnection.prototype.onconnectionstatechange = null;
  RTCPeerConnection.prototype.onicegatheringstatechange = null;
  RTCPeerConnection.prototype.onnegotiationneeded = null;
  RTCPeerConnection.prototype.ondatachannel = null;

  RTCPeerConnection.prototype._dispatchEvent = function(name, event) {
    if (this._isClosed) {
      return;
    }
    this.dispatchEvent(event);
    if (typeof this['on' + name] === 'function') {
      this['on' + name](event);
    }
  };

  RTCPeerConnection.prototype._emitGatheringStateChange = function() {
    var event = new Event('icegatheringstatechange');
    this._dispatchEvent('icegatheringstatechange', event);
  };

  RTCPeerConnection.prototype.getConfiguration = function() {
    return this._config;
  };

  RTCPeerConnection.prototype.getLocalStreams = function() {
    return this.localStreams;
  };

  RTCPeerConnection.prototype.getRemoteStreams = function() {
    return this.remoteStreams;
  };

  // internal helper to create a transceiver object.
  // (which is not yet the same as the WebRTC 1.0 transceiver)
  RTCPeerConnection.prototype._createTransceiver = function(kind, doNotAdd) {
    var hasBundleTransport = this.transceivers.length > 0;
    var transceiver = {
      track: null,
      iceGatherer: null,
      iceTransport: null,
      dtlsTransport: null,
      localCapabilities: null,
      remoteCapabilities: null,
      rtpSender: null,
      rtpReceiver: null,
      kind: kind,
      mid: null,
      sendEncodingParameters: null,
      recvEncodingParameters: null,
      stream: null,
      associatedRemoteMediaStreams: [],
      wantReceive: true
    };
    if (this.usingBundle && hasBundleTransport) {
      transceiver.iceTransport = this.transceivers[0].iceTransport;
      transceiver.dtlsTransport = this.transceivers[0].dtlsTransport;
    } else {
      var transports = this._createIceAndDtlsTransports();
      transceiver.iceTransport = transports.iceTransport;
      transceiver.dtlsTransport = transports.dtlsTransport;
    }
    if (!doNotAdd) {
      this.transceivers.push(transceiver);
    }
    return transceiver;
  };

  RTCPeerConnection.prototype.addTrack = function(track, stream) {
    if (this._isClosed) {
      throw makeError('InvalidStateError',
          'Attempted to call addTrack on a closed peerconnection.');
    }

    var alreadyExists = this.transceivers.find(function(s) {
      return s.track === track;
    });

    if (alreadyExists) {
      throw makeError('InvalidAccessError', 'Track already exists.');
    }

    var transceiver;
    for (var i = 0; i < this.transceivers.length; i++) {
      if (!this.transceivers[i].track &&
          this.transceivers[i].kind === track.kind) {
        transceiver = this.transceivers[i];
      }
    }
    if (!transceiver) {
      transceiver = this._createTransceiver(track.kind);
    }

    this._maybeFireNegotiationNeeded();

    if (this.localStreams.indexOf(stream) === -1) {
      this.localStreams.push(stream);
    }

    transceiver.track = track;
    transceiver.stream = stream;
    transceiver.rtpSender = new window.RTCRtpSender(track,
        transceiver.dtlsTransport);
    return transceiver.rtpSender;
  };

  RTCPeerConnection.prototype.addStream = function(stream) {
    var pc = this;
    if (edgeVersion >= 15025) {
      stream.getTracks().forEach(function(track) {
        pc.addTrack(track, stream);
      });
    } else {
      // Clone is necessary for local demos mostly, attaching directly
      // to two different senders does not work (build 10547).
      // Fixed in 15025 (or earlier)
      var clonedStream = stream.clone();
      stream.getTracks().forEach(function(track, idx) {
        var clonedTrack = clonedStream.getTracks()[idx];
        track.addEventListener('enabled', function(event) {
          clonedTrack.enabled = event.enabled;
        });
      });
      clonedStream.getTracks().forEach(function(track) {
        pc.addTrack(track, clonedStream);
      });
    }
  };

  RTCPeerConnection.prototype.removeTrack = function(sender) {
    if (this._isClosed) {
      throw makeError('InvalidStateError',
          'Attempted to call removeTrack on a closed peerconnection.');
    }

    if (!(sender instanceof window.RTCRtpSender)) {
      throw new TypeError('Argument 1 of RTCPeerConnection.removeTrack ' +
          'does not implement interface RTCRtpSender.');
    }

    var transceiver = this.transceivers.find(function(t) {
      return t.rtpSender === sender;
    });

    if (!transceiver) {
      throw makeError('InvalidAccessError',
          'Sender was not created by this connection.');
    }
    var stream = transceiver.stream;

    transceiver.rtpSender.stop();
    transceiver.rtpSender = null;
    transceiver.track = null;
    transceiver.stream = null;

    // remove the stream from the set of local streams
    var localStreams = this.transceivers.map(function(t) {
      return t.stream;
    });
    if (localStreams.indexOf(stream) === -1 &&
        this.localStreams.indexOf(stream) > -1) {
      this.localStreams.splice(this.localStreams.indexOf(stream), 1);
    }

    this._maybeFireNegotiationNeeded();
  };

  RTCPeerConnection.prototype.removeStream = function(stream) {
    var pc = this;
    stream.getTracks().forEach(function(track) {
      var sender = pc.getSenders().find(function(s) {
        return s.track === track;
      });
      if (sender) {
        pc.removeTrack(sender);
      }
    });
  };

  RTCPeerConnection.prototype.getSenders = function() {
    return this.transceivers.filter(function(transceiver) {
      return !!transceiver.rtpSender;
    })
    .map(function(transceiver) {
      return transceiver.rtpSender;
    });
  };

  RTCPeerConnection.prototype.getReceivers = function() {
    return this.transceivers.filter(function(transceiver) {
      return !!transceiver.rtpReceiver;
    })
    .map(function(transceiver) {
      return transceiver.rtpReceiver;
    });
  };


  RTCPeerConnection.prototype._createIceGatherer = function(sdpMLineIndex,
      usingBundle) {
    var pc = this;
    if (usingBundle && sdpMLineIndex > 0) {
      return this.transceivers[0].iceGatherer;
    } else if (this._iceGatherers.length) {
      return this._iceGatherers.shift();
    }
    var iceGatherer = new window.RTCIceGatherer({
      iceServers: this._config.iceServers,
      gatherPolicy: this._config.iceTransportPolicy
    });
    Object.defineProperty(iceGatherer, 'state',
        {value: 'new', writable: true}
    );

    this.transceivers[sdpMLineIndex].bufferedCandidateEvents = [];
    this.transceivers[sdpMLineIndex].bufferCandidates = function(event) {
      var end = !event.candidate || Object.keys(event.candidate).length === 0;
      // polyfill since RTCIceGatherer.state is not implemented in
      // Edge 10547 yet.
      iceGatherer.state = end ? 'completed' : 'gathering';
      if (pc.transceivers[sdpMLineIndex].bufferedCandidateEvents !== null) {
        pc.transceivers[sdpMLineIndex].bufferedCandidateEvents.push(event);
      }
    };
    iceGatherer.addEventListener('localcandidate',
      this.transceivers[sdpMLineIndex].bufferCandidates);
    return iceGatherer;
  };

  // start gathering from an RTCIceGatherer.
  RTCPeerConnection.prototype._gather = function(mid, sdpMLineIndex) {
    var pc = this;
    var iceGatherer = this.transceivers[sdpMLineIndex].iceGatherer;
    if (iceGatherer.onlocalcandidate) {
      return;
    }
    var bufferedCandidateEvents =
      this.transceivers[sdpMLineIndex].bufferedCandidateEvents;
    this.transceivers[sdpMLineIndex].bufferedCandidateEvents = null;
    iceGatherer.removeEventListener('localcandidate',
      this.transceivers[sdpMLineIndex].bufferCandidates);
    iceGatherer.onlocalcandidate = function(evt) {
      if (pc.usingBundle && sdpMLineIndex > 0) {
        // if we know that we use bundle we can drop candidates with
        // ѕdpMLineIndex > 0. If we don't do this then our state gets
        // confused since we dispose the extra ice gatherer.
        return;
      }
      var event = new Event('icecandidate');
      event.candidate = {sdpMid: mid, sdpMLineIndex: sdpMLineIndex};

      var cand = evt.candidate;
      // Edge emits an empty object for RTCIceCandidateComplete‥
      var end = !cand || Object.keys(cand).length === 0;
      if (end) {
        // polyfill since RTCIceGatherer.state is not implemented in
        // Edge 10547 yet.
        if (iceGatherer.state === 'new' || iceGatherer.state === 'gathering') {
          iceGatherer.state = 'completed';
        }
      } else {
        if (iceGatherer.state === 'new') {
          iceGatherer.state = 'gathering';
        }
        // RTCIceCandidate doesn't have a component, needs to be added
        cand.component = 1;
        // also the usernameFragment. TODO: update SDP to take both variants.
        cand.ufrag = iceGatherer.getLocalParameters().usernameFragment;

        var serializedCandidate = SDPUtils.writeCandidate(cand);
        event.candidate = Object.assign(event.candidate,
            SDPUtils.parseCandidate(serializedCandidate));

        event.candidate.candidate = serializedCandidate;
        event.candidate.toJSON = function() {
          return {
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            usernameFragment: event.candidate.usernameFragment
          };
        };
      }

      // update local description.
      var sections = SDPUtils.getMediaSections(pc._localDescription.sdp);
      if (!end) {
        sections[event.candidate.sdpMLineIndex] +=
            'a=' + event.candidate.candidate + '\r\n';
      } else {
        sections[event.candidate.sdpMLineIndex] +=
            'a=end-of-candidates\r\n';
      }
      pc._localDescription.sdp =
          SDPUtils.getDescription(pc._localDescription.sdp) +
          sections.join('');
      var complete = pc.transceivers.every(function(transceiver) {
        return transceiver.iceGatherer &&
            transceiver.iceGatherer.state === 'completed';
      });

      if (pc.iceGatheringState !== 'gathering') {
        pc.iceGatheringState = 'gathering';
        pc._emitGatheringStateChange();
      }

      // Emit candidate. Also emit null candidate when all gatherers are
      // complete.
      if (!end) {
        pc._dispatchEvent('icecandidate', event);
      }
      if (complete) {
        pc._dispatchEvent('icecandidate', new Event('icecandidate'));
        pc.iceGatheringState = 'complete';
        pc._emitGatheringStateChange();
      }
    };

    // emit already gathered candidates.
    window.setTimeout(function() {
      bufferedCandidateEvents.forEach(function(e) {
        iceGatherer.onlocalcandidate(e);
      });
    }, 0);
  };

  // Create ICE transport and DTLS transport.
  RTCPeerConnection.prototype._createIceAndDtlsTransports = function() {
    var pc = this;
    var iceTransport = new window.RTCIceTransport(null);
    iceTransport.onicestatechange = function() {
      pc._updateIceConnectionState();
      pc._updateConnectionState();
    };

    var dtlsTransport = new window.RTCDtlsTransport(iceTransport);
    dtlsTransport.ondtlsstatechange = function() {
      pc._updateConnectionState();
    };
    dtlsTransport.onerror = function() {
      // onerror does not set state to failed by itself.
      Object.defineProperty(dtlsTransport, 'state',
          {value: 'failed', writable: true});
      pc._updateConnectionState();
    };

    return {
      iceTransport: iceTransport,
      dtlsTransport: dtlsTransport
    };
  };

  // Destroy ICE gatherer, ICE transport and DTLS transport.
  // Without triggering the callbacks.
  RTCPeerConnection.prototype._disposeIceAndDtlsTransports = function(
      sdpMLineIndex) {
    var iceGatherer = this.transceivers[sdpMLineIndex].iceGatherer;
    if (iceGatherer) {
      delete iceGatherer.onlocalcandidate;
      delete this.transceivers[sdpMLineIndex].iceGatherer;
    }
    var iceTransport = this.transceivers[sdpMLineIndex].iceTransport;
    if (iceTransport) {
      delete iceTransport.onicestatechange;
      delete this.transceivers[sdpMLineIndex].iceTransport;
    }
    var dtlsTransport = this.transceivers[sdpMLineIndex].dtlsTransport;
    if (dtlsTransport) {
      delete dtlsTransport.ondtlsstatechange;
      delete dtlsTransport.onerror;
      delete this.transceivers[sdpMLineIndex].dtlsTransport;
    }
  };

  // Start the RTP Sender and Receiver for a transceiver.
  RTCPeerConnection.prototype._transceive = function(transceiver,
      send, recv) {
    var params = getCommonCapabilities(transceiver.localCapabilities,
        transceiver.remoteCapabilities);
    if (send && transceiver.rtpSender) {
      params.encodings = transceiver.sendEncodingParameters;
      params.rtcp = {
        cname: SDPUtils.localCName,
        compound: transceiver.rtcpParameters.compound
      };
      if (transceiver.recvEncodingParameters.length) {
        params.rtcp.ssrc = transceiver.recvEncodingParameters[0].ssrc;
      }
      transceiver.rtpSender.send(params);
    }
    if (recv && transceiver.rtpReceiver && params.codecs.length > 0) {
      // remove RTX field in Edge 14942
      if (transceiver.kind === 'video'
          && transceiver.recvEncodingParameters
          && edgeVersion < 15019) {
        transceiver.recvEncodingParameters.forEach(function(p) {
          delete p.rtx;
        });
      }
      if (transceiver.recvEncodingParameters.length) {
        params.encodings = transceiver.recvEncodingParameters;
      } else {
        params.encodings = [{}];
      }
      params.rtcp = {
        compound: transceiver.rtcpParameters.compound
      };
      if (transceiver.rtcpParameters.cname) {
        params.rtcp.cname = transceiver.rtcpParameters.cname;
      }
      if (transceiver.sendEncodingParameters.length) {
        params.rtcp.ssrc = transceiver.sendEncodingParameters[0].ssrc;
      }
      transceiver.rtpReceiver.receive(params);
    }
  };

  RTCPeerConnection.prototype.setLocalDescription = function(description) {
    var pc = this;

    // Note: pranswer is not supported.
    if (['offer', 'answer'].indexOf(description.type) === -1) {
      return Promise.reject(makeError('TypeError',
          'Unsupported type "' + description.type + '"'));
    }

    if (!isActionAllowedInSignalingState('setLocalDescription',
        description.type, pc.signalingState) || pc._isClosed) {
      return Promise.reject(makeError('InvalidStateError',
          'Can not set local ' + description.type +
          ' in state ' + pc.signalingState));
    }

    var sections;
    var sessionpart;
    if (description.type === 'offer') {
      // VERY limited support for SDP munging. Limited to:
      // * changing the order of codecs
      sections = SDPUtils.splitSections(description.sdp);
      sessionpart = sections.shift();
      sections.forEach(function(mediaSection, sdpMLineIndex) {
        var caps = SDPUtils.parseRtpParameters(mediaSection);
        pc.transceivers[sdpMLineIndex].localCapabilities = caps;
      });

      pc.transceivers.forEach(function(transceiver, sdpMLineIndex) {
        pc._gather(transceiver.mid, sdpMLineIndex);
      });
    } else if (description.type === 'answer') {
      sections = SDPUtils.splitSections(pc._remoteDescription.sdp);
      sessionpart = sections.shift();
      var isIceLite = SDPUtils.matchPrefix(sessionpart,
          'a=ice-lite').length > 0;
      sections.forEach(function(mediaSection, sdpMLineIndex) {
        var transceiver = pc.transceivers[sdpMLineIndex];
        var iceGatherer = transceiver.iceGatherer;
        var iceTransport = transceiver.iceTransport;
        var dtlsTransport = transceiver.dtlsTransport;
        var localCapabilities = transceiver.localCapabilities;
        var remoteCapabilities = transceiver.remoteCapabilities;

        // treat bundle-only as not-rejected.
        var rejected = SDPUtils.isRejected(mediaSection) &&
            SDPUtils.matchPrefix(mediaSection, 'a=bundle-only').length === 0;

        if (!rejected && !transceiver.rejected) {
          var remoteIceParameters = SDPUtils.getIceParameters(
              mediaSection, sessionpart);
          var remoteDtlsParameters = SDPUtils.getDtlsParameters(
              mediaSection, sessionpart);
          if (isIceLite) {
            remoteDtlsParameters.role = 'server';
          }

          if (!pc.usingBundle || sdpMLineIndex === 0) {
            pc._gather(transceiver.mid, sdpMLineIndex);
            if (iceTransport.state === 'new') {
              iceTransport.start(iceGatherer, remoteIceParameters,
                  isIceLite ? 'controlling' : 'controlled');
            }
            if (dtlsTransport.state === 'new') {
              dtlsTransport.start(remoteDtlsParameters);
            }
          }

          // Calculate intersection of capabilities.
          var params = getCommonCapabilities(localCapabilities,
              remoteCapabilities);

          // Start the RTCRtpSender. The RTCRtpReceiver for this
          // transceiver has already been started in setRemoteDescription.
          pc._transceive(transceiver,
              params.codecs.length > 0,
              false);
        }
      });
    }

    pc._localDescription = {
      type: description.type,
      sdp: description.sdp
    };
    if (description.type === 'offer') {
      pc._updateSignalingState('have-local-offer');
    } else {
      pc._updateSignalingState('stable');
    }

    return Promise.resolve();
  };

  RTCPeerConnection.prototype.setRemoteDescription = function(description) {
    var pc = this;

    // Note: pranswer is not supported.
    if (['offer', 'answer'].indexOf(description.type) === -1) {
      return Promise.reject(makeError('TypeError',
          'Unsupported type "' + description.type + '"'));
    }

    if (!isActionAllowedInSignalingState('setRemoteDescription',
        description.type, pc.signalingState) || pc._isClosed) {
      return Promise.reject(makeError('InvalidStateError',
          'Can not set remote ' + description.type +
          ' in state ' + pc.signalingState));
    }

    var streams = {};
    pc.remoteStreams.forEach(function(stream) {
      streams[stream.id] = stream;
    });
    var receiverList = [];
    var sections = SDPUtils.splitSections(description.sdp);
    var sessionpart = sections.shift();
    var isIceLite = SDPUtils.matchPrefix(sessionpart,
        'a=ice-lite').length > 0;
    var usingBundle = SDPUtils.matchPrefix(sessionpart,
        'a=group:BUNDLE ').length > 0;
    pc.usingBundle = usingBundle;
    var iceOptions = SDPUtils.matchPrefix(sessionpart,
        'a=ice-options:')[0];
    if (iceOptions) {
      pc.canTrickleIceCandidates = iceOptions.substr(14).split(' ')
          .indexOf('trickle') >= 0;
    } else {
      pc.canTrickleIceCandidates = false;
    }

    sections.forEach(function(mediaSection, sdpMLineIndex) {
      var lines = SDPUtils.splitLines(mediaSection);
      var kind = SDPUtils.getKind(mediaSection);
      // treat bundle-only as not-rejected.
      var rejected = SDPUtils.isRejected(mediaSection) &&
          SDPUtils.matchPrefix(mediaSection, 'a=bundle-only').length === 0;
      var protocol = lines[0].substr(2).split(' ')[2];

      var direction = SDPUtils.getDirection(mediaSection, sessionpart);
      var remoteMsid = SDPUtils.parseMsid(mediaSection);

      var mid = SDPUtils.getMid(mediaSection) || SDPUtils.generateIdentifier();

      // Reject datachannels which are not implemented yet.
      if (rejected || (kind === 'application' && (protocol === 'DTLS/SCTP' ||
          protocol === 'UDP/DTLS/SCTP'))) {
        // TODO: this is dangerous in the case where a non-rejected m-line
        //     becomes rejected.
        pc.transceivers[sdpMLineIndex] = {
          mid: mid,
          kind: kind,
          protocol: protocol,
          rejected: true
        };
        return;
      }

      if (!rejected && pc.transceivers[sdpMLineIndex] &&
          pc.transceivers[sdpMLineIndex].rejected) {
        // recycle a rejected transceiver.
        pc.transceivers[sdpMLineIndex] = pc._createTransceiver(kind, true);
      }

      var transceiver;
      var iceGatherer;
      var iceTransport;
      var dtlsTransport;
      var rtpReceiver;
      var sendEncodingParameters;
      var recvEncodingParameters;
      var localCapabilities;

      var track;
      // FIXME: ensure the mediaSection has rtcp-mux set.
      var remoteCapabilities = SDPUtils.parseRtpParameters(mediaSection);
      var remoteIceParameters;
      var remoteDtlsParameters;
      if (!rejected) {
        remoteIceParameters = SDPUtils.getIceParameters(mediaSection,
            sessionpart);
        remoteDtlsParameters = SDPUtils.getDtlsParameters(mediaSection,
            sessionpart);
        remoteDtlsParameters.role = 'client';
      }
      recvEncodingParameters =
          SDPUtils.parseRtpEncodingParameters(mediaSection);

      var rtcpParameters = SDPUtils.parseRtcpParameters(mediaSection);

      var isComplete = SDPUtils.matchPrefix(mediaSection,
          'a=end-of-candidates', sessionpart).length > 0;
      var cands = SDPUtils.matchPrefix(mediaSection, 'a=candidate:')
          .map(function(cand) {
            return SDPUtils.parseCandidate(cand);
          })
          .filter(function(cand) {
            return cand.component === 1;
          });

      // Check if we can use BUNDLE and dispose transports.
      if ((description.type === 'offer' || description.type === 'answer') &&
          !rejected && usingBundle && sdpMLineIndex > 0 &&
          pc.transceivers[sdpMLineIndex]) {
        pc._disposeIceAndDtlsTransports(sdpMLineIndex);
        pc.transceivers[sdpMLineIndex].iceGatherer =
            pc.transceivers[0].iceGatherer;
        pc.transceivers[sdpMLineIndex].iceTransport =
            pc.transceivers[0].iceTransport;
        pc.transceivers[sdpMLineIndex].dtlsTransport =
            pc.transceivers[0].dtlsTransport;
        if (pc.transceivers[sdpMLineIndex].rtpSender) {
          pc.transceivers[sdpMLineIndex].rtpSender.setTransport(
              pc.transceivers[0].dtlsTransport);
        }
        if (pc.transceivers[sdpMLineIndex].rtpReceiver) {
          pc.transceivers[sdpMLineIndex].rtpReceiver.setTransport(
              pc.transceivers[0].dtlsTransport);
        }
      }
      if (description.type === 'offer' && !rejected) {
        transceiver = pc.transceivers[sdpMLineIndex] ||
            pc._createTransceiver(kind);
        transceiver.mid = mid;

        if (!transceiver.iceGatherer) {
          transceiver.iceGatherer = pc._createIceGatherer(sdpMLineIndex,
              usingBundle);
        }

        if (cands.length && transceiver.iceTransport.state === 'new') {
          if (isComplete && (!usingBundle || sdpMLineIndex === 0)) {
            transceiver.iceTransport.setRemoteCandidates(cands);
          } else {
            cands.forEach(function(candidate) {
              maybeAddCandidate(transceiver.iceTransport, candidate);
            });
          }
        }

        localCapabilities = window.RTCRtpReceiver.getCapabilities(kind);

        // filter RTX until additional stuff needed for RTX is implemented
        // in adapter.js
        if (edgeVersion < 15019) {
          localCapabilities.codecs = localCapabilities.codecs.filter(
              function(codec) {
                return codec.name !== 'rtx';
              });
        }

        sendEncodingParameters = transceiver.sendEncodingParameters || [{
          ssrc: (2 * sdpMLineIndex + 2) * 1001
        }];

        // TODO: rewrite to use http://w3c.github.io/webrtc-pc/#set-associated-remote-streams
        var isNewTrack = false;
        if (direction === 'sendrecv' || direction === 'sendonly') {
          isNewTrack = !transceiver.rtpReceiver;
          rtpReceiver = transceiver.rtpReceiver ||
              new window.RTCRtpReceiver(transceiver.dtlsTransport, kind);

          if (isNewTrack) {
            var stream;
            track = rtpReceiver.track;
            // FIXME: does not work with Plan B.
            if (remoteMsid && remoteMsid.stream === '-') {
              // no-op. a stream id of '-' means: no associated stream.
            } else if (remoteMsid) {
              if (!streams[remoteMsid.stream]) {
                streams[remoteMsid.stream] = new window.MediaStream();
                Object.defineProperty(streams[remoteMsid.stream], 'id', {
                  get: function() {
                    return remoteMsid.stream;
                  }
                });
              }
              Object.defineProperty(track, 'id', {
                get: function() {
                  return remoteMsid.track;
                }
              });
              stream = streams[remoteMsid.stream];
            } else {
              if (!streams.default) {
                streams.default = new window.MediaStream();
              }
              stream = streams.default;
            }
            if (stream) {
              addTrackToStreamAndFireEvent(track, stream);
              transceiver.associatedRemoteMediaStreams.push(stream);
            }
            receiverList.push([track, rtpReceiver, stream]);
          }
        } else if (transceiver.rtpReceiver && transceiver.rtpReceiver.track) {
          transceiver.associatedRemoteMediaStreams.forEach(function(s) {
            var nativeTrack = s.getTracks().find(function(t) {
              return t.id === transceiver.rtpReceiver.track.id;
            });
            if (nativeTrack) {
              removeTrackFromStreamAndFireEvent(nativeTrack, s);
            }
          });
          transceiver.associatedRemoteMediaStreams = [];
        }

        transceiver.localCapabilities = localCapabilities;
        transceiver.remoteCapabilities = remoteCapabilities;
        transceiver.rtpReceiver = rtpReceiver;
        transceiver.rtcpParameters = rtcpParameters;
        transceiver.sendEncodingParameters = sendEncodingParameters;
        transceiver.recvEncodingParameters = recvEncodingParameters;

        // Start the RTCRtpReceiver now. The RTPSender is started in
        // setLocalDescription.
        pc._transceive(pc.transceivers[sdpMLineIndex],
            false,
            isNewTrack);
      } else if (description.type === 'answer' && !rejected) {
        transceiver = pc.transceivers[sdpMLineIndex];
        iceGatherer = transceiver.iceGatherer;
        iceTransport = transceiver.iceTransport;
        dtlsTransport = transceiver.dtlsTransport;
        rtpReceiver = transceiver.rtpReceiver;
        sendEncodingParameters = transceiver.sendEncodingParameters;
        localCapabilities = transceiver.localCapabilities;

        pc.transceivers[sdpMLineIndex].recvEncodingParameters =
            recvEncodingParameters;
        pc.transceivers[sdpMLineIndex].remoteCapabilities =
            remoteCapabilities;
        pc.transceivers[sdpMLineIndex].rtcpParameters = rtcpParameters;

        if (cands.length && iceTransport.state === 'new') {
          if ((isIceLite || isComplete) &&
              (!usingBundle || sdpMLineIndex === 0)) {
            iceTransport.setRemoteCandidates(cands);
          } else {
            cands.forEach(function(candidate) {
              maybeAddCandidate(transceiver.iceTransport, candidate);
            });
          }
        }

        if (!usingBundle || sdpMLineIndex === 0) {
          if (iceTransport.state === 'new') {
            iceTransport.start(iceGatherer, remoteIceParameters,
                'controlling');
          }
          if (dtlsTransport.state === 'new') {
            dtlsTransport.start(remoteDtlsParameters);
          }
        }

        // If the offer contained RTX but the answer did not,
        // remove RTX from sendEncodingParameters.
        var commonCapabilities = getCommonCapabilities(
          transceiver.localCapabilities,
          transceiver.remoteCapabilities);

        var hasRtx = commonCapabilities.codecs.filter(function(c) {
          return c.name.toLowerCase() === 'rtx';
        }).length;
        if (!hasRtx && transceiver.sendEncodingParameters[0].rtx) {
          delete transceiver.sendEncodingParameters[0].rtx;
        }

        pc._transceive(transceiver,
            direction === 'sendrecv' || direction === 'recvonly',
            direction === 'sendrecv' || direction === 'sendonly');

        // TODO: rewrite to use http://w3c.github.io/webrtc-pc/#set-associated-remote-streams
        if (rtpReceiver &&
            (direction === 'sendrecv' || direction === 'sendonly')) {
          track = rtpReceiver.track;
          if (remoteMsid) {
            if (!streams[remoteMsid.stream]) {
              streams[remoteMsid.stream] = new window.MediaStream();
            }
            addTrackToStreamAndFireEvent(track, streams[remoteMsid.stream]);
            receiverList.push([track, rtpReceiver, streams[remoteMsid.stream]]);
          } else {
            if (!streams.default) {
              streams.default = new window.MediaStream();
            }
            addTrackToStreamAndFireEvent(track, streams.default);
            receiverList.push([track, rtpReceiver, streams.default]);
          }
        } else {
          // FIXME: actually the receiver should be created later.
          delete transceiver.rtpReceiver;
        }
      }
    });

    if (pc._dtlsRole === undefined) {
      pc._dtlsRole = description.type === 'offer' ? 'active' : 'passive';
    }

    pc._remoteDescription = {
      type: description.type,
      sdp: description.sdp
    };
    if (description.type === 'offer') {
      pc._updateSignalingState('have-remote-offer');
    } else {
      pc._updateSignalingState('stable');
    }
    Object.keys(streams).forEach(function(sid) {
      var stream = streams[sid];
      if (stream.getTracks().length) {
        if (pc.remoteStreams.indexOf(stream) === -1) {
          pc.remoteStreams.push(stream);
          var event = new Event('addstream');
          event.stream = stream;
          window.setTimeout(function() {
            pc._dispatchEvent('addstream', event);
          });
        }

        receiverList.forEach(function(item) {
          var track = item[0];
          var receiver = item[1];
          if (stream.id !== item[2].id) {
            return;
          }
          fireAddTrack(pc, track, receiver, [stream]);
        });
      }
    });
    receiverList.forEach(function(item) {
      if (item[2]) {
        return;
      }
      fireAddTrack(pc, item[0], item[1], []);
    });

    // check whether addIceCandidate({}) was called within four seconds after
    // setRemoteDescription.
    window.setTimeout(function() {
      if (!(pc && pc.transceivers)) {
        return;
      }
      pc.transceivers.forEach(function(transceiver) {
        if (transceiver.iceTransport &&
            transceiver.iceTransport.state === 'new' &&
            transceiver.iceTransport.getRemoteCandidates().length > 0) {
          console.warn('Timeout for addRemoteCandidate. Consider sending ' +
              'an end-of-candidates notification');
          transceiver.iceTransport.addRemoteCandidate({});
        }
      });
    }, 4000);

    return Promise.resolve();
  };

  RTCPeerConnection.prototype.close = function() {
    this.transceivers.forEach(function(transceiver) {
      /* not yet
      if (transceiver.iceGatherer) {
        transceiver.iceGatherer.close();
      }
      */
      if (transceiver.iceTransport) {
        transceiver.iceTransport.stop();
      }
      if (transceiver.dtlsTransport) {
        transceiver.dtlsTransport.stop();
      }
      if (transceiver.rtpSender) {
        transceiver.rtpSender.stop();
      }
      if (transceiver.rtpReceiver) {
        transceiver.rtpReceiver.stop();
      }
    });
    // FIXME: clean up tracks, local streams, remote streams, etc
    this._isClosed = true;
    this._updateSignalingState('closed');
  };

  // Update the signaling state.
  RTCPeerConnection.prototype._updateSignalingState = function(newState) {
    this.signalingState = newState;
    var event = new Event('signalingstatechange');
    this._dispatchEvent('signalingstatechange', event);
  };

  // Determine whether to fire the negotiationneeded event.
  RTCPeerConnection.prototype._maybeFireNegotiationNeeded = function() {
    var pc = this;
    if (this.signalingState !== 'stable' || this.needNegotiation === true) {
      return;
    }
    this.needNegotiation = true;
    window.setTimeout(function() {
      if (pc.needNegotiation) {
        pc.needNegotiation = false;
        var event = new Event('negotiationneeded');
        pc._dispatchEvent('negotiationneeded', event);
      }
    }, 0);
  };

  // Update the ice connection state.
  RTCPeerConnection.prototype._updateIceConnectionState = function() {
    var newState;
    var states = {
      'new': 0,
      closed: 0,
      checking: 0,
      connected: 0,
      completed: 0,
      disconnected: 0,
      failed: 0
    };
    this.transceivers.forEach(function(transceiver) {
      if (transceiver.iceTransport && !transceiver.rejected) {
        states[transceiver.iceTransport.state]++;
      }
    });

    newState = 'new';
    if (states.failed > 0) {
      newState = 'failed';
    } else if (states.checking > 0) {
      newState = 'checking';
    } else if (states.disconnected > 0) {
      newState = 'disconnected';
    } else if (states.new > 0) {
      newState = 'new';
    } else if (states.connected > 0) {
      newState = 'connected';
    } else if (states.completed > 0) {
      newState = 'completed';
    }

    if (newState !== this.iceConnectionState) {
      this.iceConnectionState = newState;
      var event = new Event('iceconnectionstatechange');
      this._dispatchEvent('iceconnectionstatechange', event);
    }
  };

  // Update the connection state.
  RTCPeerConnection.prototype._updateConnectionState = function() {
    var newState;
    var states = {
      'new': 0,
      closed: 0,
      connecting: 0,
      connected: 0,
      completed: 0,
      disconnected: 0,
      failed: 0
    };
    this.transceivers.forEach(function(transceiver) {
      if (transceiver.iceTransport && transceiver.dtlsTransport &&
          !transceiver.rejected) {
        states[transceiver.iceTransport.state]++;
        states[transceiver.dtlsTransport.state]++;
      }
    });
    // ICETransport.completed and connected are the same for this purpose.
    states.connected += states.completed;

    newState = 'new';
    if (states.failed > 0) {
      newState = 'failed';
    } else if (states.connecting > 0) {
      newState = 'connecting';
    } else if (states.disconnected > 0) {
      newState = 'disconnected';
    } else if (states.new > 0) {
      newState = 'new';
    } else if (states.connected > 0) {
      newState = 'connected';
    }

    if (newState !== this.connectionState) {
      this.connectionState = newState;
      var event = new Event('connectionstatechange');
      this._dispatchEvent('connectionstatechange', event);
    }
  };

  RTCPeerConnection.prototype.createOffer = function() {
    var pc = this;

    if (pc._isClosed) {
      return Promise.reject(makeError('InvalidStateError',
          'Can not call createOffer after close'));
    }

    var numAudioTracks = pc.transceivers.filter(function(t) {
      return t.kind === 'audio';
    }).length;
    var numVideoTracks = pc.transceivers.filter(function(t) {
      return t.kind === 'video';
    }).length;

    // Determine number of audio and video tracks we need to send/recv.
    var offerOptions = arguments[0];
    if (offerOptions) {
      // Reject Chrome legacy constraints.
      if (offerOptions.mandatory || offerOptions.optional) {
        throw new TypeError(
            'Legacy mandatory/optional constraints not supported.');
      }
      if (offerOptions.offerToReceiveAudio !== undefined) {
        if (offerOptions.offerToReceiveAudio === true) {
          numAudioTracks = 1;
        } else if (offerOptions.offerToReceiveAudio === false) {
          numAudioTracks = 0;
        } else {
          numAudioTracks = offerOptions.offerToReceiveAudio;
        }
      }
      if (offerOptions.offerToReceiveVideo !== undefined) {
        if (offerOptions.offerToReceiveVideo === true) {
          numVideoTracks = 1;
        } else if (offerOptions.offerToReceiveVideo === false) {
          numVideoTracks = 0;
        } else {
          numVideoTracks = offerOptions.offerToReceiveVideo;
        }
      }
    }

    pc.transceivers.forEach(function(transceiver) {
      if (transceiver.kind === 'audio') {
        numAudioTracks--;
        if (numAudioTracks < 0) {
          transceiver.wantReceive = false;
        }
      } else if (transceiver.kind === 'video') {
        numVideoTracks--;
        if (numVideoTracks < 0) {
          transceiver.wantReceive = false;
        }
      }
    });

    // Create M-lines for recvonly streams.
    while (numAudioTracks > 0 || numVideoTracks > 0) {
      if (numAudioTracks > 0) {
        pc._createTransceiver('audio');
        numAudioTracks--;
      }
      if (numVideoTracks > 0) {
        pc._createTransceiver('video');
        numVideoTracks--;
      }
    }

    var sdp = SDPUtils.writeSessionBoilerplate(pc._sdpSessionId,
        pc._sdpSessionVersion++);
    pc.transceivers.forEach(function(transceiver, sdpMLineIndex) {
      // For each track, create an ice gatherer, ice transport,
      // dtls transport, potentially rtpsender and rtpreceiver.
      var track = transceiver.track;
      var kind = transceiver.kind;
      var mid = transceiver.mid || SDPUtils.generateIdentifier();
      transceiver.mid = mid;

      if (!transceiver.iceGatherer) {
        transceiver.iceGatherer = pc._createIceGatherer(sdpMLineIndex,
            pc.usingBundle);
      }

      var localCapabilities = window.RTCRtpSender.getCapabilities(kind);
      // filter RTX until additional stuff needed for RTX is implemented
      // in adapter.js
      if (edgeVersion < 15019) {
        localCapabilities.codecs = localCapabilities.codecs.filter(
            function(codec) {
              return codec.name !== 'rtx';
            });
      }
      localCapabilities.codecs.forEach(function(codec) {
        // work around https://bugs.chromium.org/p/webrtc/issues/detail?id=6552
        // by adding level-asymmetry-allowed=1
        if (codec.name === 'H264' &&
            codec.parameters['level-asymmetry-allowed'] === undefined) {
          codec.parameters['level-asymmetry-allowed'] = '1';
        }

        // for subsequent offers, we might have to re-use the payload
        // type of the last offer.
        if (transceiver.remoteCapabilities &&
            transceiver.remoteCapabilities.codecs) {
          transceiver.remoteCapabilities.codecs.forEach(function(remoteCodec) {
            if (codec.name.toLowerCase() === remoteCodec.name.toLowerCase() &&
                codec.clockRate === remoteCodec.clockRate) {
              codec.preferredPayloadType = remoteCodec.payloadType;
            }
          });
        }
      });
      localCapabilities.headerExtensions.forEach(function(hdrExt) {
        var remoteExtensions = transceiver.remoteCapabilities &&
            transceiver.remoteCapabilities.headerExtensions || [];
        remoteExtensions.forEach(function(rHdrExt) {
          if (hdrExt.uri === rHdrExt.uri) {
            hdrExt.id = rHdrExt.id;
          }
        });
      });

      // generate an ssrc now, to be used later in rtpSender.send
      var sendEncodingParameters = transceiver.sendEncodingParameters || [{
        ssrc: (2 * sdpMLineIndex + 1) * 1001
      }];
      if (track) {
        // add RTX
        if (edgeVersion >= 15019 && kind === 'video' &&
            !sendEncodingParameters[0].rtx) {
          sendEncodingParameters[0].rtx = {
            ssrc: sendEncodingParameters[0].ssrc + 1
          };
        }
      }

      if (transceiver.wantReceive) {
        transceiver.rtpReceiver = new window.RTCRtpReceiver(
            transceiver.dtlsTransport, kind);
      }

      transceiver.localCapabilities = localCapabilities;
      transceiver.sendEncodingParameters = sendEncodingParameters;
    });

    // always offer BUNDLE and dispose on return if not supported.
    if (pc._config.bundlePolicy !== 'max-compat') {
      sdp += 'a=group:BUNDLE ' + pc.transceivers.map(function(t) {
        return t.mid;
      }).join(' ') + '\r\n';
    }
    sdp += 'a=ice-options:trickle\r\n';

    pc.transceivers.forEach(function(transceiver, sdpMLineIndex) {
      sdp += writeMediaSection(transceiver, transceiver.localCapabilities,
          'offer', transceiver.stream, pc._dtlsRole);
      sdp += 'a=rtcp-rsize\r\n';

      if (transceiver.iceGatherer && pc.iceGatheringState !== 'new' &&
          (sdpMLineIndex === 0 || !pc.usingBundle)) {
        transceiver.iceGatherer.getLocalCandidates().forEach(function(cand) {
          cand.component = 1;
          sdp += 'a=' + SDPUtils.writeCandidate(cand) + '\r\n';
        });

        if (transceiver.iceGatherer.state === 'completed') {
          sdp += 'a=end-of-candidates\r\n';
        }
      }
    });

    var desc = new window.RTCSessionDescription({
      type: 'offer',
      sdp: sdp
    });
    return Promise.resolve(desc);
  };

  RTCPeerConnection.prototype.createAnswer = function() {
    var pc = this;

    if (pc._isClosed) {
      return Promise.reject(makeError('InvalidStateError',
          'Can not call createAnswer after close'));
    }

    if (!(pc.signalingState === 'have-remote-offer' ||
        pc.signalingState === 'have-local-pranswer')) {
      return Promise.reject(makeError('InvalidStateError',
          'Can not call createAnswer in signalingState ' + pc.signalingState));
    }

    var sdp = SDPUtils.writeSessionBoilerplate(pc._sdpSessionId,
        pc._sdpSessionVersion++);
    if (pc.usingBundle) {
      sdp += 'a=group:BUNDLE ' + pc.transceivers.map(function(t) {
        return t.mid;
      }).join(' ') + '\r\n';
    }
    sdp += 'a=ice-options:trickle\r\n';

    var mediaSectionsInOffer = SDPUtils.getMediaSections(
        pc._remoteDescription.sdp).length;
    pc.transceivers.forEach(function(transceiver, sdpMLineIndex) {
      if (sdpMLineIndex + 1 > mediaSectionsInOffer) {
        return;
      }
      if (transceiver.rejected) {
        if (transceiver.kind === 'application') {
          if (transceiver.protocol === 'DTLS/SCTP') { // legacy fmt
            sdp += 'm=application 0 DTLS/SCTP 5000\r\n';
          } else {
            sdp += 'm=application 0 ' + transceiver.protocol +
                ' webrtc-datachannel\r\n';
          }
        } else if (transceiver.kind === 'audio') {
          sdp += 'm=audio 0 UDP/TLS/RTP/SAVPF 0\r\n' +
              'a=rtpmap:0 PCMU/8000\r\n';
        } else if (transceiver.kind === 'video') {
          sdp += 'm=video 0 UDP/TLS/RTP/SAVPF 120\r\n' +
              'a=rtpmap:120 VP8/90000\r\n';
        }
        sdp += 'c=IN IP4 0.0.0.0\r\n' +
            'a=inactive\r\n' +
            'a=mid:' + transceiver.mid + '\r\n';
        return;
      }

      // FIXME: look at direction.
      if (transceiver.stream) {
        var localTrack;
        if (transceiver.kind === 'audio') {
          localTrack = transceiver.stream.getAudioTracks()[0];
        } else if (transceiver.kind === 'video') {
          localTrack = transceiver.stream.getVideoTracks()[0];
        }
        if (localTrack) {
          // add RTX
          if (edgeVersion >= 15019 && transceiver.kind === 'video' &&
              !transceiver.sendEncodingParameters[0].rtx) {
            transceiver.sendEncodingParameters[0].rtx = {
              ssrc: transceiver.sendEncodingParameters[0].ssrc + 1
            };
          }
        }
      }

      // Calculate intersection of capabilities.
      var commonCapabilities = getCommonCapabilities(
          transceiver.localCapabilities,
          transceiver.remoteCapabilities);

      var hasRtx = commonCapabilities.codecs.filter(function(c) {
        return c.name.toLowerCase() === 'rtx';
      }).length;
      if (!hasRtx && transceiver.sendEncodingParameters[0].rtx) {
        delete transceiver.sendEncodingParameters[0].rtx;
      }

      sdp += writeMediaSection(transceiver, commonCapabilities,
          'answer', transceiver.stream, pc._dtlsRole);
      if (transceiver.rtcpParameters &&
          transceiver.rtcpParameters.reducedSize) {
        sdp += 'a=rtcp-rsize\r\n';
      }
    });

    var desc = new window.RTCSessionDescription({
      type: 'answer',
      sdp: sdp
    });
    return Promise.resolve(desc);
  };

  RTCPeerConnection.prototype.addIceCandidate = function(candidate) {
    var pc = this;
    var sections;
    if (candidate && !(candidate.sdpMLineIndex !== undefined ||
        candidate.sdpMid)) {
      return Promise.reject(new TypeError('sdpMLineIndex or sdpMid required'));
    }

    // TODO: needs to go into ops queue.
    return new Promise(function(resolve, reject) {
      if (!pc._remoteDescription) {
        return reject(makeError('InvalidStateError',
            'Can not add ICE candidate without a remote description'));
      } else if (!candidate || candidate.candidate === '') {
        for (var j = 0; j < pc.transceivers.length; j++) {
          if (pc.transceivers[j].rejected) {
            continue;
          }
          pc.transceivers[j].iceTransport.addRemoteCandidate({});
          sections = SDPUtils.getMediaSections(pc._remoteDescription.sdp);
          sections[j] += 'a=end-of-candidates\r\n';
          pc._remoteDescription.sdp =
              SDPUtils.getDescription(pc._remoteDescription.sdp) +
              sections.join('');
          if (pc.usingBundle) {
            break;
          }
        }
      } else {
        var sdpMLineIndex = candidate.sdpMLineIndex;
        if (candidate.sdpMid) {
          for (var i = 0; i < pc.transceivers.length; i++) {
            if (pc.transceivers[i].mid === candidate.sdpMid) {
              sdpMLineIndex = i;
              break;
            }
          }
        }
        var transceiver = pc.transceivers[sdpMLineIndex];
        if (transceiver) {
          if (transceiver.rejected) {
            return resolve();
          }
          var cand = Object.keys(candidate.candidate).length > 0 ?
              SDPUtils.parseCandidate(candidate.candidate) : {};
          // Ignore Chrome's invalid candidates since Edge does not like them.
          if (cand.protocol === 'tcp' && (cand.port === 0 || cand.port === 9)) {
            return resolve();
          }
          // Ignore RTCP candidates, we assume RTCP-MUX.
          if (cand.component && cand.component !== 1) {
            return resolve();
          }
          // when using bundle, avoid adding candidates to the wrong
          // ice transport. And avoid adding candidates added in the SDP.
          if (sdpMLineIndex === 0 || (sdpMLineIndex > 0 &&
              transceiver.iceTransport !== pc.transceivers[0].iceTransport)) {
            if (!maybeAddCandidate(transceiver.iceTransport, cand)) {
              return reject(makeError('OperationError',
                  'Can not add ICE candidate'));
            }
          }

          // update the remoteDescription.
          var candidateString = candidate.candidate.trim();
          if (candidateString.indexOf('a=') === 0) {
            candidateString = candidateString.substr(2);
          }
          sections = SDPUtils.getMediaSections(pc._remoteDescription.sdp);
          sections[sdpMLineIndex] += 'a=' +
              (cand.type ? candidateString : 'end-of-candidates')
              + '\r\n';
          pc._remoteDescription.sdp =
              SDPUtils.getDescription(pc._remoteDescription.sdp) +
              sections.join('');
        } else {
          return reject(makeError('OperationError',
              'Can not add ICE candidate'));
        }
      }
      resolve();
    });
  };

  RTCPeerConnection.prototype.getStats = function(selector) {
    if (selector && selector instanceof window.MediaStreamTrack) {
      var senderOrReceiver = null;
      this.transceivers.forEach(function(transceiver) {
        if (transceiver.rtpSender &&
            transceiver.rtpSender.track === selector) {
          senderOrReceiver = transceiver.rtpSender;
        } else if (transceiver.rtpReceiver &&
            transceiver.rtpReceiver.track === selector) {
          senderOrReceiver = transceiver.rtpReceiver;
        }
      });
      if (!senderOrReceiver) {
        throw makeError('InvalidAccessError', 'Invalid selector.');
      }
      return senderOrReceiver.getStats();
    }

    var promises = [];
    this.transceivers.forEach(function(transceiver) {
      ['rtpSender', 'rtpReceiver', 'iceGatherer', 'iceTransport',
          'dtlsTransport'].forEach(function(method) {
            if (transceiver[method]) {
              promises.push(transceiver[method].getStats());
            }
          });
    });
    return Promise.all(promises).then(function(allStats) {
      var results = new Map();
      allStats.forEach(function(stats) {
        stats.forEach(function(stat) {
          results.set(stat.id, stat);
        });
      });
      return results;
    });
  };

  // fix low-level stat names and return Map instead of object.
  var ortcObjects = ['RTCRtpSender', 'RTCRtpReceiver', 'RTCIceGatherer',
    'RTCIceTransport', 'RTCDtlsTransport'];
  ortcObjects.forEach(function(ortcObjectName) {
    var obj = window[ortcObjectName];
    if (obj && obj.prototype && obj.prototype.getStats) {
      var nativeGetstats = obj.prototype.getStats;
      obj.prototype.getStats = function() {
        return nativeGetstats.apply(this)
        .then(function(nativeStats) {
          var mapStats = new Map();
          Object.keys(nativeStats).forEach(function(id) {
            nativeStats[id].type = fixStatsType(nativeStats[id]);
            mapStats.set(id, nativeStats[id]);
          });
          return mapStats;
        });
      };
    }
  });

  // legacy callback shims. Should be moved to adapter.js some days.
  var methods = ['createOffer', 'createAnswer'];
  methods.forEach(function(method) {
    var nativeMethod = RTCPeerConnection.prototype[method];
    RTCPeerConnection.prototype[method] = function() {
      var args = arguments;
      if (typeof args[0] === 'function' ||
          typeof args[1] === 'function') { // legacy
        return nativeMethod.apply(this, [arguments[2]])
        .then(function(description) {
          if (typeof args[0] === 'function') {
            args[0].apply(null, [description]);
          }
        }, function(error) {
          if (typeof args[1] === 'function') {
            args[1].apply(null, [error]);
          }
        });
      }
      return nativeMethod.apply(this, arguments);
    };
  });

  methods = ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate'];
  methods.forEach(function(method) {
    var nativeMethod = RTCPeerConnection.prototype[method];
    RTCPeerConnection.prototype[method] = function() {
      var args = arguments;
      if (typeof args[1] === 'function' ||
          typeof args[2] === 'function') { // legacy
        return nativeMethod.apply(this, arguments)
        .then(function() {
          if (typeof args[1] === 'function') {
            args[1].apply(null);
          }
        }, function(error) {
          if (typeof args[2] === 'function') {
            args[2].apply(null, [error]);
          }
        });
      }
      return nativeMethod.apply(this, arguments);
    };
  });

  // getStats is special. It doesn't have a spec legacy method yet we support
  // getStats(something, cb) without error callbacks.
  ['getStats'].forEach(function(method) {
    var nativeMethod = RTCPeerConnection.prototype[method];
    RTCPeerConnection.prototype[method] = function() {
      var args = arguments;
      if (typeof args[1] === 'function') {
        return nativeMethod.apply(this, arguments)
        .then(function() {
          if (typeof args[1] === 'function') {
            args[1].apply(null);
          }
        });
      }
      return nativeMethod.apply(this, arguments);
    };
  });

  return RTCPeerConnection;
};

},{"sdp":12}],8:[function(require,module,exports){
var grammar = module.exports = {
  v: [{
    name: 'version',
    reg: /^(\d*)$/
  }],
  o: [{
    // o=- 20518 0 IN IP4 203.0.113.1
    // NB: sessionId will be a String in most cases because it is huge
    name: 'origin',
    reg: /^(\S*) (\d*) (\d*) (\S*) IP(\d) (\S*)/,
    names: ['username', 'sessionId', 'sessionVersion', 'netType', 'ipVer', 'address'],
    format: '%s %s %d %s IP%d %s'
  }],
  // default parsing of these only (though some of these feel outdated)
  s: [{ name: 'name' }],
  i: [{ name: 'description' }],
  u: [{ name: 'uri' }],
  e: [{ name: 'email' }],
  p: [{ name: 'phone' }],
  z: [{ name: 'timezones' }], // TODO: this one can actually be parsed properly...
  r: [{ name: 'repeats' }],   // TODO: this one can also be parsed properly
  // k: [{}], // outdated thing ignored
  t: [{
    // t=0 0
    name: 'timing',
    reg: /^(\d*) (\d*)/,
    names: ['start', 'stop'],
    format: '%d %d'
  }],
  c: [{
    // c=IN IP4 10.47.197.26
    name: 'connection',
    reg: /^IN IP(\d) (\S*)/,
    names: ['version', 'ip'],
    format: 'IN IP%d %s'
  }],
  b: [{
    // b=AS:4000
    push: 'bandwidth',
    reg: /^(TIAS|AS|CT|RR|RS):(\d*)/,
    names: ['type', 'limit'],
    format: '%s:%s'
  }],
  m: [{
    // m=video 51744 RTP/AVP 126 97 98 34 31
    // NB: special - pushes to session
    // TODO: rtp/fmtp should be filtered by the payloads found here?
    reg: /^(\w*) (\d*) ([\w/]*)(?: (.*))?/,
    names: ['type', 'port', 'protocol', 'payloads'],
    format: '%s %d %s %s'
  }],
  a: [
    {
      // a=rtpmap:110 opus/48000/2
      push: 'rtp',
      reg: /^rtpmap:(\d*) ([\w\-.]*)(?:\s*\/(\d*)(?:\s*\/(\S*))?)?/,
      names: ['payload', 'codec', 'rate', 'encoding'],
      format: function (o) {
        return (o.encoding)
          ? 'rtpmap:%d %s/%s/%s'
          : o.rate
            ? 'rtpmap:%d %s/%s'
            : 'rtpmap:%d %s';
      }
    },
    {
      // a=fmtp:108 profile-level-id=24;object=23;bitrate=64000
      // a=fmtp:111 minptime=10; useinbandfec=1
      push: 'fmtp',
      reg: /^fmtp:(\d*) ([\S| ]*)/,
      names: ['payload', 'config'],
      format: 'fmtp:%d %s'
    },
    {
      // a=control:streamid=0
      name: 'control',
      reg: /^control:(.*)/,
      format: 'control:%s'
    },
    {
      // a=rtcp:65179 IN IP4 193.84.77.194
      name: 'rtcp',
      reg: /^rtcp:(\d*)(?: (\S*) IP(\d) (\S*))?/,
      names: ['port', 'netType', 'ipVer', 'address'],
      format: function (o) {
        return (o.address != null)
          ? 'rtcp:%d %s IP%d %s'
          : 'rtcp:%d';
      }
    },
    {
      // a=rtcp-fb:98 trr-int 100
      push: 'rtcpFbTrrInt',
      reg: /^rtcp-fb:(\*|\d*) trr-int (\d*)/,
      names: ['payload', 'value'],
      format: 'rtcp-fb:%d trr-int %d'
    },
    {
      // a=rtcp-fb:98 nack rpsi
      push: 'rtcpFb',
      reg: /^rtcp-fb:(\*|\d*) ([\w-_]*)(?: ([\w-_]*))?/,
      names: ['payload', 'type', 'subtype'],
      format: function (o) {
        return (o.subtype != null)
          ? 'rtcp-fb:%s %s %s'
          : 'rtcp-fb:%s %s';
      }
    },
    {
      // a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
      // a=extmap:1/recvonly URI-gps-string
      // a=extmap:3 urn:ietf:params:rtp-hdrext:encrypt urn:ietf:params:rtp-hdrext:smpte-tc 25@600/24
      push: 'ext',
      reg: /^extmap:(\d+)(?:\/(\w+))?(?: (urn:ietf:params:rtp-hdrext:encrypt))? (\S*)(?: (\S*))?/,
      names: ['value', 'direction', 'encrypt-uri', 'uri', 'config'],
      format: function (o) {
        return (
          'extmap:%d' +
          (o.direction ? '/%s' : '%v') +
          (o['encrypt-uri'] ? ' %s' : '%v') +
          ' %s' +
          (o.config ? ' %s' : '')
        );
      }
    },
    {
      // a=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:PS1uQCVeeCFCanVmcjkpPywjNWhcYD0mXXtxaVBR|2^20|1:32
      push: 'crypto',
      reg: /^crypto:(\d*) ([\w_]*) (\S*)(?: (\S*))?/,
      names: ['id', 'suite', 'config', 'sessionConfig'],
      format: function (o) {
        return (o.sessionConfig != null)
          ? 'crypto:%d %s %s %s'
          : 'crypto:%d %s %s';
      }
    },
    {
      // a=setup:actpass
      name: 'setup',
      reg: /^setup:(\w*)/,
      format: 'setup:%s'
    },
    {
      // a=connection:new
      name: 'connectionType',
      reg: /^connection:(new|existing)/,
      format: 'connection:%s'
    },
    {
      // a=mid:1
      name: 'mid',
      reg: /^mid:([^\s]*)/,
      format: 'mid:%s'
    },
    {
      // a=msid:0c8b064d-d807-43b4-b434-f92a889d8587 98178685-d409-46e0-8e16-7ef0db0db64a
      name: 'msid',
      reg: /^msid:(.*)/,
      format: 'msid:%s'
    },
    {
      // a=ptime:20
      name: 'ptime',
      reg: /^ptime:(\d*)/,
      format: 'ptime:%d'
    },
    {
      // a=maxptime:60
      name: 'maxptime',
      reg: /^maxptime:(\d*)/,
      format: 'maxptime:%d'
    },
    {
      // a=sendrecv
      name: 'direction',
      reg: /^(sendrecv|recvonly|sendonly|inactive)/
    },
    {
      // a=ice-lite
      name: 'icelite',
      reg: /^(ice-lite)/
    },
    {
      // a=ice-ufrag:F7gI
      name: 'iceUfrag',
      reg: /^ice-ufrag:(\S*)/,
      format: 'ice-ufrag:%s'
    },
    {
      // a=ice-pwd:x9cml/YzichV2+XlhiMu8g
      name: 'icePwd',
      reg: /^ice-pwd:(\S*)/,
      format: 'ice-pwd:%s'
    },
    {
      // a=fingerprint:SHA-1 00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33
      name: 'fingerprint',
      reg: /^fingerprint:(\S*) (\S*)/,
      names: ['type', 'hash'],
      format: 'fingerprint:%s %s'
    },
    {
      // a=candidate:0 1 UDP 2113667327 203.0.113.1 54400 typ host
      // a=candidate:1162875081 1 udp 2113937151 192.168.34.75 60017 typ host generation 0 network-id 3 network-cost 10
      // a=candidate:3289912957 2 udp 1845501695 193.84.77.194 60017 typ srflx raddr 192.168.34.75 rport 60017 generation 0 network-id 3 network-cost 10
      // a=candidate:229815620 1 tcp 1518280447 192.168.150.19 60017 typ host tcptype active generation 0 network-id 3 network-cost 10
      // a=candidate:3289912957 2 tcp 1845501695 193.84.77.194 60017 typ srflx raddr 192.168.34.75 rport 60017 tcptype passive generation 0 network-id 3 network-cost 10
      push:'candidates',
      reg: /^candidate:(\S*) (\d*) (\S*) (\d*) (\S*) (\d*) typ (\S*)(?: raddr (\S*) rport (\d*))?(?: tcptype (\S*))?(?: generation (\d*))?(?: network-id (\d*))?(?: network-cost (\d*))?/,
      names: ['foundation', 'component', 'transport', 'priority', 'ip', 'port', 'type', 'raddr', 'rport', 'tcptype', 'generation', 'network-id', 'network-cost'],
      format: function (o) {
        var str = 'candidate:%s %d %s %d %s %d typ %s';

        str += (o.raddr != null) ? ' raddr %s rport %d' : '%v%v';

        // NB: candidate has three optional chunks, so %void middles one if it's missing
        str += (o.tcptype != null) ? ' tcptype %s' : '%v';

        if (o.generation != null) {
          str += ' generation %d';
        }

        str += (o['network-id'] != null) ? ' network-id %d' : '%v';
        str += (o['network-cost'] != null) ? ' network-cost %d' : '%v';
        return str;
      }
    },
    {
      // a=end-of-candidates (keep after the candidates line for readability)
      name: 'endOfCandidates',
      reg: /^(end-of-candidates)/
    },
    {
      // a=remote-candidates:1 203.0.113.1 54400 2 203.0.113.1 54401 ...
      name: 'remoteCandidates',
      reg: /^remote-candidates:(.*)/,
      format: 'remote-candidates:%s'
    },
    {
      // a=ice-options:google-ice
      name: 'iceOptions',
      reg: /^ice-options:(\S*)/,
      format: 'ice-options:%s'
    },
    {
      // a=ssrc:2566107569 cname:t9YU8M1UxTF8Y1A1
      push: 'ssrcs',
      reg: /^ssrc:(\d*) ([\w_-]*)(?::(.*))?/,
      names: ['id', 'attribute', 'value'],
      format: function (o) {
        var str = 'ssrc:%d';
        if (o.attribute != null) {
          str += ' %s';
          if (o.value != null) {
            str += ':%s';
          }
        }
        return str;
      }
    },
    {
      // a=ssrc-group:FEC 1 2
      // a=ssrc-group:FEC-FR 3004364195 1080772241
      push: 'ssrcGroups',
      // token-char = %x21 / %x23-27 / %x2A-2B / %x2D-2E / %x30-39 / %x41-5A / %x5E-7E
      reg: /^ssrc-group:([\x21\x23\x24\x25\x26\x27\x2A\x2B\x2D\x2E\w]*) (.*)/,
      names: ['semantics', 'ssrcs'],
      format: 'ssrc-group:%s %s'
    },
    {
      // a=msid-semantic: WMS Jvlam5X3SX1OP6pn20zWogvaKJz5Hjf9OnlV
      name: 'msidSemantic',
      reg: /^msid-semantic:\s?(\w*) (\S*)/,
      names: ['semantic', 'token'],
      format: 'msid-semantic: %s %s' // space after ':' is not accidental
    },
    {
      // a=group:BUNDLE audio video
      push: 'groups',
      reg: /^group:(\w*) (.*)/,
      names: ['type', 'mids'],
      format: 'group:%s %s'
    },
    {
      // a=rtcp-mux
      name: 'rtcpMux',
      reg: /^(rtcp-mux)/
    },
    {
      // a=rtcp-rsize
      name: 'rtcpRsize',
      reg: /^(rtcp-rsize)/
    },
    {
      // a=sctpmap:5000 webrtc-datachannel 1024
      name: 'sctpmap',
      reg: /^sctpmap:([\w_/]*) (\S*)(?: (\S*))?/,
      names: ['sctpmapNumber', 'app', 'maxMessageSize'],
      format: function (o) {
        return (o.maxMessageSize != null)
          ? 'sctpmap:%s %s %s'
          : 'sctpmap:%s %s';
      }
    },
    {
      // a=x-google-flag:conference
      name: 'xGoogleFlag',
      reg: /^x-google-flag:([^\s]*)/,
      format: 'x-google-flag:%s'
    },
    {
      // a=rid:1 send max-width=1280;max-height=720;max-fps=30;depend=0
      push: 'rids',
      reg: /^rid:([\d\w]+) (\w+)(?: ([\S| ]*))?/,
      names: ['id', 'direction', 'params'],
      format: function (o) {
        return (o.params) ? 'rid:%s %s %s' : 'rid:%s %s';
      }
    },
    {
      // a=imageattr:97 send [x=800,y=640,sar=1.1,q=0.6] [x=480,y=320] recv [x=330,y=250]
      // a=imageattr:* send [x=800,y=640] recv *
      // a=imageattr:100 recv [x=320,y=240]
      push: 'imageattrs',
      reg: new RegExp(
        // a=imageattr:97
        '^imageattr:(\\d+|\\*)' +
        // send [x=800,y=640,sar=1.1,q=0.6] [x=480,y=320]
        '[\\s\\t]+(send|recv)[\\s\\t]+(\\*|\\[\\S+\\](?:[\\s\\t]+\\[\\S+\\])*)' +
        // recv [x=330,y=250]
        '(?:[\\s\\t]+(recv|send)[\\s\\t]+(\\*|\\[\\S+\\](?:[\\s\\t]+\\[\\S+\\])*))?'
      ),
      names: ['pt', 'dir1', 'attrs1', 'dir2', 'attrs2'],
      format: function (o) {
        return 'imageattr:%s %s %s' + (o.dir2 ? ' %s %s' : '');
      }
    },
    {
      // a=simulcast:send 1,2,3;~4,~5 recv 6;~7,~8
      // a=simulcast:recv 1;4,5 send 6;7
      name: 'simulcast',
      reg: new RegExp(
        // a=simulcast:
        '^simulcast:' +
        // send 1,2,3;~4,~5
        '(send|recv) ([a-zA-Z0-9\\-_~;,]+)' +
        // space + recv 6;~7,~8
        '(?:\\s?(send|recv) ([a-zA-Z0-9\\-_~;,]+))?' +
        // end
        '$'
      ),
      names: ['dir1', 'list1', 'dir2', 'list2'],
      format: function (o) {
        return 'simulcast:%s %s' + (o.dir2 ? ' %s %s' : '');
      }
    },
    {
      // old simulcast draft 03 (implemented by Firefox)
      //   https://tools.ietf.org/html/draft-ietf-mmusic-sdp-simulcast-03
      // a=simulcast: recv pt=97;98 send pt=97
      // a=simulcast: send rid=5;6;7 paused=6,7
      name: 'simulcast_03',
      reg: /^simulcast:[\s\t]+([\S+\s\t]+)$/,
      names: ['value'],
      format: 'simulcast: %s'
    },
    {
      // a=framerate:25
      // a=framerate:29.97
      name: 'framerate',
      reg: /^framerate:(\d+(?:$|\.\d+))/,
      format: 'framerate:%s'
    },
    {
      // RFC4570
      // a=source-filter: incl IN IP4 239.5.2.31 10.1.15.5
      name: 'sourceFilter',
      reg: /^source-filter: *(excl|incl) (\S*) (IP4|IP6|\*) (\S*) (.*)/,
      names: ['filterMode', 'netType', 'addressTypes', 'destAddress', 'srcList'],
      format: 'source-filter: %s %s %s %s %s'
    },
    {
      // a=bundle-only
      name: 'bundleOnly',
      reg: /^(bundle-only)/
    },
    {
      // a=label:1
      name: 'label',
      reg: /^label:(.+)/,
      format: 'label:%s'
    },
    {
      // RFC version 26 for SCTP over DTLS
      // https://tools.ietf.org/html/draft-ietf-mmusic-sctp-sdp-26#section-5
      name: 'sctpPort',
      reg: /^sctp-port:(\d+)$/,
      format: 'sctp-port:%s'
    },
    {
      // RFC version 26 for SCTP over DTLS
      // https://tools.ietf.org/html/draft-ietf-mmusic-sctp-sdp-26#section-6
      name: 'maxMessageSize',
      reg: /^max-message-size:(\d+)$/,
      format: 'max-message-size:%s'
    },
    {
      // a=keywds:keywords
      name: 'keywords',
      reg: /^keywds:(.+)$/,
      format: 'keywds:%s'
    },
    {
      // any a= that we don't understand is kept verbatim on media.invalid
      push: 'invalid',
      names: ['value']
    }
  ]
};

// set sensible defaults to avoid polluting the grammar with boring details
Object.keys(grammar).forEach(function (key) {
  var objs = grammar[key];
  objs.forEach(function (obj) {
    if (!obj.reg) {
      obj.reg = /(.*)/;
    }
    if (!obj.format) {
      obj.format = '%s';
    }
  });
});

},{}],9:[function(require,module,exports){
var parser = require('./parser');
var writer = require('./writer');

exports.write = writer;
exports.parse = parser.parse;
exports.parseFmtpConfig = parser.parseFmtpConfig;
exports.parseParams = parser.parseParams;
exports.parsePayloads = parser.parsePayloads;
exports.parseRemoteCandidates = parser.parseRemoteCandidates;
exports.parseImageAttributes = parser.parseImageAttributes;
exports.parseSimulcastStreamList = parser.parseSimulcastStreamList;

},{"./parser":10,"./writer":11}],10:[function(require,module,exports){
var toIntIfInt = function (v) {
  return String(Number(v)) === v ? Number(v) : v;
};

var attachProperties = function (match, location, names, rawName) {
  if (rawName && !names) {
    location[rawName] = toIntIfInt(match[1]);
  }
  else {
    for (var i = 0; i < names.length; i += 1) {
      if (match[i+1] != null) {
        location[names[i]] = toIntIfInt(match[i+1]);
      }
    }
  }
};

var parseReg = function (obj, location, content) {
  var needsBlank = obj.name && obj.names;
  if (obj.push && !location[obj.push]) {
    location[obj.push] = [];
  }
  else if (needsBlank && !location[obj.name]) {
    location[obj.name] = {};
  }
  var keyLocation = obj.push ?
    {} :  // blank object that will be pushed
    needsBlank ? location[obj.name] : location; // otherwise, named location or root

  attachProperties(content.match(obj.reg), keyLocation, obj.names, obj.name);

  if (obj.push) {
    location[obj.push].push(keyLocation);
  }
};

var grammar = require('./grammar');
var validLine = RegExp.prototype.test.bind(/^([a-z])=(.*)/);

exports.parse = function (sdp) {
  var session = {}
    , media = []
    , location = session; // points at where properties go under (one of the above)

  // parse lines we understand
  sdp.split(/(\r\n|\r|\n)/).filter(validLine).forEach(function (l) {
    var type = l[0];
    var content = l.slice(2);
    if (type === 'm') {
      media.push({rtp: [], fmtp: []});
      location = media[media.length-1]; // point at latest media line
    }

    for (var j = 0; j < (grammar[type] || []).length; j += 1) {
      var obj = grammar[type][j];
      if (obj.reg.test(content)) {
        return parseReg(obj, location, content);
      }
    }
  });

  session.media = media; // link it up
  return session;
};

var paramReducer = function (acc, expr) {
  var s = expr.split(/=(.+)/, 2);
  if (s.length === 2) {
    acc[s[0]] = toIntIfInt(s[1]);
  } else if (s.length === 1 && expr.length > 1) {
    acc[s[0]] = undefined;
  }
  return acc;
};

exports.parseParams = function (str) {
  return str.split(/;\s?/).reduce(paramReducer, {});
};

// For backward compatibility - alias will be removed in 3.0.0
exports.parseFmtpConfig = exports.parseParams;

exports.parsePayloads = function (str) {
  return str.toString().split(' ').map(Number);
};

exports.parseRemoteCandidates = function (str) {
  var candidates = [];
  var parts = str.split(' ').map(toIntIfInt);
  for (var i = 0; i < parts.length; i += 3) {
    candidates.push({
      component: parts[i],
      ip: parts[i + 1],
      port: parts[i + 2]
    });
  }
  return candidates;
};

exports.parseImageAttributes = function (str) {
  return str.split(' ').map(function (item) {
    return item.substring(1, item.length-1).split(',').reduce(paramReducer, {});
  });
};

exports.parseSimulcastStreamList = function (str) {
  return str.split(';').map(function (stream) {
    return stream.split(',').map(function (format) {
      var scid, paused = false;

      if (format[0] !== '~') {
        scid = toIntIfInt(format);
      } else {
        scid = toIntIfInt(format.substring(1, format.length));
        paused = true;
      }

      return {
        scid: scid,
        paused: paused
      };
    });
  });
};

},{"./grammar":8}],11:[function(require,module,exports){
var grammar = require('./grammar');

// customized util.format - discards excess arguments and can void middle ones
var formatRegExp = /%[sdv%]/g;
var format = function (formatStr) {
  var i = 1;
  var args = arguments;
  var len = args.length;
  return formatStr.replace(formatRegExp, function (x) {
    if (i >= len) {
      return x; // missing argument
    }
    var arg = args[i];
    i += 1;
    switch (x) {
    case '%%':
      return '%';
    case '%s':
      return String(arg);
    case '%d':
      return Number(arg);
    case '%v':
      return '';
    }
  });
  // NB: we discard excess arguments - they are typically undefined from makeLine
};

var makeLine = function (type, obj, location) {
  var str = obj.format instanceof Function ?
    (obj.format(obj.push ? location : location[obj.name])) :
    obj.format;

  var args = [type + '=' + str];
  if (obj.names) {
    for (var i = 0; i < obj.names.length; i += 1) {
      var n = obj.names[i];
      if (obj.name) {
        args.push(location[obj.name][n]);
      }
      else { // for mLine and push attributes
        args.push(location[obj.names[i]]);
      }
    }
  }
  else {
    args.push(location[obj.name]);
  }
  return format.apply(null, args);
};

// RFC specified order
// TODO: extend this with all the rest
var defaultOuterOrder = [
  'v', 'o', 's', 'i',
  'u', 'e', 'p', 'c',
  'b', 't', 'r', 'z', 'a'
];
var defaultInnerOrder = ['i', 'c', 'b', 'a'];


module.exports = function (session, opts) {
  opts = opts || {};
  // ensure certain properties exist
  if (session.version == null) {
    session.version = 0; // 'v=0' must be there (only defined version atm)
  }
  if (session.name == null) {
    session.name = ' '; // 's= ' must be there if no meaningful name set
  }
  session.media.forEach(function (mLine) {
    if (mLine.payloads == null) {
      mLine.payloads = '';
    }
  });

  var outerOrder = opts.outerOrder || defaultOuterOrder;
  var innerOrder = opts.innerOrder || defaultInnerOrder;
  var sdp = [];

  // loop through outerOrder for matching properties on session
  outerOrder.forEach(function (type) {
    grammar[type].forEach(function (obj) {
      if (obj.name in session && session[obj.name] != null) {
        sdp.push(makeLine(type, obj, session));
      }
      else if (obj.push in session && session[obj.push] != null) {
        session[obj.push].forEach(function (el) {
          sdp.push(makeLine(type, obj, el));
        });
      }
    });
  });

  // then for each media line, follow the innerOrder
  session.media.forEach(function (mLine) {
    sdp.push(makeLine('m', grammar.m[0], mLine));

    innerOrder.forEach(function (type) {
      grammar[type].forEach(function (obj) {
        if (obj.name in mLine && mLine[obj.name] != null) {
          sdp.push(makeLine(type, obj, mLine));
        }
        else if (obj.push in mLine && mLine[obj.push] != null) {
          mLine[obj.push].forEach(function (el) {
            sdp.push(makeLine(type, obj, el));
          });
        }
      });
    });
  });

  return sdp.join('\r\n') + '\r\n';
};

},{"./grammar":8}],12:[function(require,module,exports){
 /* eslint-env node */
'use strict';

// SDP helpers.
var SDPUtils = {};

// Generate an alphanumeric identifier for cname or mids.
// TODO: use UUIDs instead? https://gist.github.com/jed/982883
SDPUtils.generateIdentifier = function() {
  return Math.random().toString(36).substr(2, 10);
};

// The RTCP CNAME used by all peerconnections from the same JS.
SDPUtils.localCName = SDPUtils.generateIdentifier();

// Splits SDP into lines, dealing with both CRLF and LF.
SDPUtils.splitLines = function(blob) {
  return blob.trim().split('\n').map(function(line) {
    return line.trim();
  });
};
// Splits SDP into sessionpart and mediasections. Ensures CRLF.
SDPUtils.splitSections = function(blob) {
  var parts = blob.split('\nm=');
  return parts.map(function(part, index) {
    return (index > 0 ? 'm=' + part : part).trim() + '\r\n';
  });
};

// returns the session description.
SDPUtils.getDescription = function(blob) {
  var sections = SDPUtils.splitSections(blob);
  return sections && sections[0];
};

// returns the individual media sections.
SDPUtils.getMediaSections = function(blob) {
  var sections = SDPUtils.splitSections(blob);
  sections.shift();
  return sections;
};

// Returns lines that start with a certain prefix.
SDPUtils.matchPrefix = function(blob, prefix) {
  return SDPUtils.splitLines(blob).filter(function(line) {
    return line.indexOf(prefix) === 0;
  });
};

// Parses an ICE candidate line. Sample input:
// candidate:702786350 2 udp 41819902 8.8.8.8 60769 typ relay raddr 8.8.8.8
// rport 55996"
SDPUtils.parseCandidate = function(line) {
  var parts;
  // Parse both variants.
  if (line.indexOf('a=candidate:') === 0) {
    parts = line.substring(12).split(' ');
  } else {
    parts = line.substring(10).split(' ');
  }

  var candidate = {
    foundation: parts[0],
    component: parseInt(parts[1], 10),
    protocol: parts[2].toLowerCase(),
    priority: parseInt(parts[3], 10),
    ip: parts[4],
    address: parts[4], // address is an alias for ip.
    port: parseInt(parts[5], 10),
    // skip parts[6] == 'typ'
    type: parts[7]
  };

  for (var i = 8; i < parts.length; i += 2) {
    switch (parts[i]) {
      case 'raddr':
        candidate.relatedAddress = parts[i + 1];
        break;
      case 'rport':
        candidate.relatedPort = parseInt(parts[i + 1], 10);
        break;
      case 'tcptype':
        candidate.tcpType = parts[i + 1];
        break;
      case 'ufrag':
        candidate.ufrag = parts[i + 1]; // for backward compability.
        candidate.usernameFragment = parts[i + 1];
        break;
      default: // extension handling, in particular ufrag
        candidate[parts[i]] = parts[i + 1];
        break;
    }
  }
  return candidate;
};

// Translates a candidate object into SDP candidate attribute.
SDPUtils.writeCandidate = function(candidate) {
  var sdp = [];
  sdp.push(candidate.foundation);
  sdp.push(candidate.component);
  sdp.push(candidate.protocol.toUpperCase());
  sdp.push(candidate.priority);
  sdp.push(candidate.address || candidate.ip);
  sdp.push(candidate.port);

  var type = candidate.type;
  sdp.push('typ');
  sdp.push(type);
  if (type !== 'host' && candidate.relatedAddress &&
      candidate.relatedPort) {
    sdp.push('raddr');
    sdp.push(candidate.relatedAddress);
    sdp.push('rport');
    sdp.push(candidate.relatedPort);
  }
  if (candidate.tcpType && candidate.protocol.toLowerCase() === 'tcp') {
    sdp.push('tcptype');
    sdp.push(candidate.tcpType);
  }
  if (candidate.usernameFragment || candidate.ufrag) {
    sdp.push('ufrag');
    sdp.push(candidate.usernameFragment || candidate.ufrag);
  }
  return 'candidate:' + sdp.join(' ');
};

// Parses an ice-options line, returns an array of option tags.
// a=ice-options:foo bar
SDPUtils.parseIceOptions = function(line) {
  return line.substr(14).split(' ');
};

// Parses an rtpmap line, returns RTCRtpCoddecParameters. Sample input:
// a=rtpmap:111 opus/48000/2
SDPUtils.parseRtpMap = function(line) {
  var parts = line.substr(9).split(' ');
  var parsed = {
    payloadType: parseInt(parts.shift(), 10) // was: id
  };

  parts = parts[0].split('/');

  parsed.name = parts[0];
  parsed.clockRate = parseInt(parts[1], 10); // was: clockrate
  parsed.channels = parts.length === 3 ? parseInt(parts[2], 10) : 1;
  // legacy alias, got renamed back to channels in ORTC.
  parsed.numChannels = parsed.channels;
  return parsed;
};

// Generate an a=rtpmap line from RTCRtpCodecCapability or
// RTCRtpCodecParameters.
SDPUtils.writeRtpMap = function(codec) {
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  var channels = codec.channels || codec.numChannels || 1;
  return 'a=rtpmap:' + pt + ' ' + codec.name + '/' + codec.clockRate +
      (channels !== 1 ? '/' + channels : '') + '\r\n';
};

// Parses an a=extmap line (headerextension from RFC 5285). Sample input:
// a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
// a=extmap:2/sendonly urn:ietf:params:rtp-hdrext:toffset
SDPUtils.parseExtmap = function(line) {
  var parts = line.substr(9).split(' ');
  return {
    id: parseInt(parts[0], 10),
    direction: parts[0].indexOf('/') > 0 ? parts[0].split('/')[1] : 'sendrecv',
    uri: parts[1]
  };
};

// Generates a=extmap line from RTCRtpHeaderExtensionParameters or
// RTCRtpHeaderExtension.
SDPUtils.writeExtmap = function(headerExtension) {
  return 'a=extmap:' + (headerExtension.id || headerExtension.preferredId) +
      (headerExtension.direction && headerExtension.direction !== 'sendrecv'
          ? '/' + headerExtension.direction
          : '') +
      ' ' + headerExtension.uri + '\r\n';
};

// Parses an ftmp line, returns dictionary. Sample input:
// a=fmtp:96 vbr=on;cng=on
// Also deals with vbr=on; cng=on
SDPUtils.parseFmtp = function(line) {
  var parsed = {};
  var kv;
  var parts = line.substr(line.indexOf(' ') + 1).split(';');
  for (var j = 0; j < parts.length; j++) {
    kv = parts[j].trim().split('=');
    parsed[kv[0].trim()] = kv[1];
  }
  return parsed;
};

// Generates an a=ftmp line from RTCRtpCodecCapability or RTCRtpCodecParameters.
SDPUtils.writeFmtp = function(codec) {
  var line = '';
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  if (codec.parameters && Object.keys(codec.parameters).length) {
    var params = [];
    Object.keys(codec.parameters).forEach(function(param) {
      if (codec.parameters[param]) {
        params.push(param + '=' + codec.parameters[param]);
      } else {
        params.push(param);
      }
    });
    line += 'a=fmtp:' + pt + ' ' + params.join(';') + '\r\n';
  }
  return line;
};

// Parses an rtcp-fb line, returns RTCPRtcpFeedback object. Sample input:
// a=rtcp-fb:98 nack rpsi
SDPUtils.parseRtcpFb = function(line) {
  var parts = line.substr(line.indexOf(' ') + 1).split(' ');
  return {
    type: parts.shift(),
    parameter: parts.join(' ')
  };
};
// Generate a=rtcp-fb lines from RTCRtpCodecCapability or RTCRtpCodecParameters.
SDPUtils.writeRtcpFb = function(codec) {
  var lines = '';
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
    // FIXME: special handling for trr-int?
    codec.rtcpFeedback.forEach(function(fb) {
      lines += 'a=rtcp-fb:' + pt + ' ' + fb.type +
      (fb.parameter && fb.parameter.length ? ' ' + fb.parameter : '') +
          '\r\n';
    });
  }
  return lines;
};

// Parses an RFC 5576 ssrc media attribute. Sample input:
// a=ssrc:3735928559 cname:something
SDPUtils.parseSsrcMedia = function(line) {
  var sp = line.indexOf(' ');
  var parts = {
    ssrc: parseInt(line.substr(7, sp - 7), 10)
  };
  var colon = line.indexOf(':', sp);
  if (colon > -1) {
    parts.attribute = line.substr(sp + 1, colon - sp - 1);
    parts.value = line.substr(colon + 1);
  } else {
    parts.attribute = line.substr(sp + 1);
  }
  return parts;
};

SDPUtils.parseSsrcGroup = function(line) {
  var parts = line.substr(13).split(' ');
  return {
    semantics: parts.shift(),
    ssrcs: parts.map(function(ssrc) {
      return parseInt(ssrc, 10);
    })
  };
};

// Extracts the MID (RFC 5888) from a media section.
// returns the MID or undefined if no mid line was found.
SDPUtils.getMid = function(mediaSection) {
  var mid = SDPUtils.matchPrefix(mediaSection, 'a=mid:')[0];
  if (mid) {
    return mid.substr(6);
  }
};

SDPUtils.parseFingerprint = function(line) {
  var parts = line.substr(14).split(' ');
  return {
    algorithm: parts[0].toLowerCase(), // algorithm is case-sensitive in Edge.
    value: parts[1]
  };
};

// Extracts DTLS parameters from SDP media section or sessionpart.
// FIXME: for consistency with other functions this should only
//   get the fingerprint line as input. See also getIceParameters.
SDPUtils.getDtlsParameters = function(mediaSection, sessionpart) {
  var lines = SDPUtils.matchPrefix(mediaSection + sessionpart,
      'a=fingerprint:');
  // Note: a=setup line is ignored since we use the 'auto' role.
  // Note2: 'algorithm' is not case sensitive except in Edge.
  return {
    role: 'auto',
    fingerprints: lines.map(SDPUtils.parseFingerprint)
  };
};

// Serializes DTLS parameters to SDP.
SDPUtils.writeDtlsParameters = function(params, setupType) {
  var sdp = 'a=setup:' + setupType + '\r\n';
  params.fingerprints.forEach(function(fp) {
    sdp += 'a=fingerprint:' + fp.algorithm + ' ' + fp.value + '\r\n';
  });
  return sdp;
};
// Parses ICE information from SDP media section or sessionpart.
// FIXME: for consistency with other functions this should only
//   get the ice-ufrag and ice-pwd lines as input.
SDPUtils.getIceParameters = function(mediaSection, sessionpart) {
  var lines = SDPUtils.splitLines(mediaSection);
  // Search in session part, too.
  lines = lines.concat(SDPUtils.splitLines(sessionpart));
  var iceParameters = {
    usernameFragment: lines.filter(function(line) {
      return line.indexOf('a=ice-ufrag:') === 0;
    })[0].substr(12),
    password: lines.filter(function(line) {
      return line.indexOf('a=ice-pwd:') === 0;
    })[0].substr(10)
  };
  return iceParameters;
};

// Serializes ICE parameters to SDP.
SDPUtils.writeIceParameters = function(params) {
  return 'a=ice-ufrag:' + params.usernameFragment + '\r\n' +
      'a=ice-pwd:' + params.password + '\r\n';
};

// Parses the SDP media section and returns RTCRtpParameters.
SDPUtils.parseRtpParameters = function(mediaSection) {
  var description = {
    codecs: [],
    headerExtensions: [],
    fecMechanisms: [],
    rtcp: []
  };
  var lines = SDPUtils.splitLines(mediaSection);
  var mline = lines[0].split(' ');
  for (var i = 3; i < mline.length; i++) { // find all codecs from mline[3..]
    var pt = mline[i];
    var rtpmapline = SDPUtils.matchPrefix(
        mediaSection, 'a=rtpmap:' + pt + ' ')[0];
    if (rtpmapline) {
      var codec = SDPUtils.parseRtpMap(rtpmapline);
      var fmtps = SDPUtils.matchPrefix(
          mediaSection, 'a=fmtp:' + pt + ' ');
      // Only the first a=fmtp:<pt> is considered.
      codec.parameters = fmtps.length ? SDPUtils.parseFmtp(fmtps[0]) : {};
      codec.rtcpFeedback = SDPUtils.matchPrefix(
          mediaSection, 'a=rtcp-fb:' + pt + ' ')
        .map(SDPUtils.parseRtcpFb);
      description.codecs.push(codec);
      // parse FEC mechanisms from rtpmap lines.
      switch (codec.name.toUpperCase()) {
        case 'RED':
        case 'ULPFEC':
          description.fecMechanisms.push(codec.name.toUpperCase());
          break;
        default: // only RED and ULPFEC are recognized as FEC mechanisms.
          break;
      }
    }
  }
  SDPUtils.matchPrefix(mediaSection, 'a=extmap:').forEach(function(line) {
    description.headerExtensions.push(SDPUtils.parseExtmap(line));
  });
  // FIXME: parse rtcp.
  return description;
};

// Generates parts of the SDP media section describing the capabilities /
// parameters.
SDPUtils.writeRtpDescription = function(kind, caps) {
  var sdp = '';

  // Build the mline.
  sdp += 'm=' + kind + ' ';
  sdp += caps.codecs.length > 0 ? '9' : '0'; // reject if no codecs.
  sdp += ' UDP/TLS/RTP/SAVPF ';
  sdp += caps.codecs.map(function(codec) {
    if (codec.preferredPayloadType !== undefined) {
      return codec.preferredPayloadType;
    }
    return codec.payloadType;
  }).join(' ') + '\r\n';

  sdp += 'c=IN IP4 0.0.0.0\r\n';
  sdp += 'a=rtcp:9 IN IP4 0.0.0.0\r\n';

  // Add a=rtpmap lines for each codec. Also fmtp and rtcp-fb.
  caps.codecs.forEach(function(codec) {
    sdp += SDPUtils.writeRtpMap(codec);
    sdp += SDPUtils.writeFmtp(codec);
    sdp += SDPUtils.writeRtcpFb(codec);
  });
  var maxptime = 0;
  caps.codecs.forEach(function(codec) {
    if (codec.maxptime > maxptime) {
      maxptime = codec.maxptime;
    }
  });
  if (maxptime > 0) {
    sdp += 'a=maxptime:' + maxptime + '\r\n';
  }
  sdp += 'a=rtcp-mux\r\n';

  if (caps.headerExtensions) {
    caps.headerExtensions.forEach(function(extension) {
      sdp += SDPUtils.writeExtmap(extension);
    });
  }
  // FIXME: write fecMechanisms.
  return sdp;
};

// Parses the SDP media section and returns an array of
// RTCRtpEncodingParameters.
SDPUtils.parseRtpEncodingParameters = function(mediaSection) {
  var encodingParameters = [];
  var description = SDPUtils.parseRtpParameters(mediaSection);
  var hasRed = description.fecMechanisms.indexOf('RED') !== -1;
  var hasUlpfec = description.fecMechanisms.indexOf('ULPFEC') !== -1;

  // filter a=ssrc:... cname:, ignore PlanB-msid
  var ssrcs = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
  .map(function(line) {
    return SDPUtils.parseSsrcMedia(line);
  })
  .filter(function(parts) {
    return parts.attribute === 'cname';
  });
  var primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
  var secondarySsrc;

  var flows = SDPUtils.matchPrefix(mediaSection, 'a=ssrc-group:FID')
  .map(function(line) {
    var parts = line.substr(17).split(' ');
    return parts.map(function(part) {
      return parseInt(part, 10);
    });
  });
  if (flows.length > 0 && flows[0].length > 1 && flows[0][0] === primarySsrc) {
    secondarySsrc = flows[0][1];
  }

  description.codecs.forEach(function(codec) {
    if (codec.name.toUpperCase() === 'RTX' && codec.parameters.apt) {
      var encParam = {
        ssrc: primarySsrc,
        codecPayloadType: parseInt(codec.parameters.apt, 10)
      };
      if (primarySsrc && secondarySsrc) {
        encParam.rtx = {ssrc: secondarySsrc};
      }
      encodingParameters.push(encParam);
      if (hasRed) {
        encParam = JSON.parse(JSON.stringify(encParam));
        encParam.fec = {
          ssrc: primarySsrc,
          mechanism: hasUlpfec ? 'red+ulpfec' : 'red'
        };
        encodingParameters.push(encParam);
      }
    }
  });
  if (encodingParameters.length === 0 && primarySsrc) {
    encodingParameters.push({
      ssrc: primarySsrc
    });
  }

  // we support both b=AS and b=TIAS but interpret AS as TIAS.
  var bandwidth = SDPUtils.matchPrefix(mediaSection, 'b=');
  if (bandwidth.length) {
    if (bandwidth[0].indexOf('b=TIAS:') === 0) {
      bandwidth = parseInt(bandwidth[0].substr(7), 10);
    } else if (bandwidth[0].indexOf('b=AS:') === 0) {
      // use formula from JSEP to convert b=AS to TIAS value.
      bandwidth = parseInt(bandwidth[0].substr(5), 10) * 1000 * 0.95
          - (50 * 40 * 8);
    } else {
      bandwidth = undefined;
    }
    encodingParameters.forEach(function(params) {
      params.maxBitrate = bandwidth;
    });
  }
  return encodingParameters;
};

// parses http://draft.ortc.org/#rtcrtcpparameters*
SDPUtils.parseRtcpParameters = function(mediaSection) {
  var rtcpParameters = {};

  // Gets the first SSRC. Note tha with RTX there might be multiple
  // SSRCs.
  var remoteSsrc = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
      .map(function(line) {
        return SDPUtils.parseSsrcMedia(line);
      })
      .filter(function(obj) {
        return obj.attribute === 'cname';
      })[0];
  if (remoteSsrc) {
    rtcpParameters.cname = remoteSsrc.value;
    rtcpParameters.ssrc = remoteSsrc.ssrc;
  }

  // Edge uses the compound attribute instead of reducedSize
  // compound is !reducedSize
  var rsize = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-rsize');
  rtcpParameters.reducedSize = rsize.length > 0;
  rtcpParameters.compound = rsize.length === 0;

  // parses the rtcp-mux attrіbute.
  // Note that Edge does not support unmuxed RTCP.
  var mux = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-mux');
  rtcpParameters.mux = mux.length > 0;

  return rtcpParameters;
};

// parses either a=msid: or a=ssrc:... msid lines and returns
// the id of the MediaStream and MediaStreamTrack.
SDPUtils.parseMsid = function(mediaSection) {
  var parts;
  var spec = SDPUtils.matchPrefix(mediaSection, 'a=msid:');
  if (spec.length === 1) {
    parts = spec[0].substr(7).split(' ');
    return {stream: parts[0], track: parts[1]};
  }
  var planB = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
  .map(function(line) {
    return SDPUtils.parseSsrcMedia(line);
  })
  .filter(function(msidParts) {
    return msidParts.attribute === 'msid';
  });
  if (planB.length > 0) {
    parts = planB[0].value.split(' ');
    return {stream: parts[0], track: parts[1]};
  }
};

// Generate a session ID for SDP.
// https://tools.ietf.org/html/draft-ietf-rtcweb-jsep-20#section-5.2.1
// recommends using a cryptographically random +ve 64-bit value
// but right now this should be acceptable and within the right range
SDPUtils.generateSessionId = function() {
  return Math.random().toString().substr(2, 21);
};

// Write boilder plate for start of SDP
// sessId argument is optional - if not supplied it will
// be generated randomly
// sessVersion is optional and defaults to 2
// sessUser is optional and defaults to 'thisisadapterortc'
SDPUtils.writeSessionBoilerplate = function(sessId, sessVer, sessUser) {
  var sessionId;
  var version = sessVer !== undefined ? sessVer : 2;
  if (sessId) {
    sessionId = sessId;
  } else {
    sessionId = SDPUtils.generateSessionId();
  }
  var user = sessUser || 'thisisadapterortc';
  // FIXME: sess-id should be an NTP timestamp.
  return 'v=0\r\n' +
      'o=' + user + ' ' + sessionId + ' ' + version +
        ' IN IP4 127.0.0.1\r\n' +
      's=-\r\n' +
      't=0 0\r\n';
};

SDPUtils.writeMediaSection = function(transceiver, caps, type, stream) {
  var sdp = SDPUtils.writeRtpDescription(transceiver.kind, caps);

  // Map ICE parameters (ufrag, pwd) to SDP.
  sdp += SDPUtils.writeIceParameters(
      transceiver.iceGatherer.getLocalParameters());

  // Map DTLS parameters to SDP.
  sdp += SDPUtils.writeDtlsParameters(
      transceiver.dtlsTransport.getLocalParameters(),
      type === 'offer' ? 'actpass' : 'active');

  sdp += 'a=mid:' + transceiver.mid + '\r\n';

  if (transceiver.direction) {
    sdp += 'a=' + transceiver.direction + '\r\n';
  } else if (transceiver.rtpSender && transceiver.rtpReceiver) {
    sdp += 'a=sendrecv\r\n';
  } else if (transceiver.rtpSender) {
    sdp += 'a=sendonly\r\n';
  } else if (transceiver.rtpReceiver) {
    sdp += 'a=recvonly\r\n';
  } else {
    sdp += 'a=inactive\r\n';
  }

  if (transceiver.rtpSender) {
    // spec.
    var msid = 'msid:' + stream.id + ' ' +
        transceiver.rtpSender.track.id + '\r\n';
    sdp += 'a=' + msid;

    // for Chrome.
    sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
        ' ' + msid;
    if (transceiver.sendEncodingParameters[0].rtx) {
      sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
          ' ' + msid;
      sdp += 'a=ssrc-group:FID ' +
          transceiver.sendEncodingParameters[0].ssrc + ' ' +
          transceiver.sendEncodingParameters[0].rtx.ssrc +
          '\r\n';
    }
  }
  // FIXME: this should be written by writeRtpDescription.
  sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
      ' cname:' + SDPUtils.localCName + '\r\n';
  if (transceiver.rtpSender && transceiver.sendEncodingParameters[0].rtx) {
    sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
        ' cname:' + SDPUtils.localCName + '\r\n';
  }
  return sdp;
};

// Gets the direction from the mediaSection or the sessionpart.
SDPUtils.getDirection = function(mediaSection, sessionpart) {
  // Look for sendrecv, sendonly, recvonly, inactive, default to sendrecv.
  var lines = SDPUtils.splitLines(mediaSection);
  for (var i = 0; i < lines.length; i++) {
    switch (lines[i]) {
      case 'a=sendrecv':
      case 'a=sendonly':
      case 'a=recvonly':
      case 'a=inactive':
        return lines[i].substr(2);
      default:
        // FIXME: What should happen here?
    }
  }
  if (sessionpart) {
    return SDPUtils.getDirection(sessionpart);
  }
  return 'sendrecv';
};

SDPUtils.getKind = function(mediaSection) {
  var lines = SDPUtils.splitLines(mediaSection);
  var mline = lines[0].split(' ');
  return mline[0].substr(2);
};

SDPUtils.isRejected = function(mediaSection) {
  return mediaSection.split(' ', 2)[1] === '0';
};

SDPUtils.parseMLine = function(mediaSection) {
  var lines = SDPUtils.splitLines(mediaSection);
  var parts = lines[0].substr(2).split(' ');
  return {
    kind: parts[0],
    port: parseInt(parts[1], 10),
    protocol: parts[2],
    fmt: parts.slice(3).join(' ')
  };
};

SDPUtils.parseOLine = function(mediaSection) {
  var line = SDPUtils.matchPrefix(mediaSection, 'o=')[0];
  var parts = line.substr(2).split(' ');
  return {
    username: parts[0],
    sessionId: parts[1],
    sessionVersion: parseInt(parts[2], 10),
    netType: parts[3],
    addressType: parts[4],
    address: parts[5]
  };
};

// a very naive interpretation of a valid SDP.
SDPUtils.isValidSDP = function(blob) {
  if (typeof blob !== 'string' || blob.length === 0) {
    return false;
  }
  var lines = SDPUtils.splitLines(blob);
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].length < 2 || lines[i].charAt(1) !== '=') {
      return false;
    }
    // TODO: check the modifier a bit more.
  }
  return true;
};

// Expose public methods.
if (typeof module === 'object') {
  module.exports = SDPUtils;
}

},{}],13:[function(require,module,exports){
/** File: strophe.js
 *  A JavaScript library for writing XMPP clients.
 *
 *  This library uses either Bidirectional-streams Over Synchronous HTTP (BOSH)
 *  to emulate a persistent, stateful, two-way connection to an XMPP server or
 *  alternatively WebSockets.
 *
 *  More information on BOSH can be found in XEP 124.
 *  For more information on XMPP-over WebSocket see this RFC:
 *  http://tools.ietf.org/html/rfc7395
 */

/* All of the Strophe globals are defined in this special function below so
 * that references to the globals become closures.  This will ensure that
 * on page reload, these references will still be available to callbacks
 * that are still executing.
 */

/* jshint ignore:start */
(function (callback) {
/* jshint ignore:end */

// This code was written by Tyler Akins and has been placed in the
// public domain.  It would be nice if you left this header intact.
// Base64 code from Tyler Akins -- http://rumkin.com

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('strophe-base64', function () {
            return factory();
        });
    } else {
        // Browser globals
        root.Base64 = factory();
    }
}(this, function () {
    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    var obj = {
        /**
         * Encodes a string in base64
         * @param {String} input The string to encode in base64.
         */
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc2 = ((chr1 & 3) << 4);
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) + keyStr.charAt(enc4);
            } while (i < input.length);

            return output;
        },

        /**
         * Decodes a base64 string.
         * @param {String} input The string to decode.
         */
        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
            } while (i < input.length);

            return output;
        }
    };
    return obj;
}));

/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
 * in FIPS PUB 180-1
 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 */

/* jshint undef: true, unused: true:, noarg: true, latedef: false */
/* global define */

/* Some functions and variables have been stripped for use with Strophe */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('strophe-sha1', function () {
            return factory();
        });
    } else {
        // Browser globals
        root.SHA1 = factory();
    }
}(this, function () {

/*
 * Calculate the SHA-1 of an array of big-endian words, and a bit length
 */
function core_sha1(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << (24 - len % 32);
  x[((len + 64 >> 9) << 4) + 15] = len;

  var w = new Array(80);
  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;
  var e = -1009589776;

  var i, j, t, olda, oldb, oldc, oldd, olde;
  for (i = 0; i < x.length; i += 16)
  {
    olda = a;
    oldb = b;
    oldc = c;
    oldd = d;
    olde = e;

    for (j = 0; j < 80; j++)
    {
      if (j < 16) { w[j] = x[i + j]; }
      else { w[j] = rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1); }
      t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)),
                       safe_add(safe_add(e, w[j]), sha1_kt(j)));
      e = d;
      d = c;
      c = rol(b, 30);
      b = a;
      a = t;
    }

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
    e = safe_add(e, olde);
  }
  return [a, b, c, d, e];
}

/*
 * Perform the appropriate triplet combination function for the current
 * iteration
 */
function sha1_ft(t, b, c, d)
{
  if (t < 20) { return (b & c) | ((~b) & d); }
  if (t < 40) { return b ^ c ^ d; }
  if (t < 60) { return (b & c) | (b & d) | (c & d); }
  return b ^ c ^ d;
}

/*
 * Determine the appropriate additive constant for the current iteration
 */
function sha1_kt(t)
{
  return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
         (t < 60) ? -1894007588 : -899497514;
}

/*
 * Calculate the HMAC-SHA1 of a key and some data
 */
function core_hmac_sha1(key, data)
{
  var bkey = str2binb(key);
  if (bkey.length > 16) { bkey = core_sha1(bkey, key.length * 8); }

  var ipad = new Array(16), opad = new Array(16);
  for (var i = 0; i < 16; i++)
  {
    ipad[i] = bkey[i] ^ 0x36363636;
    opad[i] = bkey[i] ^ 0x5C5C5C5C;
  }

  var hash = core_sha1(ipad.concat(str2binb(data)), 512 + data.length * 8);
  return core_sha1(opad.concat(hash), 512 + 160);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}

/*
 * Convert an 8-bit or 16-bit string to an array of big-endian words
 * In 8-bit function, characters >255 have their hi-byte silently ignored.
 */
function str2binb(str)
{
  var bin = [];
  var mask = 255;
  for (var i = 0; i < str.length * 8; i += 8)
  {
    bin[i>>5] |= (str.charCodeAt(i / 8) & mask) << (24 - i%32);
  }
  return bin;
}

/*
 * Convert an array of big-endian words to a string
 */
function binb2str(bin)
{
  var str = "";
  var mask = 255;
  for (var i = 0; i < bin.length * 32; i += 8)
  {
    str += String.fromCharCode((bin[i>>5] >>> (24 - i%32)) & mask);
  }
  return str;
}

/*
 * Convert an array of big-endian words to a base-64 string
 */
function binb2b64(binarray)
{
  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var str = "";
  var triplet, j;
  for (var i = 0; i < binarray.length * 4; i += 3)
  {
    triplet = (((binarray[i   >> 2] >> 8 * (3 -  i   %4)) & 0xFF) << 16) |
              (((binarray[i+1 >> 2] >> 8 * (3 - (i+1)%4)) & 0xFF) << 8 ) |
               ((binarray[i+2 >> 2] >> 8 * (3 - (i+2)%4)) & 0xFF);
    for (j = 0; j < 4; j++)
    {
      if (i * 8 + j * 6 > binarray.length * 32) { str += "="; }
      else { str += tab.charAt((triplet >> 6*(3-j)) & 0x3F); }
    }
  }
  return str;
}

/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
return {
    b64_hmac_sha1:  function (key, data){ return binb2b64(core_hmac_sha1(key, data)); },
    b64_sha1:       function (s) { return binb2b64(core_sha1(str2binb(s),s.length * 8)); },
    binb2str:       binb2str,
    core_hmac_sha1: core_hmac_sha1,
    str_hmac_sha1:  function (key, data){ return binb2str(core_hmac_sha1(key, data)); },
    str_sha1:       function (s) { return binb2str(core_sha1(str2binb(s),s.length * 8)); },
};
}));

/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

/*
 * Everything that isn't used by Strophe has been stripped here!
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('strophe-md5', function () {
            return factory();
        });
    } else {
        // Browser globals
        root.MD5 = factory();
    }
}(this, function (b) {
    /*
     * Add integers, wrapping at 2^32. This uses 16-bit operations internally
     * to work around bugs in some JS interpreters.
     */
    var safe_add = function (x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    };

    /*
     * Bitwise rotate a 32-bit number to the left.
     */
    var bit_rol = function (num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    };

    /*
     * Convert a string to an array of little-endian words
     */
    var str2binl = function (str) {
        var bin = [];
        for(var i = 0; i < str.length * 8; i += 8)
        {
            bin[i>>5] |= (str.charCodeAt(i / 8) & 255) << (i%32);
        }
        return bin;
    };

    /*
     * Convert an array of little-endian words to a string
     */
    var binl2str = function (bin) {
        var str = "";
        for(var i = 0; i < bin.length * 32; i += 8)
        {
            str += String.fromCharCode((bin[i>>5] >>> (i % 32)) & 255);
        }
        return str;
    };

    /*
     * Convert an array of little-endian words to a hex string.
     */
    var binl2hex = function (binarray) {
        var hex_tab = "0123456789abcdef";
        var str = "";
        for(var i = 0; i < binarray.length * 4; i++)
        {
            str += hex_tab.charAt((binarray[i>>2] >> ((i%4)*8+4)) & 0xF) +
                hex_tab.charAt((binarray[i>>2] >> ((i%4)*8  )) & 0xF);
        }
        return str;
    };

    /*
     * These functions implement the four basic operations the algorithm uses.
     */
    var md5_cmn = function (q, a, b, x, s, t) {
        return safe_add(bit_rol(safe_add(safe_add(a, q),safe_add(x, t)), s),b);
    };

    var md5_ff = function (a, b, c, d, x, s, t) {
        return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
    };

    var md5_gg = function (a, b, c, d, x, s, t) {
        return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
    };

    var md5_hh = function (a, b, c, d, x, s, t) {
        return md5_cmn(b ^ c ^ d, a, b, x, s, t);
    };

    var md5_ii = function (a, b, c, d, x, s, t) {
        return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
    };

    /*
     * Calculate the MD5 of an array of little-endian words, and a bit length
     */
    var core_md5 = function (x, len) {
        /* append padding */
        x[len >> 5] |= 0x80 << ((len) % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;

        var a =  1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d =  271733878;

        var olda, oldb, oldc, oldd;
        for (var i = 0; i < x.length; i += 16)
        {
            olda = a;
            oldb = b;
            oldc = c;
            oldd = d;

            a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
            d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
            c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
            b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
            a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
            d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
            c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
            b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
            a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
            d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
            c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
            b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
            a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
            d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
            c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
            b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

            a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
            d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
            c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
            b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
            a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
            d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
            c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
            b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
            a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
            d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
            c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
            b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
            a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
            d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
            c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
            b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

            a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
            d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
            c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
            b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
            a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
            d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
            c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
            b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
            a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
            d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
            c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
            b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
            a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
            d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
            c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
            b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

            a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
            d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
            c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
            b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
            a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
            d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
            c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
            b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
            a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
            d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
            c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
            b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
            a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
            d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
            c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
            b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
        }
        return [a, b, c, d];
    };

    var obj = {
        /*
         * These are the functions you'll usually want to call.
         * They take string arguments and return either hex or base-64 encoded
         * strings.
         */
        hexdigest: function (s) {
            return binl2hex(core_md5(str2binl(s), s.length * 8));
        },

        hash: function (s) {
            return binl2str(core_md5(str2binl(s), s.length * 8));
        }
    };
    return obj;
}));

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('strophe-utils', function () {
            return factory();
        });
    } else {
        // Browser globals
        root.stropheUtils = factory();
    }
}(this, function () {

    var utils = {

        utf16to8: function (str) {
            var i, c;
            var out = "";
            var len = str.length;
            for (i = 0; i < len; i++) {
                c = str.charCodeAt(i);
                if ((c >= 0x0000) && (c <= 0x007F)) {
                    out += str.charAt(i);
                } else if (c > 0x07FF) {
                    out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
                    out += String.fromCharCode(0x80 | ((c >>  6) & 0x3F));
                    out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
                } else {
                    out += String.fromCharCode(0xC0 | ((c >>  6) & 0x1F));
                    out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
                }
            }
            return out;
        },

        addCookies: function (cookies) {
            /* Parameters:
             *  (Object) cookies - either a map of cookie names
             *    to string values or to maps of cookie values.
             *
             * For example:
             * { "myCookie": "1234" }
             *
             * or:
             * { "myCookie": {
             *      "value": "1234",
             *      "domain": ".example.org",
             *      "path": "/",
             *      "expires": expirationDate
             *      }
             *  }
             *
             *  These values get passed to Strophe.Connection via
             *   options.cookies
             */
            var cookieName, cookieObj, isObj, cookieValue, expires, domain, path;
            for (cookieName in (cookies || {})) {
                expires = '';
                domain = '';
                path = '';
                cookieObj = cookies[cookieName];
                isObj = typeof cookieObj == "object";
                cookieValue = escape(unescape(isObj ? cookieObj.value : cookieObj));
                if (isObj) {
                    expires = cookieObj.expires ? ";expires="+cookieObj.expires : '';
                    domain = cookieObj.domain ? ";domain="+cookieObj.domain : '';
                    path = cookieObj.path ? ";path="+cookieObj.path : '';
                }
                document.cookie =
                    cookieName+'='+cookieValue + expires + domain + path;
            }
        }
    };
    return utils;
}));

/*
    This program is distributed under the terms of the MIT license.
    Please see the LICENSE file for details.

    Copyright 2006-2008, OGG, LLC
*/

/* jshint undef: true, unused: true:, noarg: true, latedef: true */
/* global define */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('strophe-polyfill', [], function () {
            return factory();
        });
    } else {
        // Browser globals
        return factory();
    }
}(this, function () {

/** Function: Function.prototype.bind
 *  Bind a function to an instance.
 *
 *  This Function object extension method creates a bound method similar
 *  to those in Python.  This means that the 'this' object will point
 *  to the instance you want.  See <MDC's bind() documentation at https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind>
 *  and <Bound Functions and Function Imports in JavaScript at http://benjamin.smedbergs.us/blog/2007-01-03/bound-functions-and-function-imports-in-javascript/>
 *  for a complete explanation.
 *
 *  This extension already exists in some browsers (namely, Firefox 3), but
 *  we provide it to support those that don't.
 *
 *  Parameters:
 *    (Object) obj - The object that will become 'this' in the bound function.
 *    (Object) argN - An option argument that will be prepended to the
 *      arguments given for the function call
 *
 *  Returns:
 *    The bound function.
 */
if (!Function.prototype.bind) {
    Function.prototype.bind = function (obj /*, arg1, arg2, ... */) {
        var func = this;
        var _slice = Array.prototype.slice;
        var _concat = Array.prototype.concat;
        var _args = _slice.call(arguments, 1);
        return function () {
            return func.apply(obj ? obj : this, _concat.call(_args, _slice.call(arguments, 0)));
        };
    };
}

/** Function: Array.isArray
 *  This is a polyfill for the ES5 Array.isArray method.
 */
if (!Array.isArray) {
    Array.isArray = function(arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    };
}

/** Function: Array.prototype.indexOf
 *  Return the index of an object in an array.
 *
 *  This function is not supplied by some JavaScript implementations, so
 *  we provide it if it is missing.  This code is from:
 *  http://developer.mozilla.org/En/Core_JavaScript_1.5_Reference:Objects:Array:indexOf
 *
 *  Parameters:
 *    (Object) elt - The object to look for.
 *    (Integer) from - The index from which to start looking. (optional).
 *
 *  Returns:
 *    The index of elt in the array or -1 if not found.
 */
if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(elt /*, from*/) {
            var len = this.length;
            var from = Number(arguments[1]) || 0;
            from = (from < 0) ? Math.ceil(from) : Math.floor(from);
            if (from < 0) {
                from += len;
            }

            for (; from < len; from++) {
                if (from in this && this[from] === elt) {
                    return from;
                }
            }
            return -1;
        };
    }
}));


/** Function: Array.prototype.forEach
 *
 *  This function is not available in IE < 9
 *
 *  See <forEach on developer.mozilla.org at https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach>
 */
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(callback, thisArg) {
        var T, k;
        if (this === null) {
            throw new TypeError(' this is null or not defined');
        }

        // 1. Let O be the result of calling toObject() passing the
        // |this| value as the argument.
        var O = Object(this);
        // 2. Let lenValue be the result of calling the Get() internal
        // method of O with the argument "length".
        // 3. Let len be toUint32(lenValue).
        var len = O.length >>> 0;
        // 4. If isCallable(callback) is false, throw a TypeError exception.
        // See: http://es5.github.com/#x9.11
        if (typeof callback !== "function") {
            throw new TypeError(callback + ' is not a function');
        }
        // 5. If thisArg was supplied, let T be thisArg; else let
        // T be undefined.
        if (arguments.length > 1) {
            T = thisArg;
        }
        // 6. Let k be 0
        k = 0;
        // 7. Repeat, while k < len
        while (k < len) {
            var kValue;
            // a. Let Pk be ToString(k).
            //        This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the HasProperty
            //        internal method of O with argument Pk.
            //        This step can be combined with c
            // c. If kPresent is true, then
            if (k in O) {
                // i. Let kValue be the result of calling the Get internal
                // method of O with argument Pk.
                kValue = O[k];
                // ii. Call the Call internal method of callback with T as
                // the this value and argument list containing kValue, k, and O.
                callback.call(T, kValue, k, O);
            }
            // d. Increase k by 1.
            k++;
        }
        // 8. return undefined
    };
}

/*
    This program is distributed under the terms of the MIT license.
    Please see the LICENSE file for details.

    Copyright 2006-2008, OGG, LLC
*/

/* jshint undef: true, unused: true:, noarg: true, latedef: true */
/*global define, document, window, setTimeout, clearTimeout, ActiveXObject, DOMParser */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('strophe-core', [
            'strophe-sha1',
            'strophe-base64',
            'strophe-md5',
            'strophe-utils',
            "strophe-polyfill"
        ], function () {
            return factory.apply(this, arguments);
        });
    } else {
        // Browser globals
        var o = factory(root.SHA1, root.Base64, root.MD5, root.stropheUtils);
        window.Strophe =        o.Strophe;
        window.$build =         o.$build;
        window.$iq =            o.$iq;
        window.$msg =           o.$msg;
        window.$pres =          o.$pres;
        window.SHA1 =           o.SHA1;
        window.Base64 =         o.Base64;
        window.MD5 =            o.MD5;
        window.b64_hmac_sha1 =  o.SHA1.b64_hmac_sha1;
        window.b64_sha1 =       o.SHA1.b64_sha1;
        window.str_hmac_sha1 =  o.SHA1.str_hmac_sha1;
        window.str_sha1 =       o.SHA1.str_sha1;
    }
}(this, function (SHA1, Base64, MD5, utils) {

var Strophe;

/** Function: $build
 *  Create a Strophe.Builder.
 *  This is an alias for 'new Strophe.Builder(name, attrs)'.
 *
 *  Parameters:
 *    (String) name - The root element name.
 *    (Object) attrs - The attributes for the root element in object notation.
 *
 *  Returns:
 *    A new Strophe.Builder object.
 */
function $build(name, attrs) { return new Strophe.Builder(name, attrs); }

/** Function: $msg
 *  Create a Strophe.Builder with a <message/> element as the root.
 *
 *  Parameters:
 *    (Object) attrs - The <message/> element attributes in object notation.
 *
 *  Returns:
 *    A new Strophe.Builder object.
 */
function $msg(attrs) { return new Strophe.Builder("message", attrs); }

/** Function: $iq
 *  Create a Strophe.Builder with an <iq/> element as the root.
 *
 *  Parameters:
 *    (Object) attrs - The <iq/> element attributes in object notation.
 *
 *  Returns:
 *    A new Strophe.Builder object.
 */
function $iq(attrs) { return new Strophe.Builder("iq", attrs); }

/** Function: $pres
 *  Create a Strophe.Builder with a <presence/> element as the root.
 *
 *  Parameters:
 *    (Object) attrs - The <presence/> element attributes in object notation.
 *
 *  Returns:
 *    A new Strophe.Builder object.
 */
function $pres(attrs) { return new Strophe.Builder("presence", attrs); }

/** Class: Strophe
 *  An object container for all Strophe library functions.
 *
 *  This class is just a container for all the objects and constants
 *  used in the library.  It is not meant to be instantiated, but to
 *  provide a namespace for library objects, constants, and functions.
 */
Strophe = {
    /** Constant: VERSION
     *  The version of the Strophe library. Unreleased builds will have
     *  a version of head-HASH where HASH is a partial revision.
     */
    VERSION: "1.2.12",

    /** Constants: XMPP Namespace Constants
     *  Common namespace constants from the XMPP RFCs and XEPs.
     *
     *  NS.HTTPBIND - HTTP BIND namespace from XEP 124.
     *  NS.BOSH - BOSH namespace from XEP 206.
     *  NS.CLIENT - Main XMPP client namespace.
     *  NS.AUTH - Legacy authentication namespace.
     *  NS.ROSTER - Roster operations namespace.
     *  NS.PROFILE - Profile namespace.
     *  NS.DISCO_INFO - Service discovery info namespace from XEP 30.
     *  NS.DISCO_ITEMS - Service discovery items namespace from XEP 30.
     *  NS.MUC - Multi-User Chat namespace from XEP 45.
     *  NS.SASL - XMPP SASL namespace from RFC 3920.
     *  NS.STREAM - XMPP Streams namespace from RFC 3920.
     *  NS.BIND - XMPP Binding namespace from RFC 3920.
     *  NS.SESSION - XMPP Session namespace from RFC 3920.
     *  NS.XHTML_IM - XHTML-IM namespace from XEP 71.
     *  NS.XHTML - XHTML body namespace from XEP 71.
     */
    NS: {
        HTTPBIND: "http://jabber.org/protocol/httpbind",
        BOSH: "urn:xmpp:xbosh",
        CLIENT: "jabber:client",
        AUTH: "jabber:iq:auth",
        ROSTER: "jabber:iq:roster",
        PROFILE: "jabber:iq:profile",
        DISCO_INFO: "http://jabber.org/protocol/disco#info",
        DISCO_ITEMS: "http://jabber.org/protocol/disco#items",
        MUC: "http://jabber.org/protocol/muc",
        SASL: "urn:ietf:params:xml:ns:xmpp-sasl",
        STREAM: "http://etherx.jabber.org/streams",
        FRAMING: "urn:ietf:params:xml:ns:xmpp-framing",
        BIND: "urn:ietf:params:xml:ns:xmpp-bind",
        SESSION: "urn:ietf:params:xml:ns:xmpp-session",
        VERSION: "jabber:iq:version",
        STANZAS: "urn:ietf:params:xml:ns:xmpp-stanzas",
        XHTML_IM: "http://jabber.org/protocol/xhtml-im",
        XHTML: "http://www.w3.org/1999/xhtml"
    },

    /** Constants: XHTML_IM Namespace
     *  contains allowed tags, tag attributes, and css properties.
     *  Used in the createHtml function to filter incoming html into the allowed XHTML-IM subset.
     *  See http://xmpp.org/extensions/xep-0071.html#profile-summary for the list of recommended
     *  allowed tags and their attributes.
     */
    XHTML: {
        tags: ['a','blockquote','br','cite','em','img','li','ol','p','span','strong','ul','body'],
        attributes: {
            'a':          ['href'],
            'blockquote': ['style'],
            'br':         [],
            'cite':       ['style'],
            'em':         [],
            'img':        ['src', 'alt', 'style', 'height', 'width'],
            'li':         ['style'],
            'ol':         ['style'],
            'p':          ['style'],
            'span':       ['style'],
            'strong':     [],
            'ul':         ['style'],
            'body':       []
        },
        css: ['background-color','color','font-family','font-size','font-style','font-weight','margin-left','margin-right','text-align','text-decoration'],
        /** Function: XHTML.validTag
         *
         * Utility method to determine whether a tag is allowed
         * in the XHTML_IM namespace.
         *
         * XHTML tag names are case sensitive and must be lower case.
         */
        validTag: function(tag) {
            for (var i = 0; i < Strophe.XHTML.tags.length; i++) {
                if (tag == Strophe.XHTML.tags[i]) {
                    return true;
                }
            }
            return false;
        },
        /** Function: XHTML.validAttribute
         *
         * Utility method to determine whether an attribute is allowed
         * as recommended per XEP-0071
         *
         * XHTML attribute names are case sensitive and must be lower case.
         */
        validAttribute: function(tag, attribute) {
            if (typeof Strophe.XHTML.attributes[tag] !== 'undefined' && Strophe.XHTML.attributes[tag].length > 0) {
                for (var i = 0; i < Strophe.XHTML.attributes[tag].length; i++) {
                    if (attribute == Strophe.XHTML.attributes[tag][i]) {
                        return true;
                    }
                }
            }
        return false;
        },
        validCSS: function(style) {
            for (var i = 0; i < Strophe.XHTML.css.length; i++) {
                if (style == Strophe.XHTML.css[i]) {
                    return true;
                }
            }
            return false;
        }
    },

    /** Constants: Connection Status Constants
     *  Connection status constants for use by the connection handler
     *  callback.
     *
     *  Status.ERROR - An error has occurred
     *  Status.CONNECTING - The connection is currently being made
     *  Status.CONNFAIL - The connection attempt failed
     *  Status.AUTHENTICATING - The connection is authenticating
     *  Status.AUTHFAIL - The authentication attempt failed
     *  Status.CONNECTED - The connection has succeeded
     *  Status.DISCONNECTED - The connection has been terminated
     *  Status.DISCONNECTING - The connection is currently being terminated
     *  Status.ATTACHED - The connection has been attached
     *  Status.CONNTIMEOUT - The connection has timed out
     */
    Status: {
        ERROR: 0,
        CONNECTING: 1,
        CONNFAIL: 2,
        AUTHENTICATING: 3,
        AUTHFAIL: 4,
        CONNECTED: 5,
        DISCONNECTED: 6,
        DISCONNECTING: 7,
        ATTACHED: 8,
        REDIRECT: 9,
        CONNTIMEOUT: 10
    },

    /** Constants: Log Level Constants
     *  Logging level indicators.
     *
     *  LogLevel.DEBUG - Debug output
     *  LogLevel.INFO - Informational output
     *  LogLevel.WARN - Warnings
     *  LogLevel.ERROR - Errors
     *  LogLevel.FATAL - Fatal errors
     */
    LogLevel: {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
        FATAL: 4
    },

    /** PrivateConstants: DOM Element Type Constants
     *  DOM element types.
     *
     *  ElementType.NORMAL - Normal element.
     *  ElementType.TEXT - Text data element.
     *  ElementType.FRAGMENT - XHTML fragment element.
     */
    ElementType: {
        NORMAL: 1,
        TEXT: 3,
        CDATA: 4,
        FRAGMENT: 11
    },

    /** PrivateConstants: Timeout Values
     *  Timeout values for error states.  These values are in seconds.
     *  These should not be changed unless you know exactly what you are
     *  doing.
     *
     *  TIMEOUT - Timeout multiplier. A waiting request will be considered
     *      failed after Math.floor(TIMEOUT * wait) seconds have elapsed.
     *      This defaults to 1.1, and with default wait, 66 seconds.
     *  SECONDARY_TIMEOUT - Secondary timeout multiplier. In cases where
     *      Strophe can detect early failure, it will consider the request
     *      failed if it doesn't return after
     *      Math.floor(SECONDARY_TIMEOUT * wait) seconds have elapsed.
     *      This defaults to 0.1, and with default wait, 6 seconds.
     */
    TIMEOUT: 1.1,
    SECONDARY_TIMEOUT: 0.1,

    /** Function: addNamespace
     *  This function is used to extend the current namespaces in
     *  Strophe.NS.  It takes a key and a value with the key being the
     *  name of the new namespace, with its actual value.
     *  For example:
     *  Strophe.addNamespace('PUBSUB', "http://jabber.org/protocol/pubsub");
     *
     *  Parameters:
     *    (String) name - The name under which the namespace will be
     *      referenced under Strophe.NS
     *    (String) value - The actual namespace.
     */
    addNamespace: function (name, value) {
        Strophe.NS[name] = value;
    },

    /** Function: forEachChild
     *  Map a function over some or all child elements of a given element.
     *
     *  This is a small convenience function for mapping a function over
     *  some or all of the children of an element.  If elemName is null, all
     *  children will be passed to the function, otherwise only children
     *  whose tag names match elemName will be passed.
     *
     *  Parameters:
     *    (XMLElement) elem - The element to operate on.
     *    (String) elemName - The child element tag name filter.
     *    (Function) func - The function to apply to each child.  This
     *      function should take a single argument, a DOM element.
     */
    forEachChild: function (elem, elemName, func) {
        var i, childNode;
        for (i = 0; i < elem.childNodes.length; i++) {
            childNode = elem.childNodes[i];
            if (childNode.nodeType == Strophe.ElementType.NORMAL &&
                (!elemName || this.isTagEqual(childNode, elemName))) {
                func(childNode);
            }
        }
    },

    /** Function: isTagEqual
     *  Compare an element's tag name with a string.
     *
     *  This function is case sensitive.
     *
     *  Parameters:
     *    (XMLElement) el - A DOM element.
     *    (String) name - The element name.
     *
     *  Returns:
     *    true if the element's tag name matches _el_, and false
     *    otherwise.
     */
    isTagEqual: function (el, name) {
        return el.tagName == name;
    },

    /** PrivateVariable: _xmlGenerator
     *  _Private_ variable that caches a DOM document to
     *  generate elements.
     */
    _xmlGenerator: null,

    /** PrivateFunction: _makeGenerator
     *  _Private_ function that creates a dummy XML DOM document to serve as
     *  an element and text node generator.
     */
    _makeGenerator: function () {
        var doc;
        // IE9 does implement createDocument(); however, using it will cause the browser to leak memory on page unload.
        // Here, we test for presence of createDocument() plus IE's proprietary documentMode attribute, which would be
                // less than 10 in the case of IE9 and below.
        if (document.implementation.createDocument === undefined ||
                        document.implementation.createDocument && document.documentMode && document.documentMode < 10) {
            doc = this._getIEXmlDom();
            doc.appendChild(doc.createElement('strophe'));
        } else {
            doc = document.implementation
                .createDocument('jabber:client', 'strophe', null);
        }
        return doc;
    },

    /** Function: xmlGenerator
     *  Get the DOM document to generate elements.
     *
     *  Returns:
     *    The currently used DOM document.
     */
    xmlGenerator: function () {
        if (!Strophe._xmlGenerator) {
            Strophe._xmlGenerator = Strophe._makeGenerator();
        }
        return Strophe._xmlGenerator;
    },

    /** PrivateFunction: _getIEXmlDom
     *  Gets IE xml doc object
     *
     *  Returns:
     *    A Microsoft XML DOM Object
     *  See Also:
     *    http://msdn.microsoft.com/en-us/library/ms757837%28VS.85%29.aspx
     */
    _getIEXmlDom : function() {
        var doc = null;
        var docStrings = [
            "Msxml2.DOMDocument.6.0",
            "Msxml2.DOMDocument.5.0",
            "Msxml2.DOMDocument.4.0",
            "MSXML2.DOMDocument.3.0",
            "MSXML2.DOMDocument",
            "MSXML.DOMDocument",
            "Microsoft.XMLDOM"
        ];

        for (var d = 0; d < docStrings.length; d++) {
            if (doc === null) {
                try {
                    doc = new ActiveXObject(docStrings[d]);
                } catch (e) {
                    doc = null;
                }
            } else {
                break;
            }
        }
        return doc;
    },

    /** Function: xmlElement
     *  Create an XML DOM element.
     *
     *  This function creates an XML DOM element correctly across all
     *  implementations. Note that these are not HTML DOM elements, which
     *  aren't appropriate for XMPP stanzas.
     *
     *  Parameters:
     *    (String) name - The name for the element.
     *    (Array|Object) attrs - An optional array or object containing
     *      key/value pairs to use as element attributes. The object should
     *      be in the format {'key': 'value'} or {key: 'value'}. The array
     *      should have the format [['key1', 'value1'], ['key2', 'value2']].
     *    (String) text - The text child data for the element.
     *
     *  Returns:
     *    A new XML DOM element.
     */
    xmlElement: function (name) {
        if (!name) { return null; }

        var node = Strophe.xmlGenerator().createElement(name);
        // FIXME: this should throw errors if args are the wrong type or
        // there are more than two optional args
        var a, i, k;
        for (a = 1; a < arguments.length; a++) {
            var arg = arguments[a];
            if (!arg) { continue; }
            if (typeof(arg) == "string" ||
                typeof(arg) == "number") {
                node.appendChild(Strophe.xmlTextNode(arg));
            } else if (typeof(arg) == "object" &&
                       typeof(arg.sort) == "function") {
                for (i = 0; i < arg.length; i++) {
                    var attr = arg[i];
                    if (typeof(attr) == "object" &&
                        typeof(attr.sort) == "function" &&
                        attr[1] !== undefined &&
                        attr[1] !== null) {
                        node.setAttribute(attr[0], attr[1]);
                    }
                }
            } else if (typeof(arg) == "object") {
                for (k in arg) {
                    if (arg.hasOwnProperty(k)) {
                        if (arg[k] !== undefined &&
                            arg[k] !== null) {
                            node.setAttribute(k, arg[k]);
                        }
                    }
                }
            }
        }

        return node;
    },

    /*  Function: xmlescape
     *  Excapes invalid xml characters.
     *
     *  Parameters:
     *     (String) text - text to escape.
     *
     *  Returns:
     *      Escaped text.
     */
    xmlescape: function(text) {
        text = text.replace(/\&/g, "&amp;");
        text = text.replace(/</g,  "&lt;");
        text = text.replace(/>/g,  "&gt;");
        text = text.replace(/'/g,  "&apos;");
        text = text.replace(/"/g,  "&quot;");
        return text;
    },

    /*  Function: xmlunescape
    *  Unexcapes invalid xml characters.
    *
    *  Parameters:
    *     (String) text - text to unescape.
    *
    *  Returns:
    *      Unescaped text.
    */
    xmlunescape: function(text) {
        text = text.replace(/\&amp;/g, "&");
        text = text.replace(/&lt;/g,  "<");
        text = text.replace(/&gt;/g,  ">");
        text = text.replace(/&apos;/g,  "'");
        text = text.replace(/&quot;/g,  "\"");
        return text;
    },

    /** Function: xmlTextNode
     *  Creates an XML DOM text node.
     *
     *  Provides a cross implementation version of document.createTextNode.
     *
     *  Parameters:
     *    (String) text - The content of the text node.
     *
     *  Returns:
     *    A new XML DOM text node.
     */
    xmlTextNode: function (text) {
        return Strophe.xmlGenerator().createTextNode(text);
    },

    /** Function: xmlHtmlNode
     *  Creates an XML DOM html node.
     *
     *  Parameters:
     *    (String) html - The content of the html node.
     *
     *  Returns:
     *    A new XML DOM text node.
     */
    xmlHtmlNode: function (html) {
        var node;
        //ensure text is escaped
        if (window.DOMParser) {
            var parser = new DOMParser();
            node = parser.parseFromString(html, "text/xml");
        } else {
            node = new ActiveXObject("Microsoft.XMLDOM");
            node.async="false";
            node.loadXML(html);
        }
        return node;
    },

    /** Function: getText
     *  Get the concatenation of all text children of an element.
     *
     *  Parameters:
     *    (XMLElement) elem - A DOM element.
     *
     *  Returns:
     *    A String with the concatenated text of all text element children.
     */
    getText: function (elem) {
        if (!elem) { return null; }

        var str = "";
        if (elem.childNodes.length === 0 && elem.nodeType ==
            Strophe.ElementType.TEXT) {
            str += elem.nodeValue;
        }

        for (var i = 0; i < elem.childNodes.length; i++) {
            if (elem.childNodes[i].nodeType == Strophe.ElementType.TEXT) {
                str += elem.childNodes[i].nodeValue;
            }
        }

        return Strophe.xmlescape(str);
    },

    /** Function: copyElement
     *  Copy an XML DOM element.
     *
     *  This function copies a DOM element and all its descendants and returns
     *  the new copy.
     *
     *  Parameters:
     *    (XMLElement) elem - A DOM element.
     *
     *  Returns:
     *    A new, copied DOM element tree.
     */
    copyElement: function (elem) {
        var i, el;
        if (elem.nodeType == Strophe.ElementType.NORMAL) {
            el = Strophe.xmlElement(elem.tagName);

            for (i = 0; i < elem.attributes.length; i++) {
                el.setAttribute(elem.attributes[i].nodeName,
                                elem.attributes[i].value);
            }

            for (i = 0; i < elem.childNodes.length; i++) {
                el.appendChild(Strophe.copyElement(elem.childNodes[i]));
            }
        } else if (elem.nodeType == Strophe.ElementType.TEXT) {
            el = Strophe.xmlGenerator().createTextNode(elem.nodeValue);
        }
        return el;
    },


    /** Function: createHtml
     *  Copy an HTML DOM element into an XML DOM.
     *
     *  This function copies a DOM element and all its descendants and returns
     *  the new copy.
     *
     *  Parameters:
     *    (HTMLElement) elem - A DOM element.
     *
     *  Returns:
     *    A new, copied DOM element tree.
     */
    createHtml: function (elem) {
        var i, el, j, tag, attribute, value, css, cssAttrs, attr, cssName, cssValue;
        if (elem.nodeType == Strophe.ElementType.NORMAL) {
            tag = elem.nodeName.toLowerCase(); // XHTML tags must be lower case.
            if(Strophe.XHTML.validTag(tag)) {
                try {
                    el = Strophe.xmlElement(tag);
                    for(i = 0; i < Strophe.XHTML.attributes[tag].length; i++) {
                        attribute = Strophe.XHTML.attributes[tag][i];
                        value = elem.getAttribute(attribute);
                        if(typeof value == 'undefined' || value === null || value === '' || value === false || value === 0) {
                            continue;
                        }
                        if(attribute == 'style' && typeof value == 'object') {
                            if(typeof value.cssText != 'undefined') {
                                value = value.cssText; // we're dealing with IE, need to get CSS out
                            }
                        }
                        // filter out invalid css styles
                        if(attribute == 'style') {
                            css = [];
                            cssAttrs = value.split(';');
                            for(j = 0; j < cssAttrs.length; j++) {
                                attr = cssAttrs[j].split(':');
                                cssName = attr[0].replace(/^\s*/, "").replace(/\s*$/, "").toLowerCase();
                                if(Strophe.XHTML.validCSS(cssName)) {
                                    cssValue = attr[1].replace(/^\s*/, "").replace(/\s*$/, "");
                                    css.push(cssName + ': ' + cssValue);
                                }
                            }
                            if(css.length > 0) {
                                value = css.join('; ');
                                el.setAttribute(attribute, value);
                            }
                        } else {
                            el.setAttribute(attribute, value);
                        }
                    }

                    for (i = 0; i < elem.childNodes.length; i++) {
                        el.appendChild(Strophe.createHtml(elem.childNodes[i]));
                    }
                } catch(e) { // invalid elements
                  el = Strophe.xmlTextNode('');
                }
            } else {
                el = Strophe.xmlGenerator().createDocumentFragment();
                for (i = 0; i < elem.childNodes.length; i++) {
                    el.appendChild(Strophe.createHtml(elem.childNodes[i]));
                }
            }
        } else if (elem.nodeType == Strophe.ElementType.FRAGMENT) {
            el = Strophe.xmlGenerator().createDocumentFragment();
            for (i = 0; i < elem.childNodes.length; i++) {
                el.appendChild(Strophe.createHtml(elem.childNodes[i]));
            }
        } else if (elem.nodeType == Strophe.ElementType.TEXT) {
            el = Strophe.xmlTextNode(elem.nodeValue);
        }
        return el;
    },

    /** Function: escapeNode
     *  Escape the node part (also called local part) of a JID.
     *
     *  Parameters:
     *    (String) node - A node (or local part).
     *
     *  Returns:
     *    An escaped node (or local part).
     */
    escapeNode: function (node) {
        if (typeof node !== "string") { return node; }
        return node.replace(/^\s+|\s+$/g, '')
            .replace(/\\/g,  "\\5c")
            .replace(/ /g,   "\\20")
            .replace(/\"/g,  "\\22")
            .replace(/\&/g,  "\\26")
            .replace(/\'/g,  "\\27")
            .replace(/\//g,  "\\2f")
            .replace(/:/g,   "\\3a")
            .replace(/</g,   "\\3c")
            .replace(/>/g,   "\\3e")
            .replace(/@/g,   "\\40");
    },

    /** Function: unescapeNode
     *  Unescape a node part (also called local part) of a JID.
     *
     *  Parameters:
     *    (String) node - A node (or local part).
     *
     *  Returns:
     *    An unescaped node (or local part).
     */
    unescapeNode: function (node) {
        if (typeof node !== "string") { return node; }
        return node.replace(/\\20/g, " ")
            .replace(/\\22/g, '"')
            .replace(/\\26/g, "&")
            .replace(/\\27/g, "'")
            .replace(/\\2f/g, "/")
            .replace(/\\3a/g, ":")
            .replace(/\\3c/g, "<")
            .replace(/\\3e/g, ">")
            .replace(/\\40/g, "@")
            .replace(/\\5c/g, "\\");
    },

    /** Function: getNodeFromJid
     *  Get the node portion of a JID String.
     *
     *  Parameters:
     *    (String) jid - A JID.
     *
     *  Returns:
     *    A String containing the node.
     */
    getNodeFromJid: function (jid) {
        if (jid.indexOf("@") < 0) { return null; }
        return jid.split("@")[0];
    },

    /** Function: getDomainFromJid
     *  Get the domain portion of a JID String.
     *
     *  Parameters:
     *    (String) jid - A JID.
     *
     *  Returns:
     *    A String containing the domain.
     */
    getDomainFromJid: function (jid) {
        var bare = Strophe.getBareJidFromJid(jid);
        if (bare.indexOf("@") < 0) {
            return bare;
        } else {
            var parts = bare.split("@");
            parts.splice(0, 1);
            return parts.join('@');
        }
    },

    /** Function: getResourceFromJid
     *  Get the resource portion of a JID String.
     *
     *  Parameters:
     *    (String) jid - A JID.
     *
     *  Returns:
     *    A String containing the resource.
     */
    getResourceFromJid: function (jid) {
        var s = jid.split("/");
        if (s.length < 2) { return null; }
        s.splice(0, 1);
        return s.join('/');
    },

    /** Function: getBareJidFromJid
     *  Get the bare JID from a JID String.
     *
     *  Parameters:
     *    (String) jid - A JID.
     *
     *  Returns:
     *    A String containing the bare JID.
     */
    getBareJidFromJid: function (jid) {
        return jid ? jid.split("/")[0] : null;
    },

    /** PrivateFunction: _handleError
     *  _Private_ function that properly logs an error to the console
     */
    _handleError: function (e) {
        if (typeof e.stack !== "undefined") {
            Strophe.fatal(e.stack);
        }
        if (e.sourceURL) {
            Strophe.fatal("error: " + this.handler + " " + e.sourceURL + ":" +
                          e.line + " - " + e.name + ": " + e.message);
        } else if (e.fileName) {
            Strophe.fatal("error: " + this.handler + " " +
                          e.fileName + ":" + e.lineNumber + " - " +
                          e.name + ": " + e.message);
        } else {
            Strophe.fatal("error: " + e.message);
        }
    },

    /** Function: log
     *  User overrideable logging function.
     *
     *  This function is called whenever the Strophe library calls any
     *  of the logging functions.  The default implementation of this
     *  function does nothing.  If client code wishes to handle the logging
     *  messages, it should override this with
     *  > Strophe.log = function (level, msg) {
     *  >   (user code here)
     *  > };
     *
     *  Please note that data sent and received over the wire is logged
     *  via Strophe.Connection.rawInput() and Strophe.Connection.rawOutput().
     *
     *  The different levels and their meanings are
     *
     *    DEBUG - Messages useful for debugging purposes.
     *    INFO - Informational messages.  This is mostly information like
     *      'disconnect was called' or 'SASL auth succeeded'.
     *    WARN - Warnings about potential problems.  This is mostly used
     *      to report transient connection errors like request timeouts.
     *    ERROR - Some error occurred.
     *    FATAL - A non-recoverable fatal error occurred.
     *
     *  Parameters:
     *    (Integer) level - The log level of the log message.  This will
     *      be one of the values in Strophe.LogLevel.
     *    (String) msg - The log message.
     */
    /* jshint ignore:start */
    log: function (level, msg) {
        return;
    },
    /* jshint ignore:end */

    /** Function: debug
     *  Log a message at the Strophe.LogLevel.DEBUG level.
     *
     *  Parameters:
     *    (String) msg - The log message.
     */
    debug: function(msg) {
        this.log(this.LogLevel.DEBUG, msg);
    },

    /** Function: info
     *  Log a message at the Strophe.LogLevel.INFO level.
     *
     *  Parameters:
     *    (String) msg - The log message.
     */
    info: function (msg) {
        this.log(this.LogLevel.INFO, msg);
    },

    /** Function: warn
     *  Log a message at the Strophe.LogLevel.WARN level.
     *
     *  Parameters:
     *    (String) msg - The log message.
     */
    warn: function (msg) {
        this.log(this.LogLevel.WARN, msg);
    },

    /** Function: error
     *  Log a message at the Strophe.LogLevel.ERROR level.
     *
     *  Parameters:
     *    (String) msg - The log message.
     */
    error: function (msg) {
        this.log(this.LogLevel.ERROR, msg);
    },

    /** Function: fatal
     *  Log a message at the Strophe.LogLevel.FATAL level.
     *
     *  Parameters:
     *    (String) msg - The log message.
     */
    fatal: function (msg) {
        this.log(this.LogLevel.FATAL, msg);
    },

    /** Function: serialize
     *  Render a DOM element and all descendants to a String.
     *
     *  Parameters:
     *    (XMLElement) elem - A DOM element.
     *
     *  Returns:
     *    The serialized element tree as a String.
     */
    serialize: function (elem) {
        var result;

        if (!elem) { return null; }

        if (typeof(elem.tree) === "function") {
            elem = elem.tree();
        }

        var nodeName = elem.nodeName;
        var i, child;

        if (elem.getAttribute("_realname")) {
            nodeName = elem.getAttribute("_realname");
        }

        result = "<" + nodeName;
        for (i = 0; i < elem.attributes.length; i++) {
             if(elem.attributes[i].nodeName != "_realname") {
               result += " " + elem.attributes[i].nodeName +
                   "='" + Strophe.xmlescape(elem.attributes[i].value) + "'";
             }
        }

        if (elem.childNodes.length > 0) {
            result += ">";
            for (i = 0; i < elem.childNodes.length; i++) {
                child = elem.childNodes[i];
                switch( child.nodeType ){
                  case Strophe.ElementType.NORMAL:
                    // normal element, so recurse
                    result += Strophe.serialize(child);
                    break;
                  case Strophe.ElementType.TEXT:
                    // text element to escape values
                    result += Strophe.xmlescape(child.nodeValue);
                    break;
                  case Strophe.ElementType.CDATA:
                    // cdata section so don't escape values
                    result += "<![CDATA["+child.nodeValue+"]]>";
                }
            }
            result += "</" + nodeName + ">";
        } else {
            result += "/>";
        }

        return result;
    },

    /** PrivateVariable: _requestId
     *  _Private_ variable that keeps track of the request ids for
     *  connections.
     */
    _requestId: 0,

    /** PrivateVariable: Strophe.connectionPlugins
     *  _Private_ variable Used to store plugin names that need
     *  initialization on Strophe.Connection construction.
     */
    _connectionPlugins: {},

    /** Function: addConnectionPlugin
     *  Extends the Strophe.Connection object with the given plugin.
     *
     *  Parameters:
     *    (String) name - The name of the extension.
     *    (Object) ptype - The plugin's prototype.
     */
    addConnectionPlugin: function (name, ptype) {
        Strophe._connectionPlugins[name] = ptype;
    }
};

/** Class: Strophe.Builder
 *  XML DOM builder.
 *
 *  This object provides an interface similar to JQuery but for building
 *  DOM elements easily and rapidly.  All the functions except for toString()
 *  and tree() return the object, so calls can be chained.  Here's an
 *  example using the $iq() builder helper.
 *  > $iq({to: 'you', from: 'me', type: 'get', id: '1'})
 *  >     .c('query', {xmlns: 'strophe:example'})
 *  >     .c('example')
 *  >     .toString()
 *
 *  The above generates this XML fragment
 *  > <iq to='you' from='me' type='get' id='1'>
 *  >   <query xmlns='strophe:example'>
 *  >     <example/>
 *  >   </query>
 *  > </iq>
 *  The corresponding DOM manipulations to get a similar fragment would be
 *  a lot more tedious and probably involve several helper variables.
 *
 *  Since adding children makes new operations operate on the child, up()
 *  is provided to traverse up the tree.  To add two children, do
 *  > builder.c('child1', ...).up().c('child2', ...)
 *  The next operation on the Builder will be relative to the second child.
 */

/** Constructor: Strophe.Builder
 *  Create a Strophe.Builder object.
 *
 *  The attributes should be passed in object notation.  For example
 *  > var b = new Builder('message', {to: 'you', from: 'me'});
 *  or
 *  > var b = new Builder('messsage', {'xml:lang': 'en'});
 *
 *  Parameters:
 *    (String) name - The name of the root element.
 *    (Object) attrs - The attributes for the root element in object notation.
 *
 *  Returns:
 *    A new Strophe.Builder.
 */
Strophe.Builder = function (name, attrs) {
    // Set correct namespace for jabber:client elements
    if (name == "presence" || name == "message" || name == "iq") {
        if (attrs && !attrs.xmlns) {
            attrs.xmlns = Strophe.NS.CLIENT;
        } else if (!attrs) {
            attrs = {xmlns: Strophe.NS.CLIENT};
        }
    }

    // Holds the tree being built.
    this.nodeTree = Strophe.xmlElement(name, attrs);

    // Points to the current operation node.
    this.node = this.nodeTree;
};

Strophe.Builder.prototype = {
    /** Function: tree
     *  Return the DOM tree.
     *
     *  This function returns the current DOM tree as an element object.  This
     *  is suitable for passing to functions like Strophe.Connection.send().
     *
     *  Returns:
     *    The DOM tree as a element object.
     */
    tree: function () {
        return this.nodeTree;
    },

    /** Function: toString
     *  Serialize the DOM tree to a String.
     *
     *  This function returns a string serialization of the current DOM
     *  tree.  It is often used internally to pass data to a
     *  Strophe.Request object.
     *
     *  Returns:
     *    The serialized DOM tree in a String.
     */
    toString: function () {
        return Strophe.serialize(this.nodeTree);
    },

    /** Function: up
     *  Make the current parent element the new current element.
     *
     *  This function is often used after c() to traverse back up the tree.
     *  For example, to add two children to the same element
     *  > builder.c('child1', {}).up().c('child2', {});
     *
     *  Returns:
     *    The Stophe.Builder object.
     */
    up: function () {
        this.node = this.node.parentNode;
        return this;
    },

    /** Function: root
     *  Make the root element the new current element.
     *
     *  When at a deeply nested element in the tree, this function can be used
     *  to jump back to the root of the tree, instead of having to repeatedly
     *  call up().
     *
     *  Returns:
     *    The Stophe.Builder object.
     */
    root: function () {
        this.node = this.nodeTree;
        return this;
    },

    /** Function: attrs
     *  Add or modify attributes of the current element.
     *
     *  The attributes should be passed in object notation.  This function
     *  does not move the current element pointer.
     *
     *  Parameters:
     *    (Object) moreattrs - The attributes to add/modify in object notation.
     *
     *  Returns:
     *    The Strophe.Builder object.
     */
    attrs: function (moreattrs) {
        for (var k in moreattrs) {
            if (moreattrs.hasOwnProperty(k)) {
                if (moreattrs[k] === undefined) {
                    this.node.removeAttribute(k);
                } else {
                    this.node.setAttribute(k, moreattrs[k]);
                }
            }
        }
        return this;
    },

    /** Function: c
     *  Add a child to the current element and make it the new current
     *  element.
     *
     *  This function moves the current element pointer to the child,
     *  unless text is provided.  If you need to add another child, it
     *  is necessary to use up() to go back to the parent in the tree.
     *
     *  Parameters:
     *    (String) name - The name of the child.
     *    (Object) attrs - The attributes of the child in object notation.
     *    (String) text - The text to add to the child.
     *
     *  Returns:
     *    The Strophe.Builder object.
     */
    c: function (name, attrs, text) {
        var child = Strophe.xmlElement(name, attrs, text);
        this.node.appendChild(child);
        if (typeof text !== "string" && typeof text !=="number") {
            this.node = child;
        }
        return this;
    },

    /** Function: cnode
     *  Add a child to the current element and make it the new current
     *  element.
     *
     *  This function is the same as c() except that instead of using a
     *  name and an attributes object to create the child it uses an
     *  existing DOM element object.
     *
     *  Parameters:
     *    (XMLElement) elem - A DOM element.
     *
     *  Returns:
     *    The Strophe.Builder object.
     */
    cnode: function (elem) {
        var impNode;
        var xmlGen = Strophe.xmlGenerator();
        try {
            impNode = (xmlGen.importNode !== undefined);
        } catch (e) {
            impNode = false;
        }
        var newElem = impNode ?
                      xmlGen.importNode(elem, true) :
                      Strophe.copyElement(elem);
        this.node.appendChild(newElem);
        this.node = newElem;
        return this;
    },

    /** Function: t
     *  Add a child text element.
     *
     *  This *does not* make the child the new current element since there
     *  are no children of text elements.
     *
     *  Parameters:
     *    (String) text - The text data to append to the current element.
     *
     *  Returns:
     *    The Strophe.Builder object.
     */
    t: function (text) {
        var child = Strophe.xmlTextNode(text);
        this.node.appendChild(child);
        return this;
    },

    /** Function: h
     *  Replace current element contents with the HTML passed in.
     *
     *  This *does not* make the child the new current element
     *
     *  Parameters:
     *    (String) html - The html to insert as contents of current element.
     *
     *  Returns:
     *    The Strophe.Builder object.
     */
    h: function (html) {
        var fragment = document.createElement('body');

        // force the browser to try and fix any invalid HTML tags
        fragment.innerHTML = html;

        // copy cleaned html into an xml dom
        var xhtml = Strophe.createHtml(fragment);

        while(xhtml.childNodes.length > 0) {
            this.node.appendChild(xhtml.childNodes[0]);
        }
        return this;
    }
};

/** PrivateClass: Strophe.Handler
 *  _Private_ helper class for managing stanza handlers.
 *
 *  A Strophe.Handler encapsulates a user provided callback function to be
 *  executed when matching stanzas are received by the connection.
 *  Handlers can be either one-off or persistant depending on their
 *  return value. Returning true will cause a Handler to remain active, and
 *  returning false will remove the Handler.
 *
 *  Users will not use Strophe.Handler objects directly, but instead they
 *  will use Strophe.Connection.addHandler() and
 *  Strophe.Connection.deleteHandler().
 */

/** PrivateConstructor: Strophe.Handler
 *  Create and initialize a new Strophe.Handler.
 *
 *  Parameters:
 *    (Function) handler - A function to be executed when the handler is run.
 *    (String) ns - The namespace to match.
 *    (String) name - The element name to match.
 *    (String) type - The element type to match.
 *    (String) id - The element id attribute to match.
 *    (String) from - The element from attribute to match.
 *    (Object) options - Handler options
 *
 *  Returns:
 *    A new Strophe.Handler object.
 */
Strophe.Handler = function (handler, ns, name, type, id, from, options) {
    this.handler = handler;
    this.ns = ns;
    this.name = name;
    this.type = type;
    this.id = id;
    this.options = options || {'matchBareFromJid': false, 'ignoreNamespaceFragment': false};
    // BBB: Maintain backward compatibility with old `matchBare` option
    if (this.options.matchBare) {
        Strophe.warn('The "matchBare" option is deprecated, use "matchBareFromJid" instead.');
        this.options.matchBareFromJid = this.options.matchBare;
        delete this.options.matchBare;
    }

    if (this.options.matchBareFromJid) {
        this.from = from ? Strophe.getBareJidFromJid(from) : null;
    } else {
        this.from = from;
    }
    // whether the handler is a user handler or a system handler
    this.user = true;
};

Strophe.Handler.prototype = {
    /** PrivateFunction: getNamespace
     *  Returns the XML namespace attribute on an element.
     *  If `ignoreNamespaceFragment` was passed in for this handler, then the
     *  URL fragment will be stripped.
     *
     *  Parameters:
     *    (XMLElement) elem - The XML element with the namespace.
     *
     *  Returns:
     *    The namespace, with optionally the fragment stripped.
     */
    getNamespace: function (elem) {
        var elNamespace = elem.getAttribute("xmlns");
        if (elNamespace && this.options.ignoreNamespaceFragment) {
            elNamespace = elNamespace.split('#')[0];
        }
        return elNamespace;
    },

    /** PrivateFunction: namespaceMatch
     *  Tests if a stanza matches the namespace set for this Strophe.Handler.
     *
     *  Parameters:
     *    (XMLElement) elem - The XML element to test.
     *
     *  Returns:
     *    true if the stanza matches and false otherwise.
     */
    namespaceMatch: function (elem) {
        var nsMatch = false;
        if (!this.ns) {
            return true;
        } else {
            var that = this;
            Strophe.forEachChild(elem, null, function (elem) {
                if (that.getNamespace(elem) === that.ns) {
                    nsMatch = true;
                }
            });
            nsMatch = nsMatch || this.getNamespace(elem) === this.ns;
        }
        return nsMatch;
    },

    /** PrivateFunction: isMatch
     *  Tests if a stanza matches the Strophe.Handler.
     *
     *  Parameters:
     *    (XMLElement) elem - The XML element to test.
     *
     *  Returns:
     *    true if the stanza matches and false otherwise.
     */
    isMatch: function (elem) {
        var from = elem.getAttribute('from');
        if (this.options.matchBareFromJid) {
            from = Strophe.getBareJidFromJid(from);
        }
        var elem_type = elem.getAttribute("type");
        if (this.namespaceMatch(elem) &&
            (!this.name || Strophe.isTagEqual(elem, this.name)) &&
            (!this.type || (Array.isArray(this.type) ? this.type.indexOf(elem_type) != -1 : elem_type == this.type)) &&
            (!this.id || elem.getAttribute("id") == this.id) &&
            (!this.from || from == this.from)) {
                return true;
        }
        return false;
    },

    /** PrivateFunction: run
     *  Run the callback on a matching stanza.
     *
     *  Parameters:
     *    (XMLElement) elem - The DOM element that triggered the
     *      Strophe.Handler.
     *
     *  Returns:
     *    A boolean indicating if the handler should remain active.
     */
    run: function (elem) {
        var result = null;
        try {
            result = this.handler(elem);
        } catch (e) {
            Strophe._handleError(e);
            throw e;
        }
        return result;
    },

    /** PrivateFunction: toString
     *  Get a String representation of the Strophe.Handler object.
     *
     *  Returns:
     *    A String.
     */
    toString: function () {
        return "{Handler: " + this.handler + "(" + this.name + "," +
            this.id + "," + this.ns + ")}";
    }
};

/** PrivateClass: Strophe.TimedHandler
 *  _Private_ helper class for managing timed handlers.
 *
 *  A Strophe.TimedHandler encapsulates a user provided callback that
 *  should be called after a certain period of time or at regular
 *  intervals.  The return value of the callback determines whether the
 *  Strophe.TimedHandler will continue to fire.
 *
 *  Users will not use Strophe.TimedHandler objects directly, but instead
 *  they will use Strophe.Connection.addTimedHandler() and
 *  Strophe.Connection.deleteTimedHandler().
 */

/** PrivateConstructor: Strophe.TimedHandler
 *  Create and initialize a new Strophe.TimedHandler object.
 *
 *  Parameters:
 *    (Integer) period - The number of milliseconds to wait before the
 *      handler is called.
 *    (Function) handler - The callback to run when the handler fires.  This
 *      function should take no arguments.
 *
 *  Returns:
 *    A new Strophe.TimedHandler object.
 */
Strophe.TimedHandler = function (period, handler) {
    this.period = period;
    this.handler = handler;
    this.lastCalled = new Date().getTime();
    this.user = true;
};

Strophe.TimedHandler.prototype = {
    /** PrivateFunction: run
     *  Run the callback for the Strophe.TimedHandler.
     *
     *  Returns:
     *    true if the Strophe.TimedHandler should be called again, and false
     *      otherwise.
     */
    run: function () {
        this.lastCalled = new Date().getTime();
        return this.handler();
    },

    /** PrivateFunction: reset
     *  Reset the last called time for the Strophe.TimedHandler.
     */
    reset: function () {
        this.lastCalled = new Date().getTime();
    },

    /** PrivateFunction: toString
     *  Get a string representation of the Strophe.TimedHandler object.
     *
     *  Returns:
     *    The string representation.
     */
    toString: function () {
        return "{TimedHandler: " + this.handler + "(" + this.period +")}";
    }
};

/** Class: Strophe.Connection
 *  XMPP Connection manager.
 *
 *  This class is the main part of Strophe.  It manages a BOSH or websocket
 *  connection to an XMPP server and dispatches events to the user callbacks
 *  as data arrives. It supports SASL PLAIN, SASL DIGEST-MD5, SASL SCRAM-SHA1
 *  and legacy authentication.
 *
 *  After creating a Strophe.Connection object, the user will typically
 *  call connect() with a user supplied callback to handle connection level
 *  events like authentication failure, disconnection, or connection
 *  complete.
 *
 *  The user will also have several event handlers defined by using
 *  addHandler() and addTimedHandler().  These will allow the user code to
 *  respond to interesting stanzas or do something periodically with the
 *  connection. These handlers will be active once authentication is
 *  finished.
 *
 *  To send data to the connection, use send().
 */

/** Constructor: Strophe.Connection
 *  Create and initialize a Strophe.Connection object.
 *
 *  The transport-protocol for this connection will be chosen automatically
 *  based on the given service parameter. URLs starting with "ws://" or
 *  "wss://" will use WebSockets, URLs starting with "http://", "https://"
 *  or without a protocol will use BOSH.
 *
 *  To make Strophe connect to the current host you can leave out the protocol
 *  and host part and just pass the path, e.g.
 *
 *  > var conn = new Strophe.Connection("/http-bind/");
 *
 *  Options common to both Websocket and BOSH:
 *  ------------------------------------------
 *
 *  cookies:
 *
 *  The *cookies* option allows you to pass in cookies to be added to the
 *  document. These cookies will then be included in the BOSH XMLHttpRequest
 *  or in the websocket connection.
 *
 *  The passed in value must be a map of cookie names and string values.
 *
 *  > { "myCookie": {
 *  >     "value": "1234",
 *  >     "domain": ".example.org",
 *  >     "path": "/",
 *  >     "expires": expirationDate
 *  >     }
 *  > }
 *
 *  Note that cookies can't be set in this way for other domains (i.e. cross-domain).
 *  Those cookies need to be set under those domains, for example they can be
 *  set server-side by making a XHR call to that domain to ask it to set any
 *  necessary cookies.
 *
 *  mechanisms:
 *
 *  The *mechanisms* option allows you to specify the SASL mechanisms that this
 *  instance of Strophe.Connection (and therefore your XMPP client) will
 *  support.
 *
 *  The value must be an array of objects with Strophe.SASLMechanism
 *  prototypes.
 *
 *  If nothing is specified, then the following mechanisms (and their
 *  priorities) are registered:
 *
 *      OAUTHBEARER - 60
 *      SCRAM-SHA1 - 50
 *      DIGEST-MD5 - 40
 *      PLAIN - 30
 *      ANONYMOUS - 20
 *      EXTERNAL - 10
 *
 *  WebSocket options:
 *  ------------------
 *
 *  If you want to connect to the current host with a WebSocket connection you
 *  can tell Strophe to use WebSockets through a "protocol" attribute in the
 *  optional options parameter. Valid values are "ws" for WebSocket and "wss"
 *  for Secure WebSocket.
 *  So to connect to "wss://CURRENT_HOSTNAME/xmpp-websocket" you would call
 *
 *  > var conn = new Strophe.Connection("/xmpp-websocket/", {protocol: "wss"});
 *
 *  Note that relative URLs _NOT_ starting with a "/" will also include the path
 *  of the current site.
 *
 *  Also because downgrading security is not permitted by browsers, when using
 *  relative URLs both BOSH and WebSocket connections will use their secure
 *  variants if the current connection to the site is also secure (https).
 *
 *  BOSH options:
 *  -------------
 *
 *  By adding "sync" to the options, you can control if requests will
 *  be made synchronously or not. The default behaviour is asynchronous.
 *  If you want to make requests synchronous, make "sync" evaluate to true.
 *  > var conn = new Strophe.Connection("/http-bind/", {sync: true});
 *
 *  You can also toggle this on an already established connection.
 *  > conn.options.sync = true;
 *
 *  The *customHeaders* option can be used to provide custom HTTP headers to be
 *  included in the XMLHttpRequests made.
 *
 *  The *keepalive* option can be used to instruct Strophe to maintain the
 *  current BOSH session across interruptions such as webpage reloads.
 *
 *  It will do this by caching the sessions tokens in sessionStorage, and when
 *  "restore" is called it will check whether there are cached tokens with
 *  which it can resume an existing session.
 *
 *  The *withCredentials* option should receive a Boolean value and is used to
 *  indicate wether cookies should be included in ajax requests (by default
 *  they're not).
 *  Set this value to true if you are connecting to a BOSH service
 *  and for some reason need to send cookies to it.
 *  In order for this to work cross-domain, the server must also enable
 *  credentials by setting the Access-Control-Allow-Credentials response header
 *  to "true". For most usecases however this setting should be false (which
 *  is the default).
 *  Additionally, when using Access-Control-Allow-Credentials, the
 *  Access-Control-Allow-Origin header can't be set to the wildcard "*", but
 *  instead must be restricted to actual domains.
 *
 *  The *contentType* option can be set to change the default Content-Type
 *  of "text/xml; charset=utf-8", which can be useful to reduce the amount of
 *  CORS preflight requests that are sent to the server.
 *
 *  Parameters:
 *    (String) service - The BOSH or WebSocket service URL.
 *    (Object) options - A hash of configuration options
 *
 *  Returns:
 *    A new Strophe.Connection object.
 */
Strophe.Connection = function (service, options) {
    // The service URL
    this.service = service;
    // Configuration options
    this.options = options || {};
    var proto = this.options.protocol || "";

    // Select protocal based on service or options
    if (service.indexOf("ws:") === 0 || service.indexOf("wss:") === 0 ||
            proto.indexOf("ws") === 0) {
        this._proto = new Strophe.Websocket(this);
    } else {
        this._proto = new Strophe.Bosh(this);
    }

    /* The connected JID. */
    this.jid = "";
    /* the JIDs domain */
    this.domain = null;
    /* stream:features */
    this.features = null;

    // SASL
    this._sasl_data = {};
    this.do_session = false;
    this.do_bind = false;

    // handler lists
    this.timedHandlers = [];
    this.handlers = [];
    this.removeTimeds = [];
    this.removeHandlers = [];
    this.addTimeds = [];
    this.addHandlers = [];
    this.protocolErrorHandlers = {
        'HTTP': {},
        'websocket': {}
    };

    this._idleTimeout = null;
    this._disconnectTimeout = null;

    this.authenticated = false;
    this.connected = false;
    this.disconnecting = false;
    this.do_authentication = true;
    this.paused = false;
    this.restored = false;

    this._data = [];
    this._uniqueId = 0;

    this._sasl_success_handler = null;
    this._sasl_failure_handler = null;
    this._sasl_challenge_handler = null;

    // Max retries before disconnecting
    this.maxRetries = 5;

    // Call onIdle callback every 1/10th of a second
    // XXX: setTimeout should be called only with function expressions (23974bc1)
    this._idleTimeout = setTimeout(function() {
        this._onIdle();
    }.bind(this), 100);

    utils.addCookies(this.options.cookies);
    this.registerSASLMechanisms(this.options.mechanisms);

    // initialize plugins
    for (var k in Strophe._connectionPlugins) {
        if (Strophe._connectionPlugins.hasOwnProperty(k)) {
            var ptype = Strophe._connectionPlugins[k];
            // jslint complaints about the below line, but this is fine
            var F = function () {}; // jshint ignore:line
            F.prototype = ptype;
            this[k] = new F();
            this[k].init(this);
        }
    }
};

Strophe.Connection.prototype = {
    /** Function: reset
     *  Reset the connection.
     *
     *  This function should be called after a connection is disconnected
     *  before that connection is reused.
     */
    reset: function () {
        this._proto._reset();

        // SASL
        this.do_session = false;
        this.do_bind = false;

        // handler lists
        this.timedHandlers = [];
        this.handlers = [];
        this.removeTimeds = [];
        this.removeHandlers = [];
        this.addTimeds = [];
        this.addHandlers = [];

        this.authenticated = false;
        this.connected = false;
        this.disconnecting = false;
        this.restored = false;

        this._data = [];
        this._requests = [];
        this._uniqueId = 0;
    },

    /** Function: pause
     *  Pause the request manager.
     *
     *  This will prevent Strophe from sending any more requests to the
     *  server.  This is very useful for temporarily pausing
     *  BOSH-Connections while a lot of send() calls are happening quickly.
     *  This causes Strophe to send the data in a single request, saving
     *  many request trips.
     */
    pause: function () {
        this.paused = true;
    },

    /** Function: resume
     *  Resume the request manager.
     *
     *  This resumes after pause() has been called.
     */
    resume: function () {
        this.paused = false;
    },

    /** Function: getUniqueId
     *  Generate a unique ID for use in <iq/> elements.
     *
     *  All <iq/> stanzas are required to have unique id attributes.  This
     *  function makes creating these easy.  Each connection instance has
     *  a counter which starts from zero, and the value of this counter
     *  plus a colon followed by the suffix becomes the unique id. If no
     *  suffix is supplied, the counter is used as the unique id.
     *
     *  Suffixes are used to make debugging easier when reading the stream
     *  data, and their use is recommended.  The counter resets to 0 for
     *  every new connection for the same reason.  For connections to the
     *  same server that authenticate the same way, all the ids should be
     *  the same, which makes it easy to see changes.  This is useful for
     *  automated testing as well.
     *
     *  Parameters:
     *    (String) suffix - A optional suffix to append to the id.
     *
     *  Returns:
     *    A unique string to be used for the id attribute.
     */
    getUniqueId: function(suffix) {
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : r & 0x3 | 0x8;
            return v.toString(16);
        });
        if (typeof(suffix) == "string" || typeof(suffix) == "number") {
            return uuid + ":" + suffix;
        } else {
            return uuid + "";
        }
    },

    /** Function: addProtocolErrorHandler
     *  Register a handler function for when a protocol (websocker or HTTP)
     *  error occurs.
     *
     *  NOTE: Currently only HTTP errors for BOSH requests are handled.
     *  Patches that handle websocket errors would be very welcome.
     *
     *  Parameters:
     *    (String) protocol - 'HTTP' or 'websocket' 
     *    (Integer) status_code - Error status code (e.g 500, 400 or 404)
     *    (Function) callback - Function that will fire on Http error
     *
     *  Example:
     *  function onError(err_code){
     *    //do stuff
     *  }
     *
     *  var conn = Strophe.connect('http://example.com/http-bind');
     *  conn.addProtocolErrorHandler('HTTP', 500, onError);
     *  // Triggers HTTP 500 error and onError handler will be called
     *  conn.connect('user_jid@incorrect_jabber_host', 'secret', onConnect);
     */
    addProtocolErrorHandler: function(protocol, status_code, callback){
        this.protocolErrorHandlers[protocol][status_code] = callback;
    },


    /** Function: connect
     *  Starts the connection process.
     *
     *  As the connection process proceeds, the user supplied callback will
     *  be triggered multiple times with status updates.  The callback
     *  should take two arguments - the status code and the error condition.
     *
     *  The status code will be one of the values in the Strophe.Status
     *  constants.  The error condition will be one of the conditions
     *  defined in RFC 3920 or the condition 'strophe-parsererror'.
     *
     *  The Parameters _wait_, _hold_ and _route_ are optional and only relevant
     *  for BOSH connections. Please see XEP 124 for a more detailed explanation
     *  of the optional parameters.
     *
     *  Parameters:
     *    (String) jid - The user's JID.  This may be a bare JID,
     *      or a full JID.  If a node is not supplied, SASL ANONYMOUS
     *      authentication will be attempted.
     *    (String) pass - The user's password.
     *    (Function) callback - The connect callback function.
     *    (Integer) wait - The optional HTTPBIND wait value.  This is the
     *      time the server will wait before returning an empty result for
     *      a request.  The default setting of 60 seconds is recommended.
     *    (Integer) hold - The optional HTTPBIND hold value.  This is the
     *      number of connections the server will hold at one time.  This
     *      should almost always be set to 1 (the default).
     *    (String) route - The optional route value.
     *    (String) authcid - The optional alternative authentication identity
     *      (username) if intending to impersonate another user.
     *      When using the SASL-EXTERNAL authentication mechanism, for example
     *      with client certificates, then the authcid value is used to
     *      determine whether an authorization JID (authzid) should be sent to
     *      the server. The authzid should not be sent to the server if the
     *      authzid and authcid are the same. So to prevent it from being sent
     *      (for example when the JID is already contained in the client
     *      certificate), set authcid to that same JID. See XEP-178 for more
     *      details.
     */
    connect: function (jid, pass, callback, wait, hold, route, authcid) {
        this.jid = jid;
        /** Variable: authzid
         *  Authorization identity.
         */
        this.authzid = Strophe.getBareJidFromJid(this.jid);

        /** Variable: authcid
         *  Authentication identity (User name).
         */
        this.authcid = authcid || Strophe.getNodeFromJid(this.jid);

        /** Variable: pass
         *  Authentication identity (User password).
         */
        this.pass = pass;

        /** Variable: servtype
         *  Digest MD5 compatibility.
         */
        this.servtype = "xmpp";

        this.connect_callback = callback;
        this.disconnecting = false;
        this.connected = false;
        this.authenticated = false;
        this.restored = false;

        // parse jid for domain
        this.domain = Strophe.getDomainFromJid(this.jid);

        this._changeConnectStatus(Strophe.Status.CONNECTING, null);

        this._proto._connect(wait, hold, route);
    },

    /** Function: attach
     *  Attach to an already created and authenticated BOSH session.
     *
     *  This function is provided to allow Strophe to attach to BOSH
     *  sessions which have been created externally, perhaps by a Web
     *  application.  This is often used to support auto-login type features
     *  without putting user credentials into the page.
     *
     *  Parameters:
     *    (String) jid - The full JID that is bound by the session.
     *    (String) sid - The SID of the BOSH session.
     *    (String) rid - The current RID of the BOSH session.  This RID
     *      will be used by the next request.
     *    (Function) callback The connect callback function.
     *    (Integer) wait - The optional HTTPBIND wait value.  This is the
     *      time the server will wait before returning an empty result for
     *      a request.  The default setting of 60 seconds is recommended.
     *      Other settings will require tweaks to the Strophe.TIMEOUT value.
     *    (Integer) hold - The optional HTTPBIND hold value.  This is the
     *      number of connections the server will hold at one time.  This
     *      should almost always be set to 1 (the default).
     *    (Integer) wind - The optional HTTBIND window value.  This is the
     *      allowed range of request ids that are valid.  The default is 5.
     */
    attach: function (jid, sid, rid, callback, wait, hold, wind) {
        if (this._proto instanceof Strophe.Bosh) {
            this._proto._attach(jid, sid, rid, callback, wait, hold, wind);
        } else {
            throw {
                name: 'StropheSessionError',
                message: 'The "attach" method can only be used with a BOSH connection.'
            };
        }
    },

    /** Function: restore
     *  Attempt to restore a cached BOSH session.
     *
     *  This function is only useful in conjunction with providing the
     *  "keepalive":true option when instantiating a new Strophe.Connection.
     *
     *  When "keepalive" is set to true, Strophe will cache the BOSH tokens
     *  RID (Request ID) and SID (Session ID) and then when this function is
     *  called, it will attempt to restore the session from those cached
     *  tokens.
     *
     *  This function must therefore be called instead of connect or attach.
     *
     *  For an example on how to use it, please see examples/restore.js
     *
     *  Parameters:
     *    (String) jid - The user's JID.  This may be a bare JID or a full JID.
     *    (Function) callback - The connect callback function.
     *    (Integer) wait - The optional HTTPBIND wait value.  This is the
     *      time the server will wait before returning an empty result for
     *      a request.  The default setting of 60 seconds is recommended.
     *    (Integer) hold - The optional HTTPBIND hold value.  This is the
     *      number of connections the server will hold at one time.  This
     *      should almost always be set to 1 (the default).
     *    (Integer) wind - The optional HTTBIND window value.  This is the
     *      allowed range of request ids that are valid.  The default is 5.
     */
    restore: function (jid, callback, wait, hold, wind) {
        if (this._sessionCachingSupported()) {
            this._proto._restore(jid, callback, wait, hold, wind);
        } else {
            throw {
                name: 'StropheSessionError',
                message: 'The "restore" method can only be used with a BOSH connection.'
            };
        }
    },

    /** PrivateFunction: _sessionCachingSupported
     * Checks whether sessionStorage and JSON are supported and whether we're
     * using BOSH.
     */
    _sessionCachingSupported: function () {
        if (this._proto instanceof Strophe.Bosh) {
            if (!JSON) { return false; }
            try {
                window.sessionStorage.setItem('_strophe_', '_strophe_');
                window.sessionStorage.removeItem('_strophe_');
            } catch (e) {
                return false;
            }
            return true;
        }
        return false;
    },

    /** Function: xmlInput
     *  User overrideable function that receives XML data coming into the
     *  connection.
     *
     *  The default function does nothing.  User code can override this with
     *  > Strophe.Connection.xmlInput = function (elem) {
     *  >   (user code)
     *  > };
     *
     *  Due to limitations of current Browsers' XML-Parsers the opening and closing
     *  <stream> tag for WebSocket-Connoctions will be passed as selfclosing here.
     *
     *  BOSH-Connections will have all stanzas wrapped in a <body> tag. See
     *  <Strophe.Bosh.strip> if you want to strip this tag.
     *
     *  Parameters:
     *    (XMLElement) elem - The XML data received by the connection.
     */
    /* jshint unused:false */
    xmlInput: function (elem) {
        return;
    },
    /* jshint unused:true */

    /** Function: xmlOutput
     *  User overrideable function that receives XML data sent to the
     *  connection.
     *
     *  The default function does nothing.  User code can override this with
     *  > Strophe.Connection.xmlOutput = function (elem) {
     *  >   (user code)
     *  > };
     *
     *  Due to limitations of current Browsers' XML-Parsers the opening and closing
     *  <stream> tag for WebSocket-Connoctions will be passed as selfclosing here.
     *
     *  BOSH-Connections will have all stanzas wrapped in a <body> tag. See
     *  <Strophe.Bosh.strip> if you want to strip this tag.
     *
     *  Parameters:
     *    (XMLElement) elem - The XMLdata sent by the connection.
     */
    /* jshint unused:false */
    xmlOutput: function (elem) {
        return;
    },
    /* jshint unused:true */

    /** Function: rawInput
     *  User overrideable function that receives raw data coming into the
     *  connection.
     *
     *  The default function does nothing.  User code can override this with
     *  > Strophe.Connection.rawInput = function (data) {
     *  >   (user code)
     *  > };
     *
     *  Parameters:
     *    (String) data - The data received by the connection.
     */
    /* jshint unused:false */
    rawInput: function (data) {
        return;
    },
    /* jshint unused:true */

    /** Function: rawOutput
     *  User overrideable function that receives raw data sent to the
     *  connection.
     *
     *  The default function does nothing.  User code can override this with
     *  > Strophe.Connection.rawOutput = function (data) {
     *  >   (user code)
     *  > };
     *
     *  Parameters:
     *    (String) data - The data sent by the connection.
     */
    /* jshint unused:false */
    rawOutput: function (data) {
        return;
    },
    /* jshint unused:true */

    /** Function: nextValidRid
     *  User overrideable function that receives the new valid rid.
     *
     *  The default function does nothing. User code can override this with
     *  > Strophe.Connection.nextValidRid = function (rid) {
     *  >    (user code)
     *  > };
     *
     *  Parameters:
     *    (Number) rid - The next valid rid
     */
    /* jshint unused:false */
    nextValidRid: function (rid) {
        return;
    },
    /* jshint unused:true */

    /** Function: send
     *  Send a stanza.
     *
     *  This function is called to push data onto the send queue to
     *  go out over the wire.  Whenever a request is sent to the BOSH
     *  server, all pending data is sent and the queue is flushed.
     *
     *  Parameters:
     *    (XMLElement |
     *     [XMLElement] |
     *     Strophe.Builder) elem - The stanza to send.
     */
    send: function (elem) {
        if (elem === null) { return ; }
        if (typeof(elem.sort) === "function") {
            for (var i = 0; i < elem.length; i++) {
                this._queueData(elem[i]);
            }
        } else if (typeof(elem.tree) === "function") {
            this._queueData(elem.tree());
        } else {
            this._queueData(elem);
        }

        this._proto._send();
    },

    /** Function: flush
     *  Immediately send any pending outgoing data.
     *
     *  Normally send() queues outgoing data until the next idle period
     *  (100ms), which optimizes network use in the common cases when
     *  several send()s are called in succession. flush() can be used to
     *  immediately send all pending data.
     */
    flush: function () {
        // cancel the pending idle period and run the idle function
        // immediately
        clearTimeout(this._idleTimeout);
        this._onIdle();
    },

    /** Function: sendPresence
     *  Helper function to send presence stanzas. The main benefit is for
     *  sending presence stanzas for which you expect a responding presence
     *  stanza with the same id (for example when leaving a chat room).
     *
     *  Parameters:
     *    (XMLElement) elem - The stanza to send.
     *    (Function) callback - The callback function for a successful request.
     *    (Function) errback - The callback function for a failed or timed
     *      out request.  On timeout, the stanza will be null.
     *    (Integer) timeout - The time specified in milliseconds for a
     *      timeout to occur.
     *
     *  Returns:
     *    The id used to send the presence.
     */
    sendPresence: function(elem, callback, errback, timeout) {
        var timeoutHandler = null;
        var that = this;
        if (typeof(elem.tree) === "function") {
            elem = elem.tree();
        }
        var id = elem.getAttribute('id');
        if (!id) { // inject id if not found
            id = this.getUniqueId("sendPresence");
            elem.setAttribute("id", id);
        }

        if (typeof callback === "function" || typeof errback === "function") {
            var handler = this.addHandler(function (stanza) {
                // remove timeout handler if there is one
                if (timeoutHandler) {
                    that.deleteTimedHandler(timeoutHandler);
                }
                var type = stanza.getAttribute('type');
                if (type == 'error') {
                    if (errback) {
                        errback(stanza);
                    }
                } else if (callback) {
                    callback(stanza);
                }
            }, null, 'presence', null, id);

            // if timeout specified, set up a timeout handler.
            if (timeout) {
                timeoutHandler = this.addTimedHandler(timeout, function () {
                    // get rid of normal handler
                    that.deleteHandler(handler);
                    // call errback on timeout with null stanza
                    if (errback) {
                        errback(null);
                    }
                    return false;
                });
            }
        }
        this.send(elem);
        return id;
    },

    /** Function: sendIQ
     *  Helper function to send IQ stanzas.
     *
     *  Parameters:
     *    (XMLElement) elem - The stanza to send.
     *    (Function) callback - The callback function for a successful request.
     *    (Function) errback - The callback function for a failed or timed
     *      out request.  On timeout, the stanza will be null.
     *    (Integer) timeout - The time specified in milliseconds for a
     *      timeout to occur.
     *
     *  Returns:
     *    The id used to send the IQ.
    */
    sendIQ: function(elem, callback, errback, timeout) {
        var timeoutHandler = null;
        var that = this;
        if (typeof(elem.tree) === "function") {
            elem = elem.tree();
        }
        var id = elem.getAttribute('id');
        if (!id) { // inject id if not found
            id = this.getUniqueId("sendIQ");
            elem.setAttribute("id", id);
        }

        if (typeof callback === "function" || typeof errback === "function") {
            var handler = this.addHandler(function (stanza) {
                // remove timeout handler if there is one
                if (timeoutHandler) {
                    that.deleteTimedHandler(timeoutHandler);
                }
                var iqtype = stanza.getAttribute('type');
                if (iqtype == 'result') {
                    if (callback) {
                        callback(stanza);
                    }
                } else if (iqtype == 'error') {
                    if (errback) {
                        errback(stanza);
                    }
                } else {
                    throw {
                        name: "StropheError",
                        message: "Got bad IQ type of " + iqtype
                    };
                }
            }, null, 'iq', ['error', 'result'], id);

            // if timeout specified, set up a timeout handler.
            if (timeout) {
                timeoutHandler = this.addTimedHandler(timeout, function () {
                    // get rid of normal handler
                    that.deleteHandler(handler);
                    // call errback on timeout with null stanza
                    if (errback) {
                        errback(null);
                    }
                    return false;
                });
            }
        }
        this.send(elem);
        return id;
    },

    /** PrivateFunction: _queueData
     *  Queue outgoing data for later sending.  Also ensures that the data
     *  is a DOMElement.
     */
    _queueData: function (element) {
        if (element === null ||
            !element.tagName ||
            !element.childNodes) {
            throw {
                name: "StropheError",
                message: "Cannot queue non-DOMElement."
            };
        }
        this._data.push(element);
    },

    /** PrivateFunction: _sendRestart
     *  Send an xmpp:restart stanza.
     */
    _sendRestart: function () {
        this._data.push("restart");
        this._proto._sendRestart();
        // XXX: setTimeout should be called only with function expressions (23974bc1)
        this._idleTimeout = setTimeout(function() {
            this._onIdle();
        }.bind(this), 100);
    },

    /** Function: addTimedHandler
     *  Add a timed handler to the connection.
     *
     *  This function adds a timed handler.  The provided handler will
     *  be called every period milliseconds until it returns false,
     *  the connection is terminated, or the handler is removed.  Handlers
     *  that wish to continue being invoked should return true.
     *
     *  Because of method binding it is necessary to save the result of
     *  this function if you wish to remove a handler with
     *  deleteTimedHandler().
     *
     *  Note that user handlers are not active until authentication is
     *  successful.
     *
     *  Parameters:
     *    (Integer) period - The period of the handler.
     *    (Function) handler - The callback function.
     *
     *  Returns:
     *    A reference to the handler that can be used to remove it.
     */
    addTimedHandler: function (period, handler) {
        var thand = new Strophe.TimedHandler(period, handler);
        this.addTimeds.push(thand);
        return thand;
    },

    /** Function: deleteTimedHandler
     *  Delete a timed handler for a connection.
     *
     *  This function removes a timed handler from the connection.  The
     *  handRef parameter is *not* the function passed to addTimedHandler(),
     *  but is the reference returned from addTimedHandler().
     *
     *  Parameters:
     *    (Strophe.TimedHandler) handRef - The handler reference.
     */
    deleteTimedHandler: function (handRef) {
        // this must be done in the Idle loop so that we don't change
        // the handlers during iteration
        this.removeTimeds.push(handRef);
    },

    /** Function: addHandler
     *  Add a stanza handler for the connection.
     *
     *  This function adds a stanza handler to the connection.  The
     *  handler callback will be called for any stanza that matches
     *  the parameters.  Note that if multiple parameters are supplied,
     *  they must all match for the handler to be invoked.
     *
     *  The handler will receive the stanza that triggered it as its argument.
     *  *The handler should return true if it is to be invoked again;
     *  returning false will remove the handler after it returns.*
     *
     *  As a convenience, the ns parameters applies to the top level element
     *  and also any of its immediate children.  This is primarily to make
     *  matching /iq/query elements easy.
     *
     *  Options
     *  ~~~~~~~
     *  With the options argument, you can specify boolean flags that affect how
     *  matches are being done.
     *
     *  Currently two flags exist:
     *
     *  - matchBareFromJid:
     *      When set to true, the from parameter and the
     *      from attribute on the stanza will be matched as bare JIDs instead
     *      of full JIDs. To use this, pass {matchBareFromJid: true} as the
     *      value of options. The default value for matchBareFromJid is false.
     *
     *  - ignoreNamespaceFragment:
     *      When set to true, a fragment specified on the stanza's namespace
     *      URL will be ignored when it's matched with the one configured for
     *      the handler.
     *
     *      This means that if you register like this:
     *      >   connection.addHandler(
     *      >       handler,
     *      >       'http://jabber.org/protocol/muc',
     *      >       null, null, null, null,
     *      >       {'ignoreNamespaceFragment': true}
     *      >   );
     *
     *      Then a stanza with XML namespace of
     *      'http://jabber.org/protocol/muc#user' will also be matched. If
     *      'ignoreNamespaceFragment' is false, then only stanzas with
     *      'http://jabber.org/protocol/muc' will be matched.
     *
     *  Deleting the handler
     *  ~~~~~~~~~~~~~~~~~~~~
     *  The return value should be saved if you wish to remove the handler
     *  with deleteHandler().
     *
     *  Parameters:
     *    (Function) handler - The user callback.
     *    (String) ns - The namespace to match.
     *    (String) name - The stanza name to match.
     *    (String|Array) type - The stanza type (or types if an array) to match.
     *    (String) id - The stanza id attribute to match.
     *    (String) from - The stanza from attribute to match.
     *    (String) options - The handler options
     *
     *  Returns:
     *    A reference to the handler that can be used to remove it.
     */
    addHandler: function (handler, ns, name, type, id, from, options) {
        var hand = new Strophe.Handler(handler, ns, name, type, id, from, options);
        this.addHandlers.push(hand);
        return hand;
    },

    /** Function: deleteHandler
     *  Delete a stanza handler for a connection.
     *
     *  This function removes a stanza handler from the connection.  The
     *  handRef parameter is *not* the function passed to addHandler(),
     *  but is the reference returned from addHandler().
     *
     *  Parameters:
     *    (Strophe.Handler) handRef - The handler reference.
     */
    deleteHandler: function (handRef) {
        // this must be done in the Idle loop so that we don't change
        // the handlers during iteration
        this.removeHandlers.push(handRef);
        // If a handler is being deleted while it is being added,
        // prevent it from getting added
        var i = this.addHandlers.indexOf(handRef);
        if (i >= 0) {
            this.addHandlers.splice(i, 1);
        }
    },

    /** Function: registerSASLMechanisms
     *
     * Register the SASL mechanisms which will be supported by this instance of
     * Strophe.Connection (i.e. which this XMPP client will support).
     *
     *  Parameters:
     *    (Array) mechanisms - Array of objects with Strophe.SASLMechanism prototypes
     *
     */
    registerSASLMechanisms: function (mechanisms) {
        this.mechanisms = {};
        mechanisms = mechanisms || [
            Strophe.SASLAnonymous,
            Strophe.SASLExternal,
            Strophe.SASLMD5,
            Strophe.SASLOAuthBearer,
            Strophe.SASLPlain,
            Strophe.SASLSHA1
        ];
        mechanisms.forEach(this.registerSASLMechanism.bind(this));
    },

    /** Function: registerSASLMechanism
     *
     * Register a single SASL mechanism, to be supported by this client.
     *
     *  Parameters:
     *    (Object) mechanism - Object with a Strophe.SASLMechanism prototype
     *
     */
    registerSASLMechanism: function (mechanism) {
        this.mechanisms[mechanism.prototype.name] = mechanism;
    },

    /** Function: disconnect
     *  Start the graceful disconnection process.
     *
     *  This function starts the disconnection process.  This process starts
     *  by sending unavailable presence and sending BOSH body of type
     *  terminate.  A timeout handler makes sure that disconnection happens
     *  even if the BOSH server does not respond.
     *  If the Connection object isn't connected, at least tries to abort all pending requests
     *  so the connection object won't generate successful requests (which were already opened).
     *
     *  The user supplied connection callback will be notified of the
     *  progress as this process happens.
     *
     *  Parameters:
     *    (String) reason - The reason the disconnect is occuring.
     */
    disconnect: function (reason) {
        this._changeConnectStatus(Strophe.Status.DISCONNECTING, reason);

        Strophe.info("Disconnect was called because: " + reason);
        if (this.connected) {
            var pres = false;
            this.disconnecting = true;
            if (this.authenticated) {
                pres = $pres({
                    xmlns: Strophe.NS.CLIENT,
                    type: 'unavailable'
                });
            }
            // setup timeout handler
            this._disconnectTimeout = this._addSysTimedHandler(
                3000, this._onDisconnectTimeout.bind(this));
            this._proto._disconnect(pres);
        } else {
            Strophe.info("Disconnect was called before Strophe connected to the server");
            this._proto._abortAllRequests();
            this._doDisconnect();
        }
    },

    /** PrivateFunction: _changeConnectStatus
     *  _Private_ helper function that makes sure plugins and the user's
     *  callback are notified of connection status changes.
     *
     *  Parameters:
     *    (Integer) status - the new connection status, one of the values
     *      in Strophe.Status
     *    (String) condition - the error condition or null
     */
    _changeConnectStatus: function (status, condition) {
        // notify all plugins listening for status changes
        for (var k in Strophe._connectionPlugins) {
            if (Strophe._connectionPlugins.hasOwnProperty(k)) {
                var plugin = this[k];
                if (plugin.statusChanged) {
                    try {
                        plugin.statusChanged(status, condition);
                    } catch (err) {
                        Strophe.error("" + k + " plugin caused an exception " +
                                      "changing status: " + err);
                    }
                }
            }
        }

        // notify the user's callback
        if (this.connect_callback) {
            try {
                this.connect_callback(status, condition);
            } catch (e) {
                Strophe._handleError(e);
                Strophe.error(
                    "User connection callback caused an "+"exception: "+e);
            }
        }
    },

    /** PrivateFunction: _doDisconnect
     *  _Private_ function to disconnect.
     *
     *  This is the last piece of the disconnection logic.  This resets the
     *  connection and alerts the user's connection callback.
     */
    _doDisconnect: function (condition) {
        if (typeof this._idleTimeout == "number") {
            clearTimeout(this._idleTimeout);
        }

        // Cancel Disconnect Timeout
        if (this._disconnectTimeout !== null) {
            this.deleteTimedHandler(this._disconnectTimeout);
            this._disconnectTimeout = null;
        }

        Strophe.info("_doDisconnect was called");
        this._proto._doDisconnect();

        this.authenticated = false;
        this.disconnecting = false;
        this.restored = false;

        // delete handlers
        this.handlers = [];
        this.timedHandlers = [];
        this.removeTimeds = [];
        this.removeHandlers = [];
        this.addTimeds = [];
        this.addHandlers = [];

        // tell the parent we disconnected
        this._changeConnectStatus(Strophe.Status.DISCONNECTED, condition);
        this.connected = false;
    },

    /** PrivateFunction: _dataRecv
     *  _Private_ handler to processes incoming data from the the connection.
     *
     *  Except for _connect_cb handling the initial connection request,
     *  this function handles the incoming data for all requests.  This
     *  function also fires stanza handlers that match each incoming
     *  stanza.
     *
     *  Parameters:
     *    (Strophe.Request) req - The request that has data ready.
     *    (string) req - The stanza a raw string (optiona).
     */
    _dataRecv: function (req, raw) {
        Strophe.info("_dataRecv called");
        var elem = this._proto._reqToData(req);
        if (elem === null) { return; }

        if (this.xmlInput !== Strophe.Connection.prototype.xmlInput) {
            if (elem.nodeName === this._proto.strip && elem.childNodes.length) {
                this.xmlInput(elem.childNodes[0]);
            } else {
                this.xmlInput(elem);
            }
        }
        if (this.rawInput !== Strophe.Connection.prototype.rawInput) {
            if (raw) {
                this.rawInput(raw);
            } else {
                this.rawInput(Strophe.serialize(elem));
            }
        }

        // remove handlers scheduled for deletion
        var i, hand;
        while (this.removeHandlers.length > 0) {
            hand = this.removeHandlers.pop();
            i = this.handlers.indexOf(hand);
            if (i >= 0) {
                this.handlers.splice(i, 1);
            }
        }

        // add handlers scheduled for addition
        while (this.addHandlers.length > 0) {
            this.handlers.push(this.addHandlers.pop());
        }

        // handle graceful disconnect
        if (this.disconnecting && this._proto._emptyQueue()) {
            this._doDisconnect();
            return;
        }

        var type = elem.getAttribute("type");
        var cond, conflict;
        if (type !== null && type == "terminate") {
            // Don't process stanzas that come in after disconnect
            if (this.disconnecting) {
                return;
            }

            // an error occurred
            cond = elem.getAttribute("condition");
            conflict = elem.getElementsByTagName("conflict");
            if (cond !== null) {
                if (cond == "remote-stream-error" && conflict.length > 0) {
                    cond = "conflict";
                }
                this._changeConnectStatus(Strophe.Status.CONNFAIL, cond);
            } else {
                this._changeConnectStatus(Strophe.Status.CONNFAIL, "unknown");
            }
            this._doDisconnect(cond);
            return;
        }

        // send each incoming stanza through the handler chain
        var that = this;
        Strophe.forEachChild(elem, null, function (child) {
            var i, newList;
            // process handlers
            newList = that.handlers;
            that.handlers = [];
            for (i = 0; i < newList.length; i++) {
                var hand = newList[i];
                // encapsulate 'handler.run' not to lose the whole handler list if
                // one of the handlers throws an exception
                try {
                    if (hand.isMatch(child) &&
                        (that.authenticated || !hand.user)) {
                        if (hand.run(child)) {
                            that.handlers.push(hand);
                        }
                    } else {
                        that.handlers.push(hand);
                    }
                } catch(e) {
                    // if the handler throws an exception, we consider it as false
                    Strophe.warn('Removing Strophe handlers due to uncaught exception: '+e.message);
                }
            }
        });
    },


    /** Attribute: mechanisms
     *  SASL Mechanisms available for Connection.
     */
    mechanisms: {},

    /** PrivateFunction: _connect_cb
     *  _Private_ handler for initial connection request.
     *
     *  This handler is used to process the initial connection request
     *  response from the BOSH server. It is used to set up authentication
     *  handlers and start the authentication process.
     *
     *  SASL authentication will be attempted if available, otherwise
     *  the code will fall back to legacy authentication.
     *
     *  Parameters:
     *    (Strophe.Request) req - The current request.
     *    (Function) _callback - low level (xmpp) connect callback function.
     *      Useful for plugins with their own xmpp connect callback (when their)
     *      want to do something special).
     */
    _connect_cb: function (req, _callback, raw) {
        Strophe.info("_connect_cb was called");
        this.connected = true;

        var bodyWrap;
        try {
            bodyWrap = this._proto._reqToData(req);
        } catch (e) {
            if (e != "badformat") { throw e; }
            this._changeConnectStatus(Strophe.Status.CONNFAIL, 'bad-format');
            this._doDisconnect('bad-format');
        }
        if (!bodyWrap) { return; }

        if (this.xmlInput !== Strophe.Connection.prototype.xmlInput) {
            if (bodyWrap.nodeName === this._proto.strip && bodyWrap.childNodes.length) {
                this.xmlInput(bodyWrap.childNodes[0]);
            } else {
                this.xmlInput(bodyWrap);
            }
        }
        if (this.rawInput !== Strophe.Connection.prototype.rawInput) {
            if (raw) {
                this.rawInput(raw);
            } else {
                this.rawInput(Strophe.serialize(bodyWrap));
            }
        }

        var conncheck = this._proto._connect_cb(bodyWrap);
        if (conncheck === Strophe.Status.CONNFAIL) {
            return;
        }

        // Check for the stream:features tag
        var hasFeatures;
        if (bodyWrap.getElementsByTagNameNS) {
            hasFeatures = bodyWrap.getElementsByTagNameNS(Strophe.NS.STREAM, "features").length > 0;
        } else {
            hasFeatures = bodyWrap.getElementsByTagName("stream:features").length > 0 ||
                            bodyWrap.getElementsByTagName("features").length > 0;
        }
        if (!hasFeatures) {
            this._proto._no_auth_received(_callback);
            return;
        }

        var matched = [], i, mech;
        var mechanisms = bodyWrap.getElementsByTagName("mechanism");
        if (mechanisms.length > 0) {
            for (i = 0; i < mechanisms.length; i++) {
                mech = Strophe.getText(mechanisms[i]);
                if (this.mechanisms[mech]) matched.push(this.mechanisms[mech]);
            }
        }
        if (matched.length === 0) {
            if (bodyWrap.getElementsByTagName("auth").length === 0) {
                // There are no matching SASL mechanisms and also no legacy
                // auth available.
                this._proto._no_auth_received(_callback);
                return;
            }
        }
        if (this.do_authentication !== false) {
            this.authenticate(matched);
        }
    },

    /** Function: sortMechanismsByPriority
     *
     *  Sorts an array of objects with prototype SASLMechanism according to
     *  their priorities.
     *
     *  Parameters:
     *    (Array) mechanisms - Array of SASL mechanisms.
     *
     */
    sortMechanismsByPriority: function (mechanisms) {
        // Sorting mechanisms according to priority.
        var i, j, higher, swap;
        for (i = 0; i < mechanisms.length - 1; ++i) {
            higher = i;
            for (j = i + 1; j < mechanisms.length; ++j) {
                if (mechanisms[j].prototype.priority > mechanisms[higher].prototype.priority) {
                    higher = j;
                }
            }
            if (higher != i) {
                swap = mechanisms[i];
                mechanisms[i] = mechanisms[higher];
                mechanisms[higher] = swap;
            }
        }
        return mechanisms;
    },

    /** PrivateFunction: _attemptSASLAuth
     *
     *  Iterate through an array of SASL mechanisms and attempt authentication
     *  with the highest priority (enabled) mechanism.
     *
     *  Parameters:
     *    (Array) mechanisms - Array of SASL mechanisms.
     *
     *  Returns:
     *    (Boolean) mechanism_found - true or false, depending on whether a
     *          valid SASL mechanism was found with which authentication could be
     *          started.
     */
    _attemptSASLAuth: function (mechanisms) {
        mechanisms = this.sortMechanismsByPriority(mechanisms || []);
        var i = 0, mechanism_found = false;
        for (i = 0; i < mechanisms.length; ++i) {
            if (!mechanisms[i].prototype.test(this)) {
                continue;
            }
            this._sasl_success_handler = this._addSysHandler(
                this._sasl_success_cb.bind(this), null,
                "success", null, null);
            this._sasl_failure_handler = this._addSysHandler(
                this._sasl_failure_cb.bind(this), null,
                "failure", null, null);
            this._sasl_challenge_handler = this._addSysHandler(
                this._sasl_challenge_cb.bind(this), null,
                "challenge", null, null);

            this._sasl_mechanism = new mechanisms[i]();
            this._sasl_mechanism.onStart(this);

            var request_auth_exchange = $build("auth", {
                xmlns: Strophe.NS.SASL,
                mechanism: this._sasl_mechanism.name
            });
            if (this._sasl_mechanism.isClientFirst) {
                var response = this._sasl_mechanism.onChallenge(this, null);
                request_auth_exchange.t(Base64.encode(response));
            }
            this.send(request_auth_exchange.tree());
            mechanism_found = true;
            break;
        }
        return mechanism_found;
    },

    /** PrivateFunction: _attemptLegacyAuth
     *
     *  Attempt legacy (i.e. non-SASL) authentication.
     *
     */
    _attemptLegacyAuth: function () {
        if (Strophe.getNodeFromJid(this.jid) === null) {
            // we don't have a node, which is required for non-anonymous
            // client connections
            this._changeConnectStatus(
                Strophe.Status.CONNFAIL,
                'x-strophe-bad-non-anon-jid'
            );
            this.disconnect('x-strophe-bad-non-anon-jid');
        } else {
            // Fall back to legacy authentication
            this._changeConnectStatus(Strophe.Status.AUTHENTICATING, null);
            this._addSysHandler(
                this._auth1_cb.bind(this),
                null, null, null, "_auth_1"
            );
            this.send($iq({
                    'type': "get",
                    'to': this.domain,
                    'id': "_auth_1"
                }).c("query", {xmlns: Strophe.NS.AUTH})
                .c("username", {}).t(Strophe.getNodeFromJid(this.jid))
                .tree());
        }
    },

    /** Function: authenticate
     * Set up authentication
     *
     *  Continues the initial connection request by setting up authentication
     *  handlers and starting the authentication process.
     *
     *  SASL authentication will be attempted if available, otherwise
     *  the code will fall back to legacy authentication.
     *
     *  Parameters:
     *    (Array) matched - Array of SASL mechanisms supported.
     *
     */
    authenticate: function (matched) {
        if (!this._attemptSASLAuth(matched)) {
            this._attemptLegacyAuth();
        }
    },

    /** PrivateFunction: _sasl_challenge_cb
     *  _Private_ handler for the SASL challenge
     *
     */
    _sasl_challenge_cb: function(elem) {
      var challenge = Base64.decode(Strophe.getText(elem));
      var response = this._sasl_mechanism.onChallenge(this, challenge);
      var stanza = $build('response', {
          'xmlns': Strophe.NS.SASL
      });
      if (response !== "") {
        stanza.t(Base64.encode(response));
      }
      this.send(stanza.tree());
      return true;
    },

    /** PrivateFunction: _auth1_cb
     *  _Private_ handler for legacy authentication.
     *
     *  This handler is called in response to the initial <iq type='get'/>
     *  for legacy authentication.  It builds an authentication <iq/> and
     *  sends it, creating a handler (calling back to _auth2_cb()) to
     *  handle the result
     *
     *  Parameters:
     *    (XMLElement) elem - The stanza that triggered the callback.
     *
     *  Returns:
     *    false to remove the handler.
     */
    /* jshint unused:false */
    _auth1_cb: function (elem) {
        // build plaintext auth iq
        var iq = $iq({type: "set", id: "_auth_2"})
            .c('query', {xmlns: Strophe.NS.AUTH})
            .c('username', {}).t(Strophe.getNodeFromJid(this.jid))
            .up()
            .c('password').t(this.pass);

        if (!Strophe.getResourceFromJid(this.jid)) {
            // since the user has not supplied a resource, we pick
            // a default one here.  unlike other auth methods, the server
            // cannot do this for us.
            this.jid = Strophe.getBareJidFromJid(this.jid) + '/strophe';
        }
        iq.up().c('resource', {}).t(Strophe.getResourceFromJid(this.jid));

        this._addSysHandler(this._auth2_cb.bind(this), null,
                            null, null, "_auth_2");
        this.send(iq.tree());
        return false;
    },
    /* jshint unused:true */

    /** PrivateFunction: _sasl_success_cb
     *  _Private_ handler for succesful SASL authentication.
     *
     *  Parameters:
     *    (XMLElement) elem - The matching stanza.
     *
     *  Returns:
     *    false to remove the handler.
     */
    _sasl_success_cb: function (elem) {
        if (this._sasl_data["server-signature"]) {
            var serverSignature;
            var success = Base64.decode(Strophe.getText(elem));
            var attribMatch = /([a-z]+)=([^,]+)(,|$)/;
            var matches = success.match(attribMatch);
            if (matches[1] == "v") {
                serverSignature = matches[2];
            }

            if (serverSignature != this._sasl_data["server-signature"]) {
              // remove old handlers
              this.deleteHandler(this._sasl_failure_handler);
              this._sasl_failure_handler = null;
              if (this._sasl_challenge_handler) {
                this.deleteHandler(this._sasl_challenge_handler);
                this._sasl_challenge_handler = null;
              }

              this._sasl_data = {};
              return this._sasl_failure_cb(null);
            }
        }
        Strophe.info("SASL authentication succeeded.");

        if (this._sasl_mechanism) {
          this._sasl_mechanism.onSuccess();
        }

        // remove old handlers
        this.deleteHandler(this._sasl_failure_handler);
        this._sasl_failure_handler = null;
        if (this._sasl_challenge_handler) {
            this.deleteHandler(this._sasl_challenge_handler);
            this._sasl_challenge_handler = null;
        }

        var streamfeature_handlers = [];
        var wrapper = function(handlers, elem) {
            while (handlers.length) {
                this.deleteHandler(handlers.pop());
            }
            this._sasl_auth1_cb.bind(this)(elem);
            return false;
        };
        streamfeature_handlers.push(this._addSysHandler(function(elem) {
            wrapper.bind(this)(streamfeature_handlers, elem);
        }.bind(this), null, "stream:features", null, null));
        streamfeature_handlers.push(this._addSysHandler(function(elem) {
            wrapper.bind(this)(streamfeature_handlers, elem);
        }.bind(this), Strophe.NS.STREAM, "features", null, null));

        // we must send an xmpp:restart now
        this._sendRestart();

        return false;
    },

    /** PrivateFunction: _sasl_auth1_cb
     *  _Private_ handler to start stream binding.
     *
     *  Parameters:
     *    (XMLElement) elem - The matching stanza.
     *
     *  Returns:
     *    false to remove the handler.
     */
    _sasl_auth1_cb: function (elem) {
        // save stream:features for future usage
        this.features = elem;
        var i, child;
        for (i = 0; i < elem.childNodes.length; i++) {
            child = elem.childNodes[i];
            if (child.nodeName == 'bind') {
                this.do_bind = true;
            }

            if (child.nodeName == 'session') {
                this.do_session = true;
            }
        }

        if (!this.do_bind) {
            this._changeConnectStatus(Strophe.Status.AUTHFAIL, null);
            return false;
        } else {
            this._addSysHandler(this._sasl_bind_cb.bind(this), null, null,
                                null, "_bind_auth_2");

            var resource = Strophe.getResourceFromJid(this.jid);
            if (resource) {
                this.send($iq({type: "set", id: "_bind_auth_2"})
                          .c('bind', {xmlns: Strophe.NS.BIND})
                          .c('resource', {}).t(resource).tree());
            } else {
                this.send($iq({type: "set", id: "_bind_auth_2"})
                          .c('bind', {xmlns: Strophe.NS.BIND})
                          .tree());
            }
        }
        return false;
    },

    /** PrivateFunction: _sasl_bind_cb
     *  _Private_ handler for binding result and session start.
     *
     *  Parameters:
     *    (XMLElement) elem - The matching stanza.
     *
     *  Returns:
     *    false to remove the handler.
     */
    _sasl_bind_cb: function (elem) {
        if (elem.getAttribute("type") == "error") {
            Strophe.info("SASL binding failed.");
            var conflict = elem.getElementsByTagName("conflict"), condition;
            if (conflict.length > 0) {
                condition = 'conflict';
            }
            this._changeConnectStatus(Strophe.Status.AUTHFAIL, condition);
            return false;
        }

        // TODO - need to grab errors
        var bind = elem.getElementsByTagName("bind");
        var jidNode;
        if (bind.length > 0) {
            // Grab jid
            jidNode = bind[0].getElementsByTagName("jid");
            if (jidNode.length > 0) {
                this.jid = Strophe.getText(jidNode[0]);

                if (this.do_session) {
                    this._addSysHandler(this._sasl_session_cb.bind(this),
                                        null, null, null, "_session_auth_2");

                    this.send($iq({type: "set", id: "_session_auth_2"})
                                  .c('session', {xmlns: Strophe.NS.SESSION})
                                  .tree());
                } else {
                    this.authenticated = true;
                    this._changeConnectStatus(Strophe.Status.CONNECTED, null);
                }
            }
        } else {
            Strophe.info("SASL binding failed.");
            this._changeConnectStatus(Strophe.Status.AUTHFAIL, null);
            return false;
        }
    },

    /** PrivateFunction: _sasl_session_cb
     *  _Private_ handler to finish successful SASL connection.
     *
     *  This sets Connection.authenticated to true on success, which
     *  starts the processing of user handlers.
     *
     *  Parameters:
     *    (XMLElement) elem - The matching stanza.
     *
     *  Returns:
     *    false to remove the handler.
     */
    _sasl_session_cb: function (elem) {
        if (elem.getAttribute("type") == "result") {
            this.authenticated = true;
            this._changeConnectStatus(Strophe.Status.CONNECTED, null);
        } else if (elem.getAttribute("type") == "error") {
            Strophe.info("Session creation failed.");
            this._changeConnectStatus(Strophe.Status.AUTHFAIL, null);
            return false;
        }
        return false;
    },

    /** PrivateFunction: _sasl_failure_cb
     *  _Private_ handler for SASL authentication failure.
     *
     *  Parameters:
     *    (XMLElement) elem - The matching stanza.
     *
     *  Returns:
     *    false to remove the handler.
     */
    /* jshint unused:false */
    _sasl_failure_cb: function (elem) {
        // delete unneeded handlers
        if (this._sasl_success_handler) {
            this.deleteHandler(this._sasl_success_handler);
            this._sasl_success_handler = null;
        }
        if (this._sasl_challenge_handler) {
            this.deleteHandler(this._sasl_challenge_handler);
            this._sasl_challenge_handler = null;
        }

        if(this._sasl_mechanism)
          this._sasl_mechanism.onFailure();
        this._changeConnectStatus(Strophe.Status.AUTHFAIL, null);
        return false;
    },
    /* jshint unused:true */

    /** PrivateFunction: _auth2_cb
     *  _Private_ handler to finish legacy authentication.
     *
     *  This handler is called when the result from the jabber:iq:auth
     *  <iq/> stanza is returned.
     *
     *  Parameters:
     *    (XMLElement) elem - The stanza that triggered the callback.
     *
     *  Returns:
     *    false to remove the handler.
     */
    _auth2_cb: function (elem) {
        if (elem.getAttribute("type") == "result") {
            this.authenticated = true;
            this._changeConnectStatus(Strophe.Status.CONNECTED, null);
        } else if (elem.getAttribute("type") == "error") {
            this._changeConnectStatus(Strophe.Status.AUTHFAIL, null);
            this.disconnect('authentication failed');
        }
        return false;
    },

    /** PrivateFunction: _addSysTimedHandler
     *  _Private_ function to add a system level timed handler.
     *
     *  This function is used to add a Strophe.TimedHandler for the
     *  library code.  System timed handlers are allowed to run before
     *  authentication is complete.
     *
     *  Parameters:
     *    (Integer) period - The period of the handler.
     *    (Function) handler - The callback function.
     */
    _addSysTimedHandler: function (period, handler) {
        var thand = new Strophe.TimedHandler(period, handler);
        thand.user = false;
        this.addTimeds.push(thand);
        return thand;
    },

    /** PrivateFunction: _addSysHandler
     *  _Private_ function to add a system level stanza handler.
     *
     *  This function is used to add a Strophe.Handler for the
     *  library code.  System stanza handlers are allowed to run before
     *  authentication is complete.
     *
     *  Parameters:
     *    (Function) handler - The callback function.
     *    (String) ns - The namespace to match.
     *    (String) name - The stanza name to match.
     *    (String) type - The stanza type attribute to match.
     *    (String) id - The stanza id attribute to match.
     */
    _addSysHandler: function (handler, ns, name, type, id) {
        var hand = new Strophe.Handler(handler, ns, name, type, id);
        hand.user = false;
        this.addHandlers.push(hand);
        return hand;
    },

    /** PrivateFunction: _onDisconnectTimeout
     *  _Private_ timeout handler for handling non-graceful disconnection.
     *
     *  If the graceful disconnect process does not complete within the
     *  time allotted, this handler finishes the disconnect anyway.
     *
     *  Returns:
     *    false to remove the handler.
     */
    _onDisconnectTimeout: function () {
        Strophe.info("_onDisconnectTimeout was called");
        this._changeConnectStatus(Strophe.Status.CONNTIMEOUT, null);
        this._proto._onDisconnectTimeout();
        // actually disconnect
        this._doDisconnect();
        return false;
    },

    /** PrivateFunction: _onIdle
     *  _Private_ handler to process events during idle cycle.
     *
     *  This handler is called every 100ms to fire timed handlers that
     *  are ready and keep poll requests going.
     */
    _onIdle: function () {
        var i, thand, since, newList;

        // add timed handlers scheduled for addition
        // NOTE: we add before remove in the case a timed handler is
        // added and then deleted before the next _onIdle() call.
        while (this.addTimeds.length > 0) {
            this.timedHandlers.push(this.addTimeds.pop());
        }

        // remove timed handlers that have been scheduled for deletion
        while (this.removeTimeds.length > 0) {
            thand = this.removeTimeds.pop();
            i = this.timedHandlers.indexOf(thand);
            if (i >= 0) {
                this.timedHandlers.splice(i, 1);
            }
        }

        // call ready timed handlers
        var now = new Date().getTime();
        newList = [];
        for (i = 0; i < this.timedHandlers.length; i++) {
            thand = this.timedHandlers[i];
            if (this.authenticated || !thand.user) {
                since = thand.lastCalled + thand.period;
                if (since - now <= 0) {
                    if (thand.run()) {
                        newList.push(thand);
                    }
                } else {
                    newList.push(thand);
                }
            }
        }
        this.timedHandlers = newList;

        clearTimeout(this._idleTimeout);

        this._proto._onIdle();

        // reactivate the timer only if connected
        if (this.connected) {
            // XXX: setTimeout should be called only with function expressions (23974bc1)
            this._idleTimeout = setTimeout(function() {
                this._onIdle();
            }.bind(this), 100);
        }
    }
};

/** Class: Strophe.SASLMechanism
 *
 *  encapsulates SASL authentication mechanisms.
 *
 *  User code may override the priority for each mechanism or disable it completely.
 *  See <priority> for information about changing priority and <test> for informatian on
 *  how to disable a mechanism.
 *
 *  By default, all mechanisms are enabled and the priorities are
 *
 *  EXTERNAL - 60
 *  OAUTHBEARER - 50
 *  SCRAM-SHA1 - 40
 *  DIGEST-MD5 - 30
 *  PLAIN - 20
 *  ANONYMOUS - 10
 *
 *  See: Strophe.Connection.addSupportedSASLMechanisms
 */

/**
 * PrivateConstructor: Strophe.SASLMechanism
 * SASL auth mechanism abstraction.
 *
 *  Parameters:
 *    (String) name - SASL Mechanism name.
 *    (Boolean) isClientFirst - If client should send response first without challenge.
 *    (Number) priority - Priority.
 *
 *  Returns:
 *    A new Strophe.SASLMechanism object.
 */
Strophe.SASLMechanism = function(name, isClientFirst, priority) {
  /** PrivateVariable: name
   *  Mechanism name.
   */
  this.name = name;
  /** PrivateVariable: isClientFirst
   *  If client sends response without initial server challenge.
   */
  this.isClientFirst = isClientFirst;
  /** Variable: priority
   *  Determines which <SASLMechanism> is chosen for authentication (Higher is better).
   *  Users may override this to prioritize mechanisms differently.
   *
   *  In the default configuration the priorities are
   *
   *  SCRAM-SHA1 - 40
   *  DIGEST-MD5 - 30
   *  Plain - 20
   *
   *  Example: (This will cause Strophe to choose the mechanism that the server sent first)
   *
   *  > Strophe.SASLMD5.priority = Strophe.SASLSHA1.priority;
   *
   *  See <SASL mechanisms> for a list of available mechanisms.
   *
   */
  this.priority = priority;
};

Strophe.SASLMechanism.prototype = {
  /**
   *  Function: test
   *  Checks if mechanism able to run.
   *  To disable a mechanism, make this return false;
   *
   *  To disable plain authentication run
   *  > Strophe.SASLPlain.test = function() {
   *  >   return false;
   *  > }
   *
   *  See <SASL mechanisms> for a list of available mechanisms.
   *
   *  Parameters:
   *    (Strophe.Connection) connection - Target Connection.
   *
   *  Returns:
   *    (Boolean) If mechanism was able to run.
   */
  /* jshint unused:false */
  test: function(connection) {
    return true;
  },
  /* jshint unused:true */

  /** PrivateFunction: onStart
   *  Called before starting mechanism on some connection.
   *
   *  Parameters:
   *    (Strophe.Connection) connection - Target Connection.
   */
  onStart: function(connection) {
    this._connection = connection;
  },

  /** PrivateFunction: onChallenge
   *  Called by protocol implementation on incoming challenge. If client is
   *  first (isClientFirst == true) challenge will be null on the first call.
   *
   *  Parameters:
   *    (Strophe.Connection) connection - Target Connection.
   *    (String) challenge - current challenge to handle.
   *
   *  Returns:
   *    (String) Mechanism response.
   */
  /* jshint unused:false */
  onChallenge: function(connection, challenge) {
    throw new Error("You should implement challenge handling!");
  },
  /* jshint unused:true */

  /** PrivateFunction: onFailure
   *  Protocol informs mechanism implementation about SASL failure.
   */
  onFailure: function() {
    this._connection = null;
  },

  /** PrivateFunction: onSuccess
   *  Protocol informs mechanism implementation about SASL success.
   */
  onSuccess: function() {
    this._connection = null;
  }
};

  /** Constants: SASL mechanisms
   *  Available authentication mechanisms
   *
   *  Strophe.SASLAnonymous - SASL ANONYMOUS authentication.
   *  Strophe.SASLPlain - SASL PLAIN authentication.
   *  Strophe.SASLMD5 - SASL DIGEST-MD5 authentication
   *  Strophe.SASLSHA1 - SASL SCRAM-SHA1 authentication
   *  Strophe.SASLOAuthBearer - SASL OAuth Bearer authentication
   *  Strophe.SASLExternal - SASL EXTERNAL authentication
   */

// Building SASL callbacks

/** PrivateConstructor: SASLAnonymous
 *  SASL ANONYMOUS authentication.
 */
Strophe.SASLAnonymous = function() {};
Strophe.SASLAnonymous.prototype = new Strophe.SASLMechanism("ANONYMOUS", false, 20);

Strophe.SASLAnonymous.prototype.test = function(connection) {
    return connection.authcid === null;
};


/** PrivateConstructor: SASLPlain
 *  SASL PLAIN authentication.
 */
Strophe.SASLPlain = function() {};
Strophe.SASLPlain.prototype = new Strophe.SASLMechanism("PLAIN", true, 30);

Strophe.SASLPlain.prototype.test = function(connection) {
    return connection.authcid !== null;
};

Strophe.SASLPlain.prototype.onChallenge = function(connection) {
    var auth_str = connection.authzid;
    auth_str = auth_str + "\u0000";
    auth_str = auth_str + connection.authcid;
    auth_str = auth_str + "\u0000";
    auth_str = auth_str + connection.pass;
    return utils.utf16to8(auth_str);
};


/** PrivateConstructor: SASLSHA1
 *  SASL SCRAM SHA 1 authentication.
 */
Strophe.SASLSHA1 = function() {};
Strophe.SASLSHA1.prototype = new Strophe.SASLMechanism("SCRAM-SHA-1", true, 50);

Strophe.SASLSHA1.prototype.test = function(connection) {
    return connection.authcid !== null;
};

Strophe.SASLSHA1.prototype.onChallenge = function(connection, challenge, test_cnonce) {
  var cnonce = test_cnonce || MD5.hexdigest(Math.random() * 1234567890);
  var auth_str = "n=" + utils.utf16to8(connection.authcid);
  auth_str += ",r=";
  auth_str += cnonce;
  connection._sasl_data.cnonce = cnonce;
  connection._sasl_data["client-first-message-bare"] = auth_str;

  auth_str = "n,," + auth_str;

  this.onChallenge = function (connection, challenge) {
    var nonce, salt, iter, Hi, U, U_old, i, k, pass;
    var clientKey, serverKey, clientSignature;
    var responseText = "c=biws,";
    var authMessage = connection._sasl_data["client-first-message-bare"] + "," +
      challenge + ",";
    var cnonce = connection._sasl_data.cnonce;
    var attribMatch = /([a-z]+)=([^,]+)(,|$)/;

    while (challenge.match(attribMatch)) {
      var matches = challenge.match(attribMatch);
      challenge = challenge.replace(matches[0], "");
      switch (matches[1]) {
      case "r":
        nonce = matches[2];
        break;
      case "s":
        salt = matches[2];
        break;
      case "i":
        iter = matches[2];
        break;
      }
    }

    if (nonce.substr(0, cnonce.length) !== cnonce) {
      connection._sasl_data = {};
      return connection._sasl_failure_cb();
    }

    responseText += "r=" + nonce;
    authMessage += responseText;

    salt = Base64.decode(salt);
    salt += "\x00\x00\x00\x01";

    pass = utils.utf16to8(connection.pass);
    Hi = U_old = SHA1.core_hmac_sha1(pass, salt);
    for (i = 1; i < iter; i++) {
      U = SHA1.core_hmac_sha1(pass, SHA1.binb2str(U_old));
      for (k = 0; k < 5; k++) {
        Hi[k] ^= U[k];
      }
      U_old = U;
    }
    Hi = SHA1.binb2str(Hi);

    clientKey = SHA1.core_hmac_sha1(Hi, "Client Key");
    serverKey = SHA1.str_hmac_sha1(Hi, "Server Key");
    clientSignature = SHA1.core_hmac_sha1(SHA1.str_sha1(SHA1.binb2str(clientKey)), authMessage);
    connection._sasl_data["server-signature"] = SHA1.b64_hmac_sha1(serverKey, authMessage);

    for (k = 0; k < 5; k++) {
      clientKey[k] ^= clientSignature[k];
    }

    responseText += ",p=" + Base64.encode(SHA1.binb2str(clientKey));
    return responseText;
  }.bind(this);

  return auth_str;
};


/** PrivateConstructor: SASLMD5
 *  SASL DIGEST MD5 authentication.
 */
Strophe.SASLMD5 = function() {};
Strophe.SASLMD5.prototype = new Strophe.SASLMechanism("DIGEST-MD5", false, 40);

Strophe.SASLMD5.prototype.test = function(connection) {
    return connection.authcid !== null;
};

/** PrivateFunction: _quote
 *  _Private_ utility function to backslash escape and quote strings.
 *
 *  Parameters:
 *    (String) str - The string to be quoted.
 *
 *  Returns:
 *    quoted string
 */
Strophe.SASLMD5.prototype._quote = function (str) {
    return '"' + str.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
    //" end string workaround for emacs
};

Strophe.SASLMD5.prototype.onChallenge = function(connection, challenge, test_cnonce) {
  var attribMatch = /([a-z]+)=("[^"]+"|[^,"]+)(?:,|$)/;
  var cnonce = test_cnonce || MD5.hexdigest("" + (Math.random() * 1234567890));
  var realm = "";
  var host = null;
  var nonce = "";
  var qop = "";
  var matches;

  while (challenge.match(attribMatch)) {
    matches = challenge.match(attribMatch);
    challenge = challenge.replace(matches[0], "");
    matches[2] = matches[2].replace(/^"(.+)"$/, "$1");
    switch (matches[1]) {
    case "realm":
      realm = matches[2];
      break;
    case "nonce":
      nonce = matches[2];
      break;
    case "qop":
      qop = matches[2];
      break;
    case "host":
      host = matches[2];
      break;
    }
  }

  var digest_uri = connection.servtype + "/" + connection.domain;
  if (host !== null) {
    digest_uri = digest_uri + "/" + host;
  }

  var cred = utils.utf16to8(connection.authcid + ":" + realm + ":" + this._connection.pass);
  var A1 = MD5.hash(cred) + ":" + nonce + ":" + cnonce;
  var A2 = 'AUTHENTICATE:' + digest_uri;

  var responseText = "";
  responseText += 'charset=utf-8,';
  responseText += 'username=' + this._quote(utils.utf16to8(connection.authcid)) + ',';
  responseText += 'realm=' + this._quote(realm) + ',';
  responseText += 'nonce=' + this._quote(nonce) + ',';
  responseText += 'nc=00000001,';
  responseText += 'cnonce=' + this._quote(cnonce) + ',';
  responseText += 'digest-uri=' + this._quote(digest_uri) + ',';
  responseText += 'response=' + MD5.hexdigest(MD5.hexdigest(A1) + ":" +
                                              nonce + ":00000001:" +
                                              cnonce + ":auth:" +
                                              MD5.hexdigest(A2)) + ",";
  responseText += 'qop=auth';

  this.onChallenge = function () {
      return "";
  };
  return responseText;
};


/** PrivateConstructor: SASLOAuthBearer
 *  SASL OAuth Bearer authentication.
 */
Strophe.SASLOAuthBearer = function() {};
Strophe.SASLOAuthBearer.prototype = new Strophe.SASLMechanism("OAUTHBEARER", true, 60);

Strophe.SASLOAuthBearer.prototype.test = function(connection) {
    return connection.authcid !== null;
};

Strophe.SASLOAuthBearer.prototype.onChallenge = function(connection) {
    var auth_str = 'n,a=';
    auth_str = auth_str + connection.authzid;
    auth_str = auth_str + ',';
    auth_str = auth_str + "\u0001";
    auth_str = auth_str + 'auth=Bearer ';
    auth_str = auth_str + connection.pass;
    auth_str = auth_str + "\u0001";
    auth_str = auth_str + "\u0001";
    return utils.utf16to8(auth_str);
};


/** PrivateConstructor: SASLExternal
 *  SASL EXTERNAL authentication.
 *
 *  The EXTERNAL mechanism allows a client to request the server to use
 *  credentials established by means external to the mechanism to
 *  authenticate the client. The external means may be, for instance,
 *  TLS services.
 */
Strophe.SASLExternal = function() {};
Strophe.SASLExternal.prototype = new Strophe.SASLMechanism("EXTERNAL", true, 10);

Strophe.SASLExternal.prototype.onChallenge = function(connection) {
    /** According to XEP-178, an authzid SHOULD NOT be presented when the
     * authcid contained or implied in the client certificate is the JID (i.e.
     * authzid) with which the user wants to log in as.
     *
     * To NOT send the authzid, the user should therefore set the authcid equal
     * to the JID when instantiating a new Strophe.Connection object.
     */
    return connection.authcid === connection.authzid ? '' : connection.authzid;
};

return {
    Strophe:        Strophe,
    $build:         $build,
    $msg:           $msg,
    $iq:            $iq,
    $pres:          $pres,
    SHA1:           SHA1,
    Base64:         Base64,
    MD5:            MD5,
};
}));

/*
    This program is distributed under the terms of the MIT license.
    Please see the LICENSE file for details.

    Copyright 2006-2008, OGG, LLC
*/

/* jshint undef: true, unused: true:, noarg: true, latedef: true */
/* global define, window, setTimeout, clearTimeout, XMLHttpRequest, ActiveXObject, Strophe, $build */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('strophe-bosh', ['strophe-core'], function (core) {
            return factory(
                core.Strophe,
                core.$build
            );
        });
    } else {
        // Browser globals
        return factory(Strophe, $build);
    }
}(this, function (Strophe, $build) {

/** PrivateClass: Strophe.Request
 *  _Private_ helper class that provides a cross implementation abstraction
 *  for a BOSH related XMLHttpRequest.
 *
 *  The Strophe.Request class is used internally to encapsulate BOSH request
 *  information.  It is not meant to be used from user's code.
 */

/** PrivateConstructor: Strophe.Request
 *  Create and initialize a new Strophe.Request object.
 *
 *  Parameters:
 *    (XMLElement) elem - The XML data to be sent in the request.
 *    (Function) func - The function that will be called when the
 *      XMLHttpRequest readyState changes.
 *    (Integer) rid - The BOSH rid attribute associated with this request.
 *    (Integer) sends - The number of times this same request has been sent.
 */
Strophe.Request = function (elem, func, rid, sends) {
    this.id = ++Strophe._requestId;
    this.xmlData = elem;
    this.data = Strophe.serialize(elem);
    // save original function in case we need to make a new request
    // from this one.
    this.origFunc = func;
    this.func = func;
    this.rid = rid;
    this.date = NaN;
    this.sends = sends || 0;
    this.abort = false;
    this.dead = null;

    this.age = function () {
        if (!this.date) { return 0; }
        var now = new Date();
        return (now - this.date) / 1000;
    };
    this.timeDead = function () {
        if (!this.dead) { return 0; }
        var now = new Date();
        return (now - this.dead) / 1000;
    };
    this.xhr = this._newXHR();
};

Strophe.Request.prototype = {
    /** PrivateFunction: getResponse
     *  Get a response from the underlying XMLHttpRequest.
     *
     *  This function attempts to get a response from the request and checks
     *  for errors.
     *
     *  Throws:
     *    "parsererror" - A parser error occured.
     *    "badformat" - The entity has sent XML that cannot be processed.
     *
     *  Returns:
     *    The DOM element tree of the response.
     */
    getResponse: function () {
        var node = null;
        if (this.xhr.responseXML && this.xhr.responseXML.documentElement) {
            node = this.xhr.responseXML.documentElement;
            if (node.tagName == "parsererror") {
                Strophe.error("invalid response received");
                Strophe.error("responseText: " + this.xhr.responseText);
                Strophe.error("responseXML: " +
                              Strophe.serialize(this.xhr.responseXML));
                throw "parsererror";
            }
        } else if (this.xhr.responseText) {
            Strophe.error("invalid response received");
            Strophe.error("responseText: " + this.xhr.responseText);
            throw "badformat";
        }

        return node;
    },

    /** PrivateFunction: _newXHR
     *  _Private_ helper function to create XMLHttpRequests.
     *
     *  This function creates XMLHttpRequests across all implementations.
     *
     *  Returns:
     *    A new XMLHttpRequest.
     */
    _newXHR: function () {
        var xhr = null;
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
            if (xhr.overrideMimeType) {
                xhr.overrideMimeType("text/xml; charset=utf-8");
            }
        } else if (window.ActiveXObject) {
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }
        // use Function.bind() to prepend ourselves as an argument
        xhr.onreadystatechange = this.func.bind(null, this);
        return xhr;
    }
};

/** Class: Strophe.Bosh
 *  _Private_ helper class that handles BOSH Connections
 *
 *  The Strophe.Bosh class is used internally by Strophe.Connection
 *  to encapsulate BOSH sessions. It is not meant to be used from user's code.
 */

/** File: bosh.js
 *  A JavaScript library to enable BOSH in Strophejs.
 *
 *  this library uses Bidirectional-streams Over Synchronous HTTP (BOSH)
 *  to emulate a persistent, stateful, two-way connection to an XMPP server.
 *  More information on BOSH can be found in XEP 124.
 */

/** PrivateConstructor: Strophe.Bosh
 *  Create and initialize a Strophe.Bosh object.
 *
 *  Parameters:
 *    (Strophe.Connection) connection - The Strophe.Connection that will use BOSH.
 *
 *  Returns:
 *    A new Strophe.Bosh object.
 */
Strophe.Bosh = function(connection) {
    this._conn = connection;
    /* request id for body tags */
    this.rid = Math.floor(Math.random() * 4294967295);
    /* The current session ID. */
    this.sid = null;

    // default BOSH values
    this.hold = 1;
    this.wait = 60;
    this.window = 5;
    this.errors = 0;
    this.inactivity = null;

    this._requests = [];
};

Strophe.Bosh.prototype = {
    /** Variable: strip
     *
     *  BOSH-Connections will have all stanzas wrapped in a <body> tag when
     *  passed to <Strophe.Connection.xmlInput> or <Strophe.Connection.xmlOutput>.
     *  To strip this tag, User code can set <Strophe.Bosh.strip> to "body":
     *
     *  > Strophe.Bosh.prototype.strip = "body";
     *
     *  This will enable stripping of the body tag in both
     *  <Strophe.Connection.xmlInput> and <Strophe.Connection.xmlOutput>.
     */
    strip: null,

    /** PrivateFunction: _buildBody
     *  _Private_ helper function to generate the <body/> wrapper for BOSH.
     *
     *  Returns:
     *    A Strophe.Builder with a <body/> element.
     */
    _buildBody: function () {
        var bodyWrap = $build('body', {
            rid: this.rid++,
            xmlns: Strophe.NS.HTTPBIND
        });
        if (this.sid !== null) {
            bodyWrap.attrs({sid: this.sid});
        }
        if (this._conn.options.keepalive && this._conn._sessionCachingSupported()) {
            this._cacheSession();
        }
        return bodyWrap;
    },

    /** PrivateFunction: _reset
     *  Reset the connection.
     *
     *  This function is called by the reset function of the Strophe Connection
     */
    _reset: function () {
        this.rid = Math.floor(Math.random() * 4294967295);
        this.sid = null;
        this.errors = 0;
        if (this._conn._sessionCachingSupported()) {
            window.sessionStorage.removeItem('strophe-bosh-session');
        }

        this._conn.nextValidRid(this.rid);
    },

    /** PrivateFunction: _connect
     *  _Private_ function that initializes the BOSH connection.
     *
     *  Creates and sends the Request that initializes the BOSH connection.
     */
    _connect: function (wait, hold, route) {
        this.wait = wait || this.wait;
        this.hold = hold || this.hold;
        this.errors = 0;

        // build the body tag
        var body = this._buildBody().attrs({
            to: this._conn.domain,
            "xml:lang": "en",
            wait: this.wait,
            hold: this.hold,
            content: "text/xml; charset=utf-8",
            ver: "1.6",
            "xmpp:version": "1.0",
            "xmlns:xmpp": Strophe.NS.BOSH
        });

        if(route){
            body.attrs({
                route: route
            });
        }

        var _connect_cb = this._conn._connect_cb;

        this._requests.push(
            new Strophe.Request(body.tree(),
                                this._onRequestStateChange.bind(
                                    this, _connect_cb.bind(this._conn)),
                                body.tree().getAttribute("rid")));
        this._throttledRequestHandler();
    },

    /** PrivateFunction: _attach
     *  Attach to an already created and authenticated BOSH session.
     *
     *  This function is provided to allow Strophe to attach to BOSH
     *  sessions which have been created externally, perhaps by a Web
     *  application.  This is often used to support auto-login type features
     *  without putting user credentials into the page.
     *
     *  Parameters:
     *    (String) jid - The full JID that is bound by the session.
     *    (String) sid - The SID of the BOSH session.
     *    (String) rid - The current RID of the BOSH session.  This RID
     *      will be used by the next request.
     *    (Function) callback The connect callback function.
     *    (Integer) wait - The optional HTTPBIND wait value.  This is the
     *      time the server will wait before returning an empty result for
     *      a request.  The default setting of 60 seconds is recommended.
     *      Other settings will require tweaks to the Strophe.TIMEOUT value.
     *    (Integer) hold - The optional HTTPBIND hold value.  This is the
     *      number of connections the server will hold at one time.  This
     *      should almost always be set to 1 (the default).
     *    (Integer) wind - The optional HTTBIND window value.  This is the
     *      allowed range of request ids that are valid.  The default is 5.
     */
    _attach: function (jid, sid, rid, callback, wait, hold, wind) {
        this._conn.jid = jid;
        this.sid = sid;
        this.rid = rid;

        this._conn.connect_callback = callback;

        this._conn.domain = Strophe.getDomainFromJid(this._conn.jid);

        this._conn.authenticated = true;
        this._conn.connected = true;

        this.wait = wait || this.wait;
        this.hold = hold || this.hold;
        this.window = wind || this.window;

        this._conn._changeConnectStatus(Strophe.Status.ATTACHED, null);
    },

    /** PrivateFunction: _restore
     *  Attempt to restore a cached BOSH session
     *
     *  Parameters:
     *    (String) jid - The full JID that is bound by the session.
     *      This parameter is optional but recommended, specifically in cases
     *      where prebinded BOSH sessions are used where it's important to know
     *      that the right session is being restored.
     *    (Function) callback The connect callback function.
     *    (Integer) wait - The optional HTTPBIND wait value.  This is the
     *      time the server will wait before returning an empty result for
     *      a request.  The default setting of 60 seconds is recommended.
     *      Other settings will require tweaks to the Strophe.TIMEOUT value.
     *    (Integer) hold - The optional HTTPBIND hold value.  This is the
     *      number of connections the server will hold at one time.  This
     *      should almost always be set to 1 (the default).
     *    (Integer) wind - The optional HTTBIND window value.  This is the
     *      allowed range of request ids that are valid.  The default is 5.
     */
    _restore: function (jid, callback, wait, hold, wind) {
        var session = JSON.parse(window.sessionStorage.getItem('strophe-bosh-session'));
        if (typeof session !== "undefined" &&
                   session !== null &&
                   session.rid &&
                   session.sid &&
                   session.jid &&
                   (    typeof jid === "undefined" ||
                        jid === null ||
                        Strophe.getBareJidFromJid(session.jid) == Strophe.getBareJidFromJid(jid) ||
                        // If authcid is null, then it's an anonymous login, so
                        // we compare only the domains:
                        ((Strophe.getNodeFromJid(jid) === null) && (Strophe.getDomainFromJid(session.jid) == jid))
                    )
        ) {
            this._conn.restored = true;
            this._attach(session.jid, session.sid, session.rid, callback, wait, hold, wind);
        } else {
            throw { name: "StropheSessionError", message: "_restore: no restoreable session." };
        }
    },

    /** PrivateFunction: _cacheSession
     *  _Private_ handler for the beforeunload event.
     *
     *  This handler is used to process the Bosh-part of the initial request.
     *  Parameters:
     *    (Strophe.Request) bodyWrap - The received stanza.
     */
    _cacheSession: function () {
        if (this._conn.authenticated) {
            if (this._conn.jid && this.rid && this.sid) {
                window.sessionStorage.setItem('strophe-bosh-session', JSON.stringify({
                    'jid': this._conn.jid,
                    'rid': this.rid,
                    'sid': this.sid
                }));
            }
        } else {
            window.sessionStorage.removeItem('strophe-bosh-session');
        }
    },

    /** PrivateFunction: _connect_cb
     *  _Private_ handler for initial connection request.
     *
     *  This handler is used to process the Bosh-part of the initial request.
     *  Parameters:
     *    (Strophe.Request) bodyWrap - The received stanza.
     */
    _connect_cb: function (bodyWrap) {
        var typ = bodyWrap.getAttribute("type");
        var cond, conflict;
        if (typ !== null && typ == "terminate") {
            // an error occurred
            cond = bodyWrap.getAttribute("condition");
            Strophe.error("BOSH-Connection failed: " + cond);
            conflict = bodyWrap.getElementsByTagName("conflict");
            if (cond !== null) {
                if (cond == "remote-stream-error" && conflict.length > 0) {
                    cond = "conflict";
                }
                this._conn._changeConnectStatus(Strophe.Status.CONNFAIL, cond);
            } else {
                this._conn._changeConnectStatus(Strophe.Status.CONNFAIL, "unknown");
            }
            this._conn._doDisconnect(cond);
            return Strophe.Status.CONNFAIL;
        }

        // check to make sure we don't overwrite these if _connect_cb is
        // called multiple times in the case of missing stream:features
        if (!this.sid) {
            this.sid = bodyWrap.getAttribute("sid");
        }
        var wind = bodyWrap.getAttribute('requests');
        if (wind) { this.window = parseInt(wind, 10); }
        var hold = bodyWrap.getAttribute('hold');
        if (hold) { this.hold = parseInt(hold, 10); }
        var wait = bodyWrap.getAttribute('wait');
        if (wait) { this.wait = parseInt(wait, 10); }
        var inactivity = bodyWrap.getAttribute('inactivity');
        if (inactivity) { this.inactivity = parseInt(inactivity, 10); }
    },

    /** PrivateFunction: _disconnect
     *  _Private_ part of Connection.disconnect for Bosh
     *
     *  Parameters:
     *    (Request) pres - This stanza will be sent before disconnecting.
     */
    _disconnect: function (pres) {
        this._sendTerminate(pres);
    },

    /** PrivateFunction: _doDisconnect
     *  _Private_ function to disconnect.
     *
     *  Resets the SID and RID.
     */
    _doDisconnect: function () {
        this.sid = null;
        this.rid = Math.floor(Math.random() * 4294967295);
        if (this._conn._sessionCachingSupported()) {
            window.sessionStorage.removeItem('strophe-bosh-session');
        }

        this._conn.nextValidRid(this.rid);
    },

    /** PrivateFunction: _emptyQueue
     * _Private_ function to check if the Request queue is empty.
     *
     *  Returns:
     *    True, if there are no Requests queued, False otherwise.
     */
    _emptyQueue: function () {
        return this._requests.length === 0;
    },

    /** PrivateFunction: _callProtocolErrorHandlers
     *  _Private_ function to call error handlers registered for HTTP errors.
     *
     *  Parameters:
     *    (Strophe.Request) req - The request that is changing readyState.
     */
    _callProtocolErrorHandlers: function (req) {
        var reqStatus = this._getRequestStatus(req),
            err_callback;
        err_callback = this._conn.protocolErrorHandlers.HTTP[reqStatus];
        if (err_callback) {
            err_callback.call(this, reqStatus);
        }
    },

    /** PrivateFunction: _hitError
     *  _Private_ function to handle the error count.
     *
     *  Requests are resent automatically until their error count reaches
     *  5.  Each time an error is encountered, this function is called to
     *  increment the count and disconnect if the count is too high.
     *
     *  Parameters:
     *    (Integer) reqStatus - The request status.
     */
    _hitError: function (reqStatus) {
        this.errors++;
        Strophe.warn("request errored, status: " + reqStatus +
                     ", number of errors: " + this.errors);
        if (this.errors > 4) {
            this._conn._onDisconnectTimeout();
        }
    },

    /** PrivateFunction: _no_auth_received
     *
     * Called on stream start/restart when no stream:features
     * has been received and sends a blank poll request.
     */
    _no_auth_received: function (_callback) {
        if (_callback) {
            _callback = _callback.bind(this._conn);
        } else {
            _callback = this._conn._connect_cb.bind(this._conn);
        }
        var body = this._buildBody();
        this._requests.push(
                new Strophe.Request(body.tree(),
                    this._onRequestStateChange.bind(
                        this, _callback.bind(this._conn)),
                    body.tree().getAttribute("rid")));
        this._throttledRequestHandler();
    },

    /** PrivateFunction: _onDisconnectTimeout
     *  _Private_ timeout handler for handling non-graceful disconnection.
     *
     *  Cancels all remaining Requests and clears the queue.
     */
    _onDisconnectTimeout: function () {
        this._abortAllRequests();
    },

    /** PrivateFunction: _abortAllRequests
     *  _Private_ helper function that makes sure all pending requests are aborted.
     */
    _abortAllRequests: function _abortAllRequests() {
        var req;
        while (this._requests.length > 0) {
            req = this._requests.pop();
            req.abort = true;
            req.xhr.abort();
            // jslint complains, but this is fine. setting to empty func
            // is necessary for IE6
            req.xhr.onreadystatechange = function () {}; // jshint ignore:line
        }
    },

    /** PrivateFunction: _onIdle
     *  _Private_ handler called by Strophe.Connection._onIdle
     *
     *  Sends all queued Requests or polls with empty Request if there are none.
     */
    _onIdle: function () {
        var data = this._conn._data;
        // if no requests are in progress, poll
        if (this._conn.authenticated && this._requests.length === 0 &&
            data.length === 0 && !this._conn.disconnecting) {
            Strophe.info("no requests during idle cycle, sending " +
                         "blank request");
            data.push(null);
        }

        if (this._conn.paused) {
            return;
        }

        if (this._requests.length < 2 && data.length > 0) {
            var body = this._buildBody();
            for (var i = 0; i < data.length; i++) {
                if (data[i] !== null) {
                    if (data[i] === "restart") {
                        body.attrs({
                            to: this._conn.domain,
                            "xml:lang": "en",
                            "xmpp:restart": "true",
                            "xmlns:xmpp": Strophe.NS.BOSH
                        });
                    } else {
                        body.cnode(data[i]).up();
                    }
                }
            }
            delete this._conn._data;
            this._conn._data = [];
            this._requests.push(
                new Strophe.Request(body.tree(),
                                    this._onRequestStateChange.bind(
                                        this, this._conn._dataRecv.bind(this._conn)),
                                    body.tree().getAttribute("rid")));
            this._throttledRequestHandler();
        }

        if (this._requests.length > 0) {
            var time_elapsed = this._requests[0].age();
            if (this._requests[0].dead !== null) {
                if (this._requests[0].timeDead() >
                    Math.floor(Strophe.SECONDARY_TIMEOUT * this.wait)) {
                    this._throttledRequestHandler();
                }
            }

            if (time_elapsed > Math.floor(Strophe.TIMEOUT * this.wait)) {
                Strophe.warn("Request " +
                             this._requests[0].id +
                             " timed out, over " + Math.floor(Strophe.TIMEOUT * this.wait) +
                             " seconds since last activity");
                this._throttledRequestHandler();
            }
        }
    },

    /** PrivateFunction: _getRequestStatus
     *
     *  Returns the HTTP status code from a Strophe.Request
     *
     *  Parameters:
     *    (Strophe.Request) req - The Strophe.Request instance.
     *    (Integer) def - The default value that should be returned if no
     *          status value was found.
     */
    _getRequestStatus: function (req, def) {
        var reqStatus;
        if (req.xhr.readyState == 4) {
            try {
                reqStatus = req.xhr.status;
            } catch (e) {
                // ignore errors from undefined status attribute. Works
                // around a browser bug
                Strophe.error(
                    "Caught an error while retrieving a request's status, " +
                    "reqStatus: " + reqStatus);
            }
        }
        if (typeof(reqStatus) == "undefined") {
            reqStatus = typeof def === 'number' ? def : 0;
        }
        return reqStatus;
    },

    /** PrivateFunction: _onRequestStateChange
     *  _Private_ handler for Strophe.Request state changes.
     *
     *  This function is called when the XMLHttpRequest readyState changes.
     *  It contains a lot of error handling logic for the many ways that
     *  requests can fail, and calls the request callback when requests
     *  succeed.
     *
     *  Parameters:
     *    (Function) func - The handler for the request.
     *    (Strophe.Request) req - The request that is changing readyState.
     */
    _onRequestStateChange: function (func, req) {
        Strophe.debug("request id "+req.id+"."+req.sends+
                      " state changed to "+req.xhr.readyState);
        if (req.abort) {
            req.abort = false;
            return;
        }
        if (req.xhr.readyState !== 4) {
            // The request is not yet complete
            return;
        }
        var reqStatus = this._getRequestStatus(req);
        if (this.disconnecting && reqStatus >= 400) {
            this._hitError(reqStatus);
            this._callProtocolErrorHandlers(req);
            return;
        }

        if ((reqStatus > 0 && reqStatus < 500) || req.sends > 5) {
            // remove from internal queue
            this._removeRequest(req);
            Strophe.debug("request id "+req.id+" should now be removed");
        }

        if (reqStatus == 200) {
            // request succeeded
            var reqIs0 = (this._requests[0] == req);
            var reqIs1 = (this._requests[1] == req);
            // if request 1 finished, or request 0 finished and request
            // 1 is over Strophe.SECONDARY_TIMEOUT seconds old, we need to
            // restart the other - both will be in the first spot, as the
            // completed request has been removed from the queue already
            if (reqIs1 ||
                (reqIs0 && this._requests.length > 0 &&
                    this._requests[0].age() > Math.floor(Strophe.SECONDARY_TIMEOUT * this.wait))) {
                this._restartRequest(0);
            }
            this._conn.nextValidRid(Number(req.rid) + 1);
            Strophe.debug("request id "+req.id+"."+req.sends+" got 200");
            func(req); // call handler
            this.errors = 0;
        } else if (reqStatus === 0 ||
                   (reqStatus >= 400 && reqStatus < 600) ||
                   reqStatus >= 12000) {
            // request failed
            Strophe.error("request id "+req.id+"."+req.sends+" error "+reqStatus+" happened");
            this._hitError(reqStatus);
            this._callProtocolErrorHandlers(req);
            if (reqStatus >= 400 && reqStatus < 500) {
                this._conn._changeConnectStatus(Strophe.Status.DISCONNECTING, null);
                this._conn._doDisconnect();
            }
        } else {
            Strophe.error("request id "+req.id+"."+req.sends+" error "+reqStatus+" happened");
        }
        if (!(reqStatus > 0 && reqStatus < 500) || req.sends > 5) {
            this._throttledRequestHandler();
        }
    },

    /** PrivateFunction: _processRequest
     *  _Private_ function to process a request in the queue.
     *
     *  This function takes requests off the queue and sends them and
     *  restarts dead requests.
     *
     *  Parameters:
     *    (Integer) i - The index of the request in the queue.
     */
    _processRequest: function (i) {
        var self = this;
        var req = this._requests[i];
        var reqStatus = this._getRequestStatus(req, -1);

        // make sure we limit the number of retries
        if (req.sends > this._conn.maxRetries) {
            this._conn._onDisconnectTimeout();
            return;
        }

        var time_elapsed = req.age();
        var primaryTimeout = (!isNaN(time_elapsed) &&
                              time_elapsed > Math.floor(Strophe.TIMEOUT * this.wait));
        var secondaryTimeout = (req.dead !== null &&
                                req.timeDead() > Math.floor(Strophe.SECONDARY_TIMEOUT * this.wait));
        var requestCompletedWithServerError = (req.xhr.readyState == 4 &&
                                               (reqStatus < 1 || reqStatus >= 500));
        if (primaryTimeout || secondaryTimeout ||
            requestCompletedWithServerError) {
            if (secondaryTimeout) {
                Strophe.error("Request " + this._requests[i].id +
                              " timed out (secondary), restarting");
            }
            req.abort = true;
            req.xhr.abort();
            // setting to null fails on IE6, so set to empty function
            req.xhr.onreadystatechange = function () {};
            this._requests[i] = new Strophe.Request(req.xmlData,
                                                    req.origFunc,
                                                    req.rid,
                                                    req.sends);
            req = this._requests[i];
        }

        if (req.xhr.readyState === 0) {
            Strophe.debug("request id "+req.id+"."+req.sends+" posting");

            try {
                var contentType = this._conn.options.contentType || "text/xml; charset=utf-8";
                req.xhr.open("POST", this._conn.service, this._conn.options.sync ? false : true);
                if (typeof req.xhr.setRequestHeader !== 'undefined') {
                    // IE9 doesn't have setRequestHeader
                    req.xhr.setRequestHeader("Content-Type", contentType);
                }
                if (this._conn.options.withCredentials) {
                    req.xhr.withCredentials = true;
                }
            } catch (e2) {
                Strophe.error("XHR open failed.");
                if (!this._conn.connected) {
                    this._conn._changeConnectStatus(
                            Strophe.Status.CONNFAIL, "bad-service");
                }
                this._conn.disconnect();
                return;
            }

            // Fires the XHR request -- may be invoked immediately
            // or on a gradually expanding retry window for reconnects
            var sendFunc = function () {
                req.date = new Date();
                if (self._conn.options.customHeaders){
                    var headers = self._conn.options.customHeaders;
                    for (var header in headers) {
                        if (headers.hasOwnProperty(header)) {
                            req.xhr.setRequestHeader(header, headers[header]);
                        }
                    }
                }
                req.xhr.send(req.data);
            };

            // Implement progressive backoff for reconnects --
            // First retry (send == 1) should also be instantaneous
            if (req.sends > 1) {
                // Using a cube of the retry number creates a nicely
                // expanding retry window
                var backoff = Math.min(Math.floor(Strophe.TIMEOUT * this.wait),
                                       Math.pow(req.sends, 3)) * 1000;
                setTimeout(function() {
                    // XXX: setTimeout should be called only with function expressions (23974bc1)
                    sendFunc();
                }, backoff);
            } else {
                sendFunc();
            }

            req.sends++;

            if (this._conn.xmlOutput !== Strophe.Connection.prototype.xmlOutput) {
                if (req.xmlData.nodeName === this.strip && req.xmlData.childNodes.length) {
                    this._conn.xmlOutput(req.xmlData.childNodes[0]);
                } else {
                    this._conn.xmlOutput(req.xmlData);
                }
            }
            if (this._conn.rawOutput !== Strophe.Connection.prototype.rawOutput) {
                this._conn.rawOutput(req.data);
            }
        } else {
            Strophe.debug("_processRequest: " +
                          (i === 0 ? "first" : "second") +
                          " request has readyState of " +
                          req.xhr.readyState);
        }
    },

    /** PrivateFunction: _removeRequest
     *  _Private_ function to remove a request from the queue.
     *
     *  Parameters:
     *    (Strophe.Request) req - The request to remove.
     */
    _removeRequest: function (req) {
        Strophe.debug("removing request");
        var i;
        for (i = this._requests.length - 1; i >= 0; i--) {
            if (req == this._requests[i]) {
                this._requests.splice(i, 1);
            }
        }
        // IE6 fails on setting to null, so set to empty function
        req.xhr.onreadystatechange = function () {};
        this._throttledRequestHandler();
    },

    /** PrivateFunction: _restartRequest
     *  _Private_ function to restart a request that is presumed dead.
     *
     *  Parameters:
     *    (Integer) i - The index of the request in the queue.
     */
    _restartRequest: function (i) {
        var req = this._requests[i];
        if (req.dead === null) {
            req.dead = new Date();
        }

        this._processRequest(i);
    },

    /** PrivateFunction: _reqToData
     * _Private_ function to get a stanza out of a request.
     *
     * Tries to extract a stanza out of a Request Object.
     * When this fails the current connection will be disconnected.
     *
     *  Parameters:
     *    (Object) req - The Request.
     *
     *  Returns:
     *    The stanza that was passed.
     */
    _reqToData: function (req) {
        try {
            return req.getResponse();
        } catch (e) {
            if (e != "parsererror") { throw e; }
            this._conn.disconnect("strophe-parsererror");
        }
    },

    /** PrivateFunction: _sendTerminate
     *  _Private_ function to send initial disconnect sequence.
     *
     *  This is the first step in a graceful disconnect.  It sends
     *  the BOSH server a terminate body and includes an unavailable
     *  presence if authentication has completed.
     */
    _sendTerminate: function (pres) {
        Strophe.info("_sendTerminate was called");
        var body = this._buildBody().attrs({type: "terminate"});
        if (pres) {
            body.cnode(pres.tree());
        }
        var req = new Strophe.Request(
            body.tree(),
            this._onRequestStateChange.bind(
            this, this._conn._dataRecv.bind(this._conn)),
            body.tree().getAttribute("rid")
        );
        this._requests.push(req);
        this._throttledRequestHandler();
    },

    /** PrivateFunction: _send
     *  _Private_ part of the Connection.send function for BOSH
     *
     * Just triggers the RequestHandler to send the messages that are in the queue
     */
    _send: function () {
        clearTimeout(this._conn._idleTimeout);
        this._throttledRequestHandler();

        // XXX: setTimeout should be called only with function expressions (23974bc1)
        this._conn._idleTimeout = setTimeout(function() {
            this._onIdle();
        }.bind(this._conn), 100);
    },

    /** PrivateFunction: _sendRestart
     *
     *  Send an xmpp:restart stanza.
     */
    _sendRestart: function () {
        this._throttledRequestHandler();
        clearTimeout(this._conn._idleTimeout);
    },

    /** PrivateFunction: _throttledRequestHandler
     *  _Private_ function to throttle requests to the connection window.
     *
     *  This function makes sure we don't send requests so fast that the
     *  request ids overflow the connection window in the case that one
     *  request died.
     */
    _throttledRequestHandler: function () {
        if (!this._requests) {
            Strophe.debug("_throttledRequestHandler called with " +
                          "undefined requests");
        } else {
            Strophe.debug("_throttledRequestHandler called with " +
                          this._requests.length + " requests");
        }

        if (!this._requests || this._requests.length === 0) {
            return;
        }

        if (this._requests.length > 0) {
            this._processRequest(0);
        }

        if (this._requests.length > 1 &&
            Math.abs(this._requests[0].rid -
                     this._requests[1].rid) < this.window) {
            this._processRequest(1);
        }
    }
};
return Strophe;
}));

/*
    This program is distributed under the terms of the MIT license.
    Please see the LICENSE file for details.

    Copyright 2006-2008, OGG, LLC
*/

/* jshint undef: true, unused: true:, noarg: true, latedef: true */
/* global define, window, clearTimeout, WebSocket, DOMParser, Strophe, $build */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('strophe-websocket', ['strophe-core'], function (core) {
            return factory(
                core.Strophe,
                core.$build
            );
        });
    } else {
        // Browser globals
        return factory(Strophe, $build);
    }
}(this, function (Strophe, $build) {

/** Class: Strophe.WebSocket
 *  _Private_ helper class that handles WebSocket Connections
 *
 *  The Strophe.WebSocket class is used internally by Strophe.Connection
 *  to encapsulate WebSocket sessions. It is not meant to be used from user's code.
 */

/** File: websocket.js
 *  A JavaScript library to enable XMPP over Websocket in Strophejs.
 *
 *  This file implements XMPP over WebSockets for Strophejs.
 *  If a Connection is established with a Websocket url (ws://...)
 *  Strophe will use WebSockets.
 *  For more information on XMPP-over-WebSocket see RFC 7395:
 *  http://tools.ietf.org/html/rfc7395
 *
 *  WebSocket support implemented by Andreas Guth (andreas.guth@rwth-aachen.de)
 */

/** PrivateConstructor: Strophe.Websocket
 *  Create and initialize a Strophe.WebSocket object.
 *  Currently only sets the connection Object.
 *
 *  Parameters:
 *    (Strophe.Connection) connection - The Strophe.Connection that will use WebSockets.
 *
 *  Returns:
 *    A new Strophe.WebSocket object.
 */
Strophe.Websocket = function(connection) {
    this._conn = connection;
    this.strip = "wrapper";

    var service = connection.service;
    if (service.indexOf("ws:") !== 0 && service.indexOf("wss:") !== 0) {
        // If the service is not an absolute URL, assume it is a path and put the absolute
        // URL together from options, current URL and the path.
        var new_service = "";

        if (connection.options.protocol === "ws" && window.location.protocol !== "https:") {
            new_service += "ws";
        } else {
            new_service += "wss";
        }

        new_service += "://" + window.location.host;

        if (service.indexOf("/") !== 0) {
            new_service += window.location.pathname + service;
        } else {
            new_service += service;
        }

        connection.service = new_service;
    }
};

Strophe.Websocket.prototype = {
    /** PrivateFunction: _buildStream
     *  _Private_ helper function to generate the <stream> start tag for WebSockets
     *
     *  Returns:
     *    A Strophe.Builder with a <stream> element.
     */
    _buildStream: function () {
        return $build("open", {
            "xmlns": Strophe.NS.FRAMING,
            "to": this._conn.domain,
            "version": '1.0'
        });
    },

    /** PrivateFunction: _check_streamerror
     * _Private_ checks a message for stream:error
     *
     *  Parameters:
     *    (Strophe.Request) bodyWrap - The received stanza.
     *    connectstatus - The ConnectStatus that will be set on error.
     *  Returns:
     *     true if there was a streamerror, false otherwise.
     */
    _check_streamerror: function (bodyWrap, connectstatus) {
        var errors;
        if (bodyWrap.getElementsByTagNameNS) {
            errors = bodyWrap.getElementsByTagNameNS(Strophe.NS.STREAM, "error");
        } else {
            errors = bodyWrap.getElementsByTagName("stream:error");
        }
        if (errors.length === 0) {
            return false;
        }
        var error = errors[0];

        var condition = "";
        var text = "";

        var ns = "urn:ietf:params:xml:ns:xmpp-streams";
        for (var i = 0; i < error.childNodes.length; i++) {
            var e = error.childNodes[i];
            if (e.getAttribute("xmlns") !== ns) {
                break;
            } if (e.nodeName === "text") {
                text = e.textContent;
            } else {
                condition = e.nodeName;
            }
        }

        var errorString = "WebSocket stream error: ";

        if (condition) {
            errorString += condition;
        } else {
            errorString += "unknown";
        }

        if (text) {
            errorString += " - " + condition;
        }

        Strophe.error(errorString);

        // close the connection on stream_error
        this._conn._changeConnectStatus(connectstatus, condition);
        this._conn._doDisconnect();
        return true;
    },

    /** PrivateFunction: _reset
     *  Reset the connection.
     *
     *  This function is called by the reset function of the Strophe Connection.
     *  Is not needed by WebSockets.
     */
    _reset: function () {
        return;
    },

    /** PrivateFunction: _connect
     *  _Private_ function called by Strophe.Connection.connect
     *
     *  Creates a WebSocket for a connection and assigns Callbacks to it.
     *  Does nothing if there already is a WebSocket.
     */
    _connect: function () {
        // Ensure that there is no open WebSocket from a previous Connection.
        this._closeSocket();

        // Create the new WobSocket
        this.socket = new WebSocket(this._conn.service, "xmpp");
        this.socket.onopen = this._onOpen.bind(this);
        this.socket.onerror = this._onError.bind(this);
        this.socket.onclose = this._onClose.bind(this);
        this.socket.onmessage = this._connect_cb_wrapper.bind(this);
    },

    /** PrivateFunction: _connect_cb
     *  _Private_ function called by Strophe.Connection._connect_cb
     *
     * checks for stream:error
     *
     *  Parameters:
     *    (Strophe.Request) bodyWrap - The received stanza.
     */
    _connect_cb: function(bodyWrap) {
        var error = this._check_streamerror(bodyWrap, Strophe.Status.CONNFAIL);
        if (error) {
            return Strophe.Status.CONNFAIL;
        }
    },

    /** PrivateFunction: _handleStreamStart
     * _Private_ function that checks the opening <open /> tag for errors.
     *
     * Disconnects if there is an error and returns false, true otherwise.
     *
     *  Parameters:
     *    (Node) message - Stanza containing the <open /> tag.
     */
    _handleStreamStart: function(message) {
        var error = false;

        // Check for errors in the <open /> tag
        var ns = message.getAttribute("xmlns");
        if (typeof ns !== "string") {
            error = "Missing xmlns in <open />";
        } else if (ns !== Strophe.NS.FRAMING) {
            error = "Wrong xmlns in <open />: " + ns;
        }

        var ver = message.getAttribute("version");
        if (typeof ver !== "string") {
            error = "Missing version in <open />";
        } else if (ver !== "1.0") {
            error = "Wrong version in <open />: " + ver;
        }

        if (error) {
            this._conn._changeConnectStatus(Strophe.Status.CONNFAIL, error);
            this._conn._doDisconnect();
            return false;
        }

        return true;
    },

    /** PrivateFunction: _connect_cb_wrapper
     * _Private_ function that handles the first connection messages.
     *
     * On receiving an opening stream tag this callback replaces itself with the real
     * message handler. On receiving a stream error the connection is terminated.
     */
    _connect_cb_wrapper: function(message) {
        if (message.data.indexOf("<open ") === 0 || message.data.indexOf("<?xml") === 0) {
            // Strip the XML Declaration, if there is one
            var data = message.data.replace(/^(<\?.*?\?>\s*)*/, "");
            if (data === '') return;

            var streamStart = new DOMParser().parseFromString(data, "text/xml").documentElement;
            this._conn.xmlInput(streamStart);
            this._conn.rawInput(message.data);

            //_handleStreamSteart will check for XML errors and disconnect on error
            if (this._handleStreamStart(streamStart)) {
                //_connect_cb will check for stream:error and disconnect on error
                this._connect_cb(streamStart);
            }
        } else if (message.data.indexOf("<close ") === 0) { //'<close xmlns="urn:ietf:params:xml:ns:xmpp-framing />') {
            this._conn.rawInput(message.data);
            this._conn.xmlInput(message);
            var see_uri = message.getAttribute("see-other-uri");
            if (see_uri) {
                this._conn._changeConnectStatus(Strophe.Status.REDIRECT, "Received see-other-uri, resetting connection");
                this._conn.reset();
                this._conn.service = see_uri;
                this._connect();
            } else {
                this._conn._changeConnectStatus(Strophe.Status.CONNFAIL, "Received closing stream");
                this._conn._doDisconnect();
            }
        } else {
            var string = this._streamWrap(message.data);
            var elem = new DOMParser().parseFromString(string, "text/xml").documentElement;
            this.socket.onmessage = this._onMessage.bind(this);
            this._conn._connect_cb(elem, null, message.data);
        }
    },

    /** PrivateFunction: _disconnect
     *  _Private_ function called by Strophe.Connection.disconnect
     *
     *  Disconnects and sends a last stanza if one is given
     *
     *  Parameters:
     *    (Request) pres - This stanza will be sent before disconnecting.
     */
    _disconnect: function (pres) {
        if (this.socket && this.socket.readyState !== WebSocket.CLOSED) {
            if (pres) {
                this._conn.send(pres);
            }
            var close = $build("close", { "xmlns": Strophe.NS.FRAMING });
            this._conn.xmlOutput(close);
            var closeString = Strophe.serialize(close);
            this._conn.rawOutput(closeString);
            try {
                this.socket.send(closeString);
            } catch (e) {
                Strophe.info("Couldn't send <close /> tag.");
            }
        }
        this._conn._doDisconnect();
    },

    /** PrivateFunction: _doDisconnect
     *  _Private_ function to disconnect.
     *
     *  Just closes the Socket for WebSockets
     */
    _doDisconnect: function () {
        Strophe.info("WebSockets _doDisconnect was called");
        this._closeSocket();
    },

    /** PrivateFunction _streamWrap
     *  _Private_ helper function to wrap a stanza in a <stream> tag.
     *  This is used so Strophe can process stanzas from WebSockets like BOSH
     */
    _streamWrap: function (stanza) {
        return "<wrapper>" + stanza + '</wrapper>';
    },


    /** PrivateFunction: _closeSocket
     *  _Private_ function to close the WebSocket.
     *
     *  Closes the socket if it is still open and deletes it
     */
    _closeSocket: function () {
        if (this.socket) { try {
            this.socket.close();
        } catch (e) {} }
        this.socket = null;
    },

    /** PrivateFunction: _emptyQueue
     * _Private_ function to check if the message queue is empty.
     *
     *  Returns:
     *    True, because WebSocket messages are send immediately after queueing.
     */
    _emptyQueue: function () {
        return true;
    },

    /** PrivateFunction: _onClose
     * _Private_ function to handle websockets closing.
     *
     * Nothing to do here for WebSockets
     */
    _onClose: function() {
        if(this._conn.connected && !this._conn.disconnecting) {
            Strophe.error("Websocket closed unexpectedly");
            this._conn._doDisconnect();
        } else {
            Strophe.info("Websocket closed");
        }
    },

    /** PrivateFunction: _no_auth_received
     *
     * Called on stream start/restart when no stream:features
     * has been received.
     */
    _no_auth_received: function (_callback) {
        Strophe.error("Server did not send any auth methods");
        this._conn._changeConnectStatus(Strophe.Status.CONNFAIL, "Server did not send any auth methods");
        if (_callback) {
            _callback = _callback.bind(this._conn);
            _callback();
        }
        this._conn._doDisconnect();
    },

    /** PrivateFunction: _onDisconnectTimeout
     *  _Private_ timeout handler for handling non-graceful disconnection.
     *
     *  This does nothing for WebSockets
     */
    _onDisconnectTimeout: function () {},

    /** PrivateFunction: _abortAllRequests
     *  _Private_ helper function that makes sure all pending requests are aborted.
     */
    _abortAllRequests: function () {},

    /** PrivateFunction: _onError
     * _Private_ function to handle websockets errors.
     *
     * Parameters:
     * (Object) error - The websocket error.
     */
    _onError: function(error) {
        Strophe.error("Websocket error " + error);
        this._conn._changeConnectStatus(Strophe.Status.CONNFAIL, "The WebSocket connection could not be established or was disconnected.");
        this._disconnect();
    },

    /** PrivateFunction: _onIdle
     *  _Private_ function called by Strophe.Connection._onIdle
     *
     *  sends all queued stanzas
     */
    _onIdle: function () {
        var data = this._conn._data;
        if (data.length > 0 && !this._conn.paused) {
            for (var i = 0; i < data.length; i++) {
                if (data[i] !== null) {
                    var stanza, rawStanza;
                    if (data[i] === "restart") {
                        stanza = this._buildStream().tree();
                    } else {
                        stanza = data[i];
                    }
                    rawStanza = Strophe.serialize(stanza);
                    this._conn.xmlOutput(stanza);
                    this._conn.rawOutput(rawStanza);
                    this.socket.send(rawStanza);
                }
            }
            this._conn._data = [];
        }
    },

    /** PrivateFunction: _onMessage
     * _Private_ function to handle websockets messages.
     *
     * This function parses each of the messages as if they are full documents.
     * [TODO : We may actually want to use a SAX Push parser].
     *
     * Since all XMPP traffic starts with
     *  <stream:stream version='1.0'
     *                 xml:lang='en'
     *                 xmlns='jabber:client'
     *                 xmlns:stream='http://etherx.jabber.org/streams'
     *                 id='3697395463'
     *                 from='SERVER'>
     *
     * The first stanza will always fail to be parsed.
     *
     * Additionally, the seconds stanza will always be <stream:features> with
     * the stream NS defined in the previous stanza, so we need to 'force'
     * the inclusion of the NS in this stanza.
     *
     * Parameters:
     * (string) message - The websocket message.
     */
    _onMessage: function(message) {
        var elem, data;
        // check for closing stream
        var close = '<close xmlns="urn:ietf:params:xml:ns:xmpp-framing" />';
        if (message.data === close) {
            this._conn.rawInput(close);
            this._conn.xmlInput(message);
            if (!this._conn.disconnecting) {
                this._conn._doDisconnect();
            }
            return;
        } else if (message.data.search("<open ") === 0) {
            // This handles stream restarts
            elem = new DOMParser().parseFromString(message.data, "text/xml").documentElement;
            if (!this._handleStreamStart(elem)) {
                return;
            }
        } else {
            data = this._streamWrap(message.data);
            elem = new DOMParser().parseFromString(data, "text/xml").documentElement;
        }

        if (this._check_streamerror(elem, Strophe.Status.ERROR)) {
            return;
        }

        //handle unavailable presence stanza before disconnecting
        if (this._conn.disconnecting &&
                elem.firstChild.nodeName === "presence" &&
                elem.firstChild.getAttribute("type") === "unavailable") {
            this._conn.xmlInput(elem);
            this._conn.rawInput(Strophe.serialize(elem));
            // if we are already disconnecting we will ignore the unavailable stanza and
            // wait for the </stream:stream> tag before we close the connection
            return;
        }
        this._conn._dataRecv(elem, message.data);
    },

    /** PrivateFunction: _onOpen
     * _Private_ function to handle websockets connection setup.
     *
     * The opening stream tag is sent here.
     */
    _onOpen: function() {
        Strophe.info("Websocket open");
        var start = this._buildStream();
        this._conn.xmlOutput(start.tree());

        var startString = Strophe.serialize(start);
        this._conn.rawOutput(startString);
        this.socket.send(startString);
    },

    /** PrivateFunction: _reqToData
     * _Private_ function to get a stanza out of a request.
     *
     * WebSockets don't use requests, so the passed argument is just returned.
     *
     *  Parameters:
     *    (Object) stanza - The stanza.
     *
     *  Returns:
     *    The stanza that was passed.
     */
    _reqToData: function (stanza) {
        return stanza;
    },

    /** PrivateFunction: _send
     *  _Private_ part of the Connection.send function for WebSocket
     *
     * Just flushes the messages that are in the queue
     */
    _send: function () {
        this._conn.flush();
    },

    /** PrivateFunction: _sendRestart
     *
     *  Send an xmpp:restart stanza.
     */
    _sendRestart: function () {
        clearTimeout(this._conn._idleTimeout);
        this._conn._onIdle.bind(this._conn)();
    }
};
return Strophe;
}));

(function(root){
    if(typeof define === 'function' && define.amd){
        define("strophe", [
            "strophe-core",
            "strophe-bosh",
            "strophe-websocket"
        ], function (wrapper) {
            return wrapper;
        });
    }
})(this);

/* jshint ignore:start */
if (callback) {
    if(typeof define === 'function' && define.amd){
        //For backwards compatability
        var n_callback = callback;
        if (typeof requirejs === 'function') {
            requirejs(["strophe"], function(o){
                n_callback(o.Strophe,o.$build,o.$msg,o.$iq,o.$pres);
            });
        } else {
            require(["strophe"], function(o){
                n_callback(o.Strophe,o.$build,o.$msg,o.$iq,o.$pres);
            });
        }
    }else{
        return callback(Strophe, $build, $msg, $iq, $pres);
    }
}


})(function (Strophe, build, msg, iq, pres) {
    window.Strophe = Strophe;
    window.$build = build;
    window.$msg = msg;
    window.$iq = iq;
    window.$pres = pres;
});
/* jshint ignore:end */

},{}],14:[function(require,module,exports){
(function (global){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */

'use strict';

var adapterFactory = require('./adapter_factory.js');
module.exports = adapterFactory({window: global.window});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./adapter_factory.js":15}],15:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */

'use strict';

var utils = require('./utils');
// Shimming starts here.
module.exports = function(dependencies, opts) {
  var window = dependencies && dependencies.window;

  var options = {
    shimChrome: true,
    shimFirefox: true,
    shimEdge: true,
    shimSafari: true,
  };

  for (var key in opts) {
    if (hasOwnProperty.call(opts, key)) {
      options[key] = opts[key];
    }
  }

  // Utils.
  var logging = utils.log;
  var browserDetails = utils.detectBrowser(window);

  // Export to the adapter global object visible in the browser.
  var adapter = {
    browserDetails: browserDetails,
    extractVersion: utils.extractVersion,
    disableLog: utils.disableLog,
    disableWarnings: utils.disableWarnings
  };

  // Uncomment the line below if you want logging to occur, including logging
  // for the switch statement below. Can also be turned on in the browser via
  // adapter.disableLog(false), but then logging from the switch statement below
  // will not appear.
  // require('./utils').disableLog(false);

  // Browser shims.
  var chromeShim = require('./chrome/chrome_shim') || null;
  var edgeShim = require('./edge/edge_shim') || null;
  var firefoxShim = require('./firefox/firefox_shim') || null;
  var safariShim = require('./safari/safari_shim') || null;
  var commonShim = require('./common_shim') || null;

  // Shim browser if found.
  switch (browserDetails.browser) {
    case 'chrome':
      if (!chromeShim || !chromeShim.shimPeerConnection ||
          !options.shimChrome) {
        logging('Chrome shim is not included in this adapter release.');
        return adapter;
      }
      logging('adapter.js shimming chrome.');
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = chromeShim;
      commonShim.shimCreateObjectURL(window);

      chromeShim.shimGetUserMedia(window);
      chromeShim.shimMediaStream(window);
      chromeShim.shimSourceObject(window);
      chromeShim.shimPeerConnection(window);
      chromeShim.shimOnTrack(window);
      chromeShim.shimAddTrackRemoveTrack(window);
      chromeShim.shimGetSendersWithDtmf(window);

      commonShim.shimRTCIceCandidate(window);
      break;
    case 'firefox':
      if (!firefoxShim || !firefoxShim.shimPeerConnection ||
          !options.shimFirefox) {
        logging('Firefox shim is not included in this adapter release.');
        return adapter;
      }
      logging('adapter.js shimming firefox.');
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = firefoxShim;
      commonShim.shimCreateObjectURL(window);

      firefoxShim.shimGetUserMedia(window);
      firefoxShim.shimSourceObject(window);
      firefoxShim.shimPeerConnection(window);
      firefoxShim.shimOnTrack(window);

      commonShim.shimRTCIceCandidate(window);
      break;
    case 'edge':
      if (!edgeShim || !edgeShim.shimPeerConnection || !options.shimEdge) {
        logging('MS edge shim is not included in this adapter release.');
        return adapter;
      }
      logging('adapter.js shimming edge.');
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = edgeShim;
      commonShim.shimCreateObjectURL(window);

      edgeShim.shimGetUserMedia(window);
      edgeShim.shimPeerConnection(window);
      edgeShim.shimReplaceTrack(window);

      // the edge shim implements the full RTCIceCandidate object.
      break;
    case 'safari':
      if (!safariShim || !options.shimSafari) {
        logging('Safari shim is not included in this adapter release.');
        return adapter;
      }
      logging('adapter.js shimming safari.');
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = safariShim;
      commonShim.shimCreateObjectURL(window);

      safariShim.shimRTCIceServerUrls(window);
      safariShim.shimCallbacksAPI(window);
      safariShim.shimLocalStreamsAPI(window);
      safariShim.shimRemoteStreamsAPI(window);
      safariShim.shimTrackEventTransceiver(window);
      safariShim.shimGetUserMedia(window);
      safariShim.shimCreateOfferLegacy(window);

      commonShim.shimRTCIceCandidate(window);
      break;
    default:
      logging('Unsupported browser!');
      break;
  }

  return adapter;
};

},{"./chrome/chrome_shim":16,"./common_shim":18,"./edge/edge_shim":19,"./firefox/firefox_shim":21,"./safari/safari_shim":23,"./utils":24}],16:[function(require,module,exports){

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';
var utils = require('../utils.js');
var logging = utils.log;

var chromeShim = {
  shimMediaStream: function(window) {
    window.MediaStream = window.MediaStream || window.webkitMediaStream;
  },

  shimOnTrack: function(window) {
    if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
        window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
        get: function() {
          return this._ontrack;
        },
        set: function(f) {
          if (this._ontrack) {
            this.removeEventListener('track', this._ontrack);
          }
          this.addEventListener('track', this._ontrack = f);
        }
      });
      var origSetRemoteDescription =
          window.RTCPeerConnection.prototype.setRemoteDescription;
      window.RTCPeerConnection.prototype.setRemoteDescription = function() {
        var pc = this;
        if (!pc._ontrackpoly) {
          pc._ontrackpoly = function(e) {
            // onaddstream does not fire when a track is added to an existing
            // stream. But stream.onaddtrack is implemented so we use that.
            e.stream.addEventListener('addtrack', function(te) {
              var receiver;
              if (window.RTCPeerConnection.prototype.getReceivers) {
                receiver = pc.getReceivers().find(function(r) {
                  return r.track && r.track.id === te.track.id;
                });
              } else {
                receiver = {track: te.track};
              }

              var event = new Event('track');
              event.track = te.track;
              event.receiver = receiver;
              event.transceiver = {receiver: receiver};
              event.streams = [e.stream];
              pc.dispatchEvent(event);
            });
            e.stream.getTracks().forEach(function(track) {
              var receiver;
              if (window.RTCPeerConnection.prototype.getReceivers) {
                receiver = pc.getReceivers().find(function(r) {
                  return r.track && r.track.id === track.id;
                });
              } else {
                receiver = {track: track};
              }
              var event = new Event('track');
              event.track = track;
              event.receiver = receiver;
              event.transceiver = {receiver: receiver};
              event.streams = [e.stream];
              pc.dispatchEvent(event);
            });
          };
          pc.addEventListener('addstream', pc._ontrackpoly);
        }
        return origSetRemoteDescription.apply(pc, arguments);
      };
    }
  },

  shimGetSendersWithDtmf: function(window) {
    // Overrides addTrack/removeTrack, depends on shimAddTrackRemoveTrack.
    if (typeof window === 'object' && window.RTCPeerConnection &&
        !('getSenders' in window.RTCPeerConnection.prototype) &&
        'createDTMFSender' in window.RTCPeerConnection.prototype) {
      var shimSenderWithDtmf = function(pc, track) {
        return {
          track: track,
          get dtmf() {
            if (this._dtmf === undefined) {
              if (track.kind === 'audio') {
                this._dtmf = pc.createDTMFSender(track);
              } else {
                this._dtmf = null;
              }
            }
            return this._dtmf;
          },
          _pc: pc
        };
      };

      // augment addTrack when getSenders is not available.
      if (!window.RTCPeerConnection.prototype.getSenders) {
        window.RTCPeerConnection.prototype.getSenders = function() {
          this._senders = this._senders || [];
          return this._senders.slice(); // return a copy of the internal state.
        };
        var origAddTrack = window.RTCPeerConnection.prototype.addTrack;
        window.RTCPeerConnection.prototype.addTrack = function(track, stream) {
          var pc = this;
          var sender = origAddTrack.apply(pc, arguments);
          if (!sender) {
            sender = shimSenderWithDtmf(pc, track);
            pc._senders.push(sender);
          }
          return sender;
        };

        var origRemoveTrack = window.RTCPeerConnection.prototype.removeTrack;
        window.RTCPeerConnection.prototype.removeTrack = function(sender) {
          var pc = this;
          origRemoveTrack.apply(pc, arguments);
          var idx = pc._senders.indexOf(sender);
          if (idx !== -1) {
            pc._senders.splice(idx, 1);
          }
        };
      }
      var origAddStream = window.RTCPeerConnection.prototype.addStream;
      window.RTCPeerConnection.prototype.addStream = function(stream) {
        var pc = this;
        pc._senders = pc._senders || [];
        origAddStream.apply(pc, [stream]);
        stream.getTracks().forEach(function(track) {
          pc._senders.push(shimSenderWithDtmf(pc, track));
        });
      };

      var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
      window.RTCPeerConnection.prototype.removeStream = function(stream) {
        var pc = this;
        pc._senders = pc._senders || [];
        origRemoveStream.apply(pc, [stream]);

        stream.getTracks().forEach(function(track) {
          var sender = pc._senders.find(function(s) {
            return s.track === track;
          });
          if (sender) {
            pc._senders.splice(pc._senders.indexOf(sender), 1); // remove sender
          }
        });
      };
    } else if (typeof window === 'object' && window.RTCPeerConnection &&
               'getSenders' in window.RTCPeerConnection.prototype &&
               'createDTMFSender' in window.RTCPeerConnection.prototype &&
               window.RTCRtpSender &&
               !('dtmf' in window.RTCRtpSender.prototype)) {
      var origGetSenders = window.RTCPeerConnection.prototype.getSenders;
      window.RTCPeerConnection.prototype.getSenders = function() {
        var pc = this;
        var senders = origGetSenders.apply(pc, []);
        senders.forEach(function(sender) {
          sender._pc = pc;
        });
        return senders;
      };

      Object.defineProperty(window.RTCRtpSender.prototype, 'dtmf', {
        get: function() {
          if (this._dtmf === undefined) {
            if (this.track.kind === 'audio') {
              this._dtmf = this._pc.createDTMFSender(this.track);
            } else {
              this._dtmf = null;
            }
          }
          return this._dtmf;
        }
      });
    }
  },

  shimSourceObject: function(window) {
    var URL = window && window.URL;

    if (typeof window === 'object') {
      if (window.HTMLMediaElement &&
        !('srcObject' in window.HTMLMediaElement.prototype)) {
        // Shim the srcObject property, once, when HTMLMediaElement is found.
        Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
          get: function() {
            return this._srcObject;
          },
          set: function(stream) {
            var self = this;
            // Use _srcObject as a private property for this shim
            this._srcObject = stream;
            if (this.src) {
              URL.revokeObjectURL(this.src);
            }

            if (!stream) {
              this.src = '';
              return undefined;
            }
            this.src = URL.createObjectURL(stream);
            // We need to recreate the blob url when a track is added or
            // removed. Doing it manually since we want to avoid a recursion.
            stream.addEventListener('addtrack', function() {
              if (self.src) {
                URL.revokeObjectURL(self.src);
              }
              self.src = URL.createObjectURL(stream);
            });
            stream.addEventListener('removetrack', function() {
              if (self.src) {
                URL.revokeObjectURL(self.src);
              }
              self.src = URL.createObjectURL(stream);
            });
          }
        });
      }
    }
  },

  shimAddTrackRemoveTrack: function(window) {
    var browserDetails = utils.detectBrowser(window);
    // shim addTrack and removeTrack.
    if (window.RTCPeerConnection.prototype.addTrack &&
        browserDetails.version >= 63) {
      return;
    }

    // also shim pc.getLocalStreams when addTrack is shimmed
    // to return the original streams.
    var origGetLocalStreams = window.RTCPeerConnection.prototype
        .getLocalStreams;
    window.RTCPeerConnection.prototype.getLocalStreams = function() {
      var self = this;
      var nativeStreams = origGetLocalStreams.apply(this);
      self._reverseStreams = self._reverseStreams || {};
      return nativeStreams.map(function(stream) {
        return self._reverseStreams[stream.id];
      });
    };

    var origAddStream = window.RTCPeerConnection.prototype.addStream;
    window.RTCPeerConnection.prototype.addStream = function(stream) {
      var pc = this;
      pc._streams = pc._streams || {};
      pc._reverseStreams = pc._reverseStreams || {};

      stream.getTracks().forEach(function(track) {
        var alreadyExists = pc.getSenders().find(function(s) {
          return s.track === track;
        });
        if (alreadyExists) {
          throw new DOMException('Track already exists.',
              'InvalidAccessError');
        }
      });
      // Add identity mapping for consistency with addTrack.
      // Unless this is being used with a stream from addTrack.
      if (!pc._reverseStreams[stream.id]) {
        var newStream = new window.MediaStream(stream.getTracks());
        pc._streams[stream.id] = newStream;
        pc._reverseStreams[newStream.id] = stream;
        stream = newStream;
      }
      origAddStream.apply(pc, [stream]);
    };

    var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
    window.RTCPeerConnection.prototype.removeStream = function(stream) {
      var pc = this;
      pc._streams = pc._streams || {};
      pc._reverseStreams = pc._reverseStreams || {};

      origRemoveStream.apply(pc, [(pc._streams[stream.id] || stream)]);
      delete pc._reverseStreams[(pc._streams[stream.id] ?
          pc._streams[stream.id].id : stream.id)];
      delete pc._streams[stream.id];
    };

    window.RTCPeerConnection.prototype.addTrack = function(track, stream) {
      var pc = this;
      if (pc.signalingState === 'closed') {
        throw new DOMException(
          'The RTCPeerConnection\'s signalingState is \'closed\'.',
          'InvalidStateError');
      }
      var streams = [].slice.call(arguments, 1);
      if (streams.length !== 1 ||
          !streams[0].getTracks().find(function(t) {
            return t === track;
          })) {
        // this is not fully correct but all we can manage without
        // [[associated MediaStreams]] internal slot.
        throw new DOMException(
          'The adapter.js addTrack polyfill only supports a single ' +
          ' stream which is associated with the specified track.',
          'NotSupportedError');
      }

      var alreadyExists = pc.getSenders().find(function(s) {
        return s.track === track;
      });
      if (alreadyExists) {
        throw new DOMException('Track already exists.',
            'InvalidAccessError');
      }

      pc._streams = pc._streams || {};
      pc._reverseStreams = pc._reverseStreams || {};
      var oldStream = pc._streams[stream.id];
      if (oldStream) {
        // this is using odd Chrome behaviour, use with caution:
        // https://bugs.chromium.org/p/webrtc/issues/detail?id=7815
        // Note: we rely on the high-level addTrack/dtmf shim to
        // create the sender with a dtmf sender.
        oldStream.addTrack(track);

        // Trigger ONN async.
        Promise.resolve().then(function() {
          pc.dispatchEvent(new Event('negotiationneeded'));
        });
      } else {
        var newStream = new window.MediaStream([track]);
        pc._streams[stream.id] = newStream;
        pc._reverseStreams[newStream.id] = stream;
        pc.addStream(newStream);
      }
      return pc.getSenders().find(function(s) {
        return s.track === track;
      });
    };

    // replace the internal stream id with the external one and
    // vice versa.
    function replaceInternalStreamId(pc, description) {
      var sdp = description.sdp;
      Object.keys(pc._reverseStreams || []).forEach(function(internalId) {
        var externalStream = pc._reverseStreams[internalId];
        var internalStream = pc._streams[externalStream.id];
        sdp = sdp.replace(new RegExp(internalStream.id, 'g'),
            externalStream.id);
      });
      return new RTCSessionDescription({
        type: description.type,
        sdp: sdp
      });
    }
    function replaceExternalStreamId(pc, description) {
      var sdp = description.sdp;
      Object.keys(pc._reverseStreams || []).forEach(function(internalId) {
        var externalStream = pc._reverseStreams[internalId];
        var internalStream = pc._streams[externalStream.id];
        sdp = sdp.replace(new RegExp(externalStream.id, 'g'),
            internalStream.id);
      });
      return new RTCSessionDescription({
        type: description.type,
        sdp: sdp
      });
    }
    ['createOffer', 'createAnswer'].forEach(function(method) {
      var nativeMethod = window.RTCPeerConnection.prototype[method];
      window.RTCPeerConnection.prototype[method] = function() {
        var pc = this;
        var args = arguments;
        var isLegacyCall = arguments.length &&
            typeof arguments[0] === 'function';
        if (isLegacyCall) {
          return nativeMethod.apply(pc, [
            function(description) {
              var desc = replaceInternalStreamId(pc, description);
              args[0].apply(null, [desc]);
            },
            function(err) {
              if (args[1]) {
                args[1].apply(null, err);
              }
            }, arguments[2]
          ]);
        }
        return nativeMethod.apply(pc, arguments)
        .then(function(description) {
          return replaceInternalStreamId(pc, description);
        });
      };
    });

    var origSetLocalDescription =
        window.RTCPeerConnection.prototype.setLocalDescription;
    window.RTCPeerConnection.prototype.setLocalDescription = function() {
      var pc = this;
      if (!arguments.length || !arguments[0].type) {
        return origSetLocalDescription.apply(pc, arguments);
      }
      arguments[0] = replaceExternalStreamId(pc, arguments[0]);
      return origSetLocalDescription.apply(pc, arguments);
    };

    // TODO: mangle getStats: https://w3c.github.io/webrtc-stats/#dom-rtcmediastreamstats-streamidentifier

    var origLocalDescription = Object.getOwnPropertyDescriptor(
        window.RTCPeerConnection.prototype, 'localDescription');
    Object.defineProperty(window.RTCPeerConnection.prototype,
        'localDescription', {
          get: function() {
            var pc = this;
            var description = origLocalDescription.get.apply(this);
            if (description.type === '') {
              return description;
            }
            return replaceInternalStreamId(pc, description);
          }
        });

    window.RTCPeerConnection.prototype.removeTrack = function(sender) {
      var pc = this;
      if (pc.signalingState === 'closed') {
        throw new DOMException(
          'The RTCPeerConnection\'s signalingState is \'closed\'.',
          'InvalidStateError');
      }
      // We can not yet check for sender instanceof RTCRtpSender
      // since we shim RTPSender. So we check if sender._pc is set.
      if (!sender._pc) {
        throw new DOMException('Argument 1 of RTCPeerConnection.removeTrack ' +
            'does not implement interface RTCRtpSender.', 'TypeError');
      }
      var isLocal = sender._pc === pc;
      if (!isLocal) {
        throw new DOMException('Sender was not created by this connection.',
            'InvalidAccessError');
      }

      // Search for the native stream the senders track belongs to.
      pc._streams = pc._streams || {};
      var stream;
      Object.keys(pc._streams).forEach(function(streamid) {
        var hasTrack = pc._streams[streamid].getTracks().find(function(track) {
          return sender.track === track;
        });
        if (hasTrack) {
          stream = pc._streams[streamid];
        }
      });

      if (stream) {
        if (stream.getTracks().length === 1) {
          // if this is the last track of the stream, remove the stream. This
          // takes care of any shimmed _senders.
          pc.removeStream(pc._reverseStreams[stream.id]);
        } else {
          // relying on the same odd chrome behaviour as above.
          stream.removeTrack(sender.track);
        }
        pc.dispatchEvent(new Event('negotiationneeded'));
      }
    };
  },

  shimPeerConnection: function(window) {
    var browserDetails = utils.detectBrowser(window);

    // The RTCPeerConnection object.
    if (!window.RTCPeerConnection) {
      window.RTCPeerConnection = function(pcConfig, pcConstraints) {
        // Translate iceTransportPolicy to iceTransports,
        // see https://code.google.com/p/webrtc/issues/detail?id=4869
        // this was fixed in M56 along with unprefixing RTCPeerConnection.
        logging('PeerConnection');
        if (pcConfig && pcConfig.iceTransportPolicy) {
          pcConfig.iceTransports = pcConfig.iceTransportPolicy;
        }

        return new window.webkitRTCPeerConnection(pcConfig, pcConstraints);
      };
      window.RTCPeerConnection.prototype =
          window.webkitRTCPeerConnection.prototype;
      // wrap static methods. Currently just generateCertificate.
      if (window.webkitRTCPeerConnection.generateCertificate) {
        Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
          get: function() {
            return window.webkitRTCPeerConnection.generateCertificate;
          }
        });
      }
    } else {
      // migrate from non-spec RTCIceServer.url to RTCIceServer.urls
      var OrigPeerConnection = window.RTCPeerConnection;
      window.RTCPeerConnection = function(pcConfig, pcConstraints) {
        if (pcConfig && pcConfig.iceServers) {
          var newIceServers = [];
          for (var i = 0; i < pcConfig.iceServers.length; i++) {
            var server = pcConfig.iceServers[i];
            if (!server.hasOwnProperty('urls') &&
                server.hasOwnProperty('url')) {
              utils.deprecated('RTCIceServer.url', 'RTCIceServer.urls');
              server = JSON.parse(JSON.stringify(server));
              server.urls = server.url;
              newIceServers.push(server);
            } else {
              newIceServers.push(pcConfig.iceServers[i]);
            }
          }
          pcConfig.iceServers = newIceServers;
        }
        return new OrigPeerConnection(pcConfig, pcConstraints);
      };
      window.RTCPeerConnection.prototype = OrigPeerConnection.prototype;
      // wrap static methods. Currently just generateCertificate.
      Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
        get: function() {
          return OrigPeerConnection.generateCertificate;
        }
      });
    }

    var origGetStats = window.RTCPeerConnection.prototype.getStats;
    window.RTCPeerConnection.prototype.getStats = function(selector,
        successCallback, errorCallback) {
      var self = this;
      var args = arguments;

      // If selector is a function then we are in the old style stats so just
      // pass back the original getStats format to avoid breaking old users.
      if (arguments.length > 0 && typeof selector === 'function') {
        return origGetStats.apply(this, arguments);
      }

      // When spec-style getStats is supported, return those when called with
      // either no arguments or the selector argument is null.
      if (origGetStats.length === 0 && (arguments.length === 0 ||
          typeof arguments[0] !== 'function')) {
        return origGetStats.apply(this, []);
      }

      var fixChromeStats_ = function(response) {
        var standardReport = {};
        var reports = response.result();
        reports.forEach(function(report) {
          var standardStats = {
            id: report.id,
            timestamp: report.timestamp,
            type: {
              localcandidate: 'local-candidate',
              remotecandidate: 'remote-candidate'
            }[report.type] || report.type
          };
          report.names().forEach(function(name) {
            standardStats[name] = report.stat(name);
          });
          standardReport[standardStats.id] = standardStats;
        });

        return standardReport;
      };

      // shim getStats with maplike support
      var makeMapStats = function(stats) {
        return new Map(Object.keys(stats).map(function(key) {
          return [key, stats[key]];
        }));
      };

      if (arguments.length >= 2) {
        var successCallbackWrapper_ = function(response) {
          args[1](makeMapStats(fixChromeStats_(response)));
        };

        return origGetStats.apply(this, [successCallbackWrapper_,
          arguments[0]]);
      }

      // promise-support
      return new Promise(function(resolve, reject) {
        origGetStats.apply(self, [
          function(response) {
            resolve(makeMapStats(fixChromeStats_(response)));
          }, reject]);
      }).then(successCallback, errorCallback);
    };

    // add promise support -- natively available in Chrome 51
    if (browserDetails.version < 51) {
      ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
          .forEach(function(method) {
            var nativeMethod = window.RTCPeerConnection.prototype[method];
            window.RTCPeerConnection.prototype[method] = function() {
              var args = arguments;
              var self = this;
              var promise = new Promise(function(resolve, reject) {
                nativeMethod.apply(self, [args[0], resolve, reject]);
              });
              if (args.length < 2) {
                return promise;
              }
              return promise.then(function() {
                args[1].apply(null, []);
              },
              function(err) {
                if (args.length >= 3) {
                  args[2].apply(null, [err]);
                }
              });
            };
          });
    }

    // promise support for createOffer and createAnswer. Available (without
    // bugs) since M52: crbug/619289
    if (browserDetails.version < 52) {
      ['createOffer', 'createAnswer'].forEach(function(method) {
        var nativeMethod = window.RTCPeerConnection.prototype[method];
        window.RTCPeerConnection.prototype[method] = function() {
          var self = this;
          if (arguments.length < 1 || (arguments.length === 1 &&
              typeof arguments[0] === 'object')) {
            var opts = arguments.length === 1 ? arguments[0] : undefined;
            return new Promise(function(resolve, reject) {
              nativeMethod.apply(self, [resolve, reject, opts]);
            });
          }
          return nativeMethod.apply(this, arguments);
        };
      });
    }

    // shim implicit creation of RTCSessionDescription/RTCIceCandidate
    ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
        .forEach(function(method) {
          var nativeMethod = window.RTCPeerConnection.prototype[method];
          window.RTCPeerConnection.prototype[method] = function() {
            arguments[0] = new ((method === 'addIceCandidate') ?
                window.RTCIceCandidate :
                window.RTCSessionDescription)(arguments[0]);
            return nativeMethod.apply(this, arguments);
          };
        });

    // support for addIceCandidate(null or undefined)
    var nativeAddIceCandidate =
        window.RTCPeerConnection.prototype.addIceCandidate;
    window.RTCPeerConnection.prototype.addIceCandidate = function() {
      if (!arguments[0]) {
        if (arguments[1]) {
          arguments[1].apply(null);
        }
        return Promise.resolve();
      }
      return nativeAddIceCandidate.apply(this, arguments);
    };
  }
};


// Expose public methods.
module.exports = {
  shimMediaStream: chromeShim.shimMediaStream,
  shimOnTrack: chromeShim.shimOnTrack,
  shimAddTrackRemoveTrack: chromeShim.shimAddTrackRemoveTrack,
  shimGetSendersWithDtmf: chromeShim.shimGetSendersWithDtmf,
  shimSourceObject: chromeShim.shimSourceObject,
  shimPeerConnection: chromeShim.shimPeerConnection,
  shimGetUserMedia: require('./getusermedia')
};

},{"../utils.js":24,"./getusermedia":17}],17:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';
var utils = require('../utils.js');
var logging = utils.log;

// Expose public methods.
module.exports = function(window) {
  var browserDetails = utils.detectBrowser(window);
  var navigator = window && window.navigator;

  var constraintsToChrome_ = function(c) {
    if (typeof c !== 'object' || c.mandatory || c.optional) {
      return c;
    }
    var cc = {};
    Object.keys(c).forEach(function(key) {
      if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
        return;
      }
      var r = (typeof c[key] === 'object') ? c[key] : {ideal: c[key]};
      if (r.exact !== undefined && typeof r.exact === 'number') {
        r.min = r.max = r.exact;
      }
      var oldname_ = function(prefix, name) {
        if (prefix) {
          return prefix + name.charAt(0).toUpperCase() + name.slice(1);
        }
        return (name === 'deviceId') ? 'sourceId' : name;
      };
      if (r.ideal !== undefined) {
        cc.optional = cc.optional || [];
        var oc = {};
        if (typeof r.ideal === 'number') {
          oc[oldname_('min', key)] = r.ideal;
          cc.optional.push(oc);
          oc = {};
          oc[oldname_('max', key)] = r.ideal;
          cc.optional.push(oc);
        } else {
          oc[oldname_('', key)] = r.ideal;
          cc.optional.push(oc);
        }
      }
      if (r.exact !== undefined && typeof r.exact !== 'number') {
        cc.mandatory = cc.mandatory || {};
        cc.mandatory[oldname_('', key)] = r.exact;
      } else {
        ['min', 'max'].forEach(function(mix) {
          if (r[mix] !== undefined) {
            cc.mandatory = cc.mandatory || {};
            cc.mandatory[oldname_(mix, key)] = r[mix];
          }
        });
      }
    });
    if (c.advanced) {
      cc.optional = (cc.optional || []).concat(c.advanced);
    }
    return cc;
  };

  var shimConstraints_ = function(constraints, func) {
    constraints = JSON.parse(JSON.stringify(constraints));
    if (constraints && typeof constraints.audio === 'object') {
      var remap = function(obj, a, b) {
        if (a in obj && !(b in obj)) {
          obj[b] = obj[a];
          delete obj[a];
        }
      };
      constraints = JSON.parse(JSON.stringify(constraints));
      remap(constraints.audio, 'autoGainControl', 'googAutoGainControl');
      remap(constraints.audio, 'noiseSuppression', 'googNoiseSuppression');
      constraints.audio = constraintsToChrome_(constraints.audio);
    }
    if (constraints && typeof constraints.video === 'object') {
      // Shim facingMode for mobile & surface pro.
      var face = constraints.video.facingMode;
      face = face && ((typeof face === 'object') ? face : {ideal: face});
      var getSupportedFacingModeLies = browserDetails.version < 66;

      if ((face && (face.exact === 'user' || face.exact === 'environment' ||
                    face.ideal === 'user' || face.ideal === 'environment')) &&
          !(navigator.mediaDevices.getSupportedConstraints &&
            navigator.mediaDevices.getSupportedConstraints().facingMode &&
            !getSupportedFacingModeLies)) {
        delete constraints.video.facingMode;
        var matches;
        if (face.exact === 'environment' || face.ideal === 'environment') {
          matches = ['back', 'rear'];
        } else if (face.exact === 'user' || face.ideal === 'user') {
          matches = ['front'];
        }
        if (matches) {
          // Look for matches in label, or use last cam for back (typical).
          return navigator.mediaDevices.enumerateDevices()
          .then(function(devices) {
            devices = devices.filter(function(d) {
              return d.kind === 'videoinput';
            });
            var dev = devices.find(function(d) {
              return matches.some(function(match) {
                return d.label.toLowerCase().indexOf(match) !== -1;
              });
            });
            if (!dev && devices.length && matches.indexOf('back') !== -1) {
              dev = devices[devices.length - 1]; // more likely the back cam
            }
            if (dev) {
              constraints.video.deviceId = face.exact ? {exact: dev.deviceId} :
                                                        {ideal: dev.deviceId};
            }
            constraints.video = constraintsToChrome_(constraints.video);
            logging('chrome: ' + JSON.stringify(constraints));
            return func(constraints);
          });
        }
      }
      constraints.video = constraintsToChrome_(constraints.video);
    }
    logging('chrome: ' + JSON.stringify(constraints));
    return func(constraints);
  };

  var shimError_ = function(e) {
    return {
      name: {
        PermissionDeniedError: 'NotAllowedError',
        InvalidStateError: 'NotReadableError',
        DevicesNotFoundError: 'NotFoundError',
        ConstraintNotSatisfiedError: 'OverconstrainedError',
        TrackStartError: 'NotReadableError',
        MediaDeviceFailedDueToShutdown: 'NotReadableError',
        MediaDeviceKillSwitchOn: 'NotReadableError'
      }[e.name] || e.name,
      message: e.message,
      constraint: e.constraintName,
      toString: function() {
        return this.name + (this.message && ': ') + this.message;
      }
    };
  };

  var getUserMedia_ = function(constraints, onSuccess, onError) {
    shimConstraints_(constraints, function(c) {
      navigator.webkitGetUserMedia(c, onSuccess, function(e) {
        if (onError) {
          onError(shimError_(e));
        }
      });
    });
  };

  navigator.getUserMedia = getUserMedia_;

  // Returns the result of getUserMedia as a Promise.
  var getUserMediaPromise_ = function(constraints) {
    return new Promise(function(resolve, reject) {
      navigator.getUserMedia(constraints, resolve, reject);
    });
  };

  if (!navigator.mediaDevices) {
    navigator.mediaDevices = {
      getUserMedia: getUserMediaPromise_,
      enumerateDevices: function() {
        return new Promise(function(resolve) {
          var kinds = {audio: 'audioinput', video: 'videoinput'};
          return window.MediaStreamTrack.getSources(function(devices) {
            resolve(devices.map(function(device) {
              return {label: device.label,
                kind: kinds[device.kind],
                deviceId: device.id,
                groupId: ''};
            }));
          });
        });
      },
      getSupportedConstraints: function() {
        return {
          deviceId: true, echoCancellation: true, facingMode: true,
          frameRate: true, height: true, width: true
        };
      }
    };
  }

  // A shim for getUserMedia method on the mediaDevices object.
  // TODO(KaptenJansson) remove once implemented in Chrome stable.
  if (!navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia = function(constraints) {
      return getUserMediaPromise_(constraints);
    };
  } else {
    // Even though Chrome 45 has navigator.mediaDevices and a getUserMedia
    // function which returns a Promise, it does not accept spec-style
    // constraints.
    var origGetUserMedia = navigator.mediaDevices.getUserMedia.
        bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function(cs) {
      return shimConstraints_(cs, function(c) {
        return origGetUserMedia(c).then(function(stream) {
          if (c.audio && !stream.getAudioTracks().length ||
              c.video && !stream.getVideoTracks().length) {
            stream.getTracks().forEach(function(track) {
              track.stop();
            });
            throw new DOMException('', 'NotFoundError');
          }
          return stream;
        }, function(e) {
          return Promise.reject(shimError_(e));
        });
      });
    };
  }

  // Dummy devicechange event methods.
  // TODO(KaptenJansson) remove once implemented in Chrome stable.
  if (typeof navigator.mediaDevices.addEventListener === 'undefined') {
    navigator.mediaDevices.addEventListener = function() {
      logging('Dummy mediaDevices.addEventListener called.');
    };
  }
  if (typeof navigator.mediaDevices.removeEventListener === 'undefined') {
    navigator.mediaDevices.removeEventListener = function() {
      logging('Dummy mediaDevices.removeEventListener called.');
    };
  }
};

},{"../utils.js":24}],18:[function(require,module,exports){
/*
 *  Copyright (c) 2017 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var SDPUtils = require('sdp');
var utils = require('./utils');

// Wraps the peerconnection event eventNameToWrap in a function
// which returns the modified event object.
function wrapPeerConnectionEvent(window, eventNameToWrap, wrapper) {
  if (!window.RTCPeerConnection) {
    return;
  }
  var proto = window.RTCPeerConnection.prototype;
  var nativeAddEventListener = proto.addEventListener;
  proto.addEventListener = function(nativeEventName, cb) {
    if (nativeEventName !== eventNameToWrap) {
      return nativeAddEventListener.apply(this, arguments);
    }
    var wrappedCallback = function(e) {
      cb(wrapper(e));
    };
    this._eventMap = this._eventMap || {};
    this._eventMap[cb] = wrappedCallback;
    return nativeAddEventListener.apply(this, [nativeEventName,
      wrappedCallback]);
  };

  var nativeRemoveEventListener = proto.removeEventListener;
  proto.removeEventListener = function(nativeEventName, cb) {
    if (nativeEventName !== eventNameToWrap || !this._eventMap
        || !this._eventMap[cb]) {
      return nativeRemoveEventListener.apply(this, arguments);
    }
    var unwrappedCb = this._eventMap[cb];
    delete this._eventMap[cb];
    return nativeRemoveEventListener.apply(this, [nativeEventName,
      unwrappedCb]);
  };

  Object.defineProperty(proto, 'on' + eventNameToWrap, {
    get: function() {
      return this['_on' + eventNameToWrap];
    },
    set: function(cb) {
      if (this['_on' + eventNameToWrap]) {
        this.removeEventListener(eventNameToWrap,
            this['_on' + eventNameToWrap]);
        delete this['_on' + eventNameToWrap];
      }
      if (cb) {
        this.addEventListener(eventNameToWrap,
            this['_on' + eventNameToWrap] = cb);
      }
    }
  });
}

module.exports = {
  shimRTCIceCandidate: function(window) {
    // foundation is arbitrarily chosen as an indicator for full support for
    // https://w3c.github.io/webrtc-pc/#rtcicecandidate-interface
    if (window.RTCIceCandidate && 'foundation' in
        window.RTCIceCandidate.prototype) {
      return;
    }

    var NativeRTCIceCandidate = window.RTCIceCandidate;
    window.RTCIceCandidate = function(args) {
      // Remove the a= which shouldn't be part of the candidate string.
      if (typeof args === 'object' && args.candidate &&
          args.candidate.indexOf('a=') === 0) {
        args = JSON.parse(JSON.stringify(args));
        args.candidate = args.candidate.substr(2);
      }

      // Augment the native candidate with the parsed fields.
      var nativeCandidate = new NativeRTCIceCandidate(args);
      var parsedCandidate = SDPUtils.parseCandidate(args.candidate);
      var augmentedCandidate = Object.assign(nativeCandidate,
          parsedCandidate);

      // Add a serializer that does not serialize the extra attributes.
      augmentedCandidate.toJSON = function() {
        return {
          candidate: augmentedCandidate.candidate,
          sdpMid: augmentedCandidate.sdpMid,
          sdpMLineIndex: augmentedCandidate.sdpMLineIndex,
          usernameFragment: augmentedCandidate.usernameFragment,
        };
      };
      return augmentedCandidate;
    };

    // Hook up the augmented candidate in onicecandidate and
    // addEventListener('icecandidate', ...)
    wrapPeerConnectionEvent(window, 'icecandidate', function(e) {
      if (e.candidate) {
        Object.defineProperty(e, 'candidate', {
          value: new window.RTCIceCandidate(e.candidate),
          writable: 'false'
        });
      }
      return e;
    });
  },

  // shimCreateObjectURL must be called before shimSourceObject to avoid loop.

  shimCreateObjectURL: function(window) {
    var URL = window && window.URL;

    if (!(typeof window === 'object' && window.HTMLMediaElement &&
          'srcObject' in window.HTMLMediaElement.prototype &&
        URL.createObjectURL && URL.revokeObjectURL)) {
      // Only shim CreateObjectURL using srcObject if srcObject exists.
      return undefined;
    }

    var nativeCreateObjectURL = URL.createObjectURL.bind(URL);
    var nativeRevokeObjectURL = URL.revokeObjectURL.bind(URL);
    var streams = new Map(), newId = 0;

    URL.createObjectURL = function(stream) {
      if ('getTracks' in stream) {
        var url = 'polyblob:' + (++newId);
        streams.set(url, stream);
        utils.deprecated('URL.createObjectURL(stream)',
            'elem.srcObject = stream');
        return url;
      }
      return nativeCreateObjectURL(stream);
    };
    URL.revokeObjectURL = function(url) {
      nativeRevokeObjectURL(url);
      streams.delete(url);
    };

    var dsc = Object.getOwnPropertyDescriptor(window.HTMLMediaElement.prototype,
                                              'src');
    Object.defineProperty(window.HTMLMediaElement.prototype, 'src', {
      get: function() {
        return dsc.get.apply(this);
      },
      set: function(url) {
        this.srcObject = streams.get(url) || null;
        return dsc.set.apply(this, [url]);
      }
    });

    var nativeSetAttribute = window.HTMLMediaElement.prototype.setAttribute;
    window.HTMLMediaElement.prototype.setAttribute = function() {
      if (arguments.length === 2 &&
          ('' + arguments[0]).toLowerCase() === 'src') {
        this.srcObject = streams.get(arguments[1]) || null;
      }
      return nativeSetAttribute.apply(this, arguments);
    };
  }
};

},{"./utils":24,"sdp":12}],19:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var utils = require('../utils');
var shimRTCPeerConnection = require('rtcpeerconnection-shim');

module.exports = {
  shimGetUserMedia: require('./getusermedia'),
  shimPeerConnection: function(window) {
    var browserDetails = utils.detectBrowser(window);

    if (window.RTCIceGatherer) {
      // ORTC defines an RTCIceCandidate object but no constructor.
      // Not implemented in Edge.
      if (!window.RTCIceCandidate) {
        window.RTCIceCandidate = function(args) {
          return args;
        };
      }
      // ORTC does not have a session description object but
      // other browsers (i.e. Chrome) that will support both PC and ORTC
      // in the future might have this defined already.
      if (!window.RTCSessionDescription) {
        window.RTCSessionDescription = function(args) {
          return args;
        };
      }
      // this adds an additional event listener to MediaStrackTrack that signals
      // when a tracks enabled property was changed. Workaround for a bug in
      // addStream, see below. No longer required in 15025+
      if (browserDetails.version < 15025) {
        var origMSTEnabled = Object.getOwnPropertyDescriptor(
            window.MediaStreamTrack.prototype, 'enabled');
        Object.defineProperty(window.MediaStreamTrack.prototype, 'enabled', {
          set: function(value) {
            origMSTEnabled.set.call(this, value);
            var ev = new Event('enabled');
            ev.enabled = value;
            this.dispatchEvent(ev);
          }
        });
      }
    }

    // ORTC defines the DTMF sender a bit different.
    // https://github.com/w3c/ortc/issues/714
    if (window.RTCRtpSender && !('dtmf' in window.RTCRtpSender.prototype)) {
      Object.defineProperty(window.RTCRtpSender.prototype, 'dtmf', {
        get: function() {
          if (this._dtmf === undefined) {
            if (this.track.kind === 'audio') {
              this._dtmf = new window.RTCDtmfSender(this);
            } else if (this.track.kind === 'video') {
              this._dtmf = null;
            }
          }
          return this._dtmf;
        }
      });
    }

    window.RTCPeerConnection =
        shimRTCPeerConnection(window, browserDetails.version);
  },
  shimReplaceTrack: function(window) {
    // ORTC has replaceTrack -- https://github.com/w3c/ortc/issues/614
    if (window.RTCRtpSender &&
        !('replaceTrack' in window.RTCRtpSender.prototype)) {
      window.RTCRtpSender.prototype.replaceTrack =
          window.RTCRtpSender.prototype.setTrack;
    }
  }
};

},{"../utils":24,"./getusermedia":20,"rtcpeerconnection-shim":7}],20:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

// Expose public methods.
module.exports = function(window) {
  var navigator = window && window.navigator;

  var shimError_ = function(e) {
    return {
      name: {PermissionDeniedError: 'NotAllowedError'}[e.name] || e.name,
      message: e.message,
      constraint: e.constraint,
      toString: function() {
        return this.name;
      }
    };
  };

  // getUserMedia error shim.
  var origGetUserMedia = navigator.mediaDevices.getUserMedia.
      bind(navigator.mediaDevices);
  navigator.mediaDevices.getUserMedia = function(c) {
    return origGetUserMedia(c).catch(function(e) {
      return Promise.reject(shimError_(e));
    });
  };
};

},{}],21:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var utils = require('../utils');

var firefoxShim = {
  shimOnTrack: function(window) {
    if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
        window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
        get: function() {
          return this._ontrack;
        },
        set: function(f) {
          if (this._ontrack) {
            this.removeEventListener('track', this._ontrack);
            this.removeEventListener('addstream', this._ontrackpoly);
          }
          this.addEventListener('track', this._ontrack = f);
          this.addEventListener('addstream', this._ontrackpoly = function(e) {
            e.stream.getTracks().forEach(function(track) {
              var event = new Event('track');
              event.track = track;
              event.receiver = {track: track};
              event.transceiver = {receiver: event.receiver};
              event.streams = [e.stream];
              this.dispatchEvent(event);
            }.bind(this));
          }.bind(this));
        }
      });
    }
    if (typeof window === 'object' && window.RTCTrackEvent &&
        ('receiver' in window.RTCTrackEvent.prototype) &&
        !('transceiver' in window.RTCTrackEvent.prototype)) {
      Object.defineProperty(window.RTCTrackEvent.prototype, 'transceiver', {
        get: function() {
          return {receiver: this.receiver};
        }
      });
    }
  },

  shimSourceObject: function(window) {
    // Firefox has supported mozSrcObject since FF22, unprefixed in 42.
    if (typeof window === 'object') {
      if (window.HTMLMediaElement &&
        !('srcObject' in window.HTMLMediaElement.prototype)) {
        // Shim the srcObject property, once, when HTMLMediaElement is found.
        Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
          get: function() {
            return this.mozSrcObject;
          },
          set: function(stream) {
            this.mozSrcObject = stream;
          }
        });
      }
    }
  },

  shimPeerConnection: function(window) {
    var browserDetails = utils.detectBrowser(window);

    if (typeof window !== 'object' || !(window.RTCPeerConnection ||
        window.mozRTCPeerConnection)) {
      return; // probably media.peerconnection.enabled=false in about:config
    }
    // The RTCPeerConnection object.
    if (!window.RTCPeerConnection) {
      window.RTCPeerConnection = function(pcConfig, pcConstraints) {
        if (browserDetails.version < 38) {
          // .urls is not supported in FF < 38.
          // create RTCIceServers with a single url.
          if (pcConfig && pcConfig.iceServers) {
            var newIceServers = [];
            for (var i = 0; i < pcConfig.iceServers.length; i++) {
              var server = pcConfig.iceServers[i];
              if (server.hasOwnProperty('urls')) {
                for (var j = 0; j < server.urls.length; j++) {
                  var newServer = {
                    url: server.urls[j]
                  };
                  if (server.urls[j].indexOf('turn') === 0) {
                    newServer.username = server.username;
                    newServer.credential = server.credential;
                  }
                  newIceServers.push(newServer);
                }
              } else {
                newIceServers.push(pcConfig.iceServers[i]);
              }
            }
            pcConfig.iceServers = newIceServers;
          }
        }
        return new window.mozRTCPeerConnection(pcConfig, pcConstraints);
      };
      window.RTCPeerConnection.prototype =
          window.mozRTCPeerConnection.prototype;

      // wrap static methods. Currently just generateCertificate.
      if (window.mozRTCPeerConnection.generateCertificate) {
        Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
          get: function() {
            return window.mozRTCPeerConnection.generateCertificate;
          }
        });
      }

      window.RTCSessionDescription = window.mozRTCSessionDescription;
      window.RTCIceCandidate = window.mozRTCIceCandidate;
    }

    // shim away need for obsolete RTCIceCandidate/RTCSessionDescription.
    ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
        .forEach(function(method) {
          var nativeMethod = window.RTCPeerConnection.prototype[method];
          window.RTCPeerConnection.prototype[method] = function() {
            arguments[0] = new ((method === 'addIceCandidate') ?
                window.RTCIceCandidate :
                window.RTCSessionDescription)(arguments[0]);
            return nativeMethod.apply(this, arguments);
          };
        });

    // support for addIceCandidate(null or undefined)
    var nativeAddIceCandidate =
        window.RTCPeerConnection.prototype.addIceCandidate;
    window.RTCPeerConnection.prototype.addIceCandidate = function() {
      if (!arguments[0]) {
        if (arguments[1]) {
          arguments[1].apply(null);
        }
        return Promise.resolve();
      }
      return nativeAddIceCandidate.apply(this, arguments);
    };

    // shim getStats with maplike support
    var makeMapStats = function(stats) {
      var map = new Map();
      Object.keys(stats).forEach(function(key) {
        map.set(key, stats[key]);
        map[key] = stats[key];
      });
      return map;
    };

    var modernStatsTypes = {
      inboundrtp: 'inbound-rtp',
      outboundrtp: 'outbound-rtp',
      candidatepair: 'candidate-pair',
      localcandidate: 'local-candidate',
      remotecandidate: 'remote-candidate'
    };

    var nativeGetStats = window.RTCPeerConnection.prototype.getStats;
    window.RTCPeerConnection.prototype.getStats = function(
      selector,
      onSucc,
      onErr
    ) {
      return nativeGetStats.apply(this, [selector || null])
        .then(function(stats) {
          if (browserDetails.version < 48) {
            stats = makeMapStats(stats);
          }
          if (browserDetails.version < 53 && !onSucc) {
            // Shim only promise getStats with spec-hyphens in type names
            // Leave callback version alone; misc old uses of forEach before Map
            try {
              stats.forEach(function(stat) {
                stat.type = modernStatsTypes[stat.type] || stat.type;
              });
            } catch (e) {
              if (e.name !== 'TypeError') {
                throw e;
              }
              // Avoid TypeError: "type" is read-only, in old versions. 34-43ish
              stats.forEach(function(stat, i) {
                stats.set(i, Object.assign({}, stat, {
                  type: modernStatsTypes[stat.type] || stat.type
                }));
              });
            }
          }
          return stats;
        })
        .then(onSucc, onErr);
    };
  }
};

// Expose public methods.
module.exports = {
  shimOnTrack: firefoxShim.shimOnTrack,
  shimSourceObject: firefoxShim.shimSourceObject,
  shimPeerConnection: firefoxShim.shimPeerConnection,
  shimGetUserMedia: require('./getusermedia')
};

},{"../utils":24,"./getusermedia":22}],22:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var utils = require('../utils');
var logging = utils.log;

// Expose public methods.
module.exports = function(window) {
  var browserDetails = utils.detectBrowser(window);
  var navigator = window && window.navigator;
  var MediaStreamTrack = window && window.MediaStreamTrack;

  var shimError_ = function(e) {
    return {
      name: {
        InternalError: 'NotReadableError',
        NotSupportedError: 'TypeError',
        PermissionDeniedError: 'NotAllowedError',
        SecurityError: 'NotAllowedError'
      }[e.name] || e.name,
      message: {
        'The operation is insecure.': 'The request is not allowed by the ' +
        'user agent or the platform in the current context.'
      }[e.message] || e.message,
      constraint: e.constraint,
      toString: function() {
        return this.name + (this.message && ': ') + this.message;
      }
    };
  };

  // getUserMedia constraints shim.
  var getUserMedia_ = function(constraints, onSuccess, onError) {
    var constraintsToFF37_ = function(c) {
      if (typeof c !== 'object' || c.require) {
        return c;
      }
      var require = [];
      Object.keys(c).forEach(function(key) {
        if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
          return;
        }
        var r = c[key] = (typeof c[key] === 'object') ?
            c[key] : {ideal: c[key]};
        if (r.min !== undefined ||
            r.max !== undefined || r.exact !== undefined) {
          require.push(key);
        }
        if (r.exact !== undefined) {
          if (typeof r.exact === 'number') {
            r. min = r.max = r.exact;
          } else {
            c[key] = r.exact;
          }
          delete r.exact;
        }
        if (r.ideal !== undefined) {
          c.advanced = c.advanced || [];
          var oc = {};
          if (typeof r.ideal === 'number') {
            oc[key] = {min: r.ideal, max: r.ideal};
          } else {
            oc[key] = r.ideal;
          }
          c.advanced.push(oc);
          delete r.ideal;
          if (!Object.keys(r).length) {
            delete c[key];
          }
        }
      });
      if (require.length) {
        c.require = require;
      }
      return c;
    };
    constraints = JSON.parse(JSON.stringify(constraints));
    if (browserDetails.version < 38) {
      logging('spec: ' + JSON.stringify(constraints));
      if (constraints.audio) {
        constraints.audio = constraintsToFF37_(constraints.audio);
      }
      if (constraints.video) {
        constraints.video = constraintsToFF37_(constraints.video);
      }
      logging('ff37: ' + JSON.stringify(constraints));
    }
    return navigator.mozGetUserMedia(constraints, onSuccess, function(e) {
      onError(shimError_(e));
    });
  };

  // Returns the result of getUserMedia as a Promise.
  var getUserMediaPromise_ = function(constraints) {
    return new Promise(function(resolve, reject) {
      getUserMedia_(constraints, resolve, reject);
    });
  };

  // Shim for mediaDevices on older versions.
  if (!navigator.mediaDevices) {
    navigator.mediaDevices = {getUserMedia: getUserMediaPromise_,
      addEventListener: function() { },
      removeEventListener: function() { }
    };
  }
  navigator.mediaDevices.enumerateDevices =
      navigator.mediaDevices.enumerateDevices || function() {
        return new Promise(function(resolve) {
          var infos = [
            {kind: 'audioinput', deviceId: 'default', label: '', groupId: ''},
            {kind: 'videoinput', deviceId: 'default', label: '', groupId: ''}
          ];
          resolve(infos);
        });
      };

  if (browserDetails.version < 41) {
    // Work around http://bugzil.la/1169665
    var orgEnumerateDevices =
        navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);
    navigator.mediaDevices.enumerateDevices = function() {
      return orgEnumerateDevices().then(undefined, function(e) {
        if (e.name === 'NotFoundError') {
          return [];
        }
        throw e;
      });
    };
  }
  if (browserDetails.version < 49) {
    var origGetUserMedia = navigator.mediaDevices.getUserMedia.
        bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function(c) {
      return origGetUserMedia(c).then(function(stream) {
        // Work around https://bugzil.la/802326
        if (c.audio && !stream.getAudioTracks().length ||
            c.video && !stream.getVideoTracks().length) {
          stream.getTracks().forEach(function(track) {
            track.stop();
          });
          throw new DOMException('The object can not be found here.',
                                 'NotFoundError');
        }
        return stream;
      }, function(e) {
        return Promise.reject(shimError_(e));
      });
    };
  }
  if (!(browserDetails.version > 55 &&
      'autoGainControl' in navigator.mediaDevices.getSupportedConstraints())) {
    var remap = function(obj, a, b) {
      if (a in obj && !(b in obj)) {
        obj[b] = obj[a];
        delete obj[a];
      }
    };

    var nativeGetUserMedia = navigator.mediaDevices.getUserMedia.
        bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function(c) {
      if (typeof c === 'object' && typeof c.audio === 'object') {
        c = JSON.parse(JSON.stringify(c));
        remap(c.audio, 'autoGainControl', 'mozAutoGainControl');
        remap(c.audio, 'noiseSuppression', 'mozNoiseSuppression');
      }
      return nativeGetUserMedia(c);
    };

    if (MediaStreamTrack && MediaStreamTrack.prototype.getSettings) {
      var nativeGetSettings = MediaStreamTrack.prototype.getSettings;
      MediaStreamTrack.prototype.getSettings = function() {
        var obj = nativeGetSettings.apply(this, arguments);
        remap(obj, 'mozAutoGainControl', 'autoGainControl');
        remap(obj, 'mozNoiseSuppression', 'noiseSuppression');
        return obj;
      };
    }

    if (MediaStreamTrack && MediaStreamTrack.prototype.applyConstraints) {
      var nativeApplyConstraints = MediaStreamTrack.prototype.applyConstraints;
      MediaStreamTrack.prototype.applyConstraints = function(c) {
        if (this.kind === 'audio' && typeof c === 'object') {
          c = JSON.parse(JSON.stringify(c));
          remap(c, 'autoGainControl', 'mozAutoGainControl');
          remap(c, 'noiseSuppression', 'mozNoiseSuppression');
        }
        return nativeApplyConstraints.apply(this, [c]);
      };
    }
  }
  navigator.getUserMedia = function(constraints, onSuccess, onError) {
    if (browserDetails.version < 44) {
      return getUserMedia_(constraints, onSuccess, onError);
    }
    // Replace Firefox 44+'s deprecation warning with unprefixed version.
    utils.deprecated('navigator.getUserMedia',
        'navigator.mediaDevices.getUserMedia');
    navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
  };
};

},{"../utils":24}],23:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
'use strict';
var utils = require('../utils');

var safariShim = {
  // TODO: DrAlex, should be here, double check against LayoutTests

  // TODO: once the back-end for the mac port is done, add.
  // TODO: check for webkitGTK+
  // shimPeerConnection: function() { },

  shimLocalStreamsAPI: function(window) {
    if (typeof window !== 'object' || !window.RTCPeerConnection) {
      return;
    }
    if (!('getLocalStreams' in window.RTCPeerConnection.prototype)) {
      window.RTCPeerConnection.prototype.getLocalStreams = function() {
        if (!this._localStreams) {
          this._localStreams = [];
        }
        return this._localStreams;
      };
    }
    if (!('getStreamById' in window.RTCPeerConnection.prototype)) {
      window.RTCPeerConnection.prototype.getStreamById = function(id) {
        var result = null;
        if (this._localStreams) {
          this._localStreams.forEach(function(stream) {
            if (stream.id === id) {
              result = stream;
            }
          });
        }
        if (this._remoteStreams) {
          this._remoteStreams.forEach(function(stream) {
            if (stream.id === id) {
              result = stream;
            }
          });
        }
        return result;
      };
    }
    if (!('addStream' in window.RTCPeerConnection.prototype)) {
      var _addTrack = window.RTCPeerConnection.prototype.addTrack;
      window.RTCPeerConnection.prototype.addStream = function(stream) {
        if (!this._localStreams) {
          this._localStreams = [];
        }
        if (this._localStreams.indexOf(stream) === -1) {
          this._localStreams.push(stream);
        }
        var self = this;
        stream.getTracks().forEach(function(track) {
          _addTrack.call(self, track, stream);
        });
      };

      window.RTCPeerConnection.prototype.addTrack = function(track, stream) {
        if (stream) {
          if (!this._localStreams) {
            this._localStreams = [stream];
          } else if (this._localStreams.indexOf(stream) === -1) {
            this._localStreams.push(stream);
          }
        }
        _addTrack.call(this, track, stream);
      };
    }
    if (!('removeStream' in window.RTCPeerConnection.prototype)) {
      window.RTCPeerConnection.prototype.removeStream = function(stream) {
        if (!this._localStreams) {
          this._localStreams = [];
        }
        var index = this._localStreams.indexOf(stream);
        if (index === -1) {
          return;
        }
        this._localStreams.splice(index, 1);
        var self = this;
        var tracks = stream.getTracks();
        this.getSenders().forEach(function(sender) {
          if (tracks.indexOf(sender.track) !== -1) {
            self.removeTrack(sender);
          }
        });
      };
    }
  },
  shimRemoteStreamsAPI: function(window) {
    if (typeof window !== 'object' || !window.RTCPeerConnection) {
      return;
    }
    if (!('getRemoteStreams' in window.RTCPeerConnection.prototype)) {
      window.RTCPeerConnection.prototype.getRemoteStreams = function() {
        return this._remoteStreams ? this._remoteStreams : [];
      };
    }
    if (!('onaddstream' in window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'onaddstream', {
        get: function() {
          return this._onaddstream;
        },
        set: function(f) {
          if (this._onaddstream) {
            this.removeEventListener('addstream', this._onaddstream);
            this.removeEventListener('track', this._onaddstreampoly);
          }
          this.addEventListener('addstream', this._onaddstream = f);
          this.addEventListener('track', this._onaddstreampoly = function(e) {
            var stream = e.streams[0];
            if (!this._remoteStreams) {
              this._remoteStreams = [];
            }
            if (this._remoteStreams.indexOf(stream) >= 0) {
              return;
            }
            this._remoteStreams.push(stream);
            var event = new Event('addstream');
            event.stream = e.streams[0];
            this.dispatchEvent(event);
          }.bind(this));
        }
      });
    }
  },
  shimCallbacksAPI: function(window) {
    if (typeof window !== 'object' || !window.RTCPeerConnection) {
      return;
    }
    var prototype = window.RTCPeerConnection.prototype;
    var createOffer = prototype.createOffer;
    var createAnswer = prototype.createAnswer;
    var setLocalDescription = prototype.setLocalDescription;
    var setRemoteDescription = prototype.setRemoteDescription;
    var addIceCandidate = prototype.addIceCandidate;

    prototype.createOffer = function(successCallback, failureCallback) {
      var options = (arguments.length >= 2) ? arguments[2] : arguments[0];
      var promise = createOffer.apply(this, [options]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };

    prototype.createAnswer = function(successCallback, failureCallback) {
      var options = (arguments.length >= 2) ? arguments[2] : arguments[0];
      var promise = createAnswer.apply(this, [options]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };

    var withCallback = function(description, successCallback, failureCallback) {
      var promise = setLocalDescription.apply(this, [description]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };
    prototype.setLocalDescription = withCallback;

    withCallback = function(description, successCallback, failureCallback) {
      var promise = setRemoteDescription.apply(this, [description]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };
    prototype.setRemoteDescription = withCallback;

    withCallback = function(candidate, successCallback, failureCallback) {
      var promise = addIceCandidate.apply(this, [candidate]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };
    prototype.addIceCandidate = withCallback;
  },
  shimGetUserMedia: function(window) {
    var navigator = window && window.navigator;

    if (!navigator.getUserMedia) {
      if (navigator.webkitGetUserMedia) {
        navigator.getUserMedia = navigator.webkitGetUserMedia.bind(navigator);
      } else if (navigator.mediaDevices &&
          navigator.mediaDevices.getUserMedia) {
        navigator.getUserMedia = function(constraints, cb, errcb) {
          navigator.mediaDevices.getUserMedia(constraints)
          .then(cb, errcb);
        }.bind(navigator);
      }
    }
  },
  shimRTCIceServerUrls: function(window) {
    // migrate from non-spec RTCIceServer.url to RTCIceServer.urls
    var OrigPeerConnection = window.RTCPeerConnection;
    window.RTCPeerConnection = function(pcConfig, pcConstraints) {
      if (pcConfig && pcConfig.iceServers) {
        var newIceServers = [];
        for (var i = 0; i < pcConfig.iceServers.length; i++) {
          var server = pcConfig.iceServers[i];
          if (!server.hasOwnProperty('urls') &&
              server.hasOwnProperty('url')) {
            utils.deprecated('RTCIceServer.url', 'RTCIceServer.urls');
            server = JSON.parse(JSON.stringify(server));
            server.urls = server.url;
            delete server.url;
            newIceServers.push(server);
          } else {
            newIceServers.push(pcConfig.iceServers[i]);
          }
        }
        pcConfig.iceServers = newIceServers;
      }
      return new OrigPeerConnection(pcConfig, pcConstraints);
    };
    window.RTCPeerConnection.prototype = OrigPeerConnection.prototype;
    // wrap static methods. Currently just generateCertificate.
    if ('generateCertificate' in window.RTCPeerConnection) {
      Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
        get: function() {
          return OrigPeerConnection.generateCertificate;
        }
      });
    }
  },
  shimTrackEventTransceiver: function(window) {
    // Add event.transceiver member over deprecated event.receiver
    if (typeof window === 'object' && window.RTCPeerConnection &&
        ('receiver' in window.RTCTrackEvent.prototype) &&
        // can't check 'transceiver' in window.RTCTrackEvent.prototype, as it is
        // defined for some reason even when window.RTCTransceiver is not.
        !window.RTCTransceiver) {
      Object.defineProperty(window.RTCTrackEvent.prototype, 'transceiver', {
        get: function() {
          return {receiver: this.receiver};
        }
      });
    }
  },

  shimCreateOfferLegacy: function(window) {
    var origCreateOffer = window.RTCPeerConnection.prototype.createOffer;
    window.RTCPeerConnection.prototype.createOffer = function(offerOptions) {
      var pc = this;
      if (offerOptions) {
        var audioTransceiver = pc.getTransceivers().find(function(transceiver) {
          return transceiver.sender.track &&
              transceiver.sender.track.kind === 'audio';
        });
        if (offerOptions.offerToReceiveAudio === false && audioTransceiver) {
          if (audioTransceiver.direction === 'sendrecv') {
            audioTransceiver.setDirection('sendonly');
          } else if (audioTransceiver.direction === 'recvonly') {
            audioTransceiver.setDirection('inactive');
          }
        } else if (offerOptions.offerToReceiveAudio === true &&
            !audioTransceiver) {
          pc.addTransceiver('audio');
        }

        var videoTransceiver = pc.getTransceivers().find(function(transceiver) {
          return transceiver.sender.track &&
              transceiver.sender.track.kind === 'video';
        });
        if (offerOptions.offerToReceiveVideo === false && videoTransceiver) {
          if (videoTransceiver.direction === 'sendrecv') {
            videoTransceiver.setDirection('sendonly');
          } else if (videoTransceiver.direction === 'recvonly') {
            videoTransceiver.setDirection('inactive');
          }
        } else if (offerOptions.offerToReceiveVideo === true &&
            !videoTransceiver) {
          pc.addTransceiver('video');
        }
      }
      return origCreateOffer.apply(pc, arguments);
    };
  }
};

// Expose public methods.
module.exports = {
  shimCallbacksAPI: safariShim.shimCallbacksAPI,
  shimLocalStreamsAPI: safariShim.shimLocalStreamsAPI,
  shimRemoteStreamsAPI: safariShim.shimRemoteStreamsAPI,
  shimGetUserMedia: safariShim.shimGetUserMedia,
  shimRTCIceServerUrls: safariShim.shimRTCIceServerUrls,
  shimTrackEventTransceiver: safariShim.shimTrackEventTransceiver,
  shimCreateOfferLegacy: safariShim.shimCreateOfferLegacy
  // TODO
  // shimPeerConnection: safariShim.shimPeerConnection
};

},{"../utils":24}],24:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var logDisabled_ = true;
var deprecationWarnings_ = true;

// Utility methods.
var utils = {
  disableLog: function(bool) {
    if (typeof bool !== 'boolean') {
      return new Error('Argument type: ' + typeof bool +
          '. Please use a boolean.');
    }
    logDisabled_ = bool;
    return (bool) ? 'adapter.js logging disabled' :
        'adapter.js logging enabled';
  },

  /**
   * Disable or enable deprecation warnings
   * @param {!boolean} bool set to true to disable warnings.
   */
  disableWarnings: function(bool) {
    if (typeof bool !== 'boolean') {
      return new Error('Argument type: ' + typeof bool +
          '. Please use a boolean.');
    }
    deprecationWarnings_ = !bool;
    return 'adapter.js deprecation warnings ' + (bool ? 'disabled' : 'enabled');
  },

  log: function() {
    if (typeof window === 'object') {
      if (logDisabled_) {
        return;
      }
      if (typeof console !== 'undefined' && typeof console.log === 'function') {
        console.log.apply(console, arguments);
      }
    }
  },

  /**
   * Shows a deprecation warning suggesting the modern and spec-compatible API.
   */
  deprecated: function(oldMethod, newMethod) {
    if (!deprecationWarnings_) {
      return;
    }
    console.warn(oldMethod + ' is deprecated, please use ' + newMethod +
        ' instead.');
  },

  /**
   * Extract browser version out of the provided user agent string.
   *
   * @param {!string} uastring userAgent string.
   * @param {!string} expr Regular expression used as match criteria.
   * @param {!number} pos position in the version string to be returned.
   * @return {!number} browser version.
   */
  extractVersion: function(uastring, expr, pos) {
    var match = uastring.match(expr);
    return match && match.length >= pos && parseInt(match[pos], 10);
  },

  /**
   * Browser detector.
   *
   * @return {object} result containing browser and version
   *     properties.
   */
  detectBrowser: function(window) {
    var navigator = window && window.navigator;

    // Returned result object.
    var result = {};
    result.browser = null;
    result.version = null;

    // Fail early if it's not a browser
    if (typeof window === 'undefined' || !window.navigator) {
      result.browser = 'Not a browser.';
      return result;
    }

    // Firefox.
    if (navigator.mozGetUserMedia) {
      result.browser = 'firefox';
      result.version = this.extractVersion(navigator.userAgent,
          /Firefox\/(\d+)\./, 1);
    } else if (navigator.webkitGetUserMedia) {
      // Chrome, Chromium, Webview, Opera, all use the chrome shim for now
      if (window.webkitRTCPeerConnection) {
        result.browser = 'chrome';
        result.version = this.extractVersion(navigator.userAgent,
          /Chrom(e|ium)\/(\d+)\./, 2);
      } else { // Safari (in an unpublished version) or unknown webkit-based.
        if (navigator.userAgent.match(/Version\/(\d+).(\d+)/)) {
          result.browser = 'safari';
          result.version = this.extractVersion(navigator.userAgent,
            /AppleWebKit\/(\d+)\./, 1);
        } else { // unknown webkit-based browser.
          result.browser = 'Unsupported webkit-based browser ' +
              'with GUM support but no WebRTC support.';
          return result;
        }
      }
    } else if (navigator.mediaDevices &&
        navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) { // Edge.
      result.browser = 'edge';
      result.version = this.extractVersion(navigator.userAgent,
          /Edge\/(\d+).(\d+)$/, 2);
    } else if (navigator.mediaDevices &&
        navigator.userAgent.match(/AppleWebKit\/(\d+)\./)) {
        // Safari, with webkitGetUserMedia removed.
      result.browser = 'safari';
      result.version = this.extractVersion(navigator.userAgent,
          /AppleWebKit\/(\d+)\./, 1);
    } else { // Default fallthrough: not supported.
      result.browser = 'Not a supported browser.';
      return result;
    }

    return result;
  },

};

// Export.
module.exports = {
  log: utils.log,
  deprecated: utils.deprecated,
  disableLog: utils.disableLog,
  disableWarnings: utils.disableWarnings,
  extractVersion: utils.extractVersion,
  shimCreateObjectURL: utils.shimCreateObjectURL,
  detectBrowser: utils.detectBrowser.bind(utils)
};

},{}],25:[function(require,module,exports){
'use strict';

/** JSHint inline rules */
/* globals Strophe, $pres, $msg, $iq */

var chatUtils = require('./qbChatHelpers'),
    config = require('../../qbConfig'),
    Utils = require('../../qbUtils'),
    StreamManagement = require('../../plugins/streamManagement');

var unsupportedError = 'This function isn\'t supported outside of the browser (...yet)';

var XMPP;

/** create StropheJS or NodeXMPP connection object */
if (Utils.getEnv().browser) {
    var Connection = require('../../qbStrophe');

    Strophe.addNamespace('CARBONS', chatUtils.MARKERS.CARBONS);
    Strophe.addNamespace('CHAT_MARKERS', chatUtils.MARKERS.CHAT);
    Strophe.addNamespace('PRIVACY_LIST', chatUtils.MARKERS.PRIVACY);
    Strophe.addNamespace('CHAT_STATES', chatUtils.MARKERS.STATES);
} else if (Utils.getEnv().nativescript) {
    //XMPP = require('nativescript-xmpp-client');
} else if (Utils.getEnv().node)  {
    //XMPP = require('node-xmpp-client');
}


function ChatProxy(service) {
    var self = this;
    var originSendFunction;

    self.webrtcSignalingProcessor = null;

    /**
     * Browser env.
     * Uses by Strophe
     */
    if (Utils.getEnv().browser) {
        // strophe js
        self.connection = Connection();

        /** Add extension methods to track handlers for removal on reconnect */
        self.connection.XHandlerReferences = [];
        self.connection.XAddTrackedHandler = function (handler, ns, name, type, id, from, options) {
            self.connection.XHandlerReferences.push(self.connection.addHandler(handler, ns, name, type, id, from, options));
        };
        self.connection.XDeleteHandlers = function () {
            while (self.connection.XHandlerReferences.length) {
                self.connection.deleteHandler(self.connection.XHandlerReferences.pop());
            }
        };

        originSendFunction = self.connection.send;
        self.connection.send = function (stanza) {
            if (!self.connection.connected) {
                throw new chatUtils.ChatNotConnectedError('Chat is not connected');
            }
            originSendFunction.call(self.connection, stanza);
        };
    } else {
        // nativescript-xmpp-client
        if (Utils.getEnv().nativescript) {
            self.Client = new XMPP.Client({
                'websocket': {
                    'url': config.chatProtocol.websocket
                },
                'autostart': false
            });
        // node-xmpp-client
        } else if (Utils.getEnv().node) {
            self.Client = new XMPP({
                'autostart': false
            });
        }

        // override 'send' function to add some logs
        originSendFunction = self.Client.send;

        self.Client.send = function(stanza) {
            Utils.QBLog('[QBChat]', 'SENT:', stanza.toString());
            originSendFunction.call(self.Client, stanza);
        };

        self.nodeStanzasCallbacks = {};
    }

    this.service = service;

    // Check the chat connection (return true/false)
    this.isConnected = false;
    // Check the chat connecting state (return true/false)
    this._isConnecting = false;
    this._isLogout = false;

    this._checkConnectionTimer = undefined;
    this._pings = {};
    //
    this.helpers = new Helpers();
    //
    var options = {
        service: service,
        helpers: self.helpers,
        stropheClient: self.connection,
        xmppClient: self.Client,
        nodeStanzasCallbacks: self.nodeStanzasCallbacks
    };

    this.roster = new RosterProxy(options);
    this.privacylist = new PrivacyListProxy(options);
    this.muc = new MucProxy(options);
    //
    this.chatUtils = chatUtils;

    if (config.streamManagement.enable){
        if (config.chatProtocol.active === 2) {
            this.streamManagement = new StreamManagement(config.streamManagement);
            self._sentMessageCallback = function(messageLost, messageSent) {
                if (typeof self.onSentMessageCallback === 'function') {
                    if (messageSent) {
                        self.onSentMessageCallback(null, messageSent);
                    } else {
                        self.onSentMessageCallback(messageLost);
                    }
                }
            };
        } else {
            Utils.QBLog('[QBChat] StreamManagement:', 'BOSH protocol doesn\'t support stream management. Set WebSocket as the "chatProtocol" parameter to use this functionality. https://quickblox.com/developers/Javascript#Configuration');
        }
    }

    /**
     * User's callbacks (listener-functions):
     * - onMessageListener (userId, message)
     * - onMessageErrorListener (messageId, error)
     * - onSentMessageCallback (messageLost, messageSent)
     * - onMessageTypingListener (isTyping, userId, dialogId)
     * - onDeliveredStatusListener (messageId, dialogId, userId);
     * - onReadStatusListener (messageId, dialogId, userId);
     * - onSystemMessageListener (message)
     * - onKickOccupant(dialogId, initiatorUserId)
     * - onJoinOccupant(dialogId, userId)
     * - onLeaveOccupant(dialogId, userId)
     * - onContactListListener (userId, type)
     * - onSubscribeListener (userId)
     * - onConfirmSubscribeListener (userId)
     * - onRejectSubscribeListener (userId)
     * - onLastUserActivityListener (userId, seconds)
     * - onDisconnectedListener
     * - onReconnectListener
     */

    /**
     * You need to set onMessageListener function, to get messages. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Create_new_dialog More info.}
     * @function onMessageListener
     * @memberOf QB.chat
     * @param {Number} userId - Sender id
     * @param {Object} message - The message model object
     **/

    /**
     * Blocked entities receive an error when try to chat with a user in a 1-1 chat and receivie nothing in a group chat. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Blocked_user_attempts_to_communicate_with_user More info.}
     * @function onMessageErrorListener
     * @memberOf QB.chat
     * @param {Number} messageId - The message id
     * @param {Object} error - The error object
     **/

    /**
     * This feature defines an approach for ensuring is the message delivered to the server. This feature is unabled by default. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Sent_message More info.}
     * @function onSentMessageCallback
     * @memberOf QB.chat
     * @param {Object} messageLost - The lost message model object (Fail)
     * @param {Object} messageSent - The sent message model object (Success)
     **/

    /**
     * Show typing status in chat or groupchat. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Typing_status More info.}
     * @function onMessageTypingListener
     * @memberOf QB.chat
     * @param {Boolean} isTyping - Typing Status (true - typing, false - stop typing)
     * @param {Number} userId - Typing user id
     * @param {String} dialogId - The dialog id
     **/

    /**
     * Receive delivery confirmations {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Delivered_status More info.}
     * @function onDeliveredStatusListener
     * @memberOf QB.chat
     * @param {String} messageId - Delivered message id
     * @param {String} dialogId - The dialog id
     * @param {Number} userId - User id
     **/

    /**
     * You can manage 'read' notifications in chat. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Read_status More info.}
     * @function onReadStatusListener
     * @memberOf QB.chat
     * @param {String} messageId - Read message id
     * @param {String} dialogId - The dialog id
     * @param {Number} userId - User Id
     **/

    /**
     * These messages work over separated channel and won't be mixed with the regular chat messages. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#System_notifications More info.}
     * @function onSystemMessageListener
     * @memberOf QB.chat
     * @param {Object} message - The system message model object. Always have type: 'headline'
     **/

    /**
     * You will receive this callback when you are in group chat dialog(joined) and other user (chat dialog's creator) removed you from occupants.
     * @function onKickOccupant
     * @memberOf QB.chat
     * @param {String} dialogId - An id of chat dialog where you was kicked from.
     * @param {Number} initiatorUserId - An id of user who has kicked you.
     **/

    /**
     * You will receive this callback when some user joined group chat dialog you are in.
     * @function onJoinOccupant
     * @memberOf QB.chat
     * @param {String} dialogId - An id of chat dialog that user joined.
     * @param {Number} userId - An id of user who joined chat dialog.
     **/

    /**
     * You will receive this callback when some user left group chat dialog you are in.
     * @function onLeaveOccupant
     * @memberOf QB.chat
     * @param {String} dialogId - An id of chat dialog that user left.
     * @param {Number} userId - An id of user who left chat dialog.
     **/

    /**
     * Receive user status (online / offline). {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Roster_callbacks More info.}
     * @function onContactListListener
     * @memberOf QB.chat
     * @param {Number} userId - The sender ID
     * @param {String} type - If user leave the chat, type will be 'unavailable'
     **/

    /**
     * Receive subscription request. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Roster_callbacks More info.}
     * @function onSubscribeListener
     * @memberOf QB.chat
     * @param {Number} userId - The sender ID
     **/

    /**
     * Receive confirm request. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Roster_callbacks More info.}
     * @function onConfirmSubscribeListener
     * @memberOf QB.chat
     * @param {Number} userId - The sender ID
     **/

    /**
     * Receive reject request. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Roster_callbacks More info.}
     * @function onRejectSubscribeListener
     * @memberOf QB.chat
     * @param {Number} userId - The sender ID
     **/

    /**
     * Receive user's last activity (time ago). {@link https://xmpp.org/extensions/xep-0012.html More info.}
     * @function onLastUserActivityListener
     * @memberOf QB.chat
     * @param {Number} userId - The user's ID which last activity time we receive
     * @param {Number} seconds - Time ago (last activity in seconds or 0 if user online or undefined if user never registered in chat)
     */

    /**
     * Run after disconnect from chat. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Logout_from_Chat More info.}
     * @function onDisconnectedListener
     * @memberOf QB.chat
     **/

    /**
     * By default Javascript SDK reconnects automatically when connection to server is lost. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Reconnection More info.}
     * @function onReconnectListener
     * @memberOf QB.chat
     **/


    this._onMessage = function(stanza) {
        var from = chatUtils.getAttr(stanza, 'from'),
            to = chatUtils.getAttr(stanza, 'to'),
            type = chatUtils.getAttr(stanza, 'type'),
            messageId = chatUtils.getAttr(stanza, 'id'),
            markable = chatUtils.getElement(stanza, 'markable'),
            delivered = chatUtils.getElement(stanza, 'received'),
            read = chatUtils.getElement(stanza, 'displayed'),
            composing = chatUtils.getElement(stanza, 'composing'),
            paused = chatUtils.getElement(stanza, 'paused'),
            invite = chatUtils.getElement(stanza, 'invite'),
            delay = chatUtils.getElement(stanza, 'delay'),
            extraParams = chatUtils.getElement(stanza, 'extraParams'),
            bodyContent = chatUtils.getElementText(stanza, 'body'),
            forwarded = chatUtils.getElement(stanza, 'forwarded'),
            extraParamsParsed,
            recipientId,
            recipient,
            jid;

        if (Utils.getEnv().browser) {
            recipient = stanza.querySelector('forwarded') ? stanza.querySelector('forwarded').querySelector('message').getAttribute('to') : null;

            jid = self.connection.jid;
        } else {
            var forwardedMessage = forwarded ? chatUtils.getElement(forwarded, 'message') : null;
            recipient = forwardedMessage ? chatUtils.getAttr(forwardedMessage, 'to') : null;

            jid = self.Client.options.jid.user;
        }

        recipientId = recipient ? self.helpers.getIdFromNode(recipient) : null;

        var dialogId = type === 'groupchat' ? self.helpers.getDialogIdFromNode(from) : null,
            userId = type === 'groupchat' ? self.helpers.getIdFromResource(from) : self.helpers.getIdFromNode(from),
            marker = delivered || read || null;

        // ignore invite messages from MUC
        if (invite) return true;

        if(extraParams) {
            extraParamsParsed = chatUtils.parseExtraParams(extraParams);

            if(extraParamsParsed.dialogId){
                dialogId = extraParamsParsed.dialogId;
            }
        }

        if(composing || paused){
            if (typeof self.onMessageTypingListener === 'function' && (type === 'chat' || type === 'groupchat' || !delay)){
                Utils.safeCallbackCall(self.onMessageTypingListener, !!composing, userId, dialogId);
            }

            return true;
        }

        if (marker) {
            if (delivered) {
                if (typeof self.onDeliveredStatusListener === 'function' && type === 'chat') {
                    Utils.safeCallbackCall(self.onDeliveredStatusListener, chatUtils.getAttr(delivered, 'id'), dialogId, userId);
                }
            } else {
                if (typeof self.onReadStatusListener === 'function' && type === 'chat') {
                    Utils.safeCallbackCall(self.onReadStatusListener, chatUtils.getAttr(read, 'id'), dialogId, userId);
                }
            }

            return true;
        }

        // autosend 'received' status (ignore messages from yourself)
        if (markable && userId != self.helpers.getIdFromNode(jid)) {
            var autoSendReceiveStatusParams = {
                messageId: messageId,
                userId: userId,
                dialogId: dialogId
            };

            self.sendDeliveredStatus(autoSendReceiveStatusParams);
        }

        var message = {
            id: messageId,
            dialog_id: dialogId,
            recipient_id: recipientId,
            type: type,
            body: bodyContent,
            extension: extraParamsParsed ? extraParamsParsed.extension : null,
            delay: delay
        };

        if (markable) {
            message.markable = 1;
        }

        if (typeof self.onMessageListener === 'function' && (type === 'chat' || type === 'groupchat')){
            Utils.safeCallbackCall(self.onMessageListener, userId, message);
        }

        // we must return true to keep the handler alive
        // returning false would remove it after it finishes
        return true;
    };

    this._onPresence = function(stanza) {
        var from = chatUtils.getAttr(stanza, 'from'),
            to = chatUtils.getAttr(stanza, 'to'),
            id = chatUtils.getAttr(stanza, 'id'),
            type = chatUtils.getAttr(stanza, 'type'),
            currentUserId = self.helpers.getIdFromNode(self.helpers.userCurrentJid(Utils.getEnv().browser ? self.connection : self.Client)),
            x = chatUtils.getElement(stanza, 'x'),
            xXMLNS, status, statusCode, dialogId, userId;

        if(x){
            xXMLNS = chatUtils.getAttr(x, 'xmlns');
            status = chatUtils.getElement(x, 'status');
            if(status){
                statusCode = chatUtils.getAttr(status, 'code');
            }
        }

        // MUC presences go here
        if(xXMLNS && xXMLNS == "http://jabber.org/protocol/muc#user"){
            dialogId = self.helpers.getDialogIdFromNode(from);
            userId = self.helpers.getUserIdFromRoomJid(from);

            // KICK from dialog event
            if(status && statusCode == "301"){
                if (typeof self.onKickOccupant === 'function'){
                    var actorElement = chatUtils.getElement(chatUtils.getElement(x, 'item'), 'actor');
                    var initiatorUserJid = chatUtils.getAttr(actorElement, 'jid');
                    Utils.safeCallbackCall(self.onKickOccupant,
                        dialogId,
                        self.helpers.getIdFromNode(initiatorUserJid));
                }

                delete self.muc.joinedRooms[self.helpers.getRoomJidFromRoomFullJid(from)];

                return true;

                // Occupants JOIN/LEAVE events
            }else if(!status){
                if(userId != currentUserId){
                    // Leave
                    if(type && type === 'unavailable'){
                        if (typeof self.onLeaveOccupant === 'function'){
                            Utils.safeCallbackCall(self.onLeaveOccupant, dialogId, parseInt(userId));
                        }
                        return true;
                        // Join
                    }else{
                        if(typeof self.onJoinOccupant === 'function'){
                            Utils.safeCallbackCall(self.onJoinOccupant, dialogId, parseInt(userId));
                        }
                        return true;
                    }

                }
            }
        }

        if(!Utils.getEnv().browser) {
            /** MUC */
            if(xXMLNS){
                if(xXMLNS == "http://jabber.org/protocol/muc#user"){
                    /**
                     * if you make 'leave' from dialog
                     * stanza will be contains type="unavailable"
                     */
                    if(type && type === 'unavailable'){
                        /** LEAVE from dialog */
                        if(status && statusCode == "110"){
                            if(typeof self.nodeStanzasCallbacks['muc:leave'] === 'function') {
                                Utils.safeCallbackCall(self.nodeStanzasCallbacks['muc:leave'], null);
                            }
                        }

                        return true;
                    }

                    /** JOIN to dialog success */
                    if(id.endsWith(":join") && status && statusCode == "110"){
                        if(typeof self.nodeStanzasCallbacks[id] === 'function') {
                            self.nodeStanzasCallbacks[id](stanza);
                        }

                        return true;
                    }

                    // an error
                } else if(type && type === 'error' && xXMLNS == "http://jabber.org/protocol/muc"){
                    /** JOIN to dialog error */
                    if(id.endsWith(":join")){
                        if(typeof self.nodeStanzasCallbacks[id] === 'function') {
                            self.nodeStanzasCallbacks[id](stanza);
                        }
                    }

                    return true;
                }
            }
        }


        // ROSTER presences go here

        userId = self.helpers.getIdFromNode(from);

        if (!type) {
            if (typeof self.onContactListListener === 'function' && self.roster.contacts[userId] && self.roster.contacts[userId].subscription !== 'none'){
                Utils.safeCallbackCall(self.onContactListListener, userId);
            }
        } else {
            switch (type) {
                case 'subscribe':
                    if (self.roster.contacts[userId] && self.roster.contacts[userId].subscription === 'to') {
                        self.roster.contacts[userId] = {
                            subscription: 'both',
                            ask: null
                        };

                        self.roster._sendSubscriptionPresence({
                            jid: from,
                            type: 'subscribed'
                        });
                    } else {
                        if (typeof self.onSubscribeListener === 'function') {
                            Utils.safeCallbackCall(self.onSubscribeListener, userId);
                        }
                    }
                    break;
                case 'subscribed':
                    if (self.roster.contacts[userId] && self.roster.contacts[userId].subscription === 'from') {
                        self.roster.contacts[userId] = {
                            subscription: 'both',
                            ask: null
                        };
                    } else {
                        self.roster.contacts[userId] = {
                            subscription: 'to',
                            ask: null
                        };

                        if (typeof self.onConfirmSubscribeListener === 'function'){
                            Utils.safeCallbackCall(self.onConfirmSubscribeListener, userId);
                        }
                    }
                    break;
                case 'unsubscribed':
                    self.roster.contacts[userId] = {
                        subscription: 'none',
                        ask: null
                    };

                    if (typeof self.onRejectSubscribeListener === 'function') {
                        Utils.safeCallbackCall(self.onRejectSubscribeListener, userId);
                    }

                    break;
                case 'unsubscribe':
                    self.roster.contacts[userId] = {
                        subscription: 'to',
                        ask: null
                    };

                    break;
                case 'unavailable':
                    if (typeof self.onContactListListener === 'function' && self.roster.contacts[userId] && self.roster.contacts[userId].subscription !== 'none') {
                        Utils.safeCallbackCall(self.onContactListListener, userId, type);
                    }

                    // send initial presence if one of client (instance) goes offline
                    if (userId === currentUserId) {
                        if(Utils.getEnv().browser){
                            self.connection.send($pres());
                        } else {
                            self.Client.send(chatUtils.createStanza(XMPP.Stanza, null,'presence'));
                        }
                    }

                    break;
            }
        }

        // we must return true to keep the handler alive
        // returning false would remove it after it finishes
        return true;
    };

    this._onIQ = function(stanza) {
        var stanzaId = chatUtils.getAttr(stanza, 'id');
        var isLastActivity = stanzaId.indexOf('lastActivity') > -1;
        var isPong = stanzaId.indexOf('ping') > -1;
        var ping = chatUtils.getElement(stanza, 'ping');
        var type = chatUtils.getAttr(stanza, 'type');
        var from = chatUtils.getAttr(stanza, 'from');
        var userId = from ?
            self.helpers.getIdFromNode(from) :
            null;

        if (typeof self.onLastUserActivityListener === 'function' && isLastActivity) {
            var query = chatUtils.getElement(stanza, 'query'),
                error = chatUtils.getElement(stanza, 'error'),
                seconds = error ? undefined : +chatUtils.getAttr(query, 'seconds');

            Utils.safeCallbackCall(self.onLastUserActivityListener, userId, seconds);
        }
        if ((ping || isPong) && type) {
            if (type === 'get' && ping && self.isConnected) {
                // pong
                var builder = Utils.getEnv().browser ? $iq : XMPP.Stanza;
                var pongParams = {
                    from: self.helpers.getUserCurrentJid(),
                    id: stanzaId,
                    to: from,
                    type: 'result'
                };
                var pongStanza = chatUtils.createStanza(builder, pongParams, 'iq');
                if(Utils.getEnv().browser) {
                    self.connection.send(pongStanza);
                } else {
                    self.Client.send(pongStanza);
                }
            } else {
                var pingRequest = self._pings[stanzaId];
                if (pingRequest) {
                    if (pingRequest.callback) {
                        pingRequest.callback(null);
                    }
                    if (pingRequest.interval) {
                        clearInterval(pingRequest.interval);
                    }
                    self._pings[stanzaId] = undefined;
                    delete self._pings[stanzaId];
                }
            }
        }

        if (!Utils.getEnv().browser) {
            if (self.nodeStanzasCallbacks[stanzaId]) {
                Utils.safeCallbackCall(self.nodeStanzasCallbacks[stanzaId], stanza);
                delete self.nodeStanzasCallbacks[stanzaId];
            }
        }

        return true;
    };

    this._onSystemMessageListener = function(stanza) {
        var from = chatUtils.getAttr(stanza, 'from'),
            to = chatUtils.getAttr(stanza, 'to'),
            messageId = chatUtils.getAttr(stanza, 'id'),
            extraParams = chatUtils.getElement(stanza, 'extraParams'),
            userId = self.helpers.getIdFromNode(from),
            delay = chatUtils.getElement(stanza, 'delay'),
            moduleIdentifier = chatUtils.getElementText(extraParams, 'moduleIdentifier'),
            bodyContent = chatUtils.getElementText(stanza, 'body'),
            extraParamsParsed = chatUtils.parseExtraParams(extraParams),
            message;

        if (moduleIdentifier === 'SystemNotifications' && typeof self.onSystemMessageListener === 'function') {
            message = {
                id: messageId,
                userId: userId,
                body: bodyContent,
                extension: extraParamsParsed.extension
            };

            Utils.safeCallbackCall(self.onSystemMessageListener, message);
        } else if(self.webrtcSignalingProcessor && !delay && moduleIdentifier === 'WebRTCVideoChat'){
            self.webrtcSignalingProcessor._onMessage(from, extraParams, delay, userId, extraParamsParsed.extension);
        }

        /**
         * we must return true to keep the handler alive
         * returning false would remove it after it finishes
         */
        return true;
    };

    this._onMessageErrorListener = function(stanza) {
        // <error code="503" type="cancel">
        //   <service-unavailable xmlns="urn:ietf:params:xml:ns:xmpp-stanzas"/>
        //   <text xmlns="urn:ietf:params:xml:ns:xmpp-stanzas" xml:lang="en">Service not available.</text>
        // </error>

        var messageId = chatUtils.getAttr(stanza, 'id');
        var error = chatUtils.getErrorFromXMLNode(stanza);

        // fire 'onMessageErrorListener'
        //
        if (typeof self.onMessageErrorListener === 'function') {
            Utils.safeCallbackCall(self.onMessageErrorListener, messageId, error);
        }

        // we must return true to keep the handler alive
        // returning false would remove it after it finishes
        return true;
    };
}

/* Chat module: Core
 ----------------------------------------------------------------------------- */
ChatProxy.prototype = {

    /**
     * self.connection to the chat. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Login_to_Chat More info.}
     * @memberof QB.chat
     * @param {Object} params - Connect to the chat parameters
     * @param {Number} params.userId - Connect to the chat by user id (use instead params.email and params.jid)
     * @param {String} params.jid - Connect to the chat by user jid (use instead params.userId and params.email)
     * @param {String} params.email - Connect to the chat by user's email (use instead params.userId and params.jid)
     * @param {String} params.password - The user's password or session token
     * @param {chatConnectCallback} callback - The chatConnectCallback callback
     * */
    connect: function(params, callback) {
        /**
         * This callback Returns error or contact list.
         * @callback chatConnectCallback
         * @param {Object} error - The error object
         * @param {(Object|Boolean)} response - Object of subscribed users (roster) or empty body.
         * */
        Utils.QBLog('[QBChat]', 'Connect with parameters ' + JSON.stringify(params));

        var self = this,
            userJid = chatUtils.buildUserJid(params),
            isInitialConnect = typeof callback === 'function',
            err;

        if (self._isConnecting) {
            err = Utils.getError(422, 'Status.REJECT - The connection is still in the Status.CONNECTING state', 'QBChat');

            if (isInitialConnect) {
                callback(err, null);
            }

            return;
        }

        if (self.isConnected) {
            Utils.QBLog('[QBChat]', 'Status.CONNECTED - You are already connected');

            if (isInitialConnect) {
                callback(null, self.roster.contacts);
            }

            return;
        }

        self._isConnecting = true;
        self._isLogout = false;

        /** Connect for browser env. */
        if (Utils.getEnv().browser) {
            self.connection.connect(userJid, params.password, function(status) {
                switch (status) {
                    case Strophe.Status.ERROR:
                        self.isConnected = false;
                        self._isConnecting = false;

                        err = Utils.getError(422, 'Status.ERROR - An error has occurred', 'QBChat');

                        if (isInitialConnect) {
                            callback(err, null);
                        }

                        break;
                    case Strophe.Status.CONNFAIL:
                        self.isConnected = false;
                        self._isConnecting = false;
                        
                        err = Utils.getError(422, 'Status.CONNFAIL - The connection attempt failed', 'QBChat');
                        
                        if (isInitialConnect) {
                            callback(err, null);
                        }
                        
                        break;
                    case Strophe.Status.AUTHENTICATING:
                        Utils.QBLog('[QBChat]', 'Status.AUTHENTICATING');

                        break;
                    case Strophe.Status.AUTHFAIL:
                        self.isConnected = false;
                        self._isConnecting = false;
                        
                        err = Utils.getError(401, 'Status.AUTHFAIL - The authentication attempt failed', 'QBChat');
                        
                        if (isInitialConnect) {
                            callback(err, null);
                        }
                        
                        if(!self.isConnected && typeof self.onReconnectFailedListener === 'function'){
                            Utils.safeCallbackCall(self.onReconnectFailedListener, err);
                        }
                        
                        break;
                    case Strophe.Status.CONNECTING:
                        Utils.QBLog('[QBChat]', 'Status.CONNECTING', '(Chat Protocol - ' + (config.chatProtocol.active === 1 ? 'BOSH' : 'WebSocket' + ')'));
            
                        break;
                    case Strophe.Status.CONNECTED:
                        // Remove any handlers that might exist from a previous connection via
                        // extension method added to the connection on initialization in qbMain.
                        // NOTE: streamManagement also adds handlers, so do this first.
                        self.connection.XDeleteHandlers();
                        
                        self.connection.XAddTrackedHandler(self._onMessage, null, 'message', 'chat');
                        self.connection.XAddTrackedHandler(self._onMessage, null, 'message', 'groupchat');
                        self.connection.XAddTrackedHandler(self._onPresence, null, 'presence');
                        self.connection.XAddTrackedHandler(self._onIQ, null, 'iq');
                        self.connection.XAddTrackedHandler(self._onSystemMessageListener, null, 'message', 'headline');
                        self.connection.XAddTrackedHandler(self._onMessageErrorListener, null, 'message', 'error');
                    
                        self._postConnectActions(function(roster) {
                            callback(null, roster);
                        }, isInitialConnect);

                        break;
                    case Strophe.Status.DISCONNECTING:
                        Utils.QBLog('[QBChat]', 'Status.DISCONNECTING');
                        break;
                    case Strophe.Status.DISCONNECTED:
                        Utils.QBLog('[QBChat]', 'Status.DISCONNECTED at ' + chatUtils.getLocalTime());

                        // fire 'onDisconnectedListener' only once
                        if (self.isConnected && typeof self.onDisconnectedListener === 'function'){
                            Utils.safeCallbackCall(self.onDisconnectedListener);
                        }

                        self.isConnected = false;
                        self._isConnecting = false;

                        // reconnect to chat and enable check connection
                        self._establishConnection(params);

                        break;
                    case Strophe.Status.ATTACHED:
                        Utils.QBLog('[QBChat]', 'Status.ATTACHED');
                        break;
                }
            });
        }

        /** connect for node */
        if(!Utils.getEnv().browser) {
            // Remove all connection handlers exist from a previous connection
            self.Client.removeAllListeners();

            self.Client.on('connect', function() {
                Utils.QBLog('[QBChat]', 'Status.CONNECTING', '(Chat Protocol - ' + (config.chatProtocol.active === 1 ? 'BOSH' : 'WebSocket' + ')'));
            });

            self.Client.on('auth', function() {
                Utils.QBLog('[QBChat]', 'Status.AUTHENTICATING');
            });
                    
            self.Client.on('online', function() {
                self._postConnectActions(function(roster) {
                    callback(null, roster);
                }, isInitialConnect);
            });
    
            self.Client.on('stanza', function(stanza) {
                Utils.QBLog('[QBChat] RECV:', stanza.toString());
                /**
                 * Detect typeof incoming stanza
                 * and fire the Listener
                 */
                if (stanza.is('presence')) {
                    self._onPresence(stanza);
                } else if (stanza.is('iq')) {
                    self._onIQ(stanza);
                } else if(stanza.is('message')) {
                    if (stanza.attrs.type === 'headline') {
                        self._onSystemMessageListener(stanza);
                    } else if(stanza.attrs.type === 'error') {
                        self._onMessageErrorListener(stanza);
                    } else {
                        self._onMessage(stanza);
                    }
                }
            });
            
            self.Client.on('disconnect', function() {
                Utils.QBLog('[QBChat]', 'Status.DISCONNECTED - ' + chatUtils.getLocalTime());

                if (typeof self.onDisconnectedListener === 'function') {
                    Utils.safeCallbackCall(self.onDisconnectedListener);
                }
                
                self.isConnected = false;
                self._isConnecting = false;

                // reconnect to chat and enable check connection
                self._establishConnection(params);
            });
            
            self.Client.on('error', function() {
                Utils.QBLog('[QBChat]', 'Status.ERROR - ' + chatUtils.getLocalTime());
                err = Utils.getError(422, 'Status.ERROR - An error has occurred', 'QBChat');
    
                if (isInitialConnect) {
                    callback(err, null);
                }

                self.isConnected = false;
                self._isConnecting = false;
            });

            self.Client.on('end', function() {
                self.Client.removeAllListeners();                
            });

            self.Client.options.jid = userJid;
            self.Client.options.password = params.password;
            self.Client.connect();
        }
    },

    /**
     * Actions after the connection is established
     * 
     * - enable stream management (the configuration setting);
     * - save user's JID;
     * - enable carbons;
     * - get and storage the user's roster (if the initial connect);
     * - recover the joined rooms and fire 'onReconnectListener' (if the reconnect);
     * - send initial presence to the chat server.
     */
    _postConnectActions: function(callback, isInitialConnect) {
        Utils.QBLog('[QBChat]', 'Status.CONNECTED at ' + chatUtils.getLocalTime());

        var self = this,
            xmppClient = Utils.getEnv().browser ? self.connection : self.Client,
            presence = Utils.getEnv().browser ? $pres() : chatUtils.createStanza(XMPP.Stanza, null, 'presence');
                
        if (config.streamManagement.enable && config.chatProtocol.active === 2) {
            self.streamManagement.enable(self.connection, null);
            self.streamManagement.sentMessageCallback = self._sentMessageCallback;
        }

        self.helpers.setUserCurrentJid(self.helpers.userCurrentJid(xmppClient));
        
        self.isConnected = true;
        self._isConnecting = false;

        self._enableCarbons();

        if (isInitialConnect) {
            self.roster.get(function(contacts) {
                xmppClient.send(presence);

                self.roster.contacts = contacts;
                callback(self.roster.contacts);
            });
        } else {
            var rooms = Object.keys(self.muc.joinedRooms);
            
            xmppClient.send(presence);

            Utils.QBLog('[QBChat]', 'Re-joining ' + rooms.length + " rooms...");

            for (var i = 0, len = rooms.length; i < len; i++) {
                self.muc.join(rooms[i]);
            }

            if (typeof self.onReconnectListener === 'function') {
                Utils.safeCallbackCall(self.onReconnectListener);
            }
        }
    },

    _establishConnection: function(params) {
        var self = this;
        
        if (self._isLogout || self._checkConnectionTimer) {
            return;
        }

        var _connect = function() {
            if (!self.isConnected && !self._isConnecting) {
                self.connect(params);
            } else {
                clearInterval(self._checkConnectionTimer);
                self._checkConnectionTimer = undefined;
            }
        };

        _connect();

        self._checkConnectionTimer = setInterval(function() {
            _connect();
        }, config.chatReconnectionTimeInterval * 1000);
    },

    /**
     * Send message to 1 to 1 or group dialog. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Chat_in_dialog More info.}
     * @memberof QB.chat
     * @param {String | Number} jid_or_user_id - Use opponent id or jid for 1 to 1 chat, and room jid for group chat.
     * @param {Object} message - The message object.
     * @returns {String} messageId - The current message id (was generated by SDK)
     * */
    send: function(jid_or_user_id, message) {
        var self = this,
            builder = Utils.getEnv().browser ? $msg : XMPP.Stanza;

        var paramsCreateMsg = {
            from: self.helpers.getUserCurrentJid(),
            to: this.helpers.jidOrUserId(jid_or_user_id),
            type: message.type ? message.type : 'chat',
            id: message.id ? message.id : Utils.getBsonObjectId()
        };

        var stanza = chatUtils.createStanza(builder, paramsCreateMsg);

        if (message.body) {
            stanza.c('body', {
                xmlns: chatUtils.MARKERS.CLIENT,
            }).t(message.body).up();
        }

        if (message.markable) {
            stanza.c('markable', {
                xmlns: chatUtils.MARKERS.CHAT
            }).up();
        }

        if (message.extension) {
            stanza.c('extraParams', {
                xmlns: chatUtils.MARKERS.CLIENT
            });

            stanza = chatUtils.filledExtraParams(stanza, message.extension);
        }

        if(Utils.getEnv().browser) {
            if(config.streamManagement.enable){
                message.id = paramsCreateMsg.id;
                message.jid_or_user_id = jid_or_user_id;
                self.connection.send(stanza, message);
            } else {
                self.connection.send(stanza);
            }
        } else {
            if(config.streamManagement.enable){
                message.id = paramsCreateMsg.id;
                message.jid_or_user_id = jid_or_user_id;
                self.Client.send(stanza, message);
            } else {
                self.Client.send(stanza);
            }

        }

        return paramsCreateMsg.id;
    },

    /**
     * Send system message (system notification) to 1 to 1 or group dialog. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#System_notifications More info.}
     * @memberof QB.chat
     * @param {String | Number} jid_or_user_id - Use opponent id or jid for 1 to 1 chat, and room jid for group chat.
     * @param {Object} message - The message object.
     * @returns {String} messageId - The current message id (was generated by SDK)
     * */
    sendSystemMessage: function(jid_or_user_id, message) {
        var self = this,
            builder = Utils.getEnv().browser ? $msg : XMPP.Stanza,
            paramsCreateMsg = {
                type: 'headline',
                id: message.id ? message.id : Utils.getBsonObjectId(),
                to: this.helpers.jidOrUserId(jid_or_user_id)
            };

        var stanza = chatUtils.createStanza(builder, paramsCreateMsg);

        if (message.body) {
            stanza.c('body', {
                xmlns: chatUtils.MARKERS.CLIENT,
            }).t(message.body).up();
        }

        if(Utils.getEnv().browser) {
            // custom parameters
            if (message.extension) {
                stanza.c('extraParams', {
                    xmlns: chatUtils.MARKERS.CLIENT
                }).c('moduleIdentifier').t('SystemNotifications').up();

                stanza = chatUtils.filledExtraParams(stanza, message.extension);
            }

            self.connection.send(stanza);
        } else {
            if (message.extension) {
                stanza.c('extraParams',  {
                    xmlns: chatUtils.MARKERS.CLIENT
                }).c('moduleIdentifier').t('SystemNotifications');

                stanza = chatUtils.filledExtraParams(stanza, message.extension);
            }

            self.Client.send(stanza);
        }

        return paramsCreateMsg.id;
    },

    /**
     * Send is typing status. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Typing_status More info.}
     * @memberof QB.chat
     * @param {String | Number} jid_or_user_id - Use opponent id or jid for 1 to 1 chat, and room jid for group chat.
     * */
    sendIsTypingStatus: function(jid_or_user_id) {
        var self = this,
            stanzaParams = {
                from: self.helpers.getUserCurrentJid(),
                to: this.helpers.jidOrUserId(jid_or_user_id),
                type: this.helpers.typeChat(jid_or_user_id)
            },
            builder = Utils.getEnv().browser ? $msg : XMPP.Stanza;

        var stanza = chatUtils.createStanza(builder, stanzaParams);

        stanza.c('composing', {
            xmlns: chatUtils.MARKERS.STATES
        });

        if(Utils.getEnv().browser){
            self.connection.send(stanza);
        } else {
            self.Client.send(stanza);
        }
    },

    /**
     * Send is stop typing status. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Typing_status More info.}
     * @memberof QB.chat
     * @param {String | Number} jid_or_user_id - Use opponent id or jid for 1 to 1 chat, and room jid for group chat.
     * */
    sendIsStopTypingStatus: function(jid_or_user_id) {
        var self = this,
            stanzaParams = {
                from: self.helpers.getUserCurrentJid(),
                to: this.helpers.jidOrUserId(jid_or_user_id),
                type: this.helpers.typeChat(jid_or_user_id)
            },
            builder = Utils.getEnv().browser ? $msg : XMPP.Stanza;

        var stanza = chatUtils.createStanza(builder, stanzaParams);

        stanza.c('paused', {
            xmlns: chatUtils.MARKERS.STATES
        });

        if(Utils.getEnv().browser){
            self.connection.send(stanza);
        } else {
            self.Client.send(stanza);
        }
    },

    /**
     * Send is delivered status. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Delivered_status More info.}
     * @memberof QB.chats
     * @param {Object} params - Object of parameters
     * @param {Number} params.userId - The receiver id
     * @param {Number} params.messageId - The delivered message id
     * @param {Number} params.dialogId - The dialog id
     * */
    sendDeliveredStatus: function(params) {
        var self = this,
            stanzaParams = {
                type: 'chat',
                from: self.helpers.getUserCurrentJid(),
                id: Utils.getBsonObjectId(),
                to: this.helpers.jidOrUserId(params.userId)
            },
            builder = Utils.getEnv().browser ? $msg : XMPP.Stanza;

        var stanza = chatUtils.createStanza(builder, stanzaParams);

        stanza.c('received', {
            xmlns: chatUtils.MARKERS.MARKERS,
            id: params.messageId
        }).up();

        stanza.c('extraParams', {
            xmlns: chatUtils.MARKERS.CLIENT
        }).c('dialog_id').t(params.dialogId);

        if(Utils.getEnv().browser) {
            self.connection.send(stanza);
        } else {
            self.Client.send(stanza);
        }
    },

    /**
     * Send is read status. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Read_status More info.}
     * @memberof QB.chat
     * @param {Object} params - Object of parameters
     * @param {Number} params.userId - The receiver id
     * @param {Number} params.messageId - The delivered message id
     * @param {Number} params.dialogId - The dialog id
     * */
    sendReadStatus: function(params) {
        var self = this,
            stanzaParams = {
                type: 'chat',
                from: self.helpers.getUserCurrentJid(),
                to: this.helpers.jidOrUserId(params.userId),
                id: Utils.getBsonObjectId()
            },
            builder = Utils.getEnv().browser ? $msg : XMPP.Stanza;

        var stanza = chatUtils.createStanza(builder, stanzaParams);

        stanza.c('displayed', {
            xmlns: chatUtils.MARKERS.MARKERS,
            id: params.messageId
        }).up();

        stanza.c('extraParams', {
            xmlns: chatUtils.MARKERS.CLIENT
        }).c('dialog_id').t(params.dialogId);

        if(Utils.getEnv().browser) {
            self.connection.send(stanza);
        } else {
            self.Client.send(stanza);
        }
    },

    /**
     * Send query to get last user activity by QB.chat.onLastUserActivityListener(userId, seconds). {@link https://xmpp.org/extensions/xep-0012.html More info.}
     * @memberof QB.chat
     * @param {(Number|String)} jid_or_user_id - The user id or jid, that the last activity we want to know
     * */
    getLastUserActivity: function(jid_or_user_id) {
        var iqParams,
            builder,
            iq;

        iqParams = {
            'from': this.helpers.getUserCurrentJid(),
            'id': this.helpers.getUniqueId('lastActivity'),
            'to': this.helpers.jidOrUserId(jid_or_user_id),
            'type': 'get'
        };

        builder = Utils.getEnv().browser ? $iq : XMPP.Stanza;

        iq = chatUtils.createStanza(builder, iqParams, 'iq');

        iq.c('query', {
            'xmlns': chatUtils.MARKERS.LAST
        });

        if (Utils.getEnv().browser) {
            this.connection.sendIQ(iq);
        } else {
            this.Client.send(iq);
        }
    },

    ping: function (jid_or_user_id, callback) {
        var self = this;
        var id = this.helpers.getUniqueId('ping');
        var builder = Utils.getEnv().browser ? $iq : XMPP.Stanza;
        var to;
        var _callback;
        var stanza;
        if ((typeof jid_or_user_id === 'string' ||
            typeof jid_or_user_id === 'number') &&
            typeof callback === 'function') {
            to = this.helpers.jidOrUserId(jid_or_user_id);
            _callback = callback;
        } else {
            if (typeof jid_or_user_id === 'function' && !callback) {
                to = config.endpoints.chat;
                _callback = jid_or_user_id;
            } else {
                throw new Error('Invalid arguments provided. Either userId/jid (number/string) and callback or only callback should be provided.');
            }
        }

        var iqParams = {
            from: this.helpers.getUserCurrentJid(),
            id: id,
            to: to,
            type: 'get'
        };
        stanza = chatUtils.createStanza(builder, iqParams, 'iq');
        stanza.c('ping', { xmlns: "urn:xmpp:ping" });

        var noAnswer = function () {
            _callback('No answer');
            self._pings[id] = undefined;
            delete self._pings[id];
        };
        if (Utils.getEnv().browser) {
            this.connection.send(stanza);
        } else {
            this.Client.send(stanza);
        }
        this._pings[id] = {
            callback: _callback,
            interval: setTimeout(noAnswer, config.pingTimeout * 1000)
        };
        return id;
    },

    /**
     * Logout from the Chat. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Logout_from_Chat More info.}
     * @memberof QB.chat
     * */
    disconnect: function() {
        clearInterval(this._checkConnectionTimer);
        this._checkConnectionTimer = undefined;
        this.muc.joinedRooms = {};
        this._isLogout = true;
        this.helpers.setUserCurrentJid('');

        if (Utils.getEnv().browser) {
            this.connection.flush();
            this.connection.disconnect();
            this.connection.reset();
        } else {
            this.Client.end();
        }
    },

    addListener: function(params, callback) {
        Utils.QBLog('[Deprecated!]', 'Avoid using it, this feature will be removed in future version.');

        if(!Utils.getEnv().browser) {
            throw new Error(unsupportedError);
        }

        return this.connection.XAddTrackedHandler(handler, null, params.name || null, params.type || null, params.id || null, params.from || null);

        function handler() {
            callback();
            // if 'false' - a handler will be performed only once
            return params.live !== false;
        }
    },

    deleteListener: function(ref) {
        Utils.QBLog('[Deprecated!]', 'Avoid using it, this feature will be removed in future version.');

        if(!Utils.getEnv().browser) {
            throw new Error(unsupportedError);
        }

        this.connection.deleteHandler(ref);
    },

    /**
     * Carbons XEP [http://xmpp.org/extensions/xep-0280.html]
     */
    _enableCarbons: function(cb) {
        var self = this,
            carbonParams = {
                type: 'set',
                from: self.helpers.getUserCurrentJid(),
                id: chatUtils.getUniqueId('enableCarbons')
            },
            builder = Utils.getEnv().browser ? $iq : XMPP.Stanza;

        var iq = chatUtils.createStanza(builder, carbonParams, 'iq');

        iq.c('enable', {
            xmlns: chatUtils.MARKERS.CARBONS
        });

        if (Utils.getEnv().browser) {
            self.connection.sendIQ(iq);
        } else {
            self.Client.send(iq);
        }
    }
};

/* Chat module: Roster
 *
 * Integration of Roster Items and Presence Subscriptions
 * http://xmpp.org/rfcs/rfc3921.html#int
 * default - Mutual Subscription
 *
 ----------------------------------------------------------------------------- */
/**
 * @namespace QB.chat.roster
 **/
function RosterProxy(options) {
    this.service = options.service;
    this.helpers = options.helpers;
    this.connection = options.stropheClient;
    this.Client = options.xmppClient;
    this.nodeStanzasCallbacks = options.nodeStanzasCallbacks;
    //
    this.contacts = {};
}

RosterProxy.prototype = {

    /**
     * Receive contact list. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Contact_List More info.}
     * @memberof QB.chat.roster
     * @param {getRosterCallback} callback - The callback function.
     * */
    get: function(callback) {
        /**
         * This callback Return contact list.
         * @callback getRosterCallback
         * @param {Object} roster - Object of subscribed users.
         * */

        var self = this,
            items, userId, contacts = {},
            iqParams = {
                'type': 'get',
                'from': self.helpers.getUserCurrentJid(),
                'id': chatUtils.getUniqueId('getRoster')
            },
            builder = Utils.getEnv().browser ? $iq : XMPP.Stanza;

        var iq = chatUtils.createStanza(builder, iqParams, 'iq');

        function _getItems(stanza) {
            if(Utils.getEnv().browser) {
                return stanza.getElementsByTagName('item');
            } else {
                return stanza.getChild('query').children;
            }
        }

        function _callbackWrap(stanza) {
            var items = _getItems(stanza);
            /** TODO */
            for (var i = 0, len = items.length; i < len; i++) {
                var userId = self.helpers.getIdFromNode( chatUtils.getAttr(items[i], 'jid') ),
                    ask = chatUtils.getAttr(items[i], 'ask'),
                    subscription = chatUtils.getAttr(items[i], 'subscription');

                contacts[userId] = {
                    subscription: subscription,
                    ask: ask || null
                };
            }

            callback(contacts);
        }

        iq.c('query', {
            xmlns: chatUtils.MARKERS.ROSTER
        });

        if(Utils.getEnv().browser) {
            self.connection.sendIQ(iq, _callbackWrap);
        } else {
            self.nodeStanzasCallbacks[iqParams.id] = _callbackWrap;
            self.Client.send(iq);
        }
    },

    /**
     * Add users to contact list. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Add_users More info.}
     * @memberof QB.chat.roster
     * @param {String | Number} jidOrUserId - Use opponent id for 1 to 1 chat, and jid for group chat.
     * @param {addRosterCallback} callback - The callback function.
     * */
    add: function(jidOrUserId, callback) {

        /**
         * Callback for QB.chat.roster.add(). Run without parameters.
         * @callback addRosterCallback
         * */
        var self = this;
        var userJid = this.helpers.jidOrUserId(jidOrUserId);
        var userId = this.helpers.getIdFromNode(userJid).toString();

        self.contacts[userId] = {
            subscription: 'none',
            ask: 'subscribe'
        };

        self._sendSubscriptionPresence({
            jid: userJid,
            type: 'subscribe'
        });

        if (typeof callback === 'function') {
            callback();
        }
    },

    /**
     * Confirm subscription with some user. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Confirm_subscription_request More info.}
     * @memberof QB.chat.roster
     * @param {String | Number} jidOrUserId - Use opponent id for 1 to 1 chat, and jid for group chat.
     * @param {confirmRosterCallback} callback - The callback function.
     * */
    confirm: function(jidOrUserId, callback) {

        /**
         * Callback for QB.chat.roster.confirm(). Run without parameters.
         * @callback confirmRosterCallback
         * */
        var self = this;
        var userJid = this.helpers.jidOrUserId(jidOrUserId);
        var userId = this.helpers.getIdFromNode(userJid).toString();

        self.contacts[userId] = {
            subscription: 'from',
            ask: 'subscribe'
        };

        self._sendSubscriptionPresence({
            jid: userJid,
            type: 'subscribed'
        });

        self._sendSubscriptionPresence({
            jid: userJid,
            type: 'subscribe'
        });


        if (typeof callback === 'function') {
            callback();
        }
    },

    /**
     * Reject subscription with some user. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Reject_subscription_request More info.}
     * @memberof QB.chat.roster
     * @param {String | Number} jidOrUserId - Use opponent id for 1 to 1 chat, and jid for group chat.
     * @param {rejectRosterCallback} callback - The callback function.
     * */
    reject: function(jidOrUserId, callback) {

        /**
         * Callback for QB.chat.roster.reject(). Run without parameters.
         * @callback rejectRosterCallback
         * */
        var self = this;
        var userJid = this.helpers.jidOrUserId(jidOrUserId);
        var userId = this.helpers.getIdFromNode(userJid).toString();

        self.contacts[userId] = {
            subscription: 'none',
            ask: null
        };

        self._sendSubscriptionPresence({
            jid: userJid,
            type: 'unsubscribed'
        });

        if (typeof callback === 'function') {
            callback();
        }
    },


    /**
     * Remove subscription with some user from your contact list. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Remove_users More info.}
     * @memberof QB.chat.roster
     * @param {String | Number} jidOrUserId - Use opponent id for 1 to 1 chat, and jid for group chat.
     * @param {removeRosterCallback} callback - The callback function.
     * */
    remove: function(jidOrUserId, callback) {

        /**
         * Callback for QB.chat.roster.remove(). Run without parameters.
         * @callback removeRosterCallback
         * */
        var self = this,
            userJid = this.helpers.jidOrUserId(jidOrUserId),
            userId = this.helpers.getIdFromNode(userJid);

        var iqParams = {
            'type': 'set',
            'from': self.connection ? self.connection.jid : self.Client.jid.user,
            'id': chatUtils.getUniqueId('getRoster')
        };

        var builder = Utils.getEnv().browser ? $iq : XMPP.Stanza,
            iq = chatUtils.createStanza(builder, iqParams, 'iq');

        function _callbackWrap() {
            delete self.contacts[userId];

            if (typeof callback === 'function') {
                callback();
            }
        }

        iq.c('query', {
            xmlns: chatUtils.MARKERS.ROSTER
        }).c('item', {
            jid: userJid,
            subscription: 'remove'
        });

        if(Utils.getEnv().browser) {
            self.connection.sendIQ(iq, _callbackWrap);
        } else {
            self.nodeStanzasCallbacks[iqParams.id] = _callbackWrap;
            self.Client.send(iq);
        }
    },

    _sendSubscriptionPresence: function(params) {
        var builder = Utils.getEnv().browser ? $pres : XMPP.Stanza,
            presParams = {
                to: params.jid,
                type: params.type
            };

        var pres = chatUtils.createStanza(builder, presParams, 'presence');

        if (Utils.getEnv().browser){
            this.connection.send(pres);
        } else {
            this.Client.send(pres);
        }
    }
};

/* Chat module: Group Chat (Dialog)
 *
 * Multi-User Chat
 * http://xmpp.org/extensions/xep-0045.html
 *
 ----------------------------------------------------------------------------- */

/**
 * @namespace QB.chat.muc
 * */
function MucProxy(options) {
    this.service = options.service;
    this.helpers = options.helpers;
    this.connection = options.stropheClient;
    this.Client = options.xmppClient;
    this.nodeStanzasCallbacks = options.nodeStanzasCallbacks;
    //
    this.joinedRooms = {};
}

MucProxy.prototype = {

    /**
     * Join to the group dialog. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Chat_in_group_dialog More info.}
     * @memberof QB.chat.muc
     * @param {String} dialogIdOrJid - Use dialog jid or dialog id to join to this dialog.
     * @param {joinMacCallback} callback - The callback function.
     * */
    join: function(dialogIdOrJid, callback) {
        /**
         * Callback for QB.chat.muc.join().
         * @param {Object} error - Returns error object or null
         * @param {Object} responce - Returns responce
         * @callback joinMacCallback
         * */
        var self = this,
            id = chatUtils.getUniqueId('join');

        var dialogJid = this.helpers.getDialogJid(dialogIdOrJid);

        var presParams = {
                id: id,
                from: self.helpers.getUserCurrentJid(),
                to: self.helpers.getRoomJid(dialogJid)
            },
            builder = Utils.getEnv().browser ? $pres : XMPP.Stanza;

        var pres = chatUtils.createStanza(builder, presParams, 'presence');

        pres.c('x', {
            xmlns: chatUtils.MARKERS.MUC
        }).c('history', { maxstanzas: 0 });

        this.joinedRooms[dialogJid] = true;

        function handleJoinAnswer(stanza) {
            var id = chatUtils.getAttr(stanza, 'id');
            var from = chatUtils.getAttr(stanza, 'from');
            var dialogId = self.helpers.getDialogIdFromNode(from);
            
            var x = chatUtils.getElement(stanza, 'x');
            var xXMLNS = chatUtils.getAttr(x, 'xmlns');
            var status = chatUtils.getElement(x, 'status');
            var statusCode = chatUtils.getAttr(status, 'code');

            if (callback.length == 1) {
                Utils.safeCallbackCall(callback, stanza);
                return true;
            }

            if(status && statusCode == '110') {
                Utils.safeCallbackCall(callback, null, {
                    dialogId: dialogId
                });
            } else {
                var type = chatUtils.getAttr(stanza, 'type');

                if(type && type === 'error' && xXMLNS == 'http://jabber.org/protocol/muc' && id.endsWith(':join')) {
                    var errorEl = chatUtils.getElement(stanza, 'error');
                    var code = chatUtils.getAttr(errorEl, 'code');
                    var errorMessage = chatUtils.getElementText(errorEl, 'text');
    
                    Utils.safeCallbackCall(callback, {
                        code: code || 500,
                        message: errorMessage || 'Unknown issue'
                    }, {
                        dialogId: dialogId
                    });
                }
            }
        }

        if (Utils.getEnv().browser) {
            if (typeof callback === 'function') {
                self.connection.XAddTrackedHandler(handleJoinAnswer, null, 'presence', null, id);
            }

            self.connection.send(pres);
        } else {
            if (typeof callback === 'function') {
                self.nodeStanzasCallbacks[id] = handleJoinAnswer;
            }

            self.Client.send(pres);
        }
    },

    /**
     * Leave group chat dialog. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Chat_in_group_dialog More info.}
     * @memberof QB.chat.muc
     * @param {String} dialogJid - Use dialog jid to join to this dialog.
     * @param {leaveMacCallback} callback - The callback function.
     * */
    leave: function(jid, callback) {
        /**
         * Callback for QB.chat.muc.leave().
         * run without parameters;
         * @callback leaveMacCallback
         * */

        var self = this,
            presParams = {
                type: 'unavailable',
                from: self.helpers.getUserCurrentJid(),
                to: self.helpers.getRoomJid(jid)
            },
            builder = Utils.getEnv().browser ? $pres : XMPP.Stanza;

        var pres = chatUtils.createStanza(builder, presParams, 'presence');

        delete this.joinedRooms[jid];

        if (Utils.getEnv().browser) {
            var roomJid = self.helpers.getRoomJid(jid);

            if (typeof callback === 'function') {
                self.connection.XAddTrackedHandler(callback, null, 'presence', presParams.type, null, roomJid);
            }

            self.connection.send(pres);
        } else {
            /** The answer don't contain id */
            if(typeof callback === 'function') {
                self.nodeStanzasCallbacks['muc:leave'] = callback;
            }

            self.Client.send(pres);
        }
    },

    /**
     * Leave group chat dialog. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Chat_in_group_dialog More info.}
     * @memberof QB.chat.muc
     * @param {String} dialogJid - Use dialog jid to join to this dialog.
     * @param {listOnlineUsersMacCallback} callback - The callback function.
     * */
    listOnlineUsers: function(dialogJID, callback) {
        /**
         * Callback for QB.chat.muc.leave().
         * @param {Object} Users - list of online users
         * @callback listOnlineUsersMacCallback
         * */

        var self = this,
            onlineUsers = [];

        var iqParams = {
                type: 'get',
                to: dialogJID,
                from: self.helpers.getUserCurrentJid(),
                id: chatUtils.getUniqueId('muc_disco_items'),
            },
            builder = Utils.getEnv().browser ? $iq : XMPP.Stanza;
        var iq = chatUtils.createStanza(builder, iqParams, 'iq');
        iq.c('query', {
            xmlns: 'http://jabber.org/protocol/disco#items'
        });

        function _getUsers(stanza) {
            var stanzaId = stanza.attrs.id;

            if(self.nodeStanzasCallbacks[stanzaId]) {
                var users = [],
                    items = stanza.getChild('query').getChildElements('item'),
                    userId;

                for(var i = 0, len = items.length; i < len; i++) {
                    userId = self.helpers.getUserIdFromRoomJid(items[i].attrs.jid);
                    users.push(parseInt(userId));
                }

                callback(users);
            }
        }

        if (Utils.getEnv().browser) {
            self.connection.sendIQ(iq, function(stanza) {
                var items = stanza.getElementsByTagName('item'),
                    userId;

                for (var i = 0, len = items.length; i < len; i++) {
                    userId = self.helpers.getUserIdFromRoomJid(items[i].getAttribute('jid'));
                    onlineUsers.push(parseInt(userId));
                }

                callback(onlineUsers);
            });
        } else {
            self.Client.send(iq);

            self.nodeStanzasCallbacks[iqParams.id] = _getUsers;
        }
    }
};

/* Chat module: Privacy list
 *
 * Privacy list
 * http://xmpp.org/extensions/xep-0016.html
 * by default 'mutualBlock' is work in one side
----------------------------------------------------------------------------- */
function PrivacyListProxy(options) {
    this.service = options.service;
    this.helpers = options.helpers;
    this.connection = options.stropheClient;
    this.Client = options.xmppClient;
    this.nodeStanzasCallbacks = options.nodeStanzasCallbacks;
}

/**
 * @namespace QB.chat.privacylist
 **/
PrivacyListProxy.prototype = {
    /**
     * Create a privacy list. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Create_a_privacy_list_or_edit_existing_list More info.}
     * @memberof QB.chat.privacylist
     * @param {Object} list - privacy list object.
     * @param {createPrivacylistCallback} callback - The callback function.
     * */
    create: function(list, callback) {
        /**
         * Callback for QB.chat.privacylist.create().
         * @param {Object} error - The error object
         * @callback createPrivacylistCallback
         * */
        var self = this,
            userId, userJid, userMuc,
            userAction,
            mutualBlock,
            listPrivacy = {},
            listUserId = [];

        /** Filled listPrivacys */
        for (var i = list.items.length - 1; i >= 0; i--) {
            var user = list.items[i];

            listPrivacy[user.user_id] = {
                action: user.action,
                mutualBlock: user.mutualBlock === true ? true : false
            };
        }

        /** Filled listUserId */
        listUserId = Object.keys(listPrivacy);

        var iqParams = {
                type: 'set',
                from: self.helpers.getUserCurrentJid(),
                id: chatUtils.getUniqueId('edit')
            },
            builder = Utils.getEnv().browser ? $iq : XMPP.Stanza;

        var iq = chatUtils.createStanza(builder, iqParams, 'iq');

        iq.c('query', {
            xmlns: chatUtils.MARKERS.PRIVACY
        }).c('list', {
            name: list.name
        });

        function createPrivacyItem(iq, params){
            if(Utils.getEnv().browser) {
                iq.c('item', {
                    type: 'jid',
                    value: params.jidOrMuc,
                    action: params.userAction,
                    order: params.order
                }).c('message', {})
                    .up().c('presence-in', {})
                    .up().c('presence-out', {})
                    .up().c('iq', {})
                    .up().up();
            } else {
                var list = iq.getChild('query').getChild('list');

                list.c('item', {
                    type: 'jid',
                    value: params.jidOrMuc,
                    action: params.userAction,
                    order: params.order
                }).c('message', {})
                    .up().c('presence-in', {})
                    .up().c('presence-out', {})
                    .up().c('iq', {})
                    .up().up();
            }

            return iq;
        }

        function createPrivacyItemMutal(iq, params) {
            if(Utils.getEnv().browser) {
                iq.c('item', {
                    type: 'jid',
                    value: params.jidOrMuc,
                    action: params.userAction,
                    order: params.order
                }).up();
            } else {
                var list = iq.getChild('query').getChild('list');

                list.c('item', {
                    type: 'jid',
                    value: params.jidOrMuc,
                    action: params.userAction,
                    order: params.order
                }).up();
            }

            return iq;
        }

        for (var index = 0, j = 0, len = listUserId.length; index < len; index++, j = j + 2) {
            userId = listUserId[index];
            mutualBlock = listPrivacy[userId].mutualBlock;

            userAction = listPrivacy[userId].action;
            userJid = self.helpers.jidOrUserId(parseInt(userId, 10));
            userMuc = self.helpers.getUserNickWithMucDomain(userId);

            if(mutualBlock && userAction === 'deny'){
                iq = createPrivacyItemMutal(iq, {
                    order: j+1,
                    jidOrMuc: userJid,
                    userAction: userAction
                });
                iq = createPrivacyItemMutal(iq, {
                    order: j+2,
                    jidOrMuc: userMuc,
                    userAction: userAction
                }).up().up();
            } else {
                iq = createPrivacyItem(iq, {
                    order: j+1,
                    jidOrMuc: userJid,
                    userAction: userAction
                });
                iq = createPrivacyItem(iq, {
                    order: j+2,
                    jidOrMuc: userMuc,
                    userAction: userAction
                });
            }
        }

        if(Utils.getEnv().browser) {
            self.connection.sendIQ(iq, function(stanzaResult) {
                callback(null);
            }, function(stanzaError){
                if(stanzaError){
                    var errorObject = chatUtils.getErrorFromXMLNode(stanzaError);
                    callback(errorObject);
                }else{
                    callback(Utils.getError(408));
                }
            });
        } else {
            self.Client.send(iq);

            self.nodeStanzasCallbacks[iqParams.id] = function (stanza) {
                if(!stanza.getChildElements('error').length){
                    callback(null);
                } else {
                    callback(Utils.getError(408));
                }
            };
        }
    },

    /**
     * Get the privacy list. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Retrieve_a_privacy_list More info.}
     * @memberof QB.chat.privacylist
     * @param {String} name - The name of the list.
     * @param {getListPrivacylistCallback} callback - The callback function.
     * */
    getList: function(name, callback) {
        /**
         * Callback for QB.chat.privacylist.getList().
         * @param {Object} error - The error object
         * @param {Object} response - The privacy list object
         * @callback getListPrivacylistCallback
         * */

        var self = this,
            items, userJid, userId,
            usersList = [], list = {};

        var iqParams = {
                type: 'get',
                from: self.helpers.getUserCurrentJid(),
                id: chatUtils.getUniqueId('getlist')
            },
            builder = Utils.getEnv().browser ? $iq : XMPP.Stanza;

        var iq = chatUtils.createStanza(builder, iqParams, 'iq');

        iq.c('query', {
            xmlns: chatUtils.MARKERS.PRIVACY
        }).c('list', {
            name: name
        });

        if(Utils.getEnv().browser) {
            self.connection.sendIQ(iq, function(stanzaResult) {
                items = stanzaResult.getElementsByTagName('item');

                for (var i = 0, len = items.length; i < len; i=i+2) {
                    userJid = items[i].getAttribute('value');
                    userId = self.helpers.getIdFromNode(userJid);
                    usersList.push({
                        user_id: userId,
                        action: items[i].getAttribute('action')
                    });
                }
                list = {
                    name: name,
                    items: usersList
                };
                callback(null, list);
            }, function(stanzaError){
                if(stanzaError){
                    var errorObject = chatUtils.getErrorFromXMLNode(stanzaError);
                    callback(errorObject, null);
                }else{
                    callback(Utils.getError(408), null);
                }
            });
        } else {
            self.nodeStanzasCallbacks[iqParams.id] = function(stanza){
                var stanzaQuery = stanza.getChild('query'),
                    list = stanzaQuery ? stanzaQuery.getChild('list') : null,
                    items = list ? list.getChildElements('item') : null,
                    userJid, userId, usersList = [];

                for (var i = 0, len = items.length; i < len; i=i+2) {
                    userJid = items[i].attrs.value;
                    userId = self.helpers.getIdFromNode(userJid);
                    usersList.push({
                        user_id: userId,
                        action: items[i].attrs.action
                    });
                }

                list = {
                    name: list.attrs.name,
                    items: usersList
                };

                callback(null, list);
                delete self.nodeStanzasCallbacks[iqParams.id];
            };

            self.Client.send(iq);
        }
    },

    /**
     * Update the privacy list.
     * @memberof QB.chat.privacylist
     * @param {String} name - The name of the list.
     * @param {updatePrivacylistCallback} callback - The callback function.
     * */
    update: function(listWithUpdates, callback) {
        /**
         * Callback for QB.chat.privacylist.update().
         * @param {Object} error - The error object
         * @param {Object} response - The privacy list object
         * @callback updatePrivacylistCallback
         * */

        var self = this;

        self.getList(listWithUpdates.name, function(error, existentList) {
            if (error) {
                callback(error, null);
            } else {
                var updatedList = {};
                updatedList.items = Utils.MergeArrayOfObjects(existentList.items, listWithUpdates.items);
                updatedList.name = listWithUpdates.name;

                self.create(updatedList, function(err, result) {
                    if (error) {
                        callback(err, null);
                    }else{
                        callback(null, result);
                    }
                });
            }
        });
    },

    /**
     * Get names of privacy lists. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Retrieve_privacy_lists_names More info.}
     * Run without parameters
     * @memberof QB.chat.privacylist
     * @param {getNamesPrivacylistCallback} callback - The callback function.
     * */
    getNames: function(callback) {
        /**
         * Callback for QB.chat.privacylist.getNames().
         * @param {Object} error - The error object
         * @param {Object} response - The privacy list object (var names = response.names;)
         * @callback getNamesPrivacylistCallback
         * */

        var self = this,
            iq,
            stanzaParams = {
                'type': 'get',
                'from': self.helpers.getUserCurrentJid(),
                'id': chatUtils.getUniqueId('getNames')
            };

        if(Utils.getEnv().browser){
            iq = $iq(stanzaParams).c('query', {
                xmlns: Strophe.NS.PRIVACY_LIST
            });

            self.connection.sendIQ(iq, function(stanzaResult) {
                var allNames = [], namesList = {},
                    defaultList = stanzaResult.getElementsByTagName('default'),
                    activeList = stanzaResult.getElementsByTagName('active'),
                    allLists = stanzaResult.getElementsByTagName('list');

                var defaultName = defaultList && defaultList.length > 0 ? defaultList[0].getAttribute('name') : null;
                var activeName = activeList && activeList.length > 0 ? activeList[0].getAttribute('name') : null;

                for (var i = 0, len = allLists.length; i < len; i++) {
                    allNames.push(allLists[i].getAttribute('name'));
                }

                namesList = {
                    'default': defaultName,
                    'active': activeName,
                    'names': allNames
                };

                callback(null, namesList);
            }, function(stanzaError){
                if(stanzaError){
                    var errorObject = chatUtils.getErrorFromXMLNode(stanzaError);
                    callback(errorObject, null);
                }else{
                    callback(Utils.getError(408), null);
                }
            });
        } else {
            iq = new XMPP.Stanza('iq', stanzaParams);

            iq.c('query', {
                xmlns: chatUtils.MARKERS.PRIVACY
            });

            self.nodeStanzasCallbacks[iq.attrs.id] = function(stanza){
                if(stanza.attrs.type !== 'error'){

                    var allNames = [], namesList = {},
                        query = stanza.getChild('query'),
                        defaultList = query.getChild('default'),
                        activeList = query.getChild('active'),
                        allLists = query.getChildElements('list');

                    var defaultName = defaultList ? defaultList.attrs.name : null,
                        activeName = activeList ? activeList.attrs.name : null;

                    for (var i = 0, len = allLists.length; i < len; i++) {
                        allNames.push(allLists[i].attrs.name);
                    }

                    namesList = {
                        'default': defaultName,
                        'active': activeName,
                        'names': allNames
                    };

                    callback(null, namesList);
                } else {
                    callback(Utils.getError(408));
                }
            };

            self.Client.send(iq);
        }
    },

    /**
     * Delete privacy list. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Delete_existing_privacy_list More info.}
     * @param {String} name - The name of privacy list.
     * @memberof QB.chat.privacylist
     * @param {deletePrivacylistCallback} callback - The callback function.
     * */
    delete: function(name, callback) {
        /**
         * Callback for QB.chat.privacylist.delete().
         * @param {Object} error - The error object
         * @callback deletePrivacylistCallback
         * */

        var iq,
            stanzaParams = {
                'from': this.connection ? this.connection.jid : this.Client.jid.user,
                'type': 'set',
                'id': chatUtils.getUniqueId('remove')
            };

        if(Utils.getEnv().browser){
            iq = $iq(stanzaParams).c('query', {
                xmlns: Strophe.NS.PRIVACY_LIST
            }).c('list', {
                name: name ? name : ''
            });

            this.connection.sendIQ(iq, function(stanzaResult) {
                callback(null);
            }, function(stanzaError){
                if(stanzaError){
                    var errorObject = chatUtils.getErrorFromXMLNode(stanzaError);
                    callback(errorObject);
                }else{
                    callback(Utils.getError(408));
                }
            });

        } else {
            iq = new XMPP.Stanza('iq', stanzaParams);

            iq.c('query', {
                xmlns: chatUtils.MARKERS.PRIVACY
            }).c('list', {
                name: name ? name : ''
            });

            this.nodeStanzasCallbacks[stanzaParams.id] = function(stanza){
                if(!stanza.getChildElements('error').length){
                    callback(null);
                } else {
                    callback(Utils.getError(408));
                }
            };

            this.Client.send(iq);
        }

    },

    /**
     * Set as default privacy list. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Activate_a_privacy_list More info.}
     * @param {String} name - The name of privacy list.
     * @memberof QB.chat.privacylist
     * @param {setAsDefaultPrivacylistCallback} callback - The callback function.
     * */
    setAsDefault: function(name, callback) {
        /**
         * Callback for QB.chat.privacylist.setAsDefault().
         * @param {Object} error - The error object
         * @callback setAsDefaultPrivacylistCallback
         * */

        var self = this,
            iq,
            stanzaParams = {
                'from': this.connection ? this.connection.jid : this.Client.jid.user,
                'type': 'set',
                'id': chatUtils.getUniqueId('default')
            };

        if(Utils.getEnv().browser){
            iq = $iq(stanzaParams).c('query', {
                xmlns: Strophe.NS.PRIVACY_LIST
            }).c('default', name && name.length > 0 ? {name: name} : {});

            this.connection.sendIQ(iq, function(stanzaResult) {
                setAsActive(self); //Activate list after setting it as default.
            }, function(stanzaError){
                if(stanzaError){
                    var errorObject = chatUtils.getErrorFromXMLNode(stanzaError);
                    callback(errorObject);
                }else{
                    callback(Utils.getError(408));
                }
            });
        } else {
            iq = new XMPP.Stanza('iq', stanzaParams);

            iq.c('query', {
                xmlns: chatUtils.MARKERS.PRIVACY
            }).c('default', name && name.length > 0 ? {name: name} : {});

            this.nodeStanzasCallbacks[stanzaParams.id] = function(stanza){
                if(!stanza.getChildElements('error').length){
                    setAsActive(self); //Activate list after setting it as default.
                } else {
                    callback(Utils.getError(408));
                }
            };
            this.Client.send(iq);
        }

        /**
        * Set as active privacy list after setting as default.
        * @param {PrivacyListProxy Object} self - The name of privacy list.
        * */
        function setAsActive(self) {
            var setAsActiveIq,
            setAsActiveStanzaParams = {
                'from': self.connection ? self.connection.jid : self.Client.jid.user,
                'type': 'set',
                'id': chatUtils.getUniqueId('active1')
            };
            if(Utils.getEnv().browser){
                setAsActiveIq = $iq(setAsActiveStanzaParams).c('query', {
                    xmlns: Strophe.NS.PRIVACY_LIST
                }).c('active', name && name.length > 0 ? {name: name} : {});
                self.connection.sendIQ(setAsActiveIq, function(setAsActiveStanzaResult) {
                    callback(null);
                }, function(setAsActiveStanzaError){
                    if(setAsActiveStanzaError){
                        var setAsActiveErrorObject = chatUtils.getErrorFromXMLNode(setAsActiveStanzaError);
                        callback(setAsActiveErrorObject);
                    }else{
                        callback(Utils.getError(408));
                    }
                });
            } else {
                setAsActiveIq = new XMPP.Stanza('iq', setAsActiveStanzaParams);
                setAsActiveIq.c('query', {
                    xmlns: chatUtils.MARKERS.PRIVACY
                }).c('active', name && name.length > 0 ? {name: name} : {});
                self.nodeStanzasCallbacks[setAsActiveStanzaParams.id] = function(setAsActistanza){
                    if(!setAsActistanza.getChildElements('error').length){
                        callback(null);
                    } else {
                        callback(Utils.getError(408));
                    }
                };
                self.Client.send(setAsActiveIq);
            }
        }
    }

};

/* Helpers
 ----------------------------------------------------------------------------- */
function Helpers() {
    this._userCurrentJid = '';
}
/**
 * @namespace QB.chat.helpers
 * */
Helpers.prototype = {

    /**
     * Get unique id.
     * @memberof QB.chat.helpers
     * @param {String | Number} suffix - not required parameter.
     * @returns {String} - UniqueId.
     * */
    getUniqueId: chatUtils.getUniqueId,

    /**
     * Get unique id.
     * @memberof QB.chat.helpers
     * @param {String | Number} jid_or_user_id - Jid or user id.
     * @returns {String} - jid.
     * */
    jidOrUserId: function(jid_or_user_id) {
        var jid;
        if (typeof jid_or_user_id === 'string') {
            jid = jid_or_user_id;
        } else if (typeof jid_or_user_id === 'number') {
            jid = jid_or_user_id + '-' + config.creds.appId + '@' + config.endpoints.chat;
        } else {
            throw new Error('The method "jidOrUserId" may take jid or id');
        }
        return jid;
    },

    /**
     * Get the chat type.
     * @memberof QB.chat.helpers
     * @param {String | Number} jid_or_user_id - Jid or user id.
     * @returns {String} - jid.
     * */
    typeChat: function(jid_or_user_id) {
        var chatType;
        if (typeof jid_or_user_id === 'string') {
            chatType = jid_or_user_id.indexOf("muc") > -1 ? 'groupchat' : 'chat';
        } else if (typeof jid_or_user_id === 'number') {
            chatType = 'chat';
        } else {
            throw new Error(unsupportedError);
        }
        return chatType;
    },

    /**
     * Get the recipint id.
     * @memberof QB.chat.helpers
     * @param {Array} occupantsIds - Array of user ids.
     * @param {Number} UserId - Jid or user id.
     * @returns {Number} recipient - recipient id.
     * */
    getRecipientId: function(occupantsIds, UserId) {
        var recipient = null;
        occupantsIds.forEach(function(item) {
            if(item != UserId){
                recipient = item;
            }
        });
        return recipient;
    },

    /**
     * Get the User jid id.
     * @memberof QB.chat.helpers
     * @param {Number} UserId - The user id.
     * @param {Number} appId - The application id.
     * @returns {String} jid - The user jid.
     * */
    getUserJid: function(userId, appId) {
        if(!appId){
            return userId + '-' + config.creds.appId + '@' + config.endpoints.chat;
        }
        return userId + '-' + appId + '@' + config.endpoints.chat;
    },

    /**
     * Get the User nick with the muc domain.
     * @memberof QB.chat.helpers
     * @param {Number} UserId - The user id.
     * @returns {String} mucDomainWithNick - The mac domain with he nick.
     * */
    getUserNickWithMucDomain: function(userId) {
        return config.endpoints.muc + '/' + userId;
    },

    /**
     * Get the User id from jid.
     * @memberof QB.chat.helpers
     * @param {String} jid - The user jid.
     * @returns {Number} id - The user id.
     * */
    getIdFromNode: function(jid) {
        return (jid.indexOf('@') < 0) ? null : parseInt(jid.split('@')[0].split('-')[0]);
    },

    /**
     * Get the dialog id from jid.
     * @memberof QB.chat.helpers
     * @param {String} jid - The dialog jid.
     * @returns {String} dialogId - The dialog id.
     * */
    getDialogIdFromNode: function(jid) {
        if (jid.indexOf('@') < 0) return null;
        return jid.split('@')[0].split('_')[1];
    },

    /**
     * Get the room jid from dialog id.
     * @memberof QB.chat.helpers
     * @param {String} dialogId - The dialog id.
     * @returns {String} jid - The dialog jid.
     * */
    getRoomJidFromDialogId: function(dialogId) {
        return config.creds.appId + '_' + dialogId + '@' + config.endpoints.muc;
    },

    /**
     * Get the full room jid from room bare jid & user jid.
     * @memberof QB.chat.helpers
     * @param {String} jid - dialog's bare jid.
     * @param {String} userJid - user's jid.
     * @returns {String} jid - dialog's full jid.
     * */
    getRoomJid: function(jid) {
        return jid + '/' + this.getIdFromNode(this._userCurrentJid);
    },

    /**
     * Get user id from dialog's full jid.
     * @memberof QB.chat.helpers
     * @param {String} jid - dialog's full jid.
     * @returns {String} user_id - User Id.
     * */
    getIdFromResource: function(jid) {
        var s = jid.split('/');
        if (s.length < 2) return null;
        s.splice(0, 1);
        return parseInt(s.join('/'));
    },

    /**
     * Get bare dialog's jid from dialog's full jid.
     * @memberof QB.chat.helpers
     * @param {String} jid - dialog's full jid.
     * @returns {String} room_jid - dialog's bare jid.
     * */
    getRoomJidFromRoomFullJid: function(jid) {
        var s = jid.split('/');
        if (s.length < 2) return null;
        return s[0];
    },

    /**
     * Generate BSON ObjectId.
     * @memberof QB.chat.helpers
     * @returns {String} BsonObjectId - The bson object id.
     **/
    getBsonObjectId: function() {
        return Utils.getBsonObjectId();
    },

    /**
     * Get the user id from the room jid.
     * @memberof QB.chat.helpers
     * @param {String} jid - resourse jid.
     * @returns {String} userId - The user id.
     * */
    getUserIdFromRoomJid: function(jid) {
        var arrayElements = jid.toString().split('/');
        if(arrayElements.length === 0){
            return null;
        }
        return arrayElements[arrayElements.length-1];
    },

    userCurrentJid: function(client){
        try {
            if (client instanceof Strophe.Connection){
                return client.jid;
            } else {
                return client.jid.user + '@' + client.jid._domain + '/' + client.jid._resource;
            }
        } catch (e) { // ReferenceError: Strophe is not defined
            return client.jid.user + '@' + client.jid._domain + '/' + client.jid._resource;
        }
    },

    getUserCurrentJid: function() {
        return this._userCurrentJid;
    },

    setUserCurrentJid: function(jid) {
        this._userCurrentJid = jid;
    },

    getDialogJid: function(identifier) {
        return identifier.indexOf('@') > 0 ? identifier : this.getRoomJidFromDialogId(identifier);
    }
};
/**
 * @namespace QB.chat
 * */
module.exports = ChatProxy;

},{"../../plugins/streamManagement":42,"../../qbConfig":43,"../../qbStrophe":46,"../../qbUtils":47,"./qbChatHelpers":26}],26:[function(require,module,exports){
'use strict';

var utils = require('../../qbUtils');
var config = require('../../qbConfig');

var ERR_UNKNOWN_INTERFACE = 'Unknown interface. SDK support browser / node env.';

var MARKERS = {
    CLIENT: 'jabber:client',
    CHAT: 'urn:xmpp:chat-markers:0',
    STATES: 'http://jabber.org/protocol/chatstates',
    MARKERS: 'urn:xmpp:chat-markers:0',
    CARBONS: 'urn:xmpp:carbons:2',
    ROSTER: 'jabber:iq:roster',
    MUC: 'http://jabber.org/protocol/muc',
    PRIVACY: 'jabber:iq:privacy',
    LAST: 'jabber:iq:last'
};

function ChatNotConnectedError(message, fileName, lineNumber) {
    var instance = new Error(message, fileName, lineNumber);
    instance.name = 'ChatNotConnectedError';
    Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    if (Error.captureStackTrace) {
        Error.captureStackTrace(instance, ChatNotConnectedError);
    }
    return instance;
}

ChatNotConnectedError.prototype = Object.create(Error.prototype, {
    constructor: {
        value: Error,
        enumerable: false,
        writable: true,
        configurable: true
    }
});

if (Object.setPrototypeOf) {
    Object.setPrototypeOf(ChatNotConnectedError, Error);
} else {
    ChatNotConnectedError.__proto__ = Error; // jshint ignore:line
}

var qbChatHelpers = {
    MARKERS: MARKERS,
    ChatNotConnectedError: ChatNotConnectedError,
    /**
     * @param {params} this object may contains Jid or Id property
     * @return {string} jid of user
     */
    buildUserJid: function(params) {
        var jid;

        if ('userId' in params) {
            jid = params.userId + '-' + config.creds.appId + '@' + config.endpoints.chat;

            if ('resource' in params) {
                jid = jid + '/' + params.resource;
            }
        } else if ('jid' in params) {
            jid = params.jid;
        }

        return jid;
    },
    createStanza: function(builder, params, type) {
        var stanza;

        if(utils.getEnv().browser) {
            stanza = builder(params);
        } else {
            stanza = new builder(type ? type : 'message', params);
        }

        return stanza;
    },
    getAttr: function(el, attrName) {
        var attr;

        if(!el) {
            return null;
        }

        if(typeof el.getAttribute === 'function') {
            attr = el.getAttribute(attrName);
        } else if(el.attrs) {
            attr = el.attrs[attrName];
        }

        return attr ? attr : null;
    },
    getElement: function(stanza, elName) {
        var el;

        if(typeof stanza.querySelector === 'function') {
            el = stanza.querySelector(elName);
        } else if(typeof stanza.getChild === 'function'){
            el = stanza.getChild(elName);
        } else {
            throw ERR_UNKNOWN_INTERFACE;
        }

        return el ? el : null;
    },
    getAllElements: function(stanza, elName) {
        var el;

        if(typeof stanza.querySelectorAll === 'function') {
            el = stanza.querySelectorAll(elName);
        } else if(typeof stanza.getChild === 'function'){
            el = stanza.getChild(elName);
        } else {
            throw ERR_UNKNOWN_INTERFACE;
        }

        return el ? el : null;
    },
    getElementText: function(stanza, elName) {
        var el,
            txt;

        if(typeof stanza.querySelector === 'function') {
            el = stanza.querySelector(elName);
            txt = el ? el.textContent : null;
        } else if(typeof stanza.getChildText === 'function') {
            txt = stanza.getChildText(elName);
        } else {
            throw ERR_UNKNOWN_INTERFACE;
        }

        return txt ? txt : null;
    },
    _JStoXML: function(title, obj, msg) {
        var self = this;

        msg.c(title);

        Object.keys(obj).forEach(function(field) {
            if (typeof obj[field] === 'object') {
                self._JStoXML(field, obj[field], msg);
            } else {
                msg.c(field).t(obj[field]).up();
            }
        });

        msg.up();
    },
    _XMLtoJS: function(extension, title, obj) {
        var self = this;

        extension[title] = {};

        for (var i = 0, len = obj.childNodes.length; i < len; i++) {
            if (obj.childNodes[i].childNodes.length > 1) {
                extension[title] = self._XMLtoJS(extension[title], obj.childNodes[i].tagName, obj.childNodes[i]);
            } else {
                extension[title][obj.childNodes[i].tagName] = obj.childNodes[i].textContent;
            }
        }
        return extension;
    },
    filledExtraParams: function(stanza, extension) {
        var helper = this;

        Object.keys(extension).forEach(function(field) {
            if (field === 'attachments') {
                extension[field].forEach(function(attach) {
                    if (utils.getEnv().browser) {
                        stanza.c('attachment', attach).up();
                    } else {
                        stanza.getChild('extraParams')
                            .c('attachment', attach).up();
                    }
                });
            } else if (typeof extension[field] === 'object') {
                helper._JStoXML(field, extension[field], stanza);
            } else {
                if (utils.getEnv().browser) {
                    stanza.c(field).t(extension[field]).up();
                } else {
                    stanza.getChild('extraParams')
                        .c(field).t(extension[field]).up();
                }
            }
        });

        stanza.up();

        return stanza;
    },
    parseExtraParams: function(extraParams) {
        var self = this;

        if (!extraParams) {
            return null;
        }

        var extension = {};

        var dialogId,
            attach,
            attributes;

        var attachments = [];

        if (utils.getEnv().browser) {
            for (var i = 0, len = extraParams.childNodes.length; i < len; i++) {
                // parse attachments
                if (extraParams.childNodes[i].tagName === 'attachment') {
                    attach = {};
                    attributes = extraParams.childNodes[i].attributes;

                    for (var j = 0, len2 = attributes.length; j < len2; j++) {
                        if (attributes[j].name === 'size') {
                            attach[attributes[j].name] = parseInt(attributes[j].value);
                        } else {
                            attach[attributes[j].name] = attributes[j].value;
                        }
                    }

                    attachments.push(attach);

                    // parse 'dialog_id'
                } else if (extraParams.childNodes[i].tagName === 'dialog_id') {
                    dialogId = extraParams.childNodes[i].textContent;
                    extension.dialog_id = dialogId;

                    // parse other user's custom parameters
                } else {
                    if (extraParams.childNodes[i].childNodes.length > 1) {
                        // Firefox issue with 4K XML node limit:
                        // http://www.coderholic.com/firefox-4k-xml-node-limit/
                        var nodeTextContentSize = extraParams.childNodes[i].textContent.length;

                        if (nodeTextContentSize > 4096) {
                            var wholeNodeContent = "";
                            for (var k=0; k<extraParams.childNodes[i].childNodes.length; ++k) {
                                wholeNodeContent += extraParams.childNodes[i].childNodes[k].textContent;
                            }
                            extension[extraParams.childNodes[i].tagName] = wholeNodeContent;
                        } else {
                            extension = self._XMLtoJS(extension, extraParams.childNodes[i].tagName, extraParams.childNodes[i]);
                        }
                    } else {
                        extension[extraParams.childNodes[i].tagName] = extraParams.childNodes[i].textContent;
                    }
                }
            }

        } else {
            for (var c = 0, lenght = extraParams.children.length; c < lenght; c++) {
                if (extraParams.children[c].name === 'attachment') {
                    attach = {};
                    attributes = extraParams.children[c].attrs;

                    var attrKeys = Object.keys(attributes);

                    for (var l = 0; l < attrKeys.length; l++) {
                        if(attrKeys[l] === 'size'){
                            attach.size = parseInt(attributes.size);
                        } else {
                            attach[attrKeys[l]] = attributes[attrKeys[l]];
                        }
                    }

                    attachments.push(attach);

                } else if (extraParams.children[c].name === 'dialog_id') {
                    dialogId = extraParams.getChildText('dialog_id');
                    extension.dialog_id = dialogId;
                }

                if (extraParams.children[c].children.length === 1) {
                    var child = extraParams.children[c];

                    extension[child.name] = child.children[0];
                }
            }
        }

        if (attachments.length > 0) {
            extension.attachments = attachments;
        }

        if (extension.moduleIdentifier) {
            delete extension.moduleIdentifier;
        }

        return {
            extension: extension,
            dialogId: dialogId
        };
    },
    getUniqueId: function(suffix) {
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : r & 0x3 | 0x8;
            return v.toString(16);
        });
        if (typeof(suffix) == 'string' || typeof(suffix) == 'number') {
            return uuid + ':' + suffix;
        } else {
            return uuid + '';
        }
    },
    getErrorFromXMLNode: function(stanzaError) {
        var errorElement = this.getElement(stanzaError, 'error');
        var errorCode = parseInt(this.getAttr(errorElement, 'code'));
        var errorText = this.getElementText(errorElement, 'text');

        return utils.getError(errorCode, errorText);
    },
    getLocalTime: function() {
        return (new Date()).toTimeString().split(' ')[0];
    }
};

module.exports = qbChatHelpers;

},{"../../qbConfig":43,"../../qbUtils":47}],27:[function(require,module,exports){
'use strict';

var config = require('../../qbConfig'),
    Utils = require('../../qbUtils');

var DIALOGS_API_URL = config.urls.chat + '/Dialog';

function DialogProxy(service) {
    this.service = service;
}

/**
 * @namespace QB.chat.dialog
 **/
DialogProxy.prototype = {
    /**
     * Retrieve list of dialogs. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Retrieve_list_of_dialogs More info.}
     * @memberof QB.chat.dialog
     * @param {Object} params - Some filters to get only chat dialogs you need.
     * @param {listDialogCallback} callback - The callback function.
     * */
    list: function(params, callback) {
        /**
         * Callback for QB.chat.dialog.list().
         * @param {Object} error - The error object
         * @param {Object} resDialogs - the dialog list
         * @callback listDialogCallback
         * */

        if (typeof params === 'function' && typeof callback === 'undefined') {
            callback = params;
            params = {};
        }

        this.service.ajax({
            url: Utils.getUrl(DIALOGS_API_URL),
            data: params
        }, callback);
    },

    /**
     * Create new dialog. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Create_new_dialog More info.}
     * @memberof QB.chat.dialog
     * @param {Object} params - Object of parameters.
     * @param {createDialogCallback} callback - The callback function.
     * */
    create: function(params, callback) {
        /**
         * Callback for QB.chat.dialog.create().
         * @param {Object} error - The error object
         * @param {Object} createdDialog - the dialog object
         * @callback createDialogCallback
         * */

        if (params && params.occupants_ids && Utils.isArray(params.occupants_ids)) {
            params.occupants_ids = params.occupants_ids.join(', ');
        }

        this.service.ajax({
            url: Utils.getUrl(DIALOGS_API_URL),
            type: 'POST',
            data: params
        }, callback);
    },

    /**
     * Update group dialog. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Update_group_dialog More info.}
     * @memberof QB.chat.dialog
     * @param {String} id - The dialog ID.
     * @param {Object} params - Object of parameters.
     * @param {updateDialogCallback} callback - The callback function.
     * */
    update: function(id, params, callback) {
        /**
         * Callback for QB.chat.dialog.update()
         * @param {Object} error - The error object
         * @param {Object} res - the dialog object
         * @callback updateDialogCallback
         * */

        this.service.ajax({
            'url': Utils.getUrl(DIALOGS_API_URL, id),
            'type': 'PUT',
            'contentType': 'application/json; charset=utf-8',
            'isNeedStringify': true,
            'data': params
        }, callback);
    },

    /**
     * Delete a dialog or dialogs. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Delete_dialog More info.}
     * @memberof QB.chat.dialog
     * @param {Array} id - The dialog IDs array.
     * @param {Object | function} params_or_callback - Object of parameters or callback function.
     * @param {deleteDialogCallback} callback - The callback function.
     * */
    delete: function(id, params_or_callback, callback) {
        /**
         * Callback for QB.chat.dialog.delete()
         * @param {Object} error - The error object
         * @callback deleteDialogCallback
         * */

        var ajaxParams = {
            url: Utils.getUrl(DIALOGS_API_URL, id),
            type: 'DELETE',
            dataType: 'text'
        };

        if (arguments.length === 2) {
            this.service.ajax(ajaxParams, params_or_callback);
        } else if (arguments.length === 3) {
            ajaxParams.data = params_or_callback;

            this.service.ajax(ajaxParams, callback);
        }
    }
};

module.exports = DialogProxy;

},{"../../qbConfig":43,"../../qbUtils":47}],28:[function(require,module,exports){
'use strict';

var config = require('../../qbConfig'),
    Utils = require('../../qbUtils');

var MESSAGES_API_URL = config.urls.chat + '/Message';

function MessageProxy(service) {
    this.service = service;
}

/**
 * @namespace QB.chat.message
 **/
MessageProxy.prototype = {
    /**
     * get a chat history. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#List_chat_messages More info.}
     * @memberof QB.chat.message
     * @param {Object} params - Object of parameters.
     * @param {listMessageCallback} callback - The callback function.
     * */
    list: function(params, callback) {
        /**
         * Callback for QB.chat.message.list()
         * @param {Object} error - The error object
         * @param {Object} messages - The messages object.
         * @callback listMessageCallback
         * */

        this.service.ajax({
            url: Utils.getUrl(MESSAGES_API_URL),
            data: params
        }, callback);
    },

    /**
     * Create message. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Put_chat_messages_to_history More info.}
     * @memberof QB.chat.message
     * @param {Object} params - Object of parameters.
     * @param {createMessageCallback} callback - The callback function.
     * */
    create: function(params, callback) {
        /**
         * Callback for QB.chat.message.create()
         * @param {Object} error - The error object
         * @param {Object} messages - The message object.
         * @callback createMessageCallback
         * */

        this.service.ajax({
            url: Utils.getUrl(MESSAGES_API_URL),
            type: 'POST',
            data: params
        }, callback);
    },

    /**
     * Update message. {@link https://docsdev.quickblox.com/rest_api/Chat_API.html#Update_message More info.}
     * @memberof QB.chat.message
     * @param {String} id - The message id.
     * @param {Object} params - Object of parameters
     * @param {Number} [params.read] - Mark message as read (read=1)
     * @param {Number} [params.delivered] - Mark message as delivered (delivered=1)
     * @param {String} [params.message] - The message's text
     * @param {updateMessageCallback} callback - The callback function
     * */
    update: function(id, params, callback) {
        /**
         * Callback for QB.chat.message.update()
         * @param {Object} error - The error object
         * @param {Object} response - Empty body.
         * @callback updateMessageCallback
         * */

        var attrAjax = {
            'type': 'PUT',
            'dataType': 'text',
            'url': Utils.getUrl(MESSAGES_API_URL, id),
            'data': params
        };

        this.service.ajax(attrAjax, callback);
    },

    /**
     * Delete message. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Delete_chat_messages More info.}
     * @memberof QB.chat.message
     * @param {String} id - The message id.
     * @param {Object} params - Object of parameters.
     * @param {deleteMessageCallback} callback - The callback function.
     * */
    delete: function(id, params_or_callback, callback) {
        /**
         * Callback for QB.chat.message.delete()
         * @param {Object} error - The error object.
         * @param {String} res - Empty string.
         * @callback deleteMessageCallback
         * */

        var ajaxParams = {
            url: Utils.getUrl(MESSAGES_API_URL, id),
            type: 'DELETE',
            dataType: 'text'
        };

        if (arguments.length === 2) {
            this.service.ajax(ajaxParams, params_or_callback);
        } else if (arguments.length === 3) {
            ajaxParams.data = params_or_callback;

            this.service.ajax(ajaxParams, callback);
        }
    },

    /**
     * Get unread messages counter for one or group of dialogs. {@link https://quickblox.com/developers/Web_XMPP_Chat_Sample#Unread_messages_count More info.}
     * @memberof QB.chat.message
     * @param {Object} params - Object of parameters.
     * @param {unreadCountMessageCallback} callback - The callback function.
     * */
    unreadCount: function(params, callback) {
        /**
         * Callback for QB.chat.message.unreadCount()
         * @param {Object} error - The error object.
         * @param {Object} res - The requested dialogs Object.
         * @callback unreadCountMessageCallback
         * */

        if (params && params.chat_dialog_ids && Utils.isArray(params.chat_dialog_ids)) {
            params.chat_dialog_ids = params.chat_dialog_ids.join(', ');
        }

        this.service.ajax({
            url: Utils.getUrl(MESSAGES_API_URL + '/unread'),
            data: params
        }, callback);
    }
};

module.exports = MessageProxy;

},{"../../qbConfig":43,"../../qbUtils":47}],29:[function(require,module,exports){
'use strict';

var Utils = require('../qbUtils');
var config = require('../qbConfig');

/**
 * Address Book
 * @namespace QB.addressbook
 */
function AddressBook(service) {
  this.service = service;
}

AddressBook.prototype = {
  /**
   * The method is used to create, update and delete contacts in address book.<br />
   * If contact doesn't exist in address book then it will be created. If contacts exists then it will be updated.
   * If pass 'destroy: 1' then the contact will be removed.<br />
   * {@link https://quickblox.com/developers/AddressBook Found more here}. <br />
   * The method accepts 2 or 3 parameters.
   * @memberof QB.addressbook
   * @param {Object[]} list - A list of contacts to create / update / delete.
   * @param {Object} [options]
   * @param {string} [options.udid] - User's device identifier. If specified all operations will be in this context. Max length 64 symbols.
   * If not - it means a user has one global address book across all his devices.
   * @param {number} [options.force] - Defines force rewrite mode.
   * If set 1 then all previous contacts for device context will be replaced by new ones.
   * @param {Function} callback - The savedAddressBookCallback function
   *
   * @example
   *  var people = [{
   *    'name':'Frederic Cartwright',
   *    'phone': '8879108395'
   *  },
   *  {
   *    'phone': '8759108396',
   *    'destroy': 1
   *  }];
   *
   *  var options = {
   *    force: 1,
   *    udid: 'A337E8A4-80AD-8ABA-9F5D-579EFF6BACAB'
   *  };
   *
   *  function addressBookSaved(err, response) {
   *    if(err) {
   *
   *    } else {
   *      console.log('All constacts saved');
   *    }
   *  }
   *
   *  QB.addressbook.uploadAddressBook(addressBookList, savedAddressBookCallback);
   *  // or second parameters can be options
   *  QB.addressbook.uploadAddressBook(addressBookList, options, savedAddressBookCallback);
   *
   */
  uploadAddressBook: function(list, optionsOrcallback, callback) {
    if (!Array.isArray(list)) {
      new Error('First parameter must be an Array.');
      return;
    }

    var opts, cb;

    if(isFunction(optionsOrcallback)) {
      cb = optionsOrcallback;
    } else {
      opts = optionsOrcallback;
      cb = callback;
    }

    var data = { contacts: list };

    if(opts) {
      if(opts.force) {
        data.force = opts.force;
      }

      if(opts.udid) {
        data.udid = opts.udid;
      }
    }

    this.service.ajax({
      'type': 'POST',
      'url': Utils.getUrl(config.urls.addressbook),
      'data': data,
      'contentType': 'application/json; charset=utf-8',
      'isNeedStringify': true
    },function(err, res) {
      if (err) {
        cb(err, null);
      } else {
        cb(null, res);
      }
    });
  },

  _isFakeErrorEmptyAddressBook: function(err) {
    var errDetails = err.detail ? err.detail : err.message.errors;
    return err.code === 404 && errDetails[0] === 'Empty address book';
  },

  /**
   * Retrive all contacts from address book.
   * The method accepts 1 or 2 parameters.
   * @memberof QB.addressbook
   * @param {string|function} udidOrCallback - You could pass udid of address book or
   * callback function if you want to get contacts from global address book.
   * @param {function} [callback] - Callback function is used as 2nd parameter if you pass udid as 1st parameters.
   * This callback takes 2 arguments: an error and a response.
   *
   * @example
   * var UDID = 'D337E8A4-80AD-8ABA-9F5D-579EFF6BACAB';
   *
   * function gotContacts(err, contacts) {
   *  contacts.forEach( (contact) => { alert(contact); })
   * }
   *
   * QB.addressbook.get(gotContacts);
   * // or you could specify what address book you need by udid
   * QB.addressbook.get(UDID, gotContacts);
   */
  get: function(udidOrCallback, callback) {
    var self = this;
    var udid, cb;

    if(isFunction(udidOrCallback)) {
      cb = udidOrCallback;
    } else {
      udid = udidOrCallback;
      cb = callback;
    }

    if(!isFunction(cb)) {
      throw new Error('The QB.addressbook.get accept callback function is required.');
    }

    var ajaxParams = {
      'type': 'GET',
      'url': Utils.getUrl(config.urls.addressbook),
      'contentType': 'application/json; charset=utf-8',
      'isNeedStringify': true
    };

    if(udid) {
      ajaxParams.data = {'udid': udid};
    }

    this.service.ajax(ajaxParams, function(err, res) {
      if (err) {
        // Don't ask me why.
        // Thanks to backend developers for this
        var isFakeErrorEmptyAddressBook = self._isFakeErrorEmptyAddressBook(err);

        if(isFakeErrorEmptyAddressBook) {
          cb(null, []);
        } else {
          cb(err, null);
        }
      } else {
        cb(null, res);
      }
    });
  },

  /**
   * Retrieve QuickBlox users that have phone numbers from your address book.
   * The methods accepts 1 or 2 parameters.
   * @memberof QB.addressbook
   * @param {boolean|function} udidOrCallback - You can pass isCompact parameter or callback object. If isCompact is passed then only user's id and phone fields will be returned from server. Otherwise - all standard user's fields will be returned.
   * @param {function} [callback] - Callback function is useв as 2nd parameter if you pass `isCompact` as 1st parameter.
   * This callback takes 2 arguments: an error and a response.
   */
  getRegisteredUsers: function(isCompactOrCallback, callback) {
    var self = this;
    var isCompact, cb;

    if(isFunction(isCompactOrCallback)) {
      cb = isCompactOrCallback;
    } else {
      isCompact = isCompactOrCallback;
      cb = callback;
    }

    if(!isFunction(cb)) {
      throw new Error('The QB.addressbook.get accept callback function is required.');
    }

    var ajaxParams = {
      'type': 'GET',
      'url': Utils.getUrl(config.urls.addressbookRegistered),
      'contentType': 'application/json; charset=utf-8'
    };

    if(isCompact) {
      ajaxParams.data = {'compact': 1};
    }

    this.service.ajax(ajaxParams, function(err, res) {
      if (err) {
        // Don't ask me why.
        // Thanks to backend developers for this
        var isFakeErrorEmptyAddressBook = self._isFakeErrorEmptyAddressBook(err);

        if(isFakeErrorEmptyAddressBook) {
          cb(null, []);
        } else {
          cb(err, null);
        }
      } else {
        cb(null, res);
      }
    });
  }
};

module.exports = AddressBook;

function isFunction(func) {
  return !!(func && func.constructor && func.call && func.apply);
}

},{"../qbConfig":43,"../qbUtils":47}],30:[function(require,module,exports){
'use strict';

var config = require('../qbConfig'),
    Utils = require('../qbUtils'),
    sha1 = require('crypto-js/hmac-sha1'),
    sha256 = require('crypto-js/hmac-sha256');

function AuthProxy(service) {
    this.service = service;
}

AuthProxy.prototype = {

    getSession: function(callback) {
        this.service.ajax({url: Utils.getUrl(config.urls.session)}, function(err,res){
            if (err) {
                callback(err, null);
            } else {
                callback (err, res);
            }
        });
    },

    createSession: function(params, callback) {
        if (config.creds.appId === '' ||
            config.creds.authKey === '' ||
            config.creds.authSecret === '') {
            throw new Error('Cannot create a new session without app credentials (app ID, auth key and auth secret)');
        }

        var _this = this,
            message;

        if (typeof params === 'function' && typeof callback === 'undefined') {
            callback = params;
            params = {};
        }

        // Signature of message with SHA-1 using secret key
        message = generateAuthMsg(params);
        message.signature = signMessage(message, config.creds.authSecret);

        this.service.ajax({url: Utils.getUrl(config.urls.session), type: 'POST', data: message},
            function(err, res) {
                if (err) {
                    callback(err, null);
                } else {
                    _this.service.setSession(res.session);
                    callback(null, res.session);
                }
            });
    },

    destroySession: function(callback) {
        var _this = this;

        this.service.ajax({url: Utils.getUrl(config.urls.session), type: 'DELETE', dataType: 'text'},
            function(err, res) {
                if (err) {
                    callback(err, null);
                } else {
                    _this.service.setSession(null);
                    callback(null, res);
                }
            });
    },

    login: function(params, callback) {
        var ajaxParams = {
            type: 'POST',
            url: Utils.getUrl(config.urls.login),
            data: params
        };

        function handleResponce(err, res) {
            if (err) {
              callback(err, null);
            } else {
              callback(null, res.user);
            }
        }

        this.service.ajax(ajaxParams,handleResponce);
    },

    logout: function(callback) {
        this.service.ajax({url: Utils.getUrl(config.urls.login), type: 'DELETE', dataType:'text'}, callback);
    }

};

module.exports = AuthProxy;

/* Private
---------------------------------------------------------------------- */
function generateAuthMsg(params) {
    var message = {
        application_id: config.creds.appId,
        auth_key: config.creds.authKey,
        nonce: Utils.randomNonce(),
        timestamp: Utils.unixTime()
    };

    // With user authorization
    if (params.login && params.password) {
        message.user = {login: params.login, password: params.password};
    } else if (params.email && params.password) {
        message.user = {email: params.email, password: params.password};
    } else if (params.provider) {
        // Via social networking provider (e.g. facebook, twitter etc.)
        message.provider = params.provider;
        if (params.scope) {
            message.scope = params.scope;
        }
        if (params.keys && params.keys.token) {
            message.keys = {token: params.keys.token};
        }
        if (params.keys && params.keys.secret) {
            message.keys.secret = params.keys.secret;
        }
    }

    return message;
}

function signMessage(message, secret) {
    var sessionMsg = Object.keys(message).map(function(val) {
        if (typeof message[val] === 'object') {
            return Object.keys(message[val]).map(function(val1) {
                return val + '[' + val1 + ']=' + message[val][val1];
            }).sort().join('&');
        } else {
            return val + '=' + message[val];
        }
    }).sort().join('&');


    var cryptoSessionMsg;
    
    if(config.hash === 'sha1') {
        cryptoSessionMsg = sha1(sessionMsg, secret).toString();
    } else if(config.hash === 'sha256') {
        cryptoSessionMsg = sha256(sessionMsg, secret).toString();
    } else {
        throw new Error('Quickblox SDK: unknown crypto standards, available sha1 or sha256');
    }

    return cryptoSessionMsg;
}

},{"../qbConfig":43,"../qbUtils":47,"crypto-js/hmac-sha1":2,"crypto-js/hmac-sha256":3}],31:[function(require,module,exports){
'use strict';

/*
 * QuickBlox JavaScript SDK
 *
 * Content module
 *
 * For an overview of this module and what it can be used for
 * see http://quickblox.com/modules/content
 *
 * The API itself is described at http://quickblox.com/developers/Content
 *
 */

var config = require('../qbConfig'),
    Utils = require('../qbUtils');

// For server-side applications through using npm package 'quickblox' you should include the following lines
var isBrowser = typeof window !== 'undefined';

/**
 * Content
 * @namespace QB.content
 **/
function ContentProxy(service) {
    this.service = service;
}

ContentProxy.prototype = {
    /**
     * Get a list of files for current user ({@link https://docsdev.quickblox.com/rest_api/Content_API.html#Retrieve_files read more})
     * @memberof QB.content
     * @param {object} params - Object of parameters
     * @param {number} [params.page=1] - Used to paginate the results when more than one page of files retrieved
     * @param {number} [params.per_page=10] - The maximum number of files to return per page, if not specified then the default is 10
     * @param {listOfFilesCallback} callback - The listOfFilesCallback function
     */
    list: function(params, callback) {
        /**
         * Callback for QB.content.list(params, callback)
         * @callback listOfFilesCallback
         * @param {object} error - The error object
         * @param {object} response - Object with Array of files
         */
        if (typeof params === 'function' && typeof callback === 'undefined') {
            callback = params;
            params = null;
        }

        this.service.ajax({url: Utils.getUrl(config.urls.blobs), data: params, type: 'GET'}, function(err,result){
            if (err) {
                callback(err, null);
            } else {
                callback (err, result);
            }
        });
    },

    /**
     * Create new file object ({@link https://docsdev.quickblox.com/rest_api/Content_API.html#Create_file read more})
     * @private
     * @memberof QB.content
     * @param {object} params - Object of parameters
     * @param {string} params.content_type - The file's mime ({@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types content type})
     * @param {string} params.name - The file's name
     * @param {boolean} [params.public=false] - The file's visibility. public means it will be possible to access this file without QuickBlox session token provided. Default is 'false'
     * @param {createFileCallback} callback - The createFileCallback function
     */
    create: function(params, callback) {
        /**
         * Callback for QB.content.create(params, callback)
         * @callback createFileCallback
         * @param {object} error - The error object
         * @param {object} response - The file object (blob-object-access)
         */
        this.service.ajax({
            type: 'POST',
            data: {blob: params},
            url: Utils.getUrl(config.urls.blobs)
        }, function(err, result) {
            if (err) {
                callback(err, null);
            } else {
                callback(err, result.blob);
            }
        });
    },

    /**
     * Delete file by id ({@link https://docsdev.quickblox.com/rest_api/Content_API.html#Delete_file read more})
     * @memberof QB.content
     * @param {Number} id - blob_id
     * @param {deleteFileCallback} callback - The deleteFileCallback function.
     */
    delete: function(id, callback) {
        /**
         * Callback for QB.content.delete(id, callback)
         * @callback deleteFileCallback
         * @param {object} error - The error object
         * @param {object} response - Boolean
         */
        this.service.ajax({url: Utils.getUrl(config.urls.blobs, id), type: 'DELETE', dataType: 'text'}, function(err, result) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, true);
            }
        });
    },

    /**
     * Create file > upload file > mark file as uploaded > return result.
     * @memberof QB.content
     * @param {object} params - Object of parameters
     * @param {object} params.file - File object
     * @param {string} params.name - The file's name
     * @param {string} params.type - The file's mime ({@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types content type})
     * @param {number} params.size - Size of file, in bytes
     * @param {boolean} [params.public=false] - The file's visibility. public means it will be possible to access this file without QuickBlox session token provided. Default is 'false'
     * @param {createAndUploadFileCallback} callback - The createAndUploadFileCallback function
     */
    createAndUpload: function(params, callback) {
        /**
         * Callback for QB.content.createAndUpload(params, callback).
         * @callback createAndUploadFileCallback
         * @param {object} error - The error object
         * @param {object} response - The file object (blob-object-access)
         */
        var _this = this,
            createParams= {},
            file,
            name,
            type,
            size,
            fileId;

        var clonedParams = JSON.parse(JSON.stringify(params));

        clonedParams.file.data = "...";

        file = params.file;
        name = params.name || file.name;
        type = params.type || file.type;
        size = params.size || file.size;

        createParams.name = name;
        createParams.content_type = type;

        if (params.public) {
            createParams.public = params.public;
        }

        if (params.tag_list) {
            createParams.tag_list = params.tag_list;
        }

        // Create a file object
        this.create(createParams, function(err, createResult){
            if (err) {
                callback(err, null);
            } else {
                var uri = parseUri(createResult.blob_object_access.params),
                    uploadUrl = uri.protocol + "://" + uri.authority + uri.path,
                    uploadParams = {url: uploadUrl},
                    data = {};

                fileId = createResult.id;
                createResult.size = size;

                Object.keys(uri.queryKey).forEach(function(val) {
                    data[val] = decodeURIComponent(uri.queryKey[val]);
                });

                data.file = file;
                uploadParams.data = data;

                // Upload the file to Amazon S3
                _this.upload(uploadParams, function(err, result) {
                    if (err) {
                        callback(err, null);
                    } else {
                        // Mark file as uploaded
                        _this.markUploaded({
                            id: fileId,
                            size: size
                        }, function(err, result){
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, createResult);
                            }
                        });
                    }
                });
            }
        });
    },

    /**
     * Upload a file to cloud storage ({@link https://docsdev.quickblox.com/rest_api/Content_API.html#Upload_file read more})
     * @private
     * @memberof QB.content
     * @param {Object} params - Object of parameters (see into source code of QB.content.createAndUpload(params, callback) to know how to prepare the params object)
     * @param {string} params.url - location url
     * @param {object} params.data - formed data with file
     * @param {uploadFileCallback} callback - The uploadFileCallback function
     */
    upload: function(params, callback) {
        /**
         * Callback for QB.content.upload(params, callback)
         * @callback uploadFileCallback
         * @param {object} error - The error object
         * @param {object} response - The empty object
         */
        var uploadParams = {
            type: 'POST',
            dataType: 'text',
            contentType: false,
            url: params.url,
            data: params.data
        };

        this.service.ajax(uploadParams, function(err, xmlDoc) {
            if (err) {
                callback (err, null);
            } else {
                callback (null, {});
            }
        });
    },

    /**
     * Declare file uploaded. The file's 'status' field will be set to 'complete' ({@link https://docsdev.quickblox.com/rest_api/Content_API.html#Declare_file_uploaded read more})
     * @private
     * @memberof QB.content
     * @param {object} params - Object of parameters
     * @param {number} params.blob_id - The id of file to declare as uploaded
     * @param {number} params.size - Size of file, in bytes
     * @param {markUploadedFileCallback} callback - The markUploadedFileCallback function
     */
    markUploaded: function (params, callback) {
        /**
         * Callback for QB.content.markUploaded(params, callback)
         * @callback markUploadedFileCallback
         * @param {object} error - The error object
         * @param {object} response - The empty body
         */
        this.service.ajax({
            url: Utils.getUrl(config.urls.blobs, params.id + '/complete'),
            type: 'PUT',
            data: {
                size: params.size
            },
            dataType: 'text'
        }, function(err, res){
            if (err) {
                callback (err, null);
            } else {
                callback (null, res);
            }
        });
    },

    /**
     * Retrieve file object by id (@link https://docsdev.quickblox.com/rest_api/Content_API.html#Retrieve_file read more})
     * @memberof QB.content
     * @param {number} id - The id of file to declare as uploaded
     * @param {getFileInfoByIdCallback} callback - The getFileInfoByIdCallback function return file's object.
     */
    getInfo: function (id, callback) {
        /**
         * Callback for QB.content.getInfo(id, callback)
         * @callback getFileInfoByIdCallback
         * @param {object} error - The error object
         * @param {object} response - The file object (blob-object-access)
         */
        this.service.ajax({url: Utils.getUrl(config.urls.blobs, id)}, function (err, res) {
            if (err) {
                callback (err, null);
            } else {
                callback (null, res);
            }
        });
    },

    /**
     * Download file by UID. If the file is public then it's possible to download it without a session token (@link https://docsdev.quickblox.com/rest_api/Content_API.html#Download_file read more})
     * @memberof QB.content
     * @param {String} uid - The uid of file to declare as uploaded
     * @param {downloadFileByUIDCallback} callback - The downloadFileByUIDCallback function
     */
    getFile: function (uid, callback) {
        /**
         * Callback for QB.content.getFile(uid, callback)
         * @callback downloadFileByUIDCallback
         * @param {object} error - The error object
         * @param {object} response - The file object
         */
        this.service.ajax({url: Utils.getUrl(config.urls.blobs, uid)}, function (err, res) {
            if (err) {
                callback (err, null);
            } else {
                callback (null, res);
            }
        });
    },

    /**
     * Edit a file by ID ({@link https://docsdev.quickblox.com/rest_api/Content_API.html#Download_file read more})
     * @memberof QB.content
     * @param {object} params - Object of parameters
     * @param {number} params.id - The id of file to declare as uploaded
     * @param {string} [params.name] - New file name
     * @param {updateFileCallback} callback - The updateFileCallback function
     */
    update: function (params, callback) {
        /**
         * Callback for QB.content.update(uid, callback)
         * @callback updateFileCallback
         * @param {object} error - The error object
         * @param {object} response - The file object (blob-object-access)
         */
        var data = {};

        data.blob = {};

        if (typeof params.name !== 'undefined') {
            data.blob.name = params.name;
        }

        this.service.ajax({url: Utils.getUrl(config.urls.blobs, params.id), data: data}, function(err, res) {
            if (err) {
                callback (err, null);
            } else {
                callback (null, res);
            }
        });
    },

    /**
     * Get private URL for file download by file_uid (blob_uid).
     * @memberof QB.content
     * @param {String} fileUID - The uid of file to declare as uploaded
     */
    privateUrl: function (fileUID) {
        return "https://" + config.endpoints.api + "/blobs/" + fileUID + "?token=" + this.service.getSession().token;
    },

    /**
     * Get public URL for file download by file_uid (blob_uid).
     * @memberof QB.content
     * @param {String} fileUID - The uid of file to declare as uploaded
     */
    publicUrl: function (fileUID) {
        return "https://" + config.endpoints.api + "/blobs/" + fileUID;
    }

};

module.exports = ContentProxy;

// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License
// http://blog.stevenlevithan.com/archives/parseuri
function parseUri (str) {
    var o   = parseUri.options,
        m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
        uri = {},
        i   = 14;

    while (i--) {uri[o.key[i]] = m[i] || "";}

    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
        if ($1) {uri[o.q.name][$1] = $2;}
    });

    return uri;
}

parseUri.options = {
    strictMode: false,
    key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
    q: {
        name: "queryKey",
        parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
        loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
};

},{"../qbConfig":43,"../qbUtils":47}],32:[function(require,module,exports){
'use strict';

var config = require('../qbConfig');
var Utils = require('../qbUtils');

/**
 * Custom Objects Module
 * @namespace QB.data
 **/
function DataProxy(service){
    this.service = service;
}

DataProxy.prototype = {
    /**
     * Create new custom object ({@link https://docsdev.quickblox.com/rest_api/CustomObjects_API.html#Create_object read more})
     * 
     * @memberof QB.data
     * 
     * @param {string} className - A class name to which a new object belongs
     * @param {object} data - Object of parameters (custom fields' names and their values)
     * @param {createDataCallback} callback - The createDataCallback function
     * 
     * @example
     * var data = {
     *     'name': 'John',
     *     'age':'20',
     *     'family': [
     *         'Stark',
     *         'Targaryen'
     *     ]
     * };
     * 
     * function createdDataCallback(error, response) {
     *     if (error) {
     *         console.log(error);
     *     } else {
     *         console.log(response);
     *     }
     * }
     * 
     * QB.data.create('GameOfThrones', data, createdDataCallback);
     */
    create: function(className, data, callback) {
        /**
         * Callback for QB.data.create(className, data, callback)
         * @callback createDataCallback
         * @param {object} error - The error object
         * @param {object} response - An object
         */
        var ajaxParams = {
            'type': 'POST',
            'data': data,
            'isNeedStringify': true,
            'contentType': 'application/json; charset=utf-8',
            'url': Utils.getUrl(config.urls.data, className)
        };

        this.service.ajax(ajaxParams, function(err,res) {
            if (err) {
                callback(err, null);
            } else {
                callback (err, res);
            }
        });
    },

    /**
     * Search for records of particular class ({@link https://docsdev.quickblox.com/rest_api/CustomObjects_API.html#Retrieve_objects read more})
     * 
     * @memberof QB.data
     * 
     * @param {string} className - A class name to which a new record belongs
     * @param {(object|string[])} filters - Search records with field which contains exactly specified value or by array of records' ids to retrieve
     * @param {number} [filters.skip=0] - Skip N records in search results. Useful for pagination. Default (if not specified) - 0
     * @param {number} [filters.limit=100] - Limit search results to N records. Useful for pagination. Default and max values - 100. If limit is equal to -1 only last record will be returned
     * @param {string} [filters.*] - {@link https://docsdev.quickblox.com/rest_api/CustomObjects_API.html#Retrieve_objects See more filters' parameters}
     * @param {listOfDataCallback} callback - The listOfDataCallback function
     * @example
     * var filter = {
     *     'skip': 0,
     *     'limit': 100,
     *     'sort_desc': 'updated_at',
     *     'family': {
     *         'in': 'Stark,Targaryen'
     *     }
     * };
     *
     * var ids = ['53aaa06f535c12cea9007496', '53aaa06f535c12cea9007495'];
     *
     * // use filter or ids to get records:
     * QB.data.list('GameOfThrones', filter, function(error, response) {
     *     if (error) {
     *         console.log(error);
     *     } else {
     *         console.log(response);
     *     }
     * });
     */
    list: function(className, filters, callback) {
        /**
         * Callback for QB.data.list(className, filters, callback)
         * @callback listOfDataCallback
         * @param {object} error - The error object
         * @param {object} response - Object with Array of files
         */

        // make filters an optional parameter
        if (typeof callback === 'undefined' && typeof filters === 'function') {
            callback = filters;
            filters = null;
        }
        this.service.ajax({url: Utils.getUrl(config.urls.data, className), data: filters}, function(err,result){
            if (err) {
                callback(err, null);
            } else {
                callback (err, result);
            }
        });
    },

    /**
     * Update record by ID of particular class. ({@link https://docsdev.quickblox.com/rest_api/CustomObjects_API.html#Retrieve_objects Read more})
     * @memberof QB.data
     * @param {string} className - A class name of record
     * @param {object} data - Object of parameters
     * @param {string} data._id - An ID of record to update
     * @param {updateDataCallback} callback - The updateDataCallback function
     * @example
     * QB.data.update('GameOfThrones', {
     *     '_id': '53aaa06f535c12cea9007496',
     *     'pull': {
     *         'family':'Stark'
     *     }
     * }, function(error, response) {
     *     if (error) {
     *         console.log(error);
     *     } else {
     *         console.log(response);
     *     }
     * });
     */
    update: function(className, data, callback) {
        /**
         * Callback for QB.data.update(className, data, callback)
         * @callback updateDataCallback
         * @param {object} error - The error object
         * @param {object} response - An object
         */
        this.service.ajax({
            'url': Utils.getUrl(config.urls.data, className + '/' + data._id),
            'type': 'PUT',
            'contentType': 'application/json; charset=utf-8',
            'isNeedStringify': true,
            'data': data
        }, function(err,result){
            if (err) {
                callback(err, null);
            } else {
                callback (err, result);
            }
        });
    },

    /**
     * Delete record / records by ID, IDs or criteria (filters) of particular class. <br />
     * Check out {@link https://docsdev.quickblox.com/rest_api/CustomObjects_API.html#Delete_object official documentaion} to get detailed information.
     * 
     * @memberof QB.data
     * 
     * @param {string} className - A class name of record
     * @param {(string|array|object)} requestedData - An ID of record or an array of record's ids or object of criteria rules to delete
     * @param {deletedDataCallback} callback - The deletedDataCallback function
     * 
     * @example
     * var className = 'Movie';
     * 
     * function deletedMovie(error, responce) {
     *   if(error) {
     *     throw new Error(error.toString());
     *   } else {
     *     console.log(`Deleted movies with ids: ${responce.deleted.toString()}`);
     *   }
     * }
     * 
     * // By ID, must be string
     * var id = '502f7c4036c9ae2163000002';
     * QB.data.delete(className, id, deletedMovie);
     * 
     * // By IDs, must be array
     * var ids = ['502f7c4036c9ae2163000002', '502f7c4036c9ae2163000003'];
     * QB.data.delete(className, ids, deletedMovie);
     * 
     * var criteria = { 'price': { 'gt': 100 };
     * function deletedMoviesByCriteria(error, responce) {
     *   if(error) {
     *      throw new Error(error.toString());
     *   } else {
     *      // Note! Deleted by creteria doesn't return ids of deleted objects
     *      console.log(`Deleted ${responce.deletedCount} movies`);
     *   }
     * }
     * QB.data.delete(className, criteria, deletedMoviesByCriteria);
     * 
     * 
     */
    delete: function(className, requestedData, callback) {
        /**
         * Callback for QB.data.delete(className, requestedData, callback)
         * @callback deletedDataCallback
         * @param {object} error - The error object
         * @param {object|null} response
         * @param {array} response.deleted - Array of ids of deleted records. If you delete BY CRITERIA this property will be null.
         * @param {number} response.deletedCount - count of deleted records.
         */
        var typesData = {
            id: 1,
            ids: 2,
            criteria: 3
        };

        var requestedTypeOf;

        var responceNormalized = {
            deleted: [],
            deletedCount: 0
        };

        var ajaxParams = {
            type: 'DELETE',
            dataType: 'text'
        };

        /** Define what type of data passed by client */
        if(typeof requestedData === 'string') {
            requestedTypeOf = typesData.id;
        } else if(Utils.isArray(requestedData)) {
            requestedTypeOf = typesData.ids;
        } else if(Utils.isObject(requestedData)) {
            requestedTypeOf = typesData.criteria;
        }

        if(requestedTypeOf === typesData.id) {
            ajaxParams.url = Utils.getUrl(config.urls.data, className + '/' + requestedData);
        } else if(requestedTypeOf === typesData.ids) {
            ajaxParams.url = Utils.getUrl(config.urls.data, className + '/' + requestedData.toString());
        } else if(requestedTypeOf === typesData.criteria) {
            ajaxParams.url = Utils.getUrl(config.urls.data, className + '/by_criteria');
            ajaxParams.data = requestedData;
        }

        function handleDeleteCO(error, result) {
            if (error) {
                callback(error, null);
            } else {
                var response;

                if(requestedTypeOf === typesData.id) {
                    responceNormalized.deleted.push(requestedData);
                    responceNormalized.deletedCount = responceNormalized.deleted.length;
                } else if(requestedTypeOf === typesData.ids) {
                    response = JSON.parse(result);
                    responceNormalized.deleted = response.SuccessfullyDeleted.ids.slice(0);
                    responceNormalized.deletedCount = responceNormalized.deleted.length;
                } else if(requestedTypeOf === typesData.criteria) {
                    response = JSON.parse(result);
                    responceNormalized.deleted = null;
                    responceNormalized.deletedCount = response.total_deleted;
                }

                callback (error, responceNormalized);
            }
        }

        this.service.ajax(ajaxParams, handleDeleteCO);
    },

    /**
     * Upload file to file field ({@link https://quickblox.com/developers/Custom_Objects#Upload.2FUpdate_file read more})
     * @memberof QB.data
     * @param {string} className - A class name to which a new object belongs
     * @param {object} params - Object of parameters
     * @param {string} [params.field_name] - The file's field name
     * @param {string} [params.name] - The file's name
     * @param {object} [params.file] - File object
     * @param {uploadFileToDataCallback} callback - The uploadFileToDataCallback function
     */
    uploadFile: function(className, params, callback) {
        /**
         * Callback for QB.data.uploadFile(className, params, callback)
         * @callback uploadFileToDataCallback
         * @param {object} error - The error object
         * @param {object} response - The file object
         */
        var data = {
                field_name: params.field_name,
                file: {
                    data: params.file,
                    name: params.name
                }
            };

        this.service.ajax({
            'url': Utils.getUrl(config.urls.data, className + '/' + params.id + '/file'),
            'type': 'POST',
            'fileToCustomObject': true,
            'contentType': false,
            'data': data,
        }, function(err, result){
            if (err) {
                callback(err, null);
            } else {
                callback (err, result);
            }
        });
    },

    /**
     * Download file from file field by ID ({@link https://quickblox.com/developers/Custom_Objects#Download_file read more})
     * @memberof QB.data
     * @param {string} className - A class name of record
     * @param {object} params - Object of parameters
     * @param {string} params.field_name - The file's field name
     * @param {string} params.id - The record's ID
     * @param {downloadFileFromDataCallback} callback - The downloadFileFromDataCallback function
     */
    downloadFile: function(className, params, callback) {
        /**
         * Callback for QB.data.downloadFile(className, params, callback)
         * @callback downloadFileFromDataCallback
         * @param {object} error - The error object
         * @param {object} response - The file object
         */
        var result = Utils.getUrl(config.urls.data, className + '/' + params.id + '/file');
        result += '?field_name=' + params.field_name + '&token=' + this.service.getSession().token;
        callback(null, result);
    },

    /**
     * Return file's URL from file field by ID
     * @memberof QB.data
     * @param {string} className - A class name of record
     * @param {object} params - Object of parameters
     * @param {string} params.field_name - The file's field name
     * @param {string} params.id - The record's ID
     */
    fileUrl: function(className, params) {
        var result = Utils.getUrl(config.urls.data, className + '/' + params.id + '/file');
        result += '?field_name=' + params.field_name + '&token=' + this.service.getSession().token;
        return result;
    },

    /**
     * Delete file from file field by ID ({@link https://quickblox.com/developers/Custom_Objects#Delete_file read more})
     * @memberof QB.data
     * @param {string} className - A class name of record
     * @param {object} params - Object of parameters
     * @param {string} params.field_name - The file's field name
     * @param {string} params.id - The record's ID
     * @param {deleteFileFromDataCallback} callback - The deleteFileFromDataCallback function
     */
    deleteFile: function(className, params, callback) {
        /**
         * Callback for QB.data.deleteFile(className, params, callback)
         * @callback deleteFileFromDataCallback
         * @param {object} error - The error object
         * @param {object} response - Empty body
         */
        this.service.ajax({url: Utils.getUrl(config.urls.data, className + '/' + params.id + '/file'), data: {field_name: params.field_name},
            dataType: 'text', type: 'DELETE'}, function(err, result) {
            if (err) {
                callback(err, null);
            } else {
                callback (err, true);
            }
        });
    }

};

module.exports = DataProxy;

},{"../qbConfig":43,"../qbUtils":47}],33:[function(require,module,exports){
'use strict';

/*
 * QuickBlox JavaScript SDK
 *
 * Push Notifications Module
 *
 */

var config = require('../qbConfig'),
    Utils = require('../qbUtils');

var isBrowser = typeof window !== "undefined";

function PushNotificationsProxy(service) {
    this.service = service;
    this.subscriptions = new SubscriptionsProxy(service);
    this.events = new EventsProxy(service);

    this.base64Encode = function(str) {
        if (isBrowser) {
            return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
                return String.fromCharCode('0x' + p1);
            }));
        } else {
            //return new Buffer(str).toString('base64');
        }
    };
}

/**
 * Push Notifications Subscriptions
 * @namespace QB.pushnotifications.subscriptions
 **/
function SubscriptionsProxy(service){
    this.service = service;
}

SubscriptionsProxy.prototype = {

    /**
     * Create device based subscription (subscribes) ({@link https://docsdev.quickblox.com/rest_api/Push_Notifications_API.html#Create_subscription read more})
     * @memberof QB.pushnotifications.subscriptions
     * @param {object} params - Object of parameters
     * @param {string} params.notification_channel - Declare which notification channels could be used to notify user about events. Allowed values: apns, apns_voip, gcm, mpns, bbps and email
     * @param {object} params.push_token - Object of parameters
     * @param {string} params.push_token.environment - Determine application mode. It allows conveniently separate development and production modes. Allowed values: evelopment or production
     * @param {string} [params.push_token.bundle_identifier] - A unique identifier for client's application. In iOS, this is the Bundle Identifier. In Android - package id
     * @param {string} params.push_token.client_identification_sequence - Identifies client device in 3-rd party service like APNS, GCM/FCM, BBPS or MPNS. Initially retrieved from 3-rd service and should be send to QuickBlox to let it send push notifications to the client
     * @param {object} params.device - Object of parameters
     * @param {string} params.device.platform - Platform of device, which is the source of application running. Allowed values: ios, android, windows_phone, blackberry
     * @param {string} params.device.udid - UDID (Unique Device identifier) of device, which is the source of application running. This must be anything sequence which uniquely identify particular device. This is needed to support schema: 1 User - Multiple devices
     * @param {createPushSubscriptionCallback} callback - The createPushSubscriptionCallback function
     */
    create: function(params, callback) {
        /**
         * Callback for QB.pushnotifications.subscriptions.create(params, callback)
         * @callback createPushSubscriptionCallback
         * @param {object} error - The error object
         * @param {object} response - Array of all existent user's subscriptions
         */
        this.service.ajax({url: Utils.getUrl(config.urls.subscriptions), type: 'POST', data: params}, callback);
    },

    /**
     * Retrieve subscriptions for the user which is specified in the session token ({@link https://docsdev.quickblox.com/rest_api/Push_Notifications_API.html#Retrieve_subscriptions read more})
     * @memberof QB.pushnotifications.subscriptions
     * @param {listPushSubscriptionCallback} callback - The listPushSubscriptionCallback function
     */
    list: function(callback) {
        /**
         * Callback for QB.pushnotifications.subscriptions.list(callback)
         * @callback listPushSubscriptionCallback
         * @param {object} error - The error object
         * @param {object} response - Array of all existent user's subscriptions
         */
        this.service.ajax({url: Utils.getUrl(config.urls.subscriptions)}, callback);
    },

    /**
     * Remove a subscription by its identifier (unsubscribes) ({@link https://docsdev.quickblox.com/rest_api/Push_Notifications_API.html#Remove_subscription read more})
     * @memberof QB.pushnotifications.subscriptions
     * @param {number} id - An id of subscription to remove
     * @param {deletePushSubscriptionCallback} callback - The deletePushSubscriptionCallback function
     */
    delete: function(id, callback) {
        /**
         * Callback for QB.pushnotifications.subscriptions.delete(id, callback)
         * @callback deletePushSubscriptionCallback
         * @param {object} error - The error object
         * @param {object} response - Empty body
         */
        var attrAjax = {
            'type': 'DELETE',
            'dataType': 'text',
            'url': Utils.getUrl(config.urls.subscriptions, id)
        };

        this.service.ajax(attrAjax, function(err, res){
            if (err) {
                callback(err, null);
            } else {
                callback(null, true);
            }
        });
    }
};

/**
 * Push Notifications Events
 * @namespace QB.pushnotifications.events
 **/
function EventsProxy(service){
    this.service = service;
}

EventsProxy.prototype = {
    /**
     * Create notification event. This request will immediately produce notification delivery (push notification or email) ({@link https://docsdev.quickblox.com/rest_api/Push_Notifications_API.html#Create_event read more})
     * @memberof QB.pushnotifications.events
     *
     * @param {object} params - Object of parameters
     * @param {string} params.notification_type - Type of notification. Allowed values: push or email
     * @param {string} params.environment - An environment of the notification. Allowed values: development or production
     * @param {string} params.message - A payload of event. For push notifications: if event[push_type] not present - should be Base64 encoded text. if event[push_type] specified - should be formatted as described in {@link https://quickblox.com/developers/Messages#Push_Notification_Formats QuickBlox Push Notifications Formats} For email: Base64 encoded text
     *
     * @param {string} [params.push_type] - Push Notification type. Used only if event[notification_type] = push, ignored in other cases. If not present - Notification will be delivered to all possible devices for specified users. Each platform has their own standard format. See {@link https://quickblox.com/developers/Messages#Push_Notification_Formats QuickBlox Push Notifications Formats} for more information. If specified - Notification will be delivered to the specified platform only. Allowed values: apns, apns_voip, gcm, mpns or bbps
     * @param {string} [params.event_type] - Allowed values: one_shot, fixed_date or period_date. one_shot - a one-time event, which causes by an external object (the value is only valid if the 'date' is not specified). fixed_date - a one-time event, which occurs at a specified 'date' (the value is valid only if the 'date' is given). period_date - reusable event that occurs within a given 'period' from the initial 'date' (the value is only valid if the 'period' specified). By default: fixed_date, if 'date' is specified. period_date, if 'period' is specified. one_shot, if 'date' is not specified
     * @param {string} [params.name] - The name of the event. Service information. Only for your own usage
     * @param {number} [params.period] - The period of the event in seconds. Required if the event[event_type] = period_date. Possible values: 86400 (1 day). 604800 (1 week). 2592000 (1 month). 31557600 (1 year)
     * @param {number} [params.date] - The date of the event to send on. Required if event[event_type] = fixed_date or period_date. If event[event_type] = fixed_date, the date can not be in the pas
     *
     * @param {object} [params.user] - User's object of parameters
     * @param {number[]} [params.user.ids] - Notification's recipients - should contain a string of users' ids divided by commas
     * @param {object} [params.user.tags] - User's object of tags
     * @param {string[]} [params.user.tags.any] - Notification's recipients - should contain a string of tags divided by commas. Recipients (users) must have at least one tag that specified in the list
     * @param {string[]} [params.user.tags.all] - Notification's recipients - should contain a string of tags divided by commas. Recipients (users) must exactly have only all tags that specified in list
     * @param {string[]} [params.user.tags.exclude] - Notification's recipients - should contain a string of tags divided by commas. Recipients (users) mustn't have tags that specified in list
     *
     * @param {object} [params.external_user] - External user's object of parameters
     * @param {number[]} [params.external_user.ids] - Notification's recipients - should contain a string of tags divided by commas. Recipients (users) mustn't have tags that specified in list
     *
     * @param {createPushEventCallback} callback - The createPushEventCallback function
     */
    create: function(params, callback) {
        /**
         * Callback for QB.pushnotifications.events.create(params, callback)
         * @callback createPushEventCallback
         * @param {object} error - The error object
         * @param {object} response - An event object
         */
        this.service.ajax({
            'url': Utils.getUrl(config.urls.events),
            'type': 'POST',
            'contentType': 'application/json; charset=utf-8',
            'isNeedStringify': true,
            'data': {
                'event': params
            }
        }, callback);
    },

    /** Get list of events which were created by current user ({@link https://docsdev.quickblox.com/rest_api/Push_Notifications_API.html#Retrieve_events read more})
     * @memberof QB.pushnotifications.events
     * @param {object} params - Object of parameters
     * @param {number} [params.page=1] - Used to paginate the results when more than one page of events retrieved
     * @param {number} [params.per_page=10] - The maximum number of events to return per page, if not specified then the default is 10
     * @param {listPushEventsCallback} callback - The listOfFilesCallback function
     */
    list: function(params, callback) {
        /**
         * Callback for QB.pushnotifications.events.list(params, callback)
         * @callback listPushEventsCallback
         * @param {object} error - The error object
         * @param {object} response - An array of events' objects
         */
        if (typeof params === 'function' && typeof callback ==='undefined') {
            callback = params;
            params = null;
        }

        this.service.ajax({url: Utils.getUrl(config.urls.events), data: params}, callback);
    },

    /** Retrieve an event by ID ({@link https://docsdev.quickblox.com/rest_api/Push_Notifications_API.html#Retrieve_event read more})
     * @memberof QB.pushnotifications.events
     * @param {number} id - An id of event to retrieve
     * @param {getPushEventByIdCallback} callback - The getPushEventByIdCallback function
     */
    get: function(id, callback) {
        /**
         * Callback for QB.pushnotifications.events.get(id, callback)
         * @callback getPushEventByIdCallback
         * @param {object} error - The error object
         * @param {object} response - An array of events' objects
         */
        this.service.ajax({url: Utils.getUrl(config.urls.events, id)}, callback);
    },

    /** Delete an event by ID ({@link https://docsdev.quickblox.com/rest_api/Push_Notifications_API.html#Delete_event read more})
     * @memberof QB.pushnotifications.events
     * @param {number} id - An id of event to delete
     * @param {deletePushEventByIdCallback} callback - The deletePushEventByIdCallback function
     */
    delete: function(id, callback) {
        /**
         * Callback for QB.pushnotifications.events.delete(id, callback)
         * @callback deletePushEventByIdCallback
         * @param {object} error - The error object
         * @param {object} response - Empty body
         */
        this.service.ajax({url: Utils.getUrl(config.urls.events, id), dataType: 'text', type: 'DELETE'}, callback);
    },

    /** Retrieve an event's status by ID
     * @memberof QB.pushnotifications.events
     * @param {number} id - An id of event to retrieve its status
     * @param {getPushEventStatusByIdCallback} callback - The getPushEventStatusByIdCallback function
     */
    status: function(id, callback) {
        /**
         * Callback for QB.pushnotifications.events.status(id, callback)
         * @callback getPushEventStatusByIdCallback
         * @param {object} error - The error object
         * @param {object} response - An array of events' objects
         */
        this.service.ajax({url: Utils.getUrl(config.urls.events, id + '/status')}, callback);
    }
};

module.exports = PushNotificationsProxy;

},{"../qbConfig":43,"../qbUtils":47}],34:[function(require,module,exports){
'use strict';

/*
 * QuickBlox JavaScript SDK
 *
 * Users Module
 *
 */

var config = require('../qbConfig'),
    Utils = require('../qbUtils');

var DATE_FIELDS = ['created_at', 'updated_at', 'last_request_at'];
var NUMBER_FIELDS = ['id', 'external_user_id'];

var resetPasswordUrl = config.urls.users + '/password/reset';

/**
 * @namespace QB.users
 **/
function UsersProxy(service) {
    this.service = service;
}

UsersProxy.prototype = {

    /**
     * Call this API to get a list of current users of you app. By default it returns upto 10 users, but you can change this by adding pagination parameters. You can filter the list of users by supplying a filter string. You can sort results by ask/desc ({@link https://docsdev.quickblox.com/rest_api/Users_API.html#Retrieve_Users read more})
     * @memberof QB.users
     * @param {object} params - Object of parameters
     * @param {number} [params.page=1] - Used to paginate the results when more than one page of users retrieved
     * @param {number} [params.per_page=10] - The maximum number of users to return per page, if not specified then the default is 10
     * @param {string} [params.filter] - You can filter the list of users by supplying a {@link https://quickblox.com/developers/Users#Filters filter string}. Possible operators: gt, lt, ge, le, eq, ne, between, in. Allowed fields' types: string,number,date. Allowed fields: id, full_name, email, login, phone, website, created_at, updated_at, last_request_at, external_user_id, twitter_id, twitter_digits_id, facebook_id (example: 'field_type+field_name+operator+value')
     * @param {string} [params.order] - Parameter to sort results. Possible values: asc and desc. Allowed fields' types: string,number,date. Allowed fields: id, full_name, email, login, phone, website, created_at, updated_at, last_request_at, external_user_id, twitter_id, twitter_digits_id, facebook_id ('asc+date+created_at' (format is 'sort_type+field_type+field_name'))
     * @param {listUsersCallback} callback - The listUsersCallback function
     */
    listUsers: function(params, callback) {
        /**
         * Callback for QB.users.listUsers(params, callback)
         * @callback listUsersCallback
         * @param {object} error - The error object
         * @param {object} response - Object with Array of users
         */
        var message = {}, filters = [], item;

        if (typeof params === 'function' && typeof callback === 'undefined') {
            callback = params;
            params = {};
        }

        if (params && params.filter) {
            if (Utils.isArray(params.filter)) {
                params.filter.forEach(function(el) {
                    item = generateFilter(el);
                    filters.push(item);
                });
            } else {
                item = generateFilter(params.filter);
                filters.push(item);
            }
            message.filter = filters;
        }

        if (params.order) {
            message.order = generateOrder(params.order);
        }

        if (params.page) {
            message.page = params.page;
        }

        if (params.per_page) {
            message.per_page = params.per_page;
        }

        this.service.ajax({
            url: Utils.getUrl(config.urls.users), data: message}, callback);
    },

    /**
     * Retrieve a specific user or users
     * @memberof QB.users
     * @param {(number|object)} params - {@link https://docsdev.quickblox.com/rest_api/Users_API.html#Retrieve_user_by_id User ID} (number) or object of parameters (object with one of next required properties)
     * @param {string} params.login - The login of the user to be retrieved ({@link https://docsdev.quickblox.com/rest_api/Users_API.html#Retrieve_user_by_login read more})
     * @param {string} params.full_name - The full name of users to be retrieved ({@link https://docsdev.quickblox.com/rest_api/Users_API.html#Retrieve_user_by_full_name read more})
     * @param {string} params.facebook_id - The user's facebook uid ({@link https://docsdev.quickblox.com/rest_api/Users_API.html#Retrieve_user_by_Facebook_id read more})
     * @param {string} params.twitter_id - The user's twitter uid ({@link https://docsdev.quickblox.com/rest_api/Users_API.html#Retrieve_user_by_Twitter_id read more})
     * @param {string} params.phone - The user's phone number
     * @param {string} params.email - The user's email address ({@link https://docsdev.quickblox.com/rest_api/Users_API.html#Retrieve_user_by_email read more})
     * @param {(string|string[])} params.tags - A comma separated list of tags associated with users ({@link https://docsdev.quickblox.com/rest_api/Users_API.html#Retrieve_users_by_tags read more})
     * @param {(number|string)} params.external - An uid that represents the user in an external user registry ({@link https://docsdev.quickblox.com/rest_api/Users_API.html#Retrieve_user_external_user_id read more})
     * @param {string} [params.page=1] - Used to paginate the results when more than one page of users retrieved (can be used with get by 'full_name' or 'tags')
     * @param {string} [params.per_page=10] - The maximum number of users to return per page, if not specified then the default is 10 (can be used with get by 'full_name' or 'tags')
     * @param {getUsersCallback} callback - The getUsersCallback function
     * @example
     * var params = {'email': 'example-email@gmail.com'};
     *
     * // for search by 'full_name' or 'tags':
     * // var params = {
     * //     'full_name': 'test_user',
     * //     'page': 2,
     * //     'per_page': 25
     * // };
     *
     * // for search by user's ID:
     * // var id = 53454;
     *
     * // use params or id to get records:
     * QB.users.get(params, function(error, response) {
     *     if (error) {
     *         console.log(error);
     *     } else {
     *         console.log(response);
     *     }
     * });
     */
    get: function(params, callback) {
        /**
         * Callback for QB.users.get(params, callback)
         * @callback getUsersCallback
         * @param {object} error - The error object
         * @param {object} response - The user object or object with Array of users
         */
        var url;

        if (typeof params === 'number') {
            url = params;
            params = {};
        } else {
            if (params.login) {
                url = 'by_login';
            } else if (params.full_name) {
                url = 'by_full_name';
            } else if (params.facebook_id) {
                url = 'by_facebook_id';
            } else if (params.twitter_id) {
                url = 'by_twitter_id';
            } else if (params.phone) {
                url = 'phone';
            } else if (params.email) {
                url = 'by_email';
            } else if (params.tags) {
                url = 'by_tags';
            } else if (params.external) {
                url = 'external/' + params.external;
                params = {};
            }
        }

        this.service.ajax({url: Utils.getUrl(config.urls.users, url), data: params},
            function(err, res) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, res.user || res);
                }
            });
    },

    /**
     * Registers a new app user. Call this API to register a user for the app. You must provide either a user login or email address along with their password, passing both email address and login is permitted but not required ({@link https://docsdev.quickblox.com/rest_api/Users_API.html#Sign_Up read more})
     * @memberof QB.users
     * @param {object} params - object of user's parameters
     * @param {string} params.login - The user's login name
     * @param {string} params.password - The user's password for this app
     * @param {string} params.email - The user's email address
     * @param {string} [params.full_name] - The user's full name
     * @param {string} [params.phone] - The user's phone number
     * @param {string} [params.website] - The user's web address, or other url
     * @param {string} [params.facebook_id] - The user's facebook uid
     * @param {string} [params.twitter_id] - The user's twitter uid
     * @param {number} [params.blob_id] - The id of an associated blob for this user, for example their photo
     * @param {(number|string)} [params.external_user_id] - An uid that represents the user in an external user registry
     * @param {(string|string[])} [params.tag_list] - A comma separated list of tags associated with the user. Set up user tags and address them separately in your app
     * @param {string} [params.custom_data] - The user's additional info
     * @param {createUserCallback} callback - The createUserCallback function
     */
    create: function(params, callback) {
        /**
         * Callback for QB.users.create(params, callback)
         * @callback createUserCallback
         * @param {object} error - The error object
         * @param {object} response - The user object
         */
        this.service.ajax({url: Utils.getUrl(config.urls.users), type: 'POST', data: {user: params}},
            function(err, res) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, res.user);
                }
            });
    },

    /**
     * Update current user. In normal usage, nobody except the user is allowed to modify their own data. Any fields you don’t specify will remain unchanged, so you can update just a subset of the user’s data. login/email and password may be changed, but the new login/email must not already be in use ({@link https://docsdev.quickblox.com/rest_api/Users_API.html#Update_current_user read more})
     * @memberof QB.users
     * @param {number} id - The id of user to update
     * @param {object} params - object of user's parameters
     * @param {string} [params.login] - The user's login name
     * @param {string} [params.old_password] - The user's old password for this app
     * @param {string} [params.password] - The user's new password for this app
     * @param {string} [params.email] - The user's email address
     * @param {string} [params.full_name] - The user's full name
     * @param {string} [params.phone] - The user's phone number
     * @param {string} [params.website] - The user's web address, or other url
     * @param {string} [params.facebook_id] - The user's facebook uid
     * @param {string} [params.twitter_id] - The user's twitter uid
     * @param {number} [params.blob_id] - The id of an associated blob for this user, for example their photo
     * @param {(number|string)} [params.external_user_id] - An uid that represents the user in an external user registry
     * @param {(string|string[])} [params.tag_list] - A comma separated list of tags associated with the user. Set up user tags and address them separately in your app
     * @param {string} [params.custom_data] - The user's additional info
     * @param {updateUserCallback} callback - The updateUserCallback function
     */
    update: function(id, params, callback) {
        /**
         * Callback for QB.users.update(id, params, callback)
         * @callback updateUserCallback
         * @param {object} error - The error object
         * @param {object} response - The user object
         */
        this.service.ajax({url: Utils.getUrl(config.urls.users, id), type: 'PUT', data: {user: params}},
            function(err, res) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, res.user);
                }
            });
    },

    /**
     * Remove a user from the app, {@link https://docsdev.quickblox.com/rest_api/Users_API.html#Delete_user_by_id by user's id} or {@link https://docsdev.quickblox.com/rest_api/Users_API.html#Delete_user_by_external_user_id uid that represents the user in an external user registry}
     * @memberof QB.users
     * @param {(number|object)} params - An id of user to remove or object with external user id
     * @param {(number|string)} params.external - An id of user to remove or object with external user id
     * @param {deleteUserCallback} callback - An uid that represents the user in an external user registry
     * @example
     * // parameter as user id:
     * var params = 567831;
     *
     * // parameter as external user id:
     * // var params = {'external': 'ebdf831abd12da4bcf12f22d'};
     *
     * QB.users.delete(params, function(error, response) {
     *     if (error) {
     *         console.log(error);
     *     } else {
     *         console.log(response);
     *     }
     * });
     */
    delete: function(params, callback) {
        /**
         * Callback for QB.users.delete(params, callback)
         * @callback deleteUserCallback
         * @param {object} error - The error object
         * @param {object} response - Empty body
         */
        var url;

        if (typeof params === 'number') {
            url = params;
        } else {
            if (params.external) {
                url = 'external/' + params.external;
            }
        }

        this.service.ajax({url: Utils.getUrl(config.urls.users, url), type: 'DELETE', dataType: 'text'}, callback);
    },

    /**
     * You can initiate password resets for users who have emails associated with their account. Password reset instruction will be sent to this email address ({@link https://docsdev.quickblox.com/rest_api/Users_API.html#Password_reset read more})
     * @memberof QB.users
     * @param {string} email - The user's email to send reset password instruction
     * @param {resetPasswordByEmailCallback} callback - The resetPasswordByEmailCallback function
     */
    resetPassword: function(email, callback) {
        /**
         * Callback for QB.users.resetPassword(email, callback)
         * @callback resetPasswordByEmailCallback
         * @param {object} error - The error object
         * @param {object} response - Empty body
         */
        this.service.ajax({url: Utils.getUrl(resetPasswordUrl), data: {email: email}, dataType: 'text'}, callback);
    }

};

module.exports = UsersProxy;

/* Private
---------------------------------------------------------------------- */
function generateFilter(obj) {
    var type = obj.field in DATE_FIELDS ? 'date' : typeof obj.value;

    if (Utils.isArray(obj.value)) {
        if (type === 'object') {
            type = typeof obj.value[0];
        }
        obj.value = obj.value.toString();
    }

    return [type, obj.field, obj.param, obj.value].join(' ');
}

function generateOrder(obj) {
    var type = obj.field in DATE_FIELDS ? 'date' : obj.field in NUMBER_FIELDS ? 'number' : 'string';
    return [obj.sort, type, obj.field].join(' ');
}

},{"../qbConfig":43,"../qbUtils":47}],35:[function(require,module,exports){
'use strict';

/** JSHint inline rules (TODO: loopfunc will delete) */
/* jshint loopfunc: true */
/* globals MediaStream */

/**
 * QuickBlox JavaScript SDK
 * WebRTC Module (WebRTC peer connection model)
 */

/** Modules */
var config = require('../../qbConfig');
var Helpers = require('./qbWebRTCHelpers');

var transform = require('sdp-transform');

var RTCPeerConnection = window.RTCPeerConnection;
var RTCSessionDescription = window.RTCSessionDescription;
var RTCIceCandidate = window.RTCIceCandidate;

RTCPeerConnection.State = {
    NEW: 1,
    CONNECTING: 2,
    CHECKING: 3,
    CONNECTED: 4,
    DISCONNECTED: 5,
    FAILED: 6,
    CLOSED: 7,
    COMPLETED: 8
};

RTCPeerConnection.prototype._init = function(delegate, userID, sessionID, type) {
    Helpers.trace('RTCPeerConnection init. userID: ' + userID + ', sessionID: ' + sessionID + ', type: ' + type);

    this.delegate = delegate;

    this.sessionID = sessionID;
    this.userID = userID;
    this.type = type;
    this.remoteSDP = null;
    this.ice = [];

    this.state = RTCPeerConnection.State.NEW;

    this.onicecandidate = this.onIceCandidateCallback.bind(this);
    this.onsignalingstatechange = this.onSignalingStateCallback.bind(this);
    this.oniceconnectionstatechange = this.onIceConnectionStateCallback.bind(this);

    if (Helpers.getVersionSafari() >= 11) {
        this.remoteStream = new MediaStream();
        this.ontrack = this.onAddRemoteMediaCallback.bind(this);
        this.onStatusClosedChecker = undefined;
    } else {
        this.remoteStream = null;
        this.onaddstream = this.onAddRemoteMediaCallback.bind(this);
    }

    /** We use this timer interval to dial a user - produce the call requests each N seconds. */
    this.dialingTimer = null;
    this.answerTimeInterval = 0;
    this.statsReportTimer = null;

    this.iceCandidates = [];
};

RTCPeerConnection.prototype.release = function(){

    var self = this;

    this._clearDialingTimer();
    this._clearStatsReportTimer();

    if (this.connectionState !== 'closed') {

        var streams = {
            "LocalStreams" : self.getLocalStreams(),
            "RemoteStreams" : (self.getRemoteStreams())
                .concat([this.remoteStream])
                .concat([this.stream])
        };

        if(this.remoteStreams && this.remoteStreams.length>0) {
            streams.RemoteStreams = streams.RemoteStreams.concat(this.remoteStreams);
        }

        Object.keys(streams).forEach(function (key) {
            streams[key].forEach(function (stream,index,array) {
                if(stream && stream.getTracks) {
                    stream.getTracks().forEach(function (track) {
                        if (key === "RemoteStreams") {
                            track.stop();
                        }
                        if (self.removeTrack) {
                            var tmp = self.getSenders().find(function (sender) {
                                return sender.track == track;
                            });
                            if (tmp !== undefined) {
                                self.removeTrack(tmp);
                            }
                        }
                    });
                }
                if(self.removeStream && typeof stream === "object" && stream instanceof MediaStream){
                    self.removeStream(stream);
                }else {
                    array[index] = null;
                }
            });
        });

        this.close();
        if (navigator.userAgent.indexOf("Edge") > -1) {
            this.connectionState = 'closed';
            this.iceConnectionState = 'closed';
        }

    }

    // TODO: 'closed' state doesn't fires on Safari 11 and Edge (do it manually)
    if (Helpers.getVersionSafari() >= 11 || navigator.userAgent.indexOf("Edge") > -1) {
        this.onIceConnectionStateCallback();
    }
};

RTCPeerConnection.prototype.updateRemoteSDP = function(newSDP){
    if (!newSDP) {
        throw new Error("sdp string can't be empty.");
    } else {
        this.remoteSDP = newSDP;
    }
};

RTCPeerConnection.prototype.getRemoteSDP = function(){
    return this.remoteSDP;
};

RTCPeerConnection.prototype.setRemoteSessionDescription = function(type, remoteSessionDescription, callback) {
    var self = this;
    var ffVersion = Helpers.getVersionFirefox();

    var modifiedSDP;
    if (ffVersion !== null && (ffVersion === 56 || ffVersion === 57) && !self.delegate.bandwidth) {
        modifiedSDP = _modifySDPforFixIssueFFAndFreezes(remoteSessionDescription);
    } else {
        modifiedSDP = setMediaBitrate(remoteSessionDescription, 'video', self.delegate.bandwidth);
    }
    var sessionDescription = new RTCSessionDescription({sdp: modifiedSDP, type: type});
    function successCallback(sessionDescription) {
        if(self.ice.length>0) {
            self.addCandidates();
        }
        callback(null);
    }

    function errorCallback(error) {
        callback(error);
    }

    self.setRemoteDescription(sessionDescription).then(successCallback, errorCallback);
};

RTCPeerConnection.prototype.addLocalStream = function(localStream){
    if (localStream) {
        this.addStream(localStream);
    } else {
        throw new Error("'RTCPeerConnection.addStream' error: stream is 'null'.");
    }
};

RTCPeerConnection.prototype.getAndSetLocalSessionDescription = function(callType, callback) {
    var self = this;

    self.state = RTCPeerConnection.State.CONNECTING;

    if (self.type === 'offer') {
        // Additional parameters for SDP Constraints
        // http://www.w3.org/TR/webrtc/#h-offer-answer-options

        self.createOffer().then(function(offer) {
            offer.sdp = setMediaBitrate(offer.sdp, 'video', self.delegate.bandwidth);
            successCallback(offer);
        }).catch(function(reason) {
            errorCallback(reason);
        });

    } else {
        self.createAnswer().then(function(answer) {
            answer.sdp = setMediaBitrate(answer.sdp, 'video', self.delegate.bandwidth);
            successCallback(answer);
        }).catch(function(reason) {
            errorCallback(reason);
        });
    }

    function successCallback(desc) {
        /**
         * It's to fixed issue
         * https://bugzilla.mozilla.org/show_bug.cgi?id=1377434
         * callType === 2 is audio only
         */
        var ffVersion = Helpers.getVersionFirefox();

        if (ffVersion !== null && ffVersion < 55 && callType === 2 && self.type === 'offer') {
            desc.sdp = _modifySDPforFixIssue(desc.sdp);
        }

        self.setLocalDescription(desc).then(function() {
            callback(null);
        }).catch(function(error) {
            errorCallback(error);
        });
    }

    function errorCallback(error) {
        callback(error);
    }
};

RTCPeerConnection.prototype._addIceCandidate = function(iceCandidates) {
    this.addIceCandidate(
        new RTCIceCandidate({
            sdpMLineIndex: iceCandidates.sdpMLineIndex,
            sdpMid: iceCandidates.sdpMid,
            candidate: iceCandidates.candidate
        }),
        function() {},
        function(error){
            Helpers.traceError("Error on 'addIceCandidate': " + error);
        }
    );
};

RTCPeerConnection.prototype.addCandidates = function(iceCandidates) {
    var self = this;

    if(iceCandidates && iceCandidates.length > 0){
        iceCandidates = iceCandidates.filter(iceCandidate => self.ice.indexOf(iceCandidate) === -1);
        self.ice = self.ice.concat(iceCandidates);
    }

    if(self.remoteDescription && self.remoteDescription.type){
        self.ice.forEach(function (tmp, i) {
            self._addIceCandidate(tmp);
            delete self.ice[i];
        });
    }
};

RTCPeerConnection.prototype.toString = function sessionToString() {
    return 'sessionID: ' + this.sessionID + ', userID:  ' + this.userID + ', type: ' + this.type + ', state: ' + this.state;
};

/**
 * CALLBACKS
 */
RTCPeerConnection.prototype.onSignalingStateCallback = function() {
    if (this.signalingState === 'stable' && this.iceCandidates.length > 0){
        this.delegate.processIceCandidates(this, this.iceCandidates);
        this.iceCandidates.length = 0;
    }
};

RTCPeerConnection.prototype.onIceCandidateCallback = function(event) {
    var candidate = event.candidate;

    if (candidate) {
        /**
         * collecting internally the ice candidates
         * will send a bit later
         */
        var ICECandidate = {
            sdpMLineIndex: candidate.sdpMLineIndex,
            sdpMid: candidate.sdpMid,
            candidate: candidate.candidate
        };

        if (this.signalingState === 'stable') {
            this.delegate.processIceCandidates(this, [ICECandidate]);
        } else {
            this.iceCandidates.push(ICECandidate);
        }
    }
};

/** handler of remote media stream */
RTCPeerConnection.prototype.onAddRemoteMediaCallback = function(event) {
    var self = this;

    if (typeof self.delegate._onRemoteStreamListener === 'function') {
        if (event.type === 'addstream') {
            self.remoteStream = event.stream;
        } else {
            self.remoteStream.addTrack(event.track);
        }

        if (((self.delegate.callType == 1) && self.remoteStream.getVideoTracks().length) ||
            ((self.delegate.callType == 2) && self.remoteStream.getAudioTracks().length)) {
            this.delegate._onRemoteStreamListener(self.userID, self.remoteStream);
        }

        self._getStatsWrap();
    }
};

RTCPeerConnection.prototype.onIceConnectionStateCallback = function() {
    Helpers.trace("onIceConnectionStateCallback: " + this.iceConnectionState);
    var self = this;
    /**
     * read more about all states:
     * http://w3c.github.io/webrtc-pc/#idl-def-RTCIceConnectionState
     * 'disconnected' happens in a case when a user has killed an application (for example, on iOS/Android via task manager).
     * So we should notify our user about it.
     */
    if (typeof this.delegate._onSessionConnectionStateChangedListener === 'function'){
        var connectionState = null;

        if (Helpers.getVersionSafari() >= 11) {
            clearTimeout(this.onStatusClosedChecker);
        }

        switch (this.iceConnectionState) {
            case 'checking':
                this.state = RTCPeerConnection.State.CHECKING;
                connectionState = Helpers.SessionConnectionState.CONNECTING;
                break;

            case 'connected':
                this._clearWaitingReconnectTimer();
                this.state = RTCPeerConnection.State.CONNECTED;
                connectionState = Helpers.SessionConnectionState.CONNECTED;
                break;

            case 'completed':
                this._clearWaitingReconnectTimer();
                this.state = RTCPeerConnection.State.COMPLETED;
                connectionState = Helpers.SessionConnectionState.COMPLETED;
                break;

            case 'failed':
                this.state = RTCPeerConnection.State.FAILED;
                connectionState = Helpers.SessionConnectionState.FAILED;
                break;

            case 'disconnected':
                this._startWaitingReconnectTimer();
                this.state = RTCPeerConnection.State.DISCONNECTED;
                connectionState = Helpers.SessionConnectionState.DISCONNECTED;

                // repeat to call onIceConnectionStateCallback to get status "closed"
                if (Helpers.getVersionSafari() >= 11) {
                    this.onStatusClosedChecker = setTimeout(function() {
                        self.onIceConnectionStateCallback();
                    }, 500);
                }
                break;

            // TODO: this state doesn't fires on Safari 11
            case 'closed':
                this._clearWaitingReconnectTimer();
                this.state = RTCPeerConnection.State.CLOSED;
                connectionState = Helpers.SessionConnectionState.CLOSED;
                break;

            default:
                break;
        }

        if (connectionState) {
            self.delegate._onSessionConnectionStateChangedListener(this.userID, connectionState);
        }
    }
};

/**
 * PRIVATE
 */
RTCPeerConnection.prototype._clearStatsReportTimer = function(){
    if (this.statsReportTimer){
        clearInterval(this.statsReportTimer);
        this.statsReportTimer = null;
    }
};

RTCPeerConnection.prototype._getStatsWrap = function() {
    var self = this,
        statsReportInterval,
        lastResult;

    if (config.webrtc && config.webrtc.statsReportTimeInterval) {
        if (isNaN(+config.webrtc.statsReportTimeInterval)) {
            Helpers.traceError('statsReportTimeInterval (' + config.webrtc.statsReportTimeInterval + ') must be integer.');
            return;
        }
        statsReportInterval = config.webrtc.statsReportTimeInterval * 1000;

        var _statsReportCallback = function() {
            _getStats(self, lastResult, function(results, lastResults) {
                lastResult = lastResults;
                self.delegate._onCallStatsReport(self.userID, results, null);
            }, function errorLog(err) {
                Helpers.traceError('_getStats error. ' + err.name + ': ' + err.message);
                self.delegate._onCallStatsReport(self.userID, null, err);
            });
        };

        Helpers.trace('Stats tracker has been started.');
        self.statsReportTimer = setInterval(_statsReportCallback, statsReportInterval);
    }
};

RTCPeerConnection.prototype._clearWaitingReconnectTimer = function() {
    if(this.waitingReconnectTimeoutCallback){
        Helpers.trace('_clearWaitingReconnectTimer');
        clearTimeout(this.waitingReconnectTimeoutCallback);
        this.waitingReconnectTimeoutCallback = null;
    }
};

RTCPeerConnection.prototype._startWaitingReconnectTimer = function() {
    var self = this,
        timeout = config.webrtc.disconnectTimeInterval * 1000,
        waitingReconnectTimeoutCallback = function() {
            Helpers.trace('waitingReconnectTimeoutCallback');

            clearTimeout(self.waitingReconnectTimeoutCallback);

            self.release();

            self.delegate._closeSessionIfAllConnectionsClosed();
        };

    Helpers.trace('_startWaitingReconnectTimer, timeout: ' + timeout);
    if (!self.waitingReconnectTimeoutCallback) {
        self.waitingReconnectTimeoutCallback = setTimeout(waitingReconnectTimeoutCallback, timeout);
    }
};

RTCPeerConnection.prototype._clearDialingTimer = function(){
    if(this.dialingTimer){
        Helpers.trace('_clearDialingTimer');

        clearInterval(this.dialingTimer);
        this.dialingTimer = null;
        this.answerTimeInterval = 0;
    }
};

RTCPeerConnection.prototype._startDialingTimer = function(extension, withOnNotAnswerCallback){
    var self = this;
    var dialingTimeInterval = config.webrtc.dialingTimeInterval*1000;

    Helpers.trace('_startDialingTimer, dialingTimeInterval: ' + dialingTimeInterval);

    var _dialingCallback = function(extension, withOnNotAnswerCallback, skipIncrement){
        if(!skipIncrement){
            self.answerTimeInterval += config.webrtc.dialingTimeInterval*1000;
        }

        Helpers.trace('_dialingCallback, answerTimeInterval: ' + self.answerTimeInterval);

        if(self.answerTimeInterval >= config.webrtc.answerTimeInterval*1000){
            self._clearDialingTimer();

            if(withOnNotAnswerCallback){
                self.delegate.processOnNotAnswer(self);
            }
        }else{
            self.delegate.processCall(self, extension);
        }
    };

    self.dialingTimer = setInterval(_dialingCallback, dialingTimeInterval, extension, withOnNotAnswerCallback, false);

    // call for the 1st time
    _dialingCallback(extension, withOnNotAnswerCallback, true);
};

/**
 * PRIVATE
 */
function _getStats(peer, lastResults, successCallback, errorCallback) {
    var statistic = {
        'local': {
            'audio': {},
            'video': {},
            'candidate': {}
        },
        'remote': {
            'audio': {},
            'video': {},
            'candidate': {}
        }
    };

    if (Helpers.getVersionFirefox()) {
        var localStream = peer.getLocalStreams().length ? peer.getLocalStreams()[0] : peer.delegate.localStream,
            localVideoSettings = localStream.getVideoTracks().length ? localStream.getVideoTracks()[0].getSettings() : null;

        statistic.local.video.frameHeight = localVideoSettings && localVideoSettings.height;
        statistic.local.video.frameWidth = localVideoSettings && localVideoSettings.width;
    }

    peer.getStats(null).then(function(results) {
        results.forEach(function(result) {
            var item;

            if (result.bytesReceived && result.type === 'inbound-rtp') {
                item = statistic.remote[result.mediaType];
                item.bitrate = _getBitratePerSecond(result, lastResults, false);
                item.bytesReceived = result.bytesReceived;
                item.packetsReceived = result.packetsReceived;
                item.timestamp = result.timestamp;
                if (result.mediaType === 'video' && result.framerateMean) {
                    item.framesPerSecond = Math.round(result.framerateMean * 10) / 10;
                }
            } else if (result.bytesSent && result.type === 'outbound-rtp') {
                item = statistic.local[result.mediaType];
                item.bitrate = _getBitratePerSecond(result, lastResults, true);
                item.bytesSent = result.bytesSent;
                item.packetsSent = result.packetsSent;
                item.timestamp = result.timestamp;
                if (result.mediaType === 'video' && result.framerateMean) {
                    item.framesPerSecond = Math.round(result.framerateMean * 10) / 10;
                }
            } else if (result.type === 'local-candidate') {
                item = statistic.local.candidate;
                if (result.candidateType === 'host' && result.mozLocalTransport === 'udp' && result.transport === 'udp') {
                    item.protocol = result.transport;
                    item.ip = result.ipAddress;
                    item.port = result.portNumber;
                } else if (!Helpers.getVersionFirefox()) {
                    item.protocol = result.protocol;
                    item.ip = result.ip;
                    item.port = result.port;
                }
            } else if (result.type === 'remote-candidate') {
                item = statistic.remote.candidate;
                item.protocol = result.protocol || result.transport;
                item.ip = result.ip || result.ipAddress;
                item.port = result.port || result.portNumber;
            } else if (result.type === 'track' && result.kind === 'video' && !Helpers.getVersionFirefox()) {
                if (result.remoteSource) {
                    item = statistic.remote.video;
                    item.frameHeight = result.frameHeight;
                    item.frameWidth = result.frameWidth;
                    item.framesPerSecond = _getFramesPerSecond(result, lastResults, false);
                } else {
                    item = statistic.local.video;
                    item.frameHeight = result.frameHeight;
                    item.frameWidth = result.frameWidth;
                    item.framesPerSecond = _getFramesPerSecond(result, lastResults, true);
                }
            }
        });
        successCallback(statistic, results);
    }, errorCallback);

    function _getBitratePerSecond(result, lastResults, isLocal) {
        var lastResult = lastResults && lastResults.get(result.id),
            seconds = lastResult ? ((result.timestamp - lastResult.timestamp) / 1000) : 5,
            kilo = 1024,
            bit = 8,
            bitrate;

        if (!lastResult) {
            bitrate = 0;
        } else if (isLocal) {
            bitrate = bit * (result.bytesSent - lastResult.bytesSent) / (kilo * seconds);
        } else {
            bitrate = bit * (result.bytesReceived - lastResult.bytesReceived) / (kilo * seconds);
        }

        return Math.round(bitrate);
    }

    function _getFramesPerSecond(result, lastResults, isLocal) {
        var lastResult = lastResults && lastResults.get(result.id),
            seconds = lastResult ? ((result.timestamp - lastResult.timestamp) / 1000) : 5,
            framesPerSecond;

        if (!lastResult) {
            framesPerSecond = 0;
        } else if (isLocal) {
            framesPerSecond = (result.framesSent - lastResult.framesSent) / seconds;
        } else {
            framesPerSecond = (result.framesReceived - lastResult.framesReceived) / seconds;
        }

        return Math.round(framesPerSecond * 10) / 10;
    }
}

/**
 * It's functions to fixed issue
 * https://bugzilla.mozilla.org/show_bug.cgi?id=1377434
 */
function _modifySDPforFixIssue(sdp) {
    var parsedSDP = transform.parse(sdp);

    parsedSDP.groups = parsedSDP.groups ? parsedSDP.groups : [];
    parsedSDP.groups.push({
        mids: 'sdparta_0',
        type: 'BUNDLE'
    });

    return transform.write(parsedSDP);
}

/**
 * It's functions to fixed issue
 * https://blog.mozilla.org/webrtc/when-your-video-freezes/
 */
function _modifySDPforFixIssueFFAndFreezes(sdp) {
    return setMediaBitrate(sdp, 'video', 12288);
}

function setMediaBitrate(sdp, media, bitrate) {
    if (!bitrate) {
        var modifiedSDP = sdp.replace(/b=AS:.*\r\n/, '').replace(/b=TIAS:.*\r\n/, '');
        return modifiedSDP;
    }

    var lines = sdp.split('\n'),
        line = -1,
        modifier = Helpers.getVersionFirefox() ? 'TIAS' : 'AS',
        amount = Helpers.getVersionFirefox() ? bitrate*1024 : bitrate;

    for (var i = 0; i < lines.length; i++) {
        if (lines[i].indexOf("m="+media) === 0) {
            line = i;
            break;
        }
    }

    if (line === -1) {
        return sdp;
    }

    line++;

    while(lines[line].indexOf('i=') === 0 || lines[line].indexOf('c=') === 0) {
        line++;
    }

    if (lines[line].indexOf('b') === 0) {
        lines[line] = 'b='+modifier+':'+amount;
        return lines.join('\n');
    }

    var newLines = lines.slice(0, line);
    newLines.push('b='+modifier+':'+amount);
    newLines = newLines.concat(lines.slice(line, lines.length));

    return newLines.join('\n');
}

module.exports = RTCPeerConnection;

},{"../../qbConfig":43,"./qbWebRTCHelpers":37,"sdp-transform":9}],36:[function(require,module,exports){
'use strict';

/**
 * QuickBlox JavaScript SDK
 * WebRTC Module (WebRTC client)
 */

/*
 * User's callbacks (listener-functions):
 * - onCallListener(session, extension)
 * - onAcceptCallListener(session, userID, extension)
 * - onRejectCallListener(session, userID, extension)
 * - onStopCallListener(session, userID, extension)
 * - onUpdateCallListener(session, userID, extension)
 * - onInvalidEventsListener (state, session, userID, extension)
 * - onDevicesChangeListener()
 */

var WebRTCSession = require('./qbWebRTCSession');
var WebRTCSignalingProcessor = require('./qbWebRTCSignalingProcessor');
var WebRTCSignalingProvider = require('./qbWebRTCSignalingProvider');
var Helpers = require('./qbWebRTCHelpers');
var RTCPeerConnection = require('./qbRTCPeerConnection');
var SignalingConstants = require('./qbWebRTCSignalingConstants');
var Utils = require('../../qbUtils');
var config = require('../../qbConfig');

function WebRTCClient(service, connection) {

    this.connection = connection;
    this.signalingProcessor = new WebRTCSignalingProcessor(service, this, connection);
    this.signalingProvider = new WebRTCSignalingProvider(service, connection);

    this.SessionConnectionState = Helpers.SessionConnectionState;
    this.CallType = Helpers.CallType;
    this.PeerConnectionState = RTCPeerConnection.State;

    this.sessions = {};

    if (navigator.mediaDevices && 'ondevicechange' in navigator.mediaDevices) {
        navigator.mediaDevices.ondevicechange = this._onDevicesChangeListener.bind(this);
    }

}

/**
 * [Return data or all active devices]
 * @param  {String} spec [specify what type of devices you wnat to get.
 *                         Possible values: audioinput, audiooutput, videoinput]
 * @returns {Array}       [array of devices]
 */
WebRTCClient.prototype.getMediaDevices = function(spec) {
    var specDevices = [],
        errMsg = 'Browser does not support output device selection.';

    return new Promise(function(resolve, reject) {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            reject(errMsg);
            Helpers.traceWarning(errMsg);
        } else {
            navigator.mediaDevices.enumerateDevices().then(function(devices) {
                if(spec) {
                    devices.forEach(function(device, i) {
                        if(device.kind === spec) {
                            specDevices.push(device);
                        }
                    });

                    resolve(specDevices);
                } else {
                    resolve(devices);
                }
            });
        }
    });
};

/**
 * A map with all sessions the user had/have.
 * @type {Object.<string, Object>}
 */
WebRTCClient.prototype.sessions = {};

/**
 * Creates the new session.
 * @param  {array} opponentsIDs      - Opponents IDs
 * @param  {number} ct               - Call type
 * @param  {number} [cID=yourUserId] - Initiator ID
 * @param  {object} [opts]
 * @param  {number} [opts.bandwidth=0] - Bandwidth limit (kbps)
 */
WebRTCClient.prototype.createNewSession = function(opponentsIDs, ct, cID, opts) {
    var opponentsIdNASessions = getOpponentsIdNASessions(this.sessions),
        callerID = cID || Helpers.getIdFromNode(this.connection.jid),
        bandwidth = opts && opts.bandwidth && (!isNaN(opts.bandwidth)) ? +opts.bandwidth : 0,
        isIdentifyOpponents = false,
        callType = ct || 2;

    if (!opponentsIDs) {
        throw new Error('Can\'t create a session without the opponentsIDs.');
    }

    isIdentifyOpponents = isOpponentsEqual(opponentsIdNASessions, opponentsIDs);

    if (!isIdentifyOpponents) {
        return this._createAndStoreSession(null, callerID, opponentsIDs, callType, bandwidth);
    } else {
        throw new Error('Can\'t create a session with the same opponentsIDs. There is a session already in NEW or ACTIVE state.');
    }
};

WebRTCClient.prototype._createAndStoreSession = function(sessionID, callerID, opponentsIDs, callType, bandwidth) {
    var newSession = new WebRTCSession({
        sessionID: sessionID,
        initiatorID: callerID,
        opIDs: opponentsIDs,
        callType: callType,
        signalingProvider: this.signalingProvider,
        currentUserID: Helpers.getIdFromNode(this.connection.jid),
        bandwidth: bandwidth
    });

    /** set callbacks */
    newSession.onUserNotAnswerListener = this.onUserNotAnswerListener;
    newSession.onRemoteStreamListener = this.onRemoteStreamListener;
    newSession.onSessionConnectionStateChangedListener = this.onSessionConnectionStateChangedListener;
    newSession.onSessionCloseListener = this.onSessionCloseListener;
    newSession.onCallStatsReport = this.onCallStatsReport;

    this.sessions[newSession.ID] = newSession;
    return newSession;
};

/**
 * Deletes a session
 * @param {string} Session ID
 *
 */
WebRTCClient.prototype.clearSession = function(sessionId) {
    delete WebRTCClient.sessions[sessionId];
};

/**
 * Check all session and find session with status 'NEW' or 'ACTIVE' which ID != provided
 * @param {string} session ID
 * @returns {boolean} if active or new session exist
 */
WebRTCClient.prototype.isExistNewOrActiveSessionExceptSessionID = function(sessionID) {
    var exist = false;
    var sessions = this.sessions;

    if (Object.keys(sessions).length > 0) {
        exist = Object.keys(sessions).some(function (key) {
            var session = sessions[key];
            var sessionActive = (
                session.state === WebRTCSession.State.NEW ||
                session.state === WebRTCSession.State.ACTIVE
            );
            return sessionActive && session.ID !== sessionID;
        });
    }

    return exist;
};

WebRTCClient.prototype.getNewSessionsCount = function (exceptId) {
    var sessions = this.sessions;
    return Object.keys(sessions).reduce(function (count, sessionId) {
        var session = sessions[sessionId];
        if (session.ID === exceptId) {
            return count;
        }
        var sessionActive = (
            session.state === WebRTCSession.State.NEW
        );
        return sessionActive ? count + 1 : count;
    }, 0);
};

/**
 * DELEGATE (signaling)
 */
WebRTCClient.prototype._onCallListener = function(userID, sessionID, extension) {
    var userInfo = extension.userInfo || {};

    Helpers.trace("onCall. UserID:" + userID + ". SessionID: " + sessionID);

    var otherActiveSessions = this.isExistNewOrActiveSessionExceptSessionID(sessionID);
    var newSessionsCount = this.getNewSessionsCount(sessionID);
    if (otherActiveSessions && !this.sessions[sessionID]) {
        newSessionsCount++;
    }

    var reject = (
        otherActiveSessions &&
        (config.webrtc.autoReject || newSessionsCount > config.webrtc.incomingLimit)
    );

    if (reject) {
        Helpers.trace('User with id ' + userID + ' is busy at the moment.');

        delete extension.sdp;
        delete extension.platform;
        extension.sessionID = sessionID;

        this.signalingProvider.sendMessage(userID, extension, SignalingConstants.SignalingType.REJECT);

        if (typeof this.onInvalidEventsListener  === 'function'){
            Utils.safeCallbackCall(this.onInvalidEventsListener, 'onCall', sessionID, userID, userInfo);
        }
    } else {
        var session = this.sessions[sessionID],
            bandwidth = +userInfo.bandwidth || 0;

        if (!session) {
            session = this._createAndStoreSession(
                sessionID,
                extension.callerID,
                extension.opponentsIDs,
                extension.callType,
                bandwidth
            );
            if (typeof this.onCallListener === 'function') {
                Utils.safeCallbackCall(this.onCallListener, session, userInfo);
            }
        }

        session.processOnCall(userID, extension);
    }
};

WebRTCClient.prototype._onAcceptListener = function(userID, sessionID, extension) {
    var session = this.sessions[sessionID],
        userInfo = extension.userInfo || {};

    Helpers.trace("onAccept. UserID:" + userID + ". SessionID: " + sessionID);

    if (session) {
        if (session.state === WebRTCSession.State.ACTIVE) {
            if (typeof this.onAcceptCallListener === 'function') {
                Utils.safeCallbackCall(this.onAcceptCallListener, session, userID, userInfo);
            }

            session.processOnAccept(userID, extension);
        } else {
            if (typeof this.onInvalidEventsListener === 'function'){
                Utils.safeCallbackCall(this.onInvalidEventsListener, 'onAccept', session, userID, userInfo);
            }

            Helpers.traceWarning("Ignore 'onAccept', the session( " + sessionID + " ) has invalid state.");
        }
    } else {
        Helpers.traceError("Ignore 'onAccept', there is no information about session " + sessionID + " by some reason.");
    }
};

WebRTCClient.prototype._onRejectListener = function(userID, sessionID, extension) {
    var that = this,
        session = that.sessions[sessionID];

    Helpers.trace("onReject. UserID:" + userID + ". SessionID: " + sessionID);

    if (session) {
        var userInfo = extension.userInfo || {};

        if (typeof this.onRejectCallListener === 'function') {
            Utils.safeCallbackCall(that.onRejectCallListener, session, userID, userInfo);
        }

        session.processOnReject(userID, extension);
    } else {
        Helpers.traceError("Ignore 'onReject', there is no information about session " + sessionID + " by some reason.");
    }
};

WebRTCClient.prototype._onStopListener = function(userID, sessionID, extension) {
    Helpers.trace("onStop. UserID:" + userID + ". SessionID: " + sessionID);

    var session = this.sessions[sessionID],
        userInfo = extension.userInfo || {};

    if (session && (session.state === WebRTCSession.State.ACTIVE || session.state === WebRTCSession.State.NEW)) {
        if (typeof this.onStopCallListener === 'function') {
            Utils.safeCallbackCall(this.onStopCallListener, session, userID, userInfo);
        }

        // Need to make this asynchronously, to keep the strophe handler alive
        setTimeout(session.processOnStop.bind(session), 10, userID, extension);
    } else {
        if (typeof this.onInvalidEventsListener === 'function'){
            Utils.safeCallbackCall(this.onInvalidEventsListener, 'onStop', session, userID, userInfo);
        }

        Helpers.traceError("Ignore 'onStop', there is no information about session " + sessionID + " by some reason.");
    }
};

WebRTCClient.prototype._onIceCandidatesListener = function(userID, sessionID, extension) {
    var session = this.sessions[sessionID];

    Helpers.trace("onIceCandidates. UserID:" + userID + ". SessionID: " + sessionID + ". ICE candidates count: " + extension.iceCandidates.length);

    if (session) {
        if (session.state === WebRTCSession.State.ACTIVE) {
            session.processOnIceCandidates(userID, extension);
        } else {
            Helpers.traceWarning('Ignore \'OnIceCandidates\', the session ( ' + sessionID + ' ) has invalid state.');
        }
    } else {
        Helpers.traceError("Ignore 'OnIceCandidates', there is no information about session " + sessionID + " by some reason.");
    }
};

WebRTCClient.prototype._onUpdateListener = function(userID, sessionID, extension) {
    var session = this.sessions[sessionID],
        userInfo = extension.userInfo || {};

    Helpers.trace("onUpdate. UserID:" + userID + ". SessionID: " + sessionID + ". Extension: " + JSON.stringify(userInfo));

    if (typeof this.onUpdateCallListener === 'function') {
        Utils.safeCallbackCall(this.onUpdateCallListener, session, userID, userInfo);
    }
};

WebRTCClient.prototype._onDevicesChangeListener = function() {
    if (typeof this.onDevicesChangeListener === 'function') {
        Utils.safeCallbackCall(this.onDevicesChangeListener);
    }
};

module.exports = WebRTCClient;

/**
 * PRIVATE FUNCTIONS
 */
function isOpponentsEqual(exOpponents, currentOpponents) {
    var ans = false,
        cOpponents = currentOpponents.sort();

    if (exOpponents.length) {
        exOpponents.forEach(function(i) {
            var array = i.sort();

            ans = (array.length == cOpponents.length) && array.every(function(el, index) {
                return el === cOpponents[index];
            });
        });
    }

    return ans;
}

function getOpponentsIdNASessions(sessions) {
    var opponents = [];

    if (Object.keys(sessions).length > 0) {
        Object.keys(sessions).forEach(function(key, i, arr) {
            var session = sessions[key];
            if (session.state === WebRTCSession.State.NEW || session.state === WebRTCSession.State.ACTIVE) {
                opponents.push(session.opponentsIDs);
            }
        });
    }

    return opponents;
}

},{"../../qbConfig":43,"../../qbUtils":47,"./qbRTCPeerConnection":35,"./qbWebRTCHelpers":37,"./qbWebRTCSession":38,"./qbWebRTCSignalingConstants":39,"./qbWebRTCSignalingProcessor":40,"./qbWebRTCSignalingProvider":41}],37:[function(require,module,exports){
'use strict';

/**
 * QuickBlox JavaScript SDK
 * WebRTC Module (WebRTC helpers)
 */

var config = require('../../qbConfig');

var WebRTCHelpers = {};

WebRTCHelpers = {
    getUserJid: function(id, appId) {
        return id + '-' + appId + '@' + config.endpoints.chat;
    },

    getIdFromNode: function(jid) {
        if (jid.indexOf('@') < 0) return null;
        return parseInt(jid.split('@')[0].split('-')[0]);
    },

    trace: function(text) {
        if (config.debug) {
            console.log('[QBWebRTC]:', text);
        }
    },

    traceWarning: function(text) {
        if (config.debug) {
            console.warn('[QBWebRTC]:', text);
        }
    },

    traceError: function(text) {
        if (config.debug) {
            console.error('[QBWebRTC]:', text);
        }
    },

    getLocalTime: function() {
        var arr = new Date().toString().split(' ');
        return arr.slice(1,5).join('-');
    },

    // Convert Data URI to Blob
    dataURItoBlob: function(dataURI, contentType) {
        var arr = [],
            binary = window.atob(dataURI.split(',')[1]);

        for (var i = 0, len = binary.length; i < len; i++) {
            arr.push(binary.charCodeAt(i));
        }

        return new Blob([new Uint8Array(arr)], {type: contentType});
    },

    /**
     * It's functions to fixed issue
     * https://bugzilla.mozilla.org/show_bug.cgi?id=1377434
     */
    getVersionFirefox: function() {
        var ua = navigator ? navigator.userAgent : false;
        var version;

        if (ua) {
            var ffInfo = ua.match(/(?:firefox)[ \/](\d+)/i) || [];
            version = ffInfo[1] ? + ffInfo[1] : null;
        }

        return version;
    },

    getVersionSafari: function() {
        var ua = navigator ? navigator.userAgent : false;
        var version;

        if (ua) {
            var sInfo = ua.match(/(?:safari)[ \/](\d+)/i) || [];

            if (sInfo.length) {
                var sVer = ua.match(/(?:version)[ \/](\d+)/i) || [];

                if (sVer) {
                    version = sVer[1] ? + sVer[1] : null;
                } else {
                    version = null;
                }
            } else {
                version = null;
            }
        }

        return version;
    }
};

/**
 * [SessionConnectionState]
 * @type {Object}
 */
WebRTCHelpers.SessionConnectionState = {
    UNDEFINED: 0,
    CONNECTING: 1,
    CONNECTED: 2,
    FAILED: 3,
    DISCONNECTED: 4,
    CLOSED: 5,
    COMPLETED: 6
};

/**
 * [CallType]
 * @type {Object}
 */
WebRTCHelpers.CallType = {
    VIDEO: 1,
    AUDIO: 2
};

module.exports = WebRTCHelpers;

},{"../../qbConfig":43}],38:[function(require,module,exports){
'use strict';

/**
 * QuickBlox JavaScript SDK
 * WebRTC Module (WebRTC session model)
 */

/**
 * User's callbacks (listener-functions):
 * - onUserNotAnswerListener(session, userID)
 * - onRemoteStreamListener(session, userID, stream)
 * - onSessionConnectionStateChangedListener(session, userID, connectionState)
 * - onSessionCloseListener(session)
 * - onCallStatsReport(session, userId, stats, error)
 */

var config = require('../../qbConfig');
var RTCPeerConnection = require('./qbRTCPeerConnection');
var Utils = require('../../qbUtils');
var Helpers = require('./qbWebRTCHelpers');
var SignalingConstants = require('./qbWebRTCSignalingConstants');

/**
 * State of a session
 */
WebRTCSession.State = {
    NEW: 1,
    ACTIVE: 2,
    HUNGUP: 3,
    REJECTED: 4,
    CLOSED: 5
};


/**
 * Creates a session
 * @param {number} An ID if the call's initiator
 * @param {array} An array with opponents
 * @param {enum} Type of a call
 */
function WebRTCSession(params) {
    this.ID = params.sessionID ? params.sessionID : generateUUID();
    this.state = WebRTCSession.State.NEW;

    this.initiatorID = parseInt(params.initiatorID);
    this.opponentsIDs = params.opIDs;
    this.callType = parseInt(params.callType);

    this.peerConnections = {};

    this.localStream = null;

    this.mediaParams = null;

    this.signalingProvider = params.signalingProvider;

    this.currentUserID = params.currentUserID;

    this.bandwidth = params.bandwidth;

    /**
     * We use this timeout to fix next issue:
     * "From Android/iOS make a call to Web and kill the Android/iOS app instantly. Web accept/reject popup will be still visible.
     * We need a way to hide it if sach situation happened."
     */
    this.answerTimer = null;

    this.startCallTime = 0;
    this.acceptCallTime = 0;
}

/**
 * Get the user media stream
 * @param {map} A map media stream constrains
 * @param {function} A callback to get a result of the function
 */
WebRTCSession.prototype.getUserMedia = function(params, callback) {
    if(!navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia() is not supported in your browser');
    }

    var self = this;

    /**
     * Additional parameters for Media Constraints
     * http://tools.ietf.org/html/draft-alvestrand-constraints-resolution-00
     *
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
     */

    navigator.mediaDevices.getUserMedia({
        audio: params.audio || false,
        video: params.video || false
    }).then(function(stream) {
        self.localStream = stream;
        self.mediaParams = params;

        if (params.elemId) {
            self.attachMediaStream(params.elemId, stream, params.options);
        }

        callback(null, stream);
    }).catch(function(err) {
        callback(err, null);
    });
};

/**
 * Get the state of connection
 * @param {number} The User Id
 */
WebRTCSession.prototype.connectionStateForUser = function(userID) {
    var peerConnection = this.peerConnections[userID];

    if (peerConnection) {
        return peerConnection.state;
    }

    return null;
};

/**
 * Attach media stream to audio/video element
 * @param {string} The Id of an ellement to attach a stream
 * @param {object} The steram to attach
 * @param {object} The additional options
 */
WebRTCSession.prototype.attachMediaStream = function(id, stream, options) {
    var elem = document.getElementById(id);

    if (elem) {
        if (typeof elem.srcObject === 'object') {
            elem.srcObject = stream;
        } else {
            elem.src = window.URL.createObjectURL(stream);
        }

        if (options && options.muted) {
            elem.muted = true;
        }

        if (options && options.mirror) {
            elem.style.webkitTransform = 'scaleX(-1)';
            elem.style.transform = 'scaleX(-1)';
        }

        elem.onloadedmetadata = function(e) {
            elem.play();
        };
    } else {
        throw new Error('Unable to attach media stream, element ' + id  + ' is undefined');
    }
};

/**
 * Detach media stream from audio/video element
 * @param {string} The Id of an element to detach a stream
 */
WebRTCSession.prototype.detachMediaStream = function(id) {
    var elem = document.getElementById(id);

    if (elem) {
        elem.pause();

        if (elem.srcObject && typeof elem.srcObject === 'object') {
            elem.srcObject.getTracks().forEach(
                function(track){
                    track.stop();
                    track.enabled = false;
                }
            );
            elem.srcObject = null;
        } else {
            elem.src = '';
        }

        elem.removeAttribute("src");
        elem.removeAttribute("srcObject");
    }
};

/**
 * Switch media tracks in audio/video HTML's element and replace its in peers.
 * @param {object} deviceIds - the object with deviceIds of plugged devices
 * @param {string} [deviceIds.audio] - the deviceId, it can be gotten from QB.webrtc.getMediaDevices('audioinput')
 * @param {string} [deviceIds.video] - the deviceId, it can be gotten from QB.webrtc.getMediaDevices('videoinput')
 * @param {switchMediaTracksCallback} callback - the callback to get a result of the function
 *
 * @example
 * var switchMediaTracksBtn = document.getElementById('confirmSwitchMediaTracks');
 *
 * var webRTCSession = QB.webrtc.createNewSession(params);
 *
 * QB.webrtc.getMediaDevices('videoinput').then(function(devices) {
 *     var selectVideoInput = document.createElement('select'),
 *         selectVideoInput.id = 'videoInput',
 *         someDocumentElement.appendChild(selectVideoInput);
 * 
 *     if (devices.length > 1) {
 *         for (var i = 0; i !== devices.length; ++i) {
 *             var device = devices[i],
 *                 option = document.createElement('option');
 * 
 *             if (device.kind === 'videoinput') {
 *                 option.value = device.deviceId;
 *                 option.text = device.label;
 *                 selectVideoInput.appendChild(option);
 *             }
 *         }
 *     }
 * }).catch(function(error) {
 *     console.error(error);
 * });
 *
 * QB.webrtc.getMediaDevices('audioinput').then(function(devices) {
 *     var selectAudioInput = document.createElement('select'),
 *         selectAudioInput.id = 'audioInput',
 *         someDocumentElement.appendChild(selectAudioInput);
 * 
 *     if (devices.length > 1) {
 *         for (var i = 0; i !== devices.length; ++i) {
 *             var device = devices[i],
 *                 option = document.createElement('option');
 * 
 *             if (device.kind === 'audioinput') {
 *                 option.value = device.deviceId;
 *                 option.text = device.label;
 *                 selectAudioInput.appendChild(option);
 *             }
 *         }
 *     }
 * }).catch(function(error) {
 *     console.error(error);
 * });
 *
 * switchMediaTracksBtn.onclick = function(event) {
 *     var audioDeviceId = document.getElementById('audioInput').value || undefined,
 *         videoDeviceId = document.getElementById('videoInput').value || undefined,
 *         deviceIds = {
 *             audio: audioDeviceId,
 *             video: videoDeviceId,
 *         };
 * 
 *     var callback = function(error, stream) {
 *             if (err) {
 *                 console.error(error);
 *             } else {
 *                 console.log(stream);
 *             }
 *          };
 * 
 *     // Switch media tracks in audio/video HTML's element (the local stream)
 *     // replace media tracks in peers (will change media tracks for each user in WebRTC session)
 *     webRTCSession.switchMediaTracks(deviceIds, callback);
 * }
 */
WebRTCSession.prototype.switchMediaTracks = function(deviceIds, callback) {
    /**
     * Callback for webRTCSession.switchMediaTracks(deviceIds, callback)
     * @callback switchMediaTracksCallback
     * @param {object} error - The error object
     * @param {object} stream - The stream from new media device
     */

    if(!navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia() is not supported in your browser');
    }

    var self = this,
        localStream = this.localStream;

    if (deviceIds && deviceIds.audio) {
        self.mediaParams.audio.deviceId = deviceIds.audio;
    }

    if (deviceIds && deviceIds.video) {
        self.mediaParams.video.deviceId = deviceIds.video;
    }

    localStream.getTracks().forEach(function(track) {
        track.stop();
    });

    navigator.mediaDevices.getUserMedia({
        audio: self.mediaParams.audio || false,
        video: self.mediaParams.video || false
    }).then(function(stream) {
        self._replaceTracks(stream);
        callback(null, stream);
    }).catch(function(error) {
        callback(error, null);
    });
};

WebRTCSession.prototype._replaceTracks = function(stream) {
    var peers = this.peerConnections,
        localStream = this.localStream,
        elemId = this.mediaParams.elemId,
        ops = this.mediaParams.options,
        newStreamTracks = stream.getTracks();

    this.detachMediaStream(elemId);

    newStreamTracks.forEach(function(track) {
        localStream.addTrack(track);
    });

    this.attachMediaStream(elemId, stream, ops);

    for (var userId in peers) {
        _replaceTracksForPeer(peers[userId]);
    }

    function _replaceTracksForPeer(peer) {
        peer.getSenders().map(function(sender) {
            sender.replaceTrack(newStreamTracks.find(function(track) {
                return track.kind === sender.track.kind;
            }));
        });
    }
};

/**
 * [Initiate a call]
 * @param  {object}   extension [custom parametrs]
 * @param  {Function} callback
 */
WebRTCSession.prototype.call = function(extension, callback) {
    var self = this,
        ext = _prepareExtension(extension);

    Helpers.trace('Call, extension: ' + JSON.stringify(ext.userInfo));

    self.state = WebRTCSession.State.ACTIVE;

    // create a peer connection for each opponent
    self.opponentsIDs.forEach(function(userID, i, arr) {
        self._callInternal(userID, ext, true);
    });

    if (typeof callback === 'function') {
        callback(null);
    }
};

WebRTCSession.prototype._callInternal = function(userID, extension, withOnNotAnswerCallback) {
    var self = this;
    var peer = self._createPeer(userID, 'offer');

    var safariVersion = Helpers.getVersionSafari();

    if (safariVersion && safariVersion >= 11) {
        self.localStream.getTracks().forEach(function(track) {
            peer.addTrack(track, self.localStream);
        });
    } else {
        peer.addLocalStream(self.localStream);
    }

    this.peerConnections[userID] = peer;

    peer.getAndSetLocalSessionDescription(this.callType, function(err) {
        if (err) {
            Helpers.trace("getAndSessionDescription error: " + err);
        } else {
            Helpers.trace("getAndSessionDescription success");
            /** let's send call requests to user */
            peer._startDialingTimer(extension, withOnNotAnswerCallback);
        }
    });
};

/**
 * Accept a call
 * @param {array} A map with custom parameters
 */
WebRTCSession.prototype.accept = function(extension) {
    var self = this,
        ext = _prepareExtension(extension);

    Helpers.trace('Accept, extension: ' + JSON.stringify(ext.userInfo));

    if(self.state === WebRTCSession.State.ACTIVE) {
        Helpers.traceError("Can't accept, the session is already active, return.");
        return;
    }

    if(self.state === WebRTCSession.State.CLOSED) {
        Helpers.traceError("Can't accept, the session is already closed, return.");
        self.stop({});
        return;
    }

    self.state = WebRTCSession.State.ACTIVE;

    self.acceptCallTime = new Date();

    self._clearAnswerTimer();

    self._acceptInternal(self.initiatorID, ext);

    /** The group call logic starts here */
    var oppIDs = self._uniqueOpponentsIDsWithoutInitiator();

    /** in a case of group video chat */
    if(oppIDs.length > 0){
        var offerTime = (self.acceptCallTime - self.startCallTime) / 1000;
        self._startWaitingOfferOrAnswerTimer(offerTime);

        /**
         * here we have to decide to which users the user should call.
         * We have a rule: If a userID1 > userID2 then a userID1 should call to userID2.
         */
        oppIDs.forEach(function(opID, i, arr) {
            if(self.currentUserID > opID){
                /** call to the user */
                self._callInternal(opID, {}, true);
            }
        });
    }
};

WebRTCSession.prototype._acceptInternal = function(userID, extension) {
    var self = this;

    /** create a peer connection */
    var peerConnection = this.peerConnections[userID];

    if (peerConnection) {
        var safariVersion = Helpers.getVersionSafari();

        if (safariVersion && safariVersion >= 11) {
            self.localStream.getTracks().forEach(function(track) {
                peerConnection.addTrack(track, self.localStream);
            });
        } else {
            peerConnection.addLocalStream(self.localStream);
        }

        peerConnection.setRemoteSessionDescription('offer', peerConnection.getRemoteSDP(), function(error){
            if(error){
                Helpers.traceError("'setRemoteSessionDescription' error: " + error);
            }else{
                Helpers.trace("'setRemoteSessionDescription' success");

                peerConnection.getAndSetLocalSessionDescription(self.callType, function(err) {
                    if (err) {
                        Helpers.trace("getAndSetLocalSessionDescription error: " + err);
                    } else {

                        extension.sessionID = self.ID;
                        extension.callType = self.callType;
                        extension.callerID = self.initiatorID;
                        extension.opponentsIDs = self.opponentsIDs;
                        extension.sdp = peerConnection.localDescription.sdp;

                        self.signalingProvider.sendMessage(userID, extension, SignalingConstants.SignalingType.ACCEPT);
                    }
                });
            }
        });
    }else{
        Helpers.traceError("Can't accept the call, there is no information about peer connection by some reason.");
    }
};

/**
 * Reject a call
 * @param {array} A map with custom parameters
 */
WebRTCSession.prototype.reject = function(extension) {
    var self = this,
        ext = _prepareExtension(extension);
    var peersLen = Object.keys(self.peerConnections).length;

    Helpers.trace('Reject, extension: ' + JSON.stringify(ext.userInfo));

    self.state = WebRTCSession.State.REJECTED;

    self._clearAnswerTimer();

    ext.sessionID = self.ID;
    ext.callType = self.callType;
    ext.callerID = self.initiatorID;
    ext.opponentsIDs = self.opponentsIDs;

    if(peersLen > 0){
        for (var key in self.peerConnections) {
            var peerConnection = self.peerConnections[key];
            self.signalingProvider.sendMessage(peerConnection.userID, ext, SignalingConstants.SignalingType.REJECT);
        }
    }

    self._close();
};

/**
 * Stop a call
 * @param {array} A map with custom parameters
 */
WebRTCSession.prototype.stop = function(extension) {
    var self = this,
        ext = _prepareExtension(extension),
        peersLen = Object.keys(self.peerConnections).length;

    Helpers.trace('Stop, extension: ' + JSON.stringify(ext.userInfo));

    self.state = WebRTCSession.State.HUNGUP;

    if(self.answerTimer) {
        self._clearAnswerTimer();
    }

    ext.sessionID = self.ID;
    ext.callType = self.callType;
    ext.callerID = self.initiatorID;
    ext.opponentsIDs = self.opponentsIDs;

    if(peersLen > 0){
        for (var key in self.peerConnections) {
            var peerConnection = self.peerConnections[key];

            self.signalingProvider.sendMessage(peerConnection.userID, ext, SignalingConstants.SignalingType.STOP);
        }
    }

    self._close();
};

/**
 * [function close connection with user]
 * @param  {Number} userId [id of user]
 */
WebRTCSession.prototype.closeConnection = function(userId) {
    var self = this,
        peer = this.peerConnections[userId];

    if(!peer) {
        Helpers.traceWarn('Not found connection with user (' + userId + ')');
        return false;
    }

    try {
        peer.release();
    } catch (e) {
        Helpers.traceError(e);
    } finally {
        self._closeSessionIfAllConnectionsClosed();
    }
};


/**
 * Update a call
 * @param {array} A map with custom parameters
 */
WebRTCSession.prototype.update = function(extension) {
    var self = this,
        ext = {};

    Helpers.trace('Update, extension: ' + JSON.stringify(extension));

    if(extension === null){
        Helpers.trace("extension is null, no parameters to update");
        return;
    }

    ext = _prepareExtension(extension);
    ext.sessionID = this.ID;

    for (var key in self.peerConnections) {
        var peerConnection = self.peerConnections[key];

        self.signalingProvider.sendMessage(peerConnection.userID, ext, SignalingConstants.SignalingType.PARAMETERS_CHANGED);
    }
};

/**
 * Mutes the stream
 * @param {string} what to mute: 'audio' or 'video'
 */
WebRTCSession.prototype.mute = function(type) {
    this._muteStream(0, type);
};

/**
 * Unmutes the stream
 * @param {string} what to unmute: 'audio' or 'video'
 */
WebRTCSession.prototype.unmute = function(type) {
    this._muteStream(1, type);
};

/**
 * DELEGATES (rtc client)
 */
WebRTCSession.prototype.processOnCall = function(callerID, extension) {
    var self = this,
        oppIDs = self._uniqueOpponentsIDs();

    oppIDs.forEach(function(opID, i, arr) {
        var pConn = self.peerConnections[opID];

        if(pConn){
            if(opID == callerID){
                pConn.updateRemoteSDP(extension.sdp);

                /** The group call logic starts here */
                if(callerID != self.initiatorID && self.state === WebRTCSession.State.ACTIVE){
                    self._acceptInternal(callerID, {});
                }
            }
        } else {
            /** create peer connections for each opponent */
            var peerConnection;
            if(opID != callerID && self.currentUserID > opID){
                peerConnection = self._createPeer(opID, 'offer');
            }else{
                peerConnection = self._createPeer(opID, 'answer');
            }

            self.peerConnections[opID] = peerConnection;

            if(opID == callerID){
                peerConnection.updateRemoteSDP(extension.sdp);
                self._startAnswerTimer();
            }
        }
    });
};

WebRTCSession.prototype.processOnAccept = function(userID, extension) {
    var peerConnection = this.peerConnections[userID];

    if(peerConnection){
        peerConnection._clearDialingTimer();

        peerConnection.setRemoteSessionDescription('answer', extension.sdp, function(error){
            if(error){
                Helpers.traceError("'setRemoteSessionDescription' error: " + error);
            }else{
                Helpers.trace("'setRemoteSessionDescription' success");
            }
        });
    }else{
        Helpers.traceError("Ignore 'OnAccept', there is no information about peer connection by some reason.");
    }
};

WebRTCSession.prototype.processOnReject = function(userID, extension) {
    var peerConnection = this.peerConnections[userID];

    this._clearWaitingOfferOrAnswerTimer();

    if(peerConnection){
        peerConnection.release();
    }else{
        Helpers.traceError("Ignore 'OnReject', there is no information about peer connection by some reason.");
    }

    this._closeSessionIfAllConnectionsClosed();
};

WebRTCSession.prototype.processOnStop = function(userID, extension) {
    var self = this;

    this._clearAnswerTimer();

    var pc = self.peerConnections[userID];
    if (pc) {
        pc.release();
    } else {
        Helpers.traceError("Ignore 'OnStop', there is no information about peer connection by some reason.");
    }

    this._closeSessionIfAllConnectionsClosed();
};

WebRTCSession.prototype.processOnIceCandidates = function(userID, extension) {
    var peerConnection = this.peerConnections[userID];

    if(peerConnection){
        peerConnection.addCandidates(extension.iceCandidates);
    }else{
        Helpers.traceError("Ignore 'OnIceCandidates', there is no information about peer connection by some reason.");
    }
};

WebRTCSession.prototype.processCall = function(peerConnection, ext) {
    var extension = ext || {};

    extension.sessionID = this.ID;
    extension.callType = this.callType;
    extension.callerID = this.initiatorID;
    extension.opponentsIDs = this.opponentsIDs;
    extension.sdp = peerConnection.localDescription.sdp;

    //TODO: set bandwidth to the userInfo object
    extension.userInfo = ext.userInfo || {};
    extension.userInfo.bandwidth = this.bandwidth;

    this.signalingProvider.sendMessage(peerConnection.userID, extension, SignalingConstants.SignalingType.CALL);
};

WebRTCSession.prototype.processIceCandidates = function(peerConnection, iceCandidates) {
    var extension = {};

    extension.sessionID = this.ID;
    extension.callType = this.callType;
    extension.callerID = this.initiatorID;
    extension.opponentsIDs = this.opponentsIDs;

    this.signalingProvider.sendCandidate(peerConnection.userID, iceCandidates, extension);
};

WebRTCSession.prototype.processOnNotAnswer = function(peerConnection) {
    Helpers.trace("Answer timeout callback for session " + this.ID + " for user " + peerConnection.userID);

    this._clearWaitingOfferOrAnswerTimer();

    peerConnection.release();

    if (typeof this.onUserNotAnswerListener === 'function') {
        Utils.safeCallbackCall(this.onUserNotAnswerListener, this, peerConnection.userID);
    }

    this._closeSessionIfAllConnectionsClosed();
};

/**
 * DELEGATES (peer connection)
 */
WebRTCSession.prototype._onRemoteStreamListener = function(userID, stream) {
    if (typeof this.onRemoteStreamListener === 'function') {
        Utils.safeCallbackCall(this.onRemoteStreamListener, this, userID, stream);
    }
};

/**
 * [_onCallStatsReport return statistics about the peer]
 * @param  {number} userId [id of user (callee)]
 * @param  {array} stats  [array of statistics]
 *
 * Fire onCallStatsReport callbacks with parameters(userId, stats, error).
 * If stats will be invalid callback return null and error
 */
WebRTCSession.prototype._onCallStatsReport = function(userId, stats, error) {
    if (typeof this.onCallStatsReport === 'function') {
        Utils.safeCallbackCall(this.onCallStatsReport, this, userId, stats, error);
    }
};

WebRTCSession.prototype._onSessionConnectionStateChangedListener = function(userID, connectionState) {
    if (typeof this.onSessionConnectionStateChangedListener === 'function') {
        Utils.safeCallbackCall(this.onSessionConnectionStateChangedListener, this, userID, connectionState);
        if(Helpers.SessionConnectionState.CLOSED === connectionState && this.peerConnections[userID]) {
            this.peerConnections[userID].onicecandidate = null;
            this.peerConnections[userID].onsignalingstatechange = null;
            this.peerConnections[userID].ontrack = null;
            this.peerConnections[userID].oniceconnectionstatechange = null;
            this.peerConnections[userID]._clearWaitingReconnectTimer();
            delete this.peerConnections[userID];
        }
    }
};

/**
 * Private
 */
WebRTCSession.prototype._createPeer = function(userID, peerConnectionType) {
    if (!RTCPeerConnection) throw new Error('_createPeer error: RTCPeerConnection() is not supported in your browser');

    this.startCallTime = new Date();

    /**
     * Additional parameters for RTCPeerConnection options
     * new RTCPeerConnection(pcConfig, options)
     *
     * DtlsSrtpKeyAgreement: true
     * RtpDataChannels: true
     */

    var pcConfig = {
        iceServers: config.webrtc.iceServers,
        offerExtmapAllowMixed: false
    };

    Helpers.trace("_createPeer, iceServers: " + JSON.stringify(pcConfig));

    var peer = new RTCPeerConnection(pcConfig);
    peer._init(this, userID, this.ID, peerConnectionType);

    return peer;
};

/** close peer connection and local stream */
WebRTCSession.prototype._close = function() {
    Helpers.trace('_close');

    for (var key in this.peerConnections) {
        var peer = this.peerConnections[key];

        try {
            peer.release();
        } catch (e) {
            console.warn('Peer close error:', e);
        }
    }

    this._closeLocalMediaStream();

    this.state = WebRTCSession.State.CLOSED;

    if (typeof this.onSessionCloseListener === 'function') {
        Utils.safeCallbackCall(this.onSessionCloseListener, this);
    }
};

WebRTCSession.prototype._closeSessionIfAllConnectionsClosed = function() {
    var isAllConnectionsClosed = true;

    for (var key in this.peerConnections) {
        var peerCon = this.peerConnections[key],
            peerState;

        try {
            /*
            TODO:
            Uses RTCPeerConnection.signalingState instead RTCPeerConnection.iceConnectionState,
            because state 'closed' comes after few time from Safari, but signaling state comes instantly
            */
            peerState = peerCon.iceConnectionState === 'closed' ? 'closed' : peerCon.signalingState;
        } catch(err) {
            Helpers.traceError(err);
            // need to set peerState to 'closed' on error. FF will crashed without this part.
            peerState = 'closed';
        }

        if (peerState !== 'closed') {
            isAllConnectionsClosed = false;
            break;
        }
    }

    Helpers.trace("All peer connections closed: " + isAllConnectionsClosed);

    if (isAllConnectionsClosed) {
        this._closeLocalMediaStream();

        if (typeof this.onSessionCloseListener === 'function') {
            this.onSessionCloseListener(this);
        }

        this.state = WebRTCSession.State.CLOSED;
    }
};

WebRTCSession.prototype._closeLocalMediaStream = function(){
    /**
     * https://developers.google.com/web/updates/2015/07/mediastream-deprecations?hl=en
     */
    if (this.localStream) {
        this.localStream.getAudioTracks().forEach(function (audioTrack) {
            audioTrack.stop();
            audioTrack.enabled = false;
        });

        this.localStream.getVideoTracks().forEach(function (videoTrack) {
            videoTrack.stop();
            videoTrack.enabled = false;
        });

        this.localStream = null;
    }
};

WebRTCSession.prototype._muteStream = function(bool, type) {
    if (type === 'audio' && this.localStream.getAudioTracks().length > 0) {
        this.localStream.getAudioTracks().forEach(function (track) {
            track.enabled = !!bool;
        });
        return;
    }

    if (type === 'video' && this.localStream.getVideoTracks().length > 0) {
        this.localStream.getVideoTracks().forEach(function (track) {
            track.enabled = !!bool;
        });
        return;
    }
};

WebRTCSession.prototype._clearAnswerTimer = function(){
    if(this.answerTimer){
        Helpers.trace("_clearAnswerTimer");
        clearTimeout(this.answerTimer);
        this.answerTimer = null;
    }
};

WebRTCSession.prototype._startAnswerTimer = function(){
    Helpers.trace("_startAnswerTimer");

    var self = this;
    var answerTimeoutCallback = function (){
        Helpers.trace("_answerTimeoutCallback");

        if (typeof self.onSessionCloseListener === 'function') {
            self._close();
        }

        self.answerTimer = null;
    };

    var answerTimeInterval = config.webrtc.answerTimeInterval*1000;
    this.answerTimer = setTimeout(answerTimeoutCallback, answerTimeInterval);
};

WebRTCSession.prototype._clearWaitingOfferOrAnswerTimer = function() {
    if(this.waitingOfferOrAnswerTimer){
        Helpers.trace("_clearWaitingOfferOrAnswerTimer");
        clearTimeout(this.waitingOfferOrAnswerTimer);
        this.waitingOfferOrAnswerTimer = null;
    }
};

WebRTCSession.prototype._startWaitingOfferOrAnswerTimer = function(time) {
    var self = this,
        timeout = (config.webrtc.answerTimeInterval - time) < 0 ? 1 : config.webrtc.answerTimeInterval - time,
        waitingOfferOrAnswerTimeoutCallback = function() {
            Helpers.trace("waitingOfferOrAnswerTimeoutCallback");

            if(Object.keys(self.peerConnections).length > 0) {
                Object.keys(self.peerConnections).forEach(function(key) {
                    var peerConnection = self.peerConnections[key];
                    if (peerConnection.state === RTCPeerConnection.State.CONNECTING || peerConnection.state === RTCPeerConnection.State.NEW) {
                        self.processOnNotAnswer(peerConnection);
                    }
                });
            }

            self.waitingOfferOrAnswerTimer = null;
        };

    Helpers.trace("_startWaitingOfferOrAnswerTimer, timeout: " + timeout);

    this.waitingOfferOrAnswerTimer = setTimeout(waitingOfferOrAnswerTimeoutCallback, timeout*1000);
};

WebRTCSession.prototype._uniqueOpponentsIDs = function(){
    var self = this;
    var opponents = [];

    if(this.initiatorID !== this.currentUserID){
        opponents.push(this.initiatorID);
    }

    this.opponentsIDs.forEach(function(userID, i, arr) {
        if(userID != self.currentUserID){
            opponents.push(parseInt(userID));
        }
    });

    return opponents;
};

WebRTCSession.prototype._uniqueOpponentsIDsWithoutInitiator = function(){
    var self = this;
    var opponents = [];

    this.opponentsIDs.forEach(function(userID, i, arr) {
        if(userID != self.currentUserID){
            opponents.push(parseInt(userID));
        }
    });

    return opponents;
};

WebRTCSession.prototype.toString = function sessionToString() {
    return 'ID: ' + this.ID + ', initiatorID:  ' + this.initiatorID + ', opponentsIDs: ' + this.opponentsIDs + ', state: ' + this.state + ', callType: ' + this.callType;
};

function generateUUID(){
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}

/**
 * private _prepareExtension - replace property null to empty string
 * return object with property or empty if extension didn't set
 */
function _prepareExtension(extension) {
    var ext = {};

    try {
        if ( ({}).toString.call(extension) === '[object Object]' ) {
            ext.userInfo = extension;
            ext = JSON.parse( JSON.stringify(ext).replace(/null/g, "\"\"") );
        } else {
            throw new Error('Invalid type of "extension" object.');
        }
    } catch (err) {
        Helpers.traceWarning(err.message);
    }

    return ext;
}

module.exports = WebRTCSession;

},{"../../qbConfig":43,"../../qbUtils":47,"./qbRTCPeerConnection":35,"./qbWebRTCHelpers":37,"./qbWebRTCSignalingConstants":39}],39:[function(require,module,exports){
'use strict';

/**
 * QuickBlox JavaScript SDK
 * WebRTC Module (WebRTC signaling constants)
 */

function WebRTCSignalingConstants() {}

WebRTCSignalingConstants.MODULE_ID = "WebRTCVideoChat";

WebRTCSignalingConstants.SignalingType = {
    CALL: 'call',
    ACCEPT: 'accept',
    REJECT: 'reject',
    STOP: 'hangUp',
    CANDIDATE: 'iceCandidates',
    PARAMETERS_CHANGED: 'update'
};

module.exports = WebRTCSignalingConstants;

},{}],40:[function(require,module,exports){
'use strict';

/**
 * QuickBlox JavaScript SDK
 * WebRTC Module (WebRTC signaling provider)
 */

require('strophe.js');

var SignalingConstants = require('./qbWebRTCSignalingConstants');

function WebRTCSignalingProcessor(service, delegate, connection) {
    var self = this;

    self.service = service;
    self.delegate = delegate;
    self.connection = connection;

    this._onMessage = function(from, extraParams, delay, userId) {

        var extension = self._getExtension(extraParams),
            sessionId = extension.sessionID,
            signalType = extension.signalType;

        /** cleanup */
        delete extension.moduleIdentifier;
        delete extension.sessionID;
        delete extension.signalType;

        switch (signalType) {
            case SignalingConstants.SignalingType.CALL:
                if (typeof self.delegate._onCallListener === 'function'){
                    self.delegate._onCallListener(userId, sessionId, extension);
                }
                break;

            case SignalingConstants.SignalingType.ACCEPT:
                if (typeof self.delegate._onAcceptListener === 'function'){
                    self.delegate._onAcceptListener(userId, sessionId, extension);
                }
                break;

            case SignalingConstants.SignalingType.REJECT:
                if (typeof self.delegate._onRejectListener === 'function'){
                    self.delegate._onRejectListener(userId, sessionId, extension);
                }
                break;

            case SignalingConstants.SignalingType.STOP:
                if (typeof self.delegate._onStopListener === 'function'){
                    self.delegate._onStopListener(userId, sessionId, extension);
                }
                break;

            case SignalingConstants.SignalingType.CANDIDATE:
                if (typeof self.delegate._onIceCandidatesListener === 'function'){
                    self.delegate._onIceCandidatesListener(userId, sessionId, extension);
                }
                break;

            case SignalingConstants.SignalingType.PARAMETERS_CHANGED:
                if (typeof self.delegate._onUpdateListener === 'function'){
                    self.delegate._onUpdateListener(userId, sessionId, extension);
                }
                break;
        }
    };

    this._getExtension = function(extraParams) {
        if (!extraParams) {
            return null;
        }

        var extension = {}, iceCandidates = [], opponents = [],
            candidate, opponent, items, childrenNodes;

        for (var i = 0, len = extraParams.childNodes.length; i < len; i++) {
            if (extraParams.childNodes[i].tagName === 'iceCandidates') {

                /** iceCandidates */
                items = extraParams.childNodes[i].childNodes;

                for (var j = 0, len2 = items.length; j < len2; j++) {
                    candidate = {};
                    childrenNodes = items[j].childNodes;

                    for (var k = 0, len3 = childrenNodes.length; k < len3; k++) {
                        candidate[childrenNodes[k].tagName] = childrenNodes[k].textContent;
                    }

                    iceCandidates.push(candidate);
                }

            } else if (extraParams.childNodes[i].tagName === 'opponentsIDs') {
                /** opponentsIDs */
                items = extraParams.childNodes[i].childNodes;

                for (var v = 0, len2v = items.length; v < len2v; v++) {
                    opponent = items[v].textContent;
                    opponents.push(parseInt(opponent));
                }
            } else {
                if (extraParams.childNodes[i].childNodes.length > 1) {
                    var nodeTextContentSize = extraParams.childNodes[i].textContent.length;

                    if (nodeTextContentSize > 4096) {
                        var wholeNodeContent = "";

                        for (var t=0; t<extraParams.childNodes[i].childNodes.length; ++t) {
                            wholeNodeContent += extraParams.childNodes[i].childNodes[t].textContent;
                        }
                        extension[extraParams.childNodes[i].tagName] = wholeNodeContent;
                    } else {
                        extension = self._XMLtoJS(extension, extraParams.childNodes[i].tagName, extraParams.childNodes[i]);
                    }
                } else {
                    if (extraParams.childNodes[i].tagName === 'userInfo') {
                        extension = self._XMLtoJS(extension, extraParams.childNodes[i].tagName, extraParams.childNodes[i]);
                    } else {
                        extension[extraParams.childNodes[i].tagName] = extraParams.childNodes[i].textContent;
                    }
                }
            }
        }
        if (iceCandidates.length > 0){
            extension.iceCandidates = iceCandidates;
        }
        if (opponents.length > 0){
            extension.opponentsIDs = opponents;
        }

        return extension;
    };

    // TODO: the magic
    this._XMLtoJS = function(extension, title, obj) {
        var self = this;
        extension[title] = {};

        for (var i = 0, len = obj.childNodes.length; i < len; i++) {
            if (obj.childNodes[i].childNodes.length > 1) {
                extension[title] = self._XMLtoJS(extension[title], obj.childNodes[i].tagName, obj.childNodes[i]);
            } else {
                extension[title][obj.childNodes[i].tagName] = obj.childNodes[i].textContent;
            }
        }
        return extension;
    };
}

module.exports = WebRTCSignalingProcessor;

},{"./qbWebRTCSignalingConstants":39,"strophe.js":13}],41:[function(require,module,exports){
'use strict';

/** JSHint inline rules */
/* globals Strophe, $msg */

/**
 * QuickBlox JavaScript SDK
 * WebRTC Module (WebRTC signaling processor)
 */

require('strophe.js');

var Helpers = require('./qbWebRTCHelpers');
var SignalingConstants = require('./qbWebRTCSignalingConstants');
var Utils = require('../../qbUtils');
var config = require('../../qbConfig');

function WebRTCSignalingProvider(service, connection) {
    this.service = service;
    this.connection = connection;
}

WebRTCSignalingProvider.prototype.sendCandidate = function(userId, iceCandidates, ext) {
    var extension = ext || {};
    extension.iceCandidates = iceCandidates;

    this.sendMessage(userId, extension, SignalingConstants.SignalingType.CANDIDATE);
};

WebRTCSignalingProvider.prototype.sendMessage = function(userId, ext, signalingType) {
    var extension = ext || {},
        self = this,
        msg, params;

    /** basic parameters */
    extension.moduleIdentifier = SignalingConstants.MODULE_ID;
    extension.signalType = signalingType;
    /** extension.sessionID */
    /** extension.callType */
    extension.platform = 'web';
    /** extension.callerID */
    /** extension.opponentsIDs */
    /** extension.sdp */

    if (extension.userInfo && !Object.keys(extension.userInfo).length) {
        delete extension.userInfo;
    }

    params = {
        to: Helpers.getUserJid(userId, config.creds.appId),
        type: 'headline',
        id: Utils.getBsonObjectId()
    };

    msg = $msg(params).c('extraParams', {
        xmlns: Strophe.NS.CLIENT
    });

    Object.keys(extension).forEach(function(field) {
        if (field === 'iceCandidates') {
            /** iceCandidates */
            msg = msg.c('iceCandidates');
            extension[field].forEach(function(candidate) {
                msg = msg.c('iceCandidate');
                Object.keys(candidate).forEach(function(key) {
                    msg.c(key).t(candidate[key]).up();
                });
                msg.up();
            });
            msg.up();
        } else if (field === 'opponentsIDs') {
            /** opponentsIDs */
            msg = msg.c('opponentsIDs');
            extension[field].forEach(function(opponentId) {
                msg = msg.c('opponentID').t(opponentId).up();
            });
            msg.up();
        } else if (typeof extension[field] === 'object') {
            self._JStoXML(field, extension[field], msg);
        } else {
            msg.c(field).t(extension[field]).up();
        }
    });

    this.connection.send(msg);
};

/** TODO: the magic */
WebRTCSignalingProvider.prototype._JStoXML = function(title, obj, msg) {
    var self = this;
    msg.c(title);
    Object.keys(obj).forEach(function(field) {
        if (typeof obj[field] === 'object')
            self._JStoXML(field, obj[field], msg);
        else
            msg.c(field).t(obj[field]).up();
    });
    msg.up();
};

module.exports = WebRTCSignalingProvider;

},{"../../qbConfig":43,"../../qbUtils":47,"./qbWebRTCHelpers":37,"./qbWebRTCSignalingConstants":39,"strophe.js":13}],42:[function(require,module,exports){
'use strict';

/**
 * QuickBlox JavaScript SDK
 * Chat Stream Management plugin
 * doc: http://xmpp.org/extensions/xep-0198.html
 *
 * To enable this features add to config
 * ```javascript
 * streamManagement: {
 -    enable: true
 - }
 * ```
 *
 * Uses listener by QB.chat.onSentMessageCallback
 *
 * ```javascript
 * QB.chat.onSentMessageCallback = function (messageLost, messageSent) {
 *     if (messageLost) {
 *         console.error('sendErrorCallback', messageLost);
 *     } else {
 *         console.info('sendMessageSuccessCallback', messageSent);
 *     }
 * };
 * ```
 */

/** JSHint inline rules */
/* globals $build */

var Utils = require('../qbUtils'),
    chatUtils = require('../modules/chat/qbChatHelpers');

function StreamManagement(options) {

    this._NS = 'urn:xmpp:sm:3';

    this._isStreamManagementEnabled = false;

    // Counter of the incoming stanzas
    this._clientProcessedStanzasCounter = null;

    // The client send stanza counter.
    this._clientSentStanzasCounter = null;

    this._timeInterval = 2000;

    this.sentMessageCallback = null;

    if(Utils.getEnv().browser){
        this._parser = new DOMParser();
    }

    // connection
    this._c = null;

    this._nodeBuilder = null;
    // Original connection.send method
    this._originalSend = null;

    // In progress stanzas queue
    this._stanzasQueue = [];
}


StreamManagement.prototype.enable = function (connection, client) {
    var self = this,
        stanza,
        enableParams = {
            xmlns: self._NS
        };

    if(!self._isStreamManagementEnabled){
        self._c = connection;
        self._originalSend = this._c.send;
        self._c.send = this.send.bind(self);
    }

    if(Utils.getEnv().browser){
        this._clientProcessedStanzasCounter = null;
        this._clientSentStanzasCounter = null;
        self._addEnableHandlers();
        stanza = $build('enable', enableParams);
    } else {
        self._nodeBuilder =  client.Stanza;
        self._addEnableHandlers();
        stanza = chatUtils.createStanza(self._nodeBuilder, enableParams, 'enable');
    }

    self._c.send(stanza);
};

StreamManagement.prototype._timeoutCallback = function () {
    var self = this,
        now = Date.now(),
        updatedStanzasQueue = [];

    if(self._stanzasQueue.length){
        for(var i = 0; i < self._stanzasQueue.length; i++){
            if(self._stanzasQueue[i] && self._stanzasQueue[i].time < now){
                self.sentMessageCallback(self._stanzasQueue[i].message);
            } else {
                updatedStanzasQueue.push(self._stanzasQueue[i]);
            }
        }

        self._stanzasQueue = updatedStanzasQueue;
    }
};

StreamManagement.prototype._addEnableHandlers = function () {
    var self = this;

    if (Utils.getEnv().browser) {
        self._c.XAddTrackedHandler(_incomingStanzaHandler.bind(self));
    } else {
        self._c.on('stanza', _incomingStanzaHandler.bind(self));
    }

    function _incomingStanzaHandler (stanza){
        /*
        * Getting incoming stanza tagName
        * */

        var tagName = stanza.name || stanza.tagName || stanza.nodeTree.tagName;

        if(tagName === 'enabled'){
            self._isStreamManagementEnabled = true;

            setInterval(self._timeoutCallback.bind(self), self._timeInterval);

            return true;
        }

        if(chatUtils.getAttr(stanza, 'xmlns') !== self._NS){
            self._increaseReceivedStanzasCounter();
        }

        if(tagName === 'r'){
            var params = {
                    xmlns: self._NS,
                    h: self._clientProcessedStanzasCounter
                },
                answerStanza = Utils.getEnv().browser ? $build('a', params) :
                    chatUtils.createStanza(self._nodeBuilder, params, 'a');

            self._originalSend.call(self._c, answerStanza);

            return true;
        }

        if(tagName === 'a'){
            var h = parseInt(chatUtils.getAttr(stanza, 'h'));

            self._checkCounterOnIncomeStanza(h);
        }

        return true;
    }
};

StreamManagement.prototype.send = function (stanza, message) {
    var self = this,
        stanzaXML = stanza.nodeTree ? this._parser.parseFromString(stanza.nodeTree.outerHTML, "application/xml").childNodes[0] : stanza,
        tagName = stanzaXML.name || stanzaXML.tagName || stanzaXML.nodeTree.tagName,
        type = chatUtils.getAttr(stanzaXML, 'type'),
        bodyContent = chatUtils.getElementText(stanzaXML, 'body') || '',
        attachments = chatUtils.getAllElements(stanzaXML, 'attachment') || '';

    self._originalSend.call(self._c, stanza);

    if (tagName === 'message' && (type === 'chat' || type === 'groupchat') && (bodyContent || attachments.length)) {
        self._sendStanzasRequest({
            message: message,
            time: Date.now() + self._timeInterval,
            expect: self._clientSentStanzasCounter
        });
    }

    self._clientSentStanzasCounter++;
};

StreamManagement.prototype._sendStanzasRequest = function (data) {
    var self = this;

    if(self._isStreamManagementEnabled){
        self._stanzasQueue.push(data);

        var stanza = Utils.getEnv().browser ? $build('r', { xmlns: self._NS}) :
            chatUtils.createStanza(self._nodeBuilder, { xmlns: self._NS}, 'r');

        self._originalSend.call(self._c, stanza);
    }
};

StreamManagement.prototype.getClientSentStanzasCounter = function(){
    return this._clientSentStanzasCounter;
};

StreamManagement.prototype._checkCounterOnIncomeStanza = function (count){
    if (this._stanzasQueue[0].expect !== count){
        this.sentMessageCallback(this._stanzasQueue[0].message);
    } else {
        this.sentMessageCallback(null, this._stanzasQueue[0].message);
    }

    this._stanzasQueue.shift();
};

StreamManagement.prototype._increaseReceivedStanzasCounter = function(){
    this._clientProcessedStanzasCounter++;
};

module.exports = StreamManagement;

},{"../modules/chat/qbChatHelpers":26,"../qbUtils":47}],43:[function(require,module,exports){
'use strict';

/*
 * QuickBlox JavaScript SDK
 *
 * Configuration Module
 *
 * NOTE:
 *  - config.webrtc.statsReportTimeInterval [integer, sec]:
 *  could add listener onCallStatsReport(session, userId, bytesReceived) if
 *  want to get stats (bytesReceived) about peer every X sec;
 */

var config = {
  version: '2.13.6',
  buildNumber: '1099',
  creds: {
    appId: '',
    authKey: '',
    authSecret: '',
    accountKey: ''
  },
  endpoints: {
    api: 'api.quickblox.com',
    chat: 'chat.quickblox.com',
    muc: 'muc.chat.quickblox.com'
  },
  hash: 'sha1',
  streamManagement: {
    enable: false
  },
  chatProtocol: {
    bosh: 'https://chat.quickblox.com:5281',
    websocket: 'wss://chat.quickblox.com:5291',
    active: 2
  },
  pingTimeout: 30,
  chatReconnectionTimeInterval: 5,
  webrtc: {
    answerTimeInterval: 60,
    autoReject: true,
    incomingLimit: 1,
    dialingTimeInterval: 5,
    disconnectTimeInterval: 30,
    statsReportTimeInterval: false,
    iceServers: [
      {
        urls: ['turn:turn.quickblox.com', 'turns:turn.quickblox.com'],
        username: 'quickblox',
        credential: 'baccb97ba2d92d71e26eb9886da5f1e0'
      }
    ]
  },
  urls: {
    account: 'account_settings',
    session: 'session',
    login: 'login',
    users: 'users',
    chat: 'chat',
    blobs: 'blobs',
    geodata: 'geodata',
    pushtokens: 'push_tokens',
    subscriptions: 'subscriptions',
    events: 'events',
    data: 'data',
    addressbook: 'address_book',
    addressbookRegistered: 'address_book/registered_users',
    type: '.json'
  },
  on: {
    sessionExpired: null
  },
  timeout: null,
  debug: {
    mode: 0,
    file: null
  },
  addISOTime: false
};

config.set = function(options) {
  if (typeof options.endpoints === 'object' && options.endpoints.chat) {
    config.endpoints.muc = 'muc.'+options.endpoints.chat;
    config.chatProtocol.bosh = 'https://'+options.endpoints.chat+':5281';
    config.chatProtocol.websocket = 'wss://'+options.endpoints.chat+':5291';
  }

  Object.keys(options).forEach(function(key) {
    if(key !== 'set' && config.hasOwnProperty(key)) {
      if(typeof options[key] !== 'object') {
        config[key] = options[key];
      } else {
        Object.keys(options[key]).forEach(function(nextkey) {
          if(config[key].hasOwnProperty(nextkey)){
            config[key][nextkey] = options[key][nextkey];
          }
        });
      }
    }

    // backward compatibility: for config.iceServers
    if(key === 'iceServers') {
      config.webrtc.iceServers = options[key];
    }
  });
};

module.exports = config;

},{}],44:[function(require,module,exports){
'use strict';

/*
 * QuickBlox JavaScript SDK
 *
 * Main SDK Module
 *
 */
var config = require('./qbConfig');
var Utils = require('./qbUtils');

// Actual QuickBlox API starts here
function QuickBlox() {}

QuickBlox.prototype = {
    /**
     * Return current version of QuickBlox JavaScript SDK
     * @memberof QB
     * */
    version: config.version,

    /**
     * Return current build number of QuickBlox JavaScript SDK
     * @memberof QB
     * */
    buildNumber: config.buildNumber,

    _getOS: Utils.getOS.bind(Utils),

    /**
     * @memberof QB
     * @param {Number | String} appIdOrToken - Application ID (from your admin panel) or Session Token.
     * @param {String | Number} authKeyOrAppId - Authorization key or Application ID. You need to set up Application ID if you use session token as appIdOrToken parameter.
     * @param {String} authSecret - Authorization secret key (from your admin panel).
     * @param {Object} configMap - Settings object for QuickBlox SDK.
     */
    init: function(appIdOrToken, authKeyOrAppId, authSecret, accountKey, configMap) {
        if (typeof accountKey === 'string' && accountKey.length) {
            if (configMap && typeof configMap === 'object') {
                config.set(configMap);
            }
            config.creds.accountKey = accountKey;
        } else {
            console.warn('Parameter "accountKey" is missing. This will lead to error in next major release');
            console.warn('NOTE: Account migration will not work without "accountKey"');
            if (typeof accountKey === 'object') {
                config.set(accountKey);
            }
        }

        var SHARED_API_ENDPOINT = "api.quickblox.com";
        var SHARED_CHAT_ENDPOINT = "chat.quickblox.com";

        /** include dependencies */
        var Proxy = require('./qbProxy'),
            Auth = require('./modules/qbAuth'),
            Users = require('./modules/qbUsers'),
            Content = require('./modules/qbContent'),
            PushNotifications = require('./modules/qbPushNotifications'),
            Data = require('./modules/qbData'),
            AddressBook = require('./modules/qbAddressBook'),
            Chat = require('./modules/chat/qbChat'),
            DialogProxy = require('./modules/chat/qbDialog'),
            MessageProxy = require('./modules/chat/qbMessage');

        this.service = new Proxy();
        this.auth = new Auth(this.service);
        this.users = new Users(this.service);
        this.content = new Content(this.service);
        this.pushnotifications = new PushNotifications(this.service);
        this.data = new Data(this.service);
        this.addressbook = new AddressBook(this.service);
        this.chat = new Chat(this.service);
        this.chat.dialog = new DialogProxy(this.service);
        this.chat.message = new MessageProxy(this.service);

        if (Utils.getEnv().browser) {
            /** add adapter.js*/
            require('webrtc-adapter');

            /** add WebRTC API if API is avaible */
            if( Utils.isWebRTCAvailble() ) {
                var WebRTCClient = require('./modules/webrtc/qbWebRTCClient');
                this.webrtc = new WebRTCClient(this.service, this.chat.connection);
                this.chat.webrtcSignalingProcessor = this.webrtc.signalingProcessor;
            } else {
                this.webrtc = false;
            }
        } else {
            this.webrtc = false;
        }

        // Initialization by outside token
        if (typeof appIdOrToken === 'string' && (!authKeyOrAppId || typeof authKeyOrAppId === 'number') && !authSecret) {

            if(typeof authKeyOrAppId === 'number'){
                config.creds.appId = authKeyOrAppId;
            }

            this.service.setSession({ token: appIdOrToken });
        } else {
            config.creds.appId = appIdOrToken;
            config.creds.authKey = authKeyOrAppId;
            config.creds.authSecret = authSecret;
        }

        var shouldGetSettings = config.creds.accountKey && (
            !config.endpoints.api ||
            config.endpoints.api === SHARED_API_ENDPOINT ||
            !config.endpoints.chat ||
            config.endpoints.chat === SHARED_CHAT_ENDPOINT
        );
        if (shouldGetSettings) {
            var accountSettingsUrl = [
                'https://', SHARED_API_ENDPOINT, '/',
                config.urls.account,
                config.urls.type
            ].join('');
            // account settings
            this.service.ajax({
                url: accountSettingsUrl
            }, function (err, response) {
                if (!err && typeof response === 'object') {
                    var update = {
                        endpoints: {
                            api: response.api_endpoint.replace(/^https?:\/\//, ''),
                            chat: response.chat_endpoint
                        }
                    };
                    config.set(update);
                }
            });
        }
    },

    /**
     * Return current session
     * @memberof QB
     * @param {getSessionCallback} callback - The getSessionCallback function.
     * */
    getSession: function(callback) {
        /**
         * This callback return session object.
         * @callback getSessionCallback
         * @param {Object} error - The error object
         * @param {Object} session - Contains of session object
         * */
        this.auth.getSession(callback);
    },

    /**
     * Creat new session. {@link https://quickblox.com/developers/Javascript#Authorization More info}
     * @memberof QB
     * @param {String} appIdOrToken Should be applecationID or QBtoken.
     * @param {createSessionCallback} callback -
     * */
    createSession: function(params, callback) {
        /**
         * This callback return session object.
         * @callback createSession
         * @param {Object} error - The error object
         * @param {Object} session - Contains of session object
         * */
        this.auth.createSession(params, callback);
    },

    /**
     * Destroy current session.  {@link https://quickblox.com/developers/Authentication_and_Authorization#API_Session_Destroy More info}
     * @memberof QB
     * @param {destroySessionCallback} callback - The destroySessionCallback function.
     * */
    destroySession: function(callback) {
        /**
         * This callback returns error or empty string.
         * @callback destroySessionCallback
         * @param {Object | Null} error - The error object if got en error and null if success.
         * @param {Null | String} result - String (" ") if session was removed successfully.
         * */
        this.auth.destroySession(callback);
    },

    /**
     * Login to QuickBlox application. {@link https://quickblox.com/developers/Javascript#Authorization More info}
     * @memberof QB
     * @param {Object} params - Params object for login into the session.
     * @param {loginCallback} callback - The loginCallback function.
     * */
    login: function(params, callback) {
        /**
         * This callback return error or user Object.
         * @callback loginCallback
         * @param {Object | Null} error - The error object if got en error and null if success.
         * @param {Null | Object} result - User data object if everything goes well and null on error.
         * */
        this.auth.login(params, callback);
    },

    /**
     * Remove user from current session, but doesn't destroy it.
     * @memberof QB
     * @param {logoutCallback} callback - The logoutCallback function.
     * */
    logout: function(callback) {
        /**
         * This callback return error or user Object.
         * @callback logoutCallback
         * @param {Object | Null} error - The error object if got en error and null if success.
         * @param {Null | String} result - String (" ") if session was removed successfully.
         * */
        this.auth.logout(callback);
    }

};

/**
 * @namespace
 */
var QB = new QuickBlox();

QB.QuickBlox = QuickBlox;

module.exports = QB;

},{"./modules/chat/qbChat":25,"./modules/chat/qbDialog":27,"./modules/chat/qbMessage":28,"./modules/qbAddressBook":29,"./modules/qbAuth":30,"./modules/qbContent":31,"./modules/qbData":32,"./modules/qbPushNotifications":33,"./modules/qbUsers":34,"./modules/webrtc/qbWebRTCClient":36,"./qbConfig":43,"./qbProxy":45,"./qbUtils":47,"webrtc-adapter":14}],45:[function(require,module,exports){
'use strict';

var config = require('./qbConfig');
var Utils = require('./qbUtils');

/**
 * For server-side applications through using npm package 'quickblox'
 * you should include the following lines
 */
var qbFetch, qbFormData;

if (Utils.getEnv().node) {
    //qbFetch = require('node-fetch');
    //qbFormData = require('form-data');
} else {
    qbFetch = fetch;
    qbFormData = FormData;
}

function ServiceProxy() {
    this.qbInst = {
        config: config,
        session: null
    };

    this.reqCount = 0;
}

ServiceProxy.prototype = {

    _fetchingSettings: false,
    _queue: [],

    setSession: function(session) {
        this.qbInst.session = session;
    },

    getSession: function() {
        return this.qbInst.session;
    },

    handleResponse: function(error, response, next, retry) {
        // can add middleware here...
        if (error) {
            const errorMsg = JSON.stringify(error.message).toLowerCase();
            if (typeof config.on.sessionExpired === 'function' &&
                error.code === 401 &&
                errorMsg.indexOf('session does not exist') > -1) {
                config.on.sessionExpired(function() {
                    next(error, response);
                }, retry);
            } else {
                next(error, null);
            }
        } else {
            if (config.addISOTime) {
                response = Utils.injectISOTimes(response);
            }
            next(null, response);
        }
    },

    startLogger: function(params) {
        var clonedData;

        ++this.reqCount;

        if (params.data && params.data.file) {
            clonedData = JSON.parse(JSON.stringify(params.data));
            clonedData.file = "...";
        } else if (Utils.getEnv().nativescript) {
            clonedData = JSON.stringify(params.data);
        } else {
            clonedData = params.data;
        }

        Utils.QBLog('[Request][' + this.reqCount + ']', (params.type || 'GET') + ' ' + params.url, clonedData ? clonedData : "");
    },

    ajax: function(params, callback) {

        if (this._fetchingSettings) {
            this._queue.push([params, callback]);
            return;
        }

        this.startLogger(params);

        var self = this,
            isGetOrHeadType = !params.type || params.type === 'GET' || params.type === 'HEAD',
            qbSessionToken = self.qbInst && self.qbInst.session && self.qbInst.session.token,
            isQBRequest = params.url.indexOf('s3.amazonaws.com') === -1,
            isMultipartFormData = params.contentType === false,
            qbDataType = params.dataType || 'json',
            qbUrl = params.url,
            qbRequest = {},
            qbRequestBody,
            qbResponse;

        qbRequest.method = params.type || 'GET';

        if (params.data) {
            qbRequestBody = _getBodyRequest();
            
            if (isGetOrHeadType) {
                qbUrl += '?' + qbRequestBody;
            } else {
                qbRequest.body = qbRequestBody;
            }
        }

        if (!isMultipartFormData) {
            qbRequest.headers = {
                'Content-Type': params.contentType || 'application/x-www-form-urlencoded; charset=UTF-8'
            };
        }

        if (isQBRequest) {
            if (!qbRequest.headers) {
                qbRequest.headers = {};
            }

            qbRequest.headers['QB-OS'] = Utils.getOS();
            qbRequest.headers['QB-SDK'] = 'JS ' + config.version + ' - Client';

            if(qbSessionToken) {
                qbRequest.headers['QB-Token'] = qbSessionToken;
            }
            if (params.url.indexOf(config.urls.account) > -1) {
                qbRequest.headers['QB-Account-Key'] = config.creds.accountKey;
                this._fetchingSettings = true;
            }
        }

        if (config.timeout) {
            qbRequest.timeout = config.timeout;
        }

        qbFetch(qbUrl, qbRequest)
            .then(function(response) {
                qbResponse = response;

                if (qbDataType === 'text') {
                    return response.text();
                } else {
                    return response.json();
                }
            }, function() {
                // Need to research this issue, response doesn't exist if server will return empty body (status 200)
                qbResponse = {
                    status: 200
                };

                return ' ';
            }).then(function(body) {
            _requestCallback(null, qbResponse, body);
        }, function(error) {
            _requestCallback(error);
        });

        /*
         * Private functions
         * Only for ServiceProxy.ajax() method closure
         */

        function _fixedEncodeURIComponent(str) {
            return encodeURIComponent(str).replace(/[#$&+,/:;=?@\[\]]/g, function(c) {
              return '%' + c.charCodeAt(0).toString(16);
            });
        }

        function _getBodyRequest() {
            var data = params.data,
                qbData;

            if (isMultipartFormData) {
                qbData = new qbFormData();
                Object.keys(data).forEach(function(item) {
                    if (params.fileToCustomObject && (item === 'file')) {
                        qbData.append(item, data[item].data, data[item].name);
                    } else {
                        qbData.append(item, params.data[item]);
                    }
                });
            } else if (params.isNeedStringify) {
                qbData = JSON.stringify(data);
            } else {
                qbData = Object.keys(data).map(function(k) {
                    if (Utils.isObject(data[k])) {
                        return Object.keys(data[k]).map(function(v) {
                            return _fixedEncodeURIComponent(k) + '[' + (Utils.isArray(data[k]) ? '' : v) + ']=' + _fixedEncodeURIComponent(data[k][v]);
                        }).sort().join('&');
                    } else {
                        return _fixedEncodeURIComponent(k) + (Utils.isArray(data[k]) ? '[]' : '' ) + '=' + _fixedEncodeURIComponent(data[k]);
                    }
                }).sort().join('&');
            }

            return qbData;
        }

        function _requestCallback(error, response, body) {
            var statusCode = response && (response.status || response.statusCode),
                responseMessage,
                responseBody;

            if (error || (statusCode !== 200 && statusCode !== 201 && statusCode !== 202)) {
                var errorMsg;

                try {
                    errorMsg = {
                        code: response && statusCode || error && error.code,
                        status: response && response.headers && response.headers.status || 'error',
                        message: body || error && error.errno,
                        detail: body && body.errors || error && error.syscall
                    };
                } catch(e) {
                    errorMsg = error;
                }

                responseBody = body || error || body.errors;
                responseMessage = Utils.getEnv().nativescript ? JSON.stringify(responseBody) : responseBody;

                Utils.QBLog('[Response][' + self.reqCount + ']', 'error', statusCode, responseMessage);

                self.handleResponse(errorMsg, null, callback, retry);
            } else {
                responseBody = (body && body !== ' ') ? body : 'empty body';
                responseMessage = Utils.getEnv().nativescript ? JSON.stringify(responseBody) : responseBody;

                Utils.QBLog('[Response][' + self.reqCount + ']', responseMessage);

                self.handleResponse(null, body, callback, retry);
            }
            if (self._fetchingSettings) {
                self._fetchingSettings = false;
                while (self._queue.length) {
                    var args = self._queue.shift();
                    self.ajax.apply(self, args);
                }
            }
        }

        function retry(session) {
            if (!!session) {
                self.setSession(session);
                self.ajax(params, callback);
            }
        }
    }
};

module.exports = ServiceProxy;

},{"./qbConfig":43,"./qbUtils":47}],46:[function(require,module,exports){
'use strict';
/** JSHint inline rules */
/* globals Strophe */

/**
 * QuickBlox JavaScript SDK
 * Strophe Connection Object
 */

require('strophe.js');

var config = require('./qbConfig');
var chatPRTCL = config.chatProtocol;
var Utils = require('./qbUtils');

function Connection() {
  var protocol = chatPRTCL.active === 1 ? chatPRTCL.bosh : chatPRTCL.websocket;
  var conn = new Strophe.Connection(protocol);

  if (chatPRTCL.active === 1) {
    conn.xmlInput = function(data) {
      if (data.childNodes[0]) {
        for (var i = 0, len = data.childNodes.length; i < len; i++) {
          Utils.QBLog('[QBChat]', 'RECV:', data.childNodes[i]);
        }
      }
    };
    conn.xmlOutput = function(data) {
      if (data.childNodes[0]) {
        for (var i = 0, len = data.childNodes.length; i < len; i++) {
          Utils.QBLog('[QBChat]', 'SENT:', data.childNodes[i]);
        }
      }
    };
  } else {
    conn.xmlInput = function(data) {
      Utils.QBLog('[QBChat]', 'RECV:', data);
    };
    conn.xmlOutput = function(data) {
      Utils.QBLog('[QBChat]', 'SENT:', data);
    };
  }

  return conn;
}

module.exports = Connection;

},{"./qbConfig":43,"./qbUtils":47,"strophe.js":13}],47:[function(require,module,exports){
/* eslint no-console: 2 */

'use strict';

var config = require('./qbConfig');

var unsupported = "This function isn't supported outside of the browser (...yet)";

var isNativeScript = false;
var isNode = false;
var isBrowser = true;

var fs, os;
if (isNode) {
    //fs = require('fs');
    //os = require('os');
}

// The object for type MongoDB.Bson.ObjectId
// http://docs.mongodb.org/manual/reference/object-id/
var ObjectId = {
    machine: Math.floor(Math.random() * 16777216).toString(16),
    pid: Math.floor(Math.random() * 32767).toString(16),
    increment: 0
};

var Utils = {
    /**
     * [getEnv get a name of an execution environment]
     * @return {object} return names of env. (node/browser)
     */
    getEnv: function() {
        return {
            'nativescript': isNativeScript,
            'browser': isBrowser,
            'node': isNode
        };
    },

    _getOSInfoFromNodeJS: function() {
        return os.platform();
    },

    _getOSInfoFromBrowser: function() {
        return window.navigator.userAgent;
    },

    _getOSInfoFromNativeScript: function() {
        // return (global && global.hasOwnProperty('android') ? 'Android' : 'iOS') + ' - NativeScript';
    },

    getOS: function() {
        var self = this;
        var osName = 'An unknown OS';

        var OS_LIST = [
            {
                osName:'Windows',
                codeNames:['Windows', 'win32']
            },
            {
                osName:'Linux',
                codeNames:['Linux', 'linux']
            },
            {
                osName:'macOS',
                codeNames:['Mac OS', 'darwin']
            }
        ];

        var platformInfo;

        if (self.getEnv().browser) {
            platformInfo = self._getOSInfoFromBrowser();
        } else if (self.getEnv().node)  {
            //platformInfo = self._getOSInfoFromNodeJS();
        } else if (self.getEnv().nativescript) {
            //return self._getOSInfoFromNativeScript();
        }

        OS_LIST.forEach(function(osInfo) {
            osInfo.codeNames.forEach(function(codeName) {
                var index = platformInfo.indexOf(codeName);

                if (index !== -1) {
                    osName = osInfo.osName;
                }
            });
        });

        return osName;
    },

    safeCallbackCall: function() {
        var listenerString = arguments[0].toString(),
            listenerName = listenerString.split('(')[0].split(' ')[1],
            argumentsCopy = [], listenerCall;

        for (var i = 0; i < arguments.length; i++) {
            argumentsCopy.push(arguments[i]);
        }

        listenerCall = argumentsCopy.shift();

        try {
            listenerCall.apply(null, argumentsCopy);
        } catch (err) {
            if (listenerName === '') {
                console.error('Error: ' + err);
            }else{
                console.error('Error in listener ' + listenerName + ': ' + err);
            }
        }
    },

    randomNonce: function() {
        return Math.floor(Math.random() * 10000);
    },

    unixTime: function() {
        return Math.floor(Date.now() / 1000);
    },

    getUrl: function(base, id) {
        var resource = id ? '/' + id : '';
        return 'https://' + config.endpoints.api + '/' + base + resource + config.urls.type;
    },

    isArray: function(arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    },

    isObject: function(arg) {
        return Object.prototype.toString.call(arg) === '[object Object]';
    },

    // Generating BSON ObjectId and converting it to a 24 character string representation
    // Changed from https://github.com/justaprogrammer/ObjectId.js/blob/master/src/main/javascript/Objectid.js
    getBsonObjectId: function() {
        var timestamp = this.unixTime().toString(16),
            increment = (ObjectId.increment++).toString(16);

        if (increment > 0xffffff) ObjectId.increment = 0;

        return '00000000'.substr(0, 8 - timestamp.length) + timestamp +
            '000000'.substr(0, 6 - ObjectId.machine.length) + ObjectId.machine +
            '0000'.substr(0, 4 - ObjectId.pid.length) + ObjectId.pid +
            '000000'.substr(0, 6 - increment.length) + increment;
    },

    injectISOTimes: function(data) {
        if (data.created_at) {
            if (typeof data.created_at === 'number') data.iso_created_at = new Date(data.created_at * 1000).toISOString();
            if (typeof data.updated_at === 'number') data.iso_updated_at = new Date(data.updated_at * 1000).toISOString();
        }
        else if (data.items) {
            for (var i = 0, len = data.items.length; i < len; ++i) {
                if (typeof data.items[i].created_at === 'number') data.items[i].iso_created_at = new Date(data.items[i].created_at * 1000).toISOString();
                if (typeof data.items[i].updated_at === 'number') data.items[i].iso_updated_at = new Date(data.items[i].updated_at * 1000).toISOString();
            }
        }
        return data;
    },

    QBLog: function(){
        if (this.loggers) {
            for (var i=0; i<this.loggers.length; ++i) {
                this.loggers[i](arguments);
            }

            return;
        }

        var logger;

        this.loggers = [];

        var consoleLoggerFunction = function(){
            var logger = function(args){
                console.log.apply(console, Array.prototype.slice.call(args));
            };

            return logger;
        };

        var fileLoggerFunction = function(){
            var logger = function(args){
                if (!fs) {
                    throw unsupported;
                } else {
                    var data = [];

                    for (var i = 0; i < args.length; i++) {
                        data.push(JSON.stringify(args[i]));
                    }

                    data = data.join(' ');

                    var toLog = '\n' + new Date() + '. ' + data;

                    fs.appendFile(config.debug.file, toLog, function(err) {
                        if(err) {
                            return console.error('Error while writing log to file. Error: ' + err);
                        }
                    });
                }
            };

            return logger;
        };

        // Build loggers
        // format "debug: { }"

        if(typeof config.debug === 'object'){
            if(typeof config.debug.mode === 'number'){
                if(config.debug.mode == 1){
                    logger = consoleLoggerFunction();
                    this.loggers.push(logger);
                } else if(config.debug.mode == 2){
                    logger = fileLoggerFunction();
                    this.loggers.push(logger);
                }
            } else if(typeof config.debug.mode === 'object'){
                var self = this;

                config.debug.mode.forEach(function(mode) {
                    if(mode === 1){
                        logger = consoleLoggerFunction();
                        self.loggers.push(logger);
                    } else if (mode === 2){
                        logger = fileLoggerFunction();
                        self.loggers.push(logger);
                    }
                });
            }

            // format "debug: true"
            // backward compatibility
        }else if (typeof config.debug === 'boolean'){
            if(config.debug){
                logger = consoleLoggerFunction();
                this.loggers.push(logger);
            }
        }

        if(this.loggers){
            for(var j=0;j<this.loggers.length;++j){
                this.loggers[j](arguments);
            }
        }
    },

    isWebRTCAvailble: function() {
        /** Shims */
        var RTCPeerConnection = window.RTCPeerConnection,
            IceCandidate = window.RTCIceCandidate,
            SessionDescription = window.RTCSessionDescription,
            MediaDevices = window.navigator.mediaDevices;

        return Boolean(RTCPeerConnection) &&
            Boolean(IceCandidate) &&
            Boolean(SessionDescription) &&
            Boolean(MediaDevices);
    },

    getError: function(code, detail, moduleName) {
        var errorMsg = {
            code: code,
            status: 'error',
            detail: detail
        };

        switch(code){
            case 401:
                errorMsg.message = 'Unauthorized';
                break;

            case 403:
                errorMsg.message = 'Forbidden';
                break;

            case 408:
                errorMsg.message = 'Request Timeout';
                break;

            case 422:
                errorMsg.message = 'Unprocessable Entity';
                break;

            case 502:
                errorMsg.message = 'Bad Gateway';
                break;

            default:
                errorMsg.message = 'Unknown error';
                break;
        }

        this.QBLog('[' + moduleName + ']', 'Error:', detail);

        return errorMsg;
    },

    MergeArrayOfObjects: function (arrayTo, arrayFrom){
        var merged = JSON.parse(JSON.stringify(arrayTo));

        firstLevel: for(var i = 0; i < arrayFrom.length; i++){
            var newItem = arrayFrom[i];

            for(var j = 0; j < merged.length; j++){
                if(newItem.user_id === merged[j].user_id){
                    merged[j] = newItem;
                    continue firstLevel;
                }
            }
            merged.push(newItem);
        }
        return merged;
    }
};

module.exports = Utils;

},{"./qbConfig":43}]},{},[44])(44)
});
