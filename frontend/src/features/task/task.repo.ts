import { http } from '@/lib/axios';
import type { Task, CreateTask } from './task.types';

export const taskRepo = {
  /** POST /api/tasks — create a new task */
  createTask: (payload: CreateTask): Promise<Task> => http.post('/tasks', payload),

  /** GET /api/tasks?boardId=...&columnId=... — get tasks by board or column */
  getTasks: (boardId?: string, columnId?: string): Promise<Task[]> =>
    http.get('/tasks', { params: { boardId, columnId } }),

  /** GET /api/tasks/:id — get a single task by ID */
  getTaskById: (id: string): Promise<Task> => http.get(`/tasks/${id}`),

  /** PUT /api/tasks/:id — update a task by ID */
  updateTask: (id: string, updates: Partial<CreateTask>): Promise<Task> =>
    http.put(`/tasks/${id}`, updates),

  /** DELETE /api/tasks/:id — delete a task by ID */
  deleteTask: (id: string): Promise<void> => http.delete(`/tasks/${id}`),

  /** DELETE /api/tasks?boardId=... — delete all tasks in a board (cascade) */
  deleteTasksByBoardId: (boardId: string): Promise<void> =>
    http.delete('/tasks', { params: { boardId } }),

  /** DELETE /api/tasks?columnId=... — delete all tasks in a column (cascade) */
  deleteTasksByColumnId: (columnId: string): Promise<void> =>
    http.delete('/tasks', { params: { columnId } }),
};
