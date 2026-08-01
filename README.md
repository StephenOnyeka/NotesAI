# NotesAI 📝✨

An AI-powered Notes & To-Do app built with Expo and React Native. Capture rich-text notes, manage tasks, and let Google Gemini turn a single prompt into a fully formatted note or an actionable checklist — all stored locally for instant, offline-first access.

## Features

- **Rich text notes** — Write with headings, bold/italic/underline/strikethrough, bullet and numbered lists, and code blocks via a TipTap-powered editor (`@10play/tentap-editor`).
- **AI assistant** — Describe what you want in plain language (typed or spoken) and Gemini generates a formatted note or a to-do list, dropping it straight into the app.
- **To-Do management** — Interactive checklist with completion toggles, priorities, due dates, and live progress tracking.
- **Fast local storage** — Ultra-fast, synchronous, offline-first persistence powered by `react-native-mmkv`. Your data stays on your device.
- **Search, pin & organize** — Filter notes instantly, pin important ones, and tag notes with colors.
- **Adaptive design** — Glassmorphic UI with automatic light/dark mode support.
- **Cross-platform** — Runs on iOS, Android, and the web from a single codebase.

## Tech Stack

| Area          | Technology                                        |
| ------------- | ------------------------------------------------- |
| Framework     | [Expo](https://expo.dev) (SDK 57) + React Native  |
| Language      | TypeScript                                        |
| Routing       | `expo-router` (file-based, typed routes)          |
| Storage       | `react-native-mmkv`                               |
| Rich Editor   | `@10play/tentap-editor`                           |
| AI            | Google Gemini (`@google/genai`)                   |
| Icons         | `iconsax-react-nativejs`                          |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (LTS)
- A [Google Gemini API key](https://aistudio.google.com/app/apikey) for AI features
- iOS Simulator / Android Emulator, or a physical device with a [development build](https://docs.expo.dev/develop/development-builds/introduction/)

> **Note:** This app relies on native modules (MMKV, WebView), so it requires a development build — it will not run in the standard Expo Go sandbox.

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy the example file and add your Gemini API key:

   ```bash
   cp .env.example .env
   ```

   ```env
   EXPO_PUBLIC_GEMINI_API_KEY=your_api_key_here
   ```

   You can also set the key from within the app's AI assistant if you prefer not to hardcode it.

3. **Start the development server**

   ```bash
   npx expo start
   ```

   Then open the app on:

   - **Android** — `npm run android`
   - **iOS** — `npm run ios`
   - **Web** — `npm run web`

## Project Structure

```
src/
├── app/                 # Screens & routes (expo-router)
│   ├── (tabs)/          # Notes & To-Do tab screens
│   ├── note-modal.tsx   # Full-screen note editor
│   └── _layout.tsx      # Root layout
├── components/
│   ├── editor/          # RichNoteEditor (10Tap wrapper)
│   ├── ui/              # AI assistant, note cards, pickers, FAB
│   └── ...              # Themed & shared components
├── hooks/               # useNotes, useTodos, theming hooks
├── services/            # mmkv (storage) & gemini (AI) services
├── constants/           # Theme, colors, spacing
└── types/               # Shared TypeScript models (Note, TodoItem)
```
