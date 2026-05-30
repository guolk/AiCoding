import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  TrendingUp, 
  Leaf, 
  Calculator, 
  Trees,
  ChevronRight
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: '仪表盘' },
  { path: '/bills', icon: FileText, label: '账单管理' },
  { path: '/analysis', icon: TrendingUp, label: '消耗分析' },
  { path: '/saving', icon: Leaf, label: '节能追踪' },
  { path: '/forecast', icon: Calculator, label: '费用预测' },
  { path: '/carbon', icon: Trees, label: '碳足迹' },
];

export default function Sidebar() {
  const location = useLocation();
  
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-100 shadow-sm flex flex-col relative z-20">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-200">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl text-gray-800">能源管家</h1>
            <p className="text-xs text-gray-400">智能节能平台</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive: linkActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  linkActive
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium flex-1">{item.label}</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${
                isActive ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-50'
              }`} />
            </NavLink>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-br from-primary-50 to-emerald-50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-primary-600" />
            </div>
            <span className="font-medium text-sm text-gray-700">本月减排</span>
          </div>
          <p className="text-2xl font-display text-primary-600">32.5 <span className="text-sm font-normal">kg CO₂</span></p>
        </div>
      </div>
    </aside>
  );
}
