import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Leaf,
  BookOpen,
  Pill,
  Library,
  Menu,
  X,
  ChevronRight,
  Utensils,
  Moon,
  FileText,
  Sparkles,
  Sun,
  MapPin,
  Heart,
  Stethoscope,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { getCurrentSeason } from '../utils/date';

const SEASON_COLORS: Record<string, string> = {
  春: 'text-green-500',
  夏: 'text-red-500',
  秋: 'text-amber-500',
  冬: 'text-blue-500',
};

const SEASON_NAMES: Record<string, string> = {
  春: '春季',
  夏: '夏季',
  秋: '秋季',
  冬: '冬季',
};

const menuItems = [
  {
    path: '/',
    label: '仪表盘',
    icon: LayoutDashboard,
  },
  {
    path: '/assessment',
    label: '体质评估',
    icon: ClipboardList,
  },
  {
    path: '/advice',
    label: '养生建议',
    icon: Leaf,
    children: [
      { path: '/advice', label: '个性化建议', icon: Sparkles },
      { path: '/advice/seasonal', label: '季节养生', icon: Sun },
      { path: '/advice/acupoints', label: '穴位推荐', icon: MapPin },
    ],
  },
  {
    path: '/records',
    label: '日常记录',
    icon: BookOpen,
    children: [
      { path: '/records/diet', label: '饮食日志', icon: Utensils },
      { path: '/records/sleep', label: '睡眠精力', icon: Moon },
      { path: '/records/symptoms', label: '症状日记', icon: FileText },
    ],
  },
  {
    path: '/medicine',
    label: '中药食疗',
    icon: Pill,
    children: [
      { path: '/medicine', label: '用药管理', icon: Stethoscope },
      { path: '/medicine/foods', label: '食材收藏', icon: Heart },
    ],
  },
  {
    path: '/knowledge',
    label: '知识库',
    icon: Library,
  },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['/advice', '/records', '/medicine']);
  const location = useLocation();
  const season = getCurrentSeason();

  const toggleMenu = (path: string) => {
    setExpandedMenus((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  const getCurrentPageTitle = () => {
    for (const item of menuItems) {
      if (item.path === location.pathname) {
        return item.label;
      }
      if (item.children) {
        const child = item.children.find((c) => c.path === location.pathname);
        if (child) {
          return `${item.label} - ${child.label}`;
        }
      }
    }
    return '中医体质管理系统';
  };

  const isPathActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-64 transform bg-primary text-white transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-primary-700 px-6">
          <h1 className="text-xl font-bold tracking-wider text-white">
            中医体质管理
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white hover:text-secondary lg:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          {menuItems.map((item) => (
            <div key={item.path} className="mb-1">
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.path)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-colors',
                      isPathActive(item.path)
                        ? 'bg-secondary/20 text-white'
                        : 'text-white/80 hover:bg-primary-700'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight
                      className={cn(
                        'h-4 w-4 transition-transform',
                        expandedMenus.includes(item.path) && 'rotate-90'
                      )}
                    />
                  </button>
                  {expandedMenus.includes(item.path) && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          onClick={() => setSidebarOpen(false)}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center gap-3 rounded-lg px-4 py-2 text-sm transition-colors',
                              isActive
                                ? 'bg-secondary text-white'
                                : 'text-white/70 hover:bg-primary-700 hover:text-white'
                            )
                          }
                        >
                          <child.icon className="h-4 w-4" />
                          <span>{child.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-4 py-3 transition-colors',
                      isActive
                        ? 'bg-secondary text-white'
                        : 'text-white/80 hover:bg-primary-700'
                    )
                  }
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              )}
            </div>
          ))}
        </nav>
      </aside>

      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 hover:text-primary lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-lg font-semibold text-gray-800">
              {getCurrentPageTitle()}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
              <span className={cn('text-sm font-medium', SEASON_COLORS[season])}>
                {SEASON_NAMES[season]}养生
              </span>
            </div>
          </div>
        </header>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
