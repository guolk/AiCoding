import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useYearlyReviewStore } from '@/store/useYearlyReviewStore';
import { Header } from '@/components/Layout/Header';
import { Sidebar } from '@/components/Layout/Sidebar';
import Dashboard from '@/pages/Dashboard';
import YearReview from '@/pages/YearReview';
import Gratitude from '@/pages/Gratitude';
import NewYearPlan from '@/pages/NewYearPlan';
import Visualize from '@/pages/Visualize';
import ExportCompare from '@/pages/ExportCompare';

export default function App() {
  const { init, isLoading } = useYearlyReviewStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    init();
  }, [init]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-warm-50">
        <Header 
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          isMobileMenuOpen={isMobileMenuOpen} 
        />
        <div className="flex">
          <Sidebar 
            isOpen={isMobileMenuOpen} 
            onClose={() => setIsMobileMenuOpen(false)} 
          />
          <main className="flex-1 min-h-[calc(100vh-4rem)]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/review/:year" element={<YearReview />} />
                <Route path="/gratitude/:year" element={<Gratitude />} />
                <Route path="/plan/:year" element={<NewYearPlan />} />
                <Route path="/visualize/:year" element={<Visualize />} />
                <Route path="/export/:year" element={<ExportCompare />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}
