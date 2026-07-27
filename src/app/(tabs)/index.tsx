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
import NoteCard from '@/components/ui/noteCard';
import { CustomDateTimePicker } from '@/components/ui/CustomDateTimePicker';

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
        <CustomDateTimePicker/>
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
    fontWeight: '600',
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
