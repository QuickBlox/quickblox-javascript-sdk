QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret, true);

$(document).ready(function(){

	QB.createSession(QBUser, function(err, result) {
		if (err) { 
			console.log('Something went wrong: ' + err);
		} else {
			console.log('Session created with id ' + result.id);
		}
	});
	
});