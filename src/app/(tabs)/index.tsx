import { Add, SearchNormal1, Trash, Paperclip2, NoteText } from 'iconsax-react-nativejs';
import { useState, useMemo, useRef } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useNotes } from '@/hooks/useNotes';
import { Colors, Spacing } from '@/constants/theme';
import type { Note } from '@/types';

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').slice(0, 100);
}

type NoteCardProps = {
  note: Note;
  colors: typeof Colors.light | typeof Colors.dark;
  onPress: () => void;
  onDelete: () => void;
  onPin: () => void;
};

function NoteCard({ note, colors, onPress, onDelete, onPin }: NoteCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.backgroundElement, opacity: pressed ? 0.82 : 1 },
      ]}
      onPress={onPress}
    >
      {note.isPinned && (
        <Paperclip2 size={13} color={colors.textSecondary} variant="Bold" style={styles.pinBadge} />
      )}
      <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
        {note.title || 'Untitled'}
      </Text>
      <Text style={[styles.cardSnippet, { color: colors.textSecondary }]} numberOfLines={2}>
        {stripHtml(note.contentHTML) || 'No content'}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={[styles.cardTime, { color: colors.textSecondary }]}>
          {timeAgo(note.updatedAt)}
        </Text>
        <View style={styles.cardActions}>
          <TouchableOpacity onPress={onPin} style={styles.actionBtn} hitSlop={8}>
            <Paperclip2 size={16} color={note.isPinned ? '#6C63FF' : colors.textSecondary} variant={note.isPinned ? 'Bold' : 'Outline'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.actionBtn} hitSlop={8}>
            <Trash size={16} color="#FF6B6B" variant="Outline" />
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
}

export default function NotesScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : (scheme ?? 'light')];
  const router = useRouter();
  const { notes, deleteNote, togglePinNote, searchNotes } = useNotes();
  const [query, setQuery] = useState('');

  const displayed = useMemo(
    () => (query ? searchNotes(query) : notes),
    [query, notes, searchNotes],
  );

  const handleOpenNote = (note: Note) => {
    router.push({ pathname: '/note-modal', params: { id: note.id } });
  };

  const lastPressRef = useRef(0);
  const handleNewNote = () => {
    const now = Date.now();
    // Use a longer timeout (1500ms) because dev builds can be slow to navigate
    if (now - lastPressRef.current < 1000) return;
    lastPressRef.current = now;
    router.push({ pathname: '/note-modal' });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* <SafeAreaView style={styles.safeArea} edges={['top']}> */}
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.heading, { color: colors.text }]}>Notes</Text>
            <Text style={[styles.subheading, { color: colors.textSecondary }]}>
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </Text>
          </View>
        </View>

        {/* Search */}
        <View style={[styles.searchRow, { backgroundColor: colors.backgroundElement }]}>
          <SearchNormal1 size={18} color={colors.textSecondary} variant="Outline" />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search notes…"
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {/* Note list */}
        {displayed.length === 0 ? (
          <View style={styles.empty}>
            <View>
              <NoteText size={45} color={colors.text} variant="Outline" />
            </View>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {query ? 'No notes match your search.' : 'Tap + to create your first note.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={displayed}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.list}
            columnWrapperStyle={styles.columnWrapper}
            renderItem={({ item }) => (
              <NoteCard
                note={item}
                colors={colors}
                onPress={() => handleOpenNote(item)}
                onDelete={() => deleteNote(item.id)}
                onPin={() => togglePinNote(item.id)}
              />
            )}
          />
        )}
      </SafeAreaView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: '#6C63FF' }]}
        onPress={handleNewNote}
        activeOpacity={0.85}
      >
        <Add size={28} color="#fff" variant="Outline" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: 14,
    marginTop: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 4,
  },
  list: {
    paddingHorizontal: Spacing.three,
    paddingBottom: 120,
  },
  columnWrapper: {
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    padding: Spacing.three,
    minHeight: 130,
    position: 'relative',
  },
  pinBadge: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    marginRight: 18,
  },
  cardSnippet: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  cardTime: {
    fontSize: 11,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 2,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    maxWidth: 240,
  },
  fab: {
    position: 'absolute',
    right: Spacing.four,
    // bottom: Platform.OS === 'ios' ? 100 : 90,
    bottom: Platform.OS === 'ios' ? 50 : 50,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
});
