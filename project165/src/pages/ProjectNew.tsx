import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useDroneStore } from '@/store'
import type { Project } from '@/types'

const permitOptions: { value: Project['permitStatus']; label: string }[] = [
  { value: 'pending', label: '待审批' },
  { value: 'approved', label: '已批准' },
  { value: 'rejected', label: '已拒绝' },
  { value: 'not_required', label: '不需要' },
]

export default function ProjectNew() {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [purpose, setPurpose] = useState('')
  const [visualRequirements, setVisualRequirements] = useState('')
  const [permitStatus, setPermitStatus] = useState<Project['permitStatus']>('pending')

  const addProject = useDroneStore((s) => s.addProject)
  const navigate = useNavigate()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const project: Project = {
      id: `proj-${Date.now()}`,
      name,
      location,
      purpose,
      visualRequirements,
      permitStatus,
      status: 'planning',
      createdAt: new Date().toISOString().split('T')[0],
      routePlans: [],
      footages: [],
    }
    addProject(project)
    navigate('/projects')
  }

  const inputClass =
    'w-full rounded-lg border border-navy-600/50 bg-navy-800/50 px-4 py-2 text-white placeholder-navy-400 outline-none transition-colors focus:border-accent-500'

  return (
    <div className="animate-fade-in">
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-navy-300 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        返回项目列表
      </Link>

      <h1 className="mt-4 font-display text-2xl font-bold text-white">新建航拍项目</h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-5">
        <div>
          <label className="mb-1.5 block text-sm text-navy-300">项目名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-navy-300">拍摄地点</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-navy-300">拍摄目的</label>
          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            required
            rows={3}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-navy-300">画面需求</label>
          <textarea
            value={visualRequirements}
            onChange={(e) => setVisualRequirements(e.target.value)}
            required
            rows={3}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-navy-300">飞行许可状态</label>
          <select
            value={permitStatus}
            onChange={(e) => setPermitStatus(e.target.value as Project['permitStatus'])}
            className={inputClass}
          >
            {permitOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="rounded-lg bg-accent-500 px-6 py-2.5 font-medium text-white transition-colors hover:bg-accent-600"
        >
          创建项目
        </button>
      </form>
    </div>
  )
}
