import type { Response, Request } from 'express';

import { sendJson } from './utils.js';
import { taskRequestHandler } from './task.routes.js';

export const requestHandler = (req: Request, res: Response): void => {
  // Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  if (req.url?.startsWith('/api/tasks')) return taskRequestHandler(req, res);

  sendJson(res, 404, { error: `Route ${req.method} ${req?.url || ''} not found` });
};
