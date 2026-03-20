import type { IncomingMessage, ServerResponse } from 'http';

import { createTask, readTasks, writeTasks, updateTask } from './task.service.js';
import type { CreateTaskInput } from './task.service.js';
import { sendJson } from './utils.js';

export const taskRequestHandler = (req: IncomingMessage, res: ServerResponse): void => {
  const { method } = req;
  const parsedUrl = new URL(req.url ?? '', `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  if (method === 'POST' && pathname === '/api/tasks') {
    let body = '';
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      console.log('Received data:', body);
      try {
        const input: CreateTaskInput = JSON.parse(body);
        const newTask = createTask(input);
        const tasks = readTasks();
        tasks.push(newTask);
        writeTasks(tasks);
        console.log('Created task:', newTask);
        sendJson(res, 201, newTask);
      } catch (err) {
        console.error('Error parsing JSON:', err);
        sendJson(res, 400, { error: 'Invalid JSON' });
      }
    });
    return;
  }

  if (method === 'GET' && pathname === '/api/tasks') {
    let tasks = readTasks();

    const boardId = parsedUrl.searchParams.get('boardId');
    const columnId = parsedUrl.searchParams.get('columnId');

    if (boardId) tasks = tasks.filter((t) => t.boardId === boardId);
    if (columnId) tasks = tasks.filter((t) => t.columnId === columnId);

    sendJson(res, 200, tasks);
    return;
  }

  // PUT /api/tasks/:id — update a task
  const taskIdMatch = pathname.match(/^\/api\/tasks\/([^/]+)$/);

  if (method === 'PUT' && taskIdMatch) {
    const id = taskIdMatch[1];
    let body = '';
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const updates = JSON.parse(body);
        const updated = updateTask(id, updates);
        if (!updated) {
          sendJson(res, 404, { error: `Task ${id} not found` });
          return;
        }
        console.log('Updated task:', updated);
        sendJson(res, 200, updated);
      } catch (err) {
        console.error('Error parsing JSON:', err);
        sendJson(res, 400, { error: 'Invalid JSON' });
      }
    });
    return;
  }
};
