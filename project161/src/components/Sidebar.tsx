import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, TreePine, HeartPulse, Grid3X3, BarChart3, Leaf } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '首页' },
  { to: '/archives', icon: TreePine, label: '古树档案' },
  { to: '/health', icon: HeartPulse, label: '健康评估' },
  { to: '/survey', icon: Grid3X3, label: '普查管理' },
  { to: '/analysis', icon: BarChart3, label: '数据分析' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-forest-600 text-white flex flex-col z-50 shadow-xl">
      <div className="px-6 py-6 border-b border-forest-500">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-forest-400 flex items-center justify-center">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-semibold leading-tight">古树名木</h1>
            <p className="text-xs text-forest-200 mt-0.5">普查记录系统</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = item.to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-forest-400 text-white shadow-md'
                  : 'text-forest-200 hover:bg-forest-500 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-forest-500">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-300 flex items-center justify-center text-forest-800 text-sm font-semibold">
            管
          </div>
          <div>
            <p className="text-sm font-medium">系统管理员</p>
            <p className="text-xs text-forest-300">在线</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
