import { useQuery } from '@tanstack/react-query';

import { boardKey } from './board.query-keys';
import { boardRepo } from './board.repo';

export const useGetBoardById = (id: string) => {
  return useQuery({
    queryKey: boardKey.detail(id),
    queryFn: () => boardRepo.getBoardById(id),
    enabled: !!id, // Only run if id is truthy
  });
};
