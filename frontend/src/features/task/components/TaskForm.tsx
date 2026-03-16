import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import to from 'await-to-js';

import { Modal, Button, Input, Textarea, Select } from '@/components/ui';
import { useColumnStore } from '@/features/column';
import { useUIStore } from '@/features/ui';
import { useUpdateTask } from '../useUpdateTask';
import { useGetTask } from '../useGetTask';
import type { Priority, Label, CreateTask } from '../task.types';
import { generateLabelColor } from '@/utils';
import { useCreateTask } from '../useCreateTask';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string | null;
}

/** Shape of the form fields managed by react-hook-form */
interface TaskFormValues {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
  columnId: string;
  labels: Label[];
}

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export function TaskForm({ isOpen, onClose, taskId }: TaskFormProps) {
  const isEditing = !!taskId;

  const { boardId } = useParams<{ boardId: string }>();
  const { data: existingTask } = useGetTask(taskId);
  const { mutate: updateTask } = useUpdateTask(boardId || '');
  const { getColumnsByBoardId, addTaskToColumn, removeTaskFromColumn } = useColumnStore();
  const { openDeleteConfirm } = useUIStore();
  const { mutateAsync: createTask } = useCreateTask();

  const columns = boardId ? getColumnsByBoardId(boardId) : [];
  const firstColumnId = columns[0]?.id ?? '';

  // ── react-hook-form setup ──────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      columnId: firstColumnId,
      labels: [],
    },
  });

  // useFieldArray manages the labels array without manual useState
  const {
    fields: labels,
    append: appendLabel,
    remove: removeLabel,
  } = useFieldArray({
    control,
    name: 'labels',
  });

  // Local state only for the label name input (not part of submitted data)
  const [newLabelName, setNewLabelName] = useState('');

  // Reset form values when modal opens or task changes
  useEffect(() => {
    if (isOpen) {
      if (existingTask) {
        reset({
          title: existingTask.title,
          description: existingTask.description,
          priority: existingTask.priority,
          dueDate: existingTask.dueDate ?? '',
          columnId: existingTask.columnId,
          labels: [...existingTask.labels],
        });
      } else {
        reset({
          title: '',
          description: '',
          priority: 'medium',
          dueDate: '',
          columnId: firstColumnId,
          labels: [],
        });
      }
      setNewLabelName('');
    }
  }, [isOpen, taskId, firstColumnId, reset]);

  // ── Submit handler — receives validated data from RHF ──
  const onSubmit = async (data: TaskFormValues) => {
    if (!boardId) return;

    if (isEditing && existingTask) {
      // Edit still uses Zustand (update API coming later)
      const columnChanged = existingTask.columnId !== data.columnId;

      updateTask({
        id: existingTask.id,
        updates: {
          title: data.title.trim(),
          description: data.description.trim(),
          priority: data.priority,
          dueDate: data.dueDate || null,
          labels: data.labels,
          columnId: data.columnId,
        },
      });

      if (columnChanged) {
        removeTaskFromColumn(existingTask.columnId, existingTask.id);
        addTaskToColumn(data.columnId, existingTask.id);
      }
    } else {
      // ── Create: call the backend API ──
      const payload: CreateTask = {
        title: data.title.trim(),
        description: data.description.trim(),
        priority: data.priority,
        dueDate: data.dueDate || null,
        labels: data.labels,
        columnId: data.columnId,
        boardId: boardId,
      };

      const [err, created] = await to(createTask(payload));

      if (err) {
        return; // Don't close the modal on error
      }

      // Add the new task to its column
      addTaskToColumn(data.columnId, created.id);
    }

    onClose();
  };

  // ── Label helpers ──────────────────────────────────────
  const handleAddLabel = () => {
    if (newLabelName.trim()) {
      appendLabel({
        id: uuidv4(),
        name: newLabelName.trim(),
        color: generateLabelColor(),
      });
      setNewLabelName('');
    }
  };

  const handleDelete = () => {
    if (existingTask) {
      openDeleteConfirm('task', existingTask.id, existingTask.title);
    }
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="title"
          label="Title"
          placeholder="Enter task title..."
          error={errors.title?.message}
          {...register('title', {
            required: 'Title is required',
            validate: (v) => v.trim().length > 0 || 'Title cannot be empty',
          })}
        />

        <Textarea
          id="description"
          label="Description"
          placeholder="Enter task description..."
          rows={3}
          {...register('description')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            id="priority"
            label="Priority"
            options={priorityOptions}
            {...register('priority')}
          />

          <Select
            id="column"
            label="Column"
            options={columnOptions}
            error={errors.columnId?.message}
            {...register('columnId', { required: 'Column is required' })}
          />
        </div>

        <Input id="dueDate" label="Due Date" type="date" {...register('dueDate')} />

        {/* Labels (managed by useFieldArray) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Labels</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {labels.map((label, index) => (
              <span
                key={label.id}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white"
                style={{ backgroundColor: label.color }}
              >
                {label.name}
                <button
                  type="button"
                  onClick={() => removeLabel(index)}
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
            <Button type="submit" disabled={isSubmitting}>
              {isEditing ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
