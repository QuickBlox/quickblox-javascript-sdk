
# QuickBlox Apache Cordova Samples Setup Guide

## Overview

This document explains how to set up QuickBlox chat and video chat samples using Apache Cordova on Windows 11. Cordova allows converting JavaScript apps into mobile apps via WebView. The guide covers installing the environment, preparing web and Android platforms, copying JavaScript code, and building APK files.

---
## Diagnosis: What is Already Installed

Run the following commands to diagnose your environment:

```bash
cordova -v
java -version
adb --version
cordova requirements
cordova platform ls
cordova plugin ls
```

Expected versions:

```
Cordova:           12.0.0 (cordova-lib@12.0.2)
Java:              OpenJDK Temurin-17.0.16+8 (64-bit)
Android SDK:       Platform 35+, Build Tools 33.0.2+
Gradle:            8.9
```

---
## Part 1. System Installation and Configuration (Windows 11)

### 1.1 Install Java JDK 17 via Adoptium

- Link: https://adoptium.net/en-GB/temurin/releases/?version=17
- Select:
  - Version: 17
  - OS: Windows
  - Arch: x64
- Download `.msi` installer (e.g. `OpenJDK17U-jdk_x64_windows_hotspot_17.0.x.msi`)
- Install Java
- Set environment variable in terminal:

```powershell
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot"
java -version
```

### 1.2 Install Android SDK via Android Studio

- Download: https://developer.android.com/studio
- On first launch:
  - Choose `Custom Install`
  - Ensure SDK + Command-line tools are checked
- In SDK Manager, install:
  - Android SDK Platform 33+
  - SDK Command-line Tools (latest)

### 1.3 Set Environment Variables

```powershell
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot", "User")
[Environment]::SetEnvironmentVariable("ANDROID_SDK_ROOT", "$env:LOCALAPPDATA\Android\Sdk", "User")
```

Restart PowerShell and verify:

```powershell
echo $env:JAVA_HOME
echo $env:ANDROID_SDK_ROOT
```

---
## Part 2. Cordova Installation

### 2.1 Option A — Using Official Node.js

- Download Node.js LTS (18.x): https://nodejs.org/en
- Then run:

```bash
npm install -g cordova
cordova -v
```

### 2.2 Option B — Using `nvm`

```bash
nvm install 20.17.0
nvm use 20.17.0
npm install -g cordova
node -v
npm -v
cordova -v
```

---
## Part 3. Create `text_chat` Project

### 3.1 Create Project

```bash
cordova create text_chat com.quickblox.textchat TextChat
cd text_chat
```

### 3.2 Add Platforms

```bash
cordova platform add android@14
cordova platform add browser
```

### 3.3 Install Plugins

```bash
cordova plugin add cordova-plugin-websocket@0.12.2
cordova plugin add cordova-plugin-console@1.1.0
cordova plugin add cordova-plugin-whitelist@1.3.5
```

### 3.4 Copy HTML/JS Files

- Copy contents of `samples/chat` → `text_chat/www`
- Copy `quickblox.js` → `text_chat/www/js`
- Update `index.html`:

```html
<!-- Before -->
<script src="../../quickblox.js" defer></script>

<!-- After -->
<script src="./js/quickblox.js" defer></script>
```

---
## Part 4. Launch `text_chat`

### 4.1 Web Version

```bash
cordova run browser
```

Opens in: `http://localhost:8000`

### 4.2 Build Android APK

```powershell
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot"
cordova build android
```

APK path:

```
text_chat/platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

---
## Part 5. Create `video_webrtc_chat` Project

### 5.1 Create Project

```bash
cordova create video_webrtc_chat com.quickblox.videowebrtc VideoWebRTC
cd video_webrtc_chat
cordova platform add android@14
cordova platform add browser
```

### 5.2 Install Plugins

```bash
cordova plugin add cordova-plugin-console
cordova plugin add cordova-custom-config
cordova plugin add cordova-plugin-websocket
```

### 5.3 Copy HTML/JS Files

- Copy from `samples/webrtc` → `video_webrtc_chat/www`
- Update `index.html` to load scripts dynamically on `deviceready`:

```html
<script src="cordova.js"></script>
<script>
document.addEventListener('deviceready', function () {
  var scripts = [
    "js/quickblox.js",
    "config.js",
    "js/helpers.js",
    "js/stateBoard.js",
    "js/app.js"
  ];
  scripts.forEach(path => {
    var el = document.createElement("script");
    el.src = path;
    document.body.appendChild(el);
  });
});
</script>
```

---
## Part 6. Launch `video_webrtc_chat`

### 6.1 Web Version

```bash
cordova run browser
```

### 6.2 Build Android APK

```powershell
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot"
cordova build android
```

APK path:

```
video_webrtc_chat/platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

Transfer to phone via email or USB to install.
