import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, BookOpen, LineChart, Palette, Settings } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: '首页仪表板', emoji: '🏠' },
  { path: '/students', icon: Users, label: '学生管理', emoji: '👨‍🎨' },
  { path: '/courses', icon: BookOpen, label: '课程记录', emoji: '📚' },
  { path: '/tracking', icon: LineChart, label: '发展追踪', emoji: '📈' },
  { path: '/exhibitions', icon: Palette, label: '展览成果', emoji: '🏆' },
];

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-white/80 backdrop-blur-sm shadow-soft h-screen fixed left-0 top-0 p-4 flex flex-col">
      <div className="flex items-center gap-3 px-4 py-6 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-warm flex items-center justify-center text-2xl shadow-soft">
          🎨
        </div>
        <div>
          <h1 className="font-display text-xl text-primary-700">童画世界</h1>
          <p className="text-xs text-gray-500">美术教育追踪系统</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item, index) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="text-xl">{item.emoji}</span>
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-50 to-secondary-50">
          <div className="w-10 h-10 rounded-full bg-gradient-warm flex items-center justify-center text-white font-bold">
            李
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">李老师</p>
            <p className="text-xs text-gray-500 truncate">美术教研组组长</p>
          </div>
          <Settings size={18} className="text-gray-400" />
        </div>
      </div>
    </aside>
  );
}
