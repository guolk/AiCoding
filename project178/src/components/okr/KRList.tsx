import useAppStore from '@/store/useAppStore'
import type { KeyResult, MetricType } from '@/types'
import { METRIC_LABELS } from '@/types'
import { cn } from '@/lib/utils'
import { Plus, Pencil, BookOpen, GraduationCap, FileText, Clock, FolderKanban } from 'lucide-react'

interface KRListProps {
  okrId: string
  onEditKR: (kr: KeyResult) => void
}

const METRIC_ICONS: Record<MetricType, React.ReactNode> = {
  books: <BookOpen className="w-3.5 h-3.5" />,
  courses: <GraduationCap className="w-3.5 h-3.5" />,
  articles: <FileText className="w-3.5 h-3.5" />,
  hours: <Clock className="w-3.5 h-3.5" />,
  projects: <FolderKanban className="w-3.5 h-3.5" />,
}

function getProgressColor(pct: number): string {
  if (pct >= 70) return 'bg-[var(--color-success)]'
  if (pct >= 40) return 'bg-[var(--color-accent)]'
  return 'bg-[var(--color-warning)]'
}

function getProgressTextColor(pct: number): string {
  if (pct >= 70) return 'text-[var(--color-success)]'
  if (pct >= 40) return 'text-[var(--color-accent)]'
  return 'text-[var(--color-warning)]'
}

export default function KRList({ okrId, onEditKR }: KRListProps) {
  const keyResults = useAppStore((s) => s.keyResults.filter((kr) => kr.okrId === okrId).sort((a, b) => a.sortOrder - b.sortOrder))
  const addKeyResult = useAppStore((s) => s.addKeyResult)

  function handleAddKR() {
    const maxSort = keyResults.length > 0 ? Math.max(...keyResults.map((kr) => kr.sortOrder)) : 0
    const newKR: KeyResult = {
      id: crypto.randomUUID(),
      okrId,
      description: '',
      metricType: 'books',
      targetValue: 1,
      currentValue: 0,
      unit: METRIC_LABELS.books,
      sortOrder: maxSort + 1,
    }
    addKeyResult(newKR)
    onEditKR(newKR)
  }

  return (
    <div className="space-y-3">
      {keyResults.map((kr) => {
        const pct = kr.targetValue > 0 ? Math.min(Math.round((kr.currentValue / kr.targetValue) * 100), 100) : 0

        return (
          <div
            key={kr.id}
            className="group flex items-start gap-3 p-3 rounded-lg bg-[var(--color-bg-warm)] hover:bg-[var(--color-border-light)] transition-colors duration-200"
          >
            <div className="shrink-0 mt-0.5 text-[var(--color-text-muted)]">
              {METRIC_ICONS[kr.metricType]}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-sm text-[var(--color-text-primary)] truncate">{kr.description}</span>
                <button
                  onClick={() => onEditKR(kr)}
                  className="shrink-0 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white"
                >
                  <Pencil className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="progress-bar flex-1">
                  <div
                    className={cn('progress-bar-fill', getProgressColor(pct))}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className={cn('text-xs font-semibold shrink-0', getProgressTextColor(pct))}>
                  {pct}%
                </span>
                <span className="text-xs text-[var(--color-text-muted)] shrink-0">
                  {kr.currentValue}/{kr.targetValue}{kr.unit}
                </span>
              </div>
            </div>
          </div>
        )
      })}

      <button
        onClick={handleAddKR}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg border-2 border-dashed border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:border-[var(--color-primary-lighter)] hover:text-[var(--color-primary-lighter)] transition-colors duration-200"
      >
        <Plus className="w-4 h-4" />
        添加关键结果
      </button>
    </div>
  )
}
