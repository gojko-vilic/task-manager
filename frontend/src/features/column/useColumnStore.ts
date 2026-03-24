import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/utils';
import type { Column } from '@/features/board/types';

interface ColumnStore {
  // State
  columns: Column[];

  // Actions

  updateColumn: (id: string, updates: Partial<Column>) => void;
  deleteColumn: (id: string) => void;
  addTaskToColumn: (columnId: string, taskId: string) => void;
  removeTaskFromColumn: (columnId: string, taskId: string) => void;
  moveTask: (fromColumnId: string, toColumnId: string, taskId: string, newIndex: number) => void;
  reorderTasks: (columnId: string, taskIds: string[]) => void;

  // Getters
  getColumnById: (id: string) => Column | undefined;
  getColumnsByBoardId: (boardId: string) => Column[];
  getColumnCount: (boardId: string) => number;
}

export const useColumnStore = create(
  persist<ColumnStore>(
    (set, get) => ({
      // Initial state
      columns: [],

      // Update a column's properties
      updateColumn: (id: string, updates: Partial<Column>): void => {
        set((state) => ({
          columns: state.columns.map((column) =>
            column.id === id ? { ...column, ...updates } : column,
          ),
        }));
      },

      // Delete a column
      deleteColumn: (id: string): void => {
        set((state) => ({
          columns: state.columns.filter((column) => column.id !== id),
        }));
      },

      // Add a task reference to a column
      addTaskToColumn: (columnId: string, taskId: string): void => {
        set((state) => ({
          columns: state.columns.map((column) =>
            column.id === columnId ? { ...column, taskIds: [...column.taskIds, taskId] } : column,
          ),
        }));
      },

      // Remove a task reference from a column
      removeTaskFromColumn: (columnId: string, taskId: string): void => {
        set((state) => ({
          columns: state.columns.map((column) =>
            column.id === columnId
              ? { ...column, taskIds: column.taskIds.filter((id) => id !== taskId) }
              : column,
          ),
        }));
      },

      // Move a task between columns with position control
      moveTask: (
        fromColumnId: string,
        toColumnId: string,
        taskId: string,
        newIndex: number,
      ): void => {
        set((state) => {
          const newColumns = state.columns.map((column) => {
            if (column.id === fromColumnId) {
              return {
                ...column,
                taskIds: column.taskIds.filter((id) => id !== taskId),
              };
            }
            if (column.id === toColumnId) {
              const newTaskIds = [...column.taskIds];
              newTaskIds.splice(newIndex, 0, taskId);
              return {
                ...column,
                taskIds: newTaskIds,
              };
            }
            return column;
          });
          return { columns: newColumns };
        });
      },

      // Reorder tasks within a column (after drag-drop)
      reorderTasks: (columnId: string, taskIds: string[]): void => {
        set((state) => ({
          columns: state.columns.map((column) =>
            column.id === columnId ? { ...column, taskIds } : column,
          ),
        }));
      },

      // Find a column by its ID
      getColumnById: (id: string): Column | undefined => {
        return get().columns.find((column) => column.id === id);
      },

      // Get all columns for a board, sorted by order
      getColumnsByBoardId: (boardId: string): Column[] => {
        return get()
          .columns.filter((column) => column.boardId === boardId)
          .sort((a, b) => a.order - b.order);
      },

      // Get the number of columns in a board
      getColumnCount: (boardId: string): number => {
        return get().columns.filter((column) => column.boardId === boardId).length;
      },
    }),
    {
      name: STORAGE_KEYS.COLUMNS,
      storage: createJSONStorage(() => localStorage),
      partialize: ((state) => ({
        columns: state.columns,
      })) as (state: ColumnStore) => ColumnStore,
    },
  ),
);
