import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Gamepad2,
  History,
  BookOpen,
  Sparkles,
  Package,
  Dice6,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '仪表盘' },
  { to: '/collection', icon: Gamepad2, label: '游戏收藏' },
  { to: '/plays', icon: History, label: '游玩记录' },
  { to: '/rules', icon: BookOpen, label: '规则速查' },
  { to: '/recommend', icon: Sparkles, label: '游戏推荐' },
  { to: '/expansions', icon: Package, label: '扩展内容' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-surface-400 border-r border-surface-100 h-screen sticky top-0">
      <div className="p-6 border-b border-surface-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent-500 rounded-xl flex items-center justify-center">
            <Dice6 className="w-6 h-6 text-surface-900" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-white">桌游馆</h1>
            <p className="text-xs text-gray-400">Board Game Library</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-surface-100">
        <div className="card p-4">
          <p className="text-sm text-gray-300 mb-2">数据存储</p>
          <p className="text-xs text-gray-500">所有数据保存在本地浏览器中</p>
        </div>
      </div>
    </aside>
  );
}
