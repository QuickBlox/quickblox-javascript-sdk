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
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');

        console.log('onDeviceReady');

        // Just for iOS devices.
        // Read more here https://github.com/eface2face/cordova-plugin-iosrtc
        if (window.device.platform === 'iOS') {
            cordova.plugins.iosrtc.registerGlobals();
        }

        // Load JavaScript files async
        //
        var loadScriptAsync = function(path){
            var jsScript = document.createElement("script");
            jsScript.type = "text/javascript";
            jsScript.async = false; //async is being set to false so that script will not immediately fire.
            jsScript.src = path;
            document.getElementsByTagName("body")[0].appendChild(jsScript);
        }

        loadScriptAsync("https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js");
        loadScriptAsync("https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js");
        loadScriptAsync("https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js");
        loadScriptAsync("https://cdnjs.cloudflare.com/ajax/libs/quickblox/2.1.2/quickblox.min.js");
        loadScriptAsync("config.js");
        loadScriptAsync("js/msgBoard.js");
        loadScriptAsync("js/app.js");
        //
        //

    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    }
};

app.initialize();
