import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Anchor,
  CloudSun,
  Ship,
  MapPin,
  Compass,
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: '仪表板', end: true },
  { path: '/voyages', icon: Anchor, label: '航行日志' },
  { path: '/weather', icon: CloudSun, label: '气象分析' },
  { path: '/boats', icon: Ship, label: '船艇管理' },
  { path: '/plans', icon: MapPin, label: '航行计划' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gradient-to-b from-ocean-800 to-ocean-950 min-h-screen flex flex-col">
      <div className="p-6 border-b border-ocean-700/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-nautical-400 to-nautical-600 rounded-xl flex items-center justify-center shadow-lg">
            <Compass className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-white">航海日志</h1>
            <p className="text-ocean-300 text-xs">Sailing Logbook</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-ocean-700/50">
        <div className="bg-ocean-900/60 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-ocean-700 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">船</span>
            </div>
            <div>
              <p className="text-white font-medium text-sm">船长</p>
              <p className="text-ocean-400 text-xs">captain@sailing.com</p>
            </div>
          </div>
          <div className="text-xs text-ocean-400">
            <p>上次航行: 6月1日</p>
            <p>总航程: 614.7 海里</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
