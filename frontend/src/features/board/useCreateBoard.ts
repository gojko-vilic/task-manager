import { useMutation } from '@tanstack/react-query';

import type { CreateBoardPayload } from './types';
import { boardRepo } from './board.repo';

export const useCreateBoard = () => {
  return useMutation({
    mutationFn: (boardPayload: CreateBoardPayload) => boardRepo.createBoard(boardPayload),
    onSuccess: (data) => {
      // Here you could show a toast notification or update local state
      console.log('Board created successfully:', data);
    },
    onError: (error) => {
      // Here you could show a toast notification
      console.error('Error creating board:', error);
    },
  });
};
