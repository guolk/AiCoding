import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Gamepad2,
  History,
  BookOpen,
  Sparkles,
  Package,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '首页' },
  { to: '/collection', icon: Gamepad2, label: '收藏' },
  { to: '/plays', icon: History, label: '记录' },
  { to: '/rules', icon: BookOpen, label: '规则' },
  { to: '/recommend', icon: Sparkles, label: '推荐' },
  { to: '/expansions', icon: Package, label: '扩展' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface-400 border-t border-surface-100 z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg transition-colors ${
                isActive
                  ? 'text-accent-500'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
