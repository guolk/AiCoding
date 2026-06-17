import { useMemo } from 'react'
import type { KnowledgeArea, KnowledgeDomain, LayerType } from '@/types'
import { LAYER_LABELS } from '@/types'
import { cn } from '@/lib/utils'

interface ThreeRingChartProps {
  areas: KnowledgeArea[]
  domains: KnowledgeDomain[]
  onAreaSelect: (area: KnowledgeArea) => void
  selectedAreaId?: string
}

const RING_CONFIG: { layer: LayerType; color: string; radius: number; label: string }[] = [
  { layer: 'general', color: '#7b68ee', radius: 170, label: LAYER_LABELS.general },
  { layer: 'support', color: '#2d6a4f', radius: 120, label: LAYER_LABELS.support },
  { layer: 'core', color: '#1e3a5f', radius: 70, label: LAYER_LABELS.core },
]

const SVG_SIZE = 400
const CENTER = SVG_SIZE / 2
const NODE_RADIUS = 16

export default function ThreeRingChart({ areas, domains, onAreaSelect, selectedAreaId }: ThreeRingChartProps) {
  const ringData = useMemo(() => {
    return RING_CONFIG.map((ring) => {
      const ringDomains = domains.filter((d) => d.layerType === ring.layer)
      const ringDomainIds = ringDomains.map((d) => d.id)
      const ringAreas = areas.filter((a) => ringDomainIds.includes(a.domainId))
      const nodeCount = ringAreas.length
      const angleStep = nodeCount > 0 ? (2 * Math.PI) / nodeCount : 0
      const startAngle = -Math.PI / 2

      const nodes = ringAreas.map((area, i) => {
        const angle = startAngle + i * angleStep
        const x = CENTER + ring.radius * Math.cos(angle)
        const y = CENTER + ring.radius * Math.sin(angle)
        const domain = domains.find((d) => d.id === area.domainId)
        return { area, x, y, domain, angle }
      })

      return { ...ring, nodes, nodeCount }
    })
  }, [areas, domains])

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        className="w-full max-w-[400px]"
        style={{ aspectRatio: '1 / 1' }}
      >
        {ringData.map((ring) => (
          <g key={ring.layer}>
            <circle
              cx={CENTER}
              cy={CENTER}
              r={ring.radius}
              fill="none"
              stroke={ring.color}
              strokeWidth={2}
              opacity={0.3}
              strokeDasharray="6 4"
            />
            <circle
              cx={CENTER}
              cy={CENTER}
              r={ring.radius}
              fill={ring.color}
              opacity={0.04}
            />
            <text
              x={CENTER + ring.radius + 8}
              y={CENTER - 4}
              fill={ring.color}
              fontSize={11}
              fontWeight={600}
              textAnchor="start"
              opacity={0.7}
            >
              {ring.label}
            </text>
            {ring.nodes.map((node) => (
              <g
                key={node.area.id}
                onClick={() => onAreaSelect(node.area)}
                className="cursor-pointer"
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_RADIUS}
                  fill="white"
                  stroke={node.area.isGap ? '#e07a5f' : ring.color}
                  strokeWidth={selectedAreaId === node.area.id ? 3 : 1.5}
                  strokeDasharray={node.area.isGap ? '4 3' : 'none'}
                  opacity={node.area.isGap ? 0.75 : 1}
                />
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_RADIUS - 4}
                  fill={node.area.isGap ? 'rgba(224,122,95,0.15)' : ring.color}
                  opacity={0.15}
                />
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={9}
                  fontWeight={500}
                  fill={node.area.isGap ? '#e07a5f' : ring.color}
                >
                  {node.area.name.length > 4 ? node.area.name.slice(0, 4) + '…' : node.area.name}
                </text>
                {selectedAreaId === node.area.id && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={NODE_RADIUS + 4}
                    fill="none"
                    stroke={ring.color}
                    strokeWidth={1.5}
                    opacity={0.4}
                  />
                )}
              </g>
            ))}
          </g>
        ))}

        <circle cx={CENTER} cy={CENTER} r={28} fill="#1e3a5f" opacity={0.08} />
        <circle cx={CENTER} cy={CENTER} r={28} fill="none" stroke="#1e3a5f" strokeWidth={1} opacity={0.2} />
        <text x={CENTER} y={CENTER} textAnchor="middle" dominantBaseline="central" fontSize={10} fill="#1e3a5f" fontWeight={600}>
          知识体系
        </text>
      </svg>

      <div className="flex gap-4 mt-2">
        {RING_CONFIG.map((ring) => (
          <div key={ring.layer} className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
            <span
              className={cn('w-2.5 h-2.5 rounded-full')}
              style={{ backgroundColor: ring.color }}
            />
            {ring.label}
          </div>
        ))}
      </div>
    </div>
  )
}
