import { useCallback, useEffect, useState } from "react";

import { stripHtmlAndDecode } from "@/components/utils/text";
import {
  deleteNote as deleteNoteStorage,
  getNotes,
  saveNote,
  storage,
} from "@/services/mmkv";
import type { Note } from "@/types";

function generateId() {
  return `note_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(() => getNotes());

  // Sync from storage when the MMKV key changes (e.g. from another screen)
  useEffect(() => {
    const listener = storage.addOnValueChangedListener((key) => {
      if (key === "notes") {
        setNotes(getNotes());
      }
    });
    return () => listener.remove();
  }, []);

  const addNote = useCallback(
    (
      partial: Pick<Note, "title" | "contentHTML" | "contentJSON" | "colorTag">,
    ): Note => {
      const note: Note = {
        id: generateId(),
        title: partial.title || "Untitled",
        contentHTML: partial.contentHTML,
        contentJSON: partial.contentJSON,
        colorTag: partial.colorTag,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isPinned: false,
      };
      saveNote(note);
      setNotes(getNotes());
      return note;
    },
    [],
  );

  const updateNote = useCallback((updated: Note) => {
    const note = { ...updated, updatedAt: Date.now() };
    saveNote(note);
    setNotes(getNotes());
  }, []);

  const deleteNote = useCallback((id: string) => {
    deleteNoteStorage(id);
    setNotes(getNotes());
  }, []);

  const togglePinNote = useCallback((id: string) => {
    const current = getNotes();
    const note = current.find((n) => n.id === id);
    if (!note) return;
    saveNote({ ...note, isPinned: !note.isPinned, updatedAt: Date.now() });
    setNotes(getNotes());
  }, []);

  const searchNotes = useCallback(
    (query: string): Note[] => {
      if (!query.trim()) return notes;
      const q = query.toLowerCase();
      return notes.filter((n) => {
        const plainContent = stripHtmlAndDecode(n.contentHTML).toLowerCase();
        return n.title.toLowerCase().includes(q) || plainContent.includes(q);
      });
    },
    [notes],
  );

  // Sorted: pinned first, then by updatedAt desc
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.updatedAt - a.updatedAt;
  });

  return {
    notes: sortedNotes,
    addNote,
    updateNote,
    deleteNote,
    togglePinNote,
    searchNotes,
  };
}
