QuickBlox Web SDK
=================

The QuickBlox Web SDK provides a JavaScript library making it even
easier to access the QuickBlox cloud backend platform.

For use inside browers, a window scoped variable called QB is created.

Most functions, with the notable exception of init, take a callback
parameter which gets called with an error and result parameter (ala node.js).

If the call was sucessful then result will contain the reply from the
QuickBlox platform. Similarly, if something went wrong then the error
parameter will give you a description of what the problem was.

A simple example
----------------

```javascript
// initalise the environmenet with my application id, authentication key and authentication secret
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
```

Please raise questions etc should via http://stackoverflow.com/questions/tagged/quickblox

Feedback and suggestions for improvement always welcome :)

The APIs in more detail
-----------------------
```javascript
QB.createSession(options, callback)
```
options: A map of additional options to pass to the method
  appId - your application's id (overrides the value passed to QB.init)
  authKey - your application's authorization key (overrides the value passed to QB.init)
  authSecret - your application's authorization secret (overrides the value passed to QB.init)
  login - the QuickBlox username of the person to login
  password - the QuickBlox user's password
  email - the email address of the QuickBlox user
  provider - the name of the social network provider for authenticating via Twitter of Facebook
  scope - a list of permisions required by the facebook app
  keys - a map of :
          token - social network access token
          secret - social network access token secret (only required for twitter)



