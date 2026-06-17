import { Layers } from 'lucide-react'
import useAppStore from '@/store/useAppStore'
import { DEPTH_ORDER, DEPTH_LABELS, LAYER_LABELS } from '@/types'
import type { LayerType, DepthLevel } from '@/types'
import { cn } from '@/lib/utils'

const LAYER_COLORS: Record<LayerType, { bar: string; bg: string; text: string }> = {
  core: { bar: 'bg-[var(--color-layer-core)]', bg: 'bg-[rgba(30,58,95,0.08)]', text: 'text-[var(--color-layer-core)]' },
  support: { bar: 'bg-[var(--color-layer-support)]', bg: 'bg-[rgba(45,106,79,0.08)]', text: 'text-[var(--color-layer-support)]' },
  general: { bar: 'bg-[var(--color-layer-general)]', bg: 'bg-[rgba(123,104,238,0.08)]', text: 'text-[var(--color-layer-general)]' },
}

const DEPTH_COLORS: Record<DepthLevel, string> = {
  aware: 'bg-[var(--color-depth-aware)]',
  familiar: 'bg-[var(--color-depth-familiar)]',
  master: 'bg-[var(--color-depth-master)]',
}

export default function KnowledgeCoverage() {
  const { domains, areas } = useAppStore()

  const layers: LayerType[] = ['core', 'support', 'general']
  const coverageByLayer = layers.map(layer => {
    const layerDomains = domains.filter(d => d.layerType === layer)
    const layerDomainIds = layerDomains.map(d => d.id)
    const layerAreas = areas.filter(a => layerDomainIds.includes(a.domainId))
    const metCount = layerAreas.filter(a => DEPTH_ORDER.indexOf(a.currentDepth) >= DEPTH_ORDER.indexOf(a.depthTarget)).length
    const byDepth = DEPTH_ORDER.map(depth => ({
      depth,
      count: layerAreas.filter(a => a.currentDepth === depth).length,
    }))
    return {
      layer,
      total: layerAreas.length,
      met: metCount,
      byDepth,
    }
  })

  const totalMet = coverageByLayer.reduce((s, l) => s + l.met, 0)
  const totalAreas = coverageByLayer.reduce((s, l) => s + l.total, 0)
  const coverageRate = totalAreas > 0 ? Math.round((totalMet / totalAreas) * 100) : 0

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-5">
        <Layers className="w-5 h-5 text-[var(--color-layer-support)]" />
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">知识覆盖度</h3>
        <span className="ml-auto text-sm font-semibold text-[var(--color-success)]">{coverageRate}%</span>
      </div>

      <div className="space-y-5">
        {coverageByLayer.map(item => {
          const colors = LAYER_COLORS[item.layer]
          return (
            <div key={item.layer}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={cn('w-2.5 h-2.5 rounded-full', colors.bar)} />
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">{LAYER_LABELS[item.layer]}</span>
                </div>
                <span className="text-xs text-[var(--color-text-muted)]">{item.met}/{item.total} 达标</span>
              </div>
              <div className="flex gap-0.5 h-6 rounded-lg overflow-hidden bg-[var(--color-bg-warm)]">
                {item.total > 0 ? (
                  item.byDepth.map(d => (
                    d.count > 0 && (
                      <div
                        key={d.depth}
                        className={cn('flex items-center justify-center text-[10px] font-medium text-white transition-all duration-500', DEPTH_COLORS[d.depth])}
                        style={{ width: `${(d.count / item.total) * 100}%` }}
                        title={`${DEPTH_LABELS[d.depth]}: ${d.count}个`}
                      >
                        {d.count}
                      </div>
                    )
                  ))
                ) : (
                  <div className="flex-1 flex items-center justify-center text-xs text-[var(--color-text-muted)]">暂无数据</div>
                )}
              </div>
              <div className="flex gap-3 mt-1.5">
                {DEPTH_ORDER.map(depth => (
                  <div key={depth} className="flex items-center gap-1">
                    <span className={cn('w-2 h-2 rounded-sm', DEPTH_COLORS[depth])} />
                    <span className="text-[10px] text-[var(--color-text-muted)]">{DEPTH_LABELS[depth]}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
