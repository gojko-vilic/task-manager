export const ROUTES = {
  HOME: '/',
  BOARD: '/boards/:boardId',
} as const;

/** Type-safe path builder for board routes */
export function boardPath(boardId: string): string {
  return `/boards/${boardId}`;
}
