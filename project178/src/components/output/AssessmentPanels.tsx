import { useState } from 'react'
import type { Assessment, AssessmentType, AssessmentStatus, KnowledgeArea } from '@/types'
import { ASSESSMENT_TYPE_LABELS } from '@/types'
import { Plus, ChevronDown, ChevronUp, ClipboardCheck, FolderGit2, GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AssessmentPanelsProps {
  assessments: Assessment[]
  areas: KnowledgeArea[]
  onAdd: (type: AssessmentType) => void
  onEdit: (assessment: Assessment) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: AssessmentStatus) => void
}

const TYPE_CONFIG: Record<AssessmentType, {
  label: string
  icon: React.ReactNode
  accentColor: string
  bgColor: string
  borderColor: string
  dotColor: string
  statusBg: Record<AssessmentStatus, string>
}> = {
  written: {
    label: ASSESSMENT_TYPE_LABELS.written,
    icon: <ClipboardCheck className="w-5 h-5" />,
    accentColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    dotColor: 'bg-blue-500',
    statusBg: {
      not_started: 'bg-gray-100 text-gray-600',
      in_progress: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
    },
  },
  project: {
    label: ASSESSMENT_TYPE_LABELS.project,
    icon: <FolderGit2 className="w-5 h-5" />,
    accentColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    dotColor: 'bg-emerald-500',
    statusBg: {
      not_started: 'bg-gray-100 text-gray-600',
      in_progress: 'bg-emerald-100 text-emerald-700',
      completed: 'bg-green-100 text-green-700',
    },
  },
  teach: {
    label: ASSESSMENT_TYPE_LABELS.teach,
    icon: <GraduationCap className="w-5 h-5" />,
    accentColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    dotColor: 'bg-purple-500',
    statusBg: {
      not_started: 'bg-gray-100 text-gray-600',
      in_progress: 'bg-purple-100 text-purple-700',
      completed: 'bg-green-100 text-green-700',
    },
  },
}

const STATUS_LABELS: Record<AssessmentStatus, string> = {
  not_started: '未开始',
  in_progress: '进行中',
  completed: '已完成',
}

const NEXT_STATUS: Record<AssessmentStatus, AssessmentStatus> = {
  not_started: 'in_progress',
  in_progress: 'completed',
  completed: 'completed',
}

function AssessmentCard({
  assessment,
  areaName,
  config,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  assessment: Assessment
  areaName: string
  config: typeof TYPE_CONFIG.written
  onEdit: (a: Assessment) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: AssessmentStatus) => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={cn('rounded-lg border p-3 transition-all', config.borderColor, 'bg-white hover:shadow-sm')}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('w-2 h-2 rounded-full shrink-0', config.dotColor)} />
            <h5 className="text-sm font-medium text-[var(--color-text-primary)] truncate cursor-pointer">
              {assessment.title}
            </h5>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] ml-4 line-clamp-1">
            {assessment.description}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onStatusChange(assessment.id, NEXT_STATUS[assessment.status])}
            className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors cursor-pointer', config.statusBg[assessment.status])}
          >
            {STATUS_LABELS[assessment.status]}
          </button>
          <button onClick={() => setExpanded(!expanded)} className="p-0.5 text-[var(--color-text-muted)]">
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-[var(--color-border-light)] space-y-2 animate-fade-in-up">
          <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
            <span>知识领域：{areaName}</span>
            {assessment.completedDate && <span>完成日期：{assessment.completedDate}</span>}
          </div>

          {assessment.score !== null && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--color-text-secondary)]">得分</span>
              <div className="flex-1 h-2 rounded-full bg-[var(--color-bg-warm)] overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', config.dotColor)}
                  style={{ width: `${assessment.score}%` }}
                />
              </div>
              <span className={cn('text-xs font-semibold', config.accentColor)}>{assessment.score}</span>
            </div>
          )}

          {assessment.reflection && (
            <div className="p-2 rounded-md bg-[var(--color-bg-warm)]">
              <span className="text-[10px] font-medium text-[var(--color-text-muted)]">反思</span>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{assessment.reflection}</p>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onEdit(assessment)}
              className="text-[11px] text-[var(--color-primary-lighter)] hover:text-[var(--color-primary)] transition-colors"
            >
              编辑
            </button>
            <span className="text-[var(--color-border)]">|</span>
            <button
              onClick={() => onDelete(assessment.id)}
              className="text-[11px] text-red-400 hover:text-red-500 transition-colors"
            >
              删除
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AssessmentPanels({ assessments, areas, onAdd, onEdit, onDelete, onStatusChange }: AssessmentPanelsProps) {
  const types: AssessmentType[] = ['written', 'project', 'teach']

  function getAreaName(areaId: string) {
    return areas.find((a) => a.id === areaId)?.name ?? '未知领域'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-serif font-bold text-[var(--color-text-primary)]">评估面板</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {types.map((type) => {
          const config = TYPE_CONFIG[type]
          const filtered = assessments.filter((a) => a.type === type)

          return (
            <div key={type} className={cn('rounded-xl border p-4', config.borderColor, 'bg-white')}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={cn('p-1.5 rounded-lg', config.bgColor, config.accentColor)}>
                    {config.icon}
                  </span>
                  <h3 className={cn('text-sm font-semibold', config.accentColor)}>{config.label}</h3>
                </div>
                <button
                  onClick={() => onAdd(type)}
                  className={cn('p-1 rounded-lg transition-colors', config.bgColor, config.accentColor, 'hover:opacity-80')}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {filtered.length === 0 && (
                  <p className="text-xs text-[var(--color-text-muted)] text-center py-4">暂无评估项</p>
                )}
                {filtered.map((assessment) => (
                  <AssessmentCard
                    key={assessment.id}
                    assessment={assessment}
                    areaName={getAreaName(assessment.areaId)}
                    config={config}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
