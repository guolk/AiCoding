import type { KnowledgeArea, KnowledgeDomain } from '@/types'
import { DEPTH_LABELS } from '@/types'
import { AlertTriangle, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GapAnalysisProps {
  areas: KnowledgeArea[]
  domains: KnowledgeDomain[]
  onAreaSelect: (area: KnowledgeArea) => void
}

function getSeverityConfig(severity: number) {
  if (severity > 0.7) return { label: '高', color: '#e07a5f', bg: 'rgba(224,122,95,0.12)' }
  if (severity >= 0.4) return { label: '中', color: '#d4a857', bg: 'rgba(212,168,87,0.12)' }
  return { label: '低', color: '#8a8aa0', bg: 'rgba(138,138,160,0.1)' }
}

export default function GapAnalysis({ areas, domains, onAreaSelect }: GapAnalysisProps) {
  const gapAreas = areas
    .filter((a) => a.isGap)
    .sort((a, b) => b.gapSeverity - a.gapSeverity)

  const highSeverityGaps = gapAreas.filter((a) => a.gapSeverity > 0.7)

  return (
    <div className="card-static p-5 rounded-xl h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-[var(--color-warning)]" />
        <h3 className="text-base font-semibold text-[var(--color-text-primary)]">差距分析</h3>
        <span className="badge text-[11px] ml-auto" style={{ backgroundColor: 'rgba(224,122,95,0.1)', color: '#e07a5f' }}>
          {gapAreas.length} 项差距
        </span>
      </div>

      {gapAreas.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-[var(--color-text-muted)]">
          暂无差距项，知识体系覆盖完整
        </div>
      ) : (
        <div className="flex-1 space-y-2 overflow-y-auto">
          {gapAreas.map((area) => {
            const domain = domains.find((d) => d.id === area.domainId)
            const severity = getSeverityConfig(area.gapSeverity)
            return (
              <div
                key={area.id}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[var(--color-bg-warm)] cursor-pointer transition-colors"
                onClick={() => onAreaSelect(area)}
              >
                <div
                  className="w-1.5 h-8 rounded-full shrink-0"
                  style={{ backgroundColor: severity.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--color-text-primary)] truncate">{area.name}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">{domain?.name}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={cn('badge text-[11px] px-1.5 py-0.5')}
                    style={{ backgroundColor: severity.bg, color: severity.color }}
                  >
                    {severity.label}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs shrink-0">
                  <span className="text-[var(--color-text-muted)]">{DEPTH_LABELS[area.currentDepth]}</span>
                  <span className="text-[var(--color-text-muted)]">→</span>
                  <span className="text-[var(--color-primary)]">{DEPTH_LABELS[area.depthTarget]}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {highSeverityGaps.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[var(--color-border-light)]">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">优先建议</span>
          </div>
          <div className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            建议优先关注高严重度差距：
            {highSeverityGaps.map((g, i) => (
              <span key={g.id} className="font-medium text-[var(--color-warning)]">
                {i > 0 ? '、' : ''}{g.name}
              </span>
            ))}
            ，制定专项提升计划。
          </div>
        </div>
      )}
    </div>
  )
}
