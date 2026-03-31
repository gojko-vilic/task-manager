import type { Response, Request } from 'express';

import { sendJson } from './utils.js';
import { taskRequestHandler } from './task.routes.js';
import { boardRequestHandler } from './board.routes.js';

const setCorsHeaders = (res: Response): void => {
  res.setHeader('Access-Control-Allow-Origin', '*');
};

export const requestHandler = (req: Request, res: Response): void => {
  // Set CORS headers on every response

  setCorsHeaders(res);

  // Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  if (req.url?.startsWith('/api/tasks')) return taskRequestHandler(req, res);
  if (req.url?.startsWith('/api/boards')) return boardRequestHandler(req, res);

  sendJson(res, 404, { error: `Route ${req.method} ${req?.url || ''} not found` });
};
