var QBCONFIG = {
    endpoints: {
        api: "api.quickblox.com", // set custom API endpoint
        chat: "chat.quickblox.com" // set custom Chat endpoint
    },
    debug: {
        mode: 1,
        file: null
    }
};

var QBApp = {
    'prod': {
        'appId': 56252,
        'authKey': 'yPJfas45qY3jbgq',
        'authSecret': 'qTFM-eN4vN8rmAw'
    }
};

var SAMPLE_VER = 78;
$('.j-version').text('v.' + SAMPLE_VER);

var QBAppCreds = QBApp.prod;


var MULTIPARTY_SERVER = getQueryVar('server');
if(!MULTIPARTY_SERVER){
  var noServerError = "The 'server' query parameter is not set. You need to provide it in order to run the sample. Multi-conference server is available only for Enterprise plans. Please refer to https://quickblox.com/developers/EnterpriseFeatures for more information and contacts."
  alert(noServerError);
  throw noServerError;

}
console.info("server var: ", MULTIPARTY_SERVER);
