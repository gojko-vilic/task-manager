import { useQuery } from '@tanstack/react-query';

import { taskKey } from './task.query-keys';
import { taskRepo } from './task.repo';

export const useGetTask = (taskId: string | null) => {
  return useQuery({
    queryKey: taskKey.detail(taskId ?? ''),
    queryFn: () => taskRepo.getTaskById(taskId!),
    enabled: !!taskId,
  });
};
