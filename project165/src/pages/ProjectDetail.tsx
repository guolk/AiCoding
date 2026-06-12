import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Map } from 'lucide-react'
import { useDroneStore } from '@/store'
import StatusBadge from '@/components/StatusBadge'
import Empty from '@/components/Empty'

function QualityBar({ score }: { score: number }) {
  const color =
    score >= 8 ? 'bg-emerald-500' : score >= 5 ? 'bg-yellow-500' : 'bg-red-500'
  const width = Math.min(Math.max((score / 10) * 100, 0), 100)

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-navy-600">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} />
      </div>
      <span className="text-sm text-white">{score.toFixed(1)}</span>
    </div>
  )
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const getProjectById = useDroneStore((s) => s.getProjectById)
  const project = id ? getProjectById(id) : undefined

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-navy-300">项目未找到</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6">
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-navy-300 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        返回项目列表
      </Link>

      <div className="flex items-center gap-3">
        <h1 className="font-display text-2xl font-bold text-white">{project.name}</h1>
        <StatusBadge status={project.status} />
      </div>

      <section className="card-glow rounded-xl bg-navy-700/30 p-5">
        <h2 className="mb-4 font-display text-lg font-bold text-white">策划文档</h2>
        <div className="space-y-3">
          <div>
            <span className="text-sm text-navy-300">拍摄地点</span>
            <p className="text-white">{project.location}</p>
          </div>
          <div>
            <span className="text-sm text-navy-300">拍摄目的</span>
            <p className="text-white">{project.purpose}</p>
          </div>
          <div>
            <span className="text-sm text-navy-300">画面需求</span>
            <p className="text-white">{project.visualRequirements}</p>
          </div>
          <div>
            <span className="text-sm text-navy-300">飞行许可状态</span>
            <StatusBadge status={project.permitStatus} />
          </div>
        </div>
      </section>

      <section className="card-glow rounded-xl bg-navy-700/30 p-5">
        <h2 className="mb-4 font-display text-lg font-bold text-white">航线规划</h2>
        {project.routePlans.length > 0 ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-navy-600/50 text-left text-navy-300">
                    <th className="pb-2 pr-4 font-medium">航点名称</th>
                    <th className="pb-2 pr-4 font-medium">纬度</th>
                    <th className="pb-2 pr-4 font-medium">经度</th>
                    <th className="pb-2 pr-4 font-medium">高度</th>
                    <th className="pb-2 font-medium">速度</th>
                  </tr>
                </thead>
                <tbody>
                  {project.routePlans.map((rp) => (
                    <tr key={rp.id} className="border-b border-navy-600/30">
                      <td className="py-2 pr-4 text-white">{rp.waypointName}</td>
                      <td className="py-2 pr-4 text-white">{rp.latitude.toFixed(4)}</td>
                      <td className="py-2 pr-4 text-white">{rp.longitude.toFixed(4)}</td>
                      <td className="py-2 pr-4 text-white">{rp.altitude}m</td>
                      <td className="py-2 text-white">{rp.speed}m/s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex h-48 items-center justify-center rounded-lg bg-navy-800/50">
              <div className="flex flex-col items-center gap-2 text-navy-300">
                <Map className="h-8 w-8" />
                <span className="text-sm">航线预览区域</span>
              </div>
            </div>
          </div>
        ) : (
          <Empty message="暂无航线规划数据" />
        )}
      </section>

      <section className="card-glow rounded-xl bg-navy-700/30 p-5">
        <h2 className="mb-4 font-display text-lg font-bold text-white">素材质量评估</h2>
        {project.footages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-600/50 text-left text-navy-300">
                  <th className="pb-2 pr-4 font-medium">素材名称</th>
                  <th className="pb-2 pr-4 font-medium">状态</th>
                  <th className="pb-2 pr-4 font-medium">质量评分</th>
                  <th className="pb-2 font-medium">备注</th>
                </tr>
              </thead>
              <tbody>
                {project.footages.map((ftg) => (
                  <tr key={ftg.id} className="border-b border-navy-600/30">
                    <td className="py-2 pr-4 text-white">{ftg.name}</td>
                    <td className="py-2 pr-4">
                      <StatusBadge status={ftg.status} />
                    </td>
                    <td className="py-2 pr-4">
                      <QualityBar score={ftg.qualityScore} />
                    </td>
                    <td className="py-2 text-navy-300">{ftg.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-navy-300">暂无素材评估数据</p>
        )}
      </section>
    </div>
  )
}
