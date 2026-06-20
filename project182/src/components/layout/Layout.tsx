import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { cn } from '@/lib/utils';

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-ivory dark:bg-warmGray-950">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <Header sidebarCollapsed={sidebarCollapsed} />
      <main
        className={cn(
          'pt-16 min-h-screen transition-all duration-300',
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        )}
      >
        <div className="p-6 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
