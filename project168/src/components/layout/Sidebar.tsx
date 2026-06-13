import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Play, GraduationCap, Users, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', label: '仪表板', icon: Home },
  { to: '/games', label: '棋谱管理', icon: BookOpen },
  { to: '/games/replay', label: '棋局回放', icon: Play },
  { to: '/learning', label: '学习进度', icon: GraduationCap },
  { to: '/records', label: '对局记录', icon: Users },
];

export default function Sidebar() {
  return (
    <aside className="w-60 bg-go-wood-800 text-go-wood-50 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-go-wood-700">
        <h1 className="text-xl font-serif font-bold text-go-wood-50 flex items-center gap-2">
          <span className="text-2xl">⚫</span>
          围棋学习馆
        </h1>
        <p className="text-xs text-go-wood-200 mt-1">Go Learning Hub</p>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-go-wood-600 text-white shadow-md'
                  : 'text-go-wood-200 hover:bg-go-wood-700 hover:text-white'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-go-wood-700">
        <button className="flex items-center gap-3 px-4 py-2 w-full text-go-wood-200 hover:text-white hover:bg-go-wood-700 rounded-lg transition-colors text-sm">
          <Settings className="w-5 h-5" />
          设置
        </button>
      </div>
    </aside>
  );
}
