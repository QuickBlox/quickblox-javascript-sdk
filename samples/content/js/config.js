var config = {
    endpoints: {
        api: "apivronetwork.quickblox.com"
        chat: "chatvronetwork.quickblox.com"
        s3Bucket: "qb-vronetwork"
        turn: "turnserver.quickblox.com"
    },
    chatProtocol: {
        bosh: "https://chatvronetwork.quickblox.com:5281",
        websocket: "wss://chatvronetwork.quickblox.com:5291",
        active: 2
    },
    debug: true,
    ssl: true
};

var QBApp = {
  appId: 16381,
  authKey: 'JmecSQ5e8XGnVxr',
  authSecret: 'RGFhyTj4gMq4FKP'
};

var QBUser = {
  login: "Quickblox",   
  password: "Quickblox" 
};

QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret, QBConfig);