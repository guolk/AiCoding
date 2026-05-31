import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  Target,
  Headphones,
  Award,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const navItems = [
  { to: '/', label: '仪表盘', icon: LayoutDashboard },
  { to: '/basics', label: '基础知识', icon: BookOpen },
  { to: '/vocabulary', label: '词汇积累', icon: Layers },
  { to: '/exam-prep', label: '备考进度', icon: Target },
  { to: '/listening', label: '听说练习', icon: Headphones },
  { to: '/exam-history', label: '考试历史', icon: Award },
];

const levelColors: Record<string, string> = {
  N5: 'bg-n5-green',
  N4: 'bg-n4-blue',
  N3: 'bg-n3-purple',
  N2: 'bg-n2-amber',
  N1: 'bg-n1-crimson',
};

export default function Sidebar() {
  const profile = useAppStore((s) => s.profile);

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-60 flex-col bg-ink-light md:flex">
      <div className="flex flex-col gap-1 px-4 pt-6 pb-4">
        <h1 className="font-serif-jp text-xl font-bold text-pale-gold">
          JLPT勉強追跡
        </h1>
      </div>

      <div className="sakura-divider mx-4" />

      <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'border-l-3 border-vermillion text-vermillion bg-ink/40'
                  : 'text-warm-white/70 hover:bg-ink/25 hover:text-warm-white'
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-pale-gold/20 px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-warm-white/50">目標レベル</span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold text-white ${levelColors[profile.targetLevel] || 'bg-n3-purple'}`}
          >
            {profile.targetLevel}
          </span>
        </div>
      </div>
    </aside>
  );
}
