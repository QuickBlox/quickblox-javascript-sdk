QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret, true);
// Create session
QB.createSession(QBUser, function(err, result){
	if (err) {
		console.log('Something went wrong: ' + err);
	} else {
		console.log('Session created with id ' + result.id);
		// Get all posts
		QB.data.list("Blog", null, function(err, result){
			if (err) { 
				console.log('Something went wrong: ' + err);
			} else {
				// render posts here
				var containerElement = $('#posts-container');
				for (var i=0; i < result.items.length; i++) {
					var postElement = $('<div></div>').addClass('starter-template');

					var postTitle = $('<h1></h1>').html('#' + (i+1) + ' ' + result.items[result.items.length-i-1].title);
					postElement.append(postTitle);

					var postBody = $('<p></p>').addClass('lead').html(result.items[result.items.length-i-1].body);
					postElement.append(postBody);

					containerElement.append(postElement);
				}
			}
		});
	}
});