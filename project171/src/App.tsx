import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Donations from '@/pages/Donations';
import Institutions from '@/pages/Institutions';
import InstitutionDetail from '@/pages/InstitutionDetail';
import Participation from '@/pages/Participation';
import Tracking from '@/pages/Tracking';
import AnnualReport from '@/pages/AnnualReport';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'donations', element: <Donations /> },
      { path: 'institutions', element: <Institutions /> },
      { path: 'institutions/:id', element: <InstitutionDetail /> },
      { path: 'participation', element: <Participation /> },
      { path: 'tracking', element: <Tracking /> },
      { path: 'report', element: <AnnualReport /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
