import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Home, ChevronRight, Menu, X, RotateCcw } from 'lucide-react';
import Sidebar from './Sidebar';
import { useWeatherStore } from '@/store';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

const breadcrumbMap: Record<string, BreadcrumbItem[]> = {
  '/': [{ label: '数据总览' }],
  '/data/entry': [
    { label: '观测数据管理', path: '/data/list' },
    { label: '手动录入' },
  ],
  '/data/import': [
    { label: '观测数据管理', path: '/data/list' },
    { label: 'CSV导入' },
  ],
  '/data/list': [
    { label: '观测数据管理' },
    { label: '数据列表' },
  ],
  '/data/instruments': [
    { label: '观测数据管理' },
    { label: '仪器管理' },
  ],
  '/data/quality': [
    { label: '观测数据管理' },
    { label: '质量审核' },
  ],
  '/analysis/timeseries': [
    { label: '时序分析' },
    { label: '时间序列' },
  ],
  '/analysis/extremes': [
    { label: '时序分析' },
    { label: '极端天气' },
  ],
  '/analysis/trend': [
    { label: '时序分析' },
    { label: '气候倾向率' },
  ],
  '/statistics/summary': [
    { label: '气候统计' },
    { label: '统计摘要' },
  ],
  '/statistics/anomaly': [
    { label: '气候统计' },
    { label: '气候距平' },
  ],
  '/statistics/seasons': [
    { label: '气候统计' },
    { label: '季节划分' },
  ],
  '/charts/windrose': [
    { label: '图表中心' },
    { label: '风向玫瑰图' },
  ],
  '/charts/precipitation': [
    { label: '图表中心' },
    { label: '降水量图' },
  ],
  '/charts/temperature': [
    { label: '图表中心' },
    { label: '气温折线图' },
  ],
  '/charts/dualaxis': [
    { label: '图表中心' },
    { label: '温降双轴图' },
  ],
  '/charts/report': [
    { label: '图表中心' },
    { label: '报告生成' },
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const initData = useWeatherStore((state) => state.initData);
  const resetData = useWeatherStore((state) => state.resetData);

  useEffect(() => {
    initData();
  }, [initData]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const breadcrumbs = breadcrumbMap[location.pathname] || [{ label: '首页' }];

  const handleReset = () => {
    if (window.confirm('确定要重置所有数据吗？这将恢复到初始演示数据。')) {
      resetData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="lg:ml-64">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <nav className="flex items-center text-sm text-slate-500">
                <Home className="w-4 h-4" />
                {breadcrumbs.map((crumb, index) => (
                  <span key={index} className="flex items-center">
                    <ChevronRight className="w-4 h-4 mx-2" />
                    {crumb.path ? (
                      <span className="hover:text-primary-600 cursor-pointer">
                        {crumb.label}
                      </span>
                    ) : (
                      <span className="text-slate-700 font-medium">{crumb.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-slate-600">
                  {currentTime.toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                  })}
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  {currentTime.toLocaleTimeString('zh-CN')}
                </p>
              </div>
              <button
                onClick={handleReset}
                className="btn btn-secondary flex items-center gap-2 text-sm"
                title="重置为演示数据"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">重置数据</span>
              </button>
            </div>
          </div>
        </header>

        <main className="p-6">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>

      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-40 lg:hidden">
            <Sidebar />
          </div>
        </>
      )}
    </div>
  );
}
