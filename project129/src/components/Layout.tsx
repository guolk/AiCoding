import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  Target,
  Headphones,
  Award,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import SetupModal from '@/components/SetupModal';
import { useAppStore } from '@/store/useAppStore';

const navItems = [
  { to: '/', label: '仪表盘', icon: LayoutDashboard },
  { to: '/basics', label: '基础知识', icon: BookOpen },
  { to: '/vocabulary', label: '词汇积累', icon: Layers },
  { to: '/exam-prep', label: '备考进度', icon: Target },
  { to: '/listening', label: '听说练习', icon: Headphones },
  { to: '/exam-history', label: '考试历史', icon: Award },
];

export default function Layout() {
  const profile = useAppStore((s) => s.profile);

  return (
    <div className="min-h-screen bg-ink">
      <Sidebar />

      <div className="md:ml-60">
        <header className="sticky top-0 z-30 flex items-center gap-2 overflow-x-auto border-b border-pale-gold/10 bg-ink/90 px-4 py-2 backdrop-blur-sm md:hidden">
          <span className="font-serif-jp text-sm font-bold text-pale-gold whitespace-nowrap">
            JLPT勉強追跡
          </span>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-vermillion bg-ink/60'
                    : 'text-warm-white/70 hover:bg-ink/30 hover:text-warm-white'
                }`
              }
            >
              <Icon size={14} />
              <span>{label}</span>
            </NavLink>
          ))}
        </header>

        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>

      {!profile.isSetup && <SetupModal />}
    </div>
  );
}
