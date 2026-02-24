import { useParams } from 'react-router-dom';
import { useBoardStore } from '@/features/board';
import { useUIStore } from '@/features/ui';
import { useTaskStore } from '@/features/task';
import { Input } from '@/components/ui';

export function Header() {
  const { boardId } = useParams<{ boardId: string }>();
  const { getBoardById } = useBoardStore();
  const { toggleSidebar, sidebarOpen, openModal } = useUIStore();
  const { filters, setFilters } = useTaskStore();

  const activeBoard = boardId ? getBoardById(boardId) : null;

  return (
    <header className="h-20 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 flex items-center justify-between px-6 lg:px-8 shadow-sm">
      {/* Left Section */}
      <div className="flex items-center gap-6">
        {/* Sidebar Toggle */}
        <button
          onClick={toggleSidebar}
          className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {sidebarOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Board Title */}
        {activeBoard && (
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">{activeBoard.title}</h2>
            <button
              onClick={() => {
                useUIStore.getState().setEditingBoard(activeBoard.id);
                openModal('edit-board');
              }}
              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              aria-label="Edit board"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-5">
        {/* Search */}
        <div className="hidden md:block w-72">
          <Input
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="h-11 rounded-xl border-gray-200 bg-gray-50 focus:bg-white"
          />
        </div>

        {/* Add Task Button (when board is selected) */}
        {activeBoard && (
          <button
            onClick={() => openModal('create-task')}
            className="flex items-center gap-2.5 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-sm shadow-indigo-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="hidden sm:inline">Add Task</span>
          </button>
        )}
      </div>
    </header>
  );
}
