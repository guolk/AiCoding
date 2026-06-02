import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  FileText,
  Users,
  Mic,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Trophy,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { path: '/', label: '首页', icon: <Home size={20} /> },
  { path: '/scripts', label: '解说稿管理', icon: <FileText size={20} /> },
  { path: '/teams', label: '球队资料库', icon: <Trophy size={20} /> },
  { path: '/players', label: '球员资料库', icon: <Users size={20} /> },
  { path: '/reviews', label: '解说复盘', icon: <Mic size={20} /> },
  { path: '/reviews/skills', label: '技巧改进', icon: <Trophy size={20} /> },
  { path: '/schedule', label: '排班日历', icon: <Calendar size={20} /> },
  { path: '/schedule/prep', label: '赛前准备', icon: <FileText size={20} /> },
  { path: '/commentators', label: '解说员档案', icon: <User size={20} /> }
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 z-50 flex flex-col',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-slate-700">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <Mic size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg">解说管理</h1>
              <p className="text-xs text-slate-400">Commentary Hub</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 mx-auto rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <Mic size={20} />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                  : 'hover:bg-slate-700/50 text-slate-300 hover:text-white'
              )}
            >
              <span className={cn(
                'transition-transform',
                isActive ? 'scale-110' : 'group-hover:scale-110'
              )}>
                {item.icon}
              </span>
              {!collapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-slate-700">
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                张
              </div>
              <div>
                <p className="font-medium text-sm">张指导</p>
                <p className="text-xs text-slate-400">在线</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
