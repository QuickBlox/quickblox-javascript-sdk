// Sample version
//
var SAMPLE_VER = 78;
$('.j-version').text('v.' + SAMPLE_VER);

// WebRTC server endpoint
//
var MULTIPARTY_SERVER = getQueryVar('server');
if(!MULTIPARTY_SERVER){
  var noServerError = "The 'server' query parameter is not set. You need to provide it in order to run the sample. Multi-conference server is available only for Enterprise plans. Please refer to https://quickblox.com/developers/EnterpriseFeatures for more information and contacts."
  alert(noServerError);
  throw noServerError;
}
console.info("server var: ", MULTIPARTY_SERVER);

// Demo app credentials
//
var QB_APP = getQueryVar('app');
console.info("demo app: ", QB_APP);
var appCreds;
if(!QB_APP){
  appCreds = DEMO_APPS.qa;
}else{
  appCreds = DEMO_APPS[QB_APP];
}

var QBCONFIG = {
    endpoints: appCreds.endpoints,
    debug: {
        mode: 1,
        file: null
    }
};

var QBAppCreds = appCreds.credentials;

var DEMO_DIALOG_ID = appCreds.demoChatDialogId;

var VIDEO_RESOLUTION = getQueryVar('videores');
if(!VIDEO_RESOLUTION){
  VIDEO_RESOLUTION = "lowres";
}
console.info("video resolution: ", VIDEO_RESOLUTION);
