# QuickBlox AI Features Demo - React 19 + TypeScript

Demo application for all QuickBlox JavaScript SDK AI methods using React 19 and TypeScript.

## AI Methods

| Method | Description |
|--------|-------------|
| `QB.ai.gateway()` | Multimodal AI with text and images |
| `QB.ai.summarize()` | Dialog summary generation |
| `QB.ai.translate()` | Text translation to 50+ languages |
| `QB.ai.answerAssist()` | AI assistant with conversation history |

## Tech Stack

- **React** 19.0.0
- **TypeScript** 5.7.3
- **Webpack** 5.82.1
- **QuickBlox JS SDK** (local)

## Requirements

1. QuickBlox account with AI features enabled
2. Smart Chat Assistant ID (created in Dashboard)
3. Test user credentials
4. Node.js 18+ and npm

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

Open http://localhost:3000 in browser.

## Project Structure

```
ai-features-demo-react/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── ConfigSection.tsx    # Login/logout form
│   │   ├── GatewayTab.tsx       # AI Gateway demo
│   │   ├── SummarizeTab.tsx     # AI Summarize demo
│   │   ├── TranslateTab.tsx     # AI Translate demo
│   │   ├── AnswerAssistTab.tsx  # AI Answer Assist demo
│   │   ├── LogsPanel.tsx        # Logs display
│   │   └── index.ts             # Exports
│   ├── hooks/
│   │   └── useQuickBlox.ts      # Custom hook for SDK
│   ├── types/
│   │   └── quickblox.ts         # TypeScript interfaces
│   ├── styles/
│   │   └── App.css              # Styles
│   ├── config.ts                # Default credentials
│   ├── App.tsx                  # Main component
│   └── index.tsx                # Entry point
├── package.json
├── tsconfig.json
├── webpack.config.js
└── README.md
```

## Test Scenarios

### Gateway
- **Text Message** - simple text request
- **Image Recognition** - analyze image by URL or upload
- **Multi-turn** - conversation with developer role (system prompt)
- **Custom** - enter your own message + optional image

### Summarize
- Click "Load My Dialogs" to get dialog list
- Select a dialog or enter Dialog ID manually
- Click "Summarize Dialog" to generate summary

### Translate
- Enter text to translate
- Select target language (ES, FR, DE, RU, UK, JA, ZH, etc.)
- Click "Translate"

### Answer Assist
- Enter your message
- Optionally add conversation history items
- Click "Send" to get AI response

## React Features Used

- **Functional Components** - all components as functions
- **Hooks**: `useState`, `useCallback`, `useRef`
- **Custom Hook** - `useQuickBlox()` encapsulates SDK logic
- **TypeScript** - strict typing for props, state, and SDK types
- **Component Composition** - modular tab-based architecture

## API Reference

- [AI Gateway](https://docs.quickblox.com/reference/ai-extensions-ai-gateway)
- [AI Summarize](https://docs.quickblox.com/reference/ai-extensions-ai-summarize)
- [AI Translate](https://docs.quickblox.com/reference/ai-extensions-ai-translate)
- [AI Answer Assist](https://docs.quickblox.com/reference/ai-extensions-ai-answer-assist)

## Notes

- AI features must be enabled in QuickBlox Dashboard
- Gateway supports images via URL or base64 data URI (upload)
- Summarize works with up to 1000 recent messages
- All methods require valid Smart Chat Assistant ID
- Default credentials are pre-filled for quick testing
