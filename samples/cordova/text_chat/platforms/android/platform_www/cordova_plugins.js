cordova.define('cordova/plugin_list', function(require, exports, module) {
  module.exports = [
    {
      "id": "cordova-plugin-websocket.websocket",
      "file": "plugins/cordova-plugin-websocket/www/websocket.js",
      "pluginId": "cordova-plugin-websocket",
      "clobbers": [
        "WebSocket"
      ]
    }
  ];
  module.exports.metadata = {
    "cordova-plugin-console": "1.1.0",
    "cordova-plugin-websocket": "0.12.2"
  };
});