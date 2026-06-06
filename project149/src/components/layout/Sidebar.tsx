import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ChefHat,
  ClipboardList,
  UtensilsCrossed,
} from 'lucide-react';
import { clsx } from 'clsx';

interface MenuItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  {
    to: '/',
    label: '仪表盘',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    to: '/customers',
    label: '客户管理',
    icon: <Users className="w-5 h-5" />,
  },
  {
    to: '/menus',
    label: '菜单定制',
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    to: '/preparation',
    label: '备餐计划',
    icon: <ChefHat className="w-5 h-5" />,
  },
  {
    to: '/review',
    label: '服务复盘',
    icon: <ClipboardList className="w-5 h-5" />,
  },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-primary-700 border-r border-primary-600">
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-primary-600">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold text-white">私厨管家</h1>
            <p className="text-xs text-primary-200">Private Chef Manager</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gold-500 text-white shadow-md'
                    : 'text-primary-100 hover:bg-primary-600 hover:text-white'
                )
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-primary-600">
          <div className="bg-primary-600/50 rounded-xl p-4">
            <p className="text-xs text-primary-200 mb-2">今日服务</p>
            <p className="text-2xl font-bold text-gold-400">3 场</p>
            <p className="text-xs text-primary-300 mt-1">保持专注，享受烹饪 ✨</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
