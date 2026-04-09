import { useQuery } from '@tanstack/react-query';

import { taskKey } from './task.query-keys';
import { taskRepo } from './task.repo';

export const useGetTasks = (boardId: string) => {
  return useQuery({
    queryKey: taskKey.list({ boardId }),
    queryFn: () => taskRepo.getTasks(boardId),
    // you can add options like refetchOnWindowFocus, staleTime, etc. here
  });
};
