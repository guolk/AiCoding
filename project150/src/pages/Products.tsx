import { NavLink, Outlet } from 'react-router-dom';
import { Header } from '@/components/Header';

const tabs = [
  { id: 'lifecycle', label: '生命周期', path: '/products/lifecycle' },
  { id: 'keywords', label: '关键词', path: '/products/keywords' },
  { id: 'reviews', label: '差评管理', path: '/products/reviews' },
];

export default function Products() {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Header title="产品管理" subtitle="产品生命周期、关键词排名与差评管理" />

      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          {tabs.map((tab) => (
            <NavLink
              key={tab.id}
              to={tab.path}
              className={({ isActive }) =>
                `px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                    : 'bg-dark-700/50 text-gray-400 hover:text-white hover:bg-dark-700 border border-white/10'
                }`
              }
            >
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
