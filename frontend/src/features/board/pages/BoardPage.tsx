import { useParams } from 'react-router-dom';

import { BoardView } from '@/features/board';
import { TaskForm } from '@/features/task';
import { useUIStore } from '@/features/ui';
import { DeleteConfirmModal } from '@/components/modals';
import { BoardForm } from '@/features/board';
import { EmptyState, LoadingSpinner } from '@/components/ui';
import { useGetBoardById } from '../useGetBoardById';

export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const { data: board, isLoading: isBoardLoading } = useGetBoardById(boardId!);
  const { activeModal, activeTaskId, editingBoardId, closeModal } = useUIStore();

  if (isBoardLoading) {
    return <LoadingSpinner />;
  }

  if (!boardId || !board) {
    return (
      <div className="flex items-center justify-center h-full">
        <EmptyState
          title="Board Not Found"
          description="This board doesn't exist or may have been deleted."
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
      </div>
    );
  }

  return (
    <>
      <BoardView board={board} boardId={boardId} />

      {/* Task Modal */}
      <TaskForm
        isOpen={activeModal === 'create-task' || activeModal === 'edit-task'}
        onClose={closeModal}
        taskId={activeTaskId}
        columns={board.columns}
      />

      {/* Board Modal */}
      <BoardForm
        isOpen={activeModal === 'create-board' || activeModal === 'edit-board'}
        onClose={() => {
          closeModal();
          useUIStore.getState().setEditingBoard(null);
        }}
        boardId={editingBoardId}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal />
    </>
  );
}
