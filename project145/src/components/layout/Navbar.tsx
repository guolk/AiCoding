import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Clock,
  Target,
  BarChart3,
  Lightbulb,
  Smartphone,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { path: '/', label: '仪表板', icon: LayoutDashboard },
  { path: '/tracking', label: '使用追踪', icon: Clock },
  { path: '/goals', label: '目标设定', icon: Target },
  { path: '/impact', label: '影响分析', icon: BarChart3 },
  { path: '/alternatives', label: '替代方案', icon: Lightbulb },
];

export function Navbar() {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 glass border-b border-slate-200/50 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:scale-105 transition-transform duration-300">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-semibold text-slate-900">数字健康</h1>
              <p className="text-xs text-slate-500 -mt-0.5">有意识地使用手机</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-primary-500 to-emerald-500 text-white shadow-lg shadow-primary-500/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="md:hidden flex items-center gap-1 overflow-x-auto scrollbar-hide w-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 min-w-[60px]',
                    isActive
                      ? 'bg-gradient-to-br from-primary-500 to-emerald-500 text-white shadow-lg shadow-primary-500/25'
                      : 'text-slate-500 hover:text-slate-800'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
