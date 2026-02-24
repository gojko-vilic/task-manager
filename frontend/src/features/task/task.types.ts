// Task domain types — canonical source for task-related types

export type Priority = 'low' | 'medium' | 'high';

export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string | null;
  labels: Label[];
  columnId: string;
  boardId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTask {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string | null;
  labels: Label[];
  columnId: string;
  boardId: string;
}

export interface UpdateTask {
  title?: string;
  description?: string;
  priority?: Priority;
  dueDate?: string | null;
  labels?: Label[];
  columnId?: string;
}
