import { NavLink } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Target,
  AlertCircle,
  FileText,
  BarChart3,
  Plus,
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { to: '/', icon: Home, label: '首页' },
  { to: '/questions', icon: BookOpen, label: '题目库' },
  { to: '/training', icon: Target, label: '训练计划' },
  { to: '/errors', icon: AlertCircle, label: '错题本' },
  { to: '/notes', icon: FileText, label: '学习笔记' },
  { to: '/progress', icon: BarChart3, label: '进度分析' },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-background-card border-r border-background-hover z-40">
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-background-hover">
          <h1 className="text-2xl font-bold text-text-primary">
            Math<span className="text-primary">Arena</span>
          </h1>
          <p className="text-sm text-text-muted mt-1">数学竞赛训练平台</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-text-secondary hover:bg-background-hover hover:text-text-primary'
                )
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-background-hover">
          <NavLink
            to="/questions/new"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            录入题目
          </NavLink>
        </div>
      </div>
    </aside>
  );
}
