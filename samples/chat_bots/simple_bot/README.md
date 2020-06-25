## **Overview**

Bots are third-party applications that run inside QuickBlox platform. Bots have almost the same qualities as humans: they have profile photos, names, they can send messages and upload files, and they can be added to and removed from private group chats. Chatbots are controlled programmatically via [QuickBlox Javascript/Node.js SDK](https://docs.quickblox.com/docs/js-quick-start).

## **How To Build Chatbots**

### **Create a new app in the Dashboard**

QuickBlox application includes everything that brings messaging right into your application - chat, video calling, users, push notifications, etc. To create a QuickBlox application, follow the steps below:
1. Register a new account following [this link](https://admin.quickblox.com/signup). Type in your email and password to sign in. You can also sign in with your Google or Github accounts.
2. Create the app clicking **New app** button.
3. Configure the app. Type in the information about your organization into corresponding fields and click **Add** button.
4. Go to **Dashboard => *YOUR_APP* => Overview** section and copy your **Application ID**, **Authorization Key**, **Authorization Secret**, and **Account Key** . 

### **Create bot user**

To create a bot user, follow the steps below:

1. Go to **Dashboard => *YOUR_APP* => Users => Add new user** direction
2. Copy **user ID**. The user ID appears in the table with users once a User is created 
3. Copy **password**. The password is taken from the **Add user** form. 
4. Save **user ID** and **password** somewhere. We will use these 2 values later on.

### **Create Node.js carcass application**

Open terminal and type the following commands:  
```bash
mkdir my_awesome_bot
cd my_awesome_bot
npm init
```

This will ask you a bunch of questions, and then write a package.json file for you. More information on [npm init](https://docs.npmjs.com/cli/init). The main thing is that we have now a **package.json** file and can start to develop our first chatbot.

### **Connect QuickBlox Javascript/Node.js SDK**

In terminal type the following command:

```bash
npm install quickblox --save
```

### **Create index.js file**

Type the following command in terminal:
```bash
touch index.js
```

It will create the main entry point for your bot. Open this file and let's write some logic.

### **Making your bot heart beat**

Open **index.js** file and write the following code:

```javascript
"use strict";

const QB = require("quickblox");

const CONFIG = {
  appId: "...",
  authKey: "...",
  authSecret: "...",
  botUser: {
    id: "...",
    password: "...",
  },
};

// Initialise QuickBlox
QB.init(CONFIG.appId, CONFIG.authKey, CONFIG.authSecret);

// Connect to Real-Time Chat
QB.chat.connect(
  {
    userId: CONFIG.botUser.id,
    password: CONFIG.botUser.password,
  },
  (chatConnectError) => {
    if (chatConnectError) {
      console.log(
        "[QB] chat.connect is failed",
        JSON.stringify(chatConnectError)
      );
      process.exit(1);
    }

    console.log("[QB] Bot is up and running");

    // Add chat messages listener
    QB.chat.onMessageListener = onMessageListener;
  }
);

function onMessageListener(userId, msg) {
  // process 1-1 messages
  if (msg.type == "chat") {
    if (msg.body) {
      let answerMessage = {
        type: "chat",
        body: msg.body, // echo back original message
        extension: {
          save_to_history: 1,
        },
      };

      QB.chat.send(userId, answerMessage);
    }
  }
}

process.on("exit", function () {
  console.log("Kill bot");
  QB.chat.disconnect();
});
```

This is a simple bot that simply replies back with origin message. 

For `CONFIG` variable put the following values:

1. **Bot user ID** and **password**. Get these values following **Dashboard => *YOUR_APP* => Users => Add new user** direction. The user ID appears in the table with users once a User is created and the password is taken from the **Add user** form.

2. **Application ID**, **Authorization Key**, and **Authorization Secret**. Get these values following **Dashboard => *YOUR_APP* => Overview** direction and copy them from here. 


### **Run our bot**

In terminal type the following command:

```bash
node index.js
```

Now you can write something to your bot and will receive a reply. See the documentation at [https://docs.quickblox.com/docs/js-quick-start](https://docs.quickblox.com/docs/js-quick-start).

### **Next step**

You can take your simple bot to the next level by adding some intelligence to it. Check out [this sample](https://quickblox.github.io/quickblox-javascript-sdk/samples/chat_bots/rivescript/) to see a clever bot in action. Follow the guide to learn how to run your clever bot.
