import { useMemo } from 'react';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import type { Column as ColumnType } from '@/features/board/types';
import { useTaskStore, type Task } from '@/features/task';
import { useColumnStore } from '@/features/column';
import { useUIStore } from '@/features/ui';
import { TaskCard } from './TaskCard';
import { cn } from '@/utils';

interface ColumnProps {
  column: ColumnType;
  tasks: Task[]; // ← receive tasks as prop instead of reading from store
}

export function Column({ column, tasks }: ColumnProps) {
  // Subscribe to tasks and filters to trigger re-renders
  const filters = useTaskStore((state) => state.filters);
  const { updateColumn } = useColumnStore();
  const { openDeleteConfirm } = useUIStore();

  // Filter tasks for this column
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => task.columnId === column.id)
      .filter((task) => {
        // Search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          const matchesSearch =
            task.title.toLowerCase().includes(searchLower) ||
            task.description.toLowerCase().includes(searchLower);
          if (!matchesSearch) return false;
        }

        // Priority filter
        if (filters.priority !== 'all' && task.priority !== filters.priority) {
          return false;
        }

        // Labels filter
        if (filters.hasLabels && task.labels.length === 0) {
          return false;
        }

        return true;
      });
  }, [tasks, filters, column.id]);

  const taskIds = useMemo(() => filteredTasks.map((t) => t.id), [filteredTasks]);

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `${column.id}-droppable`,
    data: {
      type: 'column',
      columnId: column.id,
      column,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  /**
   * Handles changes to the column title.
   * Updates the column with the new title if it's not empty and different from the current title.
   * The title is trimmed of whitespace before updating.
   *
   * @param newTitle - The new title for the column
   */
  const handleTitleChange = (newTitle: string) => {
    if (newTitle.trim() && newTitle !== column.title) {
      updateColumn(column.id, { title: newTitle.trim() });
    }
  };

  const handleDelete = () => {
    openDeleteConfirm('column', column.id, column.title);
  };

  return (
    <div
      ref={setSortableRef}
      style={style}
      className={cn(
        'flex-shrink-0 w-[340px] bg-gray-100/80 backdrop-blur-sm rounded-lg flex flex-col max-h-full shadow-sm',
        isDragging && 'opacity-50 shadow-lg',
      )}
    >
      {/* Column Header */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-between p-4 cursor-grab active:cursor-grabbing border-b border-gray-200/50"
      >
        <div className="flex items-center gap-3">
          <input
            type="text"
            defaultValue={column.title}
            onBlur={(e) => handleTitleChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
            className="font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg px-2 py-1 -ml-2 text-lg"
          />
          <span className="text-sm font-medium text-gray-500 bg-gray-200/80 rounded-full px-3 py-1">
            {filteredTasks.length}
          </span>
        </div>

        <button
          onClick={handleDelete}
          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          aria-label="Delete column"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {/* Tasks List */}
      <div ref={setDroppableRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <svg
              className="w-12 h-12 mx-auto mb-3 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-sm font-medium">No tasks yet</p>
            <p className="text-xs mt-1">Drop a task here or create one</p>
          </div>
        )}
      </div>
    </div>
  );
}
