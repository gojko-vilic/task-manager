import { IncomingMessage, ServerResponse } from 'http';

import { sendJson } from './utils.js';
import boardService from './board.service.js';
import type { CreateBoardInput } from './board.service.js';
import columnService from './column.service.js';
import { NotFoundError } from './errors.js';

// REFACTOR - move all board-related logic to board.service, including deleting related columns and tasks when a board is deleted

export const boardRequestHandler = (req: IncomingMessage, res: ServerResponse): void => {
  const { method } = req;
  const parsedUrl = new URL(req.url ?? '', `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const boardIdMatch = pathname.match(/^\/api\/boards\/([^/]+)$/);

  if (method === 'POST' && pathname === '/api/boards') {
    let body = '';
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      console.log('Received data:', body);
      try {
        const input: CreateBoardInput = JSON.parse(body);
        const newBoard = boardService.createBoard(input);
        const boards = boardService.readAllBoards();
        boards.push(newBoard);
        boardService.writeBoards(boards);
        console.log('Created board:', newBoard);
        sendJson(res, 201, newBoard);
      } catch (err) {
        console.error('Error parsing JSON:', err);
        sendJson(res, 400, { error: 'Invalid JSON' });
      }
    });
    return;
  }

  if (method === 'GET' && pathname === '/api/boards') {
    const boards = boardService.readAllBoards();
    sendJson(res, 200, boards);
    return;
  }

  if (method === 'GET') {
    if (boardIdMatch) {
      const id = boardIdMatch[1];
      const boards = boardService.readAllBoards();
      const board = boards.find((b) => b.id === id);
      if (board) {
        const columns = columnService.readColumnsByBoardId(board.id);
        sendJson(res, 200, { ...board, columns });
      } else {
        sendJson(res, 404, { error: 'Board not found' });
      }
      return;
    }
  }

  // Delete board and all related columns and tasks
  if (method === 'DELETE' && boardIdMatch) {
    try {
      const id = boardIdMatch[1];
      boardService.deleteBoard(id);
    } catch (err) {
      if (err instanceof NotFoundError) {
        sendJson(res, 404, { error: 'Board not found' });
        return;
      }
      sendJson(res, 500, { error: 'Internal server error' });
      return;
    }
    sendJson(res, 204, null);
    return;
  }

  sendJson(res, 404, { error: `Route ${method} ${pathname} not found` });
};
