import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Bills from './pages/Bills';
import Analysis from './pages/Analysis';
import Saving from './pages/Saving';
import Forecast from './pages/Forecast';
import Carbon from './pages/Carbon';

const pageConfig: Record<string, { title: string; subtitle?: string }> = {
  '/': { title: '仪表盘', subtitle: '您的家庭能源使用概览' },
  '/bills': { title: '账单管理', subtitle: '管理您的水电燃气账单' },
  '/analysis': { title: '消耗分析', subtitle: '深入分析您的能源使用' },
  '/saving': { title: '节能追踪', subtitle: '追踪节能措施和习惯' },
  '/forecast': { title: '费用预测', subtitle: '预测和规划您的能源支出' },
  '/carbon': { title: '碳足迹', subtitle: '了解您的碳排放和环保贡献' },
};

function AppContent() {
  const location = useLocation();
  const config = pageConfig[location.pathname] || { title: '能源管家', subtitle: '' };

  return (
    <div className="flex min-h-screen relative">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10">
        <Header title={config.title} subtitle={config.subtitle} />
        <main className="flex-1 p-8 relative">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/bills" element={<Bills />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/saving" element={<Saving />} />
            <Route path="/forecast" element={<Forecast />} />
            <Route path="/carbon" element={<Carbon />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
