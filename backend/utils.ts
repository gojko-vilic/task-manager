import type { ServerResponse } from 'http';

export const sendJson = (res: ServerResponse, statusCode: number, data: unknown): void => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};
