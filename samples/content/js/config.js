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

var QBUser = {
      login: 'testcontent',
      pass: 'testcontent'
    };

QB.init(10, 'vnDPCeZQ4NskvhL', 'EF3n-Zj99WErTKR', CONFIG);

// var QBApp = {
//   appId: 6,
//   authKey: 'ccBf5X8r3-jax3j',
//   authSecret: '47sEGjyOPO65Ezr'
// };

// var QBUser = {
//   login: "test",   
//   password: "testtest" 
// };

// var QBConfig = {

// }

// QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret, QBConfig);