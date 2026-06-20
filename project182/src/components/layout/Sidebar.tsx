import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarHeart,
  Users,
  Building,
  Wallet,
  Gift,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubMenuItem {
  label: string;
  path: string;
}

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  children?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  {
    label: '仪表盘',
    icon: LayoutDashboard,
    path: '/',
  },
  {
    label: '活动策划',
    icon: CalendarHeart,
    path: '/planning',
    children: [
      { label: '策划文档', path: '/planning' },
      { label: '日程排期', path: '/planning/schedule' },
      { label: '版本管理', path: '/planning/versions' },
    ],
  },
  {
    label: '宾客管理',
    icon: Users,
    path: '/guests',
    children: [
      { label: '宾客名单', path: '/guests' },
      { label: '桌位安排', path: '/guests/seating' },
      { label: '请柬追踪', path: '/guests/invitations' },
    ],
  },
  {
    label: '供应商',
    icon: Building,
    path: '/vendors',
    children: [
      { label: '供应商列表', path: '/vendors' },
      { label: '比价记录', path: '/vendors/comparison' },
    ],
  },
  {
    label: '预算控制',
    icon: Wallet,
    path: '/budget',
  },
  {
    label: '后续管理',
    icon: Gift,
    path: '/post-event',
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['/planning', '/guests', '/vendors']);

  const toggleMenu = (path: string) => {
    setExpandedMenus((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  const isChildActive = (item: MenuItem) => {
    if (!item.children) return false;
    return item.children.some((child) => location.pathname === child.path);
  };

  const isParentActive = (item: MenuItem) => {
    if (location.pathname === item.path && !item.children) return true;
    if (item.children && isChildActive(item)) return true;
    return false;
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-white dark:bg-warmGray-900 border-r border-warmGray-200 dark:border-warmGray-800 transition-all duration-300 z-40',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-warmGray-200 dark:border-warmGray-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-lg font-semibold text-warmGray-900 dark:text-white">
              婚礼管家
            </span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center mx-auto">
            <Gift className="w-5 h-5 text-white" />
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-warmGray-100 dark:hover:bg-warmGray-800 transition-colors"
        >
          {collapsed ? (
            <Menu className="w-5 h-5 text-warmGray-600 dark:text-warmGray-400" />
          ) : (
            <X className="w-5 h-5 text-warmGray-600 dark:text-warmGray-400" />
          )}
        </button>
      </div>

      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = isParentActive(item);
          const isExpanded = expandedMenus.includes(item.path);
          const hasChildren = item.children && item.children.length > 0;

          return (
            <div key={item.path} className="space-y-1">
              {hasChildren ? (
                <button
                  onClick={() => toggleMenu(item.path)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'text-warmGray-600 dark:text-warmGray-400 hover:bg-warmGray-100 dark:hover:bg-warmGray-800'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 flex-shrink-0',
                      isActive ? 'text-primary-500 dark:text-primary-400' : ''
                    )}
                  />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left font-medium">{item.label}</span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </>
                  )}
                </button>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive: linkActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                      linkActive
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                        : 'text-warmGray-600 dark:text-warmGray-400 hover:bg-warmGray-100 dark:hover:bg-warmGray-800'
                    )
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </NavLink>
              )}

              {hasChildren && isExpanded && !collapsed && (
                <div className="ml-8 space-y-1 mt-1 animate-slide-down">
                  {item.children!.map((child) => (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      className={({ isActive: linkActive }) =>
                        cn(
                          'block px-3 py-2 rounded-lg text-sm transition-all duration-200',
                          linkActive
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                            : 'text-warmGray-500 dark:text-warmGray-500 hover:bg-warmGray-100 dark:hover:bg-warmGray-800 hover:text-warmGray-700 dark:hover:text-warmGray-300'
                        )
                      }
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
