// var QB = require(__dirname+'/quickblox/quickblox');
// var QB = require("../../quickblox");
var http    = require("http");
var url     = require("url");
var $       = require('../../node_modules/jquery/dist/jquery');
var QB      = require('../../js/qbMain');
var fs      = require('fs');
var request = require('request');

var config = {
  // debug: true // logs to console ON (backward compatibility)
  // debug: {mode: 0}  // logs OFF
  // debug: {mode: 1}, // logs to console ON
  debug: {mode: 2, file: "myfile.log"}  // logs to file ON
  // debug: {mode: [1, 2], file: "myfile.log"} // // logs to console and file ON
};

var QBUser = {
 login: "supersample-ios",
 password: "supersample-ios"
};

QB.init(92, 'wJHdOcQSxXQGWx5', 'BTFsj7Rtt27DAmT', config);

console.log("QB >>> start");

QB.createSession(QBUser, function(err, result) {
	if (err) {
		console.log('QB >>> Something went wrong: ' + err);
	} else {
		var token   = result.token;
			  user_id = result.id;

		console.log('QB >>> Session created with id ' + result.id);

    var srcIMG = 'wolf.jpg';

    fs.stat(srcIMG, function (err, stats) {
      fs.readFile(srcIMG, function (err, data) {
        if (err) throw err;

        console.log('QB >>> params collected and send to QB content module');
        QB.content.createAndUpload({file: data, name: 'image.jpg', type: 'image/jpeg', size: stats.size}, function(err, response){
          if (err) {
            console.log(err);
          } else {
            console.log(response);
          }
        });
      });
    });
  }
});
