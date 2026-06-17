import { useState } from 'react'
import type { KnowledgeArea, KnowledgeDomain, DepthLevel } from '@/types'
import { DEPTH_LABELS, DEPTH_ORDER } from '@/types'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AreaEditorProps {
  area: KnowledgeArea | null
  domains: KnowledgeDomain[]
  onSave: (area: KnowledgeArea) => void
  onCancel: () => void
}

function createEmptyArea(): KnowledgeArea {
  return {
    id: crypto.randomUUID(),
    domainId: '',
    name: '',
    description: '',
    depthTarget: 'familiar',
    currentDepth: 'aware',
    isGap: false,
    gapSeverity: 0,
    notes: '',
  }
}

export default function AreaEditor({ area, domains, onSave, onCancel }: AreaEditorProps) {
  const [form, setForm] = useState<KnowledgeArea>(area ?? createEmptyArea())

  function handleChange(field: keyof KnowledgeArea, value: string | boolean | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.domainId) return
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div
        className="card-static w-full max-w-lg mx-4 p-6 rounded-xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
            {area ? '编辑知识领域' : '新增知识领域'}
          </h3>
          <button onClick={onCancel} className="btn-ghost p-1.5 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">名称</label>
            <input
              type="text"
              className="input-field"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="输入领域名称"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">描述</label>
            <input
              type="text"
              className="input-field"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="简要描述该知识领域"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">所属知识域</label>
            <select
              className="input-field"
              value={form.domainId}
              onChange={(e) => handleChange('domainId', e.target.value)}
            >
              <option value="">请选择知识域</option>
              {domains.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">目标深度</label>
              <select
                className="input-field"
                value={form.depthTarget}
                onChange={(e) => handleChange('depthTarget', e.target.value as DepthLevel)}
              >
                {DEPTH_ORDER.map((d) => (
                  <option key={d} value={d}>{DEPTH_LABELS[d]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">当前深度</label>
              <select
                className="input-field"
                value={form.currentDepth}
                onChange={(e) => handleChange('currentDepth', e.target.value as DepthLevel)}
              >
                {DEPTH_ORDER.map((d) => (
                  <option key={d} value={d}>{DEPTH_LABELS[d]}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">备注</label>
            <textarea
              className="input-field min-h-[72px] resize-y"
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="补充说明..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isGap"
              checked={form.isGap}
              onChange={(e) => handleChange('isGap', e.target.checked)}
              className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
            />
            <label htmlFor="isGap" className="text-sm text-[var(--color-text-secondary)]">标记为差距项</label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={onCancel}>取消</button>
            <button
              type="submit"
              className={cn('btn-primary', (!form.name.trim() || !form.domainId) && 'opacity-50 cursor-not-allowed')}
              disabled={!form.name.trim() || !form.domainId}
            >
              {area ? '保存修改' : '创建领域'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
