import { useState } from 'react'
import type { QuarterlyOKR, OKRStatus, KnowledgeArea } from '@/types'
import { OKR_STATUS_LABELS } from '@/types'
import { cn } from '@/lib/utils'
import { Pencil, Trash2, Save, X, MapPin } from 'lucide-react'

interface ObjectiveCardProps {
  okr: QuarterlyOKR
  area: KnowledgeArea | undefined
  onUpdate: (id: string, updates: Partial<QuarterlyOKR>) => void
  onDelete: (id: string) => void
}

const STATUS_STYLES: Record<OKRStatus, string> = {
  planning: 'bg-gray-100 text-gray-600',
  active: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
}

const STATUS_DOT: Record<OKRStatus, string> = {
  planning: 'bg-gray-400',
  active: 'bg-amber-500',
  completed: 'bg-green-500',
}

const STATUS_OPTIONS: OKRStatus[] = ['planning', 'active', 'completed']

export default function ObjectiveCard({ okr, area, onUpdate, onDelete }: ObjectiveCardProps) {
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [form, setForm] = useState({ objective: okr.objective, vision: okr.vision, status: okr.status })

  function handleStartEdit() {
    setForm({ objective: okr.objective, vision: okr.vision, status: okr.status })
    setEditing(true)
    setConfirmDelete(false)
  }

  function handleSave() {
    if (!form.objective.trim()) return
    onUpdate(okr.id, form)
    setEditing(false)
  }

  function handleCancel() {
    setEditing(false)
    setConfirmDelete(false)
  }

  function handleDelete() {
    if (confirmDelete) {
      onDelete(okr.id)
    } else {
      setConfirmDelete(true)
    }
  }

  if (editing) {
    return (
      <div className="space-y-4 animate-fade-in-up">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">目标描述</label>
            <textarea
              className="input-field min-h-[72px] resize-y"
              value={form.objective}
              onChange={(e) => setForm((p) => ({ ...p, objective: e.target.value }))}
              placeholder="描述你的目标"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">愿景</label>
            <textarea
              className="input-field min-h-[56px] resize-y"
              value={form.vision}
              onChange={(e) => setForm((p) => ({ ...p, vision: e.target.value }))}
              placeholder="描述达成目标后的愿景"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">状态</label>
            <select
              className="input-field"
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as OKRStatus }))}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{OKR_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button className="btn-ghost flex items-center gap-1.5" onClick={handleCancel}>
              <X className="w-4 h-4" />
              取消
            </button>
            <button
              className={cn('btn-primary flex items-center gap-1.5', !form.objective.trim() && 'opacity-50 cursor-not-allowed')}
              onClick={handleSave}
              disabled={!form.objective.trim()}
            >
              <Save className="w-4 h-4" />
              保存
            </button>
          </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)] leading-snug mb-1">
            {okr.objective}
          </h3>
          {okr.vision && (
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{okr.vision}</p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button onClick={handleStartEdit} className="btn-ghost p-1.5 rounded-lg">
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className={cn(
              'btn-ghost p-1.5 rounded-lg',
              confirmDelete && 'bg-red-50 text-red-600 hover:bg-red-100'
            )}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {confirmDelete && (
        <div className="flex items-center gap-2 mb-3 p-2.5 rounded-lg bg-red-50 text-sm">
          <span className="text-red-600">确认删除此目标？</span>
          <button
            className="px-2.5 py-1 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors"
            onClick={handleDelete}
          >
            确认
          </button>
          <button
            className="px-2.5 py-1 rounded-md bg-white border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors"
            onClick={() => setConfirmDelete(false)}
          >
            取消
          </button>
        </div>
      )}

      <div className="flex items-center gap-2.5 flex-wrap">
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium', STATUS_STYLES[okr.status])}>
          <span className={cn('w-1.5 h-1.5 rounded-full', STATUS_DOT[okr.status])} />
          {OKR_STATUS_LABELS[okr.status]}
        </span>

        {area && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
            <MapPin className="w-3 h-3" />
            {area.name}
          </span>
        )}
      </div>
    </div>
  )
}
