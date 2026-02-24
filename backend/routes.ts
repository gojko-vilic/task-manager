import type { IncomingMessage, ServerResponse } from 'http';
import { createTask, readTasks, writeTasks } from './service.js';

export const requestHandler = (req: IncomingMessage, res: ServerResponse): void => {
  const { method, url } = req;

  // CORS + default content-type
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });

  // Preflight
  if (method === 'OPTIONS') {
    res.end();
    return;
  }

  if (method === 'POST' && url === '/api/tasks') {
    let body = '';
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      console.log('Received data:', body);
      try {
        const input = JSON.parse(body);
        const newTask = createTask(input);
        const tasks = readTasks();
        tasks.push(newTask);
        writeTasks(tasks);
        console.log('Created task:', newTask);
      } catch (err) {
        console.error('Error parsing JSON:', err);
        res.statusCode = 400;
        res.end('Invalid JSON\n');
        return;
      }
      res.end('Data received\n');
    });
    return;
  }

  if (method === 'GET' && url === '/api/tasks') {
    const tasks = readTasks();
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(tasks));
    return;
  }

  console.log('req', req.url);
  console.log('method', req.method);
  console.log('header', req.headers);

  res.end('Backend api for task manager!\n');
};
