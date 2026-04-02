import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COLUMNS_FILE = path.join(__dirname, '../../data/columns.json');

interface Column {
  id: string;
  boardId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateColumnInput {
  boardId: string;
  title: string;
}

const readAllColumns = (): Column[] => {
  if (!fs.existsSync(COLUMNS_FILE)) return [];
  const raw = fs.readFileSync(COLUMNS_FILE, 'utf-8');
  return JSON.parse(raw) as Column[];
};

const readColumnsByBoardId = (boardId: string): Column[] => {
  if (!fs.existsSync(COLUMNS_FILE)) return [];
  const raw = fs.readFileSync(COLUMNS_FILE, 'utf-8');
  console.log('RAW', raw);
  const columns = JSON.parse(raw) as Column[];
  return columns.filter((c) => c.boardId === boardId);
};

const buildColumn = (input: CreateColumnInput): Column => {
  return {
    id: crypto.randomUUID(),
    boardId: input.boardId,
    title: input.title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

// Used by board.service — creates multiple columns in one write
export const createColumns = (boardId: string, titles: string[]): Column[] => {
  const newColumns = titles.map((title) => buildColumn({ boardId, title }));
  const existingColumns = readAllColumns();
  console.log('existingColumns', existingColumns);

  writeColumns([...existingColumns, ...newColumns]);
  return newColumns;
};

// Used by the API endpoint — creates one column and persists it
const createColumn = (input: CreateColumnInput): Column => {
  const column = buildColumn(input);
  const columns = readColumnsByBoardId(input.boardId);
  columns.push(column);
  writeColumns(columns);
  return column;
};

// Delete column and all its tasks
export const deleteColumn = (columnId: string): void => {
  const columns = readColumnsByBoardId(columnId);
  const columnToDelete = columns.find((c) => c.id === columnId);
  if (!columnToDelete) return;
  // Remove the column
  const updatedColumns = columns.filter((c) => c.id !== columnId);
  writeColumns(updatedColumns);
};

// Delete all columns for a board (used when deleting a board)
export const deleteColumnsByBoardId = (boardId: string): void => {
  const columns = readColumnsByBoardId(boardId);
  // Remove the columns
  const remainingColumns = columns.filter((c) => c.boardId !== boardId);
  writeColumns(remainingColumns);
};

const writeColumns = (columns: Column[]): void => {
  fs.writeFileSync(COLUMNS_FILE, JSON.stringify(columns, null, 2), 'utf-8');
};

export default {
  readColumnsByBoardId,
  createColumns,
  writeColumns,
  buildColumn,
  deleteColumn,
  deleteColumnsByBoardId,
};
