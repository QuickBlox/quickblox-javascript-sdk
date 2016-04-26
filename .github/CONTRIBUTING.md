# How to contribute

First off, thanks that you help us to make Quickblox better.
Feedback and suggestions for improvement always welcome :)

## Coding conventions
Please follow all rules from our [code style guidelines](https://github.com/QuickBlox/CodeStyle-Guidelines-for-Developers/tree/master/web).

## Modify and build the library

The quickblox.js library is build from a number of **CommonJS modules** contained in the `js` folder. For example the `js/modules/qbUsers.js` module contains the code that deals with the [Users API](http://quickblox.com/developers/Users).

These modules are combined through [browserify](http://browserify.org/) into a single `quickblox.js` file in the root and so this is the only file that needs to be included in a `<script>` tag OR in a RequireJS application OR in Node.js environment (everywhere). To build the library, use the [Grunt](http://gruntjs.com/) task runner.

* You need to have the dependencies listed in the package.json available, use `npm install` to load them;
* Install **grunt-cli** `npm install -g grunt-cli`;
* Also you need install **jasmine** global `npm i -g jasmine` for tests;
* Change the 'version' properties in next files:
  * https://github.com/QuickBlox/quickblox-javascript-sdk/blob/gh-pages/js/qbConfig.js;
  * https://github.com/QuickBlox/quickblox-javascript-sdk/blob/gh-pages/bower.json;
  * https://github.com/QuickBlox/quickblox-javascript-sdk/blob/gh-pages/package.json;
* Rebuild SDK: `grunt`;
* Update README.md;
* Commit your changes to git repository and create a new "git tag" for new version. This action updates SDK for GIT and also for bower package manager;
* `npm publish`. This action updates SDK for node package manager, but maybe you will be needed some author credentials for it (you should be in owner list);
* Update QuickBlox developers section.
