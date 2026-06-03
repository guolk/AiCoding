import { NavLink } from 'react-router-dom';
import { Shield, LayoutDashboard, BriefcaseMedical, Package, Pill, ClipboardList, BookOpen, Users } from 'lucide-react';
import { useAppStore } from '@/store';

const navItems = [
  { to: '/', label: '仪表盘', icon: LayoutDashboard },
  { to: '/first-aid-kit', label: '急救箱管理', icon: BriefcaseMedical },
  { to: '/emergency-supplies', label: '应急物资', icon: Package },
  { to: '/medicine', label: '药品管理', icon: Pill },
  { to: '/records', label: '使用记录', icon: ClipboardList },
  { to: '/knowledge', label: '知识关联', icon: BookOpen },
];

export default function Sidebar() {
  const familyConfig = useAppStore((s) => s.familyConfig);

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r flex flex-col">
      <div className="flex items-center gap-2 px-5 py-5 border-b">
        <Shield className="w-7 h-7 text-primary" />
        <span className="text-lg font-bold text-gray-900">家庭急救箱</span>
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-l-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary border-r-2 border-primary'
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t px-5 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>家庭成员：{familyConfig.memberCount} 人</span>
        </div>
      </div>
    </aside>
  );
}
