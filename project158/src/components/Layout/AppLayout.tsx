import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MainContent from './MainContent';
import { cn } from '@/lib/utils';

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-800">
      <Sidebar collapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />
      <div className={cn(
        'flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
      )}>
        <Header sidebarCollapsed={sidebarCollapsed} />
        <MainContent>
          <Outlet />
        </MainContent>
      </div>
    </div>
  );
}
