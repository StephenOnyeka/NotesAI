import React, { useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {
  actions,
  RichEditor,
  RichToolbar,
} from 'react-native-pell-rich-editor';
import { Colors } from '@/constants/theme';

type RichNoteEditorProps = {
  initialContent?: string;
  onContentChange?: (html: string, json: string) => void;
  editorRef?: React.MutableRefObject<RichEditor | null>;
};

export function RichNoteEditor({
  initialContent = '',
  onContentChange,
  editorRef,
}: RichNoteEditorProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : (scheme ?? 'light')];

  const richText = useRef<RichEditor>(null);

  React.useEffect(() => {
    if (editorRef) {
      editorRef.current = richText.current;
    }
  }, [editorRef]);

  const handleChange = (html: string) => {
    onContentChange?.(html, '');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        <RichEditor
          ref={richText}
          initialContentHTML={initialContent}
          onChange={handleChange}
          placeholder="Start writing your main notes here..."
          editorStyle={{
            backgroundColor: colors.background,
            color: colors.text,
            placeholderColor: colors.textSecondary,
            contentCSSText: `
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: 16px;
              line-height: 1.6;
              min-height: 300px;
              padding: 8px 12px;
            `,
          }}
          style={styles.editor}
        />
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardview}
      >
        <RichToolbar
          editor={richText}
          actions={[
            actions.keyboard,
            // actions.insertImage,
            actions.setBold,
            actions.setItalic,
            actions.setUnderline,
            // actions.alignLeft,
            // actions.alignCenter,
            // actions.alignRight,
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
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  editor: {
    flex: 1,
    minHeight: 300,
  },
  keyboardview:{
    flex: 1,
  },
  toolbar: {
    borderTopWidth: 1,
    height: 50,
  },
});
