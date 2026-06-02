import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Target,
  Users,
  UserCheck,
  Briefcase,
  Calendar,
  Database,
} from 'lucide-react';
import { cn } from '../../utils/helpers';

const navItems = [
  { path: '/', label: '仪表盘', icon: LayoutDashboard },
  { path: '/projects', label: '项目档案', icon: FolderKanban },
  { path: '/milestones', label: '里程碑管理', icon: Target },
  { path: '/mentors', label: '导师管理', icon: Users },
  { path: '/investors', label: '投资人', icon: UserCheck },
  { path: '/providers', label: '服务商', icon: Briefcase },
  { path: '/activities', label: '活动管理', icon: Calendar },
  { path: '/dataroom', label: '数据室', icon: Database },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 min-h-screen text-white flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          孵化器管理系统
        </h1>
        <p className="text-slate-400 text-sm mt-1">Incubator Management</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )
              }
            >
              <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center font-bold">
            管
          </div>
          <div>
            <p className="font-medium text-sm">管理员</p>
            <p className="text-xs text-slate-400">admin@incubator.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
