import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Calendar, 
  LineChart, 
  Wind, 
  Menu, 
  X,
  Leaf
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { to: '/', label: '首页', icon: <Home size={20} /> },
  { to: '/poses', label: '体式库', icon: <BookOpen size={20} /> },
  { to: '/sequences', label: '课程', icon: <Calendar size={20} /> },
  { to: '/practice', label: '练习追踪', icon: <LineChart size={20} /> },
  { to: '/meditation', label: '冥想呼吸', icon: <Wind size={20} /> },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={cn(
        'fixed left-0 top-0 h-full w-64 bg-white/80 backdrop-blur-lg border-r border-sage-100 z-50 transform transition-transform duration-300 md:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="p-6 flex items-center gap-3 border-b border-sage-100">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center">
            <Leaf size={24} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold text-sage-800">瑜伽行者</h1>
            <p className="text-xs text-sage-500">你的瑜伽之旅</p>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to || 
              (item.to !== '/' && location.pathname.startsWith(item.to));
            
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-sage-100 text-sage-800 font-medium'
                    : 'text-sage-700 hover:bg-sage-50 hover:text-sage-800'
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sage-100">
          <div className="bg-soft-gradient rounded-xl p-4">
            <p className="text-sm text-sage-700 font-medium mb-1">今日箴言</p>
            <p className="text-xs text-sage-600 italic">"瑜伽是身心的合一"</p>
          </div>
        </div>
      </aside>
    </>
  );
};

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-lg border-b border-sage-100 z-30 md:hidden flex items-center justify-between px-4">
      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg hover:bg-sage-50 transition-colors"
      >
        <Menu size={24} className="text-sage-700" />
      </button>
      <div className="flex items-center gap-2">
        <Leaf size={24} className="text-sage-500" />
        <span className="font-display text-lg font-semibold text-sage-800">瑜伽行者</span>
      </div>
      <div className="w-10" />
    </header>
  );
};

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-sage-50">
      <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="md:ml-64 min-h-screen">
        <div className="md:hidden h-16" />
        {children}
      </main>
    </div>
  );
};

export default Layout;
