import express from 'express';

import boardService from './board.service.js';
import type { CreateBoardInput } from './board.service.js';
import columnService from './column.service.js';
import { NotFoundError } from './errors.js';

const router = express.Router();

// REFACTOR - move all board-related logic to board.service, including deleting related columns and tasks when a board is deleted
router.post('/api/boards', (req, res) => {
  const input: CreateBoardInput = req.body;
  const newBoard = boardService.createBoard(input);
  const boards = boardService.readAllBoards();
  boards.push(newBoard);
  boardService.writeBoards(boards);
  res.status(201).json(newBoard);
});

router.get('/api/boards', (req, res) => {
  const boards = boardService.readAllBoards();
  res.status(200).json(boards);
});

router.get('/api/boards/:id', (req, res) => {
  const { id } = req.params;
  console.log('ID ==>', id);
  const boards = boardService.readAllBoards();
  const board = boards.find((b) => b.id === id);
  if (board) {
    const columns = columnService.readColumnsByBoardId(board.id);
    res.status(200).json({ ...board, columns });
  } else {
    res.status(404).json({ error: 'Board not found' });
  }
});

// Delete board and all related columns and tasks
router.delete('/api/boards/:id', (req, res) => {
  const { id } = req.params;
  try {
    boardService.deleteBoard(id);
    res.status(204).end();
  } catch (err) {
    if (err instanceof NotFoundError) {
      res.status(404).json({ error: 'Board not found' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

export default router;
