import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, LibraryBig, MessageSquareText, Trophy, Users,
  ChevronLeft, ChevronRight, Swords, Trophy as TrophyIcon, BookOpen, GraduationCap, Target
} from 'lucide-react'
import { useAppStore } from '@/lib/utils'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '工作台' },
  { to: '/topics', icon: LibraryBig, label: '辩题库' },
  { to: '/arguments', icon: MessageSquareText, label: '论点整理' },
  { to: '/matches', icon: Trophy, label: '比赛管理' },
  { to: '/training', icon: Users, label: '队员训练' },
]

export default function Sidebar() {
  const { navOpen, setNavOpen } = useAppStore()
  const loc = useLocation()

  return (
    <aside
      className={cn(
        'shrink-0 h-screen sticky top-0 bg-gradient-to-b from-ink-900 via-ink-900 to-ink-950 text-white transition-all duration-300 flex flex-col shadow-ink z-20',
        navOpen ? 'w-64' : 'w-20'
      )}
    >
      <div className={cn('flex items-center gap-3 p-6 border-b border-white/10', !navOpen && 'justify-center px-4')}>
        <div className="w-10 h-10 rounded-xl bg-gold-500 text-ink-950 flex items-center justify-center shrink-0 shadow-lg">
          <Swords size={22} strokeWidth={2.5} />
        </div>
        {navOpen && (
          <div className="overflow-hidden animate-fade-in">
            <div className="font-serif text-lg font-bold text-gold-50 leading-tight">辩锋</div>
            <div className="text-xs text-gold-100/60 mt-0.5 tracking-wider">DEBATE MANAGEMENT</div>
          </div>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = loc.pathname === item.to
            || (item.to !== '/' && loc.pathname.startsWith(item.to))
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn('nav-link !text-ink-100/70 justify-start',
                isActive && '!bg-gold-500 !text-ink-950 shadow-ink !font-semibold',
                !navOpen && 'justify-center px-0'
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              {navOpen && <span className="animate-fade-in">{item.label}</span>}
            </NavLink>
          )
        })}

        {navOpen && (
          <div className="pt-4 mt-4 border-t border-white/10 px-2">
            <div className="text-xs font-semibold text-gold-100/40 tracking-widest uppercase mb-2 px-2">快捷统计</div>
            <div className="space-y-2 text-xs">
              <QuickStat icon={BookOpen} label="辩题" value="8" />
              <QuickStat icon={Target} label="论点" value="16" />
              <QuickStat icon={TrophyIcon} label="比赛" value="6" />
              <QuickStat icon={GraduationCap} label="队员" value="5" />
            </div>
          </div>
        )}
      </nav>

      <div className="p-3 border-t border-white/10">
        <button
          onClick={() => setNavOpen(!navOpen)}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-white/60 hover:bg-white/10 hover:text-white transition-colors',
            !navOpen && 'justify-center px-0'
          )}
        >
          {navOpen ? <>
            <ChevronLeft size={18} />
            <span className="text-sm">收起侧栏</span>
          </> : <ChevronRight size={18} />}
        </button>
      </div>
    </aside>
  )
}

function QuickStat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5">
      <div className="flex items-center gap-2 text-white/60">
        <Icon size={14} />
        <span>{label}</span>
      </div>
      <span className="font-bold text-gold-400">{value}</span>
    </div>
  )
}
