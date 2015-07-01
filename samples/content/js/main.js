QB.init(24507, 'eskKgMVUc7nRSbq', 'UW6VdHKdAV8Jxc7',true);
$(document).ready(function(){
	QB.createSession({login: 'vladlukhanin', password: 'papajad24'}, function(err, result){
	   if (err) { 
	        console.log('Something went wrong: ' + err);
	    } else {
	        console.log('Session created with id ' + result.id);
	 		var token = result.token;

	 		// get content images
	        QB.content.list({page:'1', per_page: '6'}, function(error, response){
	    	  	$.each(response.items, function(index, item){
	    	  		var cur = this.blob;
    					// response.items.length = response.total_entries;
	    	  		$('#pictures').append("<img src='http://api.quickblox.com/blobs/"+cur.id+"/download.xml?token="+token+"' alt='"+cur.name+"' class='animals img-responsive col-md-6 col-sm-6 col-xs-6' />");
	    	  	}); 
				  if (error) { 
		       		 console.log(error);
		    	  } else {
		    	  	console.log(response);	    	  	
		    	  }

				});
	    }
    });

		// $(window).scroll( function (e) {
		// 	var need_height = $(window).height();
		// 	if ($(document).scrollTop() > need_height) {
		//         alert('Элемент foo был прокручен... скроллирован... ну как там это называется то?!');
		// 	}
		// });
	
});


