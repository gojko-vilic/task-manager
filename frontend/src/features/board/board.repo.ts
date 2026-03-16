import { http } from '@/lib/axios';

import type { CreateBoardPayload } from './types';

export const boardRepo = {
  /** GET /api/boards/:id — get a single board by ID */
  getBoardById: (id: string) => http.get(`/boards/${id}`),

  /** POST /api/boards — create a new board */
  createBoard: (title: CreateBoardPayload) => http.post('/boards', { title }),

  /** PUT /api/boards/:id — update a board by ID */
  updateBoard: (id: string, title: string) => http.put(`/boards/${id}`, { title }),

  /** DELETE /api/boards/:id — delete a board by ID */
  deleteBoard: (id: string) => http.delete(`/boards/${id}`),
};
