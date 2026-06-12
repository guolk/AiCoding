import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { useDroneStore } from '@/store'
import type { Drone, Battery } from '@/types'

const statusOptions: { value: Drone['status']; label: string }[] = [
  { value: 'active', label: '在用' },
  { value: 'maintenance', label: '维护中' },
  { value: 'retired', label: '退役' },
]

const inputClass =
  'w-full rounded-lg border border-navy-600/50 bg-navy-700/50 px-4 py-2.5 text-sm text-white placeholder-navy-400 outline-none transition-colors focus:border-accent-500 focus:ring-1 focus:ring-accent-500'

const labelClass = 'block text-sm font-medium text-navy-200 mb-1.5'

export default function EquipmentNew() {
  const navigate = useNavigate()
  const addDrone = useDroneStore((s) => s.addDrone)

  const [model, setModel] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [batteryCount, setBatteryCount] = useState(2)
  const [totalFlightHours, setTotalFlightHours] = useState('')
  const [status, setStatus] = useState<Drone['status']>('active')
  const [accessoriesText, setAccessoriesText] = useState('')

  const [batteries, setBatteries] = useState<Array<{ serialNumber: string; flightHours: string; healthPercent: string }>>([
    { serialNumber: '', flightHours: '0', healthPercent: '100' },
    { serialNumber: '', flightHours: '0', healthPercent: '100' },
  ])

  const syncBatteryArray = (count: number) => {
    setBatteries((prev) => {
      const next = [...prev]
      while (next.length < count) {
        next.push({ serialNumber: '', flightHours: '0', healthPercent: '100' })
      }
      return next.slice(0, count)
    })
  }

  const updateBattery = (idx: number, field: keyof (typeof batteries)[number], value: string) => {
    setBatteries((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const droneBatteries: Battery[] = batteries.map((b, i) => ({
      id: `bat-${Date.now()}-${i}`,
      droneId: '',
      serialNumber: b.serialNumber || `BAT-${model.slice(0, 3).toUpperCase()}-${String(i + 1).padStart(3, '0')}`,
      flightHours: Number(b.flightHours) || 0,
      healthPercent: Number(b.healthPercent) || 100,
    }))

    const droneId = `drone-${Date.now()}`

    droneBatteries.forEach((b) => (b.droneId = droneId))

    const newDrone: Drone = {
      id: droneId,
      model,
      serialNumber,
      purchaseDate,
      batteryCount,
      accessories: accessoriesText
        .split(/[,，、]/)
        .map((a) => a.trim())
        .filter(Boolean),
      totalFlightHours: Number(totalFlightHours) || 0,
      status,
      batteries: droneBatteries,
    }

    addDrone(newDrone)
    navigate('/equipment')
  }

  return (
    <div className="animate-fade-in">
      <Link
        to="/equipment"
        className="inline-flex items-center gap-2 text-navy-300 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        返回设备列表
      </Link>

      <h1 className="font-display text-2xl font-bold text-white mb-8">添加无人机设备</h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <div className="card-glow bg-navy-700/30 rounded-xl p-5">
          <h2 className="text-sm font-medium text-navy-200 mb-4">基本信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>无人机型号</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="如：DJI Mavic 3"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>序列号</label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="如：MV3-2024-A001"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>购入日期</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>设备状态</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Drone['status'])}
                className={inputClass}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>累计飞行时间（小时）</label>
              <input
                type="number"
                value={totalFlightHours}
                onChange={(e) => setTotalFlightHours(e.target.value)}
                placeholder="0"
                min="0"
                step="0.1"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>电池数量</label>
              <input
                type="number"
                value={batteryCount}
                onChange={(e) => {
                  const n = Math.max(1, Math.min(10, Number(e.target.value) || 1))
                  setBatteryCount(n)
                  syncBatteryArray(n)
                }}
                min="1"
                max="10"
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>配件清单（多个用逗号分隔）</label>
              <input
                type="text"
                value={accessoriesText}
                onChange={(e) => setAccessoriesText(e.target.value)}
                placeholder="如：ND滤镜套装、便携收纳包、螺旋桨保护罩"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="card-glow bg-navy-700/30 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-navy-200">电池信息</h2>
            <button
              type="button"
              onClick={() => {
                const n = batteryCount + 1
                if (n <= 10) {
                  setBatteryCount(n)
                  syncBatteryArray(n)
                }
              }}
              className="flex items-center gap-1 text-accent-500 hover:text-accent-400 text-sm transition-colors"
            >
              <Plus className="h-4 w-4" />
              添加电池
            </button>
          </div>
          <div className="space-y-3">
            {batteries.map((bat, idx) => (
              <div key={idx} className="bg-navy-700/40 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-accent-500">电池 #{idx + 1}</span>
                  {batteryCount > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const n = batteryCount - 1
                        setBatteryCount(n)
                        syncBatteryArray(n)
                      }}
                      className="text-navy-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-navy-400 mb-1">序列号</label>
                    <input
                      type="text"
                      value={bat.serialNumber}
                      onChange={(e) => updateBattery(idx, 'serialNumber', e.target.value)}
                      placeholder="留空自动生成"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-navy-400 mb-1">飞行时间（小时）</label>
                    <input
                      type="number"
                      value={bat.flightHours}
                      onChange={(e) => updateBattery(idx, 'flightHours', e.target.value)}
                      min="0"
                      step="0.1"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-navy-400 mb-1">健康度（%）</label>
                    <input
                      type="number"
                      value={bat.healthPercent}
                      onChange={(e) => updateBattery(idx, 'healthPercent', e.target.value)}
                      min="0"
                      max="100"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/equipment')}
            className="bg-navy-700 hover:bg-navy-600 text-white rounded-lg px-6 py-2.5 text-sm font-medium transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            className="bg-accent-500 hover:bg-accent-600 text-white rounded-lg px-6 py-2.5 text-sm font-medium transition-colors"
          >
            保存设备信息
          </button>
        </div>
      </form>
    </div>
  )
}
