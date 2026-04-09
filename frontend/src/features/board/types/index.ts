// Column within a board
export interface Column {
  id: string;
  title: string;
  taskIds: string[];
  updatedAt: string;
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
  columns: Column[]; // Optional, can be populated when fetching a single board
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
}

export type ModalType =
  | 'create-task'
  | 'edit-task'
  | 'create-board'
  | 'edit-board'
  | 'delete-confirm';

// Form types — task-related form types re-exported above from task.types.ts

export interface CreateBoardPayload {
  title: string;
  description: string;
  columnIds?: string[];
}

export interface CreateColumnPaylaod {
  title: string;
  boardId: string;
}
