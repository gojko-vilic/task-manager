import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { useColumnStore, useBoardStore } from '@/stores';

interface AddColumnButtonProps {
  boardId: string;
}

export function AddColumnButton({ boardId }: AddColumnButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const { addColumn } = useColumnStore();
  const { addColumnToBoard } = useBoardStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      const newColumn = addColumn({ title: title.trim(), boardId });
      addColumnToBoard(boardId, newColumn.id);
      setTitle('');
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setIsAdding(false);
  };

  if (isAdding) {
    return (
      <div className="flex-shrink-0 w-80 bg-gray-100/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter column title..."
            className="h-11 rounded-xl"
            autoFocus
          />
          <div className="flex gap-3">
            <Button type="submit" size="sm" disabled={!title.trim()} className="rounded-lg">
              Add Column
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="rounded-lg"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsAdding(true)}
      className="flex-shrink-0 w-80 min-h-[120px] bg-gray-100/50 hover:bg-gray-100 border-2 border-dashed border-gray-300 hover:border-indigo-300 rounded-2xl flex flex-col items-center justify-center gap-3 text-gray-500 hover:text-indigo-600 transition-all duration-200"
    >
      <div className="w-12 h-12 rounded-xl bg-gray-200/80 flex items-center justify-center">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <span className="font-medium">Add Column</span>
    </button>
  );
}
