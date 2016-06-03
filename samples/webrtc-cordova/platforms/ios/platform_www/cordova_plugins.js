cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/cordova-plugin-device/www/device.js",
        "id": "cordova-plugin-device.device",
        "pluginId": "cordova-plugin-device",
        "clobbers": [
            "device"
        ]
    },
    {
        "file": "plugins/cordova-plugin-iosrtc/dist/cordova-plugin-iosrtc.js",
        "id": "cordova-plugin-iosrtc.Plugin",
        "pluginId": "cordova-plugin-iosrtc",
        "clobbers": [
            "cordova.plugins.iosrtc"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-device": "1.1.2",
    "cordova-plugin-iosrtc": "3.0.0",
    "cordova-plugin-whitelist": "1.2.2"
}
// BOTTOM OF METADATA
});