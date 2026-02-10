import { useState, useEffect } from 'react';
import { Modal, Button, Input, Textarea, Select } from '@/components/ui';
import { useTaskStore } from '@/features/task';
import { useColumnStore } from '@/features/column';
import { useBoardStore } from '@/features/board';
import { useUIStore } from '@/features/ui';
import type { Priority, Label, CreateTaskInput } from '@/types';
import { generateLabelColor } from '@/utils';
import { v4 as uuidv4 } from 'uuid';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  taskId?: string | null;
}

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export function TaskForm({ isOpen, onClose, taskId }: TaskFormProps) {
  const { addTask, updateTask, getTaskById } = useTaskStore();
  const { getColumnsByBoardId, addTaskToColumn, removeTaskFromColumn } = useColumnStore();
  const { activeBoardId } = useBoardStore();
  const { openDeleteConfirm } = useUIStore();

  const existingTask = taskId ? getTaskById(taskId) : null;
  const isEditing = !!existingTask;

  const columns = activeBoardId ? getColumnsByBoardId(activeBoardId) : [];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [columnId, setColumnId] = useState('');
  const [labels, setLabels] = useState<Label[]>([]);
  const [newLabelName, setNewLabelName] = useState('');

  // Get the first column ID (stable reference)
  const firstColumnId = columns[0]?.id ?? '';

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (existingTask) {
        setTitle(existingTask.title);
        setDescription(existingTask.description);
        setPriority(existingTask.priority);
        setDueDate(existingTask.dueDate ?? '');
        setColumnId(existingTask.columnId);
        setLabels([...existingTask.labels]);
      } else {
        setTitle('');
        setDescription('');
        setPriority('medium');
        setDueDate('');
        setColumnId(firstColumnId);
        setLabels([]);
      }
      setNewLabelName('');
    }
  }, [isOpen, taskId, firstColumnId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !columnId || !activeBoardId) return;

    if (isEditing && existingTask) {
      // Check if column changed
      const columnChanged = existingTask.columnId !== columnId;

      updateTask(existingTask.id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate: dueDate || null,
        labels,
        columnId,
      });

      // Update column task lists if column changed
      if (columnChanged) {
        removeTaskFromColumn(existingTask.columnId, existingTask.id);
        addTaskToColumn(columnId, existingTask.id);
      }
    } else {
      const input: CreateTaskInput = {
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate: dueDate || null,
        labels,
        columnId,
        boardId: activeBoardId,
      };

      const newTask = addTask(input);
      addTaskToColumn(columnId, newTask.id);
    }

    onClose();
  };

  const handleDelete = () => {
    if (existingTask) {
      openDeleteConfirm('task', existingTask.id, existingTask.title);
    }
  };

  const handleAddLabel = () => {
    if (newLabelName.trim()) {
      const newLabel: Label = {
        id: uuidv4(),
        name: newLabelName.trim(),
        color: generateLabelColor(),
      };
      setLabels([...labels, newLabel]);
      setNewLabelName('');
    }
  };

  const handleRemoveLabel = (labelId: string) => {
    setLabels(labels.filter((l) => l.id !== labelId));
  };

  const columnOptions = columns.map((col) => ({
    value: col.id,
    label: col.title,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Task' : 'Create Task'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="title"
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title..."
          required
        />

        <Textarea
          id="description"
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description..."
          rows={3}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            id="priority"
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            options={priorityOptions}
          />

          <Select
            id="column"
            label="Column"
            value={columnId}
            onChange={(e) => setColumnId(e.target.value)}
            options={columnOptions}
          />
        </div>

        <Input
          id="dueDate"
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        {/* Labels */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Labels</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {labels.map((label) => (
              <span
                key={label.id}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white"
                style={{ backgroundColor: label.color }}
              >
                {label.name}
                <button
                  type="button"
                  onClick={() => handleRemoveLabel(label.id)}
                  className="hover:opacity-70"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              placeholder="New label name..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddLabel();
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddLabel}
              disabled={!newLabelName.trim()}
            >
              Add
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4">
          {isEditing ? (
            <Button type="button" variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || !columnId}>
              {isEditing ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
