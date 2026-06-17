import { useState } from 'react'
import type { KeyResult, MetricType } from '@/types'
import { METRIC_LABELS } from '@/types'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface KREditorProps {
  kr: KeyResult | null
  okrId: string
  onSave: (kr: KeyResult) => void
  onCancel: () => void
}

const METRIC_OPTIONS: MetricType[] = ['books', 'courses', 'articles', 'hours', 'projects']

export default function KREditor({ kr, okrId, onSave, onCancel }: KREditorProps) {
  const [form, setForm] = useState<KeyResult>(
    kr ?? {
      id: crypto.randomUUID(),
      okrId,
      description: '',
      metricType: 'books',
      targetValue: 1,
      currentValue: 0,
      unit: METRIC_LABELS.books,
      sortOrder: 0,
    }
  )

  function handleMetricTypeChange(metricType: MetricType) {
    setForm((prev) => ({ ...prev, metricType, unit: METRIC_LABELS[metricType] }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.description.trim() || form.targetValue <= 0) return
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div
        className="card-static w-full max-w-md mx-4 p-6 rounded-xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
            {kr ? '编辑关键结果' : '新增关键结果'}
          </h3>
          <button onClick={onCancel} className="btn-ghost p-1.5 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">描述</label>
            <input
              type="text"
              className="input-field"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="描述关键结果"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">度量类型</label>
            <select
              className="input-field"
              value={form.metricType}
              onChange={(e) => handleMetricTypeChange(e.target.value as MetricType)}
            >
              {METRIC_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {METRIC_LABELS[m]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">目标值</label>
              <input
                type="number"
                className="input-field"
                min={1}
                value={form.targetValue}
                onChange={(e) => setForm((p) => ({ ...p, targetValue: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">当前值</label>
              <input
                type="number"
                className="input-field"
                min={0}
                value={form.currentValue}
                onChange={(e) => setForm((p) => ({ ...p, currentValue: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">单位</label>
            <input
              type="text"
              className="input-field"
              value={form.unit}
              onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
              placeholder="如：本、门、篇、小时、个"
            />
          </div>

          {form.targetValue > 0 && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-bg-warm)]">
              <span className="text-sm text-[var(--color-text-secondary)]">当前进度</span>
              <div className="progress-bar flex-1">
                <div
                  className={cn(
                    'progress-bar-fill',
                    form.currentValue / form.targetValue >= 0.7
                      ? 'bg-[var(--color-success)]'
                      : form.currentValue / form.targetValue >= 0.4
                        ? 'bg-[var(--color-accent)]'
                        : 'bg-[var(--color-warning)]'
                  )}
                  style={{ width: `${Math.min((form.currentValue / form.targetValue) * 100, 100)}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-[var(--color-text-primary)] shrink-0">
                {Math.min(Math.round((form.currentValue / form.targetValue) * 100), 100)}%
              </span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={onCancel}>
              取消
            </button>
            <button
              type="submit"
              className={cn(
                'btn-primary',
                (!form.description.trim() || form.targetValue <= 0) && 'opacity-50 cursor-not-allowed'
              )}
              disabled={!form.description.trim() || form.targetValue <= 0}
            >
              {kr ? '保存修改' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
