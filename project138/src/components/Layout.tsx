import { NavLink, Outlet } from 'react-router-dom';
import {
  Home,
  MapPin,
  GalleryHorizontalEnd,
  BookOpen,
  Heart,
  BarChart3,
  Landmark,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: '首页' },
  { to: '/visits', icon: MapPin, label: '参观记录' },
  { to: '/exhibitions', icon: GalleryHorizontalEnd, label: '展览追踪' },
  { to: '/notes', icon: BookOpen, label: '学习笔记' },
  { to: '/wishlist', icon: Heart, label: '愿望清单' },
  { to: '/statistics', icon: BarChart3, label: '统计数据' },
];

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-gold-500/10 bg-ink-900/95 backdrop-blur-sm">
        <div className="flex items-center gap-3 border-b border-gold-500/10 px-6 py-6">
          <Landmark className="h-8 w-8 text-gold-500" />
          <div>
            <h1 className="font-serif text-xl font-bold text-gold-gradient">博物志</h1>
            <p className="text-xs text-ink-300">博物馆与遗址追踪</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gold-500/15 text-gold-400 shadow-inner'
                    : 'text-ink-200 hover:bg-gold-500/5 hover:text-gold-500/80'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gold-500/10 px-6 py-4">
          <p className="text-xs text-ink-400">数据存储于本地浏览器</p>
        </div>
      </aside>

      <main className="ml-64 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
