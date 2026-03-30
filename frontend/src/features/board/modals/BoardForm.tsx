import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import to from 'await-to-js';
import { useQueryClient } from '@tanstack/react-query';

import { Modal, Button, Input, Textarea } from '@/components/ui';
import { boardKey, useBoardStore, useGetBoardById } from '@/features/board';
import { useUIStore } from '@/features/ui';
import { boardPath } from '@/routes';

import { useCreateBoard } from '../useCreateBoard';

interface BoardFormProps {
  isOpen: boolean;
  onClose: () => void;
  boardId?: string | null;
}

export function BoardForm({ isOpen, onClose, boardId }: BoardFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: boardData } = useGetBoardById(boardId ?? '');
  const existingBoard = boardId ? boardData : undefined;
  const { activeModal } = useUIStore();

  const { mutateAsync: createBoard } = useCreateBoard();
  const { updateBoard } = useBoardStore();
  const { openDeleteConfirm } = useUIStore();

  const isEditing = !!existingBoard && activeModal === 'edit-board';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      setTitle(existingBoard?.title ?? '');
      setDescription(existingBoard?.description ?? '');
    }
  }, [isOpen, existingBoard]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    if (isEditing && existingBoard) {
      updateBoard(existingBoard.id, {
        title: title.trim(),
        description: description.trim(),
      });
    } else {
      const [err, newBoard] = await to(
        createBoard({
          title: title.trim(),
          description: description.trim(),
        }),
      );
      if (err) return;
      // refetch queries to get new board in list
      // maybe we can optimize this later by just adding the new board to the cache instead of refetching everything
      queryClient.invalidateQueries({
        queryKey: boardKey.all,
      });

      // Navigate to the new board
      navigate(boardPath(newBoard.id));
    }

    onClose();
  };

  const handleDelete = () => {
    if (existingBoard) {
      openDeleteConfirm('board', existingBoard.id, existingBoard.title);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Board' : 'Create Board'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="board-title"
          label="Board Name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Marketing Campaign"
          required
        />

        <Textarea
          id="board-description"
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this board for?"
          rows={3}
        />

        {/* Actions */}
        <div className="flex justify-between pt-4">
          {isEditing ? (
            <Button type="button" variant="danger" onClick={handleDelete}>
              Delete Board
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              {isEditing ? 'Save Changes' : 'Create Board'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
