import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import Card from '../components/Card'

export default function Tasting() {
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotes()
  }, [])

  async function loadNotes() {
    try {
      const data = await api.tasting.getAll()
      setNotes(data)
    } catch (error) {
      console.error('Failed to load tasting notes', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">品饮记录</h2>
          <p className="text-gray-500">共 {notes.length} 条记录</p>
        </div>
        <Link
          to="/tasting/new"
          className="px-4 py-2 bg-wine-600 text-white rounded-lg hover:bg-wine-700 flex items-center gap-2"
        >
          <span>📝</span> 记录品饮
        </Link>
      </div>

      {notes.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {notes.map((note) => (
            <Card key={note.id}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {note.wine?.winery} {note.wine?.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {note.wine?.vintage} · {new Date(note.tastingDate).toLocaleDateString('zh-CN')}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-wine-600">{note.overallScore}</div>
                  <div className="text-xs text-gray-400">/100</div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-700">{note.appearanceScore}</div>
                  <div className="text-xs text-gray-500">外观</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-700">{note.aromaScore}</div>
                  <div className="text-xs text-gray-500">香气</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-700">{note.tasteScore}</div>
                  <div className="text-xs text-gray-500">口感</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-700">{note.finishScore}</div>
                  <div className="text-xs text-gray-500">余韵</div>
                </div>
              </div>

              {(note.decantingTime || note.servingTemp || note.pairedFood) && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {note.decantingTime && (
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                      ⏱️ 醒酒 {note.decantingTime}分钟
                    </span>
                  )}
                  {note.servingTemp && (
                    <span className="px-2 py-1 bg-cyan-50 text-cyan-700 text-xs rounded-full">
                      🌡️ {note.servingTemp}°C
                    </span>
                  )}
                  {note.pairedFood && (
                    <span className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded-full">
                      🍽️ {note.pairedFood}
                    </span>
                  )}
                </div>
              )}

              {note.notes && (
                <p className="text-sm text-gray-600 line-clamp-2">{note.notes}</p>
              )}

              {note.expectationMatch !== null && note.expectationMatch !== undefined && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">预期匹配:</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={star <= note.expectationMatch ? 'text-yellow-400' : 'text-gray-200'}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  {note.expectationNotes && (
                    <p className="text-xs text-gray-500 mt-1">{note.expectationNotes}</p>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">还没有品饮记录</h3>
            <p className="text-gray-500 mb-6">记录您的第一次品酒体验</p>
            <Link
              to="/tasting/new"
              className="px-6 py-3 bg-wine-600 text-white rounded-lg hover:bg-wine-700"
            >
              开始记录
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}
