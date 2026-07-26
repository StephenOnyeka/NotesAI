import {
  Add,
  TickCircle,
  Trash,
  CloseCircle,
  TaskSquare,
} from 'iconsax-react-nativejs';
import { useState } from 'react';
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

import { useTodos } from '@/hooks/useTodos';
import { Colors, Spacing } from '@/constants/theme';
import type { TodoItem } from '@/types';

const PRIORITY_COLORS: Record<NonNullable<TodoItem['priority']>, string> = {
  low: '#4CAF50',
  medium: '#FF9800',
  high: '#F44336',
};

type TodoRowProps = {
  item: TodoItem;
  colors: typeof Colors.light | typeof Colors.dark;
  onToggle: () => void;
  onDelete: () => void;
};

function TodoRow({ item, colors, onToggle, onDelete }: TodoRowProps) {
  const priorityColor = PRIORITY_COLORS[item.priority ?? 'medium'];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.backgroundElement, opacity: pressed ? 0.8 : 1 },
      ]}
      onPress={onToggle}
    >
      {/* Priority dot */}
      <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />

      {/* Checkbox */}
      <TouchableOpacity onPress={onToggle} style={styles.checkbox} hitSlop={8}>
        {item.isCompleted ? (
          <TickCircle size={22} color="#6C63FF" variant="Bold" />
        ) : (
          <CloseCircle size={22} color={colors.textSecondary} variant="Outline" />
        )}
      </TouchableOpacity>

      {/* Title */}
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

      {/* Delete */}
      <TouchableOpacity onPress={onDelete} hitSlop={8}>
        <Trash size={18} color="#FF6B6B" variant="Outline" />
      </TouchableOpacity>
    </Pressable>
  );
}

export default function TodoScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const { todos, addTodo, toggleTodo, deleteTodo, clearCompleted, completedCount, totalCount } =
    useTodos();

  const [inputText, setInputText] = useState('');
  const [priority, setPriority] = useState<TodoItem['priority']>('medium');

  const handleAdd = () => {
    const title = inputText.trim();
    if (!title) return;
    addTodo({ title, priority });
    setInputText('');
  };

  const progress = totalCount > 0 ? completedCount / totalCount : 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
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
              style={[styles.clearBtn, { backgroundColor: colors.backgroundElement }]}
            >
              <Text style={{ color: '#FF6B6B', fontSize: 13, fontWeight: '600' }}>
                Clear done
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Progress bar */}
        {totalCount > 0 && (
          <View style={[styles.progressTrack, { backgroundColor: colors.backgroundElement }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.round(progress * 100)}%` },
              ]}
            />
          </View>
        )}

        {/* Input area */}
        <View style={[styles.inputCard, { backgroundColor: colors.backgroundElement }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Add a new task…"
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
          />

          {/* Priority selector */}
          <View style={styles.priorityRow}>
            {(['low', 'medium', 'high'] as NonNullable<TodoItem['priority']>[]).map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setPriority(p)}
                style={[
                  styles.priorityChip,
                  {
                    backgroundColor:
                      priority === p
                        ? PRIORITY_COLORS[p]
                        : colors.backgroundSelected,
                    borderColor: PRIORITY_COLORS[p],
                  },
                ]}
              >
                <Text
                  style={{
                    color: priority === p ? '#fff' : colors.textSecondary,
                    fontSize: 12,
                    fontWeight: '600',
                    textTransform: 'capitalize',
                  }}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: '#6C63FF' }]}
              onPress={handleAdd}
              activeOpacity={0.85}
            >
              <Add size={20} color="#fff" variant="Outline" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Todo list */}
        {todos.length === 0 ? (
          <View style={styles.empty}>
            <TaskSquare size={45} color={colors.text} variant="Outline" />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No tasks yet. Add one above!
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
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
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#6C63FF',
  },
  inputCard: {
    marginHorizontal: Spacing.four,
    borderRadius: 16,
    padding: Spacing.three,
    marginBottom: Spacing.three,
    gap: Spacing.two,
  },
  input: {
    fontSize: 15,
    paddingVertical: Platform.OS === 'ios' ? 2 : 0,
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    borderWidth: 1,
  },
  addBtn: {
    marginLeft: 'auto',
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 120,
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: Spacing.three,
    gap: 10,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  checkbox: {
    flexShrink: 0,
  },
  rowTitle: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
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
  },
});
