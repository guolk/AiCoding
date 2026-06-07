import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Package,
  Megaphone,
  Warehouse,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';

const navItems = [
  {
    path: '/dashboard',
    label: '总览仪表盘',
    icon: LayoutDashboard,
  },
  {
    path: '/stores',
    label: '店铺数据管理',
    icon: Store,
  },
  {
    path: '/products',
    label: '商品管理',
    icon: Package,
  },
  {
    path: '/advertising',
    label: '广告投放管理',
    icon: Megaphone,
  },
  {
    path: '/inventory',
    label: '库存与物流',
    icon: Warehouse,
  },
  {
    path: '/strategy',
    label: '运营策略记录',
    icon: FileText,
  },
];

const subNavItems: Record<string, { path: string; label: string }[]> = {
  '/products': [
    { path: '/products/lifecycle', label: '生命周期管理' },
    { path: '/products/keywords', label: '关键词排名' },
    { path: '/products/reviews', label: '差评管理' },
  ],
  '/advertising': [
    { path: '/advertising/campaigns', label: '广告活动' },
    { path: '/advertising/bidding', label: '出价优化' },
    { path: '/advertising/roi', label: 'ROI分析' },
  ],
  '/inventory': [
    { path: '/inventory/stock', label: '库存追踪' },
    { path: '/inventory/logistics', label: '头程物流' },
    { path: '/inventory/planning', label: '备货计划' },
  ],
  '/strategy': [
    { path: '/strategy/pricing', label: '价格管理' },
    { path: '/strategy/promotions', label: '促销管理' },
  ],
};

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const location = useLocation();

  const activeParent = navItems.find(
    (item) =>
      location.pathname === item.path ||
      location.pathname.startsWith(item.path + '/')
  );

  return (
    <aside
      className={cn(
        'h-screen bg-dark-900/80 backdrop-blur-xl border-r border-white/10 flex flex-col transition-all duration-300 sticky top-0 z-40',
        sidebarCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        {!sidebarCollapsed && (
          <h1 className="font-display font-bold text-lg text-gradient">
            跨境运营平台
          </h1>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-dark-700 transition-colors text-gray-400 hover:text-white ml-auto"
        >
          {sidebarCollapsed ? (
            <ChevronRight size={20} />
          ) : (
            <ChevronLeft size={20} />
          )}
        </button>
      </div>

      <nav className="flex-1 py-4 px-3 overflow-y-auto scrollbar-thin">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              location.pathname.startsWith(item.path + '/');
            const Icon = item.icon;

            return (
              <div key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn('sidebar-link', isActive && 'active')}
                >
                  <Icon size={20} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </NavLink>

                {!sidebarCollapsed &&
                  isActive &&
                  subNavItems[item.path] && (
                    <div className="ml-8 mt-1 space-y-1 border-l border-dark-600 pl-3">
                      {subNavItems[item.path].map((subItem) => (
                        <NavLink
                          key={subItem.path}
                          to={subItem.path}
                          className={({ isActive }) =>
                            cn(
                              'block py-2 px-3 rounded-lg text-sm transition-colors',
                              isActive
                                ? 'text-primary-400 bg-primary-600/10'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-dark-700/30'
                            )
                          }
                        >
                          {subItem.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      </nav>

      {!sidebarCollapsed && (
        <div className="p-4 border-t border-white/10">
          <div className="glass-card p-4">
            <p className="text-xs text-gray-400 mb-2">当前用户</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center font-bold">
                管
              </div>
              <div>
                <p className="text-sm font-medium">系统管理员</p>
                <p className="text-xs text-gray-400">admin@example.com</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
