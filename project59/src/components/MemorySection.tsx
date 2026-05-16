import React, { useState, useEffect } from 'react'
import { format, parseISO, differenceInYears, isSameDay } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Clock, Shuffle, Gift, Calendar, Plus, Trash2, X } from 'lucide-react'
import { useStore } from '../store/useStore'
import { Anniversary, DiaryEntry } from '../types'
import DiaryViewer from './DiaryViewer'

const MemorySection: React.FC = () => {
  const { diaries, anniversaries, addAnniversary, deleteAnniversary } = useStore()
  const [selectedDiary, setSelectedDiary] = useState<DiaryEntry | null>(null)
  const [randomDiary, setRandomDiary] = useState<DiaryEntry | null>(null)
  const [showAddAnniversary, setShowAddAnniversary] = useState(false)
  const [newAnniversary, setNewAnniversary] = useState({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'other' as 'birthday' | 'anniversary' | 'other',
    notes: '',
  })

  const today = new Date()
  const todayStr = format(today, 'MM-dd')

  const todayYearsAgo = diaries.filter((diary) => {
    const diaryDate = parseISO(diary.date)
    const diaryMonthDay = format(diaryDate, 'MM-dd')
    return diaryMonthDay === todayStr && !isSameDay(diaryDate, today)
  })

  const getRandomDiary = () => {
    if (diaries.length > 0) {
      const randomIndex = Math.floor(Math.random() * diaries.length)
      setRandomDiary(diaries[randomIndex])
    }
  }

  useEffect(() => {
    if (diaries.length > 0 && !randomDiary) {
      getRandomDiary()
    }
  }, [diaries.length])

  const upcomingAnniversaries = anniversaries
    .filter((a) => {
      const annDate = parseISO(a.date)
      const thisYearAnn = new Date(today.getFullYear(), annDate.getMonth(), annDate.getDate())
      const diffDays = Math.ceil((thisYearAnn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return diffDays >= 0 && diffDays <= 30
    })
    .sort((a, b) => {
      const dateA = parseISO(a.date)
      const dateB = parseISO(b.date)
      return (
        new Date(today.getFullYear(), dateA.getMonth(), dateA.getDate()).getTime() -
        new Date(today.getFullYear(), dateB.getMonth(), dateB.getDate()).getTime()
      )
    })

  const handleAddAnniversary = () => {
    if (newAnniversary.title.trim()) {
      addAnniversary({
        ...newAnniversary,
        reminderDays: 3,
      })
      setNewAnniversary({
        title: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'other',
        notes: '',
      })
      setShowAddAnniversary(false)
    }
  }

  const getAnniversaryIcon = (type: string) => {
    switch (type) {
      case 'birthday':
        return '🎂'
      case 'anniversary':
        return '💝'
      default:
        return '📅'
    }
  }

  const getDaysUntil = (dateStr: string) => {
    const date = parseISO(dateStr)
    const thisYearDate = new Date(today.getFullYear(), date.getMonth(), date.getDate())
    const diffDays = Math.ceil((thisYearDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 card-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
              <Clock className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">历史上的今天</h2>
              <p className="text-sm text-gray-500">{format(today, 'MM月dd日', { locale: zhCN })}</p>
            </div>
          </div>

          {todayYearsAgo.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-5xl mb-3">📖</div>
              <p>往年的今天没有日记记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayYearsAgo.map((diary) => {
                const years = differenceInYears(today, parseISO(diary.date))
                return (
                  <div
                    key={diary.id}
                    onClick={() => setSelectedDiary(diary)}
                    className="bg-white rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl font-bold text-pink-500">{years}</div>
                      <div>
                        <p className="text-sm text-gray-500">年前</p>
                        <h3 className="font-medium">{diary.title}</h3>
                      </div>
                      {diary.mood && (
                        <span className="ml-auto text-2xl">{diary.mood.emoji}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Shuffle className="text-white" size={20} />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">随机回忆</h2>
            </div>
            <button
              onClick={getRandomDiary}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Shuffle size={16} />
              换一篇
            </button>
          </div>

          {randomDiary ? (
            <div
              onClick={() => setSelectedDiary(randomDiary)}
              className="bg-white rounded-xl p-5 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {randomDiary.mood && (
                  <span className="text-4xl">{randomDiary.mood.emoji}</span>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{randomDiary.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {format(parseISO(randomDiary.date), 'yyyy年MM月dd日', { locale: zhCN })}
                  </p>
                  <p className="text-gray-600 line-clamp-2">
                    {randomDiary.content.replace(/<[^>]*>/g, '')}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-5xl mb-3">🎲</div>
              <p>还没有日记，无法随机回忆</p>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <Gift className="text-white" size={20} />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">重要纪念日</h2>
            </div>
            <button
              onClick={() => setShowAddAnniversary(true)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              添加
            </button>
          </div>

          {upcomingAnniversaries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-5xl mb-3">🎈</div>
              <p>30天内没有即将到来的纪念日</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAnniversaries.map((anniversary) => {
                const daysUntil = getDaysUntil(anniversary.date)
                const years = differenceInYears(today, parseISO(anniversary.date))
                return (
                  <div
                    key={anniversary.id}
                    className="bg-white rounded-xl p-4 flex items-center gap-4"
                  >
                    <span className="text-3xl">{getAnniversaryIcon(anniversary.type)}</span>
                    <div className="flex-1">
                      <h3 className="font-medium">{anniversary.title}</h3>
                      <p className="text-sm text-gray-500">
                        {format(parseISO(anniversary.date), 'MM月dd日', { locale: zhCN })}
                      </p>
                      {anniversary.notes && (
                        <p className="text-sm text-gray-400">{anniversary.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      {daysUntil === 0 ? (
                        <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                          今天！
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm">
                          {daysUntil}天后
                        </span>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {years > 0 ? `${years}周年` : '第一年'}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteAnniversary(anniversary.id)}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {selectedDiary && (
        <DiaryViewer diary={selectedDiary} onClose={() => setSelectedDiary(null)} />
      )}

      {showAddAnniversary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 card-shadow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">添加纪念日</h3>
              <button
                onClick={() => setShowAddAnniversary(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">标题</label>
                <input
                  type="text"
                  value={newAnniversary.title}
                  onChange={(e) => setNewAnniversary({ ...newAnniversary, title: e.target.value })}
                  placeholder="例如：妈妈生日"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">日期</label>
                <input
                  type="date"
                  value={newAnniversary.date}
                  onChange={(e) => setNewAnniversary({ ...newAnniversary, date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">类型</label>
                <select
                  value={newAnniversary.type}
                  onChange={(e) =>
                    setNewAnniversary({
                      ...newAnniversary,
                      type: e.target.value as 'birthday' | 'anniversary' | 'other',
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300 focus:outline-none"
                >
                  <option value="birthday">🎂 生日</option>
                  <option value="anniversary">💝 纪念日</option>
                  <option value="other">📅 其他</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">备注</label>
                <textarea
                  value={newAnniversary.notes}
                  onChange={(e) => setNewAnniversary({ ...newAnniversary, notes: e.target.value })}
                  placeholder="添加备注..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300 focus:outline-none resize-none"
                  rows={3}
                />
              </div>

              <button
                onClick={handleAddAnniversary}
                className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                添加纪念日
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MemorySection
