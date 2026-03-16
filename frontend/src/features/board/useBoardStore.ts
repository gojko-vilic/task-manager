import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

import { STORAGE_KEYS } from '@/utils';
import type { Board, CreateBoardPayload } from './types';

interface BoardStore {
  // State
  boards: Board[];

  // Actions
  addBoard: (input: CreateBoardPayload) => Board;
  updateBoard: (id: string, updates: Partial<Board>) => void;
  deleteBoard: (id: string) => void;
  addColumnToBoard: (boardId: string, columnId: string) => void;
  removeColumnFromBoard: (boardId: string, columnId: string) => void;
  reorderColumns: (boardId: string, columnIds: string[]) => void;

  // Getters
  getBoardById: (id: string) => Board | undefined;
  getBoardCount: () => number;
}

export const useBoardStore = create(
  persist<BoardStore>(
    (set, get) => ({
      // Initial state
      boards: [],

      // Add a new board
      addBoard: (input: CreateBoardPayload): Board => {
        const newBoard: Board = {
          id: uuidv4(),
          title: input.title,
          description: input.description,
          columnIds: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          boards: [...state.boards, newBoard],
        }));

        return newBoard;
      },

      // Update an existing board's properties
      updateBoard: (id: string, updates: Partial<Board>): void => {
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === id ? { ...board, ...updates, updatedAt: new Date().toISOString() } : board,
          ),
        }));
      },

      // Delete a board
      deleteBoard: (id: string): void => {
        set((state) => ({
          boards: state.boards.filter((board) => board.id !== id),
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

      // Find a board by its ID
      getBoardById: (id: string): Board | undefined => {
        return get().boards.find((board) => board.id === id);
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
