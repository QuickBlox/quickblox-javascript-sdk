 
QB.init(24507, 'Me6RS7rH3s-5EhF', '4X-EBTqRwmUHMJG');
$(document).ready(function(){
	QB.createSession({login: 'vladlukhanin', password: 'papajad24'},function(err, result){
	   if (err) { 
	        console.log('Something went wrong: ' + err);
	    } else {
	        console.log('Session created with id ' + result.id);
	 		var token = result.token;

	 		// get content images
	        QB.content.list(function(error, response){
			  if (error) { 
	       		 console.log(error);
	    	  } else {
	    	  	console.log(response);
	    	  	$.each(response.items, function(index,item){
	    	  		var cur = this.blob;
	    	  		$('#pictures').append("<img src='http://api.quickblox.com/blobs/"+cur.id+"/download.xml?token="+token+"' alt='"+cur.name+"' class='animals img-responsive col-md-4 col-sm-4 col-xs-4' />");

	    	  	});
	    	  }

			});
	    }
    });
    alert(getTime());
});