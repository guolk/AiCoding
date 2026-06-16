import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  Pill,
  Heart,
  Calendar,
  LayoutDashboard,
  Menu,
  X,
  Stethoscope,
} from 'lucide-react';
import { cn } from '@/utils';

const navItems = [
  { to: '/', label: '首页仪表盘', icon: LayoutDashboard },
  { to: '/blood-pressure', label: '血压监测', icon: Activity },
  { to: '/medication', label: '用药管理', icon: Pill },
  { to: '/lifestyle', label: '生活方式', icon: Heart },
  { to: '/medical', label: '就医管理', icon: Stethoscope },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-blue-600 text-white shadow-lg"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <Menu size={20} /> : <X size={20} />}
      </button>

      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 lg:z-0 h-screen w-64 flex flex-col bg-gradient-to-b from-blue-600 via-blue-700 to-blue-800 text-white transition-transform duration-300 ease-in-out',
          collapsed && '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Calendar size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide">健康管家</h1>
            <p className="text-xs text-blue-200">Health Manager</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                    'hover:bg-white/10 hover:backdrop-blur-sm',
                    isActive
                      ? 'bg-white/20 text-white shadow-inner'
                      : 'text-blue-100 hover:text-white'
                  )
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-blue-200">
            <span>版本 v1.0.0</span>
            <Heart size={14} className="text-blue-300" />
          </div>
        </div>
      </aside>

      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}
    </>
  );
}
