import { useState } from 'react'
import type { LearningTime, KnowledgeArea, KnowledgeDomain } from '@/types'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Pencil, Check, X } from 'lucide-react'

interface TimeAllocationProps {
  learningTimes: LearningTime[]
  areas: KnowledgeArea[]
  domains: KnowledgeDomain[]
  onUpdateLearningTime: (id: string, u: Partial<LearningTime>) => void
}

const COLORS = ['#1e3a5f', '#2d5f8a', '#2d6a4f', '#3d8b6e', '#7b68ee', '#9b8aee', '#d4a857', '#e07a5f']

interface ChartData {
  name: string
  value: number
  color: string
  areaId: string
  ltId: string
}

export default function TimeAllocation({
  learningTimes,
  areas,
  domains,
  onUpdateLearningTime,
}: TimeAllocationProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const grouped = new Map<string, { areaId: string; hours: number; ltId: string }>()
  learningTimes.forEach((lt) => {
    const existing = grouped.get(lt.areaId)
    if (existing) {
      existing.hours += lt.weeklyHours
    } else {
      grouped.set(lt.areaId, { areaId: lt.areaId, hours: lt.weeklyHours, ltId: lt.id })
    }
  })

  const chartData: ChartData[] = []
  let colorIdx = 0
  grouped.forEach(({ areaId, hours, ltId }) => {
    const area = areas.find((a) => a.id === areaId)
    if (!area) return
    const domain = domains.find((d) => d.id === area.domainId)
    chartData.push({
      name: area.name,
      value: hours,
      color: domain?.color ?? COLORS[colorIdx % COLORS.length],
      areaId,
      ltId,
    })
    colorIdx++
  })

  const totalHours = chartData.reduce((s, d) => s + d.value, 0)

  function handleStartEdit(ltId: string, currentHours: number) {
    setEditingId(ltId)
    setEditValue(String(currentHours))
  }

  function handleSaveEdit(ltId: string) {
    const val = parseFloat(editValue)
    if (!isNaN(val) && val >= 0) {
      onUpdateLearningTime(ltId, { weeklyHours: val })
    }
    setEditingId(null)
    setEditValue('')
  }

  function handleCancelEdit() {
    setEditingId(null)
    setEditValue('')
  }

  return (
    <div className="card-static p-5 rounded-xl">
      <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">
        时间分配
      </h3>

      {chartData.length === 0 ? (
        <div className="text-sm text-[var(--color-text-muted)] text-center py-8">
          暂无时间分配数据
        </div>
      ) : (
        <>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-1/2">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    nameKey="name"
                    paddingAngle={2}
                  >
                    {chartData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value} 小时/周`, '时间']}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      fontSize: '13px',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px' }}
                    formatter={(value: string) => (
                      <span style={{ color: 'var(--color-text-secondary)' }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full lg:w-1/2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border-light)]">
                    <th className="text-left py-2 text-[var(--color-text-muted)] font-medium">知识领域</th>
                    <th className="text-right py-2 text-[var(--color-text-muted)] font-medium">每周时长</th>
                    <th className="text-right py-2 text-[var(--color-text-muted)] font-medium">占比</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((d) => {
                    const pct = totalHours > 0 ? Math.round((d.value / totalHours) * 100) : 0
                    const isEditing = editingId === d.ltId

                    return (
                      <tr key={d.areaId} className="border-b border-[var(--color-border-light)]">
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-sm shrink-0"
                              style={{ backgroundColor: d.color }}
                            />
                            <span className="text-[var(--color-text-primary)]">{d.name}</span>
                          </div>
                        </td>
                        <td className="text-right py-2.5">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1">
                              <input
                                type="number"
                                className="input-field w-16 text-right text-xs px-2 py-1"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEdit(d.ltId)
                                  if (e.key === 'Escape') handleCancelEdit()
                                }}
                                autoFocus
                                min={0}
                                step={0.5}
                              />
                              <button
                                onClick={() => handleSaveEdit(d.ltId)}
                                className="p-0.5 text-[var(--color-success)]"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={handleCancelEdit} className="p-0.5 text-[var(--color-text-muted)]">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[var(--color-text-primary)] font-medium">
                              {d.value}h
                            </span>
                          )}
                        </td>
                        <td className="text-right py-2.5 text-[var(--color-text-muted)]">{pct}%</td>
                        <td className="py-2.5">
                          {!isEditing && (
                            <button
                              onClick={() => handleStartEdit(d.ltId, d.value)}
                              className="btn-ghost p-1 rounded"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="pt-2.5 font-medium text-[var(--color-text-primary)]">合计</td>
                    <td className="text-right pt-2.5 font-medium text-[var(--color-primary)]">{totalHours}h</td>
                    <td className="text-right pt-2.5 text-[var(--color-text-muted)]">100%</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
