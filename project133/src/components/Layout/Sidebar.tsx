import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils.js';
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  BarChart3,
  Library,
  Archive,
  Settings,
  FlaskConical
} from 'lucide-react';

const navItems = [
  { path: '/', label: '仪表盘', icon: LayoutDashboard },
  { path: '/templates', label: '实验模板', icon: FileText },
  { path: '/reports', label: '学生报告', icon: ClipboardList },
  { path: '/analytics', label: '数据分析', icon: BarChart3 },
  { path: '/resources', label: '资源库', icon: Library },
  { path: '/archives', label: '课程档案', icon: Archive },
  { path: '/settings', label: '系统设置', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-primary-700 text-white flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-primary-600">
        <FlaskConical className="w-8 h-8 text-accent-mint mr-3" />
        <div>
          <h1 className="font-display text-lg font-bold leading-tight">实验教学</h1>
          <p className="text-xs text-primary-200">管理系统</p>
        </div>
      </div>
      
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center px-6 py-3 text-sm font-medium transition-all duration-120',
                'hover:bg-primary-600 hover:text-white',
                isActive
                  ? 'bg-primary-600 text-white border-r-4 border-accent-mint'
                  : 'text-primary-100'
              )
            }
          >
            <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-primary-600">
        <div className="bg-primary-600 rounded-lg p-3">
          <p className="text-xs text-primary-200 mb-1">当前登录</p>
          <p className="text-sm font-medium">王老师</p>
          <p className="text-xs text-primary-300">物理系 · 副教授</p>
        </div>
      </div>
    </aside>
  );
};

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 font-body">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="p-8 animate-fade-in-up">
          {children}
        </div>
      </main>
    </div>
  );
};
