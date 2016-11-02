# QuickBlox Apache Cordova (PhoneGap) Chat code sample

## Overview

This is a code sample for [QuickBlox](https://quickblox.com/) platform. It is a great way for developers using QuickBlox platform to learn how to integrate private and group chat, add text and image attachments sending into your application.

[Cordova Get Started](https://cordova.apache.org/#getstarted) guide.

## Sample description

<img src="http://quickblox.com/developers//images/7/74/Cordova_chat_sample1.png" border="1" alt="1-1 ang Group chats" width="600"> 

It allows:

1. Authenticate with Quickblox Chat and REST.
2. Receive and display list of dialogs.
3. Modify dialog by adding occupants.
4. Real-time chat messaging and attachment's handling.
5. Offline storage for messages, dialogs and users.


## Documentation

Original sample description & setup guide - [Apache Cordova (PhoneGap) Chat code sample](http://quickblox.com/developers/Sample-chat-cordova)

## Steps to build this sample from scratch
1. Create Cordova app:
```
cordova create hello com.example.hellochat HelloChat
```
2. Copy content from **samples/chat** to **www** folder of your Cordova app.
3. Add platfroms:
```
cordova platform add ios --save &&
cordova platform add android --save &&
cordova platform add browser --save
```
4. Replace relative path to QuickBlox framework in index.html to absolute via cdnjs.
5. Install [WebSocket-for-Android](https://github.com/knowledgecode/WebSocket-for-Android) plugin to support WebSockets on Android <4.4