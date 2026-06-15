import { useState } from 'react'
import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Flag,
  Users,
  Timer,
  Trophy,
  BarChart3,
  ChevronDown,
  ChevronRight,
  CalendarDays,
  User,
  Bell,
  Search,
  Info,
  Route,
  HandHeart,
  ListOrdered,
  ReceiptText,
  PackageCheck,
  Clock,
  Award,
  Crown,
  Gift,
  Target,
  Activity,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEventStore } from '@/store'
import Badge from './Badge'

interface NavItem {
  to: string
  label: string
  icon: ReactNode
}

interface NavGroup {
  label: string
  icon: ReactNode
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: '仪表盘',
    icon: <LayoutDashboard className="w-4 h-4" />,
    items: [
      { to: '/dashboard', label: '总览', icon: <LayoutDashboard className="w-4 h-4" /> },
    ],
  },
  {
    label: '赛事管理',
    icon: <Flag className="w-4 h-4" />,
    items: [
      { to: '/event/info', label: '基础信息', icon: <Info className="w-4 h-4" /> },
      { to: '/event/route', label: '路线规划', icon: <Route className="w-4 h-4" /> },
      { to: '/event/volunteers', label: '志愿者管理', icon: <HandHeart className="w-4 h-4" /> },
    ],
  },
  {
    label: '报名管理',
    icon: <Users className="w-4 h-4" />,
    items: [
      { to: '/registration/list', label: '参赛者列表', icon: <ListOrdered className="w-4 h-4" /> },
      { to: '/registration/bibs', label: '号码布分配', icon: <ReceiptText className="w-4 h-4" /> },
      { to: '/registration/pickup', label: '参赛包领取', icon: <PackageCheck className="w-4 h-4" /> },
    ],
  },
  {
    label: '计时成绩',
    icon: <Timer className="w-4 h-4" />,
    items: [
      { to: '/timing/record', label: '计时记录', icon: <Clock className="w-4 h-4" /> },
      { to: '/timing/results', label: '成绩榜单', icon: <Award className="w-4 h-4" /> },
    ],
  },
  {
    label: '奖项管理',
    icon: <Trophy className="w-4 h-4" />,
    items: [
      { to: '/awards/settings', label: '奖项设置', icon: <Crown className="w-4 h-4" /> },
      { to: '/awards/winners', label: '颁奖流程', icon: <Trophy className="w-4 h-4" /> },
      { to: '/awards/prizes', label: '奖品发放', icon: <Gift className="w-4 h-4" /> },
    ],
  },
  {
    label: '赛后分析',
    icon: <BarChart3 className="w-4 h-4" />,
    items: [
      { to: '/analysis/finish', label: '完赛率', icon: <Target className="w-4 h-4" /> },
      { to: '/analysis/timing', label: '时间分布', icon: <Activity className="w-4 h-4" /> },
      { to: '/analysis/survey', label: '满意度', icon: <MessageSquare className="w-4 h-4" /> },
    ],
  },
]

const statusMap = {
  draft: { text: '草稿', variant: 'gray' as const },
  registration: { text: '报名中', variant: 'blue' as const },
  ongoing: { text: '进行中', variant: 'green' as const },
  finished: { text: '已结束', variant: 'orange' as const },
}

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const { currentEvent } = useEventStore()
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const active = new Set<string>()
    navGroups.forEach((group) => {
      if (group.items.some((item) => location.pathname.startsWith(item.to))) {
        active.add(group.label)
      }
    })
    if (active.size === 0) active.add('仪表盘')
    return active
  })

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(label)) {
        next.delete(label)
      } else {
        next.add(label)
      }
      return next
    })
  }

  const status = currentEvent ? statusMap[currentEvent.status] : statusMap.draft

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    } catch {
      return dateStr
    }
  }

  return (
    <div className="flex h-screen w-screen bg-dark-950 text-gray-200 overflow-hidden">
      <aside className="w-[260px] shrink-0 bg-dark-900 border-r border-dark-700 flex flex-col">
        <div className="px-5 py-5 border-b border-dark-700">
          <div className="flex items-center gap-3">
            <div className="relative p-2 bg-racing-green/10 border border-racing-green/30">
              <Flag className="w-6 h-6 text-racing-green" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-racing-green animate-pulse" />
            </div>
            <div>
              <div className="font-display text-base font-bold text-gray-100 leading-tight">
                RACE CONTROL
              </div>
              <div className="text-[10px] text-racing-green/70 tracking-[0.2em] uppercase mt-0.5">
                Management System
              </div>
            </div>
          </div>
          {currentEvent && (
            <div className="mt-4 pt-4 border-t border-dark-700/50">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
                当前赛事
              </div>
              <div className="text-sm font-medium text-gray-200 truncate">
                {currentEvent.name}
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <CalendarDays className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-500">
                  {formatDate(currentEvent.date)}
                </span>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          {navGroups.map((group) => {
            const isExpanded = expandedGroups.has(group.label)
            const hasActiveChild = group.items.some((item) =>
              location.pathname.startsWith(item.to)
            )
            return (
              <div key={group.label} className="mb-1">
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={cn(
                    'w-full flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors',
                    hasActiveChild
                      ? 'text-gray-100 bg-dark-800/50'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-dark-800/30'
                  )}
                >
                  <span className={cn(
                    'p-1.5 border',
                    hasActiveChild
                      ? 'bg-racing-green/10 border-racing-green/30 text-racing-green'
                      : 'bg-dark-800 border-dark-700 text-gray-500'
                  )}>
                    {group.icon}
                  </span>
                  <span className="flex-1 text-left">{group.label}</span>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                {isExpanded && (
                  <div className="border-l border-dark-700 ml-8 my-1">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 px-4 py-2.5 text-sm transition-all border-l-2 -ml-px',
                            isActive
                              ? 'text-racing-green bg-racing-green/5 border-l-racing-green'
                              : 'text-gray-400 hover:text-gray-200 hover:bg-dark-800/30 border-l-transparent'
                          )
                        }
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="px-5 py-4 border-t border-dark-700">
          <div className="text-[10px] text-gray-600 tracking-wider uppercase">
            System Status
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 bg-racing-green animate-pulse" />
            <span className="text-xs text-gray-400">在线运行中</span>
          </div>
          <div className="text-[10px] text-gray-600 mt-2">
            v1.0.0 · Race Control
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 shrink-0 bg-dark-900 border-b border-dark-700 flex items-center justify-between px-6">
          <div className="flex items-center gap-6">
            {currentEvent && (
              <>
                <div className="flex items-center gap-3">
                  <Flag className="w-5 h-5 text-racing-green" />
                  <div>
                    <div className="font-display text-base font-semibold text-gray-100 leading-tight">
                      {currentEvent.name}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {formatDate(currentEvent.date)}
                      </span>
                      <span>·</span>
                      <span>{currentEvent.location}</span>
                    </div>
                  </div>
                </div>
                <Badge text={status.text} variant={status.variant} />
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="搜索参赛者、号码布..."
                className="w-64 bg-dark-800 border border-dark-600 pl-9 pr-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-racing-green/50 focus:shadow-glow-sm transition-all"
              />
            </div>
            <button className="relative p-2 text-gray-400 hover:text-gray-200 hover:bg-dark-800 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-racing-orange rounded-full" />
            </button>
            <div className="h-8 w-px bg-dark-700" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-200">赛事管理员</div>
                <div className="text-xs text-gray-500">admin@race.control</div>
              </div>
              <div className="w-9 h-9 bg-dark-800 border border-dark-600 flex items-center justify-center text-gray-400">
                <User className="w-5 h-5" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-dark-950 p-6">
          <div className="min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
