import { useAppStore } from './store/appStore';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import ContactList from './pages/ContactList';
import ContactDetail from './pages/ContactDetail';
import GiftIdeas from './pages/GiftIdeas';
import PurchasePlans from './pages/PurchasePlans';
import GiftTracking from './pages/GiftTracking';
import BudgetAnalysis from './pages/BudgetAnalysis';

export default function App() {
  const { currentPage, selectedContactId } = useAppStore();

  const renderPage = () => {
    if (currentPage === 'contact-detail' && selectedContactId) {
      return <ContactDetail />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'contacts':
        return <ContactList />;
      case 'gift-ideas':
        return <GiftIdeas />;
      case 'purchase-plans':
        return <PurchasePlans />;
      case 'gift-tracking':
        return <GiftTracking />;
      case 'budget-analysis':
        return <BudgetAnalysis />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-warm-50">
      <Sidebar />
      <main className="ml-64 p-8 min-h-screen">
        {renderPage()}
      </main>
    </div>
  );
}
