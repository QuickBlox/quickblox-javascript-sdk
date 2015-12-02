
var uploadPages = 0;
var filesCount = 0;
var finished = false;

$(document).ready(function(){

QB.createSession(QBUser, function(err, result) {
	if (err) {
		console.log('Something went wrong: ' + err);
	} else {

		retrieveFiles();

		// uploading files scroll event
		$(window).scroll(function() {
			if  ($(window).scrollTop() == $(document).height() - $(window).height()){
				retrieveFiles();
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

					showImage(uploadedFile.uid, uploadedFile.name, false);
				}
			});
		});
	}
});
});

// show image
function showImage(fileUID, fileName, toAppend){
	var imageHTML = "<img src='" + QB.content.privateUrl(fileUID) + "' alt='"+fileName+"' class='animals img-responsive col-md-4 col-sm-6 col-xs-12' />";
	if (toAppend) {
		$('#pictures').append(imageHTML);
	} else {
		$('#pictures').prepend(imageHTML);
	}
}

// get content files
function retrieveFiles() {
	if (finished != true) {
		$("#loadwnd").show(0);
		uploadPages = uploadPages + 1;

		QB.content.list({page: uploadPages, per_page: '9'}, function(error, response) {
			if (error) {
				console.log(error);
			} else {
				$.each(response.items, function(index, item){
					var cur = this.blob;
					showImage(cur.uid, cur.name, true);
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
