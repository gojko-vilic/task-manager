import { http } from '@/lib/axios';

import type { CreateBoardPayload, Board } from './types';

export const boardRepo = {
  /** GET /api/boards/:id — get a single board by ID */
  getBoardById: (id: string) => http.get(`/boards/${id}`) as Promise<Board>,

  // GET /api/boards — get all boards
  getAllBoards: () => http.get('/boards') as Promise<Board[]>,

  /** POST /api/boards — create a new board */
  createBoard: (payload: CreateBoardPayload): Promise<Board> =>
    http.post('/boards', { ...payload }) as Promise<Board>,

  /** PUT /api/boards/:id — update a board by ID */
  updateBoard: (id: string, title: string) => http.put(`/boards/${id}`, { title }),

  /** DELETE /api/boards/:id — delete a board by ID */
  deleteBoard: (id: string) => http.delete(`/boards/${id}`),
};
