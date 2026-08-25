describe('WebRTC stats normalizer (_applyStatReport)', function() {
  'use strict';

  var isNodeEnv = typeof window === 'undefined' && typeof exports === 'object';

  // Pure unit test: import the module directly, no QB.init, no network, no browser.
  var RTCPeerConnection = isNodeEnv
    ? require('../src/modules/webrtc/qbRTCPeerConnection')
    : window.QB.webrtc.RTCPeerConnection;

  var apply = RTCPeerConnection._applyStatReport;

  function freshStatistic() {
    return {
      local:  { audio: {}, video: {}, candidate: {} },
      remote: { audio: {}, video: {}, candidate: {} }
    };
  }

  it('fills statistic.remote.video for inbound-rtp video report', function() {
    var statistic = freshStatistic();

    apply(statistic, {
      type: 'inbound-rtp',
      mediaType: 'video',
      bytesReceived: 1000,
      packetsReceived: 10,
      timestamp: 12345
    }, null);

    expect(statistic.remote.video.bytesReceived).toEqual(1000);
    expect(statistic.remote.video.packetsReceived).toEqual(10);
    expect(statistic.remote.video.bitrate).toEqual(0); // lastResults null -> 0 per implementation
  });

  it('fills statistic.remote.audio for inbound-rtp audio report', function() {
    var statistic = freshStatistic();

    apply(statistic, {
      type: 'inbound-rtp',
      mediaType: 'audio',
      bytesReceived: 500,
      packetsReceived: 5,
      timestamp: 12345
    }, null);

    expect(statistic.remote.audio.bytesReceived).toEqual(500);
  });

  it('does not throw and does not mutate remote when mediaType is undefined', function() {
    var statistic = freshStatistic();

    expect(function() {
      apply(statistic, {
        type: 'inbound-rtp',
        mediaType: undefined,
        bytesReceived: 1000,
        packetsReceived: 10,
        timestamp: 12345
      }, null);
    }).not.toThrow();

    expect(statistic.remote.audio).toEqual({});
    expect(statistic.remote.video).toEqual({});
  });

  it('does not throw for a non-standard mediaType', function() {
    var statistic = freshStatistic();

    expect(function() {
      apply(statistic, {
        type: 'inbound-rtp',
        mediaType: 'application',
        bytesReceived: 1000,
        packetsReceived: 10,
        timestamp: 12345
      }, null);
    }).not.toThrow();

    expect(statistic.remote.video).toEqual({});
  });

  it('fills statistic.local.video for outbound-rtp video report (symmetry)', function() {
    var statistic = freshStatistic();

    apply(statistic, {
      type: 'outbound-rtp',
      mediaType: 'video',
      bytesSent: 2000,
      packetsSent: 20,
      timestamp: 12345
    }, null);

    expect(statistic.local.video.bytesSent).toEqual(2000);
    expect(statistic.local.video.packetsSent).toEqual(20);
  });

  it('fills statistic.remote.video when only kind is present (Safari, no mediaType)', function() {
    var statistic = freshStatistic();

    apply(statistic, {
      type: 'inbound-rtp',
      kind: 'video',
      mediaType: undefined,
      bytesReceived: 1000,
      packetsReceived: 10,
      timestamp: 12345
    }, null);

    expect(statistic.remote.video.bytesReceived).toEqual(1000);
    expect(statistic.remote.video.packetsReceived).toEqual(10);
  });

  it('fills statistic.remote.audio when only kind is present (Safari, no mediaType)', function() {
    var statistic = freshStatistic();

    apply(statistic, {
      type: 'inbound-rtp',
      kind: 'audio',
      mediaType: undefined,
      bytesReceived: 500,
      packetsReceived: 5,
      timestamp: 12345
    }, null);

    expect(statistic.remote.audio.bytesReceived).toEqual(500);
  });

  it('fills statistic.local.video for outbound-rtp when only kind is present (Safari)', function() {
    var statistic = freshStatistic();

    apply(statistic, {
      type: 'outbound-rtp',
      kind: 'video',
      mediaType: undefined,
      bytesSent: 2000,
      packetsSent: 20,
      timestamp: 12345
    }, null);

    expect(statistic.local.video.bytesSent).toEqual(2000);
    expect(statistic.local.video.packetsSent).toEqual(20);
  });

  it('prefers mediaType over kind when both are present', function() {
    var statistic = freshStatistic();

    apply(statistic, {
      type: 'inbound-rtp',
      mediaType: 'video',
      kind: 'audio',
      bytesReceived: 1000,
      packetsReceived: 10,
      timestamp: 12345
    }, null);

    expect(statistic.remote.video.bytesReceived).toEqual(1000);
    expect(statistic.remote.audio).toEqual({});
  });

  it('does not throw and skips when neither mediaType nor kind is present', function() {
    var statistic = freshStatistic();

    expect(function() {
      apply(statistic, {
        type: 'inbound-rtp',
        bytesReceived: 1000,
        packetsReceived: 10,
        timestamp: 12345
      }, null);
    }).not.toThrow();

    expect(statistic.remote.video).toEqual({});
    expect(statistic.remote.audio).toEqual({});
  });

  it('fills framesPerSecond on Safari (kind only) when previous result exists', function() {
    var statistic = freshStatistic();
    var lastResults = new Map();
    lastResults.set('rid', { id: 'rid', timestamp: 11345, bytesReceived: 0, framesReceived: 0 });

    apply(statistic, {
      id: 'rid',
      type: 'inbound-rtp',
      kind: 'video',
      mediaType: undefined,
      bytesReceived: 1000,
      packetsReceived: 10,
      framerateMean: 30,
      timestamp: 12345
    }, lastResults);

    expect(statistic.remote.video.framesPerSecond).toEqual(30);
  });

  it('still populates candidate branch (refactor did not break it)', function() {
    var statistic = freshStatistic();

    apply(statistic, {
      type: 'remote-candidate',
      protocol: 'udp',
      ip: '1.2.3.4',
      port: 5000
    }, null);

    expect(statistic.remote.candidate.protocol).toEqual('udp');
    expect(statistic.remote.candidate.ip).toEqual('1.2.3.4');
    expect(statistic.remote.candidate.port).toEqual(5000);
  });
});
