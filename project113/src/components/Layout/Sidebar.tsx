import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Plane,
  Users,
  Archive,
  GraduationCap,
} from 'lucide-react';

const navItems = [
  { to: '/', label: '仪表盘', icon: LayoutDashboard },
  { to: '/submissions', label: '会议投稿', icon: FileText },
  { to: '/papers', label: '论文管理', icon: BookOpen },
  { to: '/attendance', label: '参会准备', icon: Plane },
  { to: '/network', label: '学术网络', icon: Users },
  { to: '/archive', label: '学术档案', icon: Archive },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg">学术会议</h1>
            <p className="text-xs text-slate-400">管理工具</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 rounded-lg p-4">
          <p className="text-xs text-slate-400 mb-2">提示</p>
          <p className="text-sm text-slate-300">
            数据保存在浏览器本地，请勿清除浏览器数据
          </p>
        </div>
      </div>
    </aside>
  );
}
