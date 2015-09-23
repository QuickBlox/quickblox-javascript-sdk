// var QB = require(__dirname+'/quickblox/quickblox');
// var QB = require("../../quickblox");

var QB = require('../../js/qbMain');

var CONFIG = {
  // debug: {mode: 0}
  // debug: {mode: 1},
  // debug: {mode: 2, file: "myfile.log"},
};

QB.init(92, 'wJHdOcQSxXQGWx5', 'BTFsj7Rtt27DAmT', CONFIG);

console.log("start");

QB.createSession(function(err,result){
  console.log('Session create callback');
});
