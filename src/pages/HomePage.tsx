import { useBoardStore } from '@/features/board';
import { useUIStore } from '@/features/ui';
import { MainLayout } from '@/components/layout';
import { BoardView } from '@/components/board';
import { TaskForm } from '@/components/task';
import { BoardForm, DeleteConfirmModal } from '@/components/modals';
import { EmptyState, Button } from '@/components/ui';

export function HomePage() {
  const { activeBoardId, boards } = useBoardStore();
  const { activeModal, activeTaskId, editingBoardId, closeModal, openModal } = useUIStore();

  const hasBoards = boards.length > 0;

  return (
    <MainLayout>
      {activeBoardId ? (
        <BoardView boardId={activeBoardId} />
      ) : (
        <div className="flex items-center justify-center h-full">
          <EmptyState
            title={hasBoards ? 'Select a Board' : 'No Boards Yet'}
            description={
              hasBoards
                ? 'Choose a board from the sidebar to get started.'
                : 'Create your first board to start organizing your tasks.'
            }
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
              !hasBoards && (
                <Button onClick={() => openModal('create-board')}>Create Your First Board</Button>
              )
            }
          />
        </div>
      )}

      {/* Task Modal */}
      <TaskForm
        isOpen={activeModal === 'create-task' || activeModal === 'edit-task'}
        onClose={closeModal}
        taskId={activeTaskId}
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
    </MainLayout>
  );
}
