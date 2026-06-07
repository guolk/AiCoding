import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import Home from '@/pages/Home';
import Routes from '@/pages/Routes';
import RouteDetail from '@/pages/RouteDetail';
import Records from '@/pages/Records';
import Community from '@/pages/Community';
import Profile from '@/pages/Profile';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/routes',
        element: <Routes />,
      },
      {
        path: '/routes/:id',
        element: <RouteDetail />,
      },
      {
        path: '/records',
        element: <Records />,
      },
      {
        path: '/community',
        element: <Community />,
      },
      {
        path: '/profile',
        element: <Profile />,
      },
    ],
  },
]);
