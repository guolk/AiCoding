import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Sun, Moon, User, LogOut, ChevronDown, Home, Map, Receipt, FileText, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import { useUserStore } from '@/store/useUserStore';

const routeMap: Record<string, { label: string; icon: React.ElementType }> = {
  '/': { label: '仪表盘', icon: Home },
  '/itinerary': { label: '行程规划', icon: Map },
  '/expense': { label: '费用记录', icon: Receipt },
  '/reimbursement': { label: '报销管理', icon: FileText },
  '/analysis': { label: '数据分析', icon: BarChart3 },
};

const subRouteMap: Record<string, string> = {
  '/analysis/travel': '出行统计',
  '/analysis/expense': '费用分析',
  '/analysis/efficiency': '效率评估',
};

interface HeaderProps {
  sidebarCollapsed: boolean;
}

export default function Header({ sidebarCollapsed }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleTheme, isDark } = useTheme();
  const { currentUser } = useUserStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const getCurrentRoute = () => {
    const pathname = location.pathname;
    if (routeMap[pathname]) {
      return routeMap[pathname];
    }
    for (const parentPath of Object.keys(routeMap)) {
      if (parentPath !== '/' && pathname.startsWith(parentPath)) {
        return routeMap[parentPath];
      }
    }
    return { label: '未知页面', icon: Home };
  };

  const getSubRoute = () => {
    const pathname = location.pathname;
    return subRouteMap[pathname];
  };

  const currentRoute = getCurrentRoute();
  const subRoute = getSubRoute();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowUserMenu(false);
    navigate('/login');
  };

  const handleProfile = () => {
    setShowUserMenu(false);
    navigate('/profile');
  };

  const notifications = [
    { id: 1, title: '报销审批', content: '您的报销申请已通过审批', time: '5分钟前', read: false },
    { id: 2, title: '行程提醒', content: '您明天有一个行程即将开始', time: '1小时前', read: false },
    { id: 3, title: '费用记录', content: '有一笔新的费用记录需要您确认', time: '2小时前', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 z-30 transition-all duration-300 ease-in-out',
        'bg-white dark:bg-neutral-700 border-b border-neutral-200 dark:border-neutral-600',
        sidebarCollapsed ? 'md:left-20' : 'md:left-64',
        'left-0'
      )}
    >
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-2 text-sm">
            <Home
              className="w-4 h-4 text-neutral-400 cursor-pointer hover:text-primary-500 transition-colors"
              onClick={() => navigate('/')}
            />
            <ChevronDown className="w-4 h-4 text-neutral-300 rotate-[-90deg]" />
            <div className="flex items-center gap-1.5">
              <currentRoute.icon className="w-4 h-4 text-primary-500" />
              <span className="font-medium text-neutral-700 dark:text-white">
                {currentRoute.label}
              </span>
              {subRoute && (
                <>
                  <ChevronDown className="w-4 h-4 text-neutral-300 rotate-[-90deg]" />
                  <span className="text-neutral-500 dark:text-neutral-400">
                    {subRoute}
                  </span>
                </>
              )}
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors"
            >
              <Bell className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse-slow">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-neutral-700 rounded-xl shadow-card-hover border border-neutral-200 dark:border-neutral-600 overflow-hidden animate-fade-in z-50">
                <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-600">
                  <h3 className="font-semibold text-neutral-700 dark:text-white">通知</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'px-4 py-3 border-b border-neutral-100 dark:border-neutral-600 cursor-pointer transition-colors',
                        'hover:bg-neutral-50 dark:hover:bg-neutral-600',
                        !notification.read && 'bg-primary-50 dark:bg-primary-900/20'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 mt-2 rounded-full bg-primary-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-neutral-700 dark:text-white">
                            {notification.title}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                            {notification.content}
                          </p>
                          <p className="text-xs text-neutral-400 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 text-center">
                  <button className="text-sm text-primary-500 hover:text-primary-600 font-medium">
                    查看全部通知
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-neutral-600" />
            )}
          </button>

          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 md:gap-3 p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-medium text-sm">
                {currentUser?.name ? getInitials(currentUser.name) : 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-neutral-700 dark:text-white">
                  {currentUser?.name || '用户'}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {currentUser?.role || '员工'}
                </p>
              </div>
              <ChevronDown className={cn(
                'w-4 h-4 text-neutral-400 transition-transform duration-200',
                showUserMenu && 'rotate-180'
              )} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-neutral-700 rounded-xl shadow-card-hover border border-neutral-200 dark:border-neutral-600 overflow-hidden animate-fade-in z-50">
                <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-600">
                  <p className="font-medium text-sm text-neutral-700 dark:text-white">
                    {currentUser?.name || '用户'}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {currentUser?.email || ''}
                  </p>
                </div>
                <div className="py-1">
                  <button
                    onClick={handleProfile}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>个人信息</span>
                  </button>
                  <div className="border-t border-neutral-200 dark:border-neutral-600 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>退出登录</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
