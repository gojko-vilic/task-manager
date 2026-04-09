import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

import columnService from '../columns/column.service.js';
import taskService from '../tasks/task.service.js';
import { NotFoundError } from '../../middleware/errors.js';

// ---------------------------------------------------------------------------
// File path for persisted tasks
// ---------------------------------------------------------------------------
const __dirname = path.join(fileURLToPath(import.meta.url));
const BOARDS_FILE = path.join(__dirname, '../../../data/boards.json');

interface Board {
  id: string;
  title: string;
  columnIds: string[];
  createdAt: string;
  updatedAt: string;
  description?: string;
}

export interface CreateBoardInput {
  id: string;
  title: string;
  columnIds?: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const readAllBoards = (): Board[] => {
  if (!fs.existsSync(BOARDS_FILE)) return [];
  const raw = fs.readFileSync(BOARDS_FILE, 'utf-8');
  return JSON.parse(raw) as Board[];
};

const createBoard = (input: CreateBoardInput): Board => {
  const boardId = crypto.randomUUID();
  const defaultColumns = ['To Do', 'In Progress', 'Done'];

  const columns = columnService.createColumns(boardId, defaultColumns);

  return {
    id: boardId,
    title: input.title,
    columnIds: columns.map((c) => c.id),
    description: input.description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

const writeBoards = (boards: Board[]): void => {
  fs.writeFileSync(BOARDS_FILE, JSON.stringify(boards, null, 2), 'utf-8');
};

const updateBoard = (id: string, updates: Partial<CreateBoardInput>): Board | null => {
  const boards = readAllBoards();
  const index = boards.findIndex((b) => b.id === id);
  if (index === -1) return null;

  const updatedBoard = {
    ...boards[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  boards[index] = updatedBoard;
  writeBoards(boards);
  return updatedBoard;
};

const deleteBoard = (id: string): boolean => {
  const boards = readAllBoards();
  const index = boards.findIndex((b) => b.id === id);
  if (index === -1) throw new NotFoundError('Board not found');
  // delete all tasks for columns in the board
  const columns = columnService.readColumnsByBoardId(id);
  columns.forEach((col) => {
    taskService.deleteTasksByColumnId(col.id);
  });
  // delete all columns for the board
  columnService.deleteColumnsByBoardId(id);
  // delete the board
  boards.splice(index, 1);
  writeBoards(boards);
  return true;
};

export default {
  createBoard,
  readAllBoards,
  updateBoard,
  deleteBoard,
  writeBoards,
};
