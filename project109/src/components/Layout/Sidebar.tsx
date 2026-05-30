import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Scale,
  Users,
  Home,
  Phone,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

interface MenuItem {
  title: string;
  icon: React.ElementType;
  path: string;
}

const menuItems: MenuItem[] = [
  { title: '仪表板', icon: LayoutDashboard, path: '/' },
  { title: '证件管理', icon: FileText, path: '/documents' },
  { title: '法律文件', icon: Scale, path: '/legal' },
  { title: '家庭文件', icon: Users, path: '/family' },
  { title: '财产文件', icon: Home, path: '/property' },
  { title: '紧急信息', icon: Phone, path: '/emergency' },
  { title: '设置', icon: Settings, path: '/settings' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <aside
      className={cn(
        'flex flex-col bg-primary-900 text-white transition-all duration-300 ease-in-out',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className='flex h-16 items-center justify-between px-4 border-b border-primary-800'>
        {!collapsed && (
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 rounded-lg bg-accent-500 flex items-center justify-center'>
              <FileText className='w-5 h-5 text-primary-900' />
            </div>
            <span className='font-semibold text-lg text-white'>FamilyVault</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            'p-2 rounded-lg hover:bg-primary-800 transition-colors',
            collapsed && 'mx-auto'
          )}
          aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          {collapsed ? (
            <ChevronRight className='w-5 h-5 text-gray-300' />
          ) : (
            <ChevronLeft className='w-5 h-5 text-gray-300' />
          )}
        </button>
      </div>

      <nav className='flex-1 overflow-y-auto py-4'>
        <ul className='space-y-1 px-3'>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-accent-500 text-primary-900 font-medium'
                      : 'text-gray-300 hover:bg-primary-800 hover:text-white',
                    collapsed && 'justify-center px-2'
                  )}
                >
                  <Icon className='w-5 h-5 flex-shrink-0' />
                  {!collapsed && <span className='text-sm'>{item.title}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className='p-4 border-t border-primary-800'>
        {!collapsed && (
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center'>
              <Users className='w-4 h-4 text-gray-300' />
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-white truncate'>用户</p>
              <p className='text-xs text-gray-400 truncate'>user@example.com</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className='w-8 h-8 mx-auto rounded-full bg-primary-700 flex items-center justify-center'>
            <Users className='w-4 h-4 text-gray-300' />
          </div>
        )}
      </div>
    </aside>
  );
}
