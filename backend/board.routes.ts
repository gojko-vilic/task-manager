import { IncomingMessage, ServerResponse } from 'http';

import { sendJson } from './utils.js';
import { createBoard, readAllBoards, writeBoards } from './board.service.js';
import type { CreateBoardInput } from './board.service.js';

export const boardRequestHandler = (req: IncomingMessage, res: ServerResponse): void => {
  const { method } = req;
  const parsedUrl = new URL(req.url ?? '', `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  if (method === 'POST' && pathname === '/api/boards') {
    let body = '';
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      console.log('Received data:', body);
      try {
        const input: CreateBoardInput = JSON.parse(body);
        const newBoard = createBoard(input);
        const boards = readAllBoards();
        boards.push(newBoard);
        writeBoards(boards);
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
    const boards = readAllBoards();
    sendJson(res, 200, boards);
    return;
  }

  sendJson(res, 404, { error: `Route ${method} ${pathname} not found` });
};
