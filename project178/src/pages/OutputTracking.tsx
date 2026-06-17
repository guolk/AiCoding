import { useState } from 'react'
import useAppStore from '@/store/useAppStore'
import type {
  Assessment,
  AssessmentType,
  AssessmentStatus,
  OutputItem,
  OutputType,
  UseCase,
} from '@/types'
import { ASSESSMENT_TYPE_LABELS, OUTPUT_TYPE_LABELS } from '@/types'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import AssessmentPanels from '@/components/output/AssessmentPanels'
import OutputGallery from '@/components/output/OutputGallery'
import CaseTimeline from '@/components/output/CaseTimeline'

type ModalType = 'assessment' | 'output' | 'useCase' | null

const ASSESSMENT_STATUS_LABELS: Record<AssessmentStatus, string> = {
  not_started: '未开始',
  in_progress: '进行中',
  completed: '已完成',
}

function AssessmentModal({
  assessment,
  areas,
  defaultType,
  onSave,
  onCancel,
}: {
  assessment: Assessment | null
  areas: { id: string; name: string }[]
  defaultType: AssessmentType
  onSave: (a: Assessment) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<Assessment>(
    assessment ?? {
      id: crypto.randomUUID(),
      areaId: '',
      type: defaultType,
      title: '',
      description: '',
      status: 'not_started',
      score: null,
      completedDate: null,
      reflection: '',
    }
  )

  function handleChange(field: keyof Assessment, value: string | number | null) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.areaId) return
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div className="card-static w-full max-w-lg mx-4 p-6 rounded-xl animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
            {assessment ? '编辑评估' : '新增评估'}
          </h3>
          <button onClick={onCancel} className="btn-ghost p-1.5 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">标题</label>
            <input type="text" className="input-field" value={form.title} onChange={(e) => handleChange('title', e.target.value)} placeholder="输入评估标题" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">描述</label>
            <textarea className="input-field min-h-[60px] resize-y" value={form.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="评估内容描述" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">评估类型</label>
              <select className="input-field" value={form.type} onChange={(e) => handleChange('type', e.target.value)}>
                {(Object.keys(ASSESSMENT_TYPE_LABELS) as AssessmentType[]).map((t) => (
                  <option key={t} value={t}>{ASSESSMENT_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">状态</label>
              <select className="input-field" value={form.status} onChange={(e) => handleChange('status', e.target.value)}>
                {(Object.keys(ASSESSMENT_STATUS_LABELS) as AssessmentStatus[]).map((s) => (
                  <option key={s} value={s}>{ASSESSMENT_STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">关联知识领域</label>
            <select className="input-field" value={form.areaId} onChange={(e) => handleChange('areaId', e.target.value)}>
              <option value="">请选择知识领域</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">得分</label>
              <input
                type="number"
                min={0}
                max={100}
                className="input-field"
                value={form.score ?? ''}
                onChange={(e) => handleChange('score', e.target.value === '' ? null : Number(e.target.value))}
                placeholder="0-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">完成日期</label>
              <input
                type="date"
                className="input-field"
                value={form.completedDate ?? ''}
                onChange={(e) => handleChange('completedDate', e.target.value || null)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">反思</label>
            <textarea className="input-field min-h-[60px] resize-y" value={form.reflection} onChange={(e) => handleChange('reflection', e.target.value)} placeholder="学习反思与总结..." />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={onCancel}>取消</button>
            <button
              type="submit"
              className={cn('btn-primary', (!form.title.trim() || !form.areaId) && 'opacity-50 cursor-not-allowed')}
              disabled={!form.title.trim() || !form.areaId}
            >
              {assessment ? '保存修改' : '创建评估'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function OutputModal({
  item,
  areas,
  onSave,
  onCancel,
}: {
  item: OutputItem | null
  areas: { id: string; name: string }[]
  onSave: (o: OutputItem) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<OutputItem>(
    item ?? {
      id: crypto.randomUUID(),
      areaId: '',
      type: 'article',
      title: '',
      contentSummary: '',
      url: '',
      publishDate: new Date().toISOString().slice(0, 10),
      tags: [],
    }
  )
  const [tagInput, setTagInput] = useState('')

  function handleChange(field: keyof OutputItem, value: string | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleAddTag() {
    const tag = tagInput.trim()
    if (tag && !form.tags.includes(tag)) {
      handleChange('tags', [...form.tags, tag])
      setTagInput('')
    }
  }

  function handleRemoveTag(tag: string) {
    handleChange('tags', form.tags.filter((t) => t !== tag))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.areaId) return
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div className="card-static w-full max-w-lg mx-4 p-6 rounded-xl animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
            {item ? '编辑输出' : '新增输出'}
          </h3>
          <button onClick={onCancel} className="btn-ghost p-1.5 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">标题</label>
            <input type="text" className="input-field" value={form.title} onChange={(e) => handleChange('title', e.target.value)} placeholder="输出标题" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">类型</label>
              <select className="input-field" value={form.type} onChange={(e) => handleChange('type', e.target.value)}>
                {(Object.keys(OUTPUT_TYPE_LABELS) as OutputType[]).map((t) => (
                  <option key={t} value={t}>{OUTPUT_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">发布日期</label>
              <input type="date" className="input-field" value={form.publishDate} onChange={(e) => handleChange('publishDate', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">关联知识领域</label>
            <select className="input-field" value={form.areaId} onChange={(e) => handleChange('areaId', e.target.value)}>
              <option value="">请选择知识领域</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">内容摘要</label>
            <textarea className="input-field min-h-[72px] resize-y" value={form.contentSummary} onChange={(e) => handleChange('contentSummary', e.target.value)} placeholder="简要描述输出内容..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">链接</label>
            <input type="url" className="input-field" value={form.url} onChange={(e) => handleChange('url', e.target.value)} placeholder="https://..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">标签</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="input-field flex-1"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag() } }}
                placeholder="输入标签后回车"
              />
              <button type="button" className="btn-ghost text-sm" onClick={handleAddTag}>添加</button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-bg-warm)] text-xs text-[var(--color-text-secondary)]">
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="text-[var(--color-text-muted)] hover:text-red-500">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={onCancel}>取消</button>
            <button
              type="submit"
              className={cn('btn-primary', (!form.title.trim() || !form.areaId) && 'opacity-50 cursor-not-allowed')}
              disabled={!form.title.trim() || !form.areaId}
            >
              {item ? '保存修改' : '创建输出'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function UseCaseModal({
  useCase,
  areas,
  onSave,
  onCancel,
}: {
  useCase: UseCase | null
  areas: { id: string; name: string }[]
  onSave: (uc: UseCase) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<UseCase>(
    useCase ?? {
      id: crypto.randomUUID(),
      areaId: '',
      title: '',
      scenario: '',
      application: '',
      occurredDate: new Date().toISOString().slice(0, 10),
      result: '',
      lessonsLearned: '',
    }
  )

  function handleChange(field: keyof UseCase, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.areaId) return
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div className="card-static w-full max-w-lg mx-4 p-6 rounded-xl animate-fade-in-up max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
            {useCase ? '编辑案例' : '新增案例'}
          </h3>
          <button onClick={onCancel} className="btn-ghost p-1.5 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">标题</label>
            <input type="text" className="input-field" value={form.title} onChange={(e) => handleChange('title', e.target.value)} placeholder="案例标题" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">发生日期</label>
              <input type="date" className="input-field" value={form.occurredDate} onChange={(e) => handleChange('occurredDate', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">关联知识领域</label>
              <select className="input-field" value={form.areaId} onChange={(e) => handleChange('areaId', e.target.value)}>
                <option value="">请选择知识领域</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">场景描述</label>
            <textarea className="input-field min-h-[60px] resize-y" value={form.scenario} onChange={(e) => handleChange('scenario', e.target.value)} placeholder="遇到了什么问题或场景？" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">应用方式</label>
            <textarea className="input-field min-h-[60px] resize-y" value={form.application} onChange={(e) => handleChange('application', e.target.value)} placeholder="如何应用所学知识？" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">结果</label>
            <textarea className="input-field min-h-[48px] resize-y" value={form.result} onChange={(e) => handleChange('result', e.target.value)} placeholder="应用的结果如何？" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">经验教训</label>
            <textarea className="input-field min-h-[60px] resize-y" value={form.lessonsLearned} onChange={(e) => handleChange('lessonsLearned', e.target.value)} placeholder="从中总结的经验教训..." />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={onCancel}>取消</button>
            <button
              type="submit"
              className={cn('btn-primary', (!form.title.trim() || !form.areaId) && 'opacity-50 cursor-not-allowed')}
              disabled={!form.title.trim() || !form.areaId}
            >
              {useCase ? '保存修改' : '创建案例'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function OutputTracking() {
  const assessments = useAppStore((s) => s.assessments)
  const outputs = useAppStore((s) => s.outputs)
  const useCases = useAppStore((s) => s.useCases)
  const areas = useAppStore((s) => s.areas)
  const addAssessment = useAppStore((s) => s.addAssessment)
  const updateAssessment = useAppStore((s) => s.updateAssessment)
  const deleteAssessment = useAppStore((s) => s.deleteAssessment)
  const addOutput = useAppStore((s) => s.addOutput)
  const updateOutput = useAppStore((s) => s.updateOutput)
  const deleteOutput = useAppStore((s) => s.deleteOutput)
  const addUseCase = useAppStore((s) => s.addUseCase)
  const updateUseCase = useAppStore((s) => s.updateUseCase)
  const deleteUseCase = useAppStore((s) => s.deleteUseCase)

  const [modalType, setModalType] = useState<ModalType>(null)
  const [editingItem, setEditingItem] = useState<Assessment | OutputItem | UseCase | null>(null)
  const [defaultAssessmentType, setDefaultAssessmentType] = useState<AssessmentType>('written')

  const areaOptions = areas.map((a) => ({ id: a.id, name: a.name }))

  function handleAddAssessment(type: AssessmentType) {
    setDefaultAssessmentType(type)
    setEditingItem(null)
    setModalType('assessment')
  }

  function handleEditAssessment(assessment: Assessment) {
    setEditingItem(assessment)
    setDefaultAssessmentType(assessment.type)
    setModalType('assessment')
  }

  function handleSaveAssessment(assessment: Assessment) {
    const existing = assessments.find((a) => a.id === assessment.id)
    if (existing) {
      updateAssessment(assessment.id, assessment)
    } else {
      addAssessment(assessment)
    }
    setModalType(null)
    setEditingItem(null)
  }

  function handleStatusChange(id: string, status: AssessmentStatus) {
    updateAssessment(id, {
      status,
      ...(status === 'completed' ? { completedDate: new Date().toISOString().slice(0, 10) } : {}),
    })
  }

  function handleAddOutput() {
    setEditingItem(null)
    setModalType('output')
  }

  function handleEditOutput(item: OutputItem) {
    setEditingItem(item)
    setModalType('output')
  }

  function handleSaveOutput(item: OutputItem) {
    const existing = outputs.find((o) => o.id === item.id)
    if (existing) {
      updateOutput(item.id, item)
    } else {
      addOutput(item)
    }
    setModalType(null)
    setEditingItem(null)
  }

  function handleAddUseCase() {
    setEditingItem(null)
    setModalType('useCase')
  }

  function handleEditUseCase(uc: UseCase) {
    setEditingItem(uc)
    setModalType('useCase')
  }

  function handleSaveUseCase(uc: UseCase) {
    const existing = useCases.find((u) => u.id === uc.id)
    if (existing) {
      updateUseCase(uc.id, uc)
    } else {
      addUseCase(uc)
    }
    setModalType(null)
    setEditingItem(null)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-[var(--color-text-primary)]">输出追踪</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">评估学习效果，记录输出成果，追踪知识应用</p>
      </div>

      <div className="space-y-8">
        <AssessmentPanels
          assessments={assessments}
          areas={areas}
          onAdd={handleAddAssessment}
          onEdit={handleEditAssessment}
          onDelete={deleteAssessment}
          onStatusChange={handleStatusChange}
        />

        <div className="h-px bg-[var(--color-border-light)]" />

        <OutputGallery
          outputs={outputs}
          onAdd={handleAddOutput}
          onEdit={handleEditOutput}
          onDelete={deleteOutput}
        />

        <div className="h-px bg-[var(--color-border-light)]" />

        <CaseTimeline
          useCases={useCases}
          areas={areas}
          onAdd={handleAddUseCase}
          onEdit={handleEditUseCase}
          onDelete={deleteUseCase}
        />
      </div>

      {modalType === 'assessment' && (
        <AssessmentModal
          assessment={editingItem as Assessment | null}
          areas={areaOptions}
          defaultType={defaultAssessmentType}
          onSave={handleSaveAssessment}
          onCancel={() => { setModalType(null); setEditingItem(null) }}
        />
      )}

      {modalType === 'output' && (
        <OutputModal
          item={editingItem as OutputItem | null}
          areas={areaOptions}
          onSave={handleSaveOutput}
          onCancel={() => { setModalType(null); setEditingItem(null) }}
        />
      )}

      {modalType === 'useCase' && (
        <UseCaseModal
          useCase={editingItem as UseCase | null}
          areas={areaOptions}
          onSave={handleSaveUseCase}
          onCancel={() => { setModalType(null); setEditingItem(null) }}
        />
      )}
    </div>
  )
}
