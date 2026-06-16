import { Outlet, useLocation } from 'react-router-dom';
import { ChevronRight, CalendarDays } from 'lucide-react';
import Sidebar from './Sidebar';
import { cn } from '@/utils';

const routeTitles: Record<string, string> = {
  '/': '首页仪表盘',
  '/blood-pressure': '血压监测',
  '/medication': '用药管理',
  '/lifestyle': '生活方式',
  '/medical': '就医管理',
};

const routeBreadcrumbs: Record<string, string[]> = {
  '/': ['首页'],
  '/blood-pressure': ['首页', '血压监测'],
  '/medication': ['首页', '用药管理'],
  '/lifestyle': ['首页', '生活方式'],
  '/medical': ['首页', '就医管理'],
};

function formatCurrentDate(): string {
  const now = new Date();
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekday = weekdays[now.getDay()];
  return `${year}年${month}月${day}日 ${weekday}`;
}

export default function Layout() {
  const location = useLocation();
  const currentPath = location.pathname;
  const pageTitle = routeTitles[currentPath] || '页面标题';
  const breadcrumbs = routeBreadcrumbs[currentPath] || ['首页'];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
          <div className="px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <nav className="flex items-center gap-1 text-sm text-slate-500 mb-1">
                  {breadcrumbs.map((crumb, index) => (
                    <span key={index} className="flex items-center gap-1">
                      {index > 0 && <ChevronRight size={14} className="text-slate-400" />}
                      <span className={cn(
                        index === breadcrumbs.length - 1
                          ? 'text-blue-600 font-medium'
                          : 'hover:text-slate-700 transition-colors'
                      )}>
                        {crumb}
                      </span>
                    </span>
                  ))}
                </nav>
                <h1 className="text-xl lg:text-2xl font-bold text-slate-800">
                  {pageTitle}
                </h1>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600 bg-white/60 px-4 py-2 rounded-xl border border-slate-200/50">
                <CalendarDays size={18} className="text-blue-500" />
                <span className="font-medium">{formatCurrentDate()}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
