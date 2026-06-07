import { NavLink, Outlet } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Target, TrendingUp, DollarSign } from 'lucide-react';

const tabs = [
  { id: 'campaigns', label: '广告活动', icon: Target },
  { id: 'bidding', label: '出价优化', icon: TrendingUp },
  { id: 'roi', label: 'ROI分析', icon: DollarSign },
];

export default function Advertising() {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Header title="广告管理" subtitle="多平台广告活动监控与优化" />

      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          {tabs.map((tab) => (
            <NavLink
              key={tab.id}
              to={tab.id}
              className={({ isActive }) =>
                `flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                    : 'bg-dark-700/50 text-gray-400 hover:text-white hover:bg-dark-700 border border-white/10'
                }`
              }
            >
              <tab.icon size={18} />
              {tab.label}
            </NavLink>
          ))}
        </div>

        <div className="animate-fadeIn">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
