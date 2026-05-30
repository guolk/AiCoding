import { NavLink, useLocation } from 'react-router-dom';
import {
  Lightbulb,
  Mic,
  CalendarDays,
  FileText,
  BarChart3,
  Theater,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  {
    path: '/',
    icon: Lightbulb,
    label: '素材收集',
    end: true,
  },
  {
    path: '/jokes',
    icon: Mic,
    label: '段子创作',
    end: false,
  },
  {
    path: '/performances',
    icon: CalendarDays,
    label: '演出管理',
    end: false,
  },
  {
    path: '/records',
    icon: FileText,
    label: '表演记录',
    end: false,
  },
  {
    path: '/analytics',
    icon: BarChart3,
    label: '进步分析',
    end: false,
  },
];

function getCurrentPageTitle(pathname: string): string {
  for (const item of navItems) {
    if (item.end) {
      if (pathname === item.path) return item.label;
    } else {
      if (pathname.startsWith(item.path)) return item.label;
    }
  }
  return '素材收集';
}

export default function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex flex-col w-72 bg-theater-darker/80 backdrop-blur-xl border-r border-white/10">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-stage-red to-red-800 flex items-center justify-center">
              <Theater className="w-7 h-7 text-spotlight-gold" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-ivory">喜剧工坊</h1>
              <p className="text-xs text-ivory/60">Comedy Writer Toolkit</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              end={item.end}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-white/10">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-spotlight-gold" />
              <span className="text-sm font-medium text-ivory/80">提示</span>
            </div>
            <p className="text-xs text-ivory/50">
              随时记录灵感，<br />每一个笑点都值得打磨！
            </p>
          </div>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div
        className={`fixed lg:hidden inset-y-0 left-0 w-72 bg-theater-darker border-r border-white/10 z-50 transform transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-stage-red to-red-800 flex items-center justify-center">
              <Theater className="w-6 h-6 text-spotlight-gold" />
            </div>
            <h1 className="font-display text-lg font-bold text-ivory">喜剧工坊</h1>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              end={item.end}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <main className="flex-1 flex flex-col min-h-screen">
        <header className="lg:hidden h-16 px-4 flex items-center justify-between border-b border-white/10 bg-theater-darker/50 backdrop-blur-xl">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-white/5"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="font-display text-lg font-bold">
            {getCurrentPageTitle(location.pathname)}
          </h1>
          <div className="w-10" />
        </header>

        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
