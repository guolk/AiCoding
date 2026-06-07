import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import ItineraryList from '@/pages/Itinerary/List';
import ItineraryCreate from '@/pages/Itinerary/Create';
import ItineraryDetail from '@/pages/Itinerary/Detail';
import ItineraryOptimize from '@/pages/Itinerary/Optimize';
import ExpenseList from '@/pages/Expense/List';
import ExpenseCreate from '@/pages/Expense/Create';
import ReimbursementList from '@/pages/Reimbursement/List';
import ReimbursementCreate from '@/pages/Reimbursement/Create';
import ReimbursementDetail from '@/pages/Reimbursement/Detail';
import AnalysisTravel from '@/pages/Analysis/Travel';
import AnalysisExpense from '@/pages/Analysis/Expense';
import AnalysisEfficiency from '@/pages/Analysis/Efficiency';
import NotFound from '@/pages/NotFound';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'itinerary',
        children: [
          {
            index: true,
            element: <ItineraryList />,
          },
          {
            path: 'create',
            element: <ItineraryCreate />,
          },
          {
            path: ':id',
            element: <ItineraryDetail />,
          },
          {
            path: 'optimize',
            element: <ItineraryOptimize />,
          },
        ],
      },
      {
        path: 'expense',
        children: [
          {
            index: true,
            element: <ExpenseList />,
          },
          {
            path: 'create',
            element: <ExpenseCreate />,
          },
        ],
      },
      {
        path: 'reimbursement',
        children: [
          {
            index: true,
            element: <ReimbursementList />,
          },
          {
            path: 'create',
            element: <ReimbursementCreate />,
          },
          {
            path: ':id',
            element: <ReimbursementDetail />,
          },
        ],
      },
      {
        path: 'analysis',
        children: [
          {
            path: 'travel',
            element: <AnalysisTravel />,
          },
          {
            path: 'expense',
            element: <AnalysisExpense />,
          },
          {
            path: 'efficiency',
            element: <AnalysisEfficiency />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;
