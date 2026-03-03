# QuickBlox AI Features Demo

Demo application for all QuickBlox JavaScript SDK AI methods.

## AI Methods

| Method | Description |
|--------|-------------|
| `QB.ai.gateway()` | Multimodal AI with text and images (NEW) |
| `QB.ai.summarize()` | Dialog summary generation (NEW) |
| `QB.ai.translate()` | Text translation to 50+ languages |
| `QB.ai.answerAssist()` | AI assistant with conversation history |

## Requirements

1. QuickBlox account with AI features enabled
2. Smart Chat Assistant ID (created in Dashboard)
3. Test user credentials

## Quick Start

1. Open `index.html` in a browser
2. Enter your QuickBlox app credentials
3. Click "Initialize & Login"
4. Use tabs to test different AI methods

## Test Scenarios

### Gateway (NEW)
- **Text Message** - simple text request
- **Image Recognition** - analyze image by URL (example from documentation)
- **Multi-turn** - conversation with developer role (system prompt)
- **Custom** - enter your own message + optional image URL

### Summarize (NEW)
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

## Project Structure

```
ai-features-demo/
├── index.html   # UI with tabs for each AI method
├── app.js       # Application logic (~300 lines)
├── style.css    # Styles
└── README.md    # This file
```

## API Reference

- [AI Gateway](https://docs.quickblox.com/reference/ai-extensions-ai-gateway)
- [AI Summarize](https://docs.quickblox.com/reference/ai-extensions-ai-summarize)
- [AI Translate](https://docs.quickblox.com/reference/ai-extensions-ai-translate)
- [AI Answer Assist](https://docs.quickblox.com/reference/ai-extensions-ai-answer-assist)

## Notes

- AI features must be enabled in QuickBlox Dashboard
- Gateway supports images via URL or base64 data URI
- Summarize works with up to 1000 recent messages
- All methods require valid Smart Chat Assistant ID
