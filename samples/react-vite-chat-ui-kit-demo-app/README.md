# QuickBlox React UI Kit Demo App — React + Vite

This sample shows how to initialize QuickBlox JavaScript SDK and render QuickBlox React UI Kit in a React + TypeScript application built with Vite.

The app includes:

- A sign-in screen for an existing QuickBlox user.
- QuickBlox SDK initialization.
- QuickBlox user session creation.
- Chat connection.
- `QuickBloxUIKitProvider` and `QuickBloxUIKitDesktopLayout` rendering after authorization.
- Message reactions with an application-configured emoji picker.

## Tech Stack

- React 19
- TypeScript 5.7
- Vite 6
- QuickBlox JavaScript SDK 2.24.0-beta.1
- QuickBlox React UI Kit 0.5.4-beta.2
- React Router 6
- Sass

## Requirements

1. Node.js 20+ and npm 10+.
2. A QuickBlox account.
3. A QuickBlox application with App Credentials.
4. An existing QuickBlox user with login and password.

## Quick Start

Install dependencies:

```bash
npm install
```

Create a local `.env` file from the example:

```bash
cp .env.example .env
```

Fill in your QuickBlox App Credentials:

```env
VITE_QB_APP_ID=YOUR_APP_ID
VITE_QB_AUTH_KEY=YOUR_AUTH_KEY
VITE_QB_AUTH_SECRET=YOUR_AUTH_SECRET
VITE_QB_ACCOUNT_KEY=YOUR_ACCOUNT_KEY
```

Start the development server:

```bash
npm start
```

Open the app in your browser:

```text
http://localhost:5173
```

Build the production bundle:

```bash
npm run build
```

## Reactions Configuration

The sample enables message reactions through
`QBConfig.appConfig.reactions` in `src/QBConfig.ts`:

```ts
reactions: {
  enable: true,
  mode: ReactionMode.Full,
  picker: {
    placement: 'bottom',
    showSearch: true,
    showClose: false,
    title: 'QuickBlox reactions',
    searchPlaceholder: 'Find an emoji',
  },
},
```

The default emoji contract is provided by `quickblox-react-ui-kit`. This
configuration is consumed by the stock `QuickBloxUIKitDesktopLayout`. After
signing in, open a dialog and use the reaction action on a message. The picker
should open below the trigger, show the custom title and search placeholder,
and omit the close button.

Visual React elements such as a custom `emojiSearchIcon` cannot be stored in
`QBConfig`. Pass them directly to `MessageReactionPicker` when using a custom
message item or layout.

## Project Structure

```text
react-vite-chat-ui-kit-demo-app/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── App.tsx
    ├── QBConfig.ts
    ├── SignIn.tsx
    ├── main.tsx
    ├── styles.scss
    └── vite-env.d.ts
```

## Why the Vite Alias Is Needed

The QuickBlox React UI Kit expects QuickBlox SDK to be available in the browser. In this Vite sample, `quickblox` is aliased to the browser bundle:

```ts
resolve: {
  alias: {
    quickblox: 'quickblox/quickblox.min.js',
  },
}
```

This keeps the browser build simple and avoids bundling SDK source files that reference Node.js or platform-specific dependencies.

The app also assigns the SDK to `window.QB` before importing the React UI Kit application code:

```tsx
window.QB = QB;

void import('./App').then(({ default: App }) => {
  root.render(<App />);
});
```

## Security Note

This sample reads App Credentials from Vite environment variables to keep the demo self-contained. Vite variables with the `VITE_` prefix are exposed to the browser bundle.

For production applications, do not expose your QuickBlox Authorization Secret in frontend code. Create sessions on your backend and pass a short-lived session token to the client.
