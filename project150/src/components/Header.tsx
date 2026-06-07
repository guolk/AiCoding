import { Bell, Search, RefreshCw } from 'lucide-react';
import { useAppStore } from '@/store/appStore';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { alerts, loading, fetchDashboard } = useAppStore();
  const unreadAlerts = alerts.filter(
    (a) => a.type === 'danger' || a.type === 'warning'
  ).length;

  return (
    <header className="h-16 bg-dark-900/50 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 sticky top-0 z-30">
      <div>
        <h1 className="font-display font-semibold text-xl text-white">{title}</h1>
        {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="搜索商品、店铺、活动..."
            className="input-field pl-10 w-64 text-sm"
          />
        </div>

        <button
          onClick={fetchDashboard}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-dark-700 transition-colors text-gray-400 hover:text-white relative"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>

        <button className="p-2 rounded-lg hover:bg-dark-700 transition-colors text-gray-400 hover:text-white relative">
          <Bell size={20} />
          {unreadAlerts > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-danger-500 rounded-full text-xs flex items-center justify-center text-white font-medium">
              {unreadAlerts}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
