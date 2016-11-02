# QuickBlox Apache Cordova (PhoneGap) VideoChat (WebRTC) code sample

## Overview

This is a code sample for [QuickBlox](https://quickblox.com/) platform. It is a great way for developers using QuickBlox platform to learn how to integrate WebRTC video calling features into your application.

[Cordova Get Started](https://cordova.apache.org/#getstarted) guide.


## Sample description

<img src="http://quickblox.com/developers//images/a/a8/Webrtc_cordova_sample1.PNG" border="1" alt="List of users to have a video chat with" width="300"> 
<img src="http://quickblox.com/developers//images/7/71/Webrtc_cordova_sample2.PNG" border="1" alt="iOS demo of Cordova Video Chat code sample" width="300"> 
<img src="http://quickblox.com/developers//images/e/ea/Webrtc_cordova_sample3.PNG" border="1" alt="Android demo of Cordova Video Chat code sample" width="300"> 

It allows:

1. Have 1-1 Video Chat.
2. Have group Video Chat.
3. Mute video and audio tracks.
4. Use filters for video stream.


## Documentation

Original sample description & setup guide - [Apache Cordova (PhoneGap) VideoChat (WebRTC) code sample](http://quickblox.com/developers/Sample-webrtc-cordova)


## Steps to build this sample from scratch
1. Create Cordova app:
```
cordova create HelloVideoChat
```
2. Copy content from **samples/webrtc** to **www** folder of your Cordova app.
4. Add platfroms:
```
cordova platform add ios --save &&
cordova platform add android --save &&
cordova platform add browser --save
```
5. Install [WebSocket-for-Android](https://github.com/knowledgecode/WebSocket-for-Android) plugin to support WebSockets on Android <4.4
6. Install **cordova-plugin-iosrtc** for WebRTC support on iOS:
[1](https://github.com/eface2face/cordova-plugin-iosrtc)
[2](https://github.com/eface2face/cordova-plugin-iosrtc/blob/master/docs/Building.md)
7. Install [https://www.npmjs.com/package/cordova-plugin-device](https://www.npmjs.com/package/cordova-plugin-device)
7. Install [iOS Deployment Tools](https://cordova.apache.org/docs/en/latest/guide/platforms/ios/#deployment-tools) to launch iOS apps into an iOS Device.
8. Customize **index.html** file and connect all your custom js files + QuickBlox JS framework in async manner. Also, replace relative path to QuickBlox framework in index.html to absolute via cdnjs.
9. Run on iOS device:
```
cordova clean ios && cordova run ios --device
```

##Debugging
1. [Safari Web inspector](http://phonegap-tips.com/articles/debugging-ios-phonegap-apps-with-safaris-web-inspector.html)
2. [cordova-plugin-console](https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-console/)