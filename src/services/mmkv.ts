import { createMMKV } from 'react-native-mmkv';

import type { Note, TodoItem } from '@/types';

export const storage = createMMKV({ id: 'notes-ai-storage' });

const NOTES_KEY = 'notes';
const TODOS_KEY = 'todos';

// ─── Notes ────────────────────────────────────────────────────────────────────

export function getNotes(): Note[] {
  const raw = storage.getString(NOTES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Note[];
  } catch {
    return [];
  }
}

export function saveNote(note: Note): void {
  const notes = getNotes();
  const idx = notes.findIndex((n) => n.id === note.id);
  if (idx >= 0) {
    notes[idx] = note;
  } else {
    notes.unshift(note);
  }
  storage.set(NOTES_KEY, JSON.stringify(notes));
}

export function deleteNote(id: string): void {
  const notes = getNotes().filter((n) => n.id !== id);
  storage.set(NOTES_KEY, JSON.stringify(notes));
}

// ─── Todos ────────────────────────────────────────────────────────────────────

export function getTodos(): TodoItem[] {
  const raw = storage.getString(TODOS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as TodoItem[];
  } catch {
    return [];
  }
}

export function saveTodo(todo: TodoItem): void {
  const todos = getTodos();
  const idx = todos.findIndex((t) => t.id === todo.id);
  if (idx >= 0) {
    todos[idx] = todo;
  } else {
    todos.unshift(todo);
  }
  storage.set(TODOS_KEY, JSON.stringify(todos));
}

export function deleteTodo(id: string): void {
  const todos = getTodos().filter((t) => t.id !== id);
  storage.set(TODOS_KEY, JSON.stringify(todos));
}

export function toggleTodo(id: string): void {
  const todos = getTodos();
  const idx = todos.findIndex((t) => t.id === id);
  if (idx >= 0) {
    todos[idx] = { ...todos[idx], isCompleted: !todos[idx].isCompleted };
    storage.set(TODOS_KEY, JSON.stringify(todos));
  }
}

export function clearCompletedTodos(): void {
  const todos = getTodos().filter((t) => !t.isCompleted);
  storage.set(TODOS_KEY, JSON.stringify(todos));
}
