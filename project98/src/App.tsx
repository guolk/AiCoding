import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Learning from './pages/Learning';
import Strategy from './pages/Strategy';
import Diary from './pages/Diary';
import Psychology from './pages/Psychology';
import Growth from './pages/Growth';

export default function App() {
  const [currentPage, setCurrentPage] = useState('');

  const renderPage = () => {
    switch (currentPage) {
      case 'learning':
        return <Learning />;
      case 'strategy':
        return <Strategy />;
      case 'diary':
        return <Diary />;
      case 'psychology':
        return <Psychology />;
      case 'growth':
        return <Growth />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="ml-64 min-h-screen">
        {renderPage()}
      </main>
    </div>
  );
}
