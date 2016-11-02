/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
      console.log("onDeviceReady1");
        this.receivedEvent('deviceready');

        // // Just for iOS devices.
        // // Read more here https://github.com/eface2face/cordova-plugin-iosrtc
        // if (window.device.platform === 'iOS') {
        //   cordova.plugins.iosrtc.registerGlobals();
        // }

        console.log("onDeviceReady11");

        // // Load JavaScript files async
        // //
        // var loadScriptAsync = function(path){
        //     var jsScript = document.createElement("script");
        //     jsScript.type = "text/javascript";
        //     jsScript.async = false; //async is being set to false so that script will not immediately fire.
        //     jsScript.src = path;
        //     document.getElementsByTagName("body")[0].appendChild(jsScript);
        // }
        //
        // loadScriptAsync("https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min.js");
        // loadScriptAsync("https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js");
        // loadScriptAsync("https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.2.3/backbone-min.js");
        // loadScriptAsync("https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.5/js/bootstrap.min.js");
        // loadScriptAsync("https://cdnjs.cloudflare.com/ajax/libs/quickblox/2.3.4/quickblox.min.j");
        // loadScriptAsync("config.js");
        // loadScriptAsync("js/helpers.js");
        // loadScriptAsync("js/stateBoard.js");
        // loadScriptAsync("js/app.js");

        console.log("onDeviceReady2");
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();
