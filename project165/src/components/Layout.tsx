import { NavLink, Outlet } from 'react-router-dom';
import {
  Plane,
  LayoutDashboard,
  Navigation,
  Cpu,
  Film,
  ShieldCheck,
  User,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '仪表盘' },
  { to: '/flights', icon: Navigation, label: '飞行记录' },
  { to: '/equipment', icon: Cpu, label: '设备管理' },
  { to: '/projects', icon: Film, label: '航拍项目' },
  { to: '/compliance', icon: ShieldCheck, label: '法规合规' },
];

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-surface-dark">
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-navy-800 border-r border-navy-600/50">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-navy-600/50">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-500/20">
            <Plane className="h-5 w-5 text-accent-500" />
          </div>
          <span className="font-display text-2xl font-bold text-accent-500 tracking-wide">
            SkyLog
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg p-3 transition-all duration-200 ${
                  isActive
                    ? 'bg-navy-600 text-accent-500 shadow-lg shadow-navy-900/50'
                    : 'text-navy-200 hover:bg-navy-700 hover:text-white'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-navy-600/50 px-4 py-4">
          <div className="flex items-center gap-3 rounded-lg p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-600">
              <User className="h-4 w-4 text-navy-200" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">张伟</span>
              <span className="text-xs text-navy-300">飞行员</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="ml-64 min-h-screen bg-surface-dark p-6">
        <Outlet />
      </main>
    </div>
  );
}
