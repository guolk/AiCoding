import type { KnowledgeArea, DepthLevel } from '@/types'
import { DEPTH_LABELS, DEPTH_ORDER } from '@/types'
import { cn } from '@/lib/utils'

interface DepthProgressProps {
  areas: KnowledgeArea[]
}

const DEPTH_COLORS: Record<DepthLevel, string> = {
  aware: '#c5d5e5',
  familiar: '#6b95c0',
  master: '#1e3a5f',
}

function getDepthIndex(depth: DepthLevel): number {
  return DEPTH_ORDER.indexOf(depth)
}

function DepthBadge({ depth }: { depth: DepthLevel }) {
  return (
    <span
      className={cn('badge text-[11px] px-2 py-0.5')}
      style={{
        backgroundColor: DEPTH_COLORS[depth] + '22',
        color: DEPTH_COLORS[depth],
      }}
    >
      {DEPTH_LABELS[depth]}
    </span>
  )
}

export default function DepthProgress({ areas }: DepthProgressProps) {
  const sortedAreas = [...areas].sort((a, b) => {
    const gapA = getDepthIndex(a.depthTarget) - getDepthIndex(a.currentDepth)
    const gapB = getDepthIndex(b.depthTarget) - getDepthIndex(b.currentDepth)
    return gapB - gapA
  })

  return (
    <div className="card-static p-5 rounded-xl">
      <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">深度进度总览</h3>
      <div className="space-y-3">
        {sortedAreas.map((area) => {
          const currentIndex = getDepthIndex(area.currentDepth)
          const targetIndex = getDepthIndex(area.depthTarget)
          const totalSteps = DEPTH_ORDER.length - 1
          const filledSteps = targetIndex
          const progressPercent = totalSteps > 0 ? (currentIndex / totalSteps) * 100 : 100
          const targetPercent = totalSteps > 0 ? (targetIndex / totalSteps) * 100 : 100

          return (
            <div key={area.id} className="flex items-center gap-3 group">
              <div className="w-28 shrink-0 text-sm font-medium text-[var(--color-text-primary)] truncate" title={area.name}>
                {area.name}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <DepthBadge depth={area.currentDepth} />
                <span className="text-[var(--color-text-muted)] text-xs">→</span>
                <DepthBadge depth={area.depthTarget} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="relative h-2.5 rounded-full bg-[var(--color-bg-warm)]">
                  <div
                    className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${targetPercent}%`,
                      backgroundColor: DEPTH_COLORS[area.depthTarget] + '33',
                    }}
                  />
                  <div
                    className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progressPercent}%`,
                      backgroundColor: DEPTH_COLORS[area.currentDepth],
                    }}
                  />
                  {Array.from({ length: filledSteps }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-0 h-full w-px bg-white/50"
                      style={{ left: `${((i + 1) / totalSteps) * 100}%` }}
                    />
                  ))}
                </div>
              </div>
              {area.isGap && (
                <span className="text-xs text-[var(--color-warning)] shrink-0">差距</span>
              )}
            </div>
          )
        })}
      </div>
      <div className="flex gap-4 mt-4 pt-3 border-t border-[var(--color-border-light)]">
        {DEPTH_ORDER.map((depth) => (
          <div key={depth} className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: DEPTH_COLORS[depth] }}
            />
            {DEPTH_LABELS[depth]}
          </div>
        ))}
      </div>
    </div>
  )
}
