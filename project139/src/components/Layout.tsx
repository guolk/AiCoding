import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';

export default function Layout() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-60 p-6 bg-[#F0F4F5] min-h-screen flex-1">
        <Outlet />
      </main>
    </div>
  );
}
