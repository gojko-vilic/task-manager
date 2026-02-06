// Task priority levels
export type Priority = 'low' | 'medium' | 'high';

// Task status
export type TaskStatus = 'todo' | 'in-progress' | 'done';

// Label/Tag for tasks
export interface Label {
  id: string;
  name: string;
  color: string;
}

// Individual task
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

// Column within a board
export interface Column {
  id: string;
  title: string;
  taskIds: string[];
  boardId: string;
  order: number;
}

// Board containing columns and tasks
export interface Board {
  id: string;
  title: string;
  description: string;
  columnIds: string[];
  createdAt: string;
  updatedAt: string;
}

// User (for future auth)
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// UI State
export interface UIState {
  sidebarOpen: boolean;
  activeModal: ModalType | null;
  activeTaskId: string | null;
  activeBoardId: string | null;
}

export type ModalType =
  | 'create-task'
  | 'edit-task'
  | 'create-board'
  | 'edit-board'
  | 'delete-confirm';

// Form types
export interface CreateTaskInput {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string | null;
  labels: Label[];
  columnId: string;
  boardId: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: Priority;
  dueDate?: string | null;
  labels?: Label[];
  columnId?: string;
}

export interface CreateBoardInput {
  title: string;
  description: string;
}

export interface CreateColumnInput {
  title: string;
  boardId: string;
}
