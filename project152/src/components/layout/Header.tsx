import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  User,
  LogOut,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

const pageTitleMap: Record<string, string> = {
  '/': '仪表盘',
  '/patents': '专利列表',
  '/patents/annuity': '年费管理',
  '/trademarks': '商标管理',
  '/copyrights': '版权管理',
  '/geo-analysis': '地域分析',
  '/competitors/patents': '竞品专利',
  '/competitors/map': '专利地图',
  '/competitors/infringement': '侵权评估',
  '/licenses': '许可协议',
  '/transfers': '转让记录',
  '/pledge': '质押融资',
  '/valuation': '价值评估',
};

interface HeaderProps {
  onMenuClick: () => void;
  collapsed: boolean;
}

export function Header({ onMenuClick, collapsed }: HeaderProps) {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const pageTitle = pageTitleMap[location.pathname] || '概览';
  const unreadCount = 5;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 bg-white border-b border-slate-200 z-30 transition-all duration-300 flex items-center justify-between px-4 lg:px-6',
        collapsed ? 'left-[72px]' : 'left-[260px]'
      )}
    >
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden p-2"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold text-slate-800 hidden sm:block">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <div className="hidden md:block w-64">
          <Input
            type="text"
            placeholder="搜索专利、商标..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>

        <div className="relative" ref={notificationsRef}>
          <Button
            variant="ghost"
            size="sm"
            className="relative p-2"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <Bell className="h-5 w-5 text-slate-600" />
            {unreadCount > 0 && (
              <Badge
                variant="danger"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-200">
                <h3 className="font-semibold text-slate-800">通知</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="px-4 py-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                  >
                    <p className="text-sm text-slate-800 font-medium">
                      年费即将到期提醒
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      您有 {item} 项专利年费将在 30 天内到期
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {item} 小时前
                    </p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-slate-200">
                <Button variant="ghost" size="sm" className="w-full text-sm">
                  查看全部通知
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={userMenuRef}>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 p-1.5"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="h-4 w-4 text-primary-600" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-slate-800">管理员</p>
              <p className="text-xs text-slate-500">admin@company.com</p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-500 hidden md:block" />
          </Button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-200">
                <p className="font-medium text-slate-800">管理员</p>
                <p className="text-sm text-slate-500">admin@company.com</p>
              </div>
              <div className="py-1">
                <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  个人信息
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  系统设置
                </button>
              </div>
              <div className="border-t border-slate-200 py-1">
                <button className="w-full px-4 py-2 text-left text-sm text-danger-600 hover:bg-danger-50 flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  退出登录
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
