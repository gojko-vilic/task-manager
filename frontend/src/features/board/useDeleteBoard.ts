import { useMutation } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';

import { boardKey } from './board.query-keys';

import { boardRepo } from './board.repo';
import type { Board } from './types';

export const useDeleteBoard = (boardId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await boardRepo.deleteBoard(boardId);
    },
    onSuccess: () => {
      queryClient.setQueryData<Board[]>(
        boardKey.all,
        (old) => old?.filter((b) => b.id !== boardId) ?? [],
      );
      // Also remove the individual board cache entry
      // queryClient.removeQueries({ queryKey: boardKey.detail(boardId) });
    },
  });
};
