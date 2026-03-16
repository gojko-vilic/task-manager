import { useCallback, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  pointerWithin,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type {
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  CollisionDetection,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from '@dnd-kit/sortable';

import { useQueryClient } from '@tanstack/react-query';

import { useBoardStore } from '@/features/board';
import { useColumnStore } from '@/features/column';
import { useGetTasks } from '@/features/task/useGetTasks';
import { useUpdateTask } from '@/features/task/useUpdateTask';
import { taskKey } from '@/features/task/task.query-keys';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import { AddColumnButton } from './AddColumnButton';
import { EmptyState } from '@/components/ui';
import type { Column as ColumnType } from '@/types';
import type { Task } from '@/features/task/task.types';

interface BoardViewProps {
  boardId: string;
}

export function BoardView({ boardId }: BoardViewProps) {
  const board = useBoardStore((state) => state.boards.find((b) => b.id === boardId));
  const reorderColumns = useBoardStore((state) => state.reorderColumns);

  const allColumns = useColumnStore((state) => state.columns);
  const reorderTasks = useColumnStore((state) => state.reorderTasks);

  const { data: allTasks = [] } = useGetTasks(boardId);
  const queryClient = useQueryClient();
  const { mutate: updateTask } = useUpdateTask(boardId);

  // Tracks cross-column moves during drag so handleDragEnd can persist to backend
  const pendingMove = useRef<{ taskId: string; columnId: string } | null>(null);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'task' | 'column' | null>(null);

  // Get columns for this board
  const columns = useMemo(() => {
    if (!board) return [];
    return board.columnIds
      .map((id) => allColumns.find((c) => c.id === id))
      .filter((c): c is ColumnType => c !== undefined);
  }, [board, allColumns]);

  const columnIds = useMemo(() => columns.map((c) => c.id), [columns]);

  // Get active item for drag overlay
  const activeTask = useMemo(() => {
    if (activeType !== 'task' || !activeId) return null;
    return allTasks.find((t) => t.id === activeId) ?? null;
  }, [activeId, activeType, allTasks]);

  const activeColumn = useMemo(() => {
    if (activeType !== 'column' || !activeId) return null;
    return columns.find((c) => c.id === activeId) ?? null;
  }, [activeId, activeType, columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Custom collision detection that handles column vs task dragging properly
  const collisionDetection: CollisionDetection = useCallback((args) => {
    const activeData = args.active.data.current;

    // For column dragging, only consider other column sortable containers (not tasks inside them)
    if (activeData?.type === 'column') {
      const columnContainers = args.droppableContainers.filter((container) => {
        const data = container.data.current;
        return data?.type === 'column' && !String(container.id).endsWith('-droppable');
      });
      return closestCenter({
        ...args,
        droppableContainers: columnContainers,
      });
    }

    // For task dragging, first check what the pointer is within
    const pointerCollisions = pointerWithin(args);

    if (pointerCollisions.length > 0) {
      // Prefer task collisions for reordering within a column
      const taskCollision = pointerCollisions.find(
        (c) => c.data?.droppableContainer?.data?.current?.type === 'task',
      );
      if (taskCollision) return [taskCollision];

      // Otherwise return the first column droppable
      const columnCollision = pointerCollisions.find((c) => {
        const data = c.data?.droppableContainer?.data?.current;
        return data?.type === 'column';
      });
      if (columnCollision) return [columnCollision];

      return pointerCollisions;
    }

    // Fallback to rect intersection
    return rectIntersection(args);
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;

    setActiveId(active.id as string);
    setActiveType(activeData?.type ?? null);
  }, []);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeData = active.data.current;
      const overData = over.data.current;

      // Only handle task over column/task
      if (activeData?.type !== 'task') return;

      const taskId = active.id as string;
      const task = allTasks.find((t) => t.id === taskId);
      if (!task) return;

      let targetColumnId: string | null = null;

      if (overData?.type === 'column') {
        // Handle both direct column ID and suffixed droppable ID
        targetColumnId = overData.columnId ?? (over.id as string);
      } else if (overData?.type === 'task') {
        const overTask = allTasks.find((t) => t.id === over.id);
        targetColumnId = overTask?.columnId ?? null;
      }

      // Move task to different column
      if (targetColumnId && task.columnId !== targetColumnId) {
        // Optimistically update the task's columnId in the React Query cache
        queryClient.setQueryData<Task[]>(taskKey.list({ boardId }), (old) =>
          old?.map((t) => (t.id === taskId ? { ...t, columnId: targetColumnId } : t)),
        );

        // Track the final move — will be persisted to backend in handleDragEnd
        pendingMove.current = { taskId, columnId: targetColumnId };
      }
    },
    [allTasks, queryClient, boardId],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveId(null);
      setActiveType(null);

      if (!over) return;

      const activeData = active.data.current;
      const overData = over.data.current;

      // Handle column reordering
      if (activeData?.type === 'column' && overData?.type === 'column') {
        if (active.id !== over.id) {
          const oldIndex = columnIds.indexOf(active.id as string);
          const newIndex = columnIds.indexOf(over.id as string);
          const newColumnIds = arrayMove(columnIds, oldIndex, newIndex);
          reorderColumns(boardId, newColumnIds);
        }
        return;
      }

      // Handle task reordering within same column
      if (activeData?.type === 'task' && overData?.type === 'task') {
        const activeTask = allTasks.find((t) => t.id === active.id);
        const overTask = allTasks.find((t) => t.id === over.id);

        if (activeTask && overTask && activeTask.columnId === overTask.columnId) {
          const columnTasks = allTasks
            .filter((t) => t.columnId === activeTask.columnId)
            .map((t) => t.id);
          const oldIndex = columnTasks.indexOf(active.id as string);
          const newIndex = columnTasks.indexOf(over.id as string);
          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            reorderTasks(activeTask.columnId, arrayMove(columnTasks, oldIndex, newIndex));
          }
        }
      }

      // Persist cross-column move to backend (once, on drop)
      if (pendingMove.current) {
        const { taskId, columnId } = pendingMove.current;
        pendingMove.current = null;
        updateTask({ id: taskId, updates: { columnId } });
      }
    },
    [boardId, columnIds, allTasks, reorderColumns, reorderTasks, updateTask],
  );

  if (!board) {
    return (
      <EmptyState
        title="Board not found"
        description="The board you're looking for doesn't exist."
      />
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-2 h-full overflow-x-auto pb-6 px-2">
        <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
          {columns.map((column) => {
            const columnTasks = allTasks.filter((t) => t.columnId === column.id);
            return <Column key={column.id} column={column} tasks={columnTasks} />;
          })}
        </SortableContext>

        <AddColumnButton boardId={boardId} />
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: 'ease-out' }}>
        {activeTask && <TaskCard task={activeTask} />}
        {activeColumn && (
          <div className="w-[340px] bg-gray-100/90 backdrop-blur-sm rounded-lg flex flex-col max-h-[80vh] shadow-2xl border border-gray-200/60 ring-2 ring-indigo-300/40">
            {/* Column Header */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-200/50">
              <span className="font-bold text-lg text-gray-900">{activeColumn.title}</span>
              <span className="text-sm font-medium text-gray-500 bg-gray-200/80 rounded-full px-3 py-1">
                {activeColumn.taskIds.length}
              </span>
            </div>
            {/* Column Tasks */}
            <div className="flex-1 overflow-hidden px-3 py-3 space-y-2">
              {allTasks
                .filter((t) => t.columnId === activeColumn.id)
                .slice(0, 5)
                .map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              {activeColumn.taskIds.length > 5 && (
                <p className="text-xs text-center text-gray-400 py-1">
                  +{allTasks.filter((t) => t.columnId === activeColumn.id).length - 5} more
                </p>
              )}
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
