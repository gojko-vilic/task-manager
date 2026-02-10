import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/types';
import { cn, priorityColors, formatDate, isOverdue } from '@/utils';
import { useUIStore } from '@/features/ui';

interface TaskCardProps {
  task: Task;
}

export const TaskCard = memo(function TaskCard({ task }: TaskCardProps) {
  const { openModal } = useUIStore();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityStyle = priorityColors[task.priority];
  const taskIsOverdue = isOverdue(task.dueDate);

  const handleClick = () => {
    openModal('edit-task', task.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={cn(
        'bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3 cursor-pointer',
        'hover:shadow-lg hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-200',
        isDragging && 'opacity-50 shadow-xl rotate-2 scale-105',
      )}
    >
      {/* Labels */}
      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {task.labels.slice(0, 3).map((label) => (
            <span
              key={label.id}
              className="px-2.5 py-1 text-xs font-medium rounded-full text-white"
              style={{ backgroundColor: label.color }}
            >
              {label.name}
            </span>
          ))}
          {task.labels.length > 3 && (
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
              +{task.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Title */}
      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm leading-normal">
        {task.title}
      </h4>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        {/* Priority Badge */}
        <span
          className={cn(
            'px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize',
            priorityStyle.bg,
            priorityStyle.text,
          )}
        >
          {task.priority}
        </span>

        {/* Due Date */}
        {task.dueDate && (
          <span
            className={cn(
              'text-xs font-medium flex items-center gap-1.5',
              taskIsOverdue ? 'text-red-600' : 'text-gray-500',
            )}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  );
});
