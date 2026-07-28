"use no memo";
import type { EditorBridge } from "@10play/tentap-editor";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, TickCircle } from "iconsax-react-nativejs";
import { useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { stripHtmlAndDecode } from "@/components/utils/text";
import { RichNoteEditor } from "@/components/editor/RichNoteEditor";
import { Colors, Spacing } from "@/constants/theme";
import { useNotes } from "@/hooks/useNotes";

export default function NoteModal() {
  const scheme = useColorScheme();
  const colors =
    Colors[scheme === "unspecified" ? "light" : (scheme ?? "light")];
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { notes, addNote, updateNote } = useNotes();

  const existing = id ? notes.find((n) => n.id === id) : undefined;

  const [title, setTitle] = useState(existing?.title ?? "");
  const [contentHTML, setContentHTML] = useState(existing?.contentHTML ?? "");
  const [contentJSON, setContentJSON] = useState(existing?.contentJSON ?? "");

  const editorRef = useRef<EditorBridge | null>(null);

  const handleContentChange = (html: string, json: string) => {
    setContentHTML(html);
    setContentJSON(json);
  };

  const handleSave = async () => {
    let finalHTML = contentHTML;
    if (editorRef.current) {
      try {
        const html = await editorRef.current.getHTML();
        if (typeof html === "string" && html.length > 0) {
          finalHTML = html;
        }
      } catch (e) {
        // Fall back to contentHTML state if bridge is unavailable
      }
    }

    const plainText = stripHtmlAndDecode(finalHTML).trim();
    if (!title.trim() && !plainText) {
      router.back();
      return;
    }

    if (existing) {
      updateNote({
        ...existing,
        title: title.trim() || "Untitled",
        contentHTML: finalHTML,
        contentJSON,
      });
    } else {
      addNote({
        title: title.trim() || "Untitled",
        contentHTML: finalHTML,
        contentJSON,
      });
    }
    router.back();
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Header Toolbar */}
        <View
          style={[
            styles.toolbar,
            { borderBottomColor: colors.backgroundElement },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={8}
            style={styles.toolbarBtn}
          >
            <ArrowLeft size={22} color={colors.text} variant="Outline" />
          </TouchableOpacity>

          <Text style={[styles.toolbarTitle, { color: colors.textSecondary }]}>
            {existing ? "Edit Note" : "New Note"}
          </Text>

          <TouchableOpacity
            onPress={handleSave}
            hitSlop={8}
            style={styles.toolbarBtn}
          >
            <TickCircle size={25} color={colors.text} variant="Linear" />
          </TouchableOpacity>
        </View>

        {/* Title Input */}
        <TextInput
          style={[styles.titleInput, { color: colors.text }]}
          placeholder="Title"
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={setTitle}
          returnKeyType="next"
          multiline={false}
        />

        {/* Rich Note Editor */}
        <RichNoteEditor
          initialContent={existing?.contentHTML ?? ""}
          onContentChange={handleContentChange}
          editorRef={editorRef}
        />
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  toolbarBtn: {
    padding: 4,
  },
  toolbarTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  titleInput: {
    fontSize: 26,
    fontWeight: "600",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    letterSpacing: -0.3,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: { backgroundColor: "#2A2A2A", borderRadius: 16, padding: Spacing.two },
});
