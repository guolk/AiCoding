import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  User,
  LogOut,
  Settings,
  Home,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectStore } from '@/store/projectStore';

interface HeaderProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onMobileMenuOpen: () => void;
}

interface BreadcrumbItem {
  label: string;
  path?: string;
}

const breadcrumbMap: Record<string, BreadcrumbItem> = {
  '': { label: '首页', path: '/' },
  projects: { label: '项目档案', path: '/projects' },
  progress: { label: '实施进度', path: '/progress' },
  effects: { label: '成效数据', path: '/effects' },
  issues: { label: '问题风险', path: '/issues' },
  info: { label: '基本信息' },
  targets: { label: '项目目标' },
  budget: { label: '资金分配' },
  milestones: { label: '实施进度' },
  'effect-data': { label: '成效数据' },
  'issues-risks': { label: '问题风险' },
};

export default function Header({ collapsed, onToggleCollapse, onMobileMenuOpen }: HeaderProps) {
  const location = useLocation();
  const currentProject = useProjectStore((state) =>
    state.currentProjectId ? state.getProjectById(state.currentProjectId) : undefined
  );
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ label: '首页', path: '/' }];

    let currentPath = '';

    pathParts.forEach((part, index) => {
      currentPath += `/${part}`;

      if (index === 1 && currentProject) {
        breadcrumbs.push({
          label: currentProject.name,
          path: `/projects/${currentProject.id}`,
        });
        return;
      }

      const item = breadcrumbMap[part];
      if (item) {
        breadcrumbs.push({
          ...item,
          path: item.path || currentPath,
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 bg-white shadow-sm z-30 transition-all duration-300 ease',
        collapsed ? 'lg:left-16' : 'lg:left-[260px]',
        'left-0'
      )}
    >
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMobileMenuOpen}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-300 ease"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 transition-colors duration-300 ease"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          <nav className="hidden md:flex items-center gap-1 text-sm">
            {breadcrumbs.map((item, index) => (
              <div key={index} className="flex items-center gap-1">
                {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                {item.path && index < breadcrumbs.length - 1 ? (
                  <Link
                    to={item.path}
                    className="text-gray-500 hover:text-primary-600 transition-colors duration-300 ease flex items-center gap-1"
                  >
                    {index === 0 && <Home className="w-4 h-4" />}
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-gray-800 font-medium">{item.label}</span>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <div className={cn(
            'relative transition-all duration-300 ease',
            showSearch ? 'w-64' : 'w-auto'
          )}>
            {showSearch ? (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索项目、问题..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 ease"
                  autoFocus
                  onBlur={() => setShowSearch(false)}
                />
              </div>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-300 ease"
              >
                <Search className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>

          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors duration-300 ease">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-300 ease"
            >
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-600" />
              </div>
              <ChevronDown className={cn(
                'w-4 h-4 text-gray-500 transition-transform duration-300 ease',
                showUserMenu && 'rotate-180'
              )} />
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800">系统管理员</p>
                    <p className="text-xs text-gray-500">admin@rural.gov</p>
                  </div>
                  <div className="py-1">
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-300 ease flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      系统设置
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-300 ease flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      退出登录
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
