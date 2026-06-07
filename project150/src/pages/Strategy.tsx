import { NavLink, Outlet } from 'react-router-dom';
import { Header } from '@/components/Header';
import { DollarSign, Tag } from 'lucide-react';

const tabs = [
  { id: 'pricing', label: '价格调整', icon: DollarSign, path: '/strategy/pricing' },
  { id: 'promotions', label: '促销活动', icon: Tag, path: '/strategy/promotions' },
];

export default function Strategy() {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Header title="运营策略" subtitle="价格调整与促销活动管理" />

      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          {tabs.map((tab) => (
            <NavLink
              key={tab.id}
              to={tab.path}
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
