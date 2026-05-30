import {
  Grid3X3,
  Menu,
  LayoutDashboard,
  Grid3X3 as GridIcon,
  FolderKanban,
  Package,
  BookOpen,
  Settings,
  X
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: '仪表板', icon: LayoutDashboard },
  { path: '/patterns', label: '图案', icon: GridIcon },
  { path: '/projects', label: '项目', icon: FolderKanban },
  { path: '/materials', label: '材料', icon: Package },
  { path: '/learning', label: '学习', icon: BookOpen },
  { path: '/settings', label: '设置', icon: Settings }
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  const currentPage = navItems.find(item => 
    item.path === '/' 
      ? location.pathname === '/' 
      : location.pathname.startsWith(item.path)
  );

  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
            <Grid3X3 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900">织梦工坊</h1>
            {currentPage && (
              <p className="text-xs text-gray-500">{currentPage.label}</p>
            )}
          </div>
        </div>
        
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-600" />
          ) : (
            <Menu className="w-6 h-6 text-gray-600" />
          )}
        </button>
      </header>
      
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <nav className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-xl p-6 space-y-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                <Grid3X3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">织梦工坊</h1>
                <p className="text-xs text-gray-500">织物设计管理</p>
              </div>
            </div>
            
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
