import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ---------------------------------------------------------------------------
// File path for persisted tasks
// ---------------------------------------------------------------------------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TASKS_FILE = path.join(__dirname, 'tasks.json');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: string;
  labels?: string[];
  columnId?: string;
  boardId?: string;
  dueDate?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: string;
  labels: string[];
  columnId: string | null;
  boardId: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// CRUD helpers
// ---------------------------------------------------------------------------
const createTask = (input: CreateTaskInput): Task => {
  return {
    id: crypto.randomUUID(),
    title: input.title,
    description: input.description ?? '',
    priority: input.priority ?? 'medium',
    status: input.status ?? 'todo',
    labels: input.labels ?? [],
    columnId: input.columnId ?? null,
    boardId: input.boardId ?? null,
    dueDate: input.dueDate ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

// ---------------------------------------------------------------------------
// File I/O
// ---------------------------------------------------------------------------
const readTasks = (): Task[] => {
  if (!fs.existsSync(TASKS_FILE)) return [];
  const raw = fs.readFileSync(TASKS_FILE, 'utf-8');
  return JSON.parse(raw) as Task[];
};

const writeTasks = (tasks: Task[]): void => {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
};

const updateTask = (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Task | null => {
  const tasks = readTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;
  tasks[index] = { ...tasks[index], ...updates, updatedAt: new Date().toISOString() };
  writeTasks(tasks);
  return tasks[index];
};

// Delete task by columnId (used when deleting a column)
export const deleteTasksByColumnId = (columnId: string): void => {
  const tasks = readTasks();
  const remainingTasks = tasks.filter((t) => t.columnId !== columnId);
  writeTasks(remainingTasks);
};

const deleteTask = (id: string): boolean => {
  const tasks = readTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  writeTasks(tasks);
  return true;
};

export default {
  createTask,
  readTasks,
  writeTasks,
  updateTask,
  deleteTask,
  deleteTasksByColumnId,
};
