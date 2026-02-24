import { createTask } from './service.js';

export const requestHandler = (req, res) => {
  const { method, url } = req;
  res.writeHead(200, {
    'Content-Type': 'application/json', // Tell browser: "this is JSON"
    'Access-Control-Allow-Origin': '*', // Allow frontend to call this API (CORS)
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });

  if (method === 'POST' && url === '/api/tasks') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      console.log('Received data:', body);
      try {
        const input = JSON.parse(body);
        const newTask = createTask(input);
        tasks.push(newTask);
        console.log('Created task:', newTask);
      } catch (err) {
        console.error('Error parsing JSON:', err);
        res.statusCode = 400;
        return res.end('Invalid JSON\n');
      }
      res.end('Data received\n');
    });
    return;
  }

  if (method === 'GET' && url === '/api/tasks') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(tasks));
    return;
  }

  console.log('req', req.url);
  console.log('method', req.method);
  console.log('header', req.headers);

  res.end('Backend api for task manager!\n');
};
