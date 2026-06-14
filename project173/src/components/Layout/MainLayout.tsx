import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setMobileOpen(false);
    }
  }, [location.pathname]);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const handleMobileMenuOpen = () => {
    setMobileOpen(true);
  };

  const handleMobileMenuClose = () => {
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onMobileClose={handleMobileMenuClose}
      />

      <Header
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        onMobileMenuOpen={handleMobileMenuOpen}
      />

      <main
        className={cn(
          'pt-16 min-h-screen transition-all duration-300 ease',
          collapsed ? 'lg:pl-16' : 'lg:pl-[260px]'
        )}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
