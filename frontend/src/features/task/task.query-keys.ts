export const taskKey = {
  all: ['tasks'] as const,
  lists: () => [...taskKey.all, 'list'] as const,
  list: (params?: object) => [...taskKey.lists(), { params }] as const,
  detail: (id: string) => [...taskKey.all, 'detail', id] as const,
};
