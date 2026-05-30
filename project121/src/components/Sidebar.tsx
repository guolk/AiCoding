import { NavLink } from 'react-router-dom';
import {
  Home,
  Music,
  Disc3,
  BookOpen,
  Users,
  CalendarDays
} from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: '首页概览' },
  { path: '/works', icon: Music, label: '作品收藏' },
  { path: '/notes', icon: BookOpen, label: '欣赏笔记' },
  { path: '/composers', icon: Users, label: '作曲家研究' },
  { path: '/concerts', icon: CalendarDays, label: '音乐会追踪' }
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-elegant min-h-screen flex flex-col">
      <div className="p-6 border-b border-parchment-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-burgundy-700 to-gold-500 rounded-lg flex items-center justify-center">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold text-burgundy-800">Maestoso</h1>
            <p className="text-xs text-gray-500">古典音乐收藏</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-link-active' : 'text-gray-600'}`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-parchment-200">
        <div className="bg-parchment-100 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">今日推荐</p>
          <p className="text-xs text-gray-500 italic font-serif">
            "音乐是比一切智慧、一切哲学更高的启示。"
          </p>
          <p className="text-xs text-gold-700 mt-2 text-right">—— 贝多芬</p>
        </div>
      </div>
    </aside>
  );
}
