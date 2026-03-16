import { useQuery } from '@tanstack/react-query';

import { boardKey } from './board.query-keys';
import { boardRepo } from './board.repo';

export const useGetAllBoards = (boardId: string) => {
  return useQuery({
    queryKey: boardKey.detail(boardId),
    queryFn: () => boardRepo.getBoardById(boardId),
  });
};
