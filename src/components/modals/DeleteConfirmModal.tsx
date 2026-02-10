import { ConfirmDialog } from '@/components/ui';
import { useUIStore } from '@/features/ui';
import { useBoardStore } from '@/features/board';
import { useColumnStore } from '@/features/column';
import { useTaskStore } from '@/features/task';

export function DeleteConfirmModal() {
  const { activeModal, deleteConfirmData, closeDeleteConfirm, closeModal } = useUIStore();
  const { deleteBoard } = useBoardStore();
  const { deleteColumn, removeTaskFromColumn } = useColumnStore();
  const { deleteTask, getTasksByColumnId } = useTaskStore();

  const isOpen = activeModal === 'delete-confirm' && !!deleteConfirmData;

  const handleConfirm = () => {
    if (!deleteConfirmData) return;

    const { type, id } = deleteConfirmData;

    switch (type) {
      case 'task': {
        // Remove from column first
        const task = useTaskStore.getState().getTaskById(id);
        if (task) {
          removeTaskFromColumn(task.columnId, id);
        }
        deleteTask(id);
        break;
      }
      case 'column': {
        // Delete all tasks in column first
        const tasks = getTasksByColumnId(id);
        tasks.forEach((task) => deleteTask(task.id));

        // Remove from board
        const column = useColumnStore.getState().getColumnById(id);
        if (column) {
          useBoardStore.getState().removeColumnFromBoard(column.boardId, id);
        }
        deleteColumn(id);
        break;
      }
      case 'board': {
        // Delete all columns and tasks for this board
        const columns = useColumnStore.getState().getColumnsByBoardId(id);
        columns.forEach((col) => {
          const tasks = getTasksByColumnId(col.id);
          tasks.forEach((task) => deleteTask(task.id));
          deleteColumn(col.id);
        });
        deleteBoard(id);
        break;
      }
    }

    closeDeleteConfirm();
    closeModal();
  };

  if (!deleteConfirmData) return null;

  const typeLabel =
    deleteConfirmData.type.charAt(0).toUpperCase() + deleteConfirmData.type.slice(1);

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={closeDeleteConfirm}
      onConfirm={handleConfirm}
      title={`Delete ${typeLabel}`}
      message={`Are you sure you want to delete "${deleteConfirmData.title}"? This action cannot be undone.`}
      confirmText="Delete"
      variant="danger"
    />
  );
}
