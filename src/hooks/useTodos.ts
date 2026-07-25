import { useCallback, useEffect, useState } from 'react';

import {
  clearCompletedTodos,
  deleteTodo as deleteTodoStorage,
  getTodos,
  saveTodo,
  storage,
  toggleTodo as toggleTodoStorage,
} from '@/services/mmkv';
import type { TodoItem } from '@/types';

function generateId() {
  return `todo_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function useTodos() {
  const [todos, setTodos] = useState<TodoItem[]>(() => getTodos());

  useEffect(() => {
    const listener = storage.addOnValueChangedListener((key:any) => {
      if (key === 'todos') {
        setTodos(getTodos());
      }
    });
    return () => listener.remove();
  }, []);

  const addTodo = useCallback(
    (
      partial: Pick<TodoItem, 'title'> &
        Partial<Pick<TodoItem, 'priority' | 'dueDate'>>,
    ) => {
      const todo: TodoItem = {
        id: generateId(),
        title: partial.title,
        isCompleted: false,
        priority: partial.priority ?? 'medium',
        dueDate: partial.dueDate,
        createdAt: Date.now(),
      };
      saveTodo(todo);
      setTodos(getTodos());
    },
    [],
  );

  const toggleTodo = useCallback((id: string) => {
    toggleTodoStorage(id);
    setTodos(getTodos());
  }, []);

  const deleteTodo = useCallback((id: string) => {
    deleteTodoStorage(id);
    setTodos(getTodos());
  }, []);

  const clearCompleted = useCallback(() => {
    clearCompletedTodos();
    setTodos(getTodos());
  }, []);

  const completedCount = todos.filter((t) => t.isCompleted).length;
  const totalCount = todos.length;

  return {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    clearCompleted,
    completedCount,
    totalCount,
  };
}
