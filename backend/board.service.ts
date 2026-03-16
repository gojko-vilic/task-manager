import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

// ---------------------------------------------------------------------------
// File path for persisted tasks
// ---------------------------------------------------------------------------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BOARDS_FILE = path.join(__dirname, 'boards.json');

interface Board {
  id: string;
  title: string;
  columnIds: string[];
  createdAt: string;
  updatedAt: string;
  description?: string;
}

interface CreateBoardInput {
  id: string;
  title: string;
  columnIds?: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export const readAllBoards = (): Board[] => {
  if (!fs.existsSync(BOARDS_FILE)) return [];
  const raw = fs.readFileSync(BOARDS_FILE, 'utf-8');
  return JSON.parse(raw) as Board[];
};

export const createBoard = (input: CreateBoardInput): Board => {
  return {
    id: crypto.randomUUID(),
    title: input.title,
    columnIds: input.columnIds ?? [],
    description: input.description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export const writeBoards = (boards: Board[]): void => {
  fs.writeFileSync(BOARDS_FILE, JSON.stringify(boards, null, 2), 'utf-8');
};

export const updateBoard = (id: string, updates: Partial<CreateBoardInput>): Board | null => {
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

export const deleteBoard = (id: string): boolean => {
  const boards = readAllBoards();
  const index = boards.findIndex((b) => b.id === id);
  if (index === -1) return false;

  boards.splice(index, 1);
  writeBoards(boards);
  return true;
};
