import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

import { STORAGE_KEYS } from '@/utils';
import type { Task, CreateTaskInput, UpdateTaskInput, Priority } from './task.types';

interface TaskFilters {
  search: string;
  priority: Priority | 'all';
  hasLabels: boolean;
}

const DEFAULT_FILTERS: TaskFilters = {
  search: '',
  priority: 'all',
  hasLabels: false,
};

interface TaskStore {
  // State
  tasks: Task[];
  filters: TaskFilters;

  // Actions
  addTask: (input: CreateTaskInput) => Task;
  updateTask: (id: string, updates: UpdateTaskInput) => void;
  deleteTask: (id: string) => void;
  deleteTasksByBoardId: (boardId: string) => void;
  deleteTasksByColumnId: (columnId: string) => void;
  moveTaskToColumn: (taskId: string, newColumnId: string) => void;
  setFilters: (filters: Partial<TaskFilters>) => void;
  resetFilters: () => void;

  // Getters
  getTaskById: (id: string) => Task | undefined;
  getTasksByColumnId: (columnId: string) => Task[];
  getTasksByBoardId: (boardId: string) => Task[];
  getFilteredTasks: (columnId: string) => Task[];
  getTaskCount: (columnId?: string) => number;
  hasActiveFilters: () => boolean;
}

export const useTaskStore = create(
  persist<TaskStore>(
    (set, get) => ({
      // Initial state
      tasks: [],
      filters: DEFAULT_FILTERS,

      // Add a new task
      addTask: (input: CreateTaskInput): Task => {
        const newTask: Task = {
          id: uuidv4(),
          title: input.title,
          description: input.description,
          priority: input.priority,
          dueDate: input.dueDate,
          labels: input.labels,
          columnId: input.columnId,
          boardId: input.boardId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));

        return newTask;
      },

      // Update an existing task's properties
      updateTask: (id: string, updates: UpdateTaskInput): void => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task,
          ),
        }));
      },

      // Delete a single task by ID
      deleteTask: (id: string): void => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },

      // Delete all tasks belonging to a board (cascade delete)
      deleteTasksByBoardId: (boardId: string): void => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.boardId !== boardId),
        }));
      },

      // Delete all tasks belonging to a column (cascade delete)
      deleteTasksByColumnId: (columnId: string): void => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.columnId !== columnId),
        }));
      },

      // Move a task to a different column
      moveTaskToColumn: (taskId: string, newColumnId: string): void => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, columnId: newColumnId, updatedAt: new Date().toISOString() }
              : task,
          ),
        }));
      },

      // Update filter criteria
      setFilters: (filters: Partial<TaskFilters>): void => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));
      },

      // Reset all filters to defaults
      resetFilters: (): void => {
        set({ filters: DEFAULT_FILTERS });
      },

      // Find a task by its ID
      getTaskById: (id: string): Task | undefined => {
        return get().tasks.find((task) => task.id === id);
      },

      // Get all tasks in a column
      getTasksByColumnId: (columnId: string): Task[] => {
        return get().tasks.filter((task) => task.columnId === columnId);
      },

      // Get all tasks in a board
      getTasksByBoardId: (boardId: string): Task[] => {
        return get().tasks.filter((task) => task.boardId === boardId);
      },

      // Get tasks in a column with active filters applied
      getFilteredTasks: (columnId: string): Task[] => {
        const { tasks, filters } = get();

        return tasks
          .filter((task) => task.columnId === columnId)
          .filter((task) => {
            // Search filter
            if (filters.search) {
              const searchLower = filters.search.toLowerCase();
              const matchesSearch =
                task.title.toLowerCase().includes(searchLower) ||
                task.description.toLowerCase().includes(searchLower);
              if (!matchesSearch) return false;
            }

            // Priority filter
            if (filters.priority !== 'all' && task.priority !== filters.priority) {
              return false;
            }

            // Labels filter
            if (filters.hasLabels && task.labels.length === 0) {
              return false;
            }

            return true;
          });
      },

      // Get number of tasks, optionally filtered by column
      getTaskCount: (columnId?: string): number => {
        const { tasks } = get();
        if (columnId) {
          return tasks.filter((task) => task.columnId === columnId).length;
        }
        return tasks.length;
      },

      // Check if any filters are currently active
      hasActiveFilters: (): boolean => {
        const { filters } = get();
        return filters.search !== '' || filters.priority !== 'all' || filters.hasLabels !== false;
      },
    }),
    {
      name: STORAGE_KEYS.TASKS,
      storage: createJSONStorage(() => localStorage),
      // Only persist tasks data, not ephemeral filter state
      partialize: ((state) => ({
        tasks: state.tasks,
      })) as (state: TaskStore) => TaskStore,
    },
  ),
);
