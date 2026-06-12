import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { useDroneStore } from '@/store'
import type { FlightLog, FlightEvent, GPSWaypoint } from '@/types'

const missionTypes = [
  { value: 'aerial', label: '航拍' },
  { value: 'mapping', label: '测绘' },
  { value: 'inspection', label: '巡检' },
  { value: 'performance', label: '表演' },
  { value: 'practice', label: '练习' },
]

const eventTypes = [
  { value: 'signal_interference', label: '信号干扰' },
  { value: 'fault_alert', label: '故障报警' },
  { value: 'accident', label: '意外情况' },
  { value: 'other', label: '其他' },
]

const inputClass = 'w-full bg-navy-700/50 border border-navy-600 text-white rounded-lg px-3 py-2 text-sm placeholder:text-navy-400 focus:outline-none focus:ring-1 focus:ring-accent-500'
const labelClass = 'block text-sm font-medium text-navy-200 mb-1'

export default function FlightNew() {
  const navigate = useNavigate()
  const addFlightLog = useDroneStore((s) => s.addFlightLog)
  const drones = useDroneStore((s) => s.drones)
  const pilots = useDroneStore((s) => s.pilots)

  const [flightDate, setFlightDate] = useState('')
  const [location, setLocation] = useState('')
  const [missionType, setMissionType] = useState<FlightLog['missionType']>('aerial')
  const [duration, setDuration] = useState('')
  const [distance, setDistance] = useState('')
  const [maxAltitude, setMaxAltitude] = useState('')
  const [weatherCondition, setWeatherCondition] = useState('')
  const [droneId, setDroneId] = useState('')
  const [pilotId, setPilotId] = useState('')

  const [events, setEvents] = useState<Array<{ eventType: FlightEvent['eventType']; description: string }>>([])
  const [waypoints, setWaypoints] = useState<Array<{ latitude: string; longitude: string; altitude: string }>>([])

  const addEvent = () => {
    setEvents([...events, { eventType: 'other', description: '' }])
  }

  const removeEvent = (index: number) => {
    setEvents(events.filter((_, i) => i !== index))
  }

  const updateEvent = (index: number, field: 'eventType' | 'description', value: string) => {
    const updated = [...events]
    updated[index] = { ...updated[index], [field]: value }
    setEvents(updated)
  }

  const addWaypoint = () => {
    setWaypoints([...waypoints, { latitude: '', longitude: '', altitude: '' }])
  }

  const removeWaypoint = (index: number) => {
    setWaypoints(waypoints.filter((_, i) => i !== index))
  }

  const updateWaypoint = (index: number, field: 'latitude' | 'longitude' | 'altitude', value: string) => {
    const updated = [...waypoints]
    updated[index] = { ...updated[index], [field]: value }
    setWaypoints(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newId = `flight-${Date.now()}`
    const flightLog = {
      id: newId,
      droneId,
      pilotId,
      flightDate,
      location,
      duration: Number(duration),
      distance: Number(distance),
      maxAltitude: Number(maxAltitude),
      weatherCondition,
      missionType,
      events: events.map((evt, i) => ({
        id: `evt-${Date.now()}-${i}`,
        eventType: evt.eventType,
        description: evt.description,
        timestamp: new Date().toISOString(),
      })),
      waypoints: waypoints.map((wp, i) => ({
        id: `wp-${Date.now()}-${i}`,
        latitude: Number(wp.latitude),
        longitude: Number(wp.longitude),
        altitude: Number(wp.altitude),
      })),
    }

    addFlightLog(flightLog)
    navigate('/flights')
  }

  return (
    <div className="animate-fade-in">
      <Link
        to="/flights"
        className="inline-flex items-center gap-2 text-navy-300 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        返回飞行记录
      </Link>

      <h1 className="font-display text-2xl font-bold text-white mb-6">新建飞行记录</h1>

      <form onSubmit={handleSubmit}>
        <div className="bg-navy-700/30 rounded-xl p-5 card-glow mb-6">
          <h2 className="text-sm font-medium text-navy-200 mb-4">基本信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>飞行日期</label>
              <input type="date" value={flightDate} onChange={(e) => setFlightDate(e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>飞行地点</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="输入飞行地点" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>任务类型</label>
              <select value={missionType} onChange={(e) => setMissionType(e.target.value as FlightLog['missionType'])} className={inputClass}>
                {missionTypes.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>飞行时长（分钟）</label>
              <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="0" min="0" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>飞行距离（公里）</label>
              <input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="0" min="0" step="0.1" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>最大高度（米）</label>
              <input type="number" value={maxAltitude} onChange={(e) => setMaxAltitude(e.target.value)} placeholder="0" min="0" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>天气条件</label>
              <input type="text" value={weatherCondition} onChange={(e) => setWeatherCondition(e.target.value)} placeholder="如：晴，微风" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>选择无人机</label>
              <select value={droneId} onChange={(e) => setDroneId(e.target.value)} className={inputClass} required>
                <option value="">请选择无人机</option>
                {drones.map((d) => (
                  <option key={d.id} value={d.id}>{d.model}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>选择飞手</label>
              <select value={pilotId} onChange={(e) => setPilotId(e.target.value)} className={inputClass} required>
                <option value="">请选择飞手</option>
                {pilots.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-navy-700/30 rounded-xl p-5 card-glow mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-navy-200">飞行事件</h2>
            <button
              type="button"
              onClick={addEvent}
              className="flex items-center gap-1 text-accent-500 hover:text-accent-400 text-sm transition-colors"
            >
              <Plus className="h-4 w-4" />
              添加事件
            </button>
          </div>
          {events.length > 0 ? (
            <div className="space-y-3">
              {events.map((evt, index) => (
                <div key={index} className="flex items-start gap-3 bg-navy-700/40 rounded-lg p-3">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <select
                      value={evt.eventType}
                      onChange={(e) => updateEvent(index, 'eventType', e.target.value)}
                      className={inputClass}
                    >
                      {eventTypes.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <textarea
                      value={evt.description}
                      onChange={(e) => updateEvent(index, 'description', e.target.value)}
                      placeholder="事件描述"
                      rows={2}
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEvent(index)}
                    className="text-navy-400 hover:text-red-400 transition-colors mt-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-navy-400">暂无事件记录</p>
          )}
        </div>

        <div className="bg-navy-700/30 rounded-xl p-5 card-glow mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-navy-200">GPS 航点</h2>
            <button
              type="button"
              onClick={addWaypoint}
              className="flex items-center gap-1 text-accent-500 hover:text-accent-400 text-sm transition-colors"
            >
              <Plus className="h-4 w-4" />
              添加航点
            </button>
          </div>
          {waypoints.length > 0 ? (
            <div className="space-y-3">
              {waypoints.map((wp, index) => (
                <div key={index} className="flex items-center gap-3 bg-navy-700/40 rounded-lg p-3">
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-navy-400 mb-1">纬度</label>
                      <input
                        type="number"
                        value={wp.latitude}
                        onChange={(e) => updateWaypoint(index, 'latitude', e.target.value)}
                        placeholder="0.0000"
                        step="0.0001"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-navy-400 mb-1">经度</label>
                      <input
                        type="number"
                        value={wp.longitude}
                        onChange={(e) => updateWaypoint(index, 'longitude', e.target.value)}
                        placeholder="0.0000"
                        step="0.0001"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-navy-400 mb-1">高度</label>
                      <input
                        type="number"
                        value={wp.altitude}
                        onChange={(e) => updateWaypoint(index, 'altitude', e.target.value)}
                        placeholder="0"
                        min="0"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeWaypoint(index)}
                    className="text-navy-400 hover:text-red-400 transition-colors mt-5"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-navy-400">暂无航点数据</p>
          )}
        </div>

        <button
          type="submit"
          className="bg-accent-500 text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-accent-600 transition-colors"
        >
          保存记录
        </button>
      </form>
    </div>
  )
}
