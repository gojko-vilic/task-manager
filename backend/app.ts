import http from 'http';

import { requestHandler } from './routes.js';

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  requestHandler(req, res);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
