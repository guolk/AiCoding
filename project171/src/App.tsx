import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Donations from '@/pages/Donations';
import Institutions from '@/pages/Institutions';
import InstitutionDetail from '@/pages/InstitutionDetail';
import VolunteerRecords from '@/pages/VolunteerRecords';
import ItemDonations from '@/pages/ItemDonations';
import OnlineActions from '@/pages/OnlineActions';
import ProjectProgress from '@/pages/ProjectProgress';
import ImpactEstimates from '@/pages/ImpactEstimates';
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
      { path: 'participation/volunteer', element: <VolunteerRecords /> },
      { path: 'participation/items', element: <ItemDonations /> },
      { path: 'participation/online', element: <OnlineActions /> },
      { path: 'tracking/progress', element: <ProjectProgress /> },
      { path: 'tracking/impact', element: <ImpactEstimates /> },
      { path: 'report', element: <AnnualReport /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
