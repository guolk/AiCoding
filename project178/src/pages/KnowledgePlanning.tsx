import { useState } from 'react'
import useAppStore from '@/store/useAppStore'
import type { KnowledgeArea } from '@/types'
import { DEPTH_ORDER } from '@/types'
import { Plus } from 'lucide-react'
import ThreeRingChart from '@/components/knowledge/ThreeRingChart'
import GapAnalysis from '@/components/knowledge/GapAnalysis'
import DepthProgress from '@/components/knowledge/DepthProgress'
import AreaEditor from '@/components/knowledge/AreaEditor'

export default function KnowledgePlanning() {
  const domains = useAppStore((s) => s.domains)
  const areas = useAppStore((s) => s.areas)
  const addArea = useAppStore((s) => s.addArea)
  const updateArea = useAppStore((s) => s.updateArea)

  const [selectedArea, setSelectedArea] = useState<KnowledgeArea | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)

  function handleAreaSelect(area: KnowledgeArea) {
    setSelectedArea((prev) => (prev?.id === area.id ? null : area))
  }

  function handleAddArea() {
    setSelectedArea(null)
    setEditorOpen(true)
  }

  function handleEditArea(area: KnowledgeArea) {
    setSelectedArea(area)
    setEditorOpen(true)
  }

  function handleSave(area: KnowledgeArea) {
    const existing = areas.find((a) => a.id === area.id)
    const currentIdx = DEPTH_ORDER.indexOf(area.currentDepth)
    const targetIdx = DEPTH_ORDER.indexOf(area.depthTarget)
    const isGap = currentIdx < targetIdx
    const gapSeverity = isGap ? Math.round(((targetIdx - currentIdx) / (DEPTH_ORDER.length - 1)) * 100) / 100 : 0

    const finalArea = { ...area, isGap, gapSeverity }

    if (existing) {
      updateArea(area.id, finalArea)
    } else {
      addArea(finalArea)
    }
    setEditorOpen(false)
    setSelectedArea(null)
  }

  function handleCancel() {
    setEditorOpen(false)
    setSelectedArea(null)
  }

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[var(--color-text-primary)]">知识规划</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">构建你的知识体系，识别差距，明确方向</p>
        </div>
        <button className="btn-primary flex items-center gap-1.5" onClick={handleAddArea}>
          <Plus className="w-4 h-4" />
          新增领域
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="card-static p-5 rounded-xl">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-3">知识体系全景</h3>
          <ThreeRingChart
            areas={areas}
            domains={domains}
            onAreaSelect={handleAreaSelect}
            selectedAreaId={selectedArea?.id}
          />
          {selectedArea && (
            <div
              className="mt-3 p-3 rounded-lg bg-[var(--color-bg-warm)] cursor-pointer"
              onClick={() => handleEditArea(selectedArea)}
            >
              <div className="text-sm font-medium text-[var(--color-text-primary)]">{selectedArea.name}</div>
              <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{selectedArea.description}</div>
            </div>
          )}
        </div>

        <GapAnalysis areas={areas} domains={domains} onAreaSelect={handleEditArea} />
      </div>

      <DepthProgress areas={areas} />

      {editorOpen && (
        <AreaEditor
          area={selectedArea}
          domains={domains}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}
