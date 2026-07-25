import { ArrowLeft, TickSquare } from 'iconsax-react-nativejs';
import { useRef, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEditorBridge } from '@10play/tentap-editor';

import { RichNoteEditor } from '@/components/editor/RichNoteEditor';
import { useNotes } from '@/hooks/useNotes';
import { Colors, Spacing } from '@/constants/theme';


export default function NoteModal() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : (scheme ?? 'light')];
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { notes, addNote, updateNote } = useNotes();

  const existing = id ? notes.find((n) => n.id === id) : undefined;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [contentHTML, setContentHTML] = useState(existing?.contentHTML ?? '');
  const [contentJSON, setContentJSON] = useState(existing?.contentJSON ?? '');

  const editorRef = useRef<ReturnType<typeof useEditorBridge> | null>(null);

  const handleContentChange = (html: string, json: string) => {
    setContentHTML(html);
    setContentJSON(json);
  };

  const handleSave = () => {
    if (!title.trim() && !contentHTML.trim()) {
      router.back();
      return;
    }

    if (existing) {
      updateNote({
        ...existing,
        title: title.trim() || 'Untitled',
        contentHTML,
        contentJSON,
      });
    } else {
      addNote({
        title: title.trim() || 'Untitled',
        contentHTML,
        contentJSON,
      });
    }
    router.back();
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Toolbar */}
        <View style={[styles.toolbar, { borderBottomColor: colors.backgroundElement }]}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8} style={styles.toolbarBtn}>
            <ArrowLeft size={22} color={colors.text} variant="Outline" />
          </TouchableOpacity>

          <Text style={[styles.toolbarTitle, { color: colors.textSecondary }]}>
            {existing ? 'Edit Note' : 'New Note'}
          </Text>

          <TouchableOpacity onPress={handleSave} hitSlop={8} style={styles.toolbarBtn}>
            <TickSquare size={22} color="#6C63FF" variant="Bold" />
          </TouchableOpacity>
        </View>

        {/* Title input */}
        <TextInput
          style={[styles.titleInput, { color: colors.text }]}
          placeholder="Title"
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={setTitle}
          returnKeyType="next"
          multiline={false}
        />

        {/* Rich Editor */}
        <View style={styles.editorContainer}>
          <RichNoteEditor
            initialContent={existing?.contentHTML ?? ''}
            onContentChange={handleContentChange}
            editorRef={editorRef}
          />
        </View>
      </SafeAreaView>
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
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  toolbarBtn: {
    padding: 4,
  },
  toolbarTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  titleInput: {
    fontSize: 26,
    fontWeight: '700',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    letterSpacing: -0.3,
  },
  editorContainer: {
    flex: 1,
    minHeight: 400,
    borderColor: 'red',
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    paddingBottom: Platform.OS === 'ios' ? 0 : Spacing.three,
  },
});
