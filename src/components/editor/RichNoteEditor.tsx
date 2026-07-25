import {
  CoreBridge,
  PlaceholderBridge,
  RichText,
  TenTapStartKit,
  Toolbar,
  useEditorBridge,
} from '@10play/tentap-editor';
import { useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';

type RichNoteEditorProps = {
  initialContent?: string;
  onContentChange?: (html: string, json: string) => void;
  editorRef?: React.MutableRefObject<ReturnType<typeof useEditorBridge> | null>;
};

export function RichNoteEditor({
  initialContent = '',
  onContentChange,
  editorRef,
}: RichNoteEditorProps) {
  const editor = useEditorBridge({
    autofocus: true,
    avoidIosKeyboard: true,
    initialContent,
    bridgeExtensions: [
      ...TenTapStartKit,
      PlaceholderBridge.configureExtension({
        placeholder: 'Start writing your main notes here...',
      }),
      CoreBridge.configureExtension({
        CSSSrc: `
          * { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
          body { font-size: 16px; line-height: 1.6; padding: 0 4px; color: inherit; }
          .ProseMirror p.is-editor-empty:first-child::before {
            color: #999;
            content: attr(data-placeholder);
            float: left;
            height: 0;
            pointer-events: none;
          }
          h1 { font-size: 28px; font-weight: 700; margin: 16px 0 8px; }
          h2 { font-size: 22px; font-weight: 600; margin: 14px 0 6px; }
          h3 { font-size: 18px; font-weight: 600; margin: 12px 0 4px; }
          p  { margin: 4px 0; }
          ul, ol { padding-left: 20px; }
          code { background: rgba(128,128,128,0.15); border-radius: 4px; padding: 1px 5px; font-family: monospace; font-size: 14px; }
          pre  { background: rgba(128,128,128,0.1); border-radius: 8px; padding: 12px; overflow: auto; }
        `,
      }),
    ],
  });

  useEffect(() => {
    if (editorRef) {
      editorRef.current = editor;
    }
  }, [editor, editorRef]);

  // Listen to content changes
  useEffect(() => {
    if (!onContentChange) return;
    const unsubscribe = editor._subscribeToEditorStateUpdate(async () => {
      const html = await editor.getHTML();
      const json = await editor.getJSON();
      onContentChange(html, JSON.stringify(json));
    });
    return () => unsubscribe();
  }, [editor, onContentChange]);

  return (
    <View style={styles.container}>
      <RichText editor={editor} style={styles.editor} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        <Toolbar editor={editor} />
      </KeyboardAvoidingView>
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
  keyboardAvoid: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
  },
});
