QuickBlox JavaScript SDK
=================

The QuickBlox JavaScript SDK provides a JavaScript library making it even
easier to access the QuickBlox cloud backend platform.

For use inside browsers, a window scoped variable called QB is created.

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
QB.createSession(function(err, result) {
  if (err) { 
    console.log('Something went wrong: ' + err);
  } else {
    console.log('Session created with id ' + result.id);
  }
});

// list the users currently enrolled
QB.users.listUsers(function(err, result) {
  for (var i=0; i < result.items.length; i++) {
    console.log('User ' + result.items[i].login + ' is registered');
  }
});
```

Alternative initialisation
--------------------------

Based on user feedback it is now also possible to initialise the SDK using an existing token. This means you can generate a token elsewhere, for example serverside, and then use this token instead of initialising the SDK with your application key and secret.

The above simple example can then be coded as shown bellow:

```javascript
// initialise using a pre-generated valid token
QB.init('1b785b603a9ae88d9dfbd1fc0cca0335086927f1');

// list the users currently enrolled
QB.users.listUsers(function(err, result) {
  for (var i=0; i < result.items.length; i++) {
    console.log('User ' + result.items[i].login + ' is registered');
  }
});
````
Documentation
----------------------

You can look at it here http://quickblox.com/developers/Javascript

Questions and feedback
----------------------

Please raise questions, requests for help etc. via http://stackoverflow.com/questions/tagged/quickblox

Feedback and suggestions for improvement always welcome :)


Creating sessions in more detail
--------------------------------
```
QB.createSession(options, callback)

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
```

Please take a look at the specs for examples of how to use the APIs. In essence the JavaScript SDK is a thin facade to the REST API, so reading the docs [http://quickblox.com/developers/Overview] is strongly recommended :)


Modifying and building the library
----------------------------------
The quickblox.js library is build from a number of modules contained in the `js` folder. For example the `js/qbUsers.js` module contains the code that deals with the [Users API](http://quickblox.com/developers/Users).

These modules are combined into a single `quickblox.js` file in the root and so this is the only file that needs to be included in a `<script>` tag. To build the library, use the [browserify](http://browserify.org/) tool:
```
browserify -o quickblox.js js/quickblox.js
```

You will also need to have the dependencies listed in the package.json available, use `npm install` to load them.
