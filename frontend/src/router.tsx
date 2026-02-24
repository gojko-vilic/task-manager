import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { HomePage } from '@/pages';
import { BoardPage } from '@/features/board/pages';
import { ROUTES } from './routes';

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: ROUTES.HOME, element: <HomePage /> },
      { path: ROUTES.BOARD, element: <BoardPage /> },
    ],
  },
]);
