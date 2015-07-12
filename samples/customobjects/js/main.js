QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret, true);

// Create session
	var filter = {sort_asc: 'created_at'};
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
					textBody = $('#body_post').val();
			// Adds a new post
			if (textTitle && textBody) {
				$("#load-img").show(0);
				addNewPost(textTitle, textBody);
			} else {
				alert('Please complete all required fields')
			}
		});
	}
});

function getAllPosts() {

	QB.data.list("Blog", filter, function(err, result){
		if (err) { 
			console.log(err);
		} else {
			console.log(result);

			var containerElement = $('#posts-container');

			for (var i=0; i < result.items.length; i++) {
				var postElement = $('<div></div>').addClass('starter-template');
				var postTitle = $('<h2></h2>').html(result.items[result.items.length-i-1].title);
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
			$('#title_post').val('');
			$('#body_post').val('');

			QB.data.list("Blog", filter, function(err, result){
				if (err) { 
					console.log(err);
				} else {
					console.log(result);

					var containerElement = $('#posts-container');
					var postElement = $('<div></div>').addClass('starter-template');
					var postTitle = $('<h1></h1>').html(textTitle);
							postElement.append(postTitle);
					var postBody = $('<p></p>').addClass('lead').html(textBody);
							postElement.append(postBody);

						containerElement.prepend(postElement);
					}
			});
		}
	});
}