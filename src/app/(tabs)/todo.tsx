import {
  Add,
  Clock,
  CloseCircle,
  CloseSquare,
  Notification,
  TaskSquare,
  TickCircle,
  Trash,
} from "iconsax-react-nativejs";
import { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, Spacing } from "@/constants/theme";
import { useTodos } from "@/hooks/useTodos";
import type { TodoItem } from "@/types";
import CustomDateTimePicker from "@/components/ui/CustomDateTimePicker";

function formatReminder(timestamp?: number): string | null {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow =
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear();

  const timeStr = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isToday) return `Today, ${timeStr}`;
  if (isTomorrow) return `Tomorrow, ${timeStr}`;
  return `${date.toLocaleDateString([], { month: "short", day: "numeric" })}, ${timeStr}`;
}

function getPresetDueDate(preset: "today" | "tomorrow"): number {
  const now = new Date();
  if (preset === "today") {
    const todayEvening = new Date();
    if (now.getHours() >= 18) {
      todayEvening.setHours(now.getHours() + 2, 0, 0, 0);
    } else {
      todayEvening.setHours(18, 0, 0, 0);
    }
    return todayEvening.getTime();
  }
  // tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  return tomorrow.getTime();
}

type TodoRowProps = {
  item: TodoItem;
  colors: typeof Colors.light | typeof Colors.dark;
  onToggle: () => void;
  onDelete: () => void;
};

function TodoRow({ item, colors, onToggle, onDelete }: TodoRowProps) {
  const reminderText = formatReminder(item.dueDate);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: colors.backgroundElement,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
      onPress={onToggle}
    >
      {/* Checkbox */}
      <TouchableOpacity onPress={onToggle} style={styles.checkbox} hitSlop={8}>
        {item.isCompleted ? (
          <TickCircle size={22} color="#6C63FF" variant="Bold" />
        ) : (
          <TickCircle
            size={22}
            color={colors.textSecondary}
            // variant="Outline"
            variant="TwoTone"
          />
        )}
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.rowContent}>
        <Text
          style={[
            styles.rowTitle,
            { color: item.isCompleted ? colors.textSecondary : colors.text },
            item.isCompleted && styles.strikethrough,
          ]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        {reminderText ? (
          <View style={styles.reminderBadge}>
            <Clock size={12} color={colors.textSecondary} variant="Outline" />
            <Text
              style={[
                styles.reminderBadgeText,
                { color: colors.textSecondary },
              ]}
            >
              {reminderText}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Delete */}
      <TouchableOpacity onPress={onDelete} hitSlop={8}>
        <Trash size={18} color="#FF6B6B" variant="Outline" />
      </TouchableOpacity>
    </Pressable>
  );
}

export default function TodoScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  const {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    clearCompleted,
    completedCount,
    totalCount,
  } = useTodos();

  const [modalVisible, setModalVisible] = useState(false);
  const [inputText, setInputText] = useState("");
  const [reminderType, setReminderType] = useState<
    "none" | "today" | "tomorrow" | "custom"
  >("none");
  const [dueDate, setDueDate] = useState<number | undefined>(undefined);
  const [customPickerVisible, setCustomPickerVisible] = useState(false);

  const handleSelectPreset = (preset: "today" | "tomorrow") => {
    if (reminderType === preset) {
      setReminderType("none");
      setDueDate(undefined);
    } else {
      setReminderType(preset);
      setDueDate(getPresetDueDate(preset));
    }
  };

  const handleCustomConfirm = (date: Date) => {
    setReminderType("custom");
    setDueDate(date.getTime());
    setCustomPickerVisible(false);
  };

  const handleAdd = () => {
    const title = inputText.trim();
    if (!title) return;
    addTodo({ title, dueDate });
    setInputText("");
    setReminderType("none");
    setDueDate(undefined);
    setModalVisible(false);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setInputText("");
    setReminderType("none");
    setDueDate(undefined);
    setCustomPickerVisible(false);
  };

  const progress = totalCount > 0 ? completedCount / totalCount : 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.heading, { color: colors.text }]}>To-Do</Text>
            <Text style={[styles.subheading, { color: colors.textSecondary }]}>
              {completedCount} of {totalCount} completed
            </Text>
          </View>
          {completedCount > 0 && (
            <TouchableOpacity
              onPress={clearCompleted}
              style={[
                styles.clearBtn,
                { backgroundColor: colors.backgroundElement },
              ]}
            >
              <Text
                style={{ color: "#FF6B6B", fontSize: 13, fontWeight: "600" }}
              >
                Clear done
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Progress bar */}
        {totalCount > 0 && (
          <View
            style={[
              styles.progressTrack,
              { backgroundColor: colors.backgroundElement },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                { width: `${Math.round(progress * 100)}%` },
              ]}
            />
          </View>
        )}

        {/* Todo list */}
        {todos.length === 0 ? (
          <View style={styles.empty}>
            <TaskSquare size={45} color={colors.text} variant="Outline" />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No tasks yet. Tap + to add one!
            </Text>
          </View>
        ) : (
          <FlatList
            data={todos}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <TodoRow
                item={item}
                colors={colors}
                onToggle={() => toggleTodo(item.id)}
                onDelete={() => deleteTodo(item.id)}
              />
            )}
          />
        )}

        {/* FAB */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: "#6C63FF" }]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
        >
          <Add size={28} color="#fff" variant="Outline" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Add To-Do Bottom Sheet Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <Pressable style={styles.modalBackdrop} onPress={handleCloseModal} />
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: colors.backgroundElement },
            ]}
          >
            <View
              style={[
                styles.sheetHandle,
                { backgroundColor: colors.textSecondary + "40" },
              ]}
            />

            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                New Task
              </Text>
              <TouchableOpacity onPress={handleCloseModal} hitSlop={8}>
                <CloseSquare
                  size={24}
                  color={colors.textSecondary}
                  variant="Bold"
                />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[
                styles.modalInput,
                { color: colors.text, backgroundColor: colors.background },
              ]}
              placeholder="What needs to be done?"
              placeholderTextColor={colors.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              autoFocus
              multiline
            />

            {/* Reminder Section */}
            <View style={styles.reminderSection}>
              <View style={styles.reminderHeader}>
                <Notification
                  size={16}
                  color={colors.textSecondary}
                  variant="Outline"
                />
                <Text
                  style={[
                    styles.reminderTitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  Set Reminder
                </Text>
              </View>

              <View style={styles.presetRow}>
                <TouchableOpacity
                  onPress={() => {
                    setReminderType("none");
                    setDueDate(undefined);
                  }}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor:
                        reminderType === "none"
                          ? "#6C63FF20"
                          : colors.background,
                      borderColor:
                        reminderType === "none" ? "#6C63FF" : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={{
                      color:
                        reminderType === "none"
                          ? "#6C63FF"
                          : colors.textSecondary,
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    None
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleSelectPreset("today")}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor:
                        reminderType === "today"
                          ? "#6C63FF20"
                          : colors.background,
                      borderColor:
                        reminderType === "today" ? "#6C63FF" : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={{
                      color:
                        reminderType === "today"
                          ? "#6C63FF"
                          : colors.textSecondary,
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    Later Today
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleSelectPreset("tomorrow")}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor:
                        reminderType === "tomorrow"
                          ? "#6C63FF20"
                          : colors.background,
                      borderColor:
                        reminderType === "tomorrow" ? "#6C63FF" : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={{
                      color:
                        reminderType === "tomorrow"
                          ? "#6C63FF"
                          : colors.textSecondary,
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    Tomorrow
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setCustomPickerVisible(true)}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor:
                        reminderType === "custom"
                          ? "#6C63FF20"
                          : colors.background,
                      borderColor:
                        reminderType === "custom" ? "#6C63FF" : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={{
                      color:
                        reminderType === "custom"
                          ? "#6C63FF"
                          : colors.textSecondary,
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    Custom
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Custom date picker — controlled externally */}
              <CustomDateTimePicker
                visible={customPickerVisible}
                initialDate={dueDate ? new Date(dueDate) : undefined}
                onClose={() => setCustomPickerVisible(false)}
                onConfirm={handleCustomConfirm}
              />

              {dueDate ? (
                <Text style={[styles.reminderDetailText, { color: "#6C63FF" }]}>
                  🔔 Reminder set for {formatReminder(dueDate)}
                </Text>
              ) : null}
            </View>

            {/* Add Task Button */}
            <TouchableOpacity
              style={[
                styles.saveTaskBtn,
                {
                  backgroundColor: inputText.trim()
                    ? "#6C63FF"
                    : colors.textSecondary + "30",
                },
              ]}
              disabled={!inputText.trim()}
              onPress={handleAdd}
              activeOpacity={0.85}
            >
              <Text style={styles.saveTaskBtnText}>Add Task</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  heading: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: 14,
    marginTop: 2,
  },
  clearBtn: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    borderRadius: 10,
  },
  progressTrack: {
    height: 6,
    marginHorizontal: Spacing.four,
    borderRadius: 3,
    marginBottom: Spacing.three,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#6C63FF",
  },
  list: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 120,
    gap: Spacing.two,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: Spacing.three,
    gap: 10,
  },
  checkbox: {
    flexShrink: 0,
  },
  rowContent: {
    flex: 1,
    gap: 3,
  },
  rowTitle: {
    fontSize: 15,
    lineHeight: 20,
  },
  strikethrough: {
    textDecorationLine: "line-through",
  },
  reminderBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  reminderBadgeText: {
    fontSize: 11,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: Spacing.four,
    bottom: Platform.OS === "ios" ? 50 : 50,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Platform.OS === "ios" ? 40 : Spacing.four,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  modalInput: {
    borderRadius: 14,
    padding: Spacing.three,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: "top",
  },
  reminderSection: {
    gap: Spacing.two,
  },
  reminderHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  reminderTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  presetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  reminderDetailText: {
    fontSize: 12,
    fontWeight: "500",
  },
  saveTaskBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  saveTaskBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
