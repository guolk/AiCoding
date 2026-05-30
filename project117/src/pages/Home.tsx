import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';

export default function Home() {
  return (
    <div className="flex min-h-screen bg-surface-500">
      <Sidebar />
      <main className="flex-1 min-h-screen pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
