import type { UseCase, KnowledgeArea } from '@/types'
import { Plus, Pencil, Trash2, Target, Lightbulb, BookOpen } from 'lucide-react'

interface CaseTimelineProps {
  useCases: UseCase[]
  areas: KnowledgeArea[]
  onAdd: () => void
  onEdit: (uc: UseCase) => void
  onDelete: (id: string) => void
}

export default function CaseTimeline({ useCases, areas, onAdd, onEdit, onDelete }: CaseTimelineProps) {
  const sorted = [...useCases].sort(
    (a, b) => new Date(b.occurredDate).getTime() - new Date(a.occurredDate).getTime()
  )

  function getAreaName(areaId: string) {
    return areas.find((a) => a.id === areaId)?.name ?? '未知领域'
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-serif font-bold text-[var(--color-text-primary)]">应用实践时间线</h2>
        <button className="btn-primary flex items-center gap-1.5 text-sm" onClick={onAdd}>
          <Plus className="w-4 h-4" />
          新增案例
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-muted)]">
          <p className="text-sm">暂无应用案例</p>
          <p className="text-xs mt-1">记录你在实际场景中应用知识的经历</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[72px] top-0 bottom-0 w-0.5 bg-indigo-200" />

          <div className="space-y-6">
            {sorted.map((uc, idx) => (
              <div key={uc.id} className="relative flex gap-4 animate-fade-in-up" style={{ animationDelay: `${idx * 0.06}s` }}>
                <div className="w-[72px] shrink-0 text-right pt-1">
                  <span className="text-[11px] font-medium text-indigo-500">
                    {formatDate(uc.occurredDate)}
                  </span>
                </div>

                <div className="relative shrink-0 pt-1.5">
                  <div className="w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-indigo-100" />
                </div>

                <div className="flex-1 card-static p-4 rounded-xl group min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">{uc.title}</h4>
                      <span className="text-[10px] text-[var(--color-text-muted)]">{getAreaName(uc.areaId)}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => onEdit(uc)}
                        className="p-1 rounded hover:bg-[var(--color-bg-warm)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(uc.id)}
                        className="p-1 rounded hover:bg-red-50 text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Target className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[10px] font-medium text-amber-600">场景</span>
                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{uc.scenario}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[10px] font-medium text-indigo-600">应用</span>
                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{uc.application}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[10px] font-medium text-emerald-600">心得</span>
                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{uc.lessonsLearned}</p>
                      </div>
                    </div>
                  </div>

                  {uc.result && (
                    <div className="mt-2 pt-2 border-t border-[var(--color-border-light)]">
                      <span className="text-[10px] font-medium text-[var(--color-accent)]">结果</span>
                      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{uc.result}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
