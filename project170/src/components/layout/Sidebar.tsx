import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Gem,
  ShoppingCart,
  FlaskConical,
  Boxes,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

const navItems = [
  { path: '/', label: '收藏概览', icon: LayoutDashboard },
  { path: '/specimens', label: '标本档案', icon: Gem },
  { path: '/acquisition', label: '收藏来源', icon: ShoppingCart },
  { path: '/scientific', label: '科学数据', icon: FlaskConical },
  { path: '/display', label: '陈列展示', icon: Boxes },
  { path: '/knowledge', label: '知识学习', icon: BookOpen },
];

export default function Sidebar() {
  const specimens = useAppStore((s) => s.specimens);
  const onLoanCount = useAppStore((s) =>
    s.loanRecords.filter((l) => l.status === 'on-loan').length
  );

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-100 shadow-nav flex flex-col">
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-semibold text-gray-800 leading-tight">
              晶石典藏
            </h1>
            <p className="text-xs text-gray-500">Mineral & Meteorite Manager</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  isActive ? 'sidebar-link-active' : 'sidebar-link-inactive',
                  'relative'
                )
              }
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1">{item.label}</span>
              {item.path === '/display' && onLoanCount > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 text-xs font-medium rounded-full bg-amber-500 text-white flex items-center justify-center">
                  {onLoanCount > 99 ? '99+' : onLoanCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-gray-100">
        <div className="text-xs text-gray-400 font-mono">
          共 {specimens.length} 件标本
        </div>
      </div>
    </aside>
  );
}
