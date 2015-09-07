$(document).ready(function(){

QB.createSession(QBUser, function(err, result) {
	if (err) { 
		console.log('Something went wrong: ' + err);
	} else {
		var token = result.token;
			user_id = result.id;
			uploadPages = 0;
			filesCount = 0;
			finished = false;

		console.log('Session created with id ' + result.id);

		retrieveFiles(token);

		// uploading files scroll event
		$(window).scroll(function() {
			if  ($(window).scrollTop() == $(document).height() - $(window).height()){
				retrieveFiles(token);
			}
		});

		// loading image click event
		$("#loading-btn").click(function(e){
			e.preventDefault();

			var inputFile = $("input[type=file]")[0].files[0];
			console.log(inputFile);
			if (inputFile) {
				$("#progress").show(0);
			}

			// upload image
			QB.content.createAndUpload({name: inputFile.name, file: inputFile, type: inputFile.type, size: inputFile.size, 'public': false}, function(err, response){
				if (err) {
					console.log(err);
				} else {
					console.log(response);	

					$("#progress").fadeOut(400);

					var uploadedFile = response;

					showImage(uploadedFile.id, uploadedFile.name, token, false);
				}
			});
		});
	}
});
});

// show image
function showImage(fileId, fileName, token, toAppend){
	var imageHTML = "<img src='http://apistage3.quickblox.com/blobs/"+fileId+"/download.xml?token="+token+"' alt='"+fileName+"' class='animals img-responsive col-md-4 col-sm-6 col-xs-12' />";
	if (toAppend) {
		$('#pictures').append(imageHTML);
	} else {
		$('#pictures').prepend(imageHTML);
	}
}

// get content files
function retrieveFiles(token) {
	if (finished != true) {
		$("#loadwnd").show(0);
		uploadPages = uploadPages + 1;

		QB.content.list({page: uploadPages, per_page: '9'}, function(error, response) {
			if (error) {
				console.log(error);
			} else {
				$.each(response.items, function(index, item){
					var cur = this.blob;
					showImage(cur.id, cur.name, token, true);
				});

				console.log(response);
				$("#loadwnd").delay(1000).fadeOut(1000);

				var totalEntries = response.total_entries;
				entries = response.items.length;
				filesCount = filesCount + entries;

				if (filesCount >= totalEntries) {
					finished = true;
				}
			}
		});
	}
}