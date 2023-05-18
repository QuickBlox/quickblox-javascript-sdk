# Table of Content

- [About](#about)
- [Features](#features)
- [How to launch](#how-to-launch)
    * [1. Install Node.js and NPM integration](#1-install-nodejs-and-npm-integration)
    * [2. Build](#2-build)
    * [3. Run on development server](#3-run-on-development-server)
        + [3.1 Get application credentials](#31-get-application-credentials)
        + [3.2 Set application credentials](#32-set-application-credentials)
        + [3.3 Run the application](#33-run-the-application)
- [Documentation](#documentation)
- [License](#license)


# About

This project is a sample to describe general flow to customize QuickBlox React UI Kit.

The QuickBlox JavaScript SDK provides a JavaScript library making it even easier to access the QuickBlox cloud communication backend platform.

[QuickBlox](https://quickblox.com) is a suite of communication features & data services (APIs, SDKs, code samples, admin panel, tutorials) which help digital agencies, mobile developers and publishers to add great communication functionality to smartphone applications like in Skype, WhatsApp, Viber.

# Features

- App shows build version
- Log in
- Create chat
- Rename chat
- See Public chat
- Send messages + attachments
- Message's statuses
- Receive messages + attachments
- Leave chat
- Add users to chat
- Log out

# How to launch
## 1. Install Node.js and NPM integration

Just install the package in your application project:

Navigate the current project folder ***\samples\react-chat*** and type

```
npm install
```

## 2. Build

Run `nmp run build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## 3. Run on development server

### 3.1 Get application credentials

QuickBlox application includes everything that brings messaging right
into your application - chat, video calling, users, push notifications,
etc. To create a QuickBlox application, follow the steps below or welcome to 
QuickBlox [Credentials](https://quickblox.com/developers/5_Minute_Guide), where you can get your credentials in just 5 minutes! 

All you need is to:

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

### 3.2 Set application credentials

Before run a code sample:
1. get appId, authKey, authSecret, and accountKey
2. put these values in file **QBconfig.ts** following **samples =\>
   react-chat =\> src** directory.

   TypeScript

        export const QBconfig  = {
          credentials: {
            appId: '',
            authKey: '',
            authSecret: '',
            accountKey: ''
          }
        }

### 3.3 Run the application

Run `npm start` and navigate to `http://localhost:3000/`. The app will automatically reload if you change any of the source files.

# Documentation

https://docs.quickblox.com/docs/react-uikit

# License

MIT

