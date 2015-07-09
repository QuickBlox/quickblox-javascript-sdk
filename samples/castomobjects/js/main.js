QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret, true);

// Create session
QB.createSession(QBUser, function(err, result){
	if (err) {
		console.log('Something went wrong: ' + err);
	} else {
		console.log('Session created with id ' + result.id);
		// Get all posts
		getAllPosts();

		$('#send_post').click(function(e) {
			e.preventDefault();

			var textTitle = $('#title_post')[0].value;
				textBody = $('#body_post')[0].value;

			if (textTitle && textBody) {
				$("#load-img").show(0);
			}
				
			addNewPost(textTitle, textBody);
			QB.data.list("Blog", null, function(err, result){
				if (err) { 
					console.log('Something went wrong: ' + err);
				} else {
					// render posts here
					console.log(result);
					var containerElement = $('#posts-container');
					for (var i=0; i < result.items.length; i++) {
						var postElement = $('<div></div>').addClass('starter-template');

						var postTitle = $('<h1></h1>').html('#' + (i+1) + ' ' + result.items[result.items.length-i-1].title);
						postElement.append(postTitle);

						var postBody = $('<p></p>').addClass('lead').html(result.items[result.items.length-i-1].body);
						postElement.append(postBody);
					}	
						containerElement.append(postElement);
				}
			});


	
		});
	}
});

function getAllPosts() {
	QB.data.list("Blog", null, function(err, result){
		if (err) { 
			console.log('Something went wrong: ' + err);
		} else {
			// render posts here
			console.log(result);
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

function addNewPost(textTitle, textBody) {
	QB.data.create("Blog", {title: textTitle, body: textBody}, function(err, res){
		if (err) {
			console.log(err);
		} else {
			console.log(res);
			$("#load-img").delay(1000).fadeOut(1000);
			$('#myModal').modal('hide');

		}
	});
}