// Sample version
//
var SAMPLE_VER = '1.0.1';
$('.j-version').text('v.' + SAMPLE_VER);

// WebRTC server endpoint
//
var MULTIPARTY_SERVER = getQueryVar('server');
if(!MULTIPARTY_SERVER){
  var noServerError = CONFIG.MESSAGES.no_server_error;
  alert(noServerError);
  throw noServerError;
}
console.info("server var: ", MULTIPARTY_SERVER);

var VIDEO_RESOLUTION = getQueryVar('videores');
if(!VIDEO_RESOLUTION){
  VIDEO_RESOLUTION = "lowres";
}
console.info("video resolution: ", VIDEO_RESOLUTION);
