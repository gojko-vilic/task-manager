export const boardKey = {
  all: ['boards'] as const,
  lists: () => [...boardKey.all, 'list'] as const,
  list: (params?: object) => [...boardKey.lists(), { params }] as const,
  detail: (id: string) => [...boardKey.all, 'detail', id] as const,
};
