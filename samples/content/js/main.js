QB.init(24507, 'eskKgMVUc7nRSbq', 'UW6VdHKdAV8Jxc7',true);

var user_id;

$(document).ready(function(){
	QB.createSession({login: 'vladlukhanin', password: 'papajad24'}, function(err, result){
	   if (err) { 
	        console.log('Something went wrong: ' + err);
	    } else {
	        console.log('Session created with id ' + result.id);
	 		var token = result.token;
	 			user_id = result.id;

	 		// get content images
	        QB.content.list({page:'1', per_page: '6'}, function(error, response){
	    	  	$.each(response.items, function(index, item){
	    	  		var cur = this.blob;
	    	  		$('#pictures').append("<img src='http://api.quickblox.com/blobs/"+cur.id+"/download.xml?token="+token+"' alt='"+cur.name+"' class='animals img-responsive col-md-6 col-sm-6 col-xs-6' />");
	    	  	}); 
				  if (error) { 
		       		 console.log(error);
		    	  } else {
		    	  	console.log(response);	    	  	
		    	  }

			});


			var files = $("input[type=file]")[0].files;

			QB.content.create({name: "Test file", content_type: "image/jpeg", 'public': true}, function(err, response){
				if (err) {
			        console.log(err);
			    } else {
			        // Response will contain blob ID.

			        var data = {
			            blob_id: response.id,
			            blob_owner: user_id
			        }

			    }
			});
	    }
    });

		$(window).scroll(function() {
		     if  ($(window).scrollTop() == $(document).height() - $(window).height()) 
		     {
		        alert("это сработало событие");
		     }
		});
	
});
