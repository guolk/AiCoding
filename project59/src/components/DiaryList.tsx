import React, { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Edit2, Trash2, Eye, Lock, Star, Search, Calendar } from 'lucide-react'
import { useStore } from '../store/useStore'
import { DiaryEntry } from '../types'
import { cn } from '../utils'

interface DiaryListProps {
  onSelectDiary: (diary: DiaryEntry) => void
  onEditDiary: (diary: DiaryEntry) => void
}

const DiaryList: React.FC<DiaryListProps> = ({ onSelectDiary, onEditDiary }) => {
  const { diaries, deleteDiary } = useStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMood, setFilterMood] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const sortedDiaries = [...diaries].sort(
    (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()
  )

  const filteredDiaries = sortedDiaries.filter((diary) => {
    const matchesSearch =
      diary.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      diary.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      diary.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesMood = !filterMood || diary.mood?.id === filterMood
    return matchesSearch && matchesMood
  })

  const groupedDiaries = filteredDiaries.reduce((groups, diary) => {
    const month = format(parseISO(diary.date), 'yyyy年MM月', { locale: zhCN })
    if (!groups[month]) {
      groups[month] = []
    }
    groups[month].push(diary)
    return groups
  }, {} as Record<string, DiaryEntry[]>)

  const handleDelete = (id: string) => {
    deleteDiary(id)
    setShowDeleteConfirm(null)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-white">
        <div className="relative mb-3">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索日记..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-300 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Calendar size={16} className="text-gray-400 flex-shrink-0" />
          <button
            onClick={() => setFilterMood(null)}
            className={cn(
              'px-3 py-1 rounded-full text-sm whitespace-nowrap',
              !filterMood ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
            )}
          >
            全部
          </button>
          {[...new Set(diaries.map((d) => d.mood).filter(Boolean))].map((mood) => (
            mood && (
              <button
                key={mood.id}
                onClick={() => setFilterMood(mood.id)}
                className={cn(
                  'px-3 py-1 rounded-full text-sm whitespace-nowrap flex items-center gap-1',
                  filterMood === mood.id ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
                )}
              >
                <span>{mood.emoji}</span>
                <span>{mood.name}</span>
              </button>
            )
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        {Object.keys(groupedDiaries).length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📝</div>
            <p>还没有日记，开始记录吧！</p>
          </div>
        ) : (
          Object.entries(groupedDiaries).map(([month, monthDiaries]) => (
            <div key={month}>
              <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Calendar size={18} className="text-primary-500" />
                {month}
              </h3>
              <div className="space-y-3">
                {monthDiaries.map((diary) => (
                  <div
                    key={diary.id}
                    className="bg-white rounded-xl p-4 card-shadow hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {diary.mood && (
                          <span
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: diary.mood.color + '30' }}
                          >
                            {diary.mood.emoji}
                          </span>
                        )}
                        <div>
                          <h4 className="font-medium flex items-center gap-2">
                            {diary.title}
                            {diary.isImportant && <Star size={14} className="text-yellow-500 fill-yellow-500" />}
                            {diary.isPrivate && <Lock size={14} className="text-red-500" />}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {format(parseISO(diary.date), 'MM月dd日 EEEE', { locale: zhCN })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onSelectDiary(diary)}
                          className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => onEditDiary(diary)}
                          className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(diary.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {diary.weather && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <span>{diary.weather.icon}</span>
                        <span>{diary.weather.condition}</span>
                      </div>
                    )}

                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                      {diary.content.replace(/<[^>]*>/g, '')}
                    </p>

                    {diary.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {diary.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {showDeleteConfirm === diary.id && (
                      <div className="mt-3 p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-600 mb-2">确定要删除这篇日记吗？</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(diary.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                          >
                            确定删除
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="px-3 py-1 bg-gray-200 text-gray-600 rounded text-sm"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default DiaryList
