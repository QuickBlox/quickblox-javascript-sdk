QuickBlox Web SDK
=================

The QuickBlox Web SDK provides a JavaScript library making it even
easier to access the QuickBlox cloud backend platform.

For use inside browers, a window scoped variable called QB is created.

Most, with the notable exception of init, take a callback parameter
which gets called with an error and result parameter (ala node.js).

If the call was sucessful then result will contain the reply from the
QuickBlox platform. Similarly, if something went wrong then the error
parameter will give you a description of what the problem was.

A simple example
----------------
<code lang='javascript'>
// initalise the environmenet with my application id, authentication key
and authentication secret
QB.init(3477,'ChRnwEJ3WzxH9O4','AS546kpUQ2tfbvv');

// create an API session (user is not authenticated)

QB.createSession(function(err, result){
  if (err) { 
    console.log('Something went wrong: ' + err);
  } else {
    console.log('Session created with id ' + result.id);
  }
});

// list the users currently enrolled

QB.users.find( function(err,result){
  for (var i=0; i < result.items.length; i++) {
    console.log('User ' + result.items[i].login + ' is registered');
  }
});
</code>

In time we'll be adding examples of using the API in the samples
directory, in the meantime take a look at the specs.

Please raise questions etc should via http://stackoverflow.com/questions/tagged/quickblox

Feedback and suggestions for improvement always welcome :)

