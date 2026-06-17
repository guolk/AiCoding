import { useState } from 'react'
import useAppStore from '@/store/useAppStore'
import type { QuarterlyOKR, KeyResult, OKRStatus } from '@/types'
import { Plus, Target } from 'lucide-react'
import QuarterTimeline from '@/components/okr/QuarterTimeline'
import ObjectiveCard from '@/components/okr/ObjectiveCard'
import KRList from '@/components/okr/KRList'
import KREditor from '@/components/okr/KREditor'

export default function OKRPlanning() {
  const okrs = useAppStore((s) => s.okrs)
  const areas = useAppStore((s) => s.areas)
  const keyResults = useAppStore((s) => s.keyResults)
  const currentQuarter = useAppStore((s) => s.currentQuarter)
  const addOKR = useAppStore((s) => s.addOKR)
  const updateOKR = useAppStore((s) => s.updateOKR)
  const deleteOKR = useAppStore((s) => s.deleteOKR)
  const updateKeyResult = useAppStore((s) => s.updateKeyResult)
  const deleteKeyResult = useAppStore((s) => s.deleteKeyResult)

  const [showNewOKR, setShowNewOKR] = useState(false)
  const [newOKRForm, setNewOKRForm] = useState({ objective: '', vision: '', focusAreaId: '', status: 'planning' as OKRStatus })
  const [editingKR, setEditingKR] = useState<KeyResult | null>(null)

  const quarterOKRs = okrs.filter((o) => o.quarter === currentQuarter)

  function handleCreateOKR() {
    if (!newOKRForm.objective.trim() || !newOKRForm.focusAreaId) return
    const newOKR: QuarterlyOKR = {
      id: crypto.randomUUID(),
      quarter: currentQuarter,
      focusAreaId: newOKRForm.focusAreaId,
      objective: newOKRForm.objective,
      vision: newOKRForm.vision,
      status: newOKRForm.status,
    }
    addOKR(newOKR)
    setNewOKRForm({ objective: '', vision: '', focusAreaId: '', status: 'planning' })
    setShowNewOKR(false)
  }

  function handleUpdateOKR(id: string, updates: Partial<QuarterlyOKR>) {
    updateOKR(id, updates)
  }

  function handleDeleteOKR(id: string) {
    keyResults.filter((kr) => kr.okrId === id).forEach((kr) => deleteKeyResult(kr.id))
    deleteOKR(id)
  }

  function handleEditKR(kr: KeyResult) {
    setEditingKR(kr)
  }

  function handleSaveKR(kr: KeyResult) {
    updateKeyResult(kr.id, kr)
    setEditingKR(null)
  }

  function handleCancelKR() {
    if (editingKR && !editingKR.description.trim()) {
      deleteKeyResult(editingKR.id)
    }
    setEditingKR(null)
  }

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[var(--color-text-primary)]">OKR 规划</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">制定季度目标与关键结果，追踪学习进展</p>
        </div>
        <button
          className="btn-primary flex items-center gap-1.5"
          onClick={() => setShowNewOKR(true)}
        >
          <Plus className="w-4 h-4" />
          新建目标
        </button>
      </div>

      <div className="mb-6">
        <QuarterTimeline />
      </div>

      {showNewOKR && (
        <div className="card-static p-5 rounded-xl mb-5 animate-fade-in-up">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">新建 OKR 目标</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">目标描述</label>
              <input
                type="text"
                className="input-field"
                value={newOKRForm.objective}
                onChange={(e) => setNewOKRForm((p) => ({ ...p, objective: e.target.value }))}
                placeholder="描述你的季度目标"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">愿景</label>
              <input
                type="text"
                className="input-field"
                value={newOKRForm.vision}
                onChange={(e) => setNewOKRForm((p) => ({ ...p, vision: e.target.value }))}
                placeholder="达成目标后的愿景"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">聚焦领域</label>
              <select
                className="input-field"
                value={newOKRForm.focusAreaId}
                onChange={(e) => setNewOKRForm((p) => ({ ...p, focusAreaId: e.target.value }))}
              >
                <option value="">请选择聚焦领域</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button className="btn-ghost" onClick={() => setShowNewOKR(false)}>取消</button>
              <button
                className="btn-primary"
                onClick={handleCreateOKR}
                disabled={!newOKRForm.objective.trim() || !newOKRForm.focusAreaId}
                style={{ opacity: (!newOKRForm.objective.trim() || !newOKRForm.focusAreaId) ? 0.5 : 1, cursor: (!newOKRForm.objective.trim() || !newOKRForm.focusAreaId) ? 'not-allowed' : 'pointer' }}
              >
                创建目标
              </button>
            </div>
          </div>
        </div>
      )}

      {quarterOKRs.length === 0 ? (
        <div className="card-static p-12 rounded-xl text-center">
          <Target className="w-12 h-12 text-[var(--color-border)] mx-auto mb-3" />
          <p className="text-[var(--color-text-muted)] mb-1">当前季度暂无 OKR 目标</p>
          <p className="text-sm text-[var(--color-text-muted)]">点击「新建目标」开始规划</p>
        </div>
      ) : (
        <div className="space-y-5">
          {quarterOKRs.map((okr) => {
            const area = areas.find((a) => a.id === okr.focusAreaId)
            return (
              <div key={okr.id} className="card-static p-5 rounded-xl">
                <ObjectiveCard
                  okr={okr}
                  area={area}
                  onUpdate={handleUpdateOKR}
                  onDelete={handleDeleteOKR}
                />
                <div className="mt-4 pt-4 border-t border-[var(--color-border-light)]">
                  <KRList okrId={okr.id} onEditKR={handleEditKR} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {editingKR && (
        <KREditor
          kr={editingKR}
          okrId={editingKR.okrId}
          onSave={handleSaveKR}
          onCancel={handleCancelKR}
        />
      )}
    </div>
  )
}
