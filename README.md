# QuickBlox JavaScript SDK

[![travis-ci](https://api.travis-ci.org/QuickBlox/quickblox-javascript-sdk.svg?branch=gh-pages)](https://travis-ci.org/QuickBlox/quickblox-javascript-sdk)
[![npm](https://img.shields.io/npm/v/quickblox.svg)](https://www.npmjs.com/package/quickblox)
[![npm](https://img.shields.io/npm/dm/quickblox.svg)](https://www.npmjs.com/package/quickblox)

The QuickBlox JavaScript SDK provides a JavaScript library making it even
easier to access the QuickBlox cloud communication backend platform.

[QuickBlox](https://quickblox.com) is a suite of communication features & data services (APIs, SDKs, code samples, admin panel, tutorials) which help digital agencies, mobile developers and publishers to add great communication functionality to smartphone applications like in Skype, WhatsApp, Viber.


# Install

## Dependencies for browser

For the library to work, you need to include either [jQuery](http://jquery.com/) or [Zepto](http://zeptojs.com/) in your html before `quickblox.min.js`, like so:

For correct work of JS SDK you must include the  library in your html before `quickblox.js`, like so:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/quickblox/2.0.4/quickblox.min.js"></script>
```

## Bower and RequireJS

If you use bower package manager for your project, you can install JS SDK through bower:

```
bower install quickblox --save
```

When you use **RequireJS**, you are able to use quickblox as AMD module. SDK supports [UMD (Universal Module Definition)](https://github.com/umdjs/umd) pattern for JavaScript modules. So it is possible to use SDK everywhere (as browser global variable, with AMD module loader like RequireJS or as CommonJS module for Node.js environment).

## Node.js and NPM integration

Also you can use QuickBlox JavaScript SDK with server-side applications on NodeJS through the native node package. Just install the package in your application project like that:

```
npm install quickblox --save
```

And you're ready to go:

```javascript
var QB = require('quickblox');

// OR to create many QB instances
var QuickBlox = require('quickblox').QuickBlox;
var QB1 = new QuickBlox();
var QB2 = new QuickBlox();
```

## Download ZIP archive

[QuickBlox JavaScript SDK, zip archive](https://github.com/QuickBlox/quickblox-javascript-sdk/archive/gh-pages.zip)

# Browsers support

| IE   | Firefox | Chrome | Safari | Opera | Android Browser | Blackberry Browser | Opera Mobile | Chrome for Android | Firefox for Android |
|:----:|:-------:|:------:|:------:|:-----:|:---------------:|:------------------:|:------------:|:------------------:|:------------------------:|
| 10+  |  4+     | 13+    |  6+    |  12+	 |       4.4+	     |         10+        |	     12+	    |         35+        |	         30+             |

# Documentation

You can look at it here http://quickblox.com/developers/Javascript

# Questions and feedback

Please raise questions, requests for help etc. via http://stackoverflow.com/questions/tagged/quickblox

Feedback and suggestions for improvement always welcome :)

# Modifying and building the library

The quickblox.js library is build from a number of **CommonJS modules** contained in the `js` folder. For example the `js/modules/qbUsers.js` module contains the code that deals with the [Users API](http://quickblox.com/developers/Users).

These modules are combined through [browserify](http://browserify.org/) into a single `quickblox.js` file in the root and so this is the only file that needs to be included in a `<script>` tag OR in a RequireJS application OR in Node.js environment (everywhere). To build the library, use the [Grunt](http://gruntjs.com/) task runner:

* You need to have the dependencies listed in the package.json available, use `npm install` to load them.
* Install **grunt-cli** `npm install -g grunt-cli`
* Also you need install **jasmine** global `npm i -g jasmine` for tests.
* Change the 'version' properties in next files:
  * https://github.com/QuickBlox/quickblox-javascript-sdk/blob/gh-pages/js/qbConfig.js
  * https://github.com/QuickBlox/quickblox-javascript-sdk/blob/gh-pages/bower.json
  * https://github.com/QuickBlox/quickblox-javascript-sdk/blob/gh-pages/package.json
* Rebuild SDK: `grunt`
* Update README.md
* Commit your changes to git repository and create a new "git tag" for new version. This action updates SDK for GIT and also for bower package manager.
* `npm publish`. This action updates SDK for node package manager, but maybe you will be needed some author credentials for it (you should be in owner list)
* Update QuickBlox developers section

# License
BSD
