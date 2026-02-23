import http from 'http';
import crypto from 'crypto';
import fs from 'fs';

const tasks = [];

const createTask = (input) => {
  return {
    id: crypto.randomUUID(),   // Generate unique ID
       columnId:input.columnId,  
    title: input.title,                    // From user input
    description: input.description || '',  // Default to empty string
    priority: input.priority || 'medium',  // Default to medium
    status:input.status ||  'todo',        // Default status
    labels: input.labels || [],            // Default to empty array
    columnId: input.columnId || null,
    boardId: input.boardId || null,
    dueDate: input.dueDate || null,
    createdAt: new Date().toISOString(),   // Current timestamp
    updatedAt: new Date().toISOString(),
  };
};

const server = http.createServer((req, res) => {
  // res.statusCode = 200;
  const {method, url} = req;
  // res.setHeader('Content-Type', 'text/plain');
  if(method === 'POST' && url === '/api/tasks') {
    let body = '';
    req.on('data', chunk => {
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

  if(method === 'GET' && url === '/api/tasks') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(tasks));
    return;
  };

  console.log('req',req.url);
  console.log('method',req.method);
  console.log('header',req.headers);

  res.end('Hello, World!\n');

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});