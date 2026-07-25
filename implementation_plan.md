# Notes & To-Do List Mobile App Architecture Plan

This architecture plan outlines the technical design and step-by-step roadmap for building a high-performance React Native (Expo) Notes and To-Do application powered by **`react-native-mmkv`** for fast local storage and **`@10play/tentap-editor`** for rich text editing.

---

## 🏗️ Architectural Overview & Core Stack

1. **Storage Layer (`react-native-mmkv`)**:
   - Instantiated key-value store for ultra-fast, synchronous persistence of notes and to-do items.
   - Centralized `StorageService` for data validation, serialization, and reactive hooks.

2. **Rich Text Editor (`@10play/tentap-editor`)**:
   - Integrated TipTap-powered webview rich text editor tailored for React Native.
   - Toolbar support: Formatting (Bold, Italic, Strikethrough, Underline), Headings (H1, H2, H3), Bullet/Numbered Lists, Code Blocks, and Undo/Redo.

3. **Tab Navigation (`expo-router`)**:
   - **Notes Tab (`index`)**: View all rich notes, search/filter, delete, pin, and launch the editor.
   - **To-Do Tab (`todo`)**: Checklist UI with interactive completion toggles, priority levels, category tagging, and progress tracking.

4. **Design System & Aesthetics**:
   - Modern glassmorphic & subtle dark/light mode card styling using `constants/theme.ts`.
   - Vector icons powered by `iconsax-react-nativejs`.

---

## 🗂️ Data Models

### Note Schema
```ts
export interface Note {
  id: string;
  title: string;
  contentHTML: string;      // HTML string output from 10Tap Editor
  contentJSON?: string;     // Optional JSON string from 10Tap Editor for exact node restore
  createdAt: number;
  updatedAt: number;
  isPinned?: boolean;
  colorTag?: string;
}
```

### To-Do Item Schema
```ts
export interface TodoItem {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate?: number;
  priority?: 'low' | 'medium' | 'high';
  createdAt: number;
}
```

---

## 🛠️ Proposed Changes & Component Breakdown

### 1. Storage & State Layer (`src/services/` & `src/hooks/`)

#### [NEW] [mmkv.ts](file:///c:/Users/hp/Desktop/Notes%20app/NotesAIapp/src/services/mmkv.ts)
- Initialize MMKV instance.
- Provide helper methods: `getNotes()`, `saveNote()`, `deleteNote()`, `getTodos()`, `saveTodo()`, `deleteTodo()`, `toggleTodo()`.

#### [NEW] [useNotes.ts](file:///c:/Users/hp/Desktop/Notes%20app/NotesAIapp/src/hooks/useNotes.ts)
- Custom React hook managing notes state in memory with automatic synchronization to MMKV.
- Exposes: `notes`, `addNote`, `updateNote`, `deleteNote`, `togglePinNote`, `searchNotes`.

#### [NEW] [useTodos.ts](file:///c:/Users/hp/Desktop/Notes%20app/NotesAIapp/src/hooks/useTodos.ts)
- Custom React hook managing to-do items in memory with MMKV sync.
- Exposes: `todos`, `addTodo`, `toggleTodo`, `deleteTodo`, `clearCompleted`.

---

### 2. Rich Text Editor (`src/components/editor/`)

#### [NEW] [RichNoteEditor.tsx](file:///c:/Users/hp/Desktop/Notes%20app/NotesAIapp/src/components/editor/RichNoteEditor.tsx)
- Wrapper around `@10play/tentap-editor` (`useEditorBridge`, `RichText`, `Toolbar`).
- Provides clean keyboard-avoiding container, status feedback, and custom formatting controls.

---

### 3. Navigation & App Screens (`src/app/` & `src/components/`)

#### [MODIFY] [app-tabs.tsx](file:///c:/Users/hp/Desktop/Notes%20app/NotesAIapp/src/components/app-tabs.tsx)
- Configure 2 main tabs using `Iconsax` icons:
  - **Notes Tab**: `NoteText` icon.
  - **To-Do Tab**: `TaskSquare` icon.

#### [MODIFY] [index.tsx](file:///c:/Users/hp/Desktop/Notes%20app/NotesAIapp/src/app/index.tsx)
- Primary **Notes Screen**:
  - Header with Search bar and stats.
  - Grid / List layout of Note Cards (showing title, snippet, last modified time, pin indicator).
  - Floating Action Button (FAB) to open Note Creator/Editor.

#### [NEW] [todo.tsx](file:///c:/Users/hp/Desktop/Notes%20app/NotesAIapp/src/app/todo.tsx)
- Primary **To-Do Screen**:
  - Completion progress header bar (e.g. "4 of 7 completed").
  - Quick inline To-Do input field.
  - Interactive item list with swipe-to-delete or checkmark tap.

#### [NEW] [note-modal.tsx](file:///c:/Users/hp/Desktop/Notes%20app/NotesAIapp/src/app/note-modal.tsx)
- Dedicated Modal route / screen for full-screen Note creation & editing using `RichNoteEditor`.

---

## 🧪 Verification Plan

### Manual Verification
1. **Notes CRUD Verification**:
   - Create a new note with formatted text (H1, bold, list).
   - Verify note saves to MMKV immediately upon typing or closing modal.
   - Re-open app / restart bundle to confirm notes persist across app reloads via MMKV.
   - Edit an existing note and verify updates are reflected on the home grid.
   - Delete a note and ensure it disappears instantly.

2. **To-Do List Verification**:
   - Add new to-do items.
   - Toggle completion status and ensure completion progress bar updates smoothly.
   - Persist state across app restarts.
   - Delete individual items and clear completed items.

3. **Tab Navigation Verification**:
   - Smooth transition between Notes tab and To-Do tab.
   - Iconsax icons render cleanly on both active and inactive states.
