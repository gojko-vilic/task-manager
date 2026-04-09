import { useQuery } from '@tanstack/react-query';

import { boardKey } from './board.query-keys';
import { boardRepo } from './board.repo';

export const useGetAllBoards = () => {
  return useQuery({
    queryKey: boardKey.all,
    queryFn: () => boardRepo.getAllBoards(),
  });
};
