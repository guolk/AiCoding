import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, AlertTriangle, Plus } from 'lucide-react'
import { useDroneStore } from '@/store'
import StatusBadge from '@/components/StatusBadge'

const missionTypeOptions = [
  { value: '', label: '全部类型' },
  { value: 'aerial', label: '航拍' },
  { value: 'mapping', label: '测绘' },
  { value: 'inspection', label: '巡检' },
  { value: 'performance', label: '表演' },
  { value: 'practice', label: '练习' },
]

export default function FlightList() {
  const flightLogs = useDroneStore((s) => s.flightLogs)

  const [missionType, setMissionType] = useState('')
  const [searchLocation, setSearchLocation] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const filtered = useMemo(() => {
    return flightLogs.filter((fl) => {
      if (missionType && fl.missionType !== missionType) return false
      if (searchLocation && !fl.location.includes(searchLocation)) return false
      if (dateFrom && fl.flightDate < dateFrom) return false
      if (dateTo && fl.flightDate > dateTo) return false
      return true
    })
  }, [flightLogs, missionType, searchLocation, dateFrom, dateTo])

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-white">飞行记录</h1>
        <Link
          to="/flights/new"
          className="flex items-center gap-2 bg-accent-500 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-accent-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          新建记录
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={missionType}
          onChange={(e) => setMissionType(e.target.value)}
          className="bg-navy-700/50 border border-navy-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent-500"
        >
          {missionTypeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-300" />
          <input
            type="text"
            placeholder="搜索地点..."
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="bg-navy-700/50 border border-navy-600 text-white rounded-lg pl-9 pr-3 py-2 text-sm placeholder:text-navy-400 focus:outline-none focus:ring-1 focus:ring-accent-500"
          />
        </div>

        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="bg-navy-700/50 border border-navy-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent-500"
        />
        <span className="text-navy-400 text-sm">至</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="bg-navy-700/50 border border-navy-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-navy-700/30">
              <th className="text-left px-4 py-3 text-sm font-medium text-navy-200">飞行日期</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-navy-200">地点</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-navy-200">任务类型</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-navy-200">时长</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-navy-200">距离</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-navy-200">高度</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-navy-200">天气</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-navy-200">事件</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((fl) => (
              <tr
                key={fl.id}
                className="border-b border-navy-600/30 hover:bg-navy-700/20 transition-colors"
              >
                <td className="px-4 py-3 text-sm text-white">
                  <Link to={`/flights/${fl.id}`} className="hover:text-accent-400 transition-colors">
                    {fl.flightDate}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-white">
                  <Link to={`/flights/${fl.id}`} className="hover:text-accent-400 transition-colors">
                    {fl.location}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm">
                  <Link to={`/flights/${fl.id}`}>
                    <StatusBadge status={fl.missionType} size="sm" />
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-navy-100">{fl.duration}m</td>
                <td className="px-4 py-3 text-sm text-navy-100">{fl.distance}km</td>
                <td className="px-4 py-3 text-sm text-navy-100">{fl.maxAltitude}m</td>
                <td className="px-4 py-3 text-sm text-navy-100">{fl.weatherCondition}</td>
                <td className="px-4 py-3 text-sm">
                  <Link to={`/flights/${fl.id}`} className="flex items-center gap-1">
                    {fl.events.length > 0 ? (
                      <>
                        <AlertTriangle className="h-4 w-4 text-amber-400" />
                        <span className="text-amber-400">{fl.events.length}</span>
                      </>
                    ) : (
                      <span className="text-navy-400">0</span>
                    )}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="flex items-center justify-center py-12 text-navy-400 text-sm">
            暂无匹配的飞行记录
          </div>
        )}
      </div>
    </div>
  )
}
