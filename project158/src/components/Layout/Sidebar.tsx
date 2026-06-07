import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Map, Receipt, FileText, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

const menuItems: MenuItem[] = [
  { path: '/', label: '仪表盘', icon: Home },
  { path: '/itinerary', label: '行程规划', icon: Map },
  { path: '/expense', label: '费用记录', icon: Receipt },
  { path: '/reimbursement', label: '报销管理', icon: FileText },
  { path: '/analysis', label: '数据分析', icon: BarChart3 },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  return (
    <>
      <aside
        className={cn(
          'fixed left-0 top-0 h-full transition-all duration-300 ease-in-out z-40',
          'bg-white dark:bg-neutral-700 border-r border-neutral-200 dark:border-neutral-600',
          'hidden md:flex flex-col',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200 dark:border-neutral-600">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">BT</span>
            </div>
            <span className="font-semibold text-lg text-neutral-700 dark:text-white">
              差旅管理
            </span>
          </div>
          )}
          {collapsed && (
            <div className="w-full flex justify-center">
              <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">BT</span>
              </div>
            </div>
          )}
          <button
            onClick={onToggle}
            className={cn(
              'p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors',
              collapsed && 'absolute -right-3 top-5 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-full'
            )}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-neutral-500 dark:text-neutral-300" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-neutral-500 dark:text-neutral-300" />
            )}
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <button
                key={item.path}
                onClick={() => handleMenuClick(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  'group relative',
                  isActive
                    ? 'bg-primary-500 text-white shadow-button'
                    : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-600',
                  collapsed && 'justify-center px-2'
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 flex-shrink-0 transition-transform duration-200',
                    isActive ? 'text-white' : 'text-neutral-500 dark:text-neutral-400 group-hover:text-primary-500 dark:group-hover:text-primary-400'
                  )}
                />
                {!collapsed && (
                  <span className="font-medium text-sm whitespace-nowrap">
                    {item.label}
                  </span>
                )}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-neutral-700 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-600">
            <div className="text-xs text-neutral-400 text-center">
              版本 1.0.0
            </div>
          </div>
        )}
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-neutral-700 border-t border-neutral-200 dark:border-neutral-600 md:hidden z-50">
        <div className="flex items-center justify-around h-full">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={`mobile-${item.path}`}
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors',
                  isActive
                    ? 'text-primary-500'
                    : 'text-neutral-500 dark:text-neutral-400'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}
