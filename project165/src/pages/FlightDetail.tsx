import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, MapPin, Clock, Ruler, Mountain, Cloud, User, Cpu, Calendar } from 'lucide-react'
import { useDroneStore } from '@/store'
import StatusBadge from '@/components/StatusBadge'

export default function FlightDetail() {
  const { id } = useParams<{ id: string }>()
  const getFlightLogById = useDroneStore((s) => s.getFlightLogById)
  const getDroneById = useDroneStore((s) => s.getDroneById)
  const pilots = useDroneStore((s) => s.pilots)

  const flight = id ? getFlightLogById(id) : undefined
  const drone = flight ? getDroneById(flight.droneId) : undefined
  const pilot = flight ? pilots.find((p) => p.id === flight.pilotId) : undefined

  if (!flight) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-20">
        <p className="text-navy-300 text-lg mb-4">未找到该飞行记录</p>
        <Link to="/flights" className="text-accent-500 hover:text-accent-400 text-sm">
          返回飞行记录列表
        </Link>
      </div>
    )
  }

  const infoItems = [
    { icon: Calendar, label: '日期', value: flight.flightDate },
    { icon: MapPin, label: '地点', value: flight.location },
    { icon: Clock, label: '时长', value: `${flight.duration}m` },
    { icon: Ruler, label: '距离', value: `${flight.distance}km` },
    { icon: Mountain, label: '最大高度', value: `${flight.maxAltitude}m` },
    { icon: Cloud, label: '天气', value: flight.weatherCondition },
    { icon: User, label: '飞手', value: pilot?.name ?? '未知' },
    { icon: Cpu, label: '无人机型号', value: drone?.model ?? '未知' },
  ]

  return (
    <div className="animate-fade-in">
      <Link
        to="/flights"
        className="inline-flex items-center gap-2 text-navy-300 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        返回飞行记录
      </Link>

      <h1 className="font-display text-2xl font-bold text-white mb-6">
        {flight.flightDate} · {flight.location}
      </h1>

      <div className="bg-navy-700/30 rounded-xl p-5 card-glow mb-6">
        <h2 className="text-sm font-medium text-navy-200 mb-4">基本信息</h2>
        <div className="grid grid-cols-2 gap-4">
          {infoItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <item.icon className="h-4 w-4 text-navy-400 shrink-0" />
              <span className="text-sm text-navy-300">{item.label}：</span>
              <span className="text-sm text-white">{item.value}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-4">
          <span className="text-sm text-navy-300">任务类型：</span>
          <StatusBadge status={flight.missionType} size="sm" />
        </div>
      </div>

      <div className="bg-navy-700/30 rounded-xl p-5 card-glow mb-6">
        <h2 className="text-sm font-medium text-navy-200 mb-4">飞行事件</h2>
        {flight.events.length > 0 ? (
          <div className="space-y-3">
            {flight.events.map((evt) => (
              <div
                key={evt.id}
                className="flex items-start gap-3 bg-navy-700/40 rounded-lg p-3"
              >
                <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={evt.eventType} size="sm" />
                    <span className="text-xs text-navy-400">{evt.timestamp}</span>
                  </div>
                  <p className="text-sm text-navy-100">{evt.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-navy-400">本次飞行无异常事件</p>
        )}
      </div>

      <div className="bg-navy-700/30 rounded-xl p-5 card-glow">
        <h2 className="text-sm font-medium text-navy-200 mb-4">GPS 航点</h2>
        {flight.waypoints.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-navy-700/30">
                  <th className="text-left px-4 py-2 text-xs font-medium text-navy-300">纬度</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-navy-300">经度</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-navy-300">高度</th>
                </tr>
              </thead>
              <tbody>
                {flight.waypoints.map((wp) => (
                  <tr key={wp.id} className="border-b border-navy-600/30">
                    <td className="px-4 py-2 text-sm text-navy-100">{wp.latitude}</td>
                    <td className="px-4 py-2 text-sm text-navy-100">{wp.longitude}</td>
                    <td className="px-4 py-2 text-sm text-navy-100">{wp.altitude}m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-navy-400">暂无航点数据</p>
        )}
      </div>
    </div>
  )
}
