import type { LearningResource, ResourceStatus } from '@/types'
import { RESOURCE_TYPE_LABELS, RESOURCE_STATUS_LABELS } from '@/types'
import { Clock, Pencil, Trash2, ArrowRight, Target } from 'lucide-react'

interface ResourceCardProps {
  resource: LearningResource
  dependencyTitle?: string
  krDescription?: string
  onEdit: (resource: LearningResource) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: ResourceStatus) => void
}

const statusColors: Record<ResourceStatus, { bg: string; text: string; dot: string }> = {
  pending: { bg: 'rgba(138,138,160,0.1)', text: '#8a8aa0', dot: '#8a8aa0' },
  in_progress: { bg: 'rgba(212,168,87,0.12)', text: '#d4a857', dot: '#d4a857' },
  completed: { bg: 'rgba(45,106,79,0.1)', text: '#2d6a4f', dot: '#2d6a4f' },
}

const typeColors: Record<string, { bg: string; text: string }> = {
  book: { bg: 'rgba(30,58,95,0.1)', text: '#1e3a5f' },
  course: { bg: 'rgba(123,104,238,0.1)', text: '#7b68ee' },
  project: { bg: 'rgba(45,106,79,0.1)', text: '#2d6a4f' },
}

const statusFlow: ResourceStatus[] = ['pending', 'in_progress', 'completed']

function getNextStatus(current: ResourceStatus): ResourceStatus | null {
  const idx = statusFlow.indexOf(current)
  return idx < statusFlow.length - 1 ? statusFlow[idx + 1] : null
}

export default function ResourceCard({
  resource,
  dependencyTitle,
  krDescription,
  onEdit,
  onDelete,
  onStatusChange,
}: ResourceCardProps) {
  const sc = statusColors[resource.status]
  const tc = typeColors[resource.type]
  const nextStatus = getNextStatus(resource.status)

  return (
    <div className="card p-4 rounded-xl">
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold shrink-0"
          style={{ backgroundColor: 'rgba(30,58,95,0.08)', color: 'var(--color-primary)' }}>
          {resource.priority}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
              {resource.title}
            </h4>
            <span
              className="badge text-[11px] shrink-0"
              style={{ backgroundColor: tc.bg, color: tc.text }}
            >
              {RESOURCE_TYPE_LABELS[resource.type]}
            </span>
          </div>

          {resource.author && (
            <div className="text-xs text-[var(--color-text-muted)] mb-1.5">
              {resource.author}
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: sc.dot }}
              />
              <span className="text-xs" style={{ color: sc.text }}>
                {RESOURCE_STATUS_LABELS[resource.status]}
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
              <Clock className="w-3 h-3" />
              <span>{resource.estimatedHours}小时</span>
            </div>
          </div>

          {dependencyTitle && (
            <div className="flex items-center gap-1 mt-1.5 text-xs text-[var(--color-text-muted)]">
              <ArrowRight className="w-3 h-3" />
              <span>依赖：{dependencyTitle}</span>
            </div>
          )}

          {krDescription && (
            <div className="flex items-center gap-1 mt-1 text-xs text-[var(--color-accent)]">
              <Target className="w-3 h-3" />
              <span>{krDescription}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {nextStatus && (
            <button
              onClick={() => onStatusChange(resource.id, nextStatus)}
              className="btn-ghost px-2 py-1 text-xs rounded-md"
              style={{ backgroundColor: sc.bg, color: sc.text }}
            >
              → {RESOURCE_STATUS_LABELS[nextStatus]}
            </button>
          )}
          <button
            onClick={() => onEdit(resource)}
            className="btn-ghost p-1.5 rounded-md"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(resource.id)}
            className="btn-ghost p-1.5 rounded-md text-[var(--color-warning)] hover:bg-[rgba(224,122,95,0.1)]"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
