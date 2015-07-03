QB.init(24507, 'eskKgMVUc7nRSbq', 'UW6VdHKdAV8Jxc7', true);

$(document).ready(function(){
// create session
	QB.createSession({login: 'vladlukhanin', password: 'papajad24'}, function(err, result) {
		if (err) { 
			console.log('Something went wrong: ' + err);
		} else {
			console.log('Session created with id ' + result.id);
			var token = result.token;
				user_id = result.id;
				uploadPages = 1;

			// get content images
			function uploadingImages() {
				QB.content.list({page: uploadPages, per_page: '4'}, function(error, response) {
				$.each(response.items, function(index, item){
					var cur = this.blob;
					$('#pictures').append("<img src='http://api.quickblox.com/blobs/"+cur.id+"/download.xml?token="+token+"' alt='"+cur.name+"' class='animals img-responsive col-md-6 col-sm-6 col-xs-6' />");
				});
					if (error) {
						console.log(error);
					} else {
						console.log(response);

						$.ajax({
							beforeSend: function(){
								$("#loadwnd").show(0);
							},
							complete: function(){
								$("#loadwnd").delay(1250).hide(0);
							}
						});

					}
				});
			}

			uploadingImages();

			// uploading images scroll event
			$(window).scroll(function() {
				if  ($(window).scrollTop() == $(document).height() - $(window).height())
				{
					uploadPages = uploadPages + 1;
					uploadingImages();
				}
			});

			// loading image click event
			$("#loading-btn").click(function(e){
				e.preventDefault();

				var inputFile = $("input[type=file]")[0].files[0];
				console.log(inputFile);
				// uploading image
				QB.content.createAndUpload({name: inputFile.name, file: inputFile, type: inputFile.type, size: inputFile.size, 'public': true}, function(err, response){
					if (err) {
						console.log(err);
					} else {
						console.log(response);
						$.ajax({
							beforeSend: function(){
								$("#progress").show(0);
							},
							complete: function(){
								$("#progress").delay(1250).hide(0);
							}
						});
					}
				});
			});

		}
	});
});
