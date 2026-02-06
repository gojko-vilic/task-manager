import { describe, it, expect, beforeEach } from 'vitest';
import { useBoardStore } from './boardStore';

describe('boardStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useBoardStore.setState({ boards: [], activeBoardId: null });
  });

  describe('addBoard', () => {
    it('should add a new board', () => {
      const { addBoard } = useBoardStore.getState();

      const newBoard = addBoard({ title: 'Test Board', description: 'Test Description' });

      const updatedBoards = useBoardStore.getState().boards;
      expect(updatedBoards).toHaveLength(1);
      expect(updatedBoards[0].title).toBe('Test Board');
      expect(updatedBoards[0].description).toBe('Test Description');
      expect(newBoard.id).toBeDefined();
    });

    it('should set the new board as active', () => {
      const { addBoard } = useBoardStore.getState();

      const newBoard = addBoard({ title: 'Test Board', description: '' });

      const { activeBoardId } = useBoardStore.getState();
      expect(activeBoardId).toBe(newBoard.id);
    });
  });

  describe('updateBoard', () => {
    it('should update an existing board', () => {
      const { addBoard, updateBoard } = useBoardStore.getState();

      const board = addBoard({ title: 'Original', description: '' });
      updateBoard(board.id, { title: 'Updated' });

      const updatedBoard = useBoardStore.getState().getBoardById(board.id);
      expect(updatedBoard?.title).toBe('Updated');
    });
  });

  describe('deleteBoard', () => {
    it('should delete a board', () => {
      const { addBoard, deleteBoard } = useBoardStore.getState();

      const board = addBoard({ title: 'To Delete', description: '' });
      expect(useBoardStore.getState().boards).toHaveLength(1);

      deleteBoard(board.id);
      expect(useBoardStore.getState().boards).toHaveLength(0);
    });

    it('should clear activeBoardId if deleted board was active', () => {
      const { addBoard, deleteBoard } = useBoardStore.getState();

      const board = addBoard({ title: 'Active Board', description: '' });
      expect(useBoardStore.getState().activeBoardId).toBe(board.id);

      deleteBoard(board.id);
      expect(useBoardStore.getState().activeBoardId).toBeNull();
    });
  });

  describe('setActiveBoard', () => {
    it('should set the active board', () => {
      const { addBoard, setActiveBoard } = useBoardStore.getState();

      const board1 = addBoard({ title: 'Board 1', description: '' });
      const board2 = addBoard({ title: 'Board 2', description: '' });

      setActiveBoard(board1.id);
      expect(useBoardStore.getState().activeBoardId).toBe(board1.id);

      setActiveBoard(board2.id);
      expect(useBoardStore.getState().activeBoardId).toBe(board2.id);
    });
  });

  describe('column management', () => {
    it('should add column to board', () => {
      const { addBoard, addColumnToBoard } = useBoardStore.getState();

      const board = addBoard({ title: 'Board', description: '' });
      addColumnToBoard(board.id, 'col-1');

      const updatedBoard = useBoardStore.getState().getBoardById(board.id);
      expect(updatedBoard?.columnIds).toContain('col-1');
    });

    it('should remove column from board', () => {
      const { addBoard, addColumnToBoard, removeColumnFromBoard } = useBoardStore.getState();

      const board = addBoard({ title: 'Board', description: '' });
      addColumnToBoard(board.id, 'col-1');
      removeColumnFromBoard(board.id, 'col-1');

      const updatedBoard = useBoardStore.getState().getBoardById(board.id);
      expect(updatedBoard?.columnIds).not.toContain('col-1');
    });

    it('should reorder columns', () => {
      const { addBoard, addColumnToBoard, reorderColumns } = useBoardStore.getState();

      const board = addBoard({ title: 'Board', description: '' });
      addColumnToBoard(board.id, 'col-1');
      addColumnToBoard(board.id, 'col-2');
      addColumnToBoard(board.id, 'col-3');

      reorderColumns(board.id, ['col-3', 'col-1', 'col-2']);

      const updatedBoard = useBoardStore.getState().getBoardById(board.id);
      expect(updatedBoard?.columnIds).toEqual(['col-3', 'col-1', 'col-2']);
    });
  });
});
