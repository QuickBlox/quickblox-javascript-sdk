# QuickBlox JavaScript SDK

[![travis-ci](https://api.travis-ci.org/QuickBlox/quickblox-javascript-sdk.svg?branch=gh-pages)](https://travis-ci.org/QuickBlox/quickblox-javascript-sdk)
[![Code Climate](https://codeclimate.com/github/QuickBlox/quickblox-javascript-sdk/badges/gpa.svg)](https://codeclimate.com/github/QuickBlox/quickblox-javascript-sdk)
[![npm](https://img.shields.io/npm/v/quickblox.svg)](https://www.npmjs.com/package/quickblox)
[![npm](https://img.shields.io/npm/dm/quickblox.svg)](https://www.npmjs.com/package/quickblox)

The QuickBlox JavaScript SDK provides a JavaScript library making it even easier to access the QuickBlox cloud communication backend platform.

[QuickBlox](https://quickblox.com) is a suite of communication features & data services (APIs, SDKs, code samples, admin panel, tutorials) which help digital agencies, mobile developers and publishers to add great communication functionality to smartphone applications like in Skype, WhatsApp, Viber.

Check out our [API Reference](https://quickblox.github.io/quickblox-javascript-sdk/docs/) for more detailed information about our SDK.

# Install

## Dependencies for browser

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/quickblox/2.12.6/quickblox.min.js"></script>
```

## Bower and RequireJS

If you use the bower package manager for your project, you can install the JS SDK through bower:

```
bower install quickblox --save
```

When you use **RequireJS**, you are able to use QuickBlox as an AMD compliant module. The SDK supports the [UMD (Universal Module Definition)](https://github.com/umdjs/umd) pattern for JavaScript modules, so it is possible to use the SDK everywhere (as a global variable in the browser via an AMD module loader like RequireJS or as a CommonJS module in a Node.js environment).

## Node.js and NPM integration

Also you can use QuickBlox JavaScript SDK with server-side applications on NodeJS through the native node package. Just install the package in your application project like this:

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

| Edge   | Firefox | Chrome | Safari | Opera | Node.js |
|:----:|:-------:|:------:|:------:|:-----:|:-------:|
| 14+  |  52+    | 50+    |  11.1+  |  36+  |    6+   |

# Documentation

You can look at it here https://quickblox.com/developers/Javascript

# Questions and feedback

Please raise questions, requests for help etc. via https://stackoverflow.com/questions/tagged/quickblox

Feedback and suggestions for improvement always welcome :)

# How to contribute
See more information at [contributing.md](https://github.com/QuickBlox/quickblox-javascript-sdk/blob/gh-pages/.github/CONTRIBUTING.md)

# License
Apache 2.0
