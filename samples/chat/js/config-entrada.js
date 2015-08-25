
// entrada
var CONFIG = {
    endpoints: {
      api: 'apientrada.quickblox.com',
      chat: 'chatentrada.quickblox.com',
      muc: 'muc.chatentrada.quickblox.com',
      turn: 'turnserver.quickblox.com',
      s3Bucket: 'atlas-storage-entrada'
    },
    chatProtocol: {
      bosh: 'http://chatentrada.quickblox.com:5280',
      server: 'chatentrada.quickblox.com',
      websocket: 'ws://chatentrada.quickblox.com:5290',
      active: 2
    },
    ssl: true,
    debug: true
  }

var QBUser1 = {
        id: 18873,
        name: 'testuser1',
        login: 'testuser1',
        pass: 'testuser1'
    },
    QBUser2 = {
        id: 18874,
        name: 'testuser2',
        login: 'testuser2',
        pass: 'testuser2'
    };

QB.init(10, 'vnDPCeZQ4NskvhL', 'EF3n-Zj99WErTKR', CONFIG);