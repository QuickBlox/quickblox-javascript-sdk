# QuickBlox AI Features Demo (React) - Instructions

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

### 4. System Requirements

- Node.js 18+
- npm 9+

---

## Installation

### Step 1: Navigate to Project

```bash
cd samples/ai-features-demo-react
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- React 19.0.0
- TypeScript 5.7.3
- Webpack 5.82.1
- QuickBlox SDK (from parent directory)

### Step 3: Start Development Server

```bash
npm start
```

Browser will open automatically at http://localhost:3000

---

## Using the Demo

### Step 1: Configuration

The form is pre-filled with test credentials from `src/config.ts`.

| Field | Description | Example |
|-------|-------------|---------|
| App ID | Your application ID | `12345` |
| Auth Key | Application auth key | `DdS7zxMEm5Q7DaS` |
| Auth Secret | Application auth secret | `g88RhdOjnDOqFkv` |
| Account Key | Your account key | `uK_8uinNyz8-npTNB6tx` |
| User Login | Test user login | `testuser` |
| User Password | Test user password | `password123` |
| Smart Chat Assistant ID | AI Assistant ID | `6633a1300fea600001bd6e71` |

Click **"Initialize & Login"** button.

If successful, you will see:
- Green status: "Logged in (User ID: XXXXX)"
- AI Features tabs will appear

To logout, click **"Logout"** button (red).

---

### Step 2: Testing AI Gateway

The **Gateway** tab demonstrates `QB.ai.gateway()` - multimodal AI with text and images.

#### Quick Tests:

| Button | What it does |
|--------|--------------|
| **Text Message** | Sends "Hello, what can you do?" |
| **Image Recognition** | Analyzes image from URL field |
| **Multi-turn** | Math conversation with system prompt |

#### Custom Request:

1. Enter your message in "Custom Message" field
2. (Optional) Enter image URL or click "Upload" to select local file
3. Click **"Send to Gateway"**

#### Image Upload:

1. Click **"Upload"** button
2. Select image file (max 5MB)
3. Image will be converted to base64 and shown in preview
4. Click **"Clear"** to remove uploaded image

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

## Project Architecture

### Components

| Component | Purpose |
|-----------|---------|
| `App.tsx` | Main component, tab management, state lifting |
| `ConfigSection.tsx` | Login/logout form with validation |
| `GatewayTab.tsx` | AI Gateway demo with image upload |
| `SummarizeTab.tsx` | AI Summarize with dialog list |
| `TranslateTab.tsx` | AI Translate with language selector |
| `AnswerAssistTab.tsx` | AI Answer Assist with history management |
| `LogsPanel.tsx` | Log display with clear button |

### Custom Hook

`useQuickBlox.ts` encapsulates all SDK interactions:

```typescript
const {
    isInitialized,    // boolean - login state
    userId,           // number | null - current user
    version,          // string - SDK version
    initAndLogin,     // (config, user) => Promise<number>
    logout,           // () => Promise<void>
    gateway,          // (assistantId, messages) => Promise<{answer}>
    summarize,        // (assistantId, dialogId) => Promise<{summary}>
    translate,        // (assistantId, text, lang) => Promise<{answer}>
    answerAssist,     // (assistantId, message, history) => Promise<{answer}>
    loadDialogs,      // () => Promise<QBDialog[]>
} = useQuickBlox();
```

### TypeScript Types

All types are defined in `src/types/quickblox.ts`:

- `QBConfig` - SDK configuration
- `QBUser` - user credentials
- `AIGatewayMessage` - gateway message format
- `AIHistoryItem` - answer assist history
- `QBDialog` - dialog entity
- `SUPPORTED_LANGUAGES` - translation languages

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

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
```

### TypeScript Errors

```bash
# Check types
npx tsc --noEmit
```

---

## Customization

### Change Default Credentials

Edit `src/config.ts`:

```typescript
export const DEFAULT_CONFIG: QBConfig = {
    appId: YOUR_APP_ID,
    authKey: 'YOUR_AUTH_KEY',
    authSecret: 'YOUR_AUTH_SECRET',
    accountKey: 'YOUR_ACCOUNT_KEY',
};

export const DEFAULT_USER: QBUser = {
    login: 'your_login',
    password: 'your_password',
};

export const DEFAULT_SMART_CHAT_ASSISTANT_ID = 'your_assistant_id';
```

### Add New Language

Edit `src/types/quickblox.ts`:

```typescript
export const SUPPORTED_LANGUAGES: LanguageOption[] = [
    // ... existing languages
    { code: 'hi', name: 'Hindi' },
];
```

---

## Build for Production

```bash
npm run build
```

Output will be in `dist/` folder. Deploy to any static hosting.

---

## Logs

All operations are logged in the **Logs** section at the bottom of the page.

Log format:
```
[HH:MM:SS] Message
```

Click **"Clear"** to clear logs.

---

## Support

- [QuickBlox Documentation](https://docs.quickblox.com)
- [AI Gateway API](https://docs.quickblox.com/reference/ai-extensions-ai-gateway)
- [AI Summarize API](https://docs.quickblox.com/reference/ai-extensions-ai-summarize)
- [AI Translate API](https://docs.quickblox.com/reference/ai-extensions-ai-translate)
- [AI Answer Assist API](https://docs.quickblox.com/reference/ai-extensions-ai-answer-assist)
