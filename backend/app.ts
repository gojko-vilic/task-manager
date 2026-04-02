import express from 'express';
import cors from 'cors';

import boardRouter from './board.routes.js';
import taskRouter from './task.routes.js';

const app = express();

app.use(express.json()); // Middleware to parse JSON bodies
app.use(cors());

app.use(boardRouter);
app.use(taskRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
