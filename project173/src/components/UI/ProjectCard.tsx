import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, User, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Project, Milestone } from '@/types'
import { ProjectTypeMap, ProjectStatusMap } from '@/types'
import StatusBadge from './StatusBadge'
import ProgressBar from './ProgressBar'

export interface ProjectCardProps {
  project: Project
  milestones?: Milestone[]
}

const typeColorMap: Record<string, string> = {
  infrastructure: 'bg-blue-100 text-blue-700',
  industry: 'bg-green-100 text-green-700',
  training: 'bg-purple-100 text-purple-700',
  environment: 'bg-emerald-100 text-emerald-700',
  other: 'bg-gray-100 text-gray-700',
}

export default function ProjectCard({ project, milestones = [] }: ProjectCardProps) {
  const navigate = useNavigate()

  const progress = useMemo(() => {
    if (milestones.length === 0) return 0
    const totalProgress = milestones.reduce((sum, m) => sum + m.progress, 0)
    return Math.round(totalProgress / milestones.length)
  }, [milestones])

  const handleClick = () => {
    navigate(`/projects/${project.id}`)
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group cursor-pointer rounded-xl border border-gray-200 bg-white p-6 shadow-sm',
        'transition-all duration-300 hover:border-primary-300 hover:shadow-lg hover:-translate-y-1'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="truncate text-lg font-semibold text-gray-900 group-hover:text-primary-600">
            {project.name}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
            <MapPin size={14} />
            <span className="truncate">{project.village}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <StatusBadge status={project.status} type="project" />
          <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', typeColorMap[project.type])}>
            {ProjectTypeMap[project.type]}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-gray-500">项目进度</span>
          <span className="font-medium text-gray-900">{progress}%</span>
        </div>
        <ProgressBar value={progress} />
      </div>

      <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User size={14} className="shrink-0 text-gray-400" />
          <span className="truncate">负责人：{project.responsiblePerson}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={14} className="shrink-0 text-gray-400" />
          <span className="truncate">
            {project.startDate} ~ {project.endDate}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
        <span>项目编号：{project.id}</span>
        <span>{ProjectStatusMap[project.status]}</span>
      </div>
    </div>
  )
}
