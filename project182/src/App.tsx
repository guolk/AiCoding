import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import EventPlanning from '@/pages/EventPlanning';
import EventSchedule from '@/pages/EventSchedule';
import PlanVersions from '@/pages/PlanVersions';
import GuestManagement from '@/pages/GuestManagement';
import SeatingArrangement from '@/pages/SeatingArrangement';
import InvitationTracking from '@/pages/InvitationTracking';
import VendorManagement from '@/pages/VendorManagement';
import VendorComparison from '@/pages/VendorComparison';
import BudgetControl from '@/pages/BudgetControl';
import PostEventManagement from '@/pages/PostEventManagement';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <Dashboard />,
      },
      {
        path: 'planning',
        children: [
          {
            path: '',
            element: <EventPlanning />,
          },
          {
            path: 'schedule',
            element: <EventSchedule />,
          },
          {
            path: 'versions',
            element: <PlanVersions />,
          },
        ],
      },
      {
        path: 'guests',
        children: [
          {
            path: '',
            element: <GuestManagement />,
          },
          {
            path: 'seating',
            element: <SeatingArrangement />,
          },
          {
            path: 'invitations',
            element: <InvitationTracking />,
          },
        ],
      },
      {
        path: 'vendors',
        children: [
          {
            path: '',
            element: <VendorManagement />,
          },
          {
            path: 'comparison',
            element: <VendorComparison />,
          },
        ],
      },
      {
        path: 'budget',
        element: <BudgetControl />,
      },
      {
        path: 'post-event',
        element: <PostEventManagement />,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
