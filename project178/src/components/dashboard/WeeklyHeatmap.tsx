import { Flame } from 'lucide-react'
import { weeklyHeatmapData } from '@/data/mockData'
import { cn } from '@/lib/utils'

const DAY_LABELS = ['一', '二', '三', '四', '五', '六', '日']

function getHeatColor(hours: number): string {
  if (hours === 0) return 'bg-[var(--color-bg-warm)]'
  if (hours <= 2) return 'bg-[rgba(30,58,95,0.12)]'
  if (hours <= 4) return 'bg-[rgba(30,58,95,0.22)]'
  if (hours <= 6) return 'bg-[rgba(30,58,95,0.35)]'
  if (hours <= 8) return 'bg-[rgba(30,58,95,0.5)]'
  return 'bg-[rgba(30,58,95,0.7)]'
}

export default function WeeklyHeatmap() {
  const allDates = Object.keys(weeklyHeatmapData).sort()
  const totalDays = allDates.length
  const weeks = Math.ceil(totalDays / 7)

  const weekGroups: { label: string; days: { date: string; hours: number }[] }[] = []
  for (let w = 0; w < weeks; w++) {
    const weekDates = allDates.slice(w * 7, (w + 1) * 7)
    const startDate = new Date(weekDates[0])
    const monthDay = `${startDate.getMonth() + 1}/${startDate.getDate()}`
    weekGroups.push({
      label: monthDay,
      days: weekDates.map(d => ({ date: d, hours: weeklyHeatmapData[d] ?? 0 })),
    })
  }

  const totalHours = allDates.reduce((s, d) => s + (weeklyHeatmapData[d] ?? 0), 0)
  const avgHours = totalDays > 0 ? (totalHours / totalDays).toFixed(1) : '0'

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-5">
        <Flame className="w-5 h-5 text-[var(--color-warning)]" />
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">学习热力图</h3>
        <div className="ml-auto flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
          <span>日均 {avgHours} 小时</span>
          <span>总计 {totalHours} 小时</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[400px]">
          <div className="flex gap-1 mb-2 pl-8">
            {DAY_LABELS.map(d => (
              <div key={d} className="w-9 text-center text-xs text-[var(--color-text-muted)]">{d}</div>
            ))}
          </div>
          <div className="space-y-1">
            {weekGroups.map(week => (
              <div key={week.label} className="flex items-center gap-1">
                <div className="w-7 text-xs text-[var(--color-text-muted)] text-right pr-1 shrink-0">{week.label}</div>
                <div className="flex gap-1">
                  {week.days.map(day => (
                    <div
                      key={day.date}
                      className={cn(
                        'w-9 h-9 rounded-md flex items-center justify-center text-xs font-medium transition-colors duration-200',
                        getHeatColor(day.hours),
                        day.hours === 0 ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text-primary)]'
                      )}
                      title={`${day.date}: ${day.hours}小时`}
                    >
                      {day.hours > 0 ? day.hours : ''}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-4 pl-8">
            <span className="text-xs text-[var(--color-text-muted)]">少</span>
            {[0, 2, 4, 6, 8, 10].map(h => (
              <div
                key={h}
                className={cn('w-4 h-4 rounded-sm', getHeatColor(h))}
              />
            ))}
            <span className="text-xs text-[var(--color-text-muted)]">多</span>
          </div>
        </div>
      </div>
    </div>
  )
}
