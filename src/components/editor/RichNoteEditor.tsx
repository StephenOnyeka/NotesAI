import React, { useEffect } from "react";
import { StyleSheet, useColorScheme, View } from "react-native";
import {
  RichText,
  Toolbar,
  useEditorBridge,
  type EditorBridge,
} from "@10play/tentap-editor";
import { KeyboardStickyView } from "react-native-keyboard-controller";

import { Colors } from "@/constants/theme";

type RichNoteEditorProps = {
  initialContent?: string;
  onContentChange?: (html: string, json: string) => void;
  editorRef?: React.MutableRefObject<EditorBridge | null>;
};

export function RichNoteEditor({
  initialContent = "",
  onContentChange,
  editorRef,
}: RichNoteEditorProps) {
  const scheme = useColorScheme();
  const colors =
    Colors[scheme === "unspecified" ? "light" : (scheme ?? "light")];

  const editor = useEditorBridge({
    autofocus: false,
    avoidIosKeyboard: true,
    initialContent: initialContent || "<p></p>",
    onChange: () => {
      editor.getHTML().then((html) => {
        onContentChange?.(html, "");
      });
    },
    theme: {
      toolbar: {
        toolbarBody: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.backgroundElement,
          borderBottomWidth: 0,
          height: 48,
          minWidth: "100%",
        },
        toolbarButton: {
          backgroundColor: colors.background,
        },
        iconWrapper: {
          backgroundColor: colors.background,
          borderRadius: 6,
        },
        iconWrapperActive: {
          backgroundColor: colors.backgroundSelected,
        },
        iconWrapperDisabled: {
          opacity: 0.5,
        },
        icon: {
          tintColor: colors.text,
        },
        iconActive: {
          tintColor: "#6C63FF",
        },
        iconDisabled: {
          tintColor: colors.textSecondary,
        },
      },
    },
  });

  // Expose the editor bridge via editorRef so parent can call methods like getHTML()
  useEffect(() => {
    if (editorRef) {
      editorRef.current = editor;
    }
  }, [editorRef, editor]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.editorWrapper}>
        <RichText
          editor={editor}
          style={[styles.richText, { backgroundColor: colors.background }]}
        />
      </View>
      <KeyboardStickyView style={[styles.stickyView, { backgroundColor: colors.background }]}>
        <Toolbar editor={editor} hidden={false} />
      </KeyboardStickyView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  editorWrapper: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  richText: {
    flex: 1,
    // fontSize: 20,
  },
  stickyView: {
    width: "100%",
    minHeight: 48,
  },
});
