import { useState } from 'react'
import useAppStore from '@/store/useAppStore'
import type { LearningResource, ResourceType, ResourceStatus } from '@/types'
import { RESOURCE_TYPE_LABELS, RESOURCE_STATUS_LABELS } from '@/types'
import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import ResourceTabs from '@/components/resources/ResourceTabs'
import ResourceSortable from '@/components/resources/ResourceSortable'
import TimeAllocation from '@/components/resources/TimeAllocation'

function createEmptyResource(): LearningResource {
  return {
    id: crypto.randomUUID(),
    areaId: '',
    krId: null,
    type: 'book',
    title: '',
    author: '',
    url: '',
    status: 'pending',
    priority: 1,
    dependsOn: null,
    estimatedHours: 0,
    notes: '',
  }
}

export default function ResourcePlanning() {
  const resources = useAppStore((s) => s.resources)
  const areas = useAppStore((s) => s.areas)
  const domains = useAppStore((s) => s.domains)
  const keyResults = useAppStore((s) => s.keyResults)
  const learningTimes = useAppStore((s) => s.learningTimes)
  const addResource = useAppStore((s) => s.addResource)
  const updateResource = useAppStore((s) => s.updateResource)
  const deleteResource = useAppStore((s) => s.deleteResource)
  const updateResourceStatus = useAppStore((s) => s.updateResourceStatus)
  const updateLearningTime = useAppStore((s) => s.updateLearningTime)

  const [activeType, setActiveType] = useState<ResourceType | 'all'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<LearningResource | null>(null)
  const [form, setForm] = useState<LearningResource>(createEmptyResource())

  const filteredResources = activeType === 'all'
    ? resources
    : resources.filter((r) => r.type === activeType)

  function handleOpenAdd() {
    setEditingResource(null)
    setForm(createEmptyResource())
    setModalOpen(true)
  }

  function handleOpenEdit(resource: LearningResource) {
    setEditingResource(resource)
    setForm({ ...resource })
    setModalOpen(true)
  }

  function handleDelete(id: string) {
    deleteResource(id)
  }

  function handleStatusChange(id: string, status: ResourceStatus) {
    updateResourceStatus(id, status)
  }

  function handleFormChange(field: keyof LearningResource, value: string | number | null) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.areaId) return

    if (editingResource) {
      updateResource(editingResource.id, form)
    } else {
      addResource(form)
    }
    setModalOpen(false)
    setEditingResource(null)
  }

  function handleModalClose() {
    setModalOpen(false)
    setEditingResource(null)
  }

  const resourceOptions = resources.map((r) => ({
    id: r.id,
    label: r.title,
  }))

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[var(--color-text-primary)]">资源规划</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">管理学习资源，规划时间分配，追踪学习进度</p>
        </div>
        <button className="btn-primary flex items-center gap-1.5" onClick={handleOpenAdd}>
          <Plus className="w-4 h-4" />
          添加资源
        </button>
      </div>

      <div className="mb-5">
        <ResourceTabs activeType={activeType} onChange={setActiveType} />
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            {activeType === 'all' ? '全部资源' : RESOURCE_TYPE_LABELS[activeType]}
          </h2>
          <span className="badge text-[11px]" style={{ backgroundColor: 'rgba(30,58,95,0.1)', color: 'var(--color-primary)' }}>
            {filteredResources.length}
          </span>
        </div>
        <ResourceSortable
          resources={filteredResources}
          allResources={resources}
          keyResults={keyResults}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      </div>

      <TimeAllocation
        learningTimes={learningTimes}
        areas={areas}
        domains={domains}
        onUpdateLearningTime={(id, u) => updateLearningTime(id, u)}
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={handleModalClose}>
          <div
            className="card-static w-full max-w-lg mx-4 p-6 rounded-xl animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                {editingResource ? '编辑资源' : '添加资源'}
              </h3>
              <button onClick={handleModalClose} className="btn-ghost p-1.5 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">资源名称</label>
                <input
                  type="text"
                  className="input-field"
                  value={form.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  placeholder="输入资源名称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">作者/来源</label>
                <input
                  type="text"
                  className="input-field"
                  value={form.author}
                  onChange={(e) => handleFormChange('author', e.target.value)}
                  placeholder="书籍作者或课程来源"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">类型</label>
                  <select
                    className="input-field"
                    value={form.type}
                    onChange={(e) => handleFormChange('type', e.target.value as ResourceType)}
                  >
                    {(Object.keys(RESOURCE_TYPE_LABELS) as ResourceType[]).map((t) => (
                      <option key={t} value={t}>{RESOURCE_TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">状态</label>
                  <select
                    className="input-field"
                    value={form.status}
                    onChange={(e) => handleFormChange('status', e.target.value as ResourceStatus)}
                  >
                    {(Object.keys(RESOURCE_STATUS_LABELS) as ResourceStatus[]).map((s) => (
                      <option key={s} value={s}>{RESOURCE_STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">所属知识领域</label>
                <select
                  className="input-field"
                  value={form.areaId}
                  onChange={(e) => handleFormChange('areaId', e.target.value)}
                >
                  <option value="">请选择知识领域</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">关联关键结果</label>
                <select
                  className="input-field"
                  value={form.krId ?? ''}
                  onChange={(e) => handleFormChange('krId', e.target.value || null)}
                >
                  <option value="">无关联</option>
                  {keyResults.map((kr) => (
                    <option key={kr.id} value={kr.id}>{kr.description}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">优先级</label>
                  <input
                    type="number"
                    className="input-field"
                    value={form.priority}
                    onChange={(e) => handleFormChange('priority', parseInt(e.target.value) || 1)}
                    min={1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">预估时长（小时）</label>
                  <input
                    type="number"
                    className="input-field"
                    value={form.estimatedHours}
                    onChange={(e) => handleFormChange('estimatedHours', parseInt(e.target.value) || 0)}
                    min={0}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">前置依赖</label>
                <select
                  className="input-field"
                  value={form.dependsOn ?? ''}
                  onChange={(e) => handleFormChange('dependsOn', e.target.value || null)}
                >
                  <option value="">无依赖</option>
                  {resourceOptions
                    .filter((r) => r.id !== form.id)
                    .map((r) => (
                      <option key={r.id} value={r.id}>{r.label}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">链接</label>
                <input
                  type="text"
                  className="input-field"
                  value={form.url}
                  onChange={(e) => handleFormChange('url', e.target.value)}
                  placeholder="资源链接（可选）"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">备注</label>
                <textarea
                  className="input-field min-h-[60px] resize-y"
                  value={form.notes}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                  placeholder="补充说明..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="btn-ghost" onClick={handleModalClose}>取消</button>
                <button
                  type="submit"
                  className={cn(
                    'btn-primary',
                    (!form.title.trim() || !form.areaId) && 'opacity-50 cursor-not-allowed'
                  )}
                  disabled={!form.title.trim() || !form.areaId}
                >
                  {editingResource ? '保存修改' : '添加资源'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
