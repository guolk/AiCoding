import useAppStore from '@/store/useAppStore'
import type { OKRStatus } from '@/types'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

const QUARTERS = ['2026-Q1', '2026-Q2', '2026-Q3', '2026-Q4']

function getQuarterStatus(okrs: { status: OKRStatus }[]): OKRStatus {
  if (okrs.length === 0) return 'planning'
  if (okrs.every((o) => o.status === 'completed')) return 'completed'
  if (okrs.some((o) => o.status === 'active')) return 'active'
  return 'planning'
}

export default function QuarterTimeline() {
  const currentQuarter = useAppStore((s) => s.currentQuarter)
  const okrs = useAppStore((s) => s.okrs)
  const setCurrentQuarter = useAppStore((s) => s.setCurrentQuarter)

  return (
    <div className="card-static p-5 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-[var(--color-text-primary)]">季度时间线</h3>
      </div>

      <div className="relative flex items-center justify-between px-4">
        <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-[var(--color-border)] -translate-y-1/2" />

        {QUARTERS.map((q) => {
          const quarterOKRs = okrs.filter((o) => o.quarter === q)
          const status = getQuarterStatus(quarterOKRs)
          const isCurrent = q === currentQuarter

          return (
            <button
              key={q}
              onClick={() => setCurrentQuarter(q)}
              className="relative flex flex-col items-center gap-2 z-10 group"
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                  isCurrent
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)] shadow-lg shadow-primary/20 scale-110'
                    : 'border-[var(--color-border)] bg-white group-hover:border-[var(--color-primary-light)] group-hover:scale-105'
                )}
              >
                {status === 'completed' && (
                  <Check className={cn('w-4 h-4', isCurrent ? 'text-white' : 'text-[var(--color-success)]')} />
                )}
                {status === 'active' && (
                  <div className={cn('w-3 h-3 rounded-full', isCurrent ? 'bg-white' : 'bg-[var(--color-accent)]')} />
                )}
                {status === 'planning' && (
                  <div className={cn('w-3 h-3 rounded-full', isCurrent ? 'bg-white/70' : 'bg-[var(--color-border)]')} />
                )}
              </div>

              <span
                className={cn(
                  'text-xs font-medium transition-colors duration-200',
                  isCurrent
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)]'
                )}
              >
                {q}
              </span>

              {quarterOKRs.length > 0 && (
                <span className="text-[10px] text-[var(--color-text-muted)]">
                  {quarterOKRs.length}个目标
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
