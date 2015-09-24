// var QB = require(__dirname+'/quickblox/quickblox');
// var QB = require("../../quickblox");

var QB = require('../../js/qbMain');

var CONFIG = {
  // debug: true // logs to console ON (backward compatibility)
  // debug: {mode: 0}  // logs OFF
  // debug: {mode: 1}, // logs to console ON
  // debug: {mode: 2, file: "myfile.log"}  // logs to file ON
  debug: {mode: [1, 2], file: "myfile.log"} // // logs to console and file ON
};

QB.init(92, 'wJHdOcQSxXQGWx5', 'BTFsj7Rtt27DAmT', CONFIG);

console.log("start");

QB.createSession(function(err,result){
  console.log('Session create callback');
});
