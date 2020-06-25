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

## **Improve bot's intelligence**

Usually, it's not enough just to build a simple bot that echoes your messages. It's better to add some intelligence for your bot. For this purpose, we need to connect some bot's intelligence platform/library to your bot. There is a cool product called [https://www.rivescript.com](https://www.rivescript.com/). RiveScript is a scripting language for chatbots, making it easy to write trigger/response pairs for building up a bot's intelligence.

### **Install RiveScript**

Inside your bot directory run the following command to install RiveScript:
```bash
npm install rivescript --save
```

### **Prepare '.rive' file**

RiveScript is a text-based scripting language meant to aid in the development of interactive chatbots. To write your own RiveScript code, you will only need a simple text editing program. A RiveScript document is a text file containing RiveScript code. These files will have a **.rive** extension. An example file name would be **replies.rive**.

Create a **txt** file in your bot's directory and name it **replies.rive**. Then go to [https://www.rivescript.com/try,](https://www.rivescript.com/try) choose **rs-standard.rive** template and copy all content into your file.

Read [more information](https://www.rivescript.com/docs/tutorial) on RiveScript code.

### **Connect RiveScript to your bot**

Open **index.js** file and add the following code:
```javascript
const RiveScript = require("rivescript");

//...

// Init RiveScript logic
const riveScriptGenerator = new RiveScript();

function loadingDone(batch_num) {
  console.log("[RiveScript] Batch #" + batch_num + " has finished loading!");
  riveScriptGenerator.sortReplies();
}

function loadingError(batch_num, error) {
  console.log(
    "[RiveScript] Load the batch #" + batch_num + " is failed",
    JSON.stringify(error)
  );
}

// load our replies file
riveScriptGenerator.loadFile("replies.rive", loadingDone, loadingError);

//...

let answerMessage = {
  type: "chat",
  body: riveScriptGenerator.reply(userId, msg.body),
  extension: {
    save_to_history: 1,
  },
};
//...
```

Here we initialize RiveScript, then load all replies flows from **replies.rive** file and build message reply based on RiveScript replies flows.

### **Run our bot**

 Type the following command to run our bot in terminal:

```bash
 node index.js
```

Now you can write something to your bot and will receive a reply. See the documentation at [https://docs.quickblox.com/docs/js-quick-start](https://docs.quickblox.com/docs/js-quick-start).
