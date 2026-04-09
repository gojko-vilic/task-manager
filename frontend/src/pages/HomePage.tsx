import { Navigate } from 'react-router-dom';
import { useBoardStore, BoardForm } from '@/features/board';
import { useUIStore } from '@/features/ui';
import { DeleteConfirmModal } from '@/components/modals';
import { EmptyState, Button } from '@/components/ui';
import { boardPath } from '@/routes';

export function HomePage() {
  const { boards } = useBoardStore();
  const { activeModal, editingBoardId, closeModal, openModal } = useUIStore();

  const hasBoards = boards.length > 0;

  // Redirect to first board if one exists
  if (hasBoards) {
    return <Navigate to={boardPath(boards[0].id)} replace />;
  }

  return (
    <>
      <div className="flex items-center justify-center h-full">
        <EmptyState
          title="No Boards Yet"
          description="Create your first board to start organizing your tasks."
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
              />
            </svg>
          }
          action={
            <Button onClick={() => openModal('create-board')}>Create Your First Board</Button>
          }
        />
      </div>

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
