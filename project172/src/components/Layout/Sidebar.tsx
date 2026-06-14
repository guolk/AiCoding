import { NavLink } from 'react-router-dom';
import {
  Home,
  FlaskConical,
  Beaker,
  FileText,
  Refrigerator,
  Bug,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// 导航菜单项配置
const menuItems = [
  {
    label: '工作台',
    path: '/',
    icon: Home,
  },
  {
    label: '菌株档案',
    path: '/strains',
    icon: FlaskConical,
  },
  {
    label: '培养记录',
    path: '/cultures',
    icon: Beaker,
  },
  {
    label: '实验记录',
    path: '/experiments',
    icon: FileText,
  },
  {
    label: '储存管理',
    path: '/storage',
    icon: Refrigerator,
  },
];

export default function Sidebar() {
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 flex h-screen w-[240px] flex-col bg-[#1D2129] text-white',
      )}
    >
      {/* Logo 区域 */}
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#165DFF]">
          <Bug className="h-5 w-5" />
        </div>
        <span className="text-[15px] font-semibold tracking-wide">
          MicroLab菌株管理
        </span>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] transition-all duration-200',
                    isActive
                      ? 'bg-[#165DFF] text-white shadow-lg shadow-[#165DFF]/20'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white',
                  )
                }
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* 底部用户信息 */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-white/5 transition-colors">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#165DFF] to-[#4080FF] text-sm font-medium">
            张
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-[14px] font-medium">张研究员</p>
            <p className="truncate text-[12px] text-gray-400">微生物实验室</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
