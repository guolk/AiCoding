import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Quote, 
  TrendingUp, 
  Share2, 
  Rocket, 
  Settings,
  GraduationCap
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: '仪表板' },
  { path: '/papers', icon: FileText, label: '论文管理' },
  { path: '/citations', icon: Quote, label: '引用分析' },
  { path: '/impact', icon: TrendingUp, label: '影响力指标' },
  { path: '/outreach', icon: Share2, label: '传播追踪' },
  { path: '/applications', icon: Rocket, label: '应用案例' },
  { path: '/settings', icon: Settings, label: '设置' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-gray-100 h-screen fixed left-0 top-0 flex flex-col shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-800 to-accent-500 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-primary-900">ScholarTrack</h1>
            <p className="text-xs text-gray-500">学术影响力追踪</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-4">
          <p className="text-xs text-primary-700 font-medium">Pro 版本</p>
          <p className="text-xs text-gray-600 mt-1">解锁高级分析和API集成</p>
          <button className="mt-3 w-full text-xs bg-primary-900 text-white py-2 rounded-lg hover:bg-primary-800 transition-colors">
            升级到 Pro
          </button>
        </div>
      </div>
    </aside>
  );
}
