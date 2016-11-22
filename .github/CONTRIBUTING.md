# How to contribute

First off, thanks that you help us to make Quickblox better.
Feedback and suggestions for improvement always welcome :)

## Coding conventions
Please follow all rules from our [code style guidelines](https://github.com/QuickBlox/CodeStyle-Guidelines-for-Developers/tree/master/web).

## Modify and build the library

The quickblox.min.js library is build from a number of **CommonJS modules** contained in the `src` folder. For example the `src/modules/qbUsers.js` module contains the code that deals with the [Users API](http://quickblox.com/developers/Users).

These modules are combined through [browserify](http://browserify.org/) into a single `quickblox.min.js` file in the root and so this is the only file that needs to be included in a `<script>` tag OR in a RequireJS application OR in Node.js environment (everywhere).
To build the library, uses [gulp](http://gulpjs.com/) task runner.

* You need to have the dependencies listed in the package.json available, use `npm install` to load them;
* Install [gulp](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md#getting-started) and globally;
* Install [jasmine](https://github.com/jasmine/jasmine#installation) globally;
* Change the 'version' properties in next files:
  * ./bower.json;
  * ./package.json;
  * ./src/qbConfig.js;
* Rebuild SDK: `npm run build`, check tests in node / browser env. 
* Update ./README.md;
* Make a pull request into gh-pages;
