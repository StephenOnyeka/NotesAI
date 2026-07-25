export interface Note {
  id: string;
  title: string;
  contentHTML: string;
  contentJSON?: string;
  createdAt: number;
  updatedAt: number;
  isPinned?: boolean;
  colorTag?: string;
}

export interface TodoItem {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate?: number;
  priority?: 'low' | 'medium' | 'high';
  createdAt: number;
}
