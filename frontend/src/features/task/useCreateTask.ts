import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateTask } from './task.types';
import { taskKey } from './task.query-keys';
import { taskRepo } from './task.repo';

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (task: CreateTask) => taskRepo.createTask(task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKey.lists() });
    },
    onError: (error) => {
      // here you could show a toast notification
      console.error('Error creating task:', error);
    },
  });
};
