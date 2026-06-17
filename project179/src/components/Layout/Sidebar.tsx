import { NavLink } from 'react-router-dom';
import {
  Leaf,
  LayoutDashboard,
  MapPin,
  Thermometer,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: '仪表板', icon: LayoutDashboard },
  { to: '/sites', label: '监测点管理', icon: MapPin },
  { to: '/species', label: '生物多样性', icon: Leaf },
  { to: '/environment', label: '环境参数', icon: Thermometer },
  { to: '/analysis', label: '数据分析', icon: BarChart3 },
];

export function Sidebar() {
  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col bg-white border-r border-forest-100 shadow-sm"
      style={{ width: 260 }}
    >
      <div className="h-16 flex items-center gap-3 px-6 border-b border-forest-100">
        <div className="w-10 h-10 rounded-xl bg-forest-500 flex items-center justify-center">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold text-forest-800">生态监测系统</span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-forest-500 text-white shadow-sm'
                  : 'text-forest-700 hover:bg-forest-50 hover:text-forest-800'
              )
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-forest-100">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-forest-50">
          <div className="w-10 h-10 rounded-full bg-forest-300 flex items-center justify-center text-white font-semibold">
            张
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-forest-800 truncate">张研究员</p>
            <p className="text-xs text-forest-600 truncate">生态学家</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
