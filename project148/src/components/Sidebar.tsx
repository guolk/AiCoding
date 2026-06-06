import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Fish,
  Droplets,
  Leaf,
  Wrench,
  Plus,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '首页概览' },
  { to: '/tanks', icon: Fish, label: '我的水族箱' },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-aqua-900 text-white flex flex-col z-50">
      <div className="p-6 border-b border-aqua-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-aqua-400 to-reef-400 rounded-xl flex items-center justify-center">
            <Fish className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold">水族管家</h1>
            <p className="text-xs text-aqua-300">智能养殖记录</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-aqua-800 text-white shadow-lg'
                  : 'text-aqua-200 hover:bg-aqua-800/50 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}

        <div className="mt-6 pt-6 border-t border-aqua-800">
          <p className="px-4 text-xs text-aqua-400 uppercase tracking-wider mb-2">
            快捷操作
          </p>
          <NavLink
            to="/tanks/new"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-reef-500 to-reef-600 text-white hover:from-reef-600 hover:to-reef-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">新建水族箱</span>
          </NavLink>
        </div>
      </nav>

      <div className="p-4 border-t border-aqua-800">
        <div className="bg-aqua-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-aqua-200">
            <Droplets className="w-4 h-4" />
            <span>数据自动保存</span>
          </div>
          <p className="mt-1 text-xs text-aqua-400">
            所有数据存储在本地浏览器中
          </p>
        </div>
      </div>
    </aside>
  );
}
