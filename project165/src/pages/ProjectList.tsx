import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Plus } from 'lucide-react'
import { useDroneStore } from '@/store'
import StatusBadge from '@/components/StatusBadge'
import type { Project } from '@/types'

const statusTabs = [
  { key: 'all', label: '全部' },
  { key: 'planning', label: '规划中' },
  { key: 'shooting', label: '拍摄中' },
  { key: 'review', label: '审核中' },
  { key: 'completed', label: '已完成' },
] as const

const borderColorMap: Record<Project['status'], string> = {
  planning: 'border-l-blue-500',
  shooting: 'border-l-purple-500',
  review: 'border-l-orange-500',
  completed: 'border-l-emerald-500',
}

export default function ProjectList() {
  const [activeTab, setActiveTab] = useState<string>('all')
  const projects = useDroneStore((s) => s.projects)
  const navigate = useNavigate()

  const filtered =
    activeTab === 'all'
      ? projects
      : projects.filter((p) => p.status === activeTab)

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white">航拍项目</h1>
        <Link
          to="/projects/new"
          className="flex items-center gap-1.5 rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-600"
        >
          <Plus className="h-4 w-4" />
          新建项目
        </Link>
      </div>

      <div className="flex gap-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-accent-500/20 text-accent-500'
                : 'bg-navy-700/50 text-navy-300 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {filtered.map((project) => {
          const usable = project.footages.filter((f) => f.status === 'usable').length
          const reshoot = project.footages.filter((f) => f.status === 'reshoot').length
          const pending = project.footages.filter((f) => f.status === 'pending').length

          return (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className={`card-glow cursor-pointer rounded-xl border-l-4 bg-navy-700/50 p-5 transition-all hover:bg-navy-700/70 ${borderColorMap[project.status]}`}
            >
              <h2 className="font-display text-xl font-bold text-white">
                {project.name}
              </h2>

              <div className="mt-2 flex items-center gap-1.5 text-sm text-navy-300">
                <MapPin className="h-4 w-4" />
                {project.location}
              </div>

              <p className="mt-2 line-clamp-2 text-sm text-navy-300">
                {project.purpose}
              </p>

              <div className="mt-4 flex items-center gap-3 text-xs text-navy-300">
                <span className="text-emerald-400">{usable}可用</span>
                <span className="text-yellow-400">{reshoot}需补拍</span>
                <span className="text-orange-400">{pending}待审核</span>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-navy-600/50 pt-3">
                <StatusBadge status={project.status} />
                <span className="text-xs text-navy-300">{project.createdAt}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
