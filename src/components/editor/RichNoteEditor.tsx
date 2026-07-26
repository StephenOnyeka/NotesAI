import React, { useRef } from "react";
import { StyleSheet, useColorScheme, View } from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import {
  actions,
  RichEditor,
  RichToolbar,
} from "react-native-pell-rich-editor";

import { Colors } from "@/constants/theme";

type RichNoteEditorProps = {
  initialContent?: string;
  onContentChange?: (html: string, json: string) => void;
  editorRef?: React.MutableRefObject<RichEditor | null>;
};

export function RichNoteEditor({
  initialContent = "",
  onContentChange,
  editorRef,
}: RichNoteEditorProps) {
  const scheme = useColorScheme();
  const colors =
    Colors[scheme === "unspecified" ? "light" : (scheme ?? "light")];

  const richText = useRef<RichEditor>(null);

  React.useEffect(() => {
    if (editorRef) {
      editorRef.current = richText.current;
    }
  }, [editorRef]);

  const handleChange = (html: string) => {
    onContentChange?.(html, "");
  };

  return (
    <View style={styles.container}>
      <RichEditor
        ref={richText}
        initialContentHTML={initialContent}
        onChange={handleChange}
        placeholder="Start writing your notes here..."
        useContainer={false}
        editorStyle={{
          backgroundColor: colors.background,
          color: colors.text,
          placeholderColor: colors.textSecondary,
          contentCSSText: `
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 16px;
            line-height: 1.6;
            padding: 8px 12px;
          `,
        }}
        style={styles.editor}
      />

      <KeyboardStickyView>
        <RichToolbar
          editor={richText}
          actions={[
            actions.keyboard,
            actions.setBold,
            actions.setItalic,
            actions.setUnderline,
            actions.insertBulletsList,
            actions.insertOrderedList,
            actions.checkboxList,
            actions.insertLink,
            actions.undo,
            actions.redo,
          ]}
          iconTint={colors.textSecondary}
          selectedIconTint="#6C63FF"
          disabledIconTint={colors.backgroundElement}
          style={[
            styles.toolbar,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.backgroundElement,
            },
          ]}
        />
      </KeyboardStickyView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  editor: {
    flex: 1,
  },
  toolbar: {
    borderTopWidth: 1,
    height: 50,
  },
});
