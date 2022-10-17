# Overview
QuickBlox JS-Django Sample Chat

# Running the Django App
1. Install Python 3.8+ and Django 3.1.7 +
2. Activate a virtual environment. You may need to install some additional packages if you are on Linux. 
Run the command `python -m venv <my-env>` and hit enter. You may need to use `python3` on Unix. Please note that `<my-env>` can be a name of choice, but use something descriptive, like `djangovenv`.
Then after run the command `<my-venv>\Scripts\activate` on Windows or `source <my-env>/bin/activate` on Unix.
3. Install the requirements by running `pip install -r requirements.txt`
4. Run the server by running `python manage.py runserver` in an active virtual environment.
5. Collect static files by running `python manage.py collectstatic`
6. Open the browser and go to `http://localhost:8000/` to see the app running.
NOTE: You do not need to perform any database migrations as this app does not use the django ORM and Database. But this is a future enhancement.
-----
This is a code sample for [QuickBlox](http://quickblox.com/) platform. It is a great way for developers using QuickBlox platform to learn how to integrate private and group chat, add text and image attachments sending into your application.

# Features
* Log in/log out
* Send and receive message/attachment
* Create and leave a 1-to-1 and group chat
* Create a public chat
* Display users who have received/read the message
* Mark messages as read/delivered
* Send typing indicators
* List and delete chats
* Display chat history
* Display a list with chat participants
* Optimised for Django [Still in Development]
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

# Run chat sample

To run a code sample, follow the steps below:

1.  Download the code sample.
2.  [Get application credentials](#get-application-credentials) and get appId, authKey, authSecret, and accountKey.
3.  Put these values in file **QBconfig.js** following **samples =\>
    chat =\> js** directory.

    JavaScript
    
        var QBconfig = {
          credentials: {
            appId: '',
            authKey: '',
            authSecret: '',
            accountKey: ''
          }
        }

4.  Run the code sample by opening **index.html** file.

# Requirements
[](#requirements)

The minimum requirements for QuickBlox JavaScript SDK are:

-   JavaScript es5.

# Documentation

Sample documentation is available [here](https://quickblox.com/developers/Web_XMPP_Chat_Sample#Guide:_Getting_Started_with_Chat_API).
