import { describe, it, expect, beforeEach } from 'vitest';
import { useTaskStore } from './taskStore';

describe('taskStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useTaskStore.setState({
      tasks: [],
      filters: { search: '', priority: 'all', hasLabels: false },
    });
  });

  describe('addTask', () => {
    it('should add a new task', () => {
      const { addTask } = useTaskStore.getState();

      const newTask = addTask({
        title: 'Test Task',
        description: 'Test Description',
        priority: 'high',
        dueDate: '2026-12-31',
        labels: [],
        columnId: 'col-1',
        boardId: 'board-1',
      });

      const tasks = useTaskStore.getState().tasks;
      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe('Test Task');
      expect(tasks[0].priority).toBe('high');
      expect(newTask.id).toBeDefined();
    });
  });

  describe('updateTask', () => {
    it('should update an existing task', () => {
      const { addTask, updateTask } = useTaskStore.getState();

      const task = addTask({
        title: 'Original',
        description: '',
        priority: 'low',
        dueDate: null,
        labels: [],
        columnId: 'col-1',
        boardId: 'board-1',
      });

      updateTask(task.id, { title: 'Updated', priority: 'high' });

      const updatedTask = useTaskStore.getState().getTaskById(task.id);
      expect(updatedTask?.title).toBe('Updated');
      expect(updatedTask?.priority).toBe('high');
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', () => {
      const { addTask, deleteTask } = useTaskStore.getState();

      const task = addTask({
        title: 'To Delete',
        description: '',
        priority: 'medium',
        dueDate: null,
        labels: [],
        columnId: 'col-1',
        boardId: 'board-1',
      });

      expect(useTaskStore.getState().tasks).toHaveLength(1);

      deleteTask(task.id);
      expect(useTaskStore.getState().tasks).toHaveLength(0);
    });
  });

  describe('moveTaskToColumn', () => {
    it('should move task to a new column', () => {
      const { addTask, moveTaskToColumn } = useTaskStore.getState();

      const task = addTask({
        title: 'Movable Task',
        description: '',
        priority: 'medium',
        dueDate: null,
        labels: [],
        columnId: 'col-1',
        boardId: 'board-1',
      });

      moveTaskToColumn(task.id, 'col-2');

      const movedTask = useTaskStore.getState().getTaskById(task.id);
      expect(movedTask?.columnId).toBe('col-2');
    });
  });

  describe('filters', () => {
    it('should set filters', () => {
      const { setFilters } = useTaskStore.getState();

      setFilters({ search: 'test', priority: 'high' });

      const { filters } = useTaskStore.getState();
      expect(filters.search).toBe('test');
      expect(filters.priority).toBe('high');
    });

    it('should reset filters', () => {
      const { setFilters, resetFilters } = useTaskStore.getState();

      setFilters({ search: 'test', priority: 'high', hasLabels: true });
      resetFilters();

      const { filters } = useTaskStore.getState();
      expect(filters.search).toBe('');
      expect(filters.priority).toBe('all');
      expect(filters.hasLabels).toBe(false);
    });

    it('should filter tasks by search', () => {
      const { addTask, setFilters } = useTaskStore.getState();

      addTask({
        title: 'Apple Task',
        description: '',
        priority: 'medium',
        dueDate: null,
        labels: [],
        columnId: 'col-1',
        boardId: 'board-1',
      });

      addTask({
        title: 'Banana Task',
        description: '',
        priority: 'medium',
        dueDate: null,
        labels: [],
        columnId: 'col-1',
        boardId: 'board-1',
      });

      setFilters({ search: 'Apple' });

      const filtered = useTaskStore.getState().getFilteredTasks('col-1');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('Apple Task');
    });

    it('should filter tasks by priority', () => {
      const { addTask, setFilters } = useTaskStore.getState();

      addTask({
        title: 'High Priority',
        description: '',
        priority: 'high',
        dueDate: null,
        labels: [],
        columnId: 'col-1',
        boardId: 'board-1',
      });

      addTask({
        title: 'Low Priority',
        description: '',
        priority: 'low',
        dueDate: null,
        labels: [],
        columnId: 'col-1',
        boardId: 'board-1',
      });

      setFilters({ priority: 'high' });

      const filtered = useTaskStore.getState().getFilteredTasks('col-1');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('High Priority');
    });
  });

  describe('getTasksByColumnId', () => {
    it('should return tasks for a specific column', () => {
      const { addTask } = useTaskStore.getState();

      addTask({
        title: 'Task 1',
        description: '',
        priority: 'medium',
        dueDate: null,
        labels: [],
        columnId: 'col-1',
        boardId: 'board-1',
      });

      addTask({
        title: 'Task 2',
        description: '',
        priority: 'medium',
        dueDate: null,
        labels: [],
        columnId: 'col-2',
        boardId: 'board-1',
      });

      const col1Tasks = useTaskStore.getState().getTasksByColumnId('col-1');
      expect(col1Tasks).toHaveLength(1);
      expect(col1Tasks[0].title).toBe('Task 1');
    });
  });
});
