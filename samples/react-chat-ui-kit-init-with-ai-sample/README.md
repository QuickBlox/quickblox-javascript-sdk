# React Chat UI Kit AI and reactions sample

This Webpack sample shows how to initialize QuickBlox React UI Kit and
customize message reactions from application code.

It uses a forked desktop layout (`MyUIKitDesktopLayout`) and a local
`MyMessageItem` so the reaction picker can take React-only props that the
stock `MessageItem` does not expose.

## Requirements

- Node.js 20 or newer
- `quickblox@2.24.0-beta.1`
- `quickblox-react-ui-kit@0.5.4-beta.2`
- A QuickBlox application and an existing user

Set the application credentials in `src/QBconfig.ts` and the sample user login
and password in `src/App.tsx`. Do not commit real credentials.

## Install and run

```bash
npm install
npm start
```

The application opens at `http://localhost:3059`.

Build the production bundle with:

```bash
npm run build
```

## Two layers of reaction customization

### 1. Serializable options in `QBConfig`

`src/QBconfig.ts` configures `QBConfig.appConfig.reactions`:

```typescript
reactions: {
    enable: true,
    mode: ReactionMode.Full,
    quickReactions: ['👍', '❤️', '😂', '😮', '😢', '🔥'],
    picker: {
        placement: 'bottom',
        showSearch: true,
        showClose: true,
        title: 'Choose a reaction',
        searchPlaceholder: 'Search emoji',
    },
},
```

`MyUIKitDesktopLayout` reads `reactionMode`, `reactionPickerData`, and
`reactionPickerOptions` from `useQuickBloxUIKit` and passes them to
`MyMessageItem`.

What these options do:

- `placement` — where the expanded selector opens (`top`, `bottom`, `auto`)
- `showSearch` — show or hide the search field
- `showClose` — show or hide the default close (`×`) control
- `title` / `searchPlaceholder` — selector copy
- `quickReactions` — glyphs in the quick row

The default emoji contract is provided by `quickblox-react-ui-kit`.
`showClose` only toggles the built-in close button. The public API does not
accept a custom close icon.

### 2. React-only props on `MessageReactionPicker`

`emojiSearchIcon` is a React element, so it cannot live in `QBConfig`.
`src/MyMessageItem.tsx` passes it directly:

```tsx
<MessageReactionPicker
    message={message}
    reactionMode={reactionMode}
    reactionPickerData={reactionPickerData}
    onToggleReaction={onToggleReaction}
    emojiPickerPlacement={reactionPickerOptions?.placement}
    showEmojiSearch={reactionPickerOptions?.showSearch}
    showEmojiSelectorClose={reactionPickerOptions?.showClose}
    emojiSelectorTitle={reactionPickerOptions?.title}
    emojiSearchPlaceholder={reactionPickerOptions?.searchPlaceholder}
    emojiSearchIcon={<CustomEmojiSearchIcon />}
/>
```

The custom item also renders two pickers, matching the stock pattern: an
action picker (toggle + quick row + full selector) and an inline chip row
under the bubble.

`src/MyMessageItem.css` applies a modest teal tint to the reaction toggle,
active chips, context-menu icon, selector title, close icon, and search
icon. Layout and kit defaults are otherwise unchanged.

## What this sample does not demonstrate

The chip overflow control (`›`) calls `onOpenReactionsList`. The kit's
reactions-list modal is not part of the public API, and this sample does not
copy or deep-import it. The list callback is wired; a custom list UI is out
of scope.

Message-level AI widgets (translate / assist) are not rendered on
`MyMessageItem`.

## Manual check

After signing in, open a dialog:

1. Incoming and outgoing messages show reaction actions and context menus.
2. The picker opens below the trigger, with the custom title, search field,
   custom search icon, and the default close button. Toggle, chips, and
   selector accents use a slightly cooler teal than the stock blue.
3. Quick reactions add and remove a reaction; chips and counts update.
4. Reply, Forward, Copy, Edit, and Delete still work on supported messages.
