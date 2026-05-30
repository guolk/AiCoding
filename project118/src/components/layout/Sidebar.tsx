import {
  LayoutDashboard,
  Grid3X3,
  FolderKanban,
  Package,
  BookOpen,
  Settings
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: '仪表板', icon: LayoutDashboard },
  { path: '/patterns', label: '图案设计', icon: Grid3X3 },
  { path: '/projects', label: '项目管理', icon: FolderKanban },
  { path: '/materials', label: '材料库', icon: Package },
  { path: '/learning', label: '学习笔记', icon: BookOpen },
  { path: '/settings', label: '设置', icon: Settings }
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
            <Grid3X3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">织梦工坊</h1>
            <p className="text-xs text-gray-500">织物设计管理</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-100">
        <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
          <p className="text-sm font-medium text-orange-700">提示</p>
          <p className="text-xs text-orange-600 mt-1">
            数据保存在本地浏览器中，请定期导出备份
          </p>
        </div>
      </div>
    </aside>
  );
}
