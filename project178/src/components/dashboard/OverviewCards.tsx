import { Brain, Target, BookOpen, Clock } from 'lucide-react'
import useAppStore from '@/store/useAppStore'
import { cn } from '@/lib/utils'

export default function OverviewCards() {
  const { areas, okrs, keyResults, resources, learningTimes, currentQuarter } = useAppStore()

  const totalAreas = areas.length

  const activeOKRs = okrs.filter(o => o.quarter === currentQuarter && o.status === 'active')
  const activeKRIds = activeOKRs.map(o => o.id)
  const activeKRs = keyResults.filter(kr => activeKRIds.includes(kr.okrId))
  const okrProgress = activeKRs.length > 0
    ? Math.round(activeKRs.reduce((sum, kr) => sum + (kr.targetValue > 0 ? (kr.currentValue / kr.targetValue) * 100 : 0), 0) / activeKRs.length)
    : 0

  const completedResources = resources.filter(r => r.status === 'completed').length
  const resourceRate = resources.length > 0
    ? Math.round((completedResources / resources.length) * 100)
    : 0

  const weeklyHours = learningTimes.reduce((sum, lt) => sum + lt.weeklyHours, 0)

  const cards = [
    { icon: Brain, label: '知识领域总数', value: totalAreas, suffix: '个', color: 'text-[var(--color-layer-core)]', bg: 'bg-[rgba(30,58,95,0.08)]' },
    { icon: Target, label: '当季OKR进度', value: okrProgress, suffix: '%', color: 'text-[var(--color-accent)]', bg: 'bg-[rgba(212,168,87,0.1)]' },
    { icon: BookOpen, label: '学习资源完成率', value: resourceRate, suffix: '%', color: 'text-[var(--color-success)]', bg: 'bg-[rgba(45,106,79,0.08)]' },
    { icon: Clock, label: '本周学习时长', value: weeklyHours, suffix: '小时', color: 'text-[var(--color-layer-general)]', bg: 'bg-[rgba(123,104,238,0.08)]' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className={cn(
            'card p-5 flex items-center gap-4 animate-fade-in-up',
            `stagger-${i + 1}`
          )}
        >
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', card.bg)}>
            <card.icon className={cn('w-6 h-6', card.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-[var(--color-text-muted)] truncate">{card.label}</div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-[var(--color-text-primary)]">{card.value}</span>
              <span className="text-sm text-[var(--color-text-secondary)]">{card.suffix}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
