import express from 'express';

import { requestHandler } from './routes.js';

const app = express();

app.use(express.json()); // Middleware to parse JSON bodies

app.use(requestHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
