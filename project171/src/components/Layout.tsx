import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  HeartHandshake,
  LayoutDashboard,
  Heart,
  Building2,
  Users,
  TrendingUp,
  FileText,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { to: '/', label: '首页仪表盘', icon: LayoutDashboard },
  { to: '/donations', label: '捐款记录', icon: Heart },
  { to: '/institutions', label: '机构研究', icon: Building2 },
  { to: '/participation/volunteer', label: '公益参与', icon: Users },
  { to: '/tracking/progress', label: '效果追踪', icon: TrendingUp },
  { to: '/report', label: '年度报告', icon: FileText },
];

const pageTitles: Record<string, string> = {
  '/': '首页仪表盘',
  '/donations': '捐款记录',
  '/institutions': '机构研究',
  '/participation/volunteer': '公益参与',
  '/tracking/progress': '效果追踪',
  '/report': '年度报告',
};

interface TitleBarProps {
  title: string;
  showAddButton?: boolean;
  onAddClick?: () => void;
}

function TitleBar({ title, showAddButton = true, onAddClick }: TitleBarProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="font-display text-3xl font-bold text-forest-500">{title}</h1>
      {showAddButton && (
        <button
          onClick={onAddClick}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          <span>快捷添加</span>
        </button>
      )}
    </div>
  );
}

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const currentTitle = pageTitles[location.pathname] || '公益管理系统';

  return (
    <div className="flex min-h-screen">
      <aside className="fixed left-0 top-0 h-screen w-[280px] bg-white shadow-soft flex flex-col z-20">
        <div className="p-6 border-b border-forest-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-terracotta-50 flex items-center justify-center">
              <HeartHandshake className="text-terracotta-500" size={28} />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-terracotta-500">
                公益同行
              </h1>
              <p className="text-xs text-forest-400">让爱心传递更远</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'sidebar-link',
                  isActive && 'sidebar-link-active'
                )
              }
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-forest-100">
          <div className="bg-gradient-to-r from-cream-100 to-cream-200 rounded-xl p-4">
            <p className="text-sm text-forest-500 font-medium">今日善行</p>
            <p className="text-xs text-forest-400 mt-1">每一份爱心都在改变世界</p>
          </div>
        </div>
      </aside>

      <main className="ml-[280px] flex-1 p-8">
        <TitleBar
          title={currentTitle}
          showAddButton={false}
        />
        {children || <Outlet />}
      </main>
    </div>
  );
}
