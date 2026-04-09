import express from 'express';

import taskService from './task.service.js';
import type { CreateTaskInput } from './task.service.js';

const router = express.Router();

// REFACTOR - move all task-related logic to task.service, including filtering by boardId and columnId
router.post('/api/tasks', (req, res) => {
  const input: CreateTaskInput = req.body;
  const newTask = taskService.createTask(input);
  const tasks = taskService.readTasks();
  tasks.push(newTask);
  taskService.writeTasks(tasks);
  console.log('Created task:', newTask);
  res.status(201).json(newTask);
});

router.get('/api/tasks', (req, res) => {
  let tasks = taskService.readTasks();

  const boardId = req.query.boardId as string;
  const columnId = req.query.columnId as string;

  if (boardId) tasks = tasks.filter((t) => t.boardId === boardId);
  if (columnId) tasks = tasks.filter((t) => t.columnId === columnId);

  res.status(200).json(tasks);
});

// PUT /api/tasks/:id — update a task
router.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const updated = taskService.updateTask(id, updates);
  if (!updated) {
    res.status(404).json({ error: `Task ${id} not found` });
    return;
  }
  console.log('Updated task:', updated);
  res.status(200).json(updated);
});

// GET /api/tasks/:id — get a single task by ID
router.get('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const tasks = taskService.readTasks();
  const task = tasks.find((t) => t.id === id);
  if (task) {
    res.status(200).json(task);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

export default router;
