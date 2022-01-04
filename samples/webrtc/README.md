# QuickBlox JavaScript VideoChat Sample

# Overview

This is a code sample for [QuickBlox](http://quickblox.com/) platform.
It is a great way for developers using QuickBlox platform to learn how to integrate audio and video calling features into your application and how to use calling in foreground service.

The WebRTC VideoChat code sample allows you easily to add the video calling features into your Web app. Enable a video call function similar to Skype using this code sample as a basis.

It is built on the top of the WebRTC technology.

# Features
* Log in/log out
* Make and receive 1-to-1 and group audio call
* Make and receive 1-to-1 and group video call
* Search for users to make a call with
* Mute/unmute the microphone
* Display the list of call participants and their statuses
* Share a screen
* Switch camera
* See call timer
* Mirror local video
* Change settings (media, answer time interval, etc.)

# Get application credentials
[](#get-application-credentials)

QuickBlox application includes everything that brings messaging right
into your application - chat, video calling, users, push notifications,
etc. To create a QuickBlox application, follow the steps below:

1.  Register a new account following [this
    link](https://admin.quickblox.com/signup). Type in your email and
    password to sign in. You can also sign in with your Google or Github
    accounts.
2.  Create the app clicking **New app** button.
3.  Configure the app. Type in the information about your organization
    into corresponding fields and click **Add** button.
4.  Go to **Dashboard =\> *YOUR\_APP* =\> Overview** section and copy
    your **Application ID**, **Authorization Key**, **Authorization
    Secret**, and **Account Key**.
    
    
# Run video calling sample
[](#video-chat-sample)

To run a code sample, follow the steps below:

1.  Download the code sample.
2.  [Get application credentials](#get-application-credentials) and get appId, authKey, authSecret and accountKey.
               
3.  Put these values in **config.js** file located at the root catalog
    folder.

    JavaScript
    
        const creds = {
          appId: '',
          authKey: '',
          authSecret: '',
          accountKey: ''
        };

4.  Run the code sample by opening **index.html** file.

To ensure that the code sample runs smoothly, run it using the https
protocol or localhost. Our sample includes WebRTC
`getUserMedia()` method requesting for webrtc permissions and this method
does not work with HTTP protocol. For that reason, to run a webrtc
sample, https protocol or the localhost must be used.

# Sample description

This Sample demonstrates how to work with [JavaScript VideoChat](https://quickblox.com/developers/Sample-webrtc-web) QuickBlox module.

The sample allows to:

1. Authenticate with QuickBlox.
2. Receive and display users list.
3. Make audio calls
4. Make video calls
5. Make one-to-one calls
6. Make group calls with more than 2 opponents
7. Screen sharing
8. Switch video input device (camera) 

# Browsers support

| Edge   | Firefox | Chrome | Safari | Opera | Node.js |
|:----:|:-------:|:------:|:------:|:-----:|:-------:|
| 14+  |  52+    | 50+    |  11.1+  |  36+  |    6+   |
