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
  debug: {mode: 2, file: "app.log"}  // logs to file ON
  // debug: {mode: [1, 2], file: "myfile.log"} // // logs to console and file ON
};

var QBUser = {
 login: "nodeuser",
 password: "nodeuser"
};

QB.init(28287, 'XydaWcf8OO9xhGT', 'JZfqTspCvELAmnW', config);

QB.createSession(QBUser, function(err, result) {
	if (err) {
		console.log('QB >>> Something went wrong: ' + JSON.stringify(err));
	} else {
		var token   = result.token;
			  user_id = result.id;

    var srcIMG = 'wolf.jpg';

    fs.stat(srcIMG, function (err, stats) {
      fs.readFile(srcIMG, function (err, data) {
        if (err) throw err;

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
