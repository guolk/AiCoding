import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAppStore } from '../../store';

export default function AppLayout() {
  const initData = useAppStore((state) => state.initData);
  const initialized = useAppStore((state) => state.initialized);

  useEffect(() => {
    if (!initialized) {
      initData();
    }
  }, [initialized, initData]);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-ocean-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-ocean-200 border-t-ocean-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ocean-600 font-medium">正在加载数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-ocean-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
