import crypto from 'crypto';

export const createTask = (input) => {
  return {
    id: crypto.randomUUID(), // Generate unique ID
    title: input.title, // From user input
    description: input.description || '', // Default to empty string
    priority: input.priority || 'medium', // Default to medium
    status: input.status || 'todo', // Default status
    labels: input.labels || [], // Default to empty array
    columnId: input.columnId || null,
    boardId: input.boardId || null,
    dueDate: input.dueDate || null,
    createdAt: new Date().toISOString(), // Current timestamp
    updatedAt: new Date().toISOString(),
  };
};
