import React, { useState, useMemo, useEffect, useRef } from 'react'
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { BarChart3, Calendar, Cloud, ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore } from '../store/useStore'
import { extractWords, countWordFrequencies } from '../utils'
import WordCloud from 'wordcloud'

const StatisticsSection: React.FC = () => {
  const { diaries, getAllMoods } = useStore()
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const wordCloudRef = useRef<HTMLDivElement>(null)

  const monthStart = startOfMonth(selectedMonth)
  const monthEnd = endOfMonth(selectedMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const firstDayOfWeek = monthStart.getDay()
  const paddingDays = Array.from({ length: firstDayOfWeek }, (_, i) => i)

  const moodCalendar = useMemo(() => {
    const calendar: Record<string, string> = {}
    diaries.forEach((diary) => {
      if (diary.mood) {
        calendar[diary.date] = diary.mood.color
      }
    })
    return calendar
  }, [diaries])

  const moodStats = useMemo(() => {
    const stats: Record<string, { count: number; name: string; emoji: string; color: string }> = {}
    diaries.forEach((diary) => {
      if (diary.mood) {
        if (!stats[diary.mood.id]) {
          stats[diary.mood.id] = {
            count: 0,
            name: diary.mood.name,
            emoji: diary.mood.emoji,
            color: diary.mood.color,
          }
        }
        stats[diary.mood.id].count++
      }
    })
    return Object.values(stats).sort((a, b) => b.count - a.count)
  }, [diaries])

  const wordFrequencies = useMemo(() => {
    const allWords = diaries.flatMap((diary) => extractWords(diary.content))
    return countWordFrequencies(allWords).slice(0, 50)
  }, [diaries])

  const timelineEvents = useMemo(() => {
    return diaries
      .filter((d) => d.isImportant)
      .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
      .slice(0, 10)
  }, [diaries])

  useEffect(() => {
    if (wordCloudRef.current && wordFrequencies.length > 0) {
      const list = wordFrequencies.map((item) => [item.word, item.count * 5])
      
      WordCloud(wordCloudRef.current, {
        list,
        gridSize: 8,
        weightFactor: 10,
        fontFamily: 'Microsoft YaHei, sans-serif',
        color: function (word, weight) {
          const colors = ['#d946ef', '#8b5cf6', '#3b82f6', '#22c55e', '#eab308', '#f97316']
          return colors[Math.floor(Math.random() * colors.length)]
        },
        rotateRatio: 0.3,
        rotationSteps: 2,
        backgroundColor: 'transparent',
      })
    }
  }, [wordFrequencies])

  const prevMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1))
  }

  const totalDiaries = diaries.length
  const currentMonthDiaries = diaries.filter((d) => isSameMonth(parseISO(d.date), selectedMonth)).length

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl p-6 text-white card-shadow">
            <div className="text-4xl font-bold mb-2">{totalDiaries}</div>
            <div className="text-white/80">总日记数</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white card-shadow">
            <div className="text-4xl font-bold mb-2">{currentMonthDiaries}</div>
            <div className="text-white/80">本月日记</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white card-shadow">
            <div className="text-4xl font-bold mb-2">{moodStats.length}</div>
            <div className="text-white/80">心情种类</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 card-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="text-purple-600" size={20} />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">情绪日历</h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="font-medium text-gray-700">
                {format(selectedMonth, 'yyyy年MM月', { locale: zhCN })}
              </span>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
              <div key={day} className="text-center text-sm text-gray-500 font-medium py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {paddingDays.map((_, index) => (
              <div key={`pad-${index}`} className="aspect-square" />
            ))}
            {daysInMonth.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const moodColor = moodCalendar[dateStr]
              return (
                <div
                  key={dateStr}
                  className="aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all hover:scale-105"
                  style={{
                    backgroundColor: moodColor ? moodColor + '30' : '#f9fafb',
                    borderColor: moodColor || '#e5e7eb',
                    borderWidth: moodColor ? '2px' : '1px',
                    borderStyle: 'solid',
                  }}
                >
                  {format(day, 'd')}
                </div>
              )
            })}
          </div>

          {moodStats.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-medium text-gray-600 mb-3">心情统计</h4>
              <div className="flex flex-wrap gap-4">
                {moodStats.map((mood) => (
                  <div key={mood.name} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: mood.color }}
                    />
                    <span className="text-lg">{mood.emoji}</span>
                    <span className="text-sm text-gray-600">
                      {mood.name}: {mood.count}次
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 card-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Cloud className="text-blue-600" size={20} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">词云分析</h2>
          </div>

          {wordFrequencies.length > 0 ? (
            <div
              ref={wordCloudRef}
              className="w-full h-80 flex items-center justify-center"
            />
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-5xl mb-3">☁️</div>
              <p>日记内容不足，无法生成词云</p>
            </div>
          )}

          {wordFrequencies.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-medium text-gray-600 mb-3">高频词汇 Top 10</h4>
              <div className="flex flex-wrap gap-2">
                {wordFrequencies.slice(0, 10).map((item, index) => (
                  <span
                    key={item.word}
                    className="px-3 py-1 rounded-full text-sm"
                    style={{
                      backgroundColor: ['#fce7f3', '#dbeafe', '#d1fae5', '#fef3c7', '#fed7aa'][index % 5],
                      color: ['#be185d', '#1d4ed8', '#065f46', '#92400e', '#c2410c'][index % 5],
                    }}
                  >
                    {item.word} ({item.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 card-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <BarChart3 className="text-green-600" size={20} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">重要事件时间线</h2>
          </div>

          {timelineEvents.length > 0 ? (
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 to-green-500" />
              <div className="space-y-6">
                {timelineEvents.map((event, index) => (
                  <div key={event.id} className="relative pl-16">
                    <div
                      className="absolute left-4 w-5 h-5 rounded-full border-4 border-white shadow"
                      style={{ backgroundColor: event.mood?.color || '#d946ef' }}
                    />
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {event.mood && <span className="text-xl">{event.mood.emoji}</span>}
                        <h3 className="font-medium">{event.title}</h3>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {format(parseISO(event.date), 'yyyy年MM月dd日', { locale: zhCN })}
                      </p>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {event.content.replace(/<[^>]*>/g, '')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-5xl mb-3">📌</div>
              <p>还没有标记为重要的日记</p>
              <p className="text-sm mt-1">在写日记时点击星标标记为重要</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StatisticsSection
