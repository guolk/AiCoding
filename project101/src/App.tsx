import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import PropertyList from '@/pages/PropertyList';
import PropertyDetail from '@/pages/PropertyDetail';
import BookingCalendar from '@/pages/BookingCalendar';
import BookingList from '@/pages/BookingList';
import CustomerList from '@/pages/CustomerList';
import CustomerDetail from '@/pages/CustomerDetail';
import CleaningTasks from '@/pages/CleaningTasks';
import Inventory from '@/pages/Inventory';
import MaintenanceTasks from '@/pages/MaintenanceTasks';
import FinanceOverview from '@/pages/FinanceOverview';
import FinanceReport from '@/pages/FinanceReport';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/properties" element={<PropertyList />} />
          <Route path="/properties/new" element={<PropertyDetail />} />
          <Route path="/properties/:propertyId" element={<PropertyDetail />} />
          <Route path="/properties/:propertyId/edit" element={<PropertyDetail />} />
          <Route path="/bookings" element={<BookingCalendar />} />
          <Route path="/bookings/list" element={<BookingList />} />
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/customers/:customerId" element={<CustomerDetail />} />
          <Route path="/operations/cleaning" element={<CleaningTasks />} />
          <Route path="/operations/inventory" element={<Inventory />} />
          <Route path="/operations/maintenance" element={<MaintenanceTasks />} />
          <Route path="/finance" element={<FinanceOverview />} />
          <Route path="/finance/report" element={<FinanceReport />} />
        </Route>
      </Routes>
    </Router>
  );
}
