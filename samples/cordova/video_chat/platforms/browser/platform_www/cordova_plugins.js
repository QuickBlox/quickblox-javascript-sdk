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
        "file": "plugins/cordova-plugin-device/src/browser/DeviceProxy.js",
        "id": "cordova-plugin-device.DeviceProxy",
        "pluginId": "cordova-plugin-device",
        "runs": true
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-custom-config": "3.0.14",
    "cordova-plugin-console": "1.0.4",
    "cordova-plugin-device": "1.1.3",
    "cordova-plugin-iosrtc": "3.1.0",
    "cordova-plugin-whitelist": "1.3.0"
}
// BOTTOM OF METADATA
});