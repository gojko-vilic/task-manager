import { useBoardStore, useUIStore } from '@/stores';
import { Button } from '@/components/ui';
import { cn } from '@/utils';

export function Sidebar() {
  const { boards, activeBoardId, setActiveBoard } = useBoardStore();
  const { sidebarOpen, openModal } = useUIStore();

  const handleCreateBoard = () => {
    openModal('create-board');
  };

  return (
    <aside
      className={cn(
        'h-full bg-gray-900 text-white transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-0 overflow-hidden',
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="px-6 py-4 border-b border-gray-700">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <svg
              className="w-6 h-6 text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            TaskFlow
          </h1>
        </div>

        {/* Boards List */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              All Boards ({boards.length})
            </span>
          </div>

          <nav className="space-y-1 px-2">
            {boards.map((board) => (
              <button
                key={board.id}
                onClick={() => setActiveBoard(board.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors',
                  activeBoardId === board.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800',
                )}
              >
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                  />
                </svg>
                <span className="truncate">{board.title}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Create Board Button */}
        <div className="p-4 border-t border-gray-700">
          <Button
            onClick={handleCreateBoard}
            variant="ghost"
            className="w-full justify-start text-indigo-400 hover:text-indigo-300 hover:bg-gray-800"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create New Board
          </Button>
        </div>
      </div>
    </aside>
  );
}
