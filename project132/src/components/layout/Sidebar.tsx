import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Route, 
  Map, 
  Bike, 
  Wrench, 
  Shirt,
  Fuel
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: '仪表盘' },
  { path: '/rides', icon: Route, label: '骑行记录' },
  { path: '/routes', icon: Map, label: '路线库' },
  { path: '/motorcycle', icon: Bike, label: '摩托车档案' },
  { path: '/maintenance', icon: Wrench, label: '维护保养' },
  { path: '/gear', icon: Shirt, label: '装备管理' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-dark-900/95 backdrop-blur-lg border-r border-dark-700 z-50">
      <div className="p-6 border-b border-dark-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center">
            <Bike className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-orbitron font-bold text-lg text-white">MotoLog</h1>
            <p className="text-xs text-dark-400">骑行日志管理</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30 shadow-lg shadow-brand-500/10'
                  : 'text-dark-300 hover:text-white hover:bg-dark-800 hover:border-dark-600 border border-transparent'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse" />
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-700">
        <div className="card p-4">
          <p className="text-xs text-dark-400 mb-2">数据存储</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-dark-200">本地存储已启用</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
