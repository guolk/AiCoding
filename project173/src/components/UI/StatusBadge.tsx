import { cn } from '@/lib/utils'

export type StatusType = 'project' | 'milestone' | 'issue' | 'risk' | 'level'

export type ProjectStatus = 'planning' | 'ongoing' | 'completed' | 'suspended'
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'delayed'
export type IssueStatus = 'open' | 'processing' | 'resolved' | 'closed'
export type RiskStatus = 'identified' | 'monitoring' | 'mitigated' | 'occurred'
export type LevelType = 'high' | 'medium' | 'low'

export type StatusValue = ProjectStatus | MilestoneStatus | IssueStatus | RiskStatus | LevelType

export interface StatusBadgeProps {
  status: StatusValue
  type?: StatusType
}

const statusConfig: Record<StatusType, Record<string, { label: string; className: string }>> = {
  project: {
    planning: { label: '规划中', className: 'bg-gray-100 text-gray-700' },
    ongoing: { label: '进行中', className: 'bg-primary-100 text-primary-700' },
    completed: { label: '已完成', className: 'bg-green-100 text-green-700' },
    suspended: { label: '已暂停', className: 'bg-orange-100 text-orange-700' },
  },
  milestone: {
    pending: { label: '待开始', className: 'bg-gray-100 text-gray-700' },
    in_progress: { label: '进行中', className: 'bg-blue-100 text-blue-700' },
    completed: { label: '已完成', className: 'bg-green-100 text-green-700' },
    delayed: { label: '已延期', className: 'bg-red-100 text-red-700' },
  },
  issue: {
    open: { label: '待处理', className: 'bg-red-100 text-red-700' },
    processing: { label: '处理中', className: 'bg-orange-100 text-orange-700' },
    resolved: { label: '已解决', className: 'bg-green-100 text-green-700' },
    closed: { label: '已关闭', className: 'bg-gray-100 text-gray-700' },
  },
  risk: {
    identified: { label: '已识别', className: 'bg-red-100 text-red-700' },
    monitoring: { label: '监控中', className: 'bg-orange-100 text-orange-700' },
    mitigated: { label: '已缓解', className: 'bg-green-100 text-green-700' },
    occurred: { label: '已发生', className: 'bg-purple-100 text-purple-700' },
  },
  level: {
    high: { label: '高', className: 'bg-red-100 text-red-700' },
    medium: { label: '中', className: 'bg-orange-100 text-orange-700' },
    low: { label: '低', className: 'bg-green-100 text-green-700' },
  },
}

export default function StatusBadge({ status, type = 'project' }: StatusBadgeProps) {
  const config = statusConfig[type][status] || { label: status, className: 'bg-gray-100 text-gray-700' }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className
      )}
    >
      {config.label}
    </span>
  )
}
