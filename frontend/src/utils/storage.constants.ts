// Storage keys for Zustand persist middleware
// Centralized to avoid conflicts and make it easy to manage

export const STORAGE_KEYS = {
  BOARDS: 'task-manager-boards',
  COLUMNS: 'task-manager-columns',
  TASKS: 'task-manager-tasks',
} as const;
