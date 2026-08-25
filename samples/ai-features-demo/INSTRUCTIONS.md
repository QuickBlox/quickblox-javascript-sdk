# QuickBlox AI Features Demo - Instructions

## Prerequisites

### 1. QuickBlox Account Setup

1. Create account at [admin.quickblox.com](https://admin.quickblox.com)
2. Create new application or use existing one
3. Note your credentials:
   - **App ID** (number)
   - **Auth Key** (string)
   - **Auth Secret** (string)
   - **Account Key** (string)

### 2. Enable AI Features

1. Go to QuickBlox Dashboard
2. Navigate to **AI Features** section
3. Enable required features:
   - AI Gateway
   - AI Summarize
   - AI Translate
   - AI Answer Assist
4. Create **Smart Chat Assistant** and copy its ID

### 3. Create Test User

1. In Dashboard go to **Users** section
2. Create new user with login/password
3. Note credentials for testing

---

## Running the Demo

### Method 1: Direct File Open

1. Navigate to `samples/ai-features-demo/`
2. Open `index.html` in browser (Chrome, Firefox, Edge)

> Note: Some browsers may block local file requests. Use Method 2 if you encounter CORS issues.

### Method 2: Local HTTP Server

Using Python:
```bash
cd samples/ai-features-demo
python -m http.server 8080
# Open http://localhost:8080 in browser
```

Using Node.js:
```bash
npx serve samples/ai-features-demo
# Open provided URL in browser
```

Using PHP:
```bash
cd samples/ai-features-demo
php -S localhost:8080
# Open http://localhost:8080 in browser
```

---

## Using the Demo

### Step 1: Configuration

Fill in the configuration form:

| Field | Description | Example |
|-------|-------------|---------|
| App ID | Your application ID | `12345` |
| Auth Key | Application auth key | `YOUR_AUTH_KEY` |
| Auth Secret | Application auth secret | `YOUR_AUTH_SECRET` |
| Account Key | Your account key | `YOUR_ACCOUNT_KEY` |
| User Login | Test user login | `testuser` |
| User Password | Test user password | `password123` |
| Smart Chat Assistant ID | AI Assistant ID | `6633a1300fea600001bd6e71` |

Click **"Initialize & Login"** button.

If successful, you will see:
- Green status: "Logged in (User ID: XXXXX)"
- AI Features tabs will appear

---

### Step 2: Testing AI Gateway

The **Gateway** tab demonstrates `QB.ai.gateway()` - multimodal AI with text and images.

#### Quick Tests:

| Button | What it does |
|--------|--------------|
| **Text Message** | Sends "Hello, what can you do?" |
| **Image Recognition** | Analyzes library room image from documentation |
| **Multi-turn** | Math conversation with system prompt |

#### Custom Request:

1. Enter your message in "Custom Message" field
2. (Optional) Add image URL in "Image URL" field
3. Click **"Send to Gateway"**

#### Expected Response:
```
The response will appear in the green "Response" box.
For image recognition, expect description of the image content.
```

---

### Step 3: Testing AI Summarize

The **Summarize** tab demonstrates `QB.ai.summarize()` - dialog summary generation.

#### Steps:

1. Click **"Load My Dialogs"** to fetch your dialogs
2. Click on a dialog name to select it (or enter Dialog ID manually)
3. Click **"Summarize Dialog"**

#### Expected Response:
```
Summary of the conversation discussing [topic]...
```

> Note: Empty dialogs return "Chat is empty."

---

### Step 4: Testing AI Translate

The **Translate** tab demonstrates `QB.ai.translate()` - text translation.

#### Steps:

1. Enter text in "Text to translate" field
2. Select target language from dropdown
3. Click **"Translate"**

#### Supported Languages:

| Code | Language |
|------|----------|
| es | Spanish |
| fr | French |
| de | German |
| ru | Russian |
| uk | Ukrainian |
| ja | Japanese |
| zh-Hans | Chinese (Simplified) |
| ar | Arabic |
| pt | Portuguese |
| it | Italian |
| ko | Korean |
| pl | Polish |

#### Example:
```
Input: "Hello, how are you?"
Language: Spanish (es)
Output: "Hola, ¿cómo estás?"
```

---

### Step 5: Testing AI Answer Assist

The **Answer Assist** tab demonstrates `QB.ai.answerAssist()` - AI assistant with history.

#### Without History:

1. Enter your question in "Your message" field
2. Click **"Clear History"** to remove any history items
3. Click **"Send"**

#### With History:

1. Add history items using **"+ Add history item"**
2. For each item:
   - Select role: `user` or `assistant`
   - Enter the message
3. Enter your current question
4. Click **"Send"**

#### Example:
```
History:
  [user] Hello
  [assistant] Hi! How can I help you?

Message: Where is my order?

Response: I'd be happy to help you track your order...
```

---

## Troubleshooting

### Error: "Session error"

- Check App ID, Auth Key, Auth Secret, Account Key
- Verify user login/password
- Check network connection

### Error: "AI Gateway extension is not enabled" (405)

- Enable AI Gateway in QuickBlox Dashboard
- Wait a few minutes for changes to propagate

### Error: "Smart Chat Assistant ID is required"

- Enter valid Smart Chat Assistant ID from Dashboard

### Error: "The resource wasn't found" (404)

- Check Smart Chat Assistant ID
- For Summarize: verify Dialog ID exists

### CORS Error in Browser Console

- Use local HTTP server instead of file:// protocol
- Check browser extensions that might block requests

---

## Logs

All operations are logged in the **Logs** section at the bottom of the page.

Log format:
```
[HH:MM:SS] Message
```

Click **"Clear"** to clear logs.

---

## Code Reference

### Gateway Request Example
```javascript
var messages = [
    {
        role: 'user',
        content: [
            { type: 'text', text: 'What is in this image?' },
            { type: 'image_url', image_url: { url: 'https://...' } }
        ]
    }
];

QB.ai.gateway(smartChatAssistantId, messages, function(err, res) {
    console.log(res.answer);
});
```

### Summarize Request Example
```javascript
QB.ai.summarize(smartChatAssistantId, dialogId, function(err, res) {
    console.log(res.summary);
});
```

### Translate Request Example
```javascript
QB.ai.translate(smartChatAssistantId, 'Hello', 'es', function(err, res) {
    console.log(res.answer); // "Hola"
});
```

### Answer Assist Request Example
```javascript
var history = [
    { role: 'user', message: 'Hello' },
    { role: 'assistant', message: 'Hi there!' }
];

QB.ai.answerAssist(smartChatAssistantId, 'How are you?', history, function(err, res) {
    console.log(res.answer);
});
```

---

## Support

- [QuickBlox Documentation](https://docs.quickblox.com)
- [AI Gateway API](https://docs.quickblox.com/reference/ai-extensions-ai-gateway)
- [AI Summarize API](https://docs.quickblox.com/reference/ai-extensions-ai-summarize)
- [AI Translate API](https://docs.quickblox.com/reference/ai-extensions-ai-translate)
- [AI Answer Assist API](https://docs.quickblox.com/reference/ai-extensions-ai-answer-assist)
