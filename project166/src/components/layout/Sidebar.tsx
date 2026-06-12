import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Route,
  Briefcase,
  IdCard,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: '仪表盘', icon: LayoutDashboard },
  { to: '/cities', label: '城市数据库', icon: MapPin },
  { to: '/travel', label: '旅居记录', icon: Route },
  { to: '/workspace', label: '工作环境', icon: Briefcase },
  { to: '/visa', label: '签证管理', icon: IdCard },
  { to: '/finance', label: '财务管理', icon: Wallet },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return '夜深了，注意休息';
  if (hour < 12) return '早上好，开启新的一天';
  if (hour < 14) return '中午好，记得吃饭';
  if (hour < 18) return '下午好，继续加油';
  return '晚上好，辛苦了一天';
}

function formatDate(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekday = weekdays[date.getDay()];
  return `${year}年${month}月${day}日 ${weekday}`;
}

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-5 dark:border-gray-800">
        <span className="text-3xl">🏕️</span>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Nomad Hub
        </h1>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-nomad-700 text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate()}
        </p>
        <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-200">
          {getGreeting()}
        </p>
      </div>
    </aside>
  );
}
