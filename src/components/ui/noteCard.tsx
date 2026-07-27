import timeAgo from "@/components/utils/timeAgo";
import { stripHtmlAndDecode } from "@/components/utils/text";
import { Colors, Spacing } from "@/constants/theme";
import type { Note } from "@/types";
import { Paperclip2, Trash } from "iconsax-react-nativejs";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type NoteCardProps = {
  note: Note;
  colors: typeof Colors.light | typeof Colors.dark;
  onPress: () => void;
  onDelete: () => void;
  onPin: () => void;
};

export default function NoteCard({
  note,
  colors,
  onPress,
  onDelete,
  onPin,
}: NoteCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.backgroundElement,
          opacity: pressed ? 0.82 : 1,
        },
      ]}
      onPress={onPress}
    >
      {note.isPinned && (
        <Paperclip2
          size={13}
          color={colors.textSecondary}
          variant="Bold"
          style={styles.pinBadge}
        />
      )}
      <Text
        style={[styles.cardTitle, { color: colors.text }]}
        numberOfLines={1}
      >
        {note.title || "Untitled"}
      </Text>
      <Text
        style={[styles.cardSnippet, { color: colors.textSecondary }]}
        numberOfLines={2}
      >
        {stripHtmlAndDecode(note.contentHTML) || "No content"}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={[styles.cardTime, { color: colors.textSecondary }]}>
          {timeAgo(note.updatedAt)}
        </Text>
        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={onPin}
            style={styles.actionBtn}
            hitSlop={8}
          >
            <Paperclip2
              size={16}
              color={note.isPinned ? "#6C63FF" : colors.textSecondary}
              variant={note.isPinned ? "Bold" : "Outline"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDelete}
            style={styles.actionBtn}
            hitSlop={8}
          >
            <Trash size={16} color="#FF6B6B" variant="Outline" />
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    padding: Spacing.three,
    minHeight: 130,
    position: "relative",
  },
  pinBadge: {
    position: "absolute",
    top: Spacing.two,
    right: Spacing.two,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
    marginRight: 18,
  },
  cardSnippet: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.two,
  },
  cardTime: {
    fontSize: 11,
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    padding: 2,
  },
});
