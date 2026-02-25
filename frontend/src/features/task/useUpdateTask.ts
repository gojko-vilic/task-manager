import { useMutation, useQueryClient } from '@tanstack/react-query';

import { taskKey } from './task.query-keys';
import { taskRepo } from './task.repo';
import type { Task } from './task.types';

interface UpdateTaskVariables {
  id: string;
  updates: Partial<Task>;
}

export const useUpdateTask = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: UpdateTaskVariables) => taskRepo.updateTask(id, updates),
    onError: (_err, { id, updates }) => {
      // Roll back the optimistic cache update if the API call fails
      queryClient.setQueryData<Task[]>(taskKey.list({ boardId }), (old) =>
        old?.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      );
      console.error('Failed to update task, rolling back');
    },
  });
};
