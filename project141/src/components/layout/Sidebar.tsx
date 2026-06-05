import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, TrendingUp, Receipt, PieChart, Settings } from 'lucide-react';

const navItems = [
  { path: '/', label: '仪表盘', icon: LayoutDashboard },
  { path: '/portfolio', label: '持仓管理', icon: Briefcase },
  { path: '/valuation', label: '估值分析', icon: TrendingUp },
  { path: '/transactions', label: '交易记录', icon: Receipt },
  { path: '/analysis', label: '组合分析', icon: PieChart },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-surface border-r border-border h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-accent" />
          投资组合管理
        </h1>
        <p className="text-xs text-text-muted mt-1">专业估值分析工具</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-muted hover:bg-surface-hover hover:text-text-secondary transition-colors cursor-pointer">
          <Settings className="w-5 h-5" />
          <span className="font-medium">API 设置</span>
        </div>
      </div>
    </aside>
  );
}
