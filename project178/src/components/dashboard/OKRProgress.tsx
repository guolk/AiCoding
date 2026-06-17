import { Target } from 'lucide-react'
import useAppStore from '@/store/useAppStore'
import { cn } from '@/lib/utils'

export default function OKRProgress() {
  const { okrs, keyResults, currentQuarter } = useAppStore()

  const activeOKRs = okrs.filter(o => o.quarter === currentQuarter && o.status === 'active')

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-5">
        <Target className="w-5 h-5 text-[var(--color-accent)]" />
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">当季OKR进度</h3>
        <span className="ml-auto text-sm text-[var(--color-text-muted)]">{currentQuarter}</span>
      </div>

      {activeOKRs.length === 0 ? (
        <div className="text-center py-8 text-[var(--color-text-muted)]">暂无进行中的OKR</div>
      ) : (
        <div className="space-y-6">
          {activeOKRs.map(okr => {
            const krs = keyResults
              .filter(kr => kr.okrId === okr.id)
              .sort((a, b) => a.sortOrder - b.sortOrder)
            const avgProgress = krs.length > 0
              ? Math.round(krs.reduce((s, kr) => s + (kr.targetValue > 0 ? (kr.currentValue / kr.targetValue) * 100 : 0), 0) / krs.length)
              : 0

            return (
              <div key={okr.id}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-[var(--color-text-primary)] leading-snug flex-1 mr-3">{okr.objective}</h4>
                  <span className={cn(
                    'text-sm font-semibold shrink-0',
                    avgProgress >= 70 ? 'text-[var(--color-success)]' : avgProgress >= 40 ? 'text-[var(--color-accent)]' : 'text-[var(--color-warning)]'
                  )}>{avgProgress}%</span>
                </div>
                <div className="space-y-2.5">
                  {krs.map(kr => {
                    const progress = kr.targetValue > 0 ? Math.min(Math.round((kr.currentValue / kr.targetValue) * 100), 100) : 0
                    return (
                      <div key={kr.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-[var(--color-text-secondary)] flex-1 mr-2 truncate">{kr.description}</span>
                          <span className="text-xs text-[var(--color-text-muted)] shrink-0">{kr.currentValue}/{kr.targetValue}{kr.unit}</span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className={cn(
                              'progress-bar-fill',
                              progress >= 70 ? 'bg-[var(--color-success)]' : progress >= 40 ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-warning)]'
                            )}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
