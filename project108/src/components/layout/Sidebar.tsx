
import {
  Home,
  Users,
  Lightbulb,
  Calendar,
  Package,
  PieChart,
  Gift,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import type { Page } from '../../types';

const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: '仪表盘', icon: <Home size={20} /> },
  { id: 'contacts', label: '联系人管理', icon: <Users size={20} /> },
  { id: 'gift-ideas', label: '礼物创意库', icon: <Lightbulb size={20} /> },
  { id: 'purchase-plans', label: '购买计划', icon: <Calendar size={20} /> },
  { id: 'gift-tracking', label: '礼物跟踪', icon: <Package size={20} /> },
  { id: 'budget-analysis', label: '预算分析', icon: <PieChart size={20} /> },
];

export default function Sidebar() {
  const { currentPage, setCurrentPage, setSelectedContactId } = useAppStore();

  const handleNavClick = (page: Page) => {
    setCurrentPage(page);
    setSelectedContactId(null);
  };

  return (
    <aside className="w-64 bg-white border-r border-ink-100 h-screen fixed left-0 top-0 flex flex-col z-10">
      <div className="p-6 border-b border-ink-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-glow">
            <Gift size={22} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-ink-900">礼物管家</h1>
            <p className="text-xs text-ink-500">送礼从未如此用心</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`nav-item w-full text-left ${
              currentPage === item.id ? 'nav-item-active' : ''
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-ink-100">
        <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-4">
          <p className="text-sm font-medium text-ink-700 mb-2">💡 小贴士</p>
          <p className="text-xs text-ink-500">
            记得提前为重要的日子准备礼物！设置提醒可以帮助你不会错过任何一个特别的时刻。
          </p>
        </div>
      </div>
    </aside>
  );
}
