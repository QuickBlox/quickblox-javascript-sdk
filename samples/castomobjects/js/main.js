QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret, true);

// Create session
QB.createSession(QBUser, function(err, result){
   if (err) { 
        console.log('Something went wrong: ' + err);
    } else {
        console.log('Session created with id ' + result.id);
 
        // Get all posts
        QB.data.list("Post", null, function(err, result){
            if (err) { 
                console.log('Something went wrong: ' + err);
            } else {
                // render posts here
                var containerElement = document.getElementById('posts-container');
                for (var i=0; i < result.items.length; i++) {
                    var postElement = document.createElement('div'); 
                    postElement.className = 'starter-template';
 
                    var postTitle = document.createElement('h1'); 
                    postTitle.innerHTML = '#' + (i+1) + ' ' + result.items[result.items.length-i-1].title;
                    postElement.appendChild(postTitle);
 
                    var postBody = document.createElement('p'); 
                    postBody.className = 'lead';
                    postBody.innerHTML = result.items[result.items.length-i-1].body;
                    postElement.appendChild(postBody);
 
                    containerElement.appendChild(postElement);
                }
            }
        });
    }
});

});