
// TUUL
var CONFIG = {
    endpoints: {
      api: 'apituul.quickblox.com',
      chat: 'chattuul.quickblox.com',
      muc: 'muc.chattuul.quickblox.com',
      turn: 'turnserver.quickblox.com',
      s3Bucket: 'atlas-storage-tuul'
    },
    chatProtocol: {
      bosh: 'http://chattuul.quickblox.com:5280',
      server: 'chattuul.quickblox.com',
      websocket: 'ws://chattuul.quickblox.com:5290',
      active: 1
    },
    ssl: true,
    debug: true
  }

var QBUser1 = {
        id: 1833635,
        name: 'testuser1',
        login: 'testuser1',
        pass: 'testuser1'
    },
    QBUser2 = {
        id: 1833636,
        name: 'testuser2',
        login: 'testuser2',
        pass: 'testuser2'
    };

QB.init(13994, 'VpwgNGKksbfsQgX', 'W88-YuqkMwHhsKM', CONFIG);