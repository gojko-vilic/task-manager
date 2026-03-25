import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/utils';
import type { Board } from './types';

interface BoardStore {
  // State
  boards: Board[];

  // Actions
  updateBoard: (id: string, updates: Partial<Board>) => void;
  addColumnToBoard: (boardId: string, columnId: string) => void;
  removeColumnFromBoard: (boardId: string, columnId: string) => void;
  reorderColumns: (boardId: string, columnIds: string[]) => void;

  // Getters
  getBoardCount: () => number;
}

export const useBoardStore = create(
  persist<BoardStore>(
    (set, get) => ({
      // Initial state
      boards: [],

      // Update an existing board's properties
      updateBoard: (id: string, updates: Partial<Board>): void => {
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === id ? { ...board, ...updates, updatedAt: new Date().toISOString() } : board,
          ),
        }));
      },

      // Add a column reference to a board
      addColumnToBoard: (boardId: string, columnId: string): void => {
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  columnIds: [...board.columnIds, columnId],
                  updatedAt: new Date().toISOString(),
                }
              : board,
          ),
        }));
      },

      // Remove a column reference from a board
      removeColumnFromBoard: (boardId: string, columnId: string): void => {
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  columnIds: board.columnIds.filter((id) => id !== columnId),
                  updatedAt: new Date().toISOString(),
                }
              : board,
          ),
        }));
      },

      // Reorder columns within a board (after drag-drop)
      reorderColumns: (boardId: string, columnIds: string[]): void => {
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? { ...board, columnIds, updatedAt: new Date().toISOString() }
              : board,
          ),
        }));
      },

      // Get total number of boards
      getBoardCount: (): number => {
        return get().boards.length;
      },
    }),
    {
      name: STORAGE_KEYS.BOARDS,
      storage: createJSONStorage(() => localStorage),
      partialize: ((state) => ({
        boards: state.boards,
      })) as (state: BoardStore) => BoardStore,
    },
  ),
);
