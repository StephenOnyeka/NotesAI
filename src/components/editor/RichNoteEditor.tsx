import {
  RichText,
  Toolbar,
  useEditorBridge,
  TenTapStartKit,
  BridgeExtension,
  type EditorBridge,
} from "@10play/tentap-editor";
import React, { useEffect, useMemo } from "react";
import { StyleSheet, useColorScheme, View } from "react-native";
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

  const themeExtension = useMemo(
    () =>
      new BridgeExtension({
        forceName: "app-editor-theme",
        extendCSS: `
          .ProseMirror {
            color: ${colors.text};
            font-size: 16px;
            line-height: 1.5;
          }
          .ProseMirror p.is-editor-empty:first-child::before {
            color: ${colors.textSecondary};
          }
        `,
      }),
    [colors.text, colors.textSecondary],
  );

  const editor = useEditorBridge({
    autofocus: false,
    avoidIosKeyboard: true,
    initialContent: initialContent || "<p></p>",
    bridgeExtensions: [...TenTapStartKit, themeExtension],
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

  // Reactively update editor text color when light/dark mode changes at runtime.
  // BridgeExtension handles the initial load (zero flash), this handles live theme switches.
  useEffect(() => {
    const css = `
      .ProseMirror {
        color: ${colors.text};
        font-size: 16px;
        line-height: 1.5;
      }
      .ProseMirror p.is-editor-empty:first-child::before {
        color: ${colors.textSecondary};
      }
    `;

    const inject = () =>
      editor.injectCSS(css, "app-editor-theme");

    if (editor.getEditorState().isReady) {
      // Editor is already loaded — update immediately
      inject();
    } else {
      // Editor isn't ready yet — subscribe and inject once it is
      const unsubscribe = editor._subscribeToEditorStateUpdate(() => {
        if (editor.getEditorState().isReady) {
          inject();
          unsubscribe();
        }
      });
      return unsubscribe;
    }
  }, [editor, colors.text, colors.textSecondary]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.editorWrapper}>
        <RichText
          editor={editor}
          style={[styles.richText, { backgroundColor: colors.background }]}
        />
      </View>
      <KeyboardStickyView
        style={[styles.stickyView, { backgroundColor: colors.background }]}
      >
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
  },
  richText: {
    flex: 1,
  },
  stickyView: {
    width: "100%",
    minHeight: 48,
  },
});
