import { useNavigate } from 'react-router-dom';

import { ConfirmDialog } from '@/components/ui';
import { useUIStore } from '@/features/ui';
import { useBoardStore } from '@/features/board';
import { useColumnStore } from '@/features/column';
import { useTaskStore } from '@/features/task';
import { useDeleteBoard } from '@/features/board';
import to from 'await-to-js';

export function DeleteConfirmModal() {
  const navigate = useNavigate();
  const { activeModal, deleteConfirmData, closeDeleteConfirm, closeModal } = useUIStore();

  const id = deleteConfirmData?.id ?? '';
  const type = deleteConfirmData?.type;

  const { mutateAsync: deleteBoard, isPending: isBoardDeleting } = useDeleteBoard(id);

  const { deleteColumn, removeTaskFromColumn } = useColumnStore();
  const { deleteTask, getTasksByColumnId } = useTaskStore();

  const isOpen = activeModal === 'delete-confirm' && !!deleteConfirmData;

  const handleConfirm = async () => {
    if (!deleteConfirmData) return;

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
        // Use api to delete board and all related data, then refetch boards list
        // Delete all columns and tasks for this board
        // const columns = useColumnStore.getState().getColumnsByBoardId(id);
        // columns.forEach((col) => {
        //   const tasks = getTasksByColumnId(col.id);
        //   tasks.forEach((task) => deleteTask(task.id));
        //   deleteColumn(col.id);
        // });
        const [err] = await to(deleteBoard());
        if (err) return;
        navigate('/');
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
      isLoading={isBoardDeleting}
      onClose={closeDeleteConfirm}
      onConfirm={handleConfirm}
      title={`Delete ${typeLabel}`}
      message={`Are you sure you want to delete "${deleteConfirmData.title}"? This action cannot be undone.`}
      confirmText="Delete"
      variant="danger"
    />
  );
}
